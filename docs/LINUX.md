# Linux

Snorca After Dark 0.3.5 is available as Flatpak and Debian packages for x86-64. Ubuntu apply/restore and Home/Device appearance were tested with user-installed Snapmaker Orca Flatpak 2.4.1. Other distributions and system-wide Orca installations are not validated.

## Install

Choose one package from the [current release](https://github.com/rdcstout/Snorca-After-Dark/releases/latest).

- Debian/Ubuntu: `sudo apt install ./Snorca-After-Dark-Linux-x64.deb`
- Flatpak: `flatpak install --user ./Snorca-After-Dark-Linux-x64.flatpak`

Flatpak needs the Flathub runtime offered during installation. Open **Snorca After Dark** from the applications menu. Its Flatpak ID is `therapy.extrusion.orca_dark_launcher`.

The Flatpak uses a bundled helper through `org.freedesktop.Flatpak` to access Orca’s installed web files on the host. This permission allows host command execution. The app invokes only its own fixed helper operations and retains the renderer sandbox.

## Apply and restore

1. Close Orca before applying or restoring.
2. Open Snorca After Dark. Orca 2.4.1’s current user Flatpak deployment is detected automatically. If more than one installation is found, select the one you use.
3. Click **Apply theme**, then open Orca normally.
4. To undo the theme, close Orca and click **Restore original**.

Older Orca 2.3.6/2.4.0 builds use their configuration folder containing `web/flutter_web`: normally `~/.config/Snapmaker_Orca` or `~/.var/app/io.github.Snapmaker.Snapmaker_Orca/config/Snapmaker_Orca`. Open Orca once and close it to initialize those files.

For 2.4.1, the patch replaces the installed web directory with a patched copy and preserves verified restore backups. It does not edit printer settings. Updating Orca may replace the theme; reopen After Dark after the update. Only verified vendor files are accepted.

Use one copy of After Dark at a time. Do not run it as root or disable its sandbox.

## Remove

Restore original first if you also want to remove the theme. Remove Debian with `sudo apt remove snorca-after-dark`, or Flatpak with `flatpak uninstall --user therapy.extrusion.orca_dark_launcher`.

Both formats retain settings and verified restore backups in `~/.config/orca-dark-launcher`. Keep that directory until you no longer need to restore. Use **Open diagnostics** to locate it.

## Help

[Report an issue](https://github.com/rdcstout/Snorca-After-Dark/issues) with the app version, distro, Orca version, package format, and visible error. Do not upload printer configuration or the entire backup folder. [Build instructions](DEVELOPMENT.md).
