# Nihal Portfolio — web

The public site and the private dashboard for **Md. Nihal Uddin Bijoy**, built as a real
full stack application: every section is rendered from MongoDB content, and everything on the
page can be changed from the private dashboard without a deploy.

- Public site — gradient dark/light theme, 9 project case studies, an AI assistant that answers
  for Nihal.
- Dashboard — hidden route (`/control-centre`), Firebase sign-in with email/password, Google or
  GitHub plus a server side UID allowlist, generic CRUD for 14 content types, a contact inbox,
  an ImgBB media library, a "Fill with AI" button that drafts any form with Gemini, and a Site
  settings page for theme-aware logos, the favicon and per-section visibility.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) with `output: "standalone"` |
| UI runtime | React 19 |
| Styling | Tailwind CSS 4 (`@theme inline` tokens, no config file) |
| Components | HeroUI v3 (`@heroui/react` + `@heroui/styles`) |
| Theming | `next-themes` with `class` + `data-theme`, dark by default |
| Motion | Lenis smooth scroll, IntersectionObserver reveals, CSS gradients |
| Auth (client) | Firebase Web SDK |
| Data | `lib/api.ts` (server reads) and `lib/admin.ts` (authenticated dashboard) |

## Design system

The palette is sampled from the reference screenshots and lives in `app/globals.css`:

- dark theme `#030A12` / light theme `#EEF4FA`
- accent gradient `#22D3EE → #38BDF8 → #0EA5E9` exposed as `.grad-accent`, `.text-gradient`,
  `.rule-grad`, `.border-grad`
- surface, border and text tokens are bridged into Tailwind with `@theme inline`, and into
  HeroUI through the same CSS variables — so plain Tailwind classes and HeroUI components
  share one palette
- page background is a fixed radial + linear gradient (`.panel`, `.panel-alt`, `.grid-backdrop`,
  `.glow-soft`, `.reveal` are the shared building blocks)

Both themes are driven by the same tokens, so a component never needs a `dark:` variant for
colour, only for the few cases where contrast demands it.

## Routes

| Route | Type | Notes |
| --- | --- | --- |
| `/` | server, ISR | assembles every visible section from `/api/v1/portfolio` |
| `/projects/[slug]` | server, ISR | case study: gallery, features, challenges, stack, related work |
| `/blog/[slug]` | server, ISR | post body rendered from a small block parser |
| `/robots.txt`, `/sitemap.xml` | server | disallow the dashboard, add projects and posts |
| `/control-centre/login` | client | sign in with email/password, Google or GitHub |
| `/control-centre/register` | client | create a Firebase account (access still needs the allowlist) |
| `/control-centre` | client, gated | overview: counts, latest messages, recent projects |
| `/control-centre/site-settings` | client, gated | brand logos per theme, favicon, component visibility |
| `/control-centre/[entity]` | client, gated | generic CRUD (table + drawer, or one form for singletons) |
| `/control-centre/messages` | client, gated | inbox with status workflow |
| `/control-centre/media` | client, gated | upload, import from URL, copy URL, delete |

The dashboard base path lives in `lib/admin-routes.ts` (`ADMIN_BASE`). It is deliberately not
`/admin`, so scanning for the conventional path finds nothing — renaming it means renaming
`app/control-centre` and the constant together.

Section visibility comes from the `sections` collection, so hiding a component in the dashboard
removes it from the page (and the numbering closes the gap automatically).

## Structure

```
app/
├── page.tsx                  public home: fetch once, render visible sections
├── projects/[slug]/          case study page
├── blog/[slug]/              post page
├── control-centre/           private dashboard (auth, gate, entity CRUD, site settings,
│                             inbox, media)
├── robots.ts / sitemap.ts    SEO routes
└── globals.css               tokens, gradients, utilities, keyframes
components/
├── site/                     navbar, hero, about, stats, skills, services, projects,
│                             showcase, journey, education, testimonials, blog, contact,
│                             footer, chat widget
├── admin/                    auth provider, data provider, shell, field editor,
│                             auth card, ai fill panel, entity manager
└── ui/                       icon registry, reveal, theme toggle, back to top, ...
lib/
├── api.ts                    public reads (server), overridable via API_URL_INTERNAL
├── admin.ts                  authenticated admin client
├── admin-routes.ts           ADMIN_BASE + adminHref()
├── firebase.ts               lazy web SDK init
├── types.ts                  API types
└── utils.ts                  cn, dates, slugify, bytes, ...
```

## Environment

Create `portfolio/.env.local`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | public API origin, `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | yes | canonical origin used by metadata, sitemap and robots |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | for dashboard | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | for dashboard | `<project>.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | for dashboard | Firebase project id |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | for dashboard | Web app id (`1:…:web:…`) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | no | only needed for push |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | no | only needed for storage |
| `API_URL_INTERNAL` | Docker only | server-side API origin inside the compose network |

