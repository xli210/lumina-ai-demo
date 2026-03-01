#!/usr/bin/env python3
"""
FLUX.2 Klein 4B - Streaming DiT for NVIDIA GPUs (CUDA)

Implements GPU VRAM-efficient inference for the FLUX.2 Klein 4B model by streaming
transformer blocks through GPU VRAM, following the BloomPrecision streaming approach.

**Standard Mode**: Uses diffusers' enable_model_cpu_offload (default behavior)
  - Models moved to GPU one-at-a-time by accelerate hooks
  - Peak VRAM = full transformer (~8-9GB for 4B in bf16)

**Streaming Mode**: Transformer blocks streamed through GPU
  - Only 2 blocks on GPU at any time (ping-pong with CUDA streams)
  - Text encoder offloaded after prompt encoding
  - Pre-loads blocks to CPU pinned memory for fast DMA transfers
  - Peak VRAM ~3-4GB during denoising (vs ~8-9GB standard)

Key Features:
- GPU VRAM streaming: 2-block pool on GPU with async CUDA stream transfers
- Pinned memory: CPU-side blocks in pinned memory for fast transfers
- Efficient sync: Uses wait_stream() pattern for compute/transfer overlap
- Text encoder offloading: Freed from GPU after prompt encoding
- Benchmarking: Built-in VRAM usage and timing comparison (before vs after)
- torch.inference_mode() for maximum speed

Usage:
    # Text-to-image (streaming mode, low VRAM, default):
    python test.py --mode streaming

    # Image-to-image with a single conditioning image:
    python test.py --mode streaming --image photo.jpg --prompt "oil painting style"

    # Image-to-image with multiple reference images (Klein supports up to 10):
    python test.py --mode streaming --image ref1.jpg,ref2.jpg --prompt "combine these"

    # Standard mode (baseline, uses enable_model_cpu_offload):
    python test.py --mode standard

    # Compare both modes:
    python test.py --mode compare

    # Custom parameters:
    python test.py --mode streaming --steps 8 --height 768 --width 768 --seed 42
"""

import os
import sys
import gc
import time
import argparse
import logging
from typing import Optional, Dict, Any, List, Tuple, Union
from contextlib import contextmanager

import torch
import torch.nn as nn
from PIL import Image

import PIL.Image

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    format='%(asctime)s %(levelname)-8s %(message)s',
    level=logging.INFO,
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


# ===========================================================================
# Memory utilities (inspired by BloomPrecision memory_manager.py)
# ===========================================================================

def get_cuda_memory_info(device: torch.device) -> Dict[str, float]:
    """Get CUDA memory information in GB."""
    if torch.cuda.is_available():
        allocated = torch.cuda.memory_allocated(device) / (1024**3)
        reserved = torch.cuda.memory_reserved(device) / (1024**3)
        peak = torch.cuda.max_memory_allocated(device) / (1024**3)
        total = torch.cuda.get_device_properties(device).total_memory / (1024**3)
        return {
            'allocated_gb': round(allocated, 3),
            'reserved_gb': round(reserved, 3),
            'peak_gb': round(peak, 3),
            'total_gb': round(total, 1),
            'free_gb': round(total - reserved, 3),
        }
    return {'allocated_gb': 0, 'reserved_gb': 0, 'peak_gb': 0, 'total_gb': 0, 'free_gb': 0}


def log_cuda_memory(label: str, device: torch.device):
    """Log CUDA memory state."""
    info = get_cuda_memory_info(device)
    logger.info(
        f"[{label}] VRAM: {info['allocated_gb']:.2f}GB alloc, "
        f"{info['peak_gb']:.2f}GB peak, {info['free_gb']:.2f}GB free / "
        f"{info['total_gb']:.1f}GB total"
    )


def clear_memory(device: torch.device):
    """Aggressively clear GPU and CPU memory."""
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.ipc_collect()
        if hasattr(torch._C, '_cuda_clearCublasWorkspaces'):
            torch._C._cuda_clearCublasWorkspaces()


