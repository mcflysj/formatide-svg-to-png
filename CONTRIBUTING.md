# Contributing to the browser demo

Useful contributions include a small synthetic SVG that reveals a rendering problem, a focused browser regression test, a clearer export example or an accessibility improvement.

## Before changing the code

Read the [demo's supported SVG subset](demo/README.md). Keep the renderer small and dependency-free at runtime. New SVG features need a resource-loading review as well as tests; do not broadly allow scripts, styles or external URLs to make one fixture work.

Run `npm ci`, `npm run build`, `npx playwright install chromium webkit` and `npm test`. A pull request should describe the observable behavior before and after the change and include a synthetic reproduction. Screenshots help when layout changes.

Use the issue templates for product suggestions. Never attach private customer artwork, personal photos or identifying file names. The hosted tools and this reference demo have different feature sets, so mention which one you used.

The demo code is [MIT licensed](demo/LICENSE). Contributions to `demo/` use the same license.
