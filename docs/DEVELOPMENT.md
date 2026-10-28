# Development

Use Node 24 and npm. `npm ci` installs the pinned dependencies. `npm start` downloads the pinned Electron runtime when necessary and opens the app.

Run `npm run check`, then set `ORCA_FIXTURE` to an unmodified vendor `web/flutter_web` directory and run `npm test`. Fixtures are not included in this repository. The verified Windows 2.3.6 portable archive is available from Snapmaker's official GitHub release; its SHA-256 is `3941f8021d2164b242c057d1c90ddb9f322385b3d0a4960d19bbbafe914b40d1`.

`npm run package:win` builds the NSIS x64 installer; `npm run package:mac` builds the Apple silicon DMG. The configured output directory is `../../work/release-packages`; override Electron Builder's directories.output for another workspace. `npm run verify:package -- /path/to/app.asar` compares packaged source and version with the checkout.

Windows preparation applies guarded, repeatable substitutions to the pinned electron-builder installer template: precise upgrade-failure wording and use of the current uninstaller for the registered previous installation. The included NSIS hook checks the exact helper executable and never force-kills a theme transaction. A template mismatch stops the build for review.

Mac builds use the configured Developer ID certificate fingerprint. Set your own authorized identity on another machine. The custom signing hook resolves duplicate certificate names by fingerprint. Sign the disk image as well as the app (`codesign --timestamp --sign <Developer-ID-identity> <dmg>`). Use an existing notarytool keychain profile: `xcrun notarytool submit <dmg> --keychain-profile <profile> --wait`. After acceptance, run `xcrun stapler staple <dmg>`, `xcrun stapler validate <dmg>`, and `spctl --assess --type open --context context:primary-signature <dmg>`. Never commit credentials.

`release-channel.json` selects the public GitHub repository and stable channel. Release assets must match the versioned names expected by updates.cjs. Publish byte-identical stable-name copies for README download links and a SHA256SUMS file. Check discovery with an older version and equal-version behavior before declaring the release verified.

Electron and semver use MIT licenses. Packaged third-party notices are under assets/licenses. Snapmaker web resources are not redistributed; the patch accepts only reviewed exact hashes. No analytics or printer-control commands are added.

## Orca 2.4.0 compatibility update — local validation

Release: Snorca After Dark 0.3.2. Roger confirmed the Mac appearance and authorized publication on 2026-10-01.

Snapmaker Orca 2.4.0 on macOS bundles web 2.3.38 / 20260915154633. Its main script and bootstrap now have hashed filenames. Detection and backup/restore use the verified resource list for each supported build. Unknown content still fails closed.

Flutter 3.41 renders the Device page with CanvasKit. The update targets verified compiled theme hooks for headers, controls, printer picker, and idle/disconnected placeholder graphics. The renderer had optimized image blending to srcIn; the patch selects exclusion only for explicitly marked placeholder colors. Camera frames and actual print thumbnails are not marked.

Local checks on 2026-10-01:
- 47 tests pass with both legacy and new official macOS fixtures, including exact restore, repeat apply, changed-file refusal, and placeholder-versus-normal image blending.
- Syntax/package version check and diff whitespace check pass.
- Connected U1 visually checked: headers readable, controls dark, idle Printing Task graphic restored on a dark background. Disconnected placeholders also render on dark backgrounds.
- No print, motion, or heater operations were issued.

Official Windows and Linux AppImage 2.4.0 resources are also verified. Windows differs only in line endings; original bytes remain backed up and restored exactly. `scripts/vendor240-fixture.py windows|linux` fetches pinned fixtures for CI. Set `ORCA_240_FIXTURE` to their extracted directory.

The Linux packaging preparation removes electron-builder 26.15.3's automatic `--no-sandbox` fallback and supplies an empty desktop argument list. Template drift fails the build. Systems that restrict unprivileged namespaces should use the Debian package with its app-specific profile.

