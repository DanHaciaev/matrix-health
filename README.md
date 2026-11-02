# Health Matrix

An online store for peptides, supplements and medicinal herbs, built for a client in Moldova.
It runs in three languages and has a full admin panel. New orders and consultation requests go straight to the shop owner in Telegram.

**Live site: [matrix-health-theta.vercel.app](https://matrix-health-theta.vercel.app)**

![Home page](docs/screenshots/home.webp)

## Screenshots

| Catalog with filters | Product page |
|---|---|
| ![Catalog](docs/screenshots/catalog.webp) | ![Product](docs/screenshots/product.webp) |

| Specialist consultation | About peptides |
|---|---|
| ![Consultation](docs/screenshots/consultation.webp) | ![About peptides](docs/screenshots/peptides.webp) |

| Checkout | Home: about peptides block |
|---|---|
| ![Checkout](docs/screenshots/checkout.webp) | ![Home, about peptides](docs/screenshots/home-peptides.webp) |

| Mobile: home | Mobile: menu | Mobile: catalog | Order confirmation email |
|---|---|---|---|
| ![Mobile home](docs/screenshots/mobile-home.webp) | ![Mobile menu](docs/screenshots/mobile-menu.webp) | ![Mobile catalog](docs/screenshots/mobile-catalog.webp) | ![Email](docs/screenshots/email.webp) |

## Features

### Storefront

- **Catalog**:
  - categories: peptides, Agenyz, medicinal herbs;
  - filters by form, purpose, price and stock, with sorting and search;
  - on desktop the filter panel stays in view while scrolling.
- **Product pages** with dosage variants, composition, usage, warnings and the certificates for each batch.
- **Certificates registry** with search by batch (LOT) number.
- **Cart and checkout**:
  - delivery by the shop's own courier;
  - payment in cash on delivery or by bank card transfer;
  - prices are calculated in the database, not in the browser.
- **Specialist services**: a one-time peptide consultation and monthly course support, with a request form.
- **"What are peptides"** page: a short, factual explainer that links to products in the catalog.
- **Three languages**: English (default), Romanian and Russian.
  - The language is not part of the URL, it is remembered in a cookie.
  - On the first visit it is detected from the browser.
- **Fully responsive**, from 390 px phones to wide desktops.

### Admin panel (`/admin`, in Russian)

- **Dashboard**: new orders and requests, revenue for 30 days, low-stock products.
- **Orders**:
  - status filter, search by number, name or phone, and a manager note;
  - the list refreshes by itself every 10 seconds;
  - cancelling an order returns the items to stock automatically.
- **Products**: photos, dosage variants with their own price and stock, composition, specs, and texts in three languages.
- **Certificates, categories and filter options**: all editable in three languages.
- **Services and requests**: prices for the consultation and the monthly support. Each request has a one-click link to the client's preferred messenger (Viber, WhatsApp or a call).
- **Pages**: a section-by-section editor for the "What are peptides" page text.
- **Settings**:
  - store contacts, delivery cost and the free-delivery threshold;
  - status checks for the Telegram bot and Gmail, with test buttons.

### Notifications

- **Telegram bot**: every order and consultation request arrives as a structured message: customer, phone, address, items, totals and a link to the order in the admin panel.
- **Email to the customer**: an order confirmation in the customer's language, sent directly through Gmail SMTP, with no third-party mail service.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Cache Components, Server Actions)
- TypeScript
- Tailwind CSS 4: no separate CSS files, all styling is utility classes
- [Supabase](https://supabase.com): Postgres, Auth, Storage and Row Level Security
- Nodemailer for Gmail SMTP, and the Telegram Bot API
- Hosted on Vercel

All store data (products, categories, texts, prices, contacts) lives in the database. The code holds no content.
The database itself enforces permissions: visitors only read published data, and only users in the `admins` table can change anything.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values, see below
npm run dev
```

Open http://localhost:3000. Until Supabase is connected, the site shows a red "database not connected" banner and an empty catalog.

### 1. Set up Supabase

Create a project at [supabase.com](https://supabase.com). Then run these files in **SQL Editor**, in order:

| File | What it does |
|---|---|
| `supabase/schema.sql` | Tables, RLS policies, `place_order()` function, `media` storage bucket |
| `supabase/i18n.sql` | Translation columns (English and Romanian) |
| `supabase/filters.sql` | Editable filter options: purposes and forms |
| `supabase/services.sql` | Consultation services and the requests table |
| `supabase/categories.sql` | Agenyz and medicinal herbs categories |
| `supabase/peptides.sql` | 15 peptides with descriptions and prices in EUR |
| `supabase/peptides-i18n.sql` | English and Romanian texts for the peptides |
| `supabase/pages.sql` | Text of the "What are peptides" page |
| `supabase/order-stock.sql` | Returns items to stock when an order is cancelled |
| `supabase/order-numbers.sql` | Order and request numbers like `0001` |

Every file is safe to run again.

### 2. Create an admin user

In **Authentication → Users → Add user**, create a user with *Auto Confirm User* on. Then run in SQL Editor:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'you@example.com';
```

Sign in at http://localhost:3000/admin.

### 3. Environment variables

| Variable | Required | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | The publishable (or anon) key from the same page |
| `TELEGRAM_BOT_TOKEN` | for notifications | [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | for notifications | Admin → Settings → "Find chats" (comma-separated for several recipients) |
| `GMAIL_USER` | for customer emails | The Gmail address that sends the emails |
| `GMAIL_APP_PASSWORD` | for customer emails | [App passwords](https://myaccount.google.com/apppasswords) (2-step verification required) |

The Supabase `service_role` key is **not** used and should never be added.

### Telegram bot

1. Create a bot with @BotFather and set `TELEGRAM_BOT_TOKEN`.
2. The recipient opens the bot and presses **Start**. You can also add the bot to a group.
3. In Admin → Settings, press **Find chats** and copy the chat ID into `TELEGRAM_CHAT_ID`.
4. Press **Send test**.

If Telegram is unavailable, the order is still placed; only the message is skipped.

### Customer emails (Gmail)

1. Turn on 2-step verification in the Google account.
2. Create an app password and set `GMAIL_USER` and `GMAIL_APP_PASSWORD`.
3. In Admin → Settings, press **Send test email**.

The checkout only promises an email copy once mail is configured. Gmail allows about 500 emails per day.

## Project structure

```
src/
  app/[lang]/          storefront pages (language comes from a cookie, not the URL)
  app/admin/           admin panel: login and (panel) pages
  components/          storefront UI; components/admin: admin forms
  i18n/                dictionaries (en, ro, ru) and language helpers
  lib/data.ts          cached reads from Supabase ('use cache' + tags)
  lib/catalog.ts       filters, sorting, pagination
  lib/cart.ts          cart in localStorage
  lib/telegram.ts      Telegram notifications
  lib/mail.ts          order emails via Gmail
  lib/admin/           admin auth, server actions, page editor schemas
  proxy.ts             language detection and /admin protection
supabase/              SQL for the database (see the table above)
docs/screenshots/      images for this README
```

## Deployment

The project is deployed on Vercel from the `master` branch:

1. Import the repository.
2. Add the environment variables from `.env.local` in **Settings → Environment Variables**.
3. Deploy.

After changing variables, redeploy.

Changes made in the admin panel appear on the site immediately. Data edited directly in Supabase shows up within a minute, or right away after pressing **Refresh site** in Admin → Settings.

---

Made by SIMP
