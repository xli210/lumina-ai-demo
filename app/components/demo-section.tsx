import {
  Crown,
  ShieldCheck,
  CreditCard,
  Wrench,
  Cpu,
  Zap,
  HardDrive,
  RefreshCw,
} from "lucide-react";

const values = [
  {
    icon: Crown,
    title: "Best-in-Class Local AI",
    text: "Same cutting-edge models as cloud services — running on your GPU with zero compromise.",
  },
  {
    icon: ShieldCheck,
    title: "Complete Privacy",
    text: "No cloud uploads, no API keys, no tracking. Your data never leaves your machine.",
  },
  {
    icon: CreditCard,
    title: "One-Time Purchase",
    text: "Pay once, own forever. No subscriptions, no credits, no usage caps. Lifetime updates included.",
  },
  {
    icon: Wrench,
    title: "Modular Toolkit",
    text: "Pick the tools you need — image gen, video, face swap, enhancement, try-on. Mix and match.",
  },
  {
    icon: Cpu,
    title: "GPU Accelerated",
    text: "NVIDIA CUDA-powered inference with automatic VRAM management. Fast on any supported card.",
  },
  {
    icon: Zap,
    title: "One-Click Launch",
    text: "No terminal, no Python setup. Double-click and go. Models download automatically on first run.",
  },
  {
    icon: HardDrive,
    title: "Fully Offline",
    text: "After setup, everything runs without internet. Perfect for air-gapped and on-the-go workflows.",
  },
  {
    icon: RefreshCw,
    title: "Free Updates Forever",
    text: "Every license includes lifetime updates. New models, features, and fixes — at no extra cost.",
  },
];

export function DemoSection() {
  return (
    <section id="demo" className="relative px-6 py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Why NanoPocket
          </p>
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Professional AI. <span className="text-primary">No Compromises.</span>
          </h2>
          <p className="mx-auto max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
            Everything cloud AI offers — without the cloud. Full power, full
            privacy, full ownership.
          </p>
        </div>

        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {values.map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
