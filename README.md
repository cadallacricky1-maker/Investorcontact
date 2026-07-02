# Investor Contact

A Next.js app connecting founders and investors through paid listings and consent-based contact requests.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Auth**: Supabase Authentication
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Styling**: Tailwind CSS

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project
   - Run migrations in `supabase/migrations/` in order
   - Get your project URL and keys

3. **Configure environment variables**:
   - Copy `.env.local` and fill in your values:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_FOUNDER_PRICE_ID`
     - `STRIPE_INVESTOR_PRICE_ID`

4. **Run locally**:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000`

## Features

- **Authentication**: Sign up, login, logout
- **Billing**: Stripe integration for subscriptions
- **Offers**: Founders create and manage offers
- **Requests**: Investors request contact with founders
- **Protected flows**: Subscription-gated features

## Pages

- `/` - Home
- `/login` - Auth
- `/pricing` - Plans
- `/dashboard` - User dashboard
- `/my-offers` - Founder offers list
- `/my-offers/new` - Create offer
- `/my-offers/[id]` - Edit offer
- `/offers` - Browse public offers
- `/offers/[id]` - Offer detail & contact form
- `/billing` - Billing page
- `/requests/inbox` - Request inbox