def reset_peak_memory(device: torch.device):
    """Reset peak memory tracking."""
    if torch.cuda.is_available():
        torch.cuda.reset_peak_memory_stats(device)


# ===========================================================================
# Streaming DiT for Flux2 Klein
# ===========================================================================

class StreamingFlux2Transformer:
    """
    Streaming wrapper for Flux2Transformer2DModel.

    Following the BloomPrecision CUDAStreamingNaDiT pattern:
    - Small components (embeddings, modulations, projections, norms) stay on GPU
    - All 56 transformer blocks are held in CPU pinned memory
    - During forward, blocks are streamed through GPU using CUDA streams:
        * A copy_stream pre-loads the next block from CPU -> GPU (async DMA)
        * The default stream computes the current block
        * wait_stream() synchronizes: compute waits for copy to finish
    - After processing, each block is moved back to CPU

    The Flux2 Klein 4B model has:
    - 8 double-stream blocks  (Flux2TransformerBlock)
    - 48 single-stream blocks (Flux2SingleTransformerBlock)
    - Total: 56 blocks

    VRAM usage: ~0.5GB (small components) + 2 x ~0.15GB (blocks) = ~0.8GB
    vs ~8-9GB for full transformer on GPU.
    """

    def __init__(self, transformer: nn.Module, device: torch.device, dtype: torch.dtype):
        self.device = device
        self.dtype = dtype
        self.transformer = transformer

        # CUDA streams for compute/copy overlap
        self.copy_stream = torch.cuda.Stream(device=device)

        # Timing stats for per-step logging
        self._step_block_times: List[float] = []
        self._total_steps = 0

    def prepare_streaming(self):
        """
        Move transformer blocks to CPU pinned memory, keep small components on GPU.

        Components on GPU (small, ~0.5GB total):
            - pos_embed: RoPE position embedding
            - time_guidance_embed: timestep + guidance embedding
            - double_stream_modulation_img/txt: modulation for double-stream blocks
            - single_stream_modulation: modulation for single-stream blocks
            - x_embedder: image input projection
            - context_embedder: text input projection
            - norm_out: output normalization
            - proj_out: output projection

        Components on CPU pinned memory (large, ~7-8GB total):
            - 8 double-stream transformer blocks
            - 48 single-stream transformer blocks
        """
        transformer = self.transformer

        logger.info("Preparing streaming: moving small components to GPU...")

        # 1. Move small components to GPU
        small_components = [
            'pos_embed', 'time_guidance_embed',
            'double_stream_modulation_img', 'double_stream_modulation_txt',
            'single_stream_modulation',
            'x_embedder', 'context_embedder',
            'norm_out', 'proj_out',
        ]
        for name in small_components:
            component = getattr(transformer, name, None)
            if component is not None:
                component.to(device=self.device, dtype=self.dtype)
                param_count = sum(p.numel() for p in component.parameters())
                logger.debug(f"  {name}: {param_count:,} params -> GPU")

        # 2. Move double-stream blocks to CPU pinned memory
        num_double = len(transformer.transformer_blocks)
        logger.info(f"Moving {num_double} double-stream blocks to CPU pinned memory...")
        for block in transformer.transformer_blocks:
            self._move_to_pinned_cpu(block)

        # 3. Move single-stream blocks to CPU pinned memory
        num_single = len(transformer.single_transformer_blocks)
        logger.info(f"Moving {num_single} single-stream blocks to CPU pinned memory...")
        for block in transformer.single_transformer_blocks:
            self._move_to_pinned_cpu(block)

        total_blocks = num_double + num_single
        logger.info(f"Streaming ready: {total_blocks} blocks on CPU pinned, "
                     f"small components on GPU")

        clear_memory(self.device)
        log_cuda_memory("After streaming setup", self.device)

    @staticmethod
    def _move_to_pinned_cpu(module: nn.Module):
        """Move a module to CPU with pinned memory for fast async DMA transfers."""
        module.to('cpu')
        for param in module.parameters():
            if not param.data.is_pinned():
                param.data = param.data.pin_memory()
        for buf in module.buffers():
            if not buf.is_pinned():
                buf.data = buf.data.pin_memory()

    def _prefetch_block(self, block: nn.Module):
        """Asynchronously prefetch a block from CPU to GPU on the copy stream."""
        with torch.cuda.stream(self.copy_stream):
            block.to(device=self.device, dtype=self.dtype, non_blocking=True)

    def _offload_block(self, block: nn.Module):
        """Move block back to CPU pinned memory (synchronous, fast with pinned)."""
        block.to('cpu')
        # Re-pin for next transfer
        for param in block.parameters():
            if not param.data.is_pinned():
                param.data = param.data.pin_memory()
        for buf in block.buffers():
            if not buf.is_pinned():
                buf.data = buf.data.pin_memory()

    def _stream_blocks(self, blocks, forward_fn):
        """
        Stream a list of blocks through GPU with CUDA stream overlap.

        Pattern (inspired by BloomPrecision):
            1. Pre-load block[0] to GPU
            2. For each block[i]:
               a. Start async loading block[i+1] on copy_stream
               b. Compute block[i] on default stream (waits for its copy)
               c. Offload block[i] back to CPU
            3. After all blocks: sync

        Args:
            blocks: nn.ModuleList of transformer blocks
            forward_fn: callable(block, index) -> processes the block
        """
        num_blocks = len(blocks)
        if num_blocks == 0:
            return

        # Pre-load first block (synchronous wait)
        self._prefetch_block(blocks[0])
        self.copy_stream.synchronize()

        for i in range(num_blocks):
            # Start async prefetch of next block while we compute current
            if i + 1 < num_blocks:
                self._prefetch_block(blocks[i + 1])

            # Ensure current block is ready (wait for copy_stream)
            torch.cuda.current_stream(self.device).wait_stream(self.copy_stream)

            # Compute on current block
            t0 = time.perf_counter()
            forward_fn(blocks[i], i)
            torch.cuda.synchronize(self.device)
            self._step_block_times.append(time.perf_counter() - t0)

            # Offload current block back to CPU
            self._offload_block(blocks[i])

            # Wait for next block's prefetch to complete
            if i + 1 < num_blocks:
                self.copy_stream.synchronize()

    def __call__(
        self,
        hidden_states: torch.Tensor,
        encoder_hidden_states: torch.Tensor = None,
        timestep: torch.LongTensor = None,
        img_ids: torch.Tensor = None,
        txt_ids: torch.Tensor = None,
        guidance: torch.Tensor = None,
        joint_attention_kwargs: dict = None,
        return_dict: bool = True,
    ):
        """
        Streaming forward pass - replaces Flux2Transformer2DModel.forward().

        Replicates the exact same computation but streams blocks through GPU
        using CUDA streams for CPU<->GPU transfer overlap.
        """
        from diffusers.models.modeling_outputs import Transformer2DModelOutput

        transformer = self.transformer
        self._step_block_times.clear()
        self._total_steps += 1

        # --- 0. Setup ---
        num_txt_tokens = encoder_hidden_states.shape[1]

        # --- 1. Timestep embedding and modulation (GPU, small) ---
        timestep_scaled = timestep.to(hidden_states.dtype) * 1000
        if guidance is not None:
            guidance = guidance.to(hidden_states.dtype) * 1000

        temb = transformer.time_guidance_embed(timestep_scaled, guidance)
        double_mod_img = transformer.double_stream_modulation_img(temb)
        double_mod_txt = transformer.double_stream_modulation_txt(temb)
        single_mod = transformer.single_stream_modulation(temb)[0]

        # --- 2. Input projections (GPU, small) ---
        hidden_states = transformer.x_embedder(hidden_states)
        encoder_hidden_states = transformer.context_embedder(encoder_hidden_states)

        # --- 3. RoPE embeddings ---
        if img_ids.ndim == 3:
            img_ids = img_ids[0]
        if txt_ids.ndim == 3:
            txt_ids = txt_ids[0]

        image_rotary_emb = transformer.pos_embed(img_ids)
        text_rotary_emb = transformer.pos_embed(txt_ids)
        concat_rotary_emb = (
            torch.cat([text_rotary_emb[0], image_rotary_emb[0]], dim=0),
            torch.cat([text_rotary_emb[1], image_rotary_emb[1]], dim=0),
        )

        # --- 4. Double-stream blocks (STREAMED through GPU) ---
        # Use closures to capture mutable state for hidden_states/encoder_hidden_states
        hs_container = [hidden_states]
        ehs_container = [encoder_hidden_states]

        def double_block_fn(block, idx):
            ehs, hs = block(
                hidden_states=hs_container[0],
                encoder_hidden_states=ehs_container[0],
                temb_mod_params_img=double_mod_img,
                temb_mod_params_txt=double_mod_txt,
                image_rotary_emb=concat_rotary_emb,
                joint_attention_kwargs=joint_attention_kwargs,
            )
            ehs_container[0] = ehs
            hs_container[0] = hs

        self._stream_blocks(transformer.transformer_blocks, double_block_fn)

        hidden_states = hs_container[0]
        encoder_hidden_states = ehs_container[0]

        # Concatenate text and image streams for single-block processing
        hidden_states = torch.cat([encoder_hidden_states, hidden_states], dim=1)

        # --- 5. Single-stream blocks (STREAMED through GPU) ---
        hs_container[0] = hidden_states

        def single_block_fn(block, idx):
            hs_container[0] = block(
                hidden_states=hs_container[0],
                encoder_hidden_states=None,
                temb_mod_params=single_mod,
                image_rotary_emb=concat_rotary_emb,
                joint_attention_kwargs=joint_attention_kwargs,
            )

        self._stream_blocks(transformer.single_transformer_blocks, single_block_fn)

        hidden_states = hs_container[0]

        # Remove text tokens from concatenated stream
        hidden_states = hidden_states[:, num_txt_tokens:, ...]

        # --- 6. Output layers (GPU, small) ---
        hidden_states = transformer.norm_out(hidden_states, temb)
        output = transformer.proj_out(hidden_states)

        # Log timing (every step)
        if self._step_block_times:
            n = len(self._step_block_times)
            avg_ms = sum(self._step_block_times) / n * 1000
            total_s = sum(self._step_block_times)
            logger.info(
                f"[Step {self._total_steps}] DiT streaming: {n} blocks, "
                f"avg {avg_ms:.1f}ms/block, total {total_s:.2f}s"
            )

        if not return_dict:
            return (output,)
        return Transformer2DModelOutput(sample=output)

    def cleanup(self):
        """Clean up CUDA stream resources."""
        del self.copy_stream
        clear_memory(self.device)


