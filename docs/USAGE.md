# Install, restore, and remove

On Windows, run the installer. Existing installations can be upgraded in place. Start menu entries include Snorca After Dark and Uninstall Snorca After Dark. Windows Settings > Apps > Installed apps also provides uninstall.

On Mac Apple silicon, open the disk image and drag Snorca After Dark into Applications. Public Mac distribution requires a signed, notarized, stapled build.

Close Orca before Apply or Restore. A verified current theme remains applied when Orca is open; close Snorca After Dark whenever no operation is in progress. Optional Apply & open and apply-on-open are convenience actions, not background services.

To return to stock, close Orca and choose **Restore original** before uninstalling the helper. Uninstalling the helper alone retains the theme and its backups. On Mac, quit the helper and move it to Trash.

Settings, restore backups and bounded diagnostics remain under `orca-dark-launcher` in the operating system's application-data folder across upgrades and removal. Use **Open diagnostics** to find that folder. Restore before deleting backups. Logs contain event names and codes, not printer credentials or arbitrary file paths; review any files before sharing them.

Unsupported builds are left untouched. Updating Orca may replace user resources; reapply only when that vendor build is supported. The patcher refuses changed backups, modified installed resources, or a detected running Orca process rather than overwriting them.

If installation or removal fails, report the installer version and exact message. Do not delete installation folders as a routine upgrade procedure. If Apply fails, include the Web/Build line shown in the app.
