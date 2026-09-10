# Development

Use Node 24 and npm. `npm ci` installs the pinned dependencies. `npm start` downloads the pinned Electron runtime when necessary and opens the app.

Run `npm run check`, then set `ORCA_FIXTURE` to an unmodified vendor `web/flutter_web` directory and run `npm test`. Fixtures are not included in this repository. The verified Windows 2.3.6 portable archive is available from Snapmaker's official GitHub release; its SHA-256 is `3941f8021d2164b242c057d1c90ddb9f322385b3d0a4960d19bbbafe914b40d1`.

`npm run package:win` builds the NSIS x64 installer; `npm run package:mac` builds the Apple silicon DMG. The configured output directory is `../../work/release-packages`; override Electron Builder's directories.output for another workspace. `npm run verify:package -- /path/to/app.asar` compares packaged source and version with the checkout.

Windows preparation applies guarded, repeatable substitutions to the pinned electron-builder installer template: precise upgrade-failure wording and use of the current uninstaller for the registered previous installation. The included NSIS hook checks the exact helper executable and never force-kills a theme transaction. A template mismatch stops the build for review.

Mac builds use the configured Developer ID certificate fingerprint. Set your own authorized identity on another machine. The custom signing hook resolves duplicate certificate names by fingerprint. Use an existing notarytool keychain profile: `xcrun notarytool submit <dmg> --keychain-profile <profile> --wait`. After acceptance, run `xcrun stapler staple <dmg>`, `xcrun stapler validate <dmg>`, and `spctl --assess --type open --context context:primary-signature <dmg>`. Never commit credentials.

`release-channel.json` selects the public GitHub repository and stable channel. Release assets must match the versioned names expected by updates.cjs. Publish byte-identical stable-name copies for README download links and a SHA256SUMS file. Check discovery with an older version and equal-version behavior before declaring the release verified.

Electron and semver use MIT licenses. Packaged third-party notices are under assets/licenses. Snapmaker web resources are not redistributed; the patch accepts only reviewed exact hashes. No analytics or printer-control commands are added.
