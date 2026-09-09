# Publishing Radio Atlas to a Bridgething catalog

A Bridgething "source" is a GitHub repo that builds your app, hosts the
bundles on GitHub Pages, and serves a `catalog.v1.json` that the companion
apps and bridgething.com read. This repo is already publishing-ready:

- `public/manifest.json` has a **uuidv7** id (`01a08604-de6f-7a9f-a11e-1b4233458b2a`).
  Never change it — it drives upgrades and the on-device KV namespace.
- `public/icon.png` (512×512) is wired as the store icon via `"icon": "icon.png"`.
- `LICENSE` (MIT, from the original Omarchy project) is included.
- Version is `0.3.0`, matching `CHANGELOG.md`.

## Steps

### 1. Scaffold a source repo

```sh
bunx create-bridgething my-radio-source
cd my-radio-source
```

### 2. Add this app

```sh
mkdir -p apps/radio-atlas
# copy everything from radio-atlas-bridgething/ into apps/radio-atlas/
# (package.json, vite.config.ts, tsconfig.json, public/, src/, index.html, ...)
```

Then sanity-check it inside the source:

```sh
bun install
bun run check        # validates the catalog schema
bun run build        # builds the app bundle
```

### 3. Push to GitHub and enable Pages

1. Create the repo on GitHub and push `main`.
2. In **Settings → Pages**, set source to **Deploy from a branch**,
   branch `gh-pages`, folder `/ (root)`.
3. Note your base URL: `https://<you>.github.io/<repo>` — the catalog will
   live at `https://<you>.github.io/<repo>/catalog.v1.json`.

### 4. Screenshots (store listing)

```sh
bun run shot radio-atlas            # grabs what is on the screen
bun run shot radio-atlas --replace  # overwrite
```

Screenshots are optional (omit them rather than shipping an empty list), but
the store shows the first one on the listing. They must be 800×480 landscape.

### 5. Ship a version

```sh
bun run bump radio-atlas minor -m "Map view, on-screen keyboard"
git commit -am "radio-atlas: map view, on-screen keyboard" && git push
```

Pushing to `main` triggers the `publish` workflow: it builds every
unpublished version, uploads the bundles, and regenerates `catalog.v1.json`
(including the bundle `sha256` and icon URLs).

### 6. Submit the source

Add your catalog URL (`https://<you>.github.io/<repo>/catalog.v1.json`) at
bridgething.com/apps so others can subscribe to your source.

## Rules to respect

- **Never change the bytes behind a published version.** Bump the version
  instead; the catalog lists versions newest-first by `released_at`.
- **Never change the app id.**
- Installed apps only take updates from the source they came from.
- GitHub Pages serves the required `Access-Control-Allow-Origin: *` headers.

## Useful commands

| Command | Purpose |
|---|---|
| `bun run dev` | develop against a connected device |
| `bun run push` | build and install to the device |
| `bun run check` | validate the catalog |
| `bun run catalog` | regenerate `catalog.v1.json` locally |
| `bun run share` | share a dev build |

Reference: https://bridgething.com/docs/publishing-apps
