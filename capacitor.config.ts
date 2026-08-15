import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.codetrack.app',
  appName: 'CodeTrack',
  // Static export output (see next.config.mjs `output: 'export'`) — this is
  // what gets bundled into the Android app and loaded offline in the
  // WebView. Run `npm run build` before `npx cap sync android` any time the
  // web code changes, so `out/` is up to date.
  webDir: 'out',
  server: {
    // Lets the WebView load bundled files over https:// instead of the
    // default file:// scheme, which some web APIs (fetch to https:// URLs
    // included) behave better with.
    androidScheme: 'https',
  },
  plugins: {
    CapacitorHttp: {
      // Routes fetch()/XHR through native Android HTTP instead of the
      // WebView's networking stack, so calls to endpoints that block
      // browser CORS (like LeetCode's GraphQL API) work from the app.
      enabled: true,
    },
  },
};

export default config;
