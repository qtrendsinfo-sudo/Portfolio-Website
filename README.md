# R & L Studio

Web platform and studio portfolio for **R & L Studio** — a digital technology and product engineering studio.

> *"We don't just build software. We build digital experiences."*

---

## Overview

- **Interactive 3D Hero (`HeroScene3D`)**: Custom Three.js spatial sculpture representing the engineering progression from idea to connected system and shipped product, with pointer parallax and scroll-linked depth.
- **Portfolio Showcase (`WorkSection`)**: Editorial case-study presentations for **COD Finder** and **Ipay Finder** with interactive presentation frames, device mockup views, technology stacks, distribution links, and live Firestore-backed portfolio sync (automatically showing published projects).
- **Project Inquiry Pipeline (`ContactSection`)**: Client-side validated project brief intake backed directly by Cloud Firestore (`inquiries` collection) with instant reference ID confirmation.
- **Authentication (`/login`, `/signup`, `/forgot-password`)**: Firebase Authentication supporting Email/Password sign-up/sign-in, Google Sign-In, email verification links, and password reset.
- **Protected Admin Console (`/admin`)**: Authenticated, email-verified studio management dashboard for creating, editing, publishing/unpublishing, and deleting portfolio projects as well as triaging incoming project inquiries (`new`, `reviewed`, `archived`).

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4
- **3D Graphics & Motion**: Three.js, Motion, Lucide React
- **Backend Services**: Firebase Authentication & Cloud Firestore Web SDK
- **Security Validation**: `@firebase/eslint-plugin-security-rules` for `firestore.rules`

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` (or `.env.local`) and provide your Firebase Web SDK project values:

```bash
cp .env.example .env
```

Never commit `.env` or `.env.local` files to version control.

#### Required Firebase Environment Variables (Names Only)

When deploying outside an environment that provides `firebase-applet-config.json`, configure these Vite client environment variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_DATABASE_ID` *(required when targeting a named Firestore database rather than `(default)`)*

`src/lib/firebase.ts` prioritizes `VITE_FIREBASE_*` environment variables and falls back to `/firebase-applet-config.json` when present.

### 3. Run the development server

```bash
npm run dev
```

The application serves on `http://localhost:3000`.

---

## Firebase Setup Requirements

1. **Authentication Providers**:
   - Enable **Email/Password** in Firebase Console → Authentication → Sign-in method.
   - Enable **Google** sign-in provider and configure a support email.
2. **Authorized Domains**:
   - Add your production domain (e.g., `your-domain.com`, `*.vercel.app`, or custom domain) under **Authentication → Settings → Authorized domains** before testing Google Sign-In in production.
3. **Cloud Firestore**:
   - Ensure the target Firestore database (`VITE_FIREBASE_DATABASE_ID` or provisioned database ID) exists in the Firebase project.
   - Deploy `firestore.rules` to enforce server-side access control:
     - Public reads on `projects` are strictly limited to documents with `published == true`.
     - Public writes on `inquiries` are validated strictly for new submissions (`status == 'new'`, `createdAt == request.time`).
     - User profile documents (`users/{userId}`) are owner-scoped (`list` and `delete` disabled).
     - Draft reads, project writes, and inquiry management require an authenticated, email-verified studio administrator token.
4. **Lint & Deploy Firestore Rules**:

```bash
npx eslint firestore.rules
firebase deploy --only firestore:rules
```

---

## Build & Verification Commands

Run TypeScript type checking, unused symbol checks, Firestore security rules linting, and Vite production build:

```bash
npm run lint
npx tsc --noEmit --noUnusedLocals --noUnusedParameters
npx eslint firestore.rules
npm run build
```

Preview the production bundle locally from `dist/`:

```bash
npm run preview
```

---

## Admin Routes

All studio management views are isolated behind authentication, email-verification checks, an explicit admin identity check (`AdminGuard`), and matching Firestore rules:

- `/admin` — Studio overview metrics and quick actions
- `/admin/projects` — Manage all published and draft portfolio projects (including seeding initial showcase entries)
- `/admin/projects/new` — Create a new portfolio project
- `/admin/projects/:id/edit` — Edit project details, gallery slots, store links, and publish state
- `/admin/inquiries` — Review, update status (`new` / `reviewed` / `archived`), or delete client project inquiries

Unauthenticated visitors to `/admin/*` are redirected to `/login?next=...`. Authenticated non-admin accounts receive a `403 Access Denied` screen and are blocked from all admin reads/writes by `firestore.rules`.

---

## Deployment & SPA Routing Notes

This application uses client-side History API routing (`/`, `/login`, `/signup`, `/forgot-password`, `/admin/*`). Static hosts must rewrite unknown routes to `/index.html` so direct URL navigation and browser refreshes work cleanly:

- **Vercel**: Configured via `vercel.json`
- **Netlify / Cloudflare Pages**: Configured via `public/_redirects` (copied into `dist/_redirects` during `npm run build`)
- **Firebase Hosting**: Configured via `firebase.json` (`hosting.public = "dist"`, SPA rewrite + Firestore rules mapping)

### Pre-Push Checklist

- Confirm `.env` / `.env.local` and any service-account JSON keys are excluded (covered in `.gitignore`)
- Confirm production domains are added to Firebase Auth **Authorized domains**
- Confirm `firestore.rules` is deployed to the target Firebase project
- Verify `npm run build` completes cleanly and check login, Google Sign-In, public inquiry submission, and `/admin` workflows against the live Firebase project