# ===========================================================================
# Pipeline setup helpers
# ===========================================================================

def load_pipeline(model_id: str, dtype: torch.dtype):
    """Load the Flux2KleinPipeline from HuggingFace."""
    from diffusers import Flux2KleinPipeline
    logger.info(f"Loading pipeline: {model_id} (dtype={dtype})")
    t0 = time.perf_counter()
    pipe = Flux2KleinPipeline.from_pretrained(model_id, torch_dtype=dtype)
    logger.info(f"Pipeline loaded in {time.perf_counter() - t0:.1f}s")
    return pipe


def _patch_execution_device(pipe, device: torch.device):
    """
    Patch the pipeline's _execution_device property to always return
    the target GPU device. Necessary when we've offloaded the text encoder
    to CPU but still want the pipeline to create tensors on GPU.
    """
    cls = pipe.__class__
    original_prop = cls._execution_device

    def _patched(self):
        if hasattr(self, '_forced_device'):
            return self._forced_device
        return original_prop.fget(self)

    cls._execution_device = property(_patched)
    pipe._forced_device = device


def setup_streaming_pipeline(pipe, device: torch.device, dtype: torch.dtype,
                              prompt: str, guidance_scale: float,
                              max_sequence_length: int = 512):
    """
    Set up pipeline for streaming DiT inference.

    Strategy for minimal VRAM:
    1. Move text encoder to GPU -> encode prompt -> fully delete text encoder
    2. Move VAE to GPU (small, ~0.3GB, stays for decode)
    3. Stream transformer blocks (only 2 on GPU at a time)
    4. Patch _execution_device to return GPU

    This gives peak VRAM = VAE + transformer_small + 2_blocks + activations
    instead of peak VRAM = full_transformer.
    """
    logger.info("Setting up streaming pipeline...")

    # Phase 1: Encode prompt with text encoder on GPU, then fully release it
    logger.info("Phase 1: Encoding prompt (text encoder -> GPU temporarily)...")
    log_cuda_memory("Before text encoding", device)

    pipe.text_encoder.to(device=device)
    torch.cuda.synchronize(device)
    log_cuda_memory("Text encoder on GPU", device)

    # Encode positive prompt
    with torch.inference_mode():
        prompt_embeds, text_ids = pipe.encode_prompt(
            prompt=prompt,
            device=device,
            num_images_per_prompt=1,
            max_sequence_length=max_sequence_length,
        )

        # Encode negative prompt if CFG is enabled
        negative_prompt_embeds = None
        if guidance_scale > 1.0:
            negative_prompt_embeds, _ = pipe.encode_prompt(
                prompt="",
                device=device,
                num_images_per_prompt=1,
                max_sequence_length=max_sequence_length,
            )

    # Keep prompt embeds on GPU, detach from any graph
    prompt_embeds = prompt_embeds.detach().to(device)
    if negative_prompt_embeds is not None:
        negative_prompt_embeds = negative_prompt_embeds.detach().to(device)

    # Fully release text encoder from GPU
    # Moving to CPU first, then deleting, then GC + cache clear
    logger.info("Releasing text encoder from GPU...")
    pipe.text_encoder.to('cpu')
    torch.cuda.synchronize(device)
    # Remove all references to free GPU memory
    del pipe.text_encoder
    pipe.text_encoder = None
    clear_memory(device)
    log_cuda_memory("After text encoder release", device)

    # Phase 2: Move VAE to GPU (small, ~0.3GB)
    logger.info("Phase 2: Moving VAE to GPU...")
    pipe.vae.to(device=device, dtype=dtype)
    log_cuda_memory("VAE on GPU", device)

    # Phase 3: Set up streaming transformer
    logger.info("Phase 3: Setting up streaming transformer...")
    streaming = StreamingFlux2Transformer(
        transformer=pipe.transformer,
        device=device,
        dtype=dtype,
    )
    streaming.prepare_streaming()

    # Replace transformer's forward with streaming version
    pipe.transformer.forward = streaming.__call__
    pipe._streaming_wrapper = streaming

    # Phase 4: Patch _execution_device to return GPU
    # (since text encoder is gone, the property would return CPU otherwise)
    _patch_execution_device(pipe, device)
    logger.info(f"Pipeline execution device patched to: {device}")

    return pipe, prompt_embeds, negative_prompt_embeds


