# MUCONNECT

**Campus, connected.** A student-first marketplace MVP scaffold by **AHAK DEV × TEKARU**.

This project includes a responsive marketplace frontend, Express API, demo catalogue, cart and order-request flow, seller directory, optional Groq assistant endpoint, and an initial Supabase schema.

## What works right now

- Browse and search demo products and sellers without connecting a database.
- Filter products by category.
- Add items to a bag and change quantities.
- Submit a request with name, phone and delivery/meeting location.
- Receive a demo reference while in demo mode.
- Ask the basic marketplace assistant. Add a Groq key to enable its API response.
- `/api/health` reports whether Supabase is configured.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

1. Extract the project folder.
2. Open a terminal in the `muconnect` folder.
3. Install packages:

   ```bash
   npm install
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

The app starts in **demo mode** if Supabase credentials are blank. Demo orders are not permanently saved. Do not treat the demo listings as real offers.

## Connect Supabase

1. Create a Supabase project.
2. Open the SQL Editor and run `supabase/migrations/001_initial_schema.sql`.
3. Copy `.env.example` to `.env`.
4. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project settings. `SUPABASE_ANON_KEY` is kept in the config for future authenticated browser features.
5. Restart the server.

**Important:** The service-role key bypasses Row Level Security. Keep it in `.env` on the server only. Never commit `.env`, paste the key into browser JavaScript, or share it publicly. This initial schema does not yet include a complete seller dashboard, authentication screens, admin controls, storage policies, payment integration, or a production-tested permission model.

To show live products, create active rows in `stores` and `products` through the Supabase dashboard or trusted server-side workflows.

## Optional AI assistant

Set `GROQ_API_KEY` in `.env`. The server calls Groq from the backend, so the key is not exposed to the browser. Without it, the assistant displays a safe fallback response. The assistant does not know real-time stock unless that data is explicitly supplied to it, so always confirm details with sellers.

## Deployment notes

This is an MVP foundation, not a production-ready marketplace yet. Before accepting real payments or customer data, add and test:
- Supabase Auth and seller/admin authorization.
- Strict RLS policies for every user-specific table.
- Server-side validation, order ownership, stock locking and transactional order creation.
- Seller order views and notification flow.
- Approved Zambian payment provider integration and reconciliation.
- Image Storage bucket and upload restrictions.
- Privacy notice, terms, moderation, backups, and deployment secrets.

Deploy on a Node-capable host such as Render by connecting the GitHub repository, using `npm install` as the build command and `npm start` as the start command. Add environment variables in the host dashboard, never in source code.

## Project layout

```text
muconnect/
├── public/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── server/
│   ├── config/env.js
│   ├── lib/supabase.js
│   └── index.js
├── supabase/migrations/001_initial_schema.sql
├── .env.example
├── .gitignore
├── package.json
└── README.md
```
