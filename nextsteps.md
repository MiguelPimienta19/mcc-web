Project setup

New Next.js 14 + TypeScript + Tailwind v4 app.

Global theme tokens added (tokens.css) for brand greens, shadows, radii, etc.

Tailwind config extended inline via @theme.

Database (Supabase)

Tables:

events: id, title, description, location, starts_at, ends_at, rrule.

profiles: stores id (user id) and role (admin | member).

admin_allowlist: stores approved emails for admins.

RLS (Row-Level Security) in place:

Anyone: can insert events.

Only admin: can update/delete events.

Auth flow

Magic link sign-in (via Supabase).

Callback route exchanges code → sets session cookie → syncs role (profiles.role).

Middleware protects /admin: only admins can access.

Sign-in page sends link with redirect to /auth/callback → /admin.

UI

Calendar (react-big-calendar) integrated with brand theme:

Shows events from Supabase.

Fetches only the visible range (month/week/day).

Week/day views restricted to 9 am → 8 pm.

Click an event → details panel with Add to Google + Download .ics.

Admin page:

Lists all events.

Quick “+ Add Event” button.

Edit form (inline).

Delete button (with confirm).

Navbar:

Shows Sign in if logged out.

Shows email, Sign out, and Admin link if logged in as admin.

Backend routes

/api/events: GET (by range), POST (create).

/api/events/[id]/ics: generates .ics file for one event.

/api/auth/sync-role: syncs role after sign-in.

Middleware checks admin role on /admin.

/api/debug/session: quick test route to check { email, role }.

🎯 What we are trying to do (end goal)

Deliver a modular, industry-standard event hub for MCC:

Public landing page with a nice calendar.

Anyone (signed-in or not) can add events.

Admins (allowlisted) can manage events: edit, delete, curate.

Export options: Google Calendar button + .ics download.

Clean, modern UI matching MCC’s brand colors.

🛠️ What we still have left to do

Polish Admin CRUD

Edit form works, but UX can be nicer (save confirmation, better validation).

Add “create event” form (with title, location, times) instead of “Quick Add”.

Use Zod + React Hook Form to validate inputs (industry standard).

Authentication polish

Right now magic link is working but a bit confusing.

Need clear “You’re signed in” indicator (navbar, toast, etc).

Optionally allow Microsoft OAuth for @uoregon.edu emails later.

Landing page (public view)

Right now it’s just the calendar + a quick create form.

Add a proper hero section (title, description, call to action).

Place calendar below the fold.

Optionally let non-signed-in users add events (we need to confirm requirement).

Event details page (/event/[id])

Right now details show inline in a panel.

Create a standalone event page for sharing (/event/123).

Include Add to Google / .ics download.

Deployment

Deploy on Vercel.

Hook to Supabase prod instance.

Add custom MCC domain if needed.

Stretch (optional later)

Kiosk mode (large daily calendar view for display screens).

Multi-calendar or tags (e.g. “club events”, “MCC events”).

Admin invites instead of manually editing allowlist.

Styling upgrades (motion, transitions, skeleton loading).

🚦 Next concrete step

Right now: auth + admin CRUD loop is almost working.

Next task: test /api/debug/session → confirm your email shows up as role: "admin".

If ✅: your admin page will work reliably.

If ❌: we’ll fix sync-role logic so your account gets promoted properly.