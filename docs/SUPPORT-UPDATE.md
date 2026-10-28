# Snorca After Dark update: Windows and Linux continue; macOS support ends with Orca 2.4.1

The latest Snorca After Dark update supports Snapmaker Orca 2.4.1 on Windows and Linux. Windows patching is confirmed, and Ubuntu testing confirmed applying and restoring the theme.

Unfortunately, we’re ending macOS support for Snapmaker Orca **2.4.1 and later**. Earlier supported versions can continue using the existing patch.

Starting with 2.4.1, Orca loads its Home and Device pages from inside the installed application instead of the user-folder files After Dark previously patched.

We **can** still change those pages on macOS—we successfully tested it. It doesn’t require recompiling Orca, but modifying files inside the app invalidates Snapmaker’s code signature. Our working replacement required signing the modified app with our own Apple Developer identity and having Apple notarize it again.

That takes After Dark beyond a small theme patcher and into maintaining a modified application, with additional signing, distribution, and support responsibilities. We won’t be pursuing that approach.

Our [upstream request for native dark-mode support](https://github.com/Snapmaker/OrcaSlicer/pull/1063) remains open. We’d welcome Snapmaker adding it directly.

Windows and Linux support will continue.
