# Windows Setup Guide

## Issue: better-sqlite3 Installation

The `better-sqlite3` package requires Python to compile native modules on Windows.

## Solution Options

### Option 1: Install Python (Recommended)

1. **Download Python 3.11 or 3.12** from [python.org](https://www.python.org/downloads/)
2. **During installation**, check "Add Python to PATH"
3. **Restart your terminal/PowerShell**
4. **Verify installation:**
   ```powershell
   python --version
   ```
5. **Install build tools:**
   ```powershell
   npm install --global windows-build-tools
   ```
   Or install Visual Studio Build Tools manually from Microsoft.

6. **Try installing again:**
   ```powershell
   npm install
   ```

### Option 2: Use Prebuilt Binaries (Easier)

Try installing with the `--build-from-source=false` flag:

```powershell
npm install --build-from-source=false
```

### Option 3: Alternative - Use sql.js (No Native Dependencies)

If you continue having issues, we can switch to `sql.js` which doesn't require native compilation. However, this would require some code changes.

## Quick Test

After installing Python, try:

```powershell
npm install
npm run seed
npm run dev
```

## Current Status

- ✅ Authentication system implemented
- ✅ Login/Register pages created
- ✅ Seed data script ready
- ⚠️ Need to install dependencies (requires Python)

Once dependencies are installed, you can:
1. Run `npm run seed` to populate the database
2. Run `npm run dev` to start the application
3. Login with `admin@newspaper.com` / `password123`

