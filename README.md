<div align="center">

# ❤ SnapBiodata

### Create a beautiful **marriage biodata** in minutes — free & open source.

Pick a template, fill your details, add a photo, then **download a print-ready PDF** or **share a private link**. No sign-up. No ads. Your data stays in your browser until you choose to publish.

[![License: MIT](https://img.shields.io/badge/License-MIT-c79a3a.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-9b1c3a.svg)](./CONTRIBUTING.md)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

**🌐 Live:** https://snapbiodata.com  ·  **🤝 [Contribute](./CONTRIBUTING.md)**

</div>

---

## ✨ Features

- **5 beautiful templates** — Traditional, Elegant, Modern, Floral & Royal (with hand-drawn SVG ornaments).
- **Live preview** — your A4 biodata updates as you type.
- **Customizable rows** — remove/re-add predefined rows and add, edit, move or delete custom rows in Personal, Family and Contact Details. Duplicate labels and custom ordering work in every template and PDF.
- **Photo upload** — looks great on every template, shrunk automatically for fast sharing.
- **Download PDF** — crisp, print-ready A4 in one click.
- **Share a link** — publish a clean URL like `snapbiodata.com/your-name` to send on WhatsApp.
- **Private by design** — details stay in your browser until you publish; published pages are `noindex`.
- **Free & open source** — MIT licensed, contributions welcome.

## 🧱 Tech stack

| | |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Storage | [Upstash Redis](https://upstash.com) in prod · local file fallback in dev |
| Hosting | [Vercel](https://vercel.com) |

## 🚀 Getting started

**Prerequisites:** Node.js **20+**.

```bash
git clone https://github.com/pythonsst/snapbiodata.git
cd snapbiodata
npm install
npm run dev
```

Open **http://localhost:3000**. Publishing works locally with **zero setup** — it saves to a `.data/` folder until you configure Redis (see Deployment).

## 📂 Project structure

```
src/
├── app/
│   ├── page.tsx          # Landing page
│   ├── create/           # The biodata editor
│   ├── [slug]/           # Public published biodata (snapbiodata.com/<name>)
│   └── api/publish/      # Saves a biodata and returns its slug
├── components/
│   ├── BiodataForm.tsx   # The form
│   ├── BiodataPreview.tsx# Scaled A4 live preview
│   ├── PublishDialog.tsx # Publish & share
│   └── templates/        # One file per template + a registry (index.tsx)
├── data/biodata.ts       # ⭐ Single source of truth: fields + sample data
├── lib/                  # store (Redis/file), slug, image helpers
└── config.ts             # Site name, URL, GitHub link
```

## 🎨 Add a new template (great first contribution!)

1. Create `src/components/templates/MyTemplate.tsx` — export a component that takes `{ data }` and renders the A4 page. Use the helpers in `./shared` (`renderedSections`, `displayName`) so it stays in sync with the form automatically.
2. Register it in `src/components/templates/index.tsx`.
3. Run `npm run dev`, open `/create`, pick your template, and check the live preview + PDF.

That's it — the form, photo, publish and PDF all work with your template for free. See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Customize your rows

Use **Remove** next to a field to delete the row and its value. Use **Re-add
predefined row** in that section to restore an empty field in its current order
(or its original position if no rows have moved). **Add custom row** lets you
enter a label and an optional multiline value. New rows start at the end;
**Move up** / **Move down** can place a custom row anywhere in its section,
including before or between predefined rows. The live preview, all templates,
PDFs and published records use the same order. Custom labels and values remain
editable, and duplicate labels are supported. Blank values are omitted
from the preview and PDF; a custom label is required before downloading or
publishing. **Clear all** and **Load sample** reset the rows to the default layout.

Edits remain in browser memory (there is no draft save/load or reload recovery).
The existing publish API preserves row customization in stored records, while
older published records still use the default row order. Unknown, duplicate or
wrong-section order references are ignored, and unlisted rows follow in default
order. Sharing remains gated
as described below; this does not enable publishing or send edits to a server.

## ☁️ Deployment

Deploy on [Vercel](https://vercel.com/new) (Next.js auto-detected). For the **share-link** feature to persist in production, add a Redis store:

1. Vercel project → **Storage** → add **Upstash for Redis** (free) → connect.
2. It injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` (see `.env.example`).
3. Redeploy.

Without Redis the editor and PDF still work; only publishing needs it.

> **Note on sharing:** the build-and-share-a-link feature is fully implemented
> (`src/app/api/publish`, `src/app/[slug]`, `src/lib/store`) but currently gated
> behind a small "support" prompt because it needs a paid Redis store. Once you
> connect Upstash (above), wire the editor's share button to `/api/publish` to
> turn it on. It's intentionally dormant, not dead code.

## 🤝 Contributing

We'd love your help — new templates, **languages/translations**, bug fixes, and ideas all welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) and open a PR. Be kind (see the [Code of Conduct](./CODE_OF_CONDUCT.md)).

## 📄 License

[MIT](./LICENSE) — free to use, modify, and distribute. If SnapBiodata helped you, a ⭐ on GitHub means a lot.
