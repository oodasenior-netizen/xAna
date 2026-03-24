# Goddess Annaleese Creator Platform

Official single-creator content platform built with Next.js App Router.

## Core Experience

- Animated splash screen with dive-in logo and zoom-out transition.
- Creator entry portal with bio, niches, previews, and subscription pricing.
- Subscriber app with Daily Feed, Inbox, Gallery, and Store Drops.
- Ownership-aware unlocks for PPV and one-time purchases.
- Private creator portal with dashboard, analytics, storage, studio, and admin controls.

## Security Model

- Signed token cookie (HTTP-only, strict same-site, secure in production).
- Middleware route protection for `/app/*` and `/creator/*`.
- Server-side guards per route segment.
- Creator portal is accessible only with creator credentials.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set strong values for `AUTH_SECRET` and `CREATOR_PASSWORD`.
3. Install dependencies.
4. Start development server.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Routes

- `/` splash animation
- `/entry` creator entry + subscription and creator login
- `/app` subscriber home (Daily Feed)
- `/app/inbox`
- `/app/gallery`
- `/app/store`
- `/creator`
- `/creator/analytics`
- `/creator/storage`
- `/creator/studio`
- `/creator/admin`
