#!/usr/bin/env bash
# Verify a rendered explainer video: container probe, audio levels, one frame per scene.
# Usage: verify_video.sh <video.mp4> <t1> <t2> ... (timestamps in seconds, one per scene)
set -euo pipefail
VIDEO="$1"; shift
OUT="$(dirname "$VIDEO")/verify_frames"
mkdir -p "$OUT"

echo "== container =="
ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=codec_name,width,height,r_frame_rate \
  -of default=noprint_wrappers=1 "$VIDEO"

echo "== audio RMS (target ~ -25..-28 dB for background music) =="
ffmpeg -i "$VIDEO" -af astats=metadata=1 -vn -f null - 2>&1 | grep -m2 "RMS level" || echo "no audio stream"

echo "== frames =="
for t in "$@"; do
  ffmpeg -y -loglevel error -ss "$t" -i "$VIDEO" -frames:v 1 "$OUT/t${t}.png"
  echo "$OUT/t${t}.png"
done
echo "Now actually LOOK at every extracted frame."
