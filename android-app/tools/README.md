Rebuild the bundled vector decoder/renderer with `npm ci` in this directory, then:

```
npx esbuild vector-renderer.js --bundle --minify --outfile=../app/src/main/assets/vector.js
```

The bundle and its license notices are packaged in the APK; no runtime CDN dependency.
