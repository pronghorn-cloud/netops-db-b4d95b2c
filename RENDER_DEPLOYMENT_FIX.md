# Render.com Deployment Fix Guide

## 🚨 CRITICAL: Build Command Configuration

### Current Issue You're Experiencing

Your build logs show:
```
10:57:20 PM ==> Running build command 'npm install'...
10:57:57 PM added 654 packages, and audited 655 packages in 37s
10:57:59 PM ==> Uploading build...
10:58:06 PM ==> Build successful 🎉
```

**This looks successful but is WRONG!** ❌

### The Problem

Your **Build Command** in Render is set to:
```bash
npm install
```

But it **MUST** be:
```bash
npm install && npm run build
```

**Why?** Your app is written in TypeScript. It needs to be compiled to JavaScript before it can run. Without `npm run build`, the `dist/` folder is never created, and when Render tries to run `node dist/index.js`, the file doesn't exist.

---

## Problem Summary (Original ENOENT Error)

The initial error you saw:
```
npm error path /opt/render/project/src/package.json
npm error errno -2
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory
```

**Root Cause**: Render.com was configured to look for `package.json` in the `src/` directory, but it's actually located in the root directory of your repository.

**Status**: ✅ This has been fixed (Root Directory is now correct)

**New Issue**: ⚠️ Build Command is incomplete (missing `npm run build`)

---
## 🔧 IMMEDIATE FIX REQUIRED

### Update Your Build Command NOW

