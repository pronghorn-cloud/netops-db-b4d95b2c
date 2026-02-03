# Render.com Deployment Fix Guide

## Problem Summary

Your deployment is failing with this error:
```
npm error path /opt/render/project/src/package.json
npm error errno -2
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory
```

**Root Cause**: Render.com is configured to look for `package.json` in the `src/` directory, but it's actually located in the root directory of your repository.

---

## Step-by-Step Fix Instructions

### Step 1: Access Your Render.com Dashboard

1. Log in to [Render.com](https://dashboard.render.com/)
2. Navigate to your `netops-db-b4d95b2c` web service
3. Click on the service to open its details page

### Step 2: Update the Root Directory Setting

1. Click the **"Settings"** tab at the top of the page
2. Scroll down to the **"Build & Deploy"** section
3. Look for the **"Root Directory"** field
4. **CHANGE IT FROM**: `src` 
5. **CHANGE IT TO**: (leave it empty) or enter `.`
6. Click **"Save Changes"** button at the bottom

### Step 3: Verify Build Commands

While you're in Settings, verify these configurations:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

If they're different, update them to match the above.

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

## Expected Successful Build Output

Once configured correctly, you should see:

```
==> Cloning from https://github.com/pronghorn-cloud/netops-db-b4d95b2c
==> Checking out commit...
==> Using Node.js version 22.22.0
==> Running build command 'npm install && npm run build'...
==> Installing dependencies...
==> Building TypeScript...
==> Build succeeded ✓
==> Starting service with 'npm start'...
```

---

## Troubleshooting Additional Issues

### Issue: Build succeeds but app crashes on startup

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

---

## Files Fixed in This Repository

✅ `package.json` - Syntax errors corrected
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
