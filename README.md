# Retool Custom Component Library Template

Use this as the starting point for building your own custom component library for Retool.

---

## What is a Custom Component Library?

Retool allows you to extend its built-in components by creating your own using React and TypeScript. A custom component library:

- Is developed locally and deployed into Retool using the Retool CLI
- Appears in Retool like any native component
- Can contain multiple reusable components
- Supports nearly any npm package compatible with browsers

This repo provides the project structure, tooling, and example components to help you get started.

---

## Quick Start

### Prerequisites

- Node.js v20 or later
- Admin permissions in Retool
- A Retool API access token with read and write scopes for Custom Component Libraries

> If you are running self-hosted Retool, setting the `ALLOW_SAME_ORIGIN` and `SANDBOX_DOMAIN` environment variables is recommended.

---

### Step 1 — Clone this repository

```bash
git clone https://github.com/tryretool/custom-component-collection-template your-component-name
cd your-component-name
```

Or click **Use this template** at the top of this page to create your own copy.

---

### Step 2 — Install dependencies

```bash
npm install
```

---

### Step 3 — Log in to Retool

```bash
npx retool-ccl login
```

You will be prompted for your Retool instance URL and an API token. Generate a token in Retool under **Settings > API tokens** with read and write access for Custom Component Libraries.

---

### Step 4 — Initialize your library

```bash
npx retool-ccl init
```

This prompts for a library name and description, writes metadata to `package.json`, and registers your library with your Retool instance.

---

### Step 5 — Build your component

Rename the `HelloWorld` component in `src/components/` or create a new folder for your component:

```
src/
  components/
    YourComponent/
      YourComponent.tsx
      YourComponent.test.tsx
      README.md
  index.tsx
```

All components exported from `src/index.tsx` are synced to Retool.

---

### Step 6 — Start dev mode

```bash
npx retool-ccl dev
```

This syncs your changes to Retool every time you save a file. Open any Retool app to test your component in real time.

---

### Step 7 — Add your component to a Retool app

1. Open your Retool app
2. Click **Add components**
3. Find your components under your library's label
4. Drag onto the canvas

> You may need to refresh Retool for newly added components to appear.

---

## Development Guidelines

- One component per folder inside `src/components/`
- Always export from `src/index.tsx`
- Prefer explicit props over implicit state
- Avoid hardcoded styles — use CSS modules or props-driven styling
- Include tests for each component
- Document usage in a `README.md` inside each component folder

---

## Testing

```bash
npm test
```

---

## Deploying to Production

When your component is ready:

```bash
npx retool-ccl deploy
```

This pushes an immutable version of your library to Retool. To use your library in public Retool apps, go to **Settings > Custom Component Libraries** and enable public access.

### Switching versions

To pin an app to a specific deployed version:

1. Open **Custom Component settings** in your app
2. Select the version you want
3. Refresh if necessary

---

## Limitations

- Custom component libraries are not supported in Retool Mobile or PDF exports
- Library descriptions cannot be edited after creation
- Individual revisions cannot exceed 10MB (30MB in dev mode)
- Only JavaScript and CSS files are loaded at runtime — other file types in the bundle are ignored
- Organizations have a 5GB total storage limit across all libraries

---

## Submitting to the Community Gallery

Built something useful? Share it with the Retool community by submitting it to the [Custom Component Gallery](https://customcomponents.retool.com/).

**The process has two steps — both are required:**

### 1. Open a pull request to the gallery repository

Add your component to the [custom-component-gallery](https://github.com/tryretool/custom-component-gallery) repository. See [CONTRIBUTING.md](https://github.com/tryretool/custom-component-gallery/blob/main/CONTRIBUTING.md) for the required folder structure and file format.

### 2. Submit the gallery form

Go to [customcomponents.retool.com](https://customcomponents.retool.com/) and click **Submit Component**. This is where you provide your cover image, description, and tags that appear on your gallery card.

Your component will not be reviewed until both steps are complete. Once submitted, our team reviews it and you will receive an email with the decision.

---

## Resources

- [Retool Custom Component Library Docs](https://docs.retool.com/apps/guides/custom/custom-component-libraries)
- [Retool Community Forum](https://community.retool.com)
- [Community Gallery](https://customcomponents.retool.com/)
- [Gallery Contributing Guide](https://github.com/tryretool/custom-component-gallery/blob/main/CONTRIBUTING.md)
