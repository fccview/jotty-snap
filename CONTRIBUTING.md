## Development

```bash
bun install
bun run typecheck
bun test
bun run build            # both browsers into dist/chrome and dist/firefox
bun run build:chrome     # or build:firefox
bun run build -- --dev   # unminified, with sourcemaps
bun run pack             # zips into artifacts/, plus a source zip for AMO
```

To load it unpacked:

- **Chrome:** open `chrome://extensions`, turn on Developer mode, click Load unpacked, and pick `dist/chrome`.
- **Firefox:** open `about:debugging#/runtime/this-firefox`, click Load Temporary Add-on, and pick `dist/firefox/manifest.json`.
