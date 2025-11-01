# Supabase Database Setup for nervgun

This guide will help you set up Supabase as your PostgreSQL database for the nervgun project.

## Why Supabase?

Supabase provides:
- ✅ **Managed PostgreSQL** - No server maintenance required
- ✅ **Connection pooling** - Better performance under load
- ✅ **Free tier** - Up to 500MB database + 2GB storage
- ✅ **Automatic backups** - Daily backups on paid plans
- ✅ **Real-time capabilities** - Can add live updates later
- ✅ **Storage** - Can move screenshots from database to storage

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `nervgun` (or your preferred name)
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is fine to start
5. Click **"Create new project"**
6. Wait 2-3 minutes for provisioning

## Step 2: Get Database Connection Strings

Once your project is ready:

### For Connection Pooling (Recommended for production)
1. Go to **Settings** → **Database**
2. Scroll to **Connection String** section
3. Select **URI** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
5. **IMPORTANT**: Replace `[PASSWORD]` with your actual database password

### For Direct Connection (Required for Prisma migrations)
1. In the same section, select **Direct Connection** tab
2. Copy the connection string (looks like):
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```
3. **IMPORTANT**: Replace `[PASSWORD]` with your actual database password

## Step 3: Configure Environment Variables

1. Navigate to your project's web directory:
   ```bash
   cd /home/user/nervgun/web
   ```

2. Edit `.env.local` file and update:
   ```bash
   # Supabase Database (Connection Pooling - for app runtime)
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

   # Direct Connection (for migrations)
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
   ```

3. **IMPORTANT**: Add the following to `.gitignore` if not already there:
   ```
   .env.local
   .env
   ```

## Step 4: Run Database Migration

Now migrate your Prisma schema to Supabase:

```bash
cd /home/user/nervgun/web

# Generate Prisma Client
npm run prisma generate

# Push schema to Supabase (development)
npm run db:push

# OR create a migration (production-ready)
npm run db:migrate
```

You should see output like:
```
✔ Generated Prisma Client
✔ Your database is now in sync with your schema
```

## Step 5: Verify Setup

1. **Check in Supabase Dashboard**:
   - Go to **Table Editor** in your Supabase dashboard
   - You should see tables: `User`, `Account`, `Session`, `Report`, `Comment`, `Upvote`, `VerificationToken`

2. **Test the connection**:
   ```bash
   npm run dev
   ```
   - Open http://localhost:3000
   - Try to sign in with Google OAuth
   - Create a test report from the Chrome extension

## Step 6: Production Deployment (Vercel)

If deploying to Vercel:

1. In your Vercel project settings, add environment variables:
   ```
   DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_secret_here
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ALLOWED_EMAIL_DOMAIN=your-company.com
   TRIAGER_EMAILS=admin@your-company.com
   ```

2. Update Google OAuth redirect URIs to include:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

3. Deploy:
   ```bash
   git push origin main
   ```

## Optional: Move Screenshots to Supabase Storage

Currently, screenshots are stored as `Bytes` in PostgreSQL. For better performance, you can move them to Supabase Storage:

### Benefits:
- ✅ Smaller database size
- ✅ Faster queries
- ✅ CDN delivery
- ✅ Easier to implement image transformations

### Setup (if interested):
1. Get Supabase API keys from **Settings** → **API**
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
3. Install Supabase client:
   ```bash
   npm install @supabase/supabase-js
   ```
4. Update schema to use `String?` for screenshot URL instead of `Bytes?`

## Troubleshooting

### Connection refused
- Check your database password is correct
- Ensure you're using the correct connection string format
- Check if your IP is blocked (Supabase free tier shouldn't block)

### SSL/TLS errors
Add `?sslmode=require` to your connection string:
```
postgresql://...postgres?sslmode=require
```

### Migration errors
- Make sure you're using `DIRECT_URL` for migrations (not pooled connection)
- Check Supabase dashboard for error logs

### Can't connect from Vercel
- Ensure `DATABASE_URL` uses connection pooling (port 6543)
- Check environment variables are set in Vercel dashboard

## Monitoring

Monitor your database usage in Supabase:
- **Dashboard** → **Database** → **Usage**
- Free tier limits:
  - 500 MB database size
  - 2 GB bandwidth
  - 50k queries per month

## Next Steps

Once Supabase is working:
- [ ] Set up database backups (automatic on paid plans)
- [ ] Configure Row Level Security (RLS) policies
- [ ] Monitor query performance in Supabase dashboard
- [ ] Consider upgrading if you exceed free tier limits

## Support

- Supabase Docs: https://supabase.com/docs
- Prisma + Supabase Guide: https://supabase.com/docs/guides/integrations/prisma
- nervgun Issues: Create an issue in this repo
