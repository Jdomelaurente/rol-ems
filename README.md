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