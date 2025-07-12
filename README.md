# Next.js + Effect Auth Starter

![Simple Next Auth Demo](https://raw.githubusercontent.com/sundaray/simple-next-auth/main/public/simple-next-auth.png)

## About

A starter project for **Google (OAuth) and Email/Password (Credentials) authentication** in Next.js applications. I built this project as a learning exercise to explore the integration of Effect — a production-grade TypeScript library — into a Next.js 15 application.

## 🛠️ Tech Stack & Libraries

- **Next.js 15** (App Router)
- **Effect**: A production-grade TypeScript library
- **Supabase**: Postgres database
- **Drizzle ORM**: A TypeScript-first ORM for type-safe database queries
- **SWR**: A React hooks library for data fetching
- **Shadcn UI**: UI components
- **Conform**: A type-safe form validation library
- **Amazon SES**: Email service provider (for sending verification and password reset emails)
- **Motion**: Animation
- **Jose**: A library for generating, decoding and encryption JSON Web Tokens
- **Uncrypto**: A library that provides a single API to use web-crypto and Subtle Crypto in both Node.js using Crypto Module and Web targets using Web Crypto API using Conditional Exports

## 🚀 Getting Started

Follow these steps to get a local instance of the application up and running.

### 1. Prerequisites

- A Supabase project
- An AWS account with SES configured for sending emails
- A Google Cloud project with OAuth 2.0 credentials

### 2. Clone the Repository

First, clone the repository to your local machine and navigate into the project directory:

```bash
git clone https://github.com/sundaray/simple-next-auth.git
cd simple-next-auth
```

### 3. Install Dependencies

Run the following command to install all the necessary dependencies:

```bash
npm install
```

### 4. Set Up Environment Variables

Create a `.env.local` file in the root of the project and fill it with the following environment variables:

```env
# Supabase
DATABASE_URL="your_supabase_project_connection_string"

# AWS SES (for sending emails)
AWS_REGION="your_aws_ses_region"
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret"
EMAIL_FROM="noreply@your-verified-domain.com"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
REDIRECT_URI="http://localhost:3000/api/auth/callback/google"

# Application
BASE_URL="http://localhost:3000"
JWT_ENCRYPTION_KEY="your_generated_secret_key"
```

#### Important notes on environment variables:

- **REDIRECT_URI**: This URI is the endpoint (a Route Handler) where the Google OAuth server will send responses to your authentication requests. For this project's local development setup, you must use the value `http://localhost:3000/api/auth/callback/google`. Make sure you add this exact URI to the **Authorized redirect URIs** list in your Google Cloud project's **Credentials** page.

- **EMAIL_FROM**: This is the "From" address for all transactional emails (e.g., email verification, password reset). This email address must belong to a domain that you have verified with AWS SES. If your verified domain is `example.com`, you could use something like `auth@example.com` or `no-reply@example.com`.

- **JWT_ENCRYPTION_KEY**: This is a secret key used to securely encrypt session data. You can generate one by running the command `openssl rand -base64 32` in your terminal and pasting the output into your `.env.local` file.

### 5. Configure and Push Database Schema

First, open your `package.json` file and add the `"db:push"` script inside the existing `"scripts"` object. This provides a convenient command for applying schema changes.

Your `"scripts"` section should look like this:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "db:push": "drizzle-kit push"
}
```

Next, run the following command to push the schema defined in the `db/schema.ts` file to your Supabase database:

```bash
npm run db:push
```

This will connect to your Supabase instance (using the `DATABASE_URL` you provided) and create the necessary tables.

**Note**: The `npm run db:push` command (`drizzle-kit push`) **pushes schema changes directly to the database**. It does not generate migration files. This is a good approach for quickly testing schema changes in a local development environment.

### 6. Run the Development Server

You're all set! Start the development server with:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.