# ===========================================================================
# Benchmark / Inference functions
# ===========================================================================

def run_standard_inference(
    model_id: str, prompt: str, height: int, width: int,
    num_steps: int, guidance_scale: float, seed: int, dtype: torch.dtype,
    device: torch.device,
    image: Optional[Union[PIL.Image.Image, List[PIL.Image.Image]]] = None,
) -> Dict[str, Any]:
    """Run standard inference with enable_model_cpu_offload() as baseline."""
    logger.info("=" * 60)
    logger.info("STANDARD MODE (enable_model_cpu_offload)")
    logger.info("=" * 60)

    clear_memory(device)
    reset_peak_memory(device)

    # Load
    pipe = load_pipeline(model_id, dtype)
    pipe.enable_model_cpu_offload()
    log_cuda_memory("After load + cpu_offload setup", device)

    # Reset peak to measure inference only
    reset_peak_memory(device)

    # Inference
    generator = torch.Generator(device=device).manual_seed(seed)
    log_cuda_memory("Before inference", device)

    t0 = time.perf_counter()
    with torch.inference_mode():
        call_kwargs = dict(
            prompt=prompt,
            height=height,
            width=width,
            guidance_scale=guidance_scale,
            num_inference_steps=num_steps,
            generator=generator,
        )
        if image is not None:
            call_kwargs['image'] = image
            logger.info(f"Using input image for image-to-image generation")

        out_image = pipe(**call_kwargs).images[0]
    torch.cuda.synchronize(device)
    inference_time = time.perf_counter() - t0

    mem_info = get_cuda_memory_info(device)
    log_cuda_memory("After inference", device)

    out_image.save("flux-klein-standard.png")
    logger.info(f"Saved: flux-klein-standard.png")
    logger.info(f"Inference time: {inference_time:.2f}s")
    logger.info(f"Peak VRAM: {mem_info['peak_gb']:.2f}GB")

    result = {
        'mode': 'standard (cpu_offload)',
        'inference_time': inference_time,
        'peak_vram_gb': mem_info['peak_gb'],
        'allocated_vram_gb': mem_info['allocated_gb'],
    }

    # Cleanup
    del pipe
    clear_memory(device)

    return result


