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

**Note**: You can use your existing Supabase account! Just create a new project for nervgun. Each project is completely isolated with its own database, API keys, and resources.

1. Go to [https://supabase.com](https://supabase.com)
2. **Log in** to your existing account (or sign up if you don't have one)
3. Click **"New Project"** in your organization/dashboard
   - Free tier allows **2 projects** per organization
   - Each project is completely separate (different database, credentials, etc.)
4. Fill in:
   - **Name**: `nervgun` (or your preferred name)
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users (can be different from your other projects)
   - **Plan**: Free tier is fine to start
5. Click **"Create new project"**
6. Wait 2-3 minutes for provisioning

## Step 2: Get Your Connection Strings

Once your project is ready:

### For DATABASE_URL (Pooled Connection)

This is used by your app for better performance:

1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **Connection String** section
3. Click the **URI** tab (Transaction Mode)
4. Copy the connection string
   - Format: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
5. **Important**: Replace `[YOUR-PASSWORD]` with your actual database password from Step 1

### For DIRECT_URL (Direct Connection)

This is used for database migrations:

1. Same location, click the **Direct Connection** tab instead
2. Copy that connection string
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`
3. **Important**: Replace `[YOUR-PASSWORD]` with your actual database password

### Can't Find Your Password?

If you forgot or didn't save your database password:

1. Go to **Settings** → **Database**
2. Scroll to **Database Password** section
3. Click **"Reset database password"**
4. Copy and save the new password immediately!
5. Click **"Update password"**

**Important**: After resetting, update both connection strings with the new password.

## Step 3: Update Your Environment File

1. Open the file `/Users/mirkostolz/Desktop/Code/Nervgun/web/.env`
2. Replace the `DATABASE_URL` and `DIRECT_URL` with your actual connection strings from Step 2:

```bash
# Replace these with YOUR actual Supabase connection strings
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres"
```

Also make sure these are configured:
- `NEXTAUTH_SECRET` - generate a random string (at least 32 chars)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - from Google Cloud Console
- `ALLOWED_EMAIL_DOMAIN` - your company email domain
- `TRIAGER_EMAILS` - admin emails

## Step 4: Run Database Migration

In your terminal:

```bash
cd ~/Desktop/Code/Nervgun/web

# Install dependencies if needed
npm install

# Push your database schema to Supabase
npm run db:push
```

You should see output like:
```
✔ Generated Prisma Client
✔ Your database is now in sync with your schema
```

## Step 5: Verify It Worked

1. In Supabase dashboard, click **Table Editor** (left sidebar)
2. You should see 7 tables:
   - User
   - Account
   - Session
   - Report
   - Comment
   - Upvote
   - VerificationToken

## Step 6: Start Your App

```bash
npm run dev
```

Open http://localhost:3000 and test it out!

---

## Helpful NPM Scripts

Your `package.json` now includes these helpful commands:

- `npm run dev` - Start development server
- `npm run db:push` - Push schema changes to database (no migration files)
- `npm run db:migrate` - Create and run migrations (recommended for production)
- `npm run db:migrate:deploy` - Deploy migrations to production
- `npm run db:studio` - Open Prisma Studio GUI to view/edit data
- `npm run db:reset` - Reset database (CAREFUL! Deletes all data)

---

## Troubleshooting

### Connection Issues

**Error**: "Can't reach database server"
- Check that you copied the full connection string
- Verify your database password is correct
- Make sure there are no extra spaces or quotes

**Error**: "SSL connection required"
- Supabase requires SSL. The connection strings include this automatically.
- If issues persist, add `?sslmode=require` to the end of your connection string

### Migration Issues

**Error**: "Schema drift detected"
```bash
# Reset your database and push the schema fresh
npm run db:push --force-reset
```

**Error**: "Direct connection required"
- Make sure `DIRECT_URL` is set in your `.env` file
- This is required for migrations

### Performance Issues

If you have many reports/comments, the indexes we added will help:
- Report indexes: `status`, `createdAt`, `authorId` (schema.prisma:78-80)
- Comment indexes: `reportId`, `createdAt` (schema.prisma:102-103)

---

## Production Deployment

When deploying to production (Vercel, Railway, etc.):

1. Add environment variables in your hosting platform:
   - `DATABASE_URL` - Your Supabase pooled connection
   - `DIRECT_URL` - Your Supabase direct connection
   - All other env vars from `.env`

2. Run migrations:
```bash
npm run db:migrate:deploy
```

3. The `postinstall` script will automatically generate Prisma Client

---

## Next Steps (Optional)

### 1. Move Screenshots to Supabase Storage

Instead of storing screenshots as `Bytes` in your database, you can use Supabase Storage:
- Better performance
- Lower database costs
- Built-in CDN
- Automatic image optimization

### 2. Add Row Level Security (RLS)

Supabase allows you to add security policies at the database level:
- Users can only see their own reports
- Only triagers can update status
- Protect against SQL injection

### 3. Enable Real-time Updates

Supabase supports real-time subscriptions:
- See new reports instantly
- Live comment updates
- Real-time upvote counts

Let me know if you'd like help with any of these!

---

## Summary

✅ Prisma schema configured for Supabase with directUrl and indexes
✅ Environment variables ready for Supabase connection strings
✅ NPM scripts added for easy database management
✅ Ready to migrate your data to Supabase!

Each project in Supabase is completely separate, so this won't affect your other projects at all.
