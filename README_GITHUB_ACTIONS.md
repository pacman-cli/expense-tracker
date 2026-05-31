# Deployment Setup

To deploy this application, you will need to set up the following secrets in your GitHub repository:

## GitHub Secrets

1.  `VERCEL_TOKEN`: Your Vercel API token.
2.  `VERCEL_ORG_ID`: Your Vercel Organization ID.
3.  `VERCEL_PROJECT_ID`: Your Vercel Project ID.
4.  `RENDER_DEPLOY_HOOK`: The deploy hook URL for your Render web service.

## Database (Supabase)

1. Set up a Supabase project.
2. Get the database connection string.
3. In your Render dashboard, set the following environment variables for your web service:
   - `DB_HOST`: The host of your Supabase database.
   - `DB_PORT`: The port of your Supabase database (usually 5432).
   - `DB_NAME`: The name of your database (usually postgres).
   - `DB_USERNAME`: The username for your database (usually postgres).
   - `DB_PASSWORD`: The password for your database.
   - `JWT_SECRET`: A secret key for JWT signing.
   - `GEMINI_API_KEY`: Your Gemini API key.
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID.
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret.
   - `FRONTEND_URL`: The URL of your deployed Vercel frontend.

## Frontend Environment Variables (Vercel)

In your Vercel project settings, set the following environment variables:
- `NEXT_PUBLIC_API_URL`: The URL of your deployed Render backend (e.g., https://expense-tracker-backend-6lgt.onrender.com/api).

## Supabase Initialization
The backend uses Flyway for database migrations. When the application starts and connects to your Supabase database, it will automatically create all necessary tables and schema.

Make sure you've enabled Baseline on Migrate in Spring Boot configuration:
`spring.flyway.baseline-on-migrate=true` (this is already set in application.properties)