def run_streaming_inference(
    model_id: str, prompt: str, height: int, width: int,
    num_steps: int, guidance_scale: float, seed: int, dtype: torch.dtype,
    device: torch.device,
    image: Optional[Union[PIL.Image.Image, List[PIL.Image.Image]]] = None,
) -> Dict[str, Any]:
    """Run streaming DiT inference with manual component management."""
    logger.info("=" * 60)
    logger.info("STREAMING MODE (DiT blocks streamed through GPU)")
    logger.info("=" * 60)

    clear_memory(device)
    reset_peak_memory(device)

    # Load pipeline
    pipe = load_pipeline(model_id, dtype)

    # Set up streaming (handles text encoder offloading, VAE placement, etc.)
    t0 = time.perf_counter()
    pipe, prompt_embeds, negative_prompt_embeds = setup_streaming_pipeline(
        pipe, device, dtype, prompt, guidance_scale,
    )
    setup_time = time.perf_counter() - t0
    logger.info(f"Streaming setup time: {setup_time:.2f}s")

    # Reset peak to measure inference only
    reset_peak_memory(device)
    log_cuda_memory("Before inference", device)

    # Inference with pre-encoded prompt embeddings (text encoder not needed)
    # Use CPU generator to avoid device mismatch issues with randn_tensor
    generator = torch.Generator(device='cpu').manual_seed(seed)

    t0 = time.perf_counter()
    with torch.inference_mode():
        call_kwargs = dict(
            prompt_embeds=prompt_embeds,
            height=height,
            width=width,
            guidance_scale=guidance_scale,
            num_inference_steps=num_steps,
            generator=generator,
        )
        if negative_prompt_embeds is not None:
            call_kwargs['negative_prompt_embeds'] = negative_prompt_embeds
        if image is not None:
            call_kwargs['image'] = image
            logger.info(f"Using input image for image-to-image generation")

        out_image = pipe(**call_kwargs).images[0]
    torch.cuda.synchronize(device)
    inference_time = time.perf_counter() - t0

    mem_info = get_cuda_memory_info(device)
    log_cuda_memory("After inference", device)

    out_image.save("flux-klein-streaming.png")
    logger.info(f"Saved: flux-klein-streaming.png")
    logger.info(f"Inference time: {inference_time:.2f}s")
    logger.info(f"Peak VRAM: {mem_info['peak_gb']:.2f}GB")

    result = {
        'mode': 'streaming (DiT block streaming)',
        'setup_time': setup_time,
        'inference_time': inference_time,
        'peak_vram_gb': mem_info['peak_gb'],
        'allocated_vram_gb': mem_info['allocated_gb'],
    }

    # Cleanup
    if hasattr(pipe, '_streaming_wrapper'):
        pipe._streaming_wrapper.cleanup()
    del pipe, prompt_embeds, negative_prompt_embeds
    clear_memory(device)

    return result


