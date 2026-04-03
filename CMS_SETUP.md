# Decap CMS + Netlify Setup

This project now includes a Decap CMS admin at `/admin/` and a data-driven event slide backed by `docs/data/events.json`.

## What is already wired

- Netlify publish directory: `docs`
- Decap admin entry: `docs/admin/index.html`
- Decap config: `docs/admin/config.yml`
- Event content file: `docs/data/events.json`
- Uploaded media folder: `docs/uploads/`

## Netlify setup

1. Create or connect this repository to a Netlify site.
2. Confirm the publish directory is `docs`.
3. Open `Project configuration -> Identity` and enable Identity.
4. Open `Project configuration -> Identity -> Services -> Git Gateway` and enable Git Gateway.
5. In `Identity -> Registration`, switch to `Invite only`.
6. Add the admin users who should be allowed to edit event content.
7. Open `https://YOUR_SITE/admin/` and log in.

## How event slides work

- The slideshow automatically inserts enabled event slides after `5.mp4`.
- Each event entry can include:
  - title
  - date
  - location
  - description
  - duration
  - one or more images
- To publish an event slide, set `Enabled` to `true`.

## Important note

Netlify currently documents both Identity and Git Gateway as deprecated for new setups, although they still function for existing supported sites. If you run into Netlify-side limitations later, the next-best migration path is usually:

- keep Decap CMS
- keep Netlify hosting
- replace Netlify Identity / Git Gateway auth with a different supported auth flow
