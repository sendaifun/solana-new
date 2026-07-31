# Acquisition

## Tooling preflight

Check before starting — a missing binary mid-pipeline wastes a phase:

```bash
command -v yt-dlp ffmpeg ffprobe || brew install yt-dlp ffmpeg   # macOS
# apt/dnf equivalents on Linux; scoop/choco on Windows
```

## Sources

| Source | Method |
| --- | --- |
| X/Twitter post | `yt-dlp -o ref.mp4 "<tweet url>"` — resolves the highest-quality mp4 variant |
| YouTube / Vimeo | `yt-dlp -o ref.mp4 "<url>"` |
| Direct mp4/webm/GIF URL | `curl -L -o ref.mp4 "<url>"` |
| Dribbble / Framer showcase | Often a `<video>` tag — grab `src` from devtools; else screen-record |
| Live site interaction | Screen-record it yourself (QuickTime/OBS, 60fps if possible) — recording your own scrub of a real UI is a first-class reference |
| User-provided file | Just probe it |

If nothing works, ask the user for a screen recording rather than degrading to
memory of the video.

## Always probe first

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,duration,nb_frames \
  -of default=nw=1 ref.mp4
```

Every later command depends on this: fps decides sampling divisors, resolution
decides crop math, `nb_frames` decides window sizes. A 60fps reference is gold —
ghost/blend frames between states are visible, which is how you distinguish a
crossfade from a hard cut.

## Quality notes

- Prefer the square/original upload over re-encodes; blocky compression hides
  blur feathers and low-opacity transients.
- If the only copy is 30fps, transitions under ~100ms may read as hard cuts —
  say so in the analysis doc instead of guessing.
