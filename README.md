# Universal Webinar

A modern, mobile-friendly webinar platform — host live Q&A with chat, reactions, and on-demand speakers.

Built as an installable PWA. One admin hosts a single live webinar. Guests join with a name and email, watch the stream, chat with emoji reactions and floating hearts, and can request to come on camera for live Q&A. The admin moderates everything: mute, kick, ban, delete messages, screen-share, lock the room with a PIN.

## Stack

- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS
- **PWA:** `vite-plugin-pwa` (Workbox)
- **UI:** shadcn/ui primitives + lucide-react icons
- **Routing:** React Router v6
- **Realtime + DB + Auth + Storage:** Supabase *(wires up in Phase 2)*
- **Video/audio:** LiveKit Cloud *(wires up in Phase 4)*
- **Hosting:** Vercel free tier

## Current status: Phase 1 — branded PWA shell

The app boots, the routes are wired, the brand is in place, and it can be installed to a phone home screen. Pages are interactive stubs — backends connect in later phases.

| Route | Page |
| --- | --- |
| `/` | Landing |
| `/w/:slug` | Guest join (name + email) |
| `/w/:slug/live` | Guest live room (video + chat stubs) |
| `/admin/login` | Admin sign-in |
| `/admin` | Admin dashboard |
| `/admin/w/:slug` | Admin control room |

## Local development

Requires **Node 20+**.

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

To install on iOS Safari or Android Chrome: open the deployed URL, tap *Share → Add to Home Screen*.

## Build

```bash
npm run typecheck   # tsc --noEmit
npm run build       # produces dist/
npm run preview     # serve the production build locally
```

## Deploy

The fastest path is Vercel:

1. Push to GitHub (this repo).
2. Go to <https://vercel.com/new>, import the repo, accept defaults.
3. Click **Deploy**. Custom domain can be added later under *Project Settings → Domains*.

Static `dist/` output is portable — it can also be hosted on any static host (Netlify, Cloudflare Pages, the user's shared hosting via FTP, etc.).

## Roadmap

This is built in phases. Each phase ends with a verification checkpoint before the next begins.

- **Phase 1** — Branded PWA shell *(current)*
- **Phase 2** — Supabase + admin auth + create webinar
- **Phase 3** — Join flow + realtime chat + reactions
- **Phase 4** — LiveKit video (admin broadcasts)
- **Phase 5** — Speaker requests + admin moderation
- **Phase 6** — PIN lock + screen-share polish
- **Phase 7** — Recording (LiveKit Egress)
- **Phase 8** — PWA polish, mobile QA, custom domain

## Project structure

```
src/
  components/
    ui/                shadcn primitives (Button, Input, Card, Dialog, Label)
    Layout.tsx         Public + admin layouts
    Logo.tsx           Brand mark
  lib/
    brand.ts           Color tokens
    utils.ts           cn() helper
  pages/
    Landing.tsx
    Join.tsx
    Live.tsx
    NotFound.tsx
    admin/
      Login.tsx
      Dashboard.tsx
      Control.tsx
  index.css            Tailwind layers + base
  App.tsx              Routes
  main.tsx             Entry
public/
  favicon.svg
  apple-touch-icon.png
  icons/               PWA icons (192, 512, maskable)
```

## License

MIT