1. Log in to [Render.com Dashboard](https://dashboard.render.com/)
2. Navigate to your `netops-db-b4d95b2c` web service
3. Click the **"Settings"** tab
4. Scroll to **"Build & Deploy"** section
5. Find **"Build Command"** field
6. **CHANGE FROM**: `npm install`
7. **CHANGE TO**: `npm install && npm run build`
8. Click **"Save Changes"**
9. Click **"Manual Deploy"** > **"Deploy latest commit"**

---

## Step-by-Step Fix Instructions (Complete Walkthrough)

### Step 1: Access Your Render.com Dashboard

1. Log in to [Render.com](https://dashboard.render.com/)
2. Navigate to your `netops-db-b4d95b2c` web service
3. Click on the service to open its details page

### Step 2: Update the Root Directory Setting (Already Fixed ✅)

1. Click the **"Settings"** tab at the top of the page
2. Scroll down to the **"Build & Deploy"** section
3. Look for the **"Root Directory"** field
4. **Should be**: (empty) or `.` ✅
5. ~~If it says `src`, change it to empty or `.`~~ (This is already correct)

### Step 3: Fix Build Command (CRITICAL - DO THIS NOW ⚠️)

Still in the **"Build & Deploy"** section:

1. Find the **"Build Command"** field
2. **CURRENT VALUE**: `npm install` ❌ WRONG
3. **MUST CHANGE TO**: `npm install && npm run build` ✅ CORRECT
4. Find the **"Start Command"** field
5. **Should be**: `npm start` ✅
6. Click **"Save Changes"** button at the bottom

**Why this matters**:
- `npm install` - Installs dependencies into `node_modules/`
- `npm run build` - Runs TypeScript compiler (`tsc`) to create `dist/` folder
- `npm start` - Runs `node dist/index.js` (which only exists after build)

Without the build step, `dist/index.js` doesn't exist and your app crashes on startup!


### Step 4: Set Environment Variables

Still in Settings, go to the **"Environment"** section and ensure you have:

```
NODE_ENV=production
DATABASE_URL=<your-postgresql-connection-string>
JWT_SECRET=<your-secure-secret-key>
JWT_EXPIRE=7d
CORS_ORIGIN=<your-frontend-url-or-*>
PORT=3000
```

**Important**: Replace the placeholder values with your actual values.

### Step 5: Trigger a New Deployment

Option A - Manual Deploy:
1. Go to the **"Manual Deploy"** section
2. Click **"Deploy latest commit"**
3. Select the `main` branch
4. Click **"Deploy"**

Option B - Push a New Commit:
```bash
git commit --allow-empty -m "Trigger Render deployment"
git push origin main
```

---

## ✅ How to Verify Your Build is CORRECT

### CORRECT Build Logs (What You SHOULD See)

Once configured correctly, your build logs **MUST** show:

```
==> Cloning from https://github.com/pronghorn-cloud/netops-db-b4d95b2c
==> Checking out commit...
==> Using Node.js version 22.22.0
==> Running build command 'npm install && npm run build'...

added 654 packages, and audited 655 packages in 37s

> netops-api@1.0.0 build
> tsc

==> Uploading build...
==> Build successful 🎉
```

**Key indicators of SUCCESS**:
- ✅ Build command shows: `'npm install && npm run build'`
- ✅ You see: `> netops-api@1.0.0 build`
- ✅ You see: `> tsc` (TypeScript compiler running)
- ✅ No TypeScript errors

### INCORRECT Build Logs (What You're Currently Seeing) ❌

```
==> Running build command 'npm install'...

added 654 packages, and audited 655 packages in 37s

==> Uploading build...
==> Build successful 🎉
```

**Problems with this output**:
- ❌ Build command only shows: `'npm install'` (missing `&& npm run build`)
- ❌ NO TypeScript compilation happening
- ❌ NO `dist/` folder created
- ❌ Build appears successful but app will crash at runtime
- ❌ Error will be: "Cannot find module '/opt/render/project/src/dist/index.js'"

---

## Troubleshooting Additional Issues

### Issue: Build succeeds but app crashes immediately on startup

**Symptoms**:
- Build logs show "Build successful 🎉"
- But app crashes when starting
- Logs show: "Cannot find module" or "ENOENT" errors
- Specifically: `Error: Cannot find module '/opt/render/project/src/dist/index.js'`

**Root Cause**: Build Command is missing `npm run build`

**Solution**: 
1. Go to Settings > Build & Deploy
2. Change Build Command from `npm install` to `npm install && npm run build`
3. Save and redeploy

### Issue: Database connection errors

**Solution**: Check that your DATABASE_URL is correct and the PostgreSQL database is accessible.

```bash
# Test database connection locally first
psql "<your-DATABASE_URL>"
```
### Issue: "Cannot find module" errors

**Solution**: Ensure all dependencies are in `dependencies` not `devDependencies` in package.json.

For TypeScript projects, you may need to add:
```json
"dependencies": {
  "typescript": "^5.1.6"
}
```

### Issue: Port binding errors

**Solution**: Render automatically sets the PORT environment variable. Your code should use:

```typescript
const PORT = process.env.PORT || 3000;
```

Check `src/index.ts` to verify this is configured correctly.

### Issue: Database migration not running

**Solution**: Run migrations manually after first deployment:

1. Go to your service in Render dashboard
2. Click **"Shell"** tab
3. Run: `npm run migrate`

Or add a post-build script in package.json:
```json
"scripts": {
  "build": "tsc && npm run migrate"
}
```

---

## Quick Reference: Render.com Configuration

| Setting | Value |
|---------|-------|
| **Root Directory** | (empty) or `.` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Node Version** | 22.22.0 (auto-detected) |


## Quick Reference: Render.com Configuration

| Setting | Correct Value | Your Current Value |
|---------|---------------|-------------------|
| **Root Directory** | (empty) or `.` | ✅ Correct |
| **Build Command** | `npm install && npm run build` | ❌ `npm install` (WRONG!) |
| **Start Command** | `npm start` | ✅ Correct |
| **Node Version** | 22.22.0 (auto-detected) | ✅ Correct |

**Action Required**: Fix the Build Command immediately!

---
✅ All source files use PostgreSQL (migration completed)
✅ TypeScript configuration updated

---

## Need More Help?

1. Check Render logs in the **"Logs"** tab for specific error messages
2. Verify your GitHub repository has the latest changes pushed
3. Review the [Render Node.js Documentation](https://render.com/docs/deploy-node-express-app)
4. Contact Render support if the issue persists

---

## Post-Deployment Verification

Once deployed successfully:

1. **Test the health endpoint**:
   ```bash
   curl https://your-app.onrender.com/health
   ```

2. **Expected response**:
   ```json
   {
     "status": "ok",
     "message": "NetOps API is running"
   }
   ```

3. **Test database connection**:
   ```bash
   curl https://your-app.onrender.com/api/sites
   ```
   (Should return an empty array or authentication error if not logged in)

---

**Last Updated**: February 3, 2026
**Package.json Fixed**: ✅ Yes
**Migration Status**: ✅ Complete (MongoDB → PostgreSQL)
