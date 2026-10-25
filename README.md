# Common Ground

A group project workspace built with Next.js, Neon Postgres, and Neon Auth, prepared for Vercel deployment.

## What is included

- A project grid with per-project progress and lead/member filters.
- Independent project memberships, so a user can lead one project and contribute to another.
- Lead-controlled task creation, assignment, deadlines, priorities, and sprint planning.
- A five-stage board: backlog, to do, in progress, in review, and done. Assignees can update their own task status.
- A project overview and month calendar, with sprint dates and task deadlines.
- Shared notes and shoutouts, plus private one-to-one conversations between project peers.
- Email-bound invitation links that expire after seven days. Invitations are shared manually; the app does not send invitation emails.
- Email/password registration and sign-in through managed Neon Auth.
- An explicitly labeled example workspace stored only in the visitor’s browser. Authenticated work is stored in Neon and refreshed every 15 seconds.

## Resources

- GitHub: https://github.com/joyceful-lee/common-ground (private)
- Vercel project: `common-ground`, team `leejoyce21-7656`
- Neon project: `divine-fire-27110888`, production branch `br-divine-tree-akdohonq`, database `common_ground`

## Local development

Use Node.js 22.13 or later. Install packages with `npm ci`. The committed lockfile pins the installed versions. The `.npmrc` uses legacy peer resolution because the current Neon Auth beta has conflicting transitive Better Auth UI peer requirements; the application uses its auth client and server adapter directly.

Create an ignored `.env.local` from `.env.example` and configure:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Server-only Neon Postgres connection string |
| `NEON_AUTH_BASE_URL` | Managed Neon Auth endpoint |
| `NEON_AUTH_COOKIE_SECRET` | A cryptographically random secret of at least 32 characters |

`node scripts/prepare-local.mjs` generates a cookie secret when one is missing. Never commit `.env.local` or share these values in client-side variables.

The initial schema in `db/schema.sql` is already applied to the provisioned database. On a separate database, apply it once through the Neon SQL editor before starting the app.

Run `npm run dev` and open http://localhost:3100. `npm run typecheck` checks types and `npm run build` produces the production build.

## Access and storage

Every workspace API request validates the Neon session on the server. Queries filter by the authenticated user’s project memberships, and mutations enforce the project role and task assignee. Client-supplied user IDs never determine the acting user. Direct messaging requires a shared project; message retrieval is restricted to the sender or recipient. Join links are checked against the signed-in email address, expiration, and token, and are consumed atomically.

Database access is server-only and uses the Neon database owner connection. Row level security is enabled without public policies, which denies direct access for ordinary database roles; the owner bypasses RLS, so the server authorization checks are the application’s enforcement boundary. Never expose the connection string or grant a browser client direct owner access.

## Verification

Start the local server, then run `npm test`. The integration script creates three isolated verification users and private fixture projects. It checks real Neon sign-in sessions, unauthenticated rejection, multiple-project roles, email-bound invitations, task assignment and status permissions, sprint/deadline validation, shared notes, private message filtering, and read state. It leaves fixtures owned only by verification accounts for inspection and does not send messages to real people.

## Vercel and GitHub deployment

The checkout is linked through the ignored `.vercel/project.json`. In Vercel, connect the existing project to `joyceful-lee/common-ground`, using the repository root, Next.js detection, and `main` for production. Git pushes then produce deployments.

Add `DATABASE_URL`, `NEON_AUTH_BASE_URL`, and `NEON_AUTH_COOKIE_SECRET` as server-side Vercel environment variables. Use a separate Neon branch and Auth endpoint for previews when isolating preview data. The local and production cookie secrets should be independently generated.

Add the final production origin to Neon Auth’s trusted domains. Localhost is enabled by the Neon Auth project for development. Register each preview origin explicitly when testing authentication on previews.

Run the production build before deploying. `vercel.json` places server functions in `pdx1`, near the Neon database in AWS US West (Oregon). The application has no external email delivery service, attachments, or push-notification dependency.
