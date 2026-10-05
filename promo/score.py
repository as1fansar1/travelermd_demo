"""Original score and sound design for the promo, synthesized from scratch (no samples, no licensing).

Writes score.wav (48 kHz stereo, 42 s), timed to the cuts in stage.js:
  0.0-4.2   tension: low pulse, ticking hats, a blip per piece of clutter, a thump per word, riser
  4.2       impact + chord bloom under the title
  6.4-37.7  96 BPM groove, D - Bm - G - A, layers added per scene
  38.0      drums out, resolving chord and bell motif under the end card
"""
import os
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR, DUR = 48000, 42.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
HERE = os.path.dirname(os.path.abspath(__file__))

music = np.zeros((2, N)); verb_send = np.zeros((2, N)); sfx = np.zeros((2, N)); duck = np.ones(N)

def hz(note):  # 'D3', 'F#4' -> Hz
    names = {'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
    n, o = note[:-1], int(note[-1])
    return 440 * 2 ** ((names[n] + 12 * (o + 1) - 69) / 12)

def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, btype=kind, fs=SR, output='sos'), x)

def env(n, a, d, sus=0.0, rel=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * (sus + (1 - sus) * np.exp(-t / max(d, 1e-4)))
    if rel:
        r = int(rel * SR); e[-r:] *= np.linspace(1, 0, r)
    return e

def put(buf, t, x, gain=1.0, pan=0.0, send=0.0):
    i = int(t * SR); j = min(N, i + x.shape[-1])
    if i >= N or j <= i: return
    x = x[..., :j - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    st = np.vstack([x * l, x * r]) if x.ndim == 1 else x
    buf[:, i:j] += st
    if send: verb_send[:, i:j] += st * send

# ---------- Instruments ----------
def saw(f, n, detune=0.0):
    t = np.arange(n) / SR
    ph = rng.random()
    return 2 * ((t * f * (1 + detune) + ph) % 1) - 1

def pad(notes, t, length, gain=0.12, cutoff=1800, a=0.6):
    n = int(length * SR); x = np.zeros(n)
    for nt in notes:
        f = hz(nt)
        for d in (-0.006, -0.002, 0.0, 0.003, 0.007):
            x += saw(f, n, d)
    x = filt(x / (len(notes) * 5), 'low', cutoff) * env(n, a, 99, 1.0, rel=min(0.8, length * 0.4))
    put(music, t, x, gain, pan=0, send=0.35)

def pluck(note, t, gain=0.09, pan=0.0, decay=0.28):
    f = hz(note); n = int(1.2 * SR); tt = np.arange(n) / SR
    x = (np.sin(2*np.pi*f*tt) + 0.5*np.sin(4*np.pi*f*tt)*np.exp(-tt/0.08) + 0.25*np.sin(6*np.pi*f*tt)*np.exp(-tt/0.04))
    x = filt(x * env(n, 0.003, decay), 'low', 5000)
    put(music, t, x, gain, pan, send=0.3)

def bell(note, t, gain=0.09, pan=0.0, decay=1.4):
    f = hz(note); n = int(3.0 * SR); tt = np.arange(n) / SR
    idx = 2.2 * np.exp(-tt / 0.5)
    x = np.sin(2*np.pi*f*tt + idx*np.sin(2*np.pi*f*3.5*tt)) * env(n, 0.002, decay)
    put(music, t, x, gain, pan, send=0.55)

def bass(note, t, length, gain=0.22):
    f = hz(note); n = int(length * SR); tt = np.arange(n) / SR
    x = np.sin(2*np.pi*f*tt) + 0.3*filt(saw(f, n), 'low', 400)
    x *= env(n, 0.006, 0.5, 0.55, rel=0.05)
    put(music, t, x, gain)

def kick(t, gain=0.55):
    n = int(0.45 * SR); tt = np.arange(n) / SR
    f = 46 + 90 * np.exp(-tt / 0.035)
    x = np.sin(2*np.pi*np.cumsum(f)/SR) * env(n, 0.001, 0.16) + 0.25*filt(rng.standard_normal(n), 'high', 2500)*env(n, 0.0005, 0.004)
    put(music, t, x, gain)
    i = int(t * SR); d = int(0.32 * SR)
    if i < N:
        dd = 1 - 0.55 * np.exp(-np.arange(min(d, N - i)) / SR / 0.09)
        duck[i:i + len(dd)] = np.minimum(duck[i:i + len(dd)], dd)

def hat(t, gain=0.05, pan=0.25, decay=0.03):
    n = int(0.12 * SR)
    put(music, t, filt(rng.standard_normal(n), 'high', 7500) * env(n, 0.0005, decay), gain, pan)

def clap(t, gain=0.12):
    n = int(0.3 * SR); x = np.zeros(n)
    for k, o in enumerate((0, 0.011, 0.022)):
        i = int(o * SR); m = n - i
        x[i:] += filt(rng.standard_normal(m), 'band', [900, 3500]) * env(m, 0.0005, 0.012 if k < 2 else 0.09)
    put(music, t, x, gain, pan=-0.1, send=0.3)

def noise_sweep(t0, t1, f0, f1, gain=0.12, rise=True, pan=0.0):
    n = int((t1 - t0) * SR); x = rng.standard_normal(n); out = np.zeros(n); blk = 1024
    for s in range(0, n, blk):
        p = s / n; f = f0 * (f1 / f0) ** p
        out[s:s+blk] = filt(x[s:s+blk], 'band', [f * 0.7, min(f * 1.4, SR/2 - 100)], 1)
    shape = np.linspace(0, 1, n) ** 2 if rise else np.sin(np.linspace(0, np.pi, n)) ** 1.5
    put(sfx, t0, out * shape, gain, pan, send=0.25)

def impact(t, gain=0.5):
    n = int(2.2 * SR); tt = np.arange(n) / SR
    x = np.sin(2*np.pi*np.cumsum(38 + 40*np.exp(-tt/0.08))/SR) * env(n, 0.002, 0.7)
    x += 0.4 * filt(rng.standard_normal(n), 'low', 1200) * env(n, 0.001, 0.12)
    put(music, t, x, gain, send=0.5)

def blip(t, f, gain=0.05, pan=0.0):
    n = int(0.18 * SR); tt = np.arange(n) / SR
    x = np.sin(2*np.pi*f*tt) * env(n, 0.002, 0.045) + 0.4*np.sin(2*np.pi*f*1.5*tt) * env(n, 0.002, 0.03)
    put(sfx, t, x, gain, pan, send=0.2)

def tap(t, gain=0.09):
    n = int(0.06 * SR); tt = np.arange(n) / SR
    x = filt(rng.standard_normal(n), 'band', [1800, 6000]) * env(n, 0.0003, 0.006) + 0.6*np.sin(2*np.pi*1400*tt)*env(n, 0.0005, 0.01)
    put(sfx, t, x, gain, pan=0.2)

def chime(t, gain=0.06):
    bell('A5', t, gain, pan=0.3, decay=0.6); bell('E6', t + 0.09, gain * 0.8, pan=0.35, decay=0.7)

# ---------- Arrangement ----------
BPM = 96; B = 60 / BPM; BAR = 4 * B; T0 = 6.4
CHORDS = [  # (pad voicing, bass root, arp tones)
    (['D3','F#3','A3','C#4','E4'], 'D2', ['D4','F#4','A4','C#5','E5']),
    (['B2','D3','F#3','A3','C#4'], 'B1', ['B3','D4','F#4','A4','C#5']),
    (['G2','B2','D3','F#3','A3'],  'G1', ['G3','B3','D4','F#4','A4']),
    (['A2','C#3','E3','B3','E4'],  'A1', ['A3','C#4','E4','B4','E5']),
]
ARP = [0, 2, 4, 1, 3, 2, 4, 3]
MELODY = [('F#5',0),('A5',1.5),('E5',3),('D5',4),('C#5',5.5),('B4',6),('A4',8),('B4',9.5),('C#5',10),('E5',11.5),('D5',12)]

# Intro: tension 0-4.2
for k in range(int(4.2 / (B / 2))):
    t = k * B / 2; p = t / 4.2
    n = int(0.28 * SR)
    x = filt(saw(hz('D2'), n) + saw(hz('D2'), n, 0.004), 'low', 220 + 1600 * p ** 1.6) * env(n, 0.004, 0.12)
    put(music, t, x, 0.16 + 0.1 * p)
    hat(t, 0.025 + 0.03 * p, pan=0.3)
    if p > 0.45: hat(t + B / 4, 0.02 + 0.03 * p, pan=-0.3)
CHAOS_T = [.05, .3, .5, .8, .95, 1.15, 1.35, 1.55, 1.7, 1.95, 2.15, 2.3, 2.5, 2.65]
for i, t in enumerate(CHAOS_T):
    blip(t + 0.04, [1318, 1568, 1175, 1760, 1480, 1975][i % 6], 0.045, pan=[-.6, .6, -.3, .4, .7, -.7][i % 6])
for t in (.25, 1.05, 1.85, 2.65):
    kick(t, 0.45); clap(t, 0.04)
noise_sweep(2.9, 4.2, 300, 9000, 0.16)
s = int(3.0 * SR); e = int(4.2 * SR)
sw = np.sin(2*np.pi*np.cumsum(np.linspace(110, 880, e - s))/SR) * np.linspace(0, 1, e - s) ** 2
put(music, 3.0, filt(sw, 'low', 2500), 0.05)

# Title 4.2-6.4
impact(4.2, 0.38)
pad(CHORDS[0][0], 4.2, 2.4, gain=0.13, cutoff=2600, a=0.05)
for i, nt in enumerate(['D5', 'A5', 'E6']): bell(nt, 4.2 + i * 0.12, 0.05, pan=(-0.4, 0.4, 0)[i], decay=1.6)
noise_sweep(5.6, 6.4, 400, 6000, 0.08)

# Groove 6.4 to the end card
END = 37.7
bar = 0
while T0 + bar * BAR < END:
    tb = T0 + bar * BAR; ch = CHORDS[bar % 4]
    pad(ch[0], tb, min(BAR + 0.3, 38.2 - tb), gain=0.13, cutoff=1500 + 500 * min(1, bar / 8))
    for b in range(4):
        t = tb + b * B
        if t >= END: break
        kick(t, 0.32 if b % 2 == 0 else 0.22)
        bass(ch[1], t, B * 0.9, 0.13 if b % 2 == 0 else 0.08)
        if t >= 11.0:
            hat(t + B / 2, 0.065, pan=0.25); hat(t, 0.035, pan=-0.2)
        if t >= 16.4 and b % 2 == 1: clap(t)
    if tb >= 11.0:
        for k, a in enumerate(ARP):
            t = tb + k * B / 2
            if t < END: pluck(ch[2][a], t, 0.10, pan=(-0.35 if k % 2 else 0.35))
    bar += 1
for nt, beat in MELODY:  # bell melody over voting
    t = 26.4 + beat * B
    if t < END: bell(nt, t, 0.075, pan=0.15, decay=1.1)
noise_sweep(36.8, 38.0, 500, 8000, 0.10)

# End card: resolve
impact(38.0, 0.3)
pad(['D3','A3','D4','F#4','A4','E5'], 38.0, 4.0, gain=0.14, cutoff=2400, a=0.08)
bass('D2', 38.0, 3.6, 0.10)
for nt, dt in (('F#5', 0.1), ('A5', 0.32), ('D6', 0.54), ('E6', 0.9)): bell(nt, 38.0 + dt, 0.07, pan=0.2, decay=2.2)

# Sound design synced to the picture
for t in (8.7, 13.05, 14.95, 22.0, 27.3, 30.0, 32.15, 33.9, 34.9): tap(t)
for t0, t1 in ((6.1, 7.0), (28.35, 29.3), (32.9, 33.7)): noise_sweep(t0, t1, 600, 3500, 0.07, rise=False)
noise_sweep(3.5, 4.15, 6000, 400, 0.10, rise=False)
for t in (15.95, 30.6, 31.4, 35.5): chime(t)
for t in (11.3, 22.1, 26.1, 34.0): noise_sweep(t, t + 0.3, 2500, 900, 0.025, rise=False)

# ---------- Mix ----------
def reverb(x, seconds=2.6):
    n = int(seconds * SR); tt = np.arange(n) / SR
    out = np.zeros_like(x)
    for c in range(2):
        ir = rng.standard_normal(n) * np.exp(-tt / (seconds / 6.5))
        ir = filt(ir, 'low', 6000); ir /= np.sqrt(np.sum(ir ** 2))
        out[c] = fftconvolve(x[c], ir)[:x.shape[1]]
    return out

music *= duck
mix = music + 0.9 * sfx + 0.5 * reverb(verb_send) * duck
mix = filt(mix, 'high', 38)
fade = int(1.8 * SR); mix[:, -fade:] *= np.linspace(1, 0, fade) ** 1.5
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) / np.tanh(1.3) * 0.89
wavfile.write(os.path.join(HERE, 'score.wav'), SR, (mix.T * 32767).astype(np.int16))
print('wrote score.wav')
