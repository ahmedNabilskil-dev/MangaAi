# Payment Plans Seeder

This module automatically seeds payment plans and creates corresponding Stripe products when the application starts.

## Features

- ✅ Automatically creates payment plans in the database
- ✅ Automatically creates Stripe products and prices for each plan
- ✅ Handles both one-time purchase and subscription plans
- ✅ Idempotent - won't duplicate existing plans or Stripe products
- ✅ Manual script available for existing deployments

## How It Works

### Automatic Seeding (On Application Start)

The `PaymentSeederService` runs automatically when the NestJS application starts via the `OnModuleInit` lifecycle hook.

**What happens:**

1. Checks if plans already exist in the database
2. If no plans exist:
   - Creates all predefined plans in the database
   - Creates corresponding Stripe products and prices for each plan
3. If plans exist but some lack Stripe integration:
   - Creates missing Stripe products for existing plans

### Manual Stripe Product Creation

If you have existing plans that were created before Stripe integration, you can manually create Stripe products:

```bash
cd backend
npm run create-stripe-products
```

This script will:

- Find all plans without `stripeProductId` or `stripePriceId`
- Create the corresponding Stripe products and prices
- Update the database with the Stripe IDs

### Reset and Re-seed Plans

If you need to completely reset your plans (useful for development or fixing data issues):

```bash
cd backend
npm run reset-plans
```

This script will:

- Delete all existing plans from the database
- Re-create all plans with the correct structure
- Automatically create Stripe products for all new plans

### Migrate Legacy Plans

If you have plans with the old `price` field structure:

```bash
cd backend
npm run migrate-plans
```

This script will:

- Find plans with the old `price` field
- Convert them to use the new `priceCents` field
- Remove the old field

### Clean Up Duplicate Stripe Products

If you have duplicate Stripe products and prices (can happen during development):

```bash
cd backend
# Dry run - shows what will be cleaned up
npm run cleanup-stripe-products

# Actually clean up duplicates
npm run cleanup-stripe-products -- --confirm
```

This script will:

- Find duplicate and orphaned Stripe products and prices
- Show you exactly what will be removed
- Deactivate duplicate products and prices (preserves payment history)
- Keep only the products/prices that are linked to your current plans

## Environment Requirements

Make sure these environment variables are set:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Plan Types

The seeder creates the following plans:

### One-Time Credit Packages

- **Starter Pack**: 100 credits + 10 bonus ($9.99)
- **Creator Pack**: 250 credits + 50 bonus ($19.99)
- **Artist Pack**: 500 credits + 150 bonus ($39.99)
- **Studio Pack**: 1000 credits + 400 bonus ($79.99)
- **Enterprise Pack**: 2500 credits + 1000 bonus ($149.99)

### Subscription Plans

- **Pro Monthly**: 300 monthly credits ($19.99/month)
- **Pro Yearly**: 300 monthly credits ($199.99/year - 2 months free)
- **Business Monthly**: 1000 monthly credits ($49.99/month)
- **Business Yearly**: 1000 monthly credits ($499.99/year - 2 months free)

## Database Schema

Each plan includes:

- Basic info (name, description, price)
- Credit allocation (one-time credits, bonus credits, monthly credits)
- Stripe integration (product ID, price ID)
- Display metadata (icon, color, features, popularity)

## Troubleshooting

### Plans exist but no Stripe products

- Run: `npm run create-stripe-products`
- Or restart the application (it will detect and create missing Stripe products)

### Stripe API errors

- Verify your Stripe secret key is correct
- Check that your Stripe account is active
- Ensure you're using the correct API version

### Database connection issues

- Verify MongoDB connection string
- Check database permissions

## Development

To modify the plans:

1. Edit the `plans` array in `payment-seeder.service.ts`
2. Restart the application or run the manual script
3. The seeder is idempotent, so existing plans won't be duplicated

## Logs

The seeder provides detailed logging:

- ✓ Green checkmarks for successful operations
- ✗ Red X marks for failed operations
- Detailed error messages for debugging