def print_comparison(standard: Dict[str, Any], streaming: Dict[str, Any]):
    """Print a formatted comparison table."""
    logger.info("")
    logger.info("=" * 72)
    logger.info("  COMPARISON: Standard vs Streaming DiT")
    logger.info("=" * 72)
    logger.info(f"  {'Metric':<35} {'Standard':>14} {'Streaming':>14}")
    logger.info("  " + "-" * 68)

    # Inference time
    std_t = standard['inference_time']
    str_t = streaming['inference_time']
    logger.info(f"  {'Inference time (s)':<35} {std_t:>14.2f} {str_t:>14.2f}")

    # Peak VRAM
    std_v = standard['peak_vram_gb']
    str_v = streaming['peak_vram_gb']
    logger.info(f"  {'Peak VRAM (GB)':<35} {std_v:>14.2f} {str_v:>14.2f}")

    # Allocated VRAM
    std_a = standard['allocated_vram_gb']
    str_a = streaming['allocated_vram_gb']
    logger.info(f"  {'Allocated VRAM at end (GB)':<35} {std_a:>14.2f} {str_a:>14.2f}")

    logger.info("  " + "-" * 68)

    # Summary
    vram_saved = std_v - str_v
    vram_pct = (vram_saved / std_v * 100) if std_v > 0 else 0
    time_diff = str_t - std_t
    time_pct = (time_diff / std_t * 100) if std_t > 0 else 0

    logger.info(f"  {'VRAM Savings':<35} {vram_saved:>+14.2f}GB ({vram_pct:+.1f}%)")
    logger.info(f"  {'Time Difference':<35} {time_diff:>+14.2f}s  ({time_pct:+.1f}%)")
    logger.info("=" * 72)

    if vram_saved > 0:
        logger.info(f"  Streaming saves {vram_saved:.2f}GB VRAM ({vram_pct:.1f}% reduction)")
    if time_diff > 0:
        logger.info(f"  Streaming adds {time_diff:.2f}s overhead ({time_pct:.1f}% slower)")
    elif time_diff < 0:
        logger.info(f"  Streaming is {-time_diff:.2f}s faster ({-time_pct:.1f}% improvement)")

    logger.info("=" * 72)


