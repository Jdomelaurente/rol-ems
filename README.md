# ROL-EMS Resort & Sports Complex

Court and training-floor booking with pickleball modules (booking, open play, tournaments, roulette, coaching, shop), powered by Next.js 16 + Tailwind CSS v4.

## Setup

1. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/strajec-dev/Rol-ems.git
   cd rol-ems
   pnpm install
   ```

2. Create a file named `.env.local` in the project root and paste the following inside:

   ```env
   PAYMONGO_SECRET_KEY=sk_test_your_paymongo_secret_key
   PAYMONGO_WEBHOOK_SECRET=whsk_your_paymongo_webhook_secret

   # Email (receipts) - SMTP
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   SMTP_FROM=ROL-EMS Resort <your_email@gmail.com>

   NEXT_PUBLIC_SITE_URL=https://rol-ems.vercel.app

   # Database (Prisma) - Supabase
   DATABASE_URL="postgresql://postgres.your_supabase_ref:your_password@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=no-verify"
   SESSION_SECRET="any_random_secret_string_here"
   ```

3. Run the dev server:

   ```bash
   pnpm dev
   ```

## ⚠️ Secrets

These files contain live credentials and must never be committed. Keep this repo private.

| Variable | What it is |
| --- | --- |
| `PAYMONGO_SECRET_KEY` | PayMongo API key (test mode: `sk_test_…`) |
| `PAYMONGO_WEBHOOK_SECRET` | PayMongo webhook signing secret |
| `SMTP_PASS` | Gmail app password for sending receipts |
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `SESSION_SECRET` | Any random string used for session signing |

> The real values live only in `.env.local` (gitignored). Never paste live secrets into any committed file — GitHub will block the push.

## Uptime & Keep-Awake

This repository also runs [Upptime](https://upptime.js.org) to monitor the live site and keep Vercel + Supabase warm.

- Checks: the website (`/`) and `/api/health` (which runs a real database query).
- Schedule: every 15 minutes, plus a daily summary.
- Status page: <https://jdomelaurente.github.io/rol-ems/>
- Downtime opens a GitHub issue automatically and closes it when the service recovers.

Setup requirements (one-time, in GitHub settings):

1. Add a fine-grained or classic personal access token with `repo` + `workflow` scopes as the `GH_PAT` secret.
2. Under **Settings → Pages**, set the source to the `gh-pages` branch.
3. Run the **Setup CI** workflow once, then the **Uptime CI** workflow.

<!--start: status pages-->
<!--end: status pages-->
