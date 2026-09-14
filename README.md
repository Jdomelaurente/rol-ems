# ROL-EMS Resort & Sports Complex

Court and training-floor booking with pickleball modules (booking, open play, tournaments, roulette, coaching, shop), powered by Next.js 16 + Tailwind CSS v4.

## ⚠️ DO NOT PUSH THESE FILES

These files contain secrets or local debug noise and must never be committed. Keep this repository private until they are cleaned up.

| File | Reason |
| --- | --- |
| `.env.local` | Contains real secrets (Supabase DB URL / API keys). Already gitignored — treat as untracked forever. |
| `check-user.js` | Temp debug script that connects to the database with credentials. Delete or keep local only. |
| `devlog2.txt` | Local dev log. Not application code; do not commit. |

They are listed in `.gitignore`. If you ever see them in `git status`, exclude them from staging.

### `.env.local` structure (values redacted — repo is private)

```
PAYMONGO_SECRET_KEY=sk_test_***REDACTED — GitHub blocks pushing this***
PAYMONGO_WEBHOOK_SECRET=whsk_***REDACTED***

# Email (receipts) - SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=***REDACTED***
SMTP_PASS=***REDACTED***
SMTP_FROM=ROL-EMS Resort <***REDACTED***>

NEXT_PUBLIC_SITE_URL=https://rol-ems.vercel.app

# Database (Prisma) - Supabase
DATABASE_URL="postgresql://postgres.***REDACTED***@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=no-verify"
SESSION_SECRET="***REDACTED***"
```

> The real values live only in `.env.local` (gitignored). GitHub's push protection rejects commits containing the `sk_test_…` PayMongo key, so never paste those raw values into any committed file — even in a private repo.