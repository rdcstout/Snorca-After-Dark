# Contributing to Snorca After Dark

Thanks for helping improve this project. Useful bug reports, documentation fixes, accessibility improvements, and focused code changes are welcome.

## Before starting

Read the [README](README.md), check existing issues and pull requests, and coordinate with the maintainer before substantial features, new dependencies, architectural changes, or changes to default behavior. Small, clearly scoped fixes can be proposed directly. Avoid duplicating work already under review.

Security vulnerabilities follow [SECURITY.md](SECURITY.md); do not disclose them in public issues or pull requests.

## Report a bug or propose an improvement

For a bug, include the app version or commit, operating system and relevant hardware, steps to reproduce, expected and actual behavior, and useful sanitized logs. Attach a small example or screenshot when it helps. Remove credentials, personal data, private files and identifying paths; do not attach a full project when a small reproduction is enough.

For a proposal, describe the problem, intended users and desired behavior. Discussion helps establish scope before implementation; it is not a promise that a feature or contribution will be accepted.

## Prepare a change

Follow [the development instructions](docs/DEVELOPMENT.md) and existing project conventions. Keep each PR focused. Include a regression test for a reproducible bug where practical, relevant documentation, and screenshots or a short recording for observable changes. Explain changes to defaults, settings, stored data, dependencies and compatibility. Preserve existing user data and document migration or recovery implications.

Use code and assets you have the right to contribute, follow the project's existing license and third-party notices, and document new dependencies or external assets. Do not add secrets, local settings, build caches, generated installers or unrelated files. If contribution rights or licensing are unclear, discuss them before submitting.

## Validation

Run the [documented validation checks](docs/DEVELOPMENT.md) that apply to your change and include their results in the PR. That guide identifies automated checks and manual acceptance work.

Report exactly what you checked, the platform and results, and what remains untested or failing. A successful build alone does not prove an interface or hardware integration works. Use disposable data or backups for tests that could affect stored work or devices.

The current workflow definitions are [check.yml](.github/workflows/check.yml), [linux-beta.yml](.github/workflows/linux-beta.yml). Consult their actual triggers, path filters, jobs, and approval behavior before requesting CI; this policy does not enable or change workflows. CI build/test results do not replace packaged-app or hardware acceptance.

## Keep review manageable

Describe the problem and resulting behavior, link the relevant issue when one exists, and distinguish intentional changes from unrelated work. You are responsible for understanding, reviewing and testing the submitted change, including contributions made with assistance from tools.

Do not push merely to keep pace with the default branch. Update when resolving conflicts, addressing review feedback, or delivering a substantive improvement within the agreed scope. Keep related fixes together where practical. Do not repeatedly rerun unchanged checks; investigate a real failure and use a bounded retry only for verified infrastructure trouble.

Preserve other contributors' work. Do not rewrite a shared branch's published history without coordinating with its maintainer, and do not force-push the default branch.

Passing checks and a favorable review do not guarantee a merge or release. The maintainer decides acceptance, scope and timing; contributors should not merge, enable automatic merging, or publish releases on the maintainer's behalf without explicit authorization.

Be respectful, respond to actionable feedback, and ask for clarification when a requirement is unclear. Review and support are best effort; there is no guaranteed response schedule.
