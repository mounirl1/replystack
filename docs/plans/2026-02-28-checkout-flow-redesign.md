# Checkout Flow Redesign

## Context
The current flow requires users to be authenticated before initiating checkout from the Pricing page. Non-authenticated users are redirected to /register with no memory of the plan they selected.

## New Flow

### Non-authenticated user clicks CTA
1. `/pricing` → click Starter → `/register?plan=starter&billing=yearly`
2. Registration completes → redirect to `/checkout?plan=starter&billing=yearly`
3. Checkout page shows plan recap + "Pay now" (LemonSqueezy overlay) + "Later" (→ /dashboard, stays free)

### Authenticated user (free) clicks CTA
- LemonSqueezy overlay opens directly on the Pricing page

### Authenticated user (paid) clicks CTA
- LemonSqueezy overlay opens for upgrade

## Changes

### Pricing.tsx
- Non-auth CTA: `navigate('/register?plan=X&billing=Y')`
- Auth CTA: open LemonSqueezy overlay instead of redirect

### Register.tsx
- Read `plan` + `billing` from query params
- After registration: redirect to `/checkout?plan=X&billing=Y` if params present, else `/dashboard`
- Skip /verify-email redirect (verification happens later via dashboard reminder)

### New page: Checkout.tsx
- Plan recap (name, price, features)
- "Pay now" button → LemonSqueezy overlay
- "Later" button → /dashboard
- Guard: no params or already paid → redirect /pricing

### LemonSqueezy overlay integration
- Install `@lemonsqueezy/lemonsqueezy.js`
- Backend returns checkout URL, frontend opens it as overlay
- After payment: `refreshUser()` + redirect /dashboard

### App.tsx
- Add `/checkout` route

## What doesn't change
- Backend controller, webhooks, quota system
- Email verification exists but happens later
