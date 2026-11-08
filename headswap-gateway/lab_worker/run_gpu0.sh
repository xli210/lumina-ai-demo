#!/bin/bash
# HeadSwap Pro worker on the lab box's GPU 0 (another researcher's card, used only while idle; see hs_lab_worker.py). GPU 1 and the video worker are not touched.
#   bash run_gpu0.sh [image tag]      start (or replace) the container hs-gpu0
#   docker stop hs-gpu0               off (the gateway sees no heartbeat and sends everything to RunPod)
set -e
D=/mnt/data/xli/hs0
TAG=${1:-20261105-1-baked}
GPU0=GPU-2cafbe7b-50bf-c89d-3652-916a6e583183       # by uuid: never the video worker's card, whatever the numbering
docker rm -f hs-gpu0 >/dev/null 2>&1 || true
docker run -d --restart unless-stopped --name hs-gpu0 --gpus "\"device=$GPU0\"" --pid=host \
  --memory=${HS_LAB_MEMORY:-34g} --memory-swap=${HS_LAB_MEMORY:-34g} --cpus=8 --shm-size=4g \
  --log-opt max-size=20m --log-opt max-file=3 \
  --env-file "$D/hs0.env" --env-file /mnt/data/xli/worker/secrets.env ${HS_LAB_EXTRA_ENV:+--env-file "$HS_LAB_EXTRA_ENV"} \
  -v "$D/lab":/lab:ro \
  --entrypoint python3.10 ghcr.io/yunanwu2168/headswap-studio:$TAG -u /lab/hs_lab_worker.py
docker ps --filter name=hs-gpu0 --format '{{.Names}} {{.Status}}'
