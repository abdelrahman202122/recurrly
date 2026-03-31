# Recurrly

Recurrly is an Expo app for tracking subscriptions and recurring billing with Clerk-powered authentication.

## Setup

1. Install dependencies.

   ```bash
   npm install
   ```

2. Create your local environment file from the example.

   macOS/Linux:

   ```bash
   cp .env.example .env
   ```

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Open `.env` and paste your own Clerk publishable key.

   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_new_key_here
   ```

4. Start the Expo app.

   ```bash
   npx expo start
   ```

## Security Note

Do not commit `.env`. The repository includes `.env.example` only, and each developer should use their own Clerk publishable key locally.
