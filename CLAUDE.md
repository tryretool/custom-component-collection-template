# Retool Custom Component Library Template

## What this repo is

This is the **starter template** for building custom Retool components using React and TypeScript. Developers clone or fork this repo, build their component here, and optionally submit it to the community gallery.

- **Repo:** https://github.com/tryretool/custom-component-collection-template
- **Gallery repo (where accepted components live):** https://github.com/tryretool/custom-component-gallery
- **Gallery website:** https://customcomponents.retool.com

---

## Directory structure

```
src/
  components/
    YourComponent/          # One folder per component
      YourComponent.tsx     # Main component file
      YourComponent.test.tsx
      README.md             # Usage instructions
  index.tsx                 # Export all components from here
package.json
tsconfig.json
vitest.config.ts
```

All components must be exported from `src/index.tsx` to be synced to Retool.

---

## Key commands

| Command | What it does |
|---------|-------------|
| `npm install` | Install dependencies |
| `npx retool-ccl login` | Authenticate with your Retool instance |
| `npx retool-ccl init` | Register the library with Retool, writes metadata to package.json |
| `npx retool-ccl dev` | Start dev mode — syncs to Retool on every save |
| `npx retool-ccl deploy` | Deploy an immutable production version |
| `npm test` | Run tests with Vitest |

---

## Component conventions

- One component per folder inside `src/components/`
- Always export from `src/index.tsx`
- Prefer explicit props over implicit state
- Avoid hardcoded styles — use CSS modules or props-driven styling
- Include a test file for each component
- Include a `README.md` inside each component folder with usage instructions

---

## Limitations to be aware of

- Not supported in Retool Mobile or PDF exports
- Individual revisions cannot exceed 10MB (30MB in dev mode)
- Only JavaScript and CSS files are loaded at runtime
- Library descriptions cannot be edited after creation via `init`

---

## Submitting to the Community Gallery

Built something useful? Both steps below are required — submissions without both will not be reviewed.

### Step 1 — Open a PR to the gallery repo

Add your component folder to [custom-component-gallery](https://github.com/tryretool/custom-component-gallery) under `components/your-component-name/`. Required files:

- `src/` — source code
- `package.json`
- `metadata.json` — title, author, tags (see gallery repo for format)
- `cover.png` — screenshot or GIF, under 2MB
- `README.md` — installation and usage instructions

### Step 2 — Submit the gallery form

Go to [customcomponents.retool.com](https://customcomponents.retool.com/) and click **Submit Component**. Provide the PR URL from Step 1, cover image, description, and tags.

> Save the confirmation email — it contains your personal edit link for future updates to your listing.
