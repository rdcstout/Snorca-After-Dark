# Linux 0.3.1

Linux operation has been confirmed by Roger on Ubuntu. Automated apply/restore and package checks also pass. This does not establish compatibility with every distribution or independent Flatpak runtime validation. Mac and Windows retain their tested 0.3.0 packages.

## Download and install

Linux x86-64 only. [Download the current release](https://github.com/rdcstout/Snorca-After-Dark/releases/latest).

- **AppImage:** download `Snorca-After-Dark-Linux-x64.AppImage`, mark it executable in your file manager, and open it. Alternatively: `chmod +x Snorca-After-Dark-Linux-x64.AppImage` then `./Snorca-After-Dark-Linux-x64.AppImage`.
- **Debian/Ubuntu installer:** download `Snorca-After-Dark-Linux-x64.deb` and install it with your package manager, or `sudo apt install ./Snorca-After-Dark-Linux-x64.deb`. Open **Snorca After Dark** from the applications menu.

Do not run the application as root or disable the Electron sandbox to work around a launch error. Report the error and distro/version instead. The AppImage may require your distro's FUSE support; the Debian package provides an alternative on Debian/Ubuntu.

## Apply and restore

1. Open Snapmaker Orca 2.3.6 once so it creates its web files, then close it.
2. Open Snorca After Dark. It looks for the normal and Flatpak configuration folders. If both exist, choose the one belonging to the installation you use.
3. If needed, click **Choose…** and select the **configuration folder**, not the AppImage or EXE:
   - AppImage: `~/.config/Snapmaker_Orca` (or `$XDG_CONFIG_HOME/Snapmaker_Orca`).
   - Flatpak: `~/.var/app/io.github.Snapmaker.Snapmaker_Orca/config/Snapmaker_Orca`.
   - A custom/portable data directory can be selected if it contains `web/flutter_web`.
4. Click **Apply theme**, then open Orca normally. The Linux version does not launch Orca for you.
5. To undo it, close Orca and click **Restore original**.

The theme is limited to verified web 2.3.26 / 20260818172502 files. Those files from the official Linux AppImage match the supported hashes. Flatpak path handling is implemented, but its package and runtime have not been independently verified. Unrecognized or modified web files are refused without applying a patch.

## Remove the application

Restore original first if you want to remove the theme as well. Delete the AppImage, or remove the installed Debian package with `sudo apt remove snorca-after-dark`.

Uninstalling keeps the theme and restore backups. Backups and settings are in `$XDG_CONFIG_HOME/orca-dark-launcher`, normally `~/.config/orca-dark-launcher`. Keep that folder until you no longer need to restore. Use **Open diagnostics** to find it.

## Reporting results

Report your distro/version, desktop environment, and whether Orca is AppImage or Flatpak. Please confirm:

- The utility installs/opens and identifies the correct Orca configuration folder.
- Applying while Orca is open refuses clearly without changing files.
- Home and Device pages, including the picker, render correctly after applying with Orca closed.
- Closing the utility leaves the theme applied.
- Reapplying works and Restore original returns the stock appearance.
- The Debian package upgrades/removes normally, or the AppImage can be deleted normally.

[Report results or errors](https://github.com/rdcstout/Snorca-After-Dark/issues). Include the visible message and a screenshot when helpful; do not upload your printer configuration or the entire backup folder.

## Build and verification

On Ubuntu 24.04 with Node 24: `npm ci`, `npm run check`, and `npm run package:linux -- --publish never --config.directories.output=dist-linux`.

The Linux GitHub workflow fetches the hash-pinned official AppImage, extracts its web files with pinned Python tools, runs the shared and Linux-specific tests, checks production dependency advisories, builds AppImage and Debian packages, verifies the packaged source, and generates SHA-256 checksums. These automated checks do not establish hands-on desktop compatibility.
