"""Generate a license-free ambient music bed for the derivative video.

Slow synth pads cycling Cmaj7 -> Am7 -> Fmaj7 -> G6, soft sub bass,
gentle sparkle layer. Pure numpy synthesis -> stereo 44.1 kHz WAV.
"""
import numpy as np
import wave

SR = 44100
DUR = 200.0          # generous; trimmed at mux time
CHORD_LEN = 8.0
FADE = 3.0           # crossfade between chords

# chord voicings (Hz) — C3-rooted just-ish voicings
def freqs(*notes):
    A4 = 440.0
    semis = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}
    out = []
    for n in notes:
        name, octave = n[:-1], int(n[-1])
        out.append(A4 * 2 ** (semis[name] / 12 + (octave - 4)))
    return out

CHORDS = [
    freqs('C3', 'E3', 'G3', 'B3'),
    freqs('A2', 'C3', 'E3', 'G3'),
    freqs('F2', 'A2', 'C3', 'E3'),
    freqs('G2', 'B2', 'D3', 'G3'),
]

t = np.arange(int(DUR * SR)) / SR
mix = np.zeros_like(t)

# pads: each chord fades in/out around its window, cycling
n_windows = int(np.ceil(DUR / CHORD_LEN)) + 1
for w in range(n_windows):
    chord = CHORDS[w % len(CHORDS)]
    start = w * CHORD_LEN - FADE / 2
    end = start + CHORD_LEN + FADE
    env = np.clip((t - start) / FADE, 0, 1) * np.clip((end - t) / FADE, 0, 1)
    env = env ** 1.5
    for i, f in enumerate(chord):
        amp = 0.16 / (i + 1) ** 0.4
        vib = 1 + 0.0015 * np.sin(2 * np.pi * 0.13 * t + i)
        tone = (
            np.sin(2 * np.pi * f * vib * t)
            + 0.35 * np.sin(2 * np.pi * 2 * f * t + 0.7)
            + 0.12 * np.sin(2 * np.pi * 3 * f * t + 1.9)
        )
        mix += amp * env * tone
    # sub bass: root an octave down
    mix += 0.20 * env * np.sin(2 * np.pi * chord[0] / 2 * t)

# sparkle: slow random high notes from the C pentatonic
rng = np.random.default_rng(7)
PENTA = freqs('C5', 'D5', 'E5', 'G5', 'A5')
for k in range(int(DUR / 2.5)):
    at = k * 2.5 + rng.uniform(0, 1.2)
    f = PENTA[rng.integers(len(PENTA))]
    dur = 3.0
    seg = (t >= at) & (t < at + dur)
    tt = t[seg] - at
    env = np.exp(-tt * 1.4) * np.minimum(tt / 0.12, 1)
    mix[seg] += 0.045 * env * np.sin(2 * np.pi * f * tt)

# gentle one-pole lowpass to soften everything
out = np.zeros_like(mix)
alpha = 0.12
acc = 0.0
for i in range(len(mix)):
    acc += alpha * (mix[i] - acc)
    out[i] = acc

# slow stereo width via opposite-phase tremolo
lfo = 0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t)
left = out * (0.92 + 0.08 * lfo)
right = out * (0.92 + 0.08 * (1 - lfo))

# normalize to a background level
peak = max(np.abs(left).max(), np.abs(right).max())
left = left / peak * 0.5
right = right / peak * 0.5

stereo = np.empty(2 * len(out), dtype=np.int16)
stereo[0::2] = (left * 32767).astype(np.int16)
stereo[1::2] = (right * 32767).astype(np.int16)

with wave.open('music.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print('music.wav written:', DUR, 's')
