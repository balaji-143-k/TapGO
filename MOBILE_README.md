This guide helps package the TapGo web app into real mobile apps using Capacitor.

Prerequisites

- Node.js & npm installed
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)
- A Vercel or Netlify account for web hosting (optional, but recommended)

1. Install dependencies

```bash
npm install
```

2. Build the web app

```bash
npm run build
```

3. Install Capacitor and initialize (done in repo already)

```bash
npx cap init TapGo com.tapgo.app --web-dir=dist
```

4. Add platforms

- Android:

```bash
npx cap add android
npx cap open android
```

- iOS (macOS only):

```bash
npx cap add ios
npx cap open ios
```

5. Sync web changes

```bash
npm run build
npx cap copy
```

6. Build and run in emulator/device

- Android: build and run from Android Studio
- iOS: build and run from Xcode

7. Publish

- Android: generate signed AAB and upload to Google Play Console
- iOS: archive and upload via Xcode to App Store Connect

Notes

- For Android signing, follow Google's docs and set `signingConfig` in Gradle.
- For iOS, you need Apple Developer account and certificates.

If you want, I can:

- Initialize Capacitor in the repo and add `android` platform here (requires running `npm install` and `npx cap add android`).
- Or deploy the `dist` to Vercel and give a public URL first.
