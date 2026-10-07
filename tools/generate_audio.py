"""Render an original quiet instrumental loop; no third-party recordings.

Run: python3 tools/generate_audio.py, then use ffmpeg to encode the WAV as MP3.
All synthesis uses the Python standard library. This is music, not a Qur'an
recitation or a recording of salawat.
"""
import array
import math
from pathlib import Path
import wave

RATE = 22050
DURATION = 48
TARGET = Path(__file__).resolve().parent.parent / "static/invitation/audio/sokin-ohang.wav"


def render():
    length = RATE * DURATION
    samples = array.array("f", [0.0]) * length
    # A restrained pentatonic melody with long overlapping, bell-soft envelopes.
    notes = [62, 69, 74, 77, 74, 69, 65, 69, 72, 77, 74, 69, 62, 65, 69, 74]
    for index, note in enumerate(notes):
        frequency = 440 * 2 ** ((note - 69) / 12)
        start = index * 3 * RATE
        for i in range(8 * RATE):
            t = i / RATE
            envelope = (1 - math.exp(-t * 3)) * math.exp(-t * .7)
            tone = math.sin(math.tau * frequency * t) + .14 * math.sin(math.tau * frequency * 2 * t)
            samples[(start + i) % length] += tone * envelope * .17
    pcm = array.array("h")
    for i, sample in enumerate(samples):
        # A soft low pad. Frequencies complete whole cycles over the loop.
        t = i / RATE
        pad = .026 * math.sin(math.tau * 146.8333333333 * t) + .016 * math.sin(math.tau * 220 * t)
        # Gentle first/last fade prevents clicks in native audio loop playback.
        fade = min(1, t / 1.5, (DURATION - t) / 1.5)
        pcm.append(int(max(-1, min(1, (sample + pad) * fade)) * 32767))
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(TARGET), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(pcm.tobytes())
    print(f"Rendered {DURATION}s original music: {TARGET}")


if __name__ == "__main__":
    render()
