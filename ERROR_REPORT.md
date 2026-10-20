# Project Error Report - FYP Event Organization System

## Summary
The project has been analyzed for errors and issues. Below is a comprehensive list of findings:

---

## ✅ Completed Setup
- ✅ Backend dependencies installed (265 packages)
- ✅ Frontend dependencies installed (1,630 packages with --legacy-peer-deps)
- ✅ Vendor dependencies installed (1,657 packages with --legacy-peer-deps)
- ✅ Backend .env file created
- ✅ Backend server starts successfully on port 5000
- ✅ No syntax errors found in the codebase

---

## ⚠️ CRITICAL ISSUES FOUND

### 1. **Missing/Unconfigured Environment Variables**
**Location:** `backend/.env`
**Issue:** Missing required environment variables
**Current Status:** Partially configured
```
MONGODB_URI=mongodb://localhost:27017/fyp  ✓
JWT_SECRET=your_jwt_secret_key_here        ✓ (placeholder)
PORT=5000                                   ✓
PAYPAL_CLIENT_ID=missing                    ✗ (not set, defaults to "sb")
```
**Fix Required:**
- Add `PAYPAL_CLIENT_ID` - PayPal integration won't work properly
- Replace `your_jwt_secret_key_here` with a strong secret
- Ensure MongoDB is running at `mongodb://localhost:27017`

---

### 2. **Hardcoded Google Maps API Key (Security Risk)**
**Location:** 
- `frontend/src/index.js` (line 17)
- `vendor/src/index.js` (line 14)

**Issue:** API Key exposed in source code
```javascript
<LoadScript googleMapsApiKey="AIzaSyCalQJiurg9JMSct3LPGrIxFiAA_hpjQ3I">
```
**Impact:** 
- Security vulnerability
- API quotas can be abused by anyone with access to code
- Key should be moved to environment variables

**Fix Required:**
```bash
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key
```

---

### 3. **Dependency Vulnerabilities**
**Severity:** HIGH (2 critical, 18 high, 6 moderate, 9 low)

**Backend Vulnerabilities:** 35 vulnerabilities found
- 2 critical
- 18 high
- 6 moderate  
- 9 low

**Frontend Vulnerabilities:** 69 vulnerabilities found
- 3 critical
- 31 high
- 20 moderate
- 15 low

**Vendor Vulnerabilities:** 67 vulnerabilities found
- 2 critical
- 30 high
- 19 moderate
- 16 low

**Notable Deprecated Packages:**
- `@material-ui/core@4.12.4` - No longer maintained (migrate to MUI v5)
- `core-js@2.6.12` - No longer maintained
- `@material-ui/styles@4.11.5` - Deprecated
- `rollup-plugin-terser@7.0.2` - Deprecated (use @rollup/plugin-terser)
- `svgo@1.3.2` - Upgrade to v2.x.x

---

### 4. **Peer Dependency Mismatch (Frontend)**
**Location:** `frontend/package.json`
**Issue:** React 18.2.0 with Material-UI v4
```
Error: @material-ui/core@4.12.4 requires React ^16.8.0 || ^17.0.0
But React 18.2.0 is installed
```
**Status:** Working (installed with --legacy-peer-deps)
**Fix:** Upgrade Material-UI to v5 for React 18 compatibility

---

### 5. **MongoDB Connection Not Verified**
**Issue:** Backend can start without MongoDB running
**Impact:** 
- API calls requiring database will fail
- MongoDB must be running locally on port 27017
- No error handling for MongoDB connection failure

**Fix Required:**
- Ensure MongoDB service is running
- Test database connectivity
- Better error handling in server.js

---

### 6. **Frontend Proxy Connection Error**
**When Running:** Frontend starts on port 3000
**Error:** Cannot proxy to backend (ECONNREFUSED)
- Frontend expects backend on `localhost:5000`
- Backend must be running for API calls to work
- Ensure both backend and frontend are running concurrently

---

### 7. **Port Conflicts**
**Configuration:**
- Backend: port 5000 (configurable via PORT env var)
- Frontend: port 3000 (default React port)
- Vendor: port 3001 (assumed based on CORS config on server at line 41)

**Risk:** If ports are already in use, conflicts will occur

---

## 🔧 Missing Configuration Files

### Required Backend Files:
- `.env` - **CREATED** (needs PAYPAL_CLIENT_ID and stronger JWT_SECRET)

### Required Frontend Files:
- `.env.local` - NOT CREATED (needed for REACT_APP_GOOGLE_MAPS_API_KEY)

### Required Vendor Files:
- `.env.local` - NOT CREATED (needed for environment variables)

---

## 🚀 How to Run the Project

### Option 1: Run Backend & Frontend Separately
**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Expected output: `serve at http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Expected output: Compiling and opening http://localhost:3000

**Terminal 3 - Vendor (optional):**
```bash
cd vendor
npm start
```

### Option 2: Run Using Root package.json
```bash
npm run dev
```
This runs both backend (dev mode) and frontend (dev mode) concurrently

---

## 📋 Checklist - Required Before Running

- [ ] MongoDB is running locally on port 27017
- [ ] Update `.env` with proper PAYPAL_CLIENT_ID
- [ ] Generate and set a strong JWT_SECRET in `.env`
- [ ] (Optional) Move Google Maps API key to environment variables
- [ ] Ensure ports 3000, 3001, and 5000 are available
- [ ] Run `npm install` in backend, frontend, and vendor directories
- [ ] Verify Node.js version compatibility (recommend v16+)

---

## 📌 Known Issues & Limitations

1. **Material-UI v4 Deprecated** - Project uses old Material-UI version
2. **Hardcoded API Keys** - Google Maps key exposed in code
3. **Missing .env.local files** - Frontend apps need environment setup
4. **High Vulnerability Count** - Multiple packages need updates
5. **No Environment Validation** - Server doesn't validate required env vars on startup
6. **MongoDB Connection Error Handling** - Errors not properly surfaced

---

## ✅ What's Working

- No syntax errors in any file
- Backend server starts successfully
- Dependencies installed (with legacy peer deps flag for frontend/vendor)
- Project structure is sound
- Routes are properly configured
- Express/Socket.IO setup is correct

---

## 📞 Summary

**Total Issues Found:** 7 major issues
**Critical Issues:** 3 (Environment config, MongoDB, API Key)
**Warnings:** 4 (Dependencies, Peer conflicts)
**Project Status:** Ready for testing with configuration