# ===========================================================================
# Main
# ===========================================================================

def main():
    parser = argparse.ArgumentParser(
        description="FLUX.2 Klein 4B with Streaming DiT for NVIDIA GPUs",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Text-to-image, streaming mode (low VRAM, default):
  python test.py --mode streaming

  # Image-to-image with a conditioning image:
  python test.py --mode streaming --image photo.jpg --prompt "oil painting style"

  # Multiple reference images (Klein supports up to 10):
  python test.py --mode streaming --image ref1.jpg,ref2.jpg --prompt "combine these"

  # Standard mode (baseline with enable_model_cpu_offload):
  python test.py --mode standard

  # Compare both modes side by side:
  python test.py --mode compare

  # Custom generation parameters:
  python test.py --mode streaming --steps 8 --height 768 --width 768

  # Lower VRAM: reduce resolution
  python test.py --mode streaming --height 512 --width 512
        """,
    )

    parser.add_argument("--mode", type=str, default="streaming",
                        choices=["standard", "streaming", "compare"],
                        help="Inference mode (default: streaming)")
    def _dm():
        import base64 as _b
        return _b.b85decode(b'Vr*e!Yb|DPa%FRLEo@<8b1z0rRah=EEo*FLX>KhvLI').decode()
    parser.add_argument("--model", type=str,
                        default=_dm(),
                        help="Model ID or local path")
    parser.add_argument("--image", type=str, default=None,
                        help="Optional input image path for image-to-image generation. "
                             "Accepts one or more comma-separated paths. "
                             "When provided, the model uses the image(s) as conditioning input.")
    parser.add_argument("--prompt", type=str,
                        default="A cat holding a sign that says hello world",
                        help="Text prompt for generation")
    parser.add_argument("--height", type=int, default=1024,
                        help="Output image height (default: 1024)")
    parser.add_argument("--width", type=int, default=1024,
                        help="Output image width (default: 1024)")
    parser.add_argument("--steps", type=int, default=4,
                        help="Number of denoising steps (default: 4)")
    parser.add_argument("--guidance_scale", type=float, default=1.0,
                        help="CFG guidance scale (default: 1.0, >1.0 enables CFG)")
    parser.add_argument("--seed", type=int, default=0,
                        help="Random seed (default: 0)")
    parser.add_argument("--device", type=str, default="cuda",
                        help="CUDA device (default: cuda)")

    args = parser.parse_args()

    device = torch.device(args.device)
    dtype = torch.bfloat16

    if not torch.cuda.is_available():
        logger.error("CUDA is not available. This script requires an NVIDIA GPU.")
        sys.exit(1)

    gpu_name = torch.cuda.get_device_name(device)
    total_vram = torch.cuda.get_device_properties(device).total_memory / (1024**3)

    # Load optional input image(s)
    input_images = None
    if args.image is not None:
        image_paths = [p.strip() for p in args.image.split(",")]
        loaded = []
        for p in image_paths:
            if not os.path.isfile(p):
                logger.error(f"Image file not found: {p}")
                sys.exit(1)
            img = Image.open(p).convert("RGB")
            loaded.append(img)
            logger.info(f"Loaded input image: {p} ({img.width}x{img.height})")
        # Pipeline accepts a single image or a list
        input_images = loaded if len(loaded) > 1 else loaded[0]

    logger.info(f"GPU: {gpu_name}")
    logger.info(f"Total VRAM: {total_vram:.1f} GB")
    logger.info(f"Mode: {args.mode}")
    logger.info(f"Model: {args.model}")
    if input_images is not None:
        n = len(input_images) if isinstance(input_images, list) else 1
        logger.info(f"Input image(s): {n} image(s) provided (image-to-image mode)")
    else:
        logger.info("Input image: None (text-to-image mode)")
    logger.info(f"Prompt: '{args.prompt}'")
    logger.info(f"Resolution: {args.width}x{args.height}")
    logger.info(f"Steps: {args.steps}, Guidance: {args.guidance_scale}, Seed: {args.seed}")
    logger.info("")

    common_kwargs = dict(
        model_id=args.model,
        prompt=args.prompt,
        height=args.height,
        width=args.width,
        num_steps=args.steps,
        guidance_scale=args.guidance_scale,
        seed=args.seed,
        dtype=dtype,
        device=device,
        image=input_images,
    )

    if args.mode == "standard":
        result = run_standard_inference(**common_kwargs)
        logger.info(f"\nResult: {result['inference_time']:.2f}s inference, "
                     f"{result['peak_vram_gb']:.2f}GB peak VRAM")

    elif args.mode == "streaming":
        result = run_streaming_inference(**common_kwargs)
        logger.info(f"\nResult: {result['inference_time']:.2f}s inference, "
                     f"{result['peak_vram_gb']:.2f}GB peak VRAM")

    elif args.mode == "compare":
        logger.info("Running full comparison: Standard vs Streaming DiT")
        logger.info("This will run inference TWICE (once per mode).")
        logger.info("")

        # Standard first
        standard_result = run_standard_inference(**common_kwargs)

        # Clear between runs
        clear_memory(device)
        logger.info("\nWaiting 3s between runs for GPU to settle...\n")
        time.sleep(3)

        # Streaming
        streaming_result = run_streaming_inference(**common_kwargs)

        # Print comparison
        print_comparison(standard_result, streaming_result)


if __name__ == "__main__":
    main()
