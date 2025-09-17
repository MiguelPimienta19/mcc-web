## MCC Event Hub — University of Oregon Multi-Cultural Center

## Overview
A focused event platform for the UO MCC that puts discovery and curation in one place. I built this to give student leaders and MCC staff a clean public calendar, fast admin tools, a TV kiosk mode for on-site visibility, and a lightweight AI assistant for drafting meeting agendas.

**My role:** Student developer and product lead. I owned product decisions, data model, access control, and MCC-facing UX. I paired with AI inside Cursor for scaffolding, code reviews, and UX copy so I could move fast without sacrificing structure.

**Why this project matters to me:** As a first-generation American and first-generation college student, the MCC has been a space where I’ve felt community and support. Building this project was my way of giving back — reducing friction for student orgs and empowering MCC staff with a tool that directly improves visibility and access. This is the kind of product work I enjoy: clear user need, visible impact, and tight scope.

**Live demo:** [mcc-webapp.vercel.app](https://mcc-webapp.vercel.app/)   

---

## Features
- **Public calendar** with week, month, and day views  
- **Quick add on the homepage** for title, start, and end  
- **Admin dashboard** to list, edit, and delete events, plus manage the admin allowlist  
- **Kiosk mode** for TV displays showing **Today’s events**  
- **Add to Calendar** via Google Calendar link and downloadable `.ics`  
- **AI Meeting Assistant** that drafts structured agendas  

---

## Impact
- Centralizes event discovery for MCC and student orgs  
- Speeds up admin curation and maintenance  
- Improves on-site visibility through kiosk displays  
- Introduces responsible AI to help student leaders draft agendas  

---

## Tech Stack
- **Next.js 15** (App Router), **React 19**, **TypeScript**  
- **Tailwind CSS v4** with tokens-based branding  
- **Supabase** for database, auth helpers, and **Row-Level Security**  
- **react-big-calendar** + **date-fns**  
- **react-hook-form** + **zod** for validation  
- **ics** for file generation, custom Google Calendar URLs  
- **OpenAI API** for the agenda assistant  
- **Vercel** for deployment (intended)  

**Scripts:** `dev`, `build`, `start`, `lint`

---

## Architecture
### Pages (App Router)
- `/` — Landing + calendar + quick add form  
- `/admin` — Admin dashboard (middleware-protected)  
- `/signin` — Email check for admin allowlist  
- `/kiosk` — TV-friendly **Today** schedule  
- `/chatbot` — AI agenda assistant  

### Selected API Routes
- `GET /api/events?start=ISO&end=ISO` — List events by range  
- `POST /api/events` — Create event  
- `PUT /api/events/[id]` — Update event  
- `DELETE /api/events/[id]` — Delete event  
- `GET /api/events/[id]/ics` — Generate `.ics` download  
- `GET /api/admin/list` — List allowlisted admins  
- `POST /api/admin/add` — Add admin email to allowlist  
- `POST /api/admin/remove` — Remove admin email from allowlist  
- `POST /api/auth/check-admin` — Verify email is allowlisted  
- `POST /api/chatbot` — OpenAI-powered agenda responses  
- `GET /api/debug/session` — Show session + role info (dev utility)  

### Access Control
- Middleware checks an `admin-email` cookie and re-validates against Supabase `admin_allowlist` on every `/admin` request  
- Supabase RLS enforces data-layer permissions  
- Flow: `/signin` → verify email via API → set cookie (client) → `/admin`  

---

## Setup
1. `npm install`  
2. `npm run dev`  
3. Create tables in Supabase (see **Database**) and enable RLS  
4. Set environment variables (see **Environment Variables**)  
5. Optional: deploy to Vercel  

**Branding:** Tailwind v4 tokens and `tokens.css` define the MCC color palette and accessible contrast.

---

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `OPENAI_API_KEY`  
- `NEXT_PUBLIC_SITE_URL` (e.g., `http://localhost:3000`)  

---

## Database
### Tables
- `events`: `id` uuid, `title` text, `description` text, `location` text, `starts_at` timestamptz, `ends_at` timestamptz, `rrule` text  
- `profiles`: `id` uuid (user id), `role` text `admin|member`  
- `admin_allowlist`: `email` text primary key  

### Minimal SQL
```sql
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  rrule text
);

create table if not exists public.admin_allowlist (
  email text primary key
);
```

---

## RLS Concept
- Only admins can update or delete events
- Insert can be open or restricted per MCC policy
- Policies reference `admin_allowlist` or `profiles.role = 'admin'`

## Usage
- Browse the public calendar on `/`
- Quick-add an event from the homepage
- Sign in on `/signin` to check allowlist and set the `admin-email` cookie
- Manage events and admins on `/admin`
- Display a TV with `/kiosk`
- Generate calendar files via `GET /api/events/[id]/ics`
- Draft meeting agendas on `/chatbot`

## Roadmap
- Rich create and edit forms with stronger validation
- Shareable event pages at `/events/[id]`
- Optional OAuth for `@uoregon.edu`
- Filters and tags for MCC vs student club events
- Motion, skeleton loading, and a11y polish

## About and AI Collaboration
I used AI in Cursor for scaffolding, code review, and initial copy. I drove the product work: data model, access control, UX, and what shipped first.

For me, this project wasn’t just technical — it was personal. As a first‑gen student and first‑gen American, the MCC has always been more than a building; it’s where belonging and identity meet. By collaborating with AI, I accelerated the coding, but the vision and decisions were mine. I wanted to ensure the MCC had a tool built with intention, usability, and respect for the community it serves.

## Contact
Miguel Pimenta · University of Oregon ’26  
Email: Miguelpimienta19@gmail.com 
