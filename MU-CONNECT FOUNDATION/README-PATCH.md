# MUCONNECT foundation patch

This patch fixes startup blockers and adds preview API routes so the existing interface can render sample listings.

## Apply it
1. Extract this ZIP.
2. In GitHub, open the `muconnect` folder.
3. Add the included `package.json` to `muconnect/`. The current `public.json` file is not recognized by npm as a package manifest.
4. Replace `muconnect/server/index.js`, `muconnect/server/config/env.js`, and `muconnect/server/lib/supabase.js` with the matching files from this patch.
5. Keep your existing `public/` folder and its CSS/JavaScript.
6. In `muconnect/public/index.html`, change `Project by AHAK DEV × TEKARU` to exactly `Made by AHAK DEV`.
7. Commit, then run `npm install` and `npm run dev` from inside `muconnect/`.

## Important status
- The products and stores are sample data only.
- Order requests are validated but **not stored or sent to sellers**. A demo reference is not a real order confirmation.
- The assistant is a placeholder. The Groq key is not used yet.
- Supabase is now optional for startup, but database-backed routes, authentication, seller dashboards, production order storage, and full authorization are not implemented.
- Do not launch this as a production marketplace until the missing database/auth/security workflows are completed and tested.