Active-print status and hands-on 2.4.0 Windows/Linux appearance have not been tested in this session.

## Homing button correction — 0.3.3

The Orca 2.4.0 homing control passes its background separately from the movement controls. The verified compiled hook now uses #3E3E45 while dark mode is active. The vendor light color, icon, layout, callback, and disabled state are preserved. The hash guard and existing apply/restore paths remain unchanged.

All 47 tests pass against both official Windows and Linux 2.4.0 fixtures, together with the legacy 2.3.6 fixture. The homing regression executes the patched widget constructor with both theme states and enabled/disabled states without invoking printer commands. Syntax and whitespace checks pass. Runtime dependency audit is clean; the existing ten build-tool dependency advisories remain unchanged. The focused adversarial review covered hook uniqueness, cache invalidation, existing-patch replacement, and restoration. No printer motion was issued. Roger confirmed the patched homing button on the local Mac after installing 0.3.3 and applying over the existing theme on 2026-10-22. The packaged app reported Theme update available before applying and Dark theme current afterward. Windows/Linux visual retesting remains unverified.

## Electron update — 0.3.4

PR #4 updates Electron 44.3.0 to 44.9.1. Bundled notices were copied byte-for-byte from the official 44.9.1 distribution, retaining upstream whitespace. No theme, IPC, settings, or installer behavior was changed. The app remains sandboxed with context isolation and no renderer Node integration.

All 47 tests pass under Node 24 and Electron 44.9.1's runtime using official old/new Orca fixtures. Both PR checks passed before merging. Runtime npm audit is clean; three existing build-dependency advisories remain in fast-uri, http-cache-semantics, and undici. These npm copies are development dependencies, not packaged application dependencies. Native Windows/Linux UI testing remains unavailable locally.

0.3.4 delivery verification: release source d521dcc; GitHub Checks 40510519666 and Linux package job in run 40510519804 passed. Mac and Windows packaged source/notices matched; Mac installation, native picker cancellation and already-applied action verified. Mac notarization accepted and stapled; Gatekeeper passed. All nine uploaded hashes and older/equal update eligibility checked. Final artifacts and detailed local evidence are retained under work/release034 in the development workspace.

## Local 0.3.5 candidates

Linux Orca Flatpak 2.4.1 serves its installed web resources. Detection resolves the current Flatpak deployment instead of trusting the stale profile copy. The existing transaction engine copies and replaces the web directory, preserving OSTree object inodes, verifies exact supported hashes, and saves original files. Printer settings are outside the patch target. Older versions retain the configuration-folder method.

Build Debian on Ubuntu x64 with Node 24: `npm ci`, `npm run check`, then `npm run package:linux -- --config.directories.output=../packages --publish never`. For Flatpak, install `org.freedesktop.Sdk//25.08` and `org.electronjs.Electron2.BaseApp//25.08` from Flathub, then run `npm run package:flatpak -- ../packages/linux-unpacked ../packages`. Use an output directory without an existing Flatpak staging directory.

The Flatpak uses Zypak and a fixed host helper because Flatpak reserves its own installation directories. Both packages share `~/.config/orca-dark-launcher`. The wrapper uses X11/XWayland; user-installed Orca Flatpak 2.4.1 was tested on Ubuntu. System-wide installations requiring privileged writes are not validated.

0.3.5 validation: 52 automated tests passed with all three vendor generations enabled. Windows patching was user-confirmed; Ubuntu Debian and Flatpak apply/restore and Home/Device appearance passed. Final packaged runtime source matched. Public 0.3.4 and candidate 0.3.5 AppImages failed at sandbox startup on Ubuntu 26.04.1. The earlier 0.3.1 launcher automatically disabled its sandbox on that host; AppImage distribution is withdrawn rather than restoring that behavior.

Nothing from Snapmaker's installed web bundle is shipped in these packages. Publication uses only the tested Windows, Debian, and Flatpak artifacts; no modified Orca application is distributed.