The public site keeps working without any Firebase value; only the dashboard needs them, and the
login page explains exactly which variables are missing. The API must also list your Firebase
UID in `ADMIN_UIDS` — the browser is never the authority on who is an admin.

`API_URL_INTERNAL` exists because a container cannot reach `localhost:5000` of the host:
server rendering uses the compose service name (`http://api:5000/api/v1`) while the browser
keeps using the public `NEXT_PUBLIC_API_URL`.

### Where to get the Firebase values

The six `NEXT_PUBLIC_FIREBASE_*` variables are the **public web config** of the *same* Firebase
project the API authenticates against (this site uses project `ultra-badge-403914`). They are safe
to expose — being able to see them does not grant dashboard access; the server still has to verify
the ID token **and** find your UID in `ADMIN_UIDS`.

1. Open <https://console.firebase.google.com> and select the project.
2. **Project settings** (gear icon, top left) → **General** tab → scroll to **Your apps**.
   - If a Web app (`</>` icon) already exists, click it. If not: **Add app → Web**, give it a
     nickname, **Register app**.
3. In **SDK setup and configuration** turn off "Use a configuration snippet" if shown, and copy
   the `firebaseConfig` object. Paste each value into `.env.local`:

   | `firebaseConfig` key | `.env.local` variable |
   | --- | --- |
   | `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
   | `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
   | `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
   | `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |
   | `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
   | `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |

   `isFirebaseConfigured()` only needs `apiKey`, `authDomain`, `projectId` and `appId`; the last
   two are optional unless you use Cloud Messaging / Firebase Storage.
4. **Authentication → Sign-in method**: enable **Email/Password** (and **Google** / **GitHub** if
   you want those buttons on the login page).
5. **Authentication → Users**: create your admin (or use `/control-centre/register`), then copy
   that **User UID** into the server's `ADMIN_UIDS`. Without this the sign-in succeeds but the API
   rejects the session.
6. Keep the frontend `NEXT_PUBLIC_FIREBASE_PROJECT_ID` identical to the server's
   `FIREBASE_PROJECT_ID` — they must be the same project or tokens will not verify.

> **Restart `npm run dev` after editing `.env.local`.** `NEXT_PUBLIC_*` values are inlined into the
> client bundle at server start, so the running dev server keeps the old (empty) config until you
> restart it. In a Docker/Vercel build the same rule applies: change the value, then rebuild.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000 (API expected on :5000)
npm run typecheck
npm run build && npm start
```

The API must be running first (`portfolio-server`, `npm run dev`, then `npm run seed` once) or
the home page shows a styled "Content API unreachable" panel instead of failing.

## Docker

```bash
docker build -t nihalxofficial/portfolio-web:release-2 \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1 \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=… \
  .
docker push nihalxofficial/portfolio-web:release-2
```

`NEXT_PUBLIC_*` values are inlined at build time, so changing them requires a rebuild. The
runtime image is the Next.js standalone output: `node server.js`, non-root user, no dev
dependencies.

Orchestration lives in the repository root:

```bash
docker compose --env-file portfolio/.env.local build
docker compose up -d
docker compose ps          # both services should report healthy
```

## Dashboard

1. Open `/control-centre/login` — email/password, Google or GitHub (enable both providers in
   Firebase → Authentication → Sign-in method).
2. No account yet? `/control-centre/register` creates one. Registration only creates the Firebase
   user: the rejected sign-in message prints the exact UID to paste into `ADMIN_UIDS`.
3. The browser keeps the ID token; the API verifies it and checks the allowlist
   (`GET /api/v1/auth/session`). `GET /api/v1/auth/status` reports the identity *without* the
   allowlist so the login screen can explain a rejection.
4. Everything else follows the schema returned by `/api/v1/admin/content/describe`: the
   sidebar, the tables and the forms are generated from the registry, including nested
   objects, string lists and repeatable rows.
5. "Fill with AI" sends rough notes plus the current draft to Gemini and merges the result
   into the form — nothing is saved until you press Save.

### Site settings

`/control-centre/site-settings` holds what the generic form cannot express:

- **Brand logos** — separate navbar and footer images for the light and dark theme, plus the
  favicon and the logo `alt` text. Each slot uploads through the media API and stores only the
  URL; empty slots fall back to the gradient initials mark, and the navbar/footer text block
  hides itself as soon as a logo exists.
- **Homepage components** — one switch per row of the `sections` collection. Toggling writes
  `isVisible` immediately, so the hero, about, stats, skills, projects, showcase, journey,
  education, certifications, blog and contact blocks can be hidden without deleting content.

The base path is unlisted: it is not linked from the public site, excluded from `robots.txt`
and the sitemap, and `noindex` is set in `app/control-centre/layout.tsx`.

## Release tags

| Image | Contents |
| --- | --- |
| `nihalxofficial/portfolio:release-1` | original single page portfolio (frontend only) |
| `nihalxofficial/portfolio-api:release-2` | backend API |
| `nihalxofficial/portfolio-web:release-2` | this app (public site + dashboard) |
