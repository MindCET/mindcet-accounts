# Hebrew Remotion video

A short Hebrew Remotion composition featuring a presenter, Claude Code, Remotion,
Hebrew subtitles, and Hebrew voiceover.

## Commands

**Install dependencies**

```console
npm i
```

**Generate Hebrew voiceover**

Requires the Python `edge-tts` package:

```console
python -m pip install --user edge-tts
npm run voiceover
```

**Start preview**

```console
npm run dev
```

**Render video to `out/hebrew-discovery.mp4`**

```console
npm run render
```

**Check code**

```console
npm run lint
```
