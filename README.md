# audio_tools

Audio tools by sessea — convert, compress, trim, volume, merge, and speed in the browser. No backend.

```bash
npm install
npm run dev
```

## Tools

- `/convert` — MP3 / WAV / WebM / OGG / M4A (browser-supported)
- `/compress` — bitrate or target size
- `/trim` — cut + optional normalize
- `/volume` — normalize or gain
- `/merge` — concat clips in order
- `/speed` — 0.5x–2x (pitch follows)

## Add a new tool later

1. Add an entry in `src/tools.js`
2. Create `src/views/YourView.vue`
3. Register the view in `src/router.js`
