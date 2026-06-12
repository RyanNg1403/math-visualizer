# Music, mux, and final QA

## 1. Music bed — generate, don't download

Use `scripts/gen_music.py` (numpy → stereo 44.1 kHz WAV). It synthesizes a slow ambient pad cycle (Cmaj7 → Am7 → Fmaj7 → G6) with a sub-bass root, pentatonic sparkle notes, a gentle lowpass, and slow stereo width. Because it is synthesized, it is **fully license-free** — no download permissions, no attribution, no copyright questions. Generate ~30 s longer than the video:

```bash
python3 gen_music.py 180   # duration in seconds (default 200)
```

Sanity-check levels (don't trust your ears — you may not have any):

```bash
ffmpeg -i music.wav -af astats=metadata=1 -f null - 2>&1 | grep -E "RMS level|Peak level"
# healthy: peak ≈ -6 dB, RMS ≈ -18 dB before ducking
```

If the user wants a real track instead, ask before downloading anything and get the license question answered explicitly.

## 2. Mux

Duck the music ~9 dB under the (silent) video, fade in 2.5 s, fade out over the last ~5 s, trim to the video duration:

```bash
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 output/project.mp4)
FADE_START=$(python3 -c "print(max(0, $DUR - 5.5))")
ffmpeg -y -i output/project.mp4 -i music.wav \
  -filter_complex "[1:a]volume=-9dB,afade=t=in:d=2.5,afade=t=out:st=${FADE_START}:d=5.5[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t "$DUR" final.mp4
```

`-c:v copy` keeps the video stream untouched — no quality loss, instant mux.

## 3. Final QA (run all of it, report the evidence)

```bash
# container sanity: h264, 1920x1080, 60/1, aac, expected duration
ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=codec_name,width,height,r_frame_rate \
  -of default=noprint_wrappers=1 final.mp4

# audio actually present at background level (target ≈ -25..-28 dB RMS overall)
ffmpeg -i final.mp4 -af astats=metadata=1 -vn -f null - 2>&1 | grep -m2 "RMS level"

# one late frame to confirm the mux didn't disturb video
ffmpeg -y -loglevel error -ss 100 -i final.mp4 -frames:v 1 late_frame.png
```

`scripts/verify_video.sh` wraps the probe + per-scene frame extraction if you prefer one command.

## 4. Report honestly

State what was verified with evidence (frame screenshots, probe output, RMS numbers) and what was not. The standing example: an agent cannot hear audio — say "levels are measurably correct (-27 dB RMS, fades present); give the first 20 seconds an ear check." Never claim "the video looks great" beyond what the extracted frames actually show.
