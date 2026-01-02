# Email Link Authentication Setup Guide

## Overview
Email link authentication allows users to sign up and log in using a secure email link without passwords.

## Firebase Console Configuration

### Step 1: Enable Email Link Authentication
1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. Find **Email/Password** provider and click on it
3. Enable **"Email link (passwordless sign-in)"**
4. Save changes

### Step 2: Configure Authorized Domains
1. Go to **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
2. Add your domain(s):
   - For localhost development: `localhost`
   - For production: Your actual domain (e.g., `nearcare.com`)

### Step 3: Environment Variables (.env or .env.local)
Make sure your `.env.local` file has:

```
VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_PROJECT_ID=your_project_id
VITE_APP_URL=http://localhost:5173  (for development)
```

For production, change `VITE_APP_URL` to your actual domain.

## Features

### Login with Email Link
1. User clicks "📧 Sign in with Email Link" on login page
2. Enters their email address
3. Receives email with verification link
4. Clicking the link verifies and logs them in
5. User is redirected based on their role (patient/clinic/pharmacy)

### Signup with Email Link
1. User fills in name, email, and selects account type (Patient/Clinic/Pharmacy)
2. For Pharmacy: Must grant location access
3. Clicks "📧 Sign Up with Email Link"
4. Receives email with signup confirmation link
5. Clicking the link completes account creation
6. User profile is automatically created with provided information

### Email Verification Flow
- Email link redirects to `/verify-email` page
- Page automatically processes the email link authentication
- If email was not saved locally, user can manually enter it
- Automatically redirects to appropriate dashboard after verification

## User Experience Flow

### Signup with Email Link
```
User fills form → Clicks "Sign Up with Email Link" 
→ Email sent confirmation shown 
→ User receives email 
→ Clicks email link 
→ Redirected to verify-email page 
→ Account created 
→ Redirected to complete-profile page
```

### Login with Email Link
```
User enters email 
→ Clicks "Sign in with Email Link" 
→ Success message shown 
→ User receives email 
→ Clicks email link 
→ Redirected to verify-email page 
→ Authenticated 
→ Redirected to dashboard
```

## Security Notes

1. **Email Verification**: The email link is only valid for 1 hour by default
2. **No Password Needed**: More secure than password authentication
3. **localStorage**: Email is stored in localStorage temporarily for verification
4. **Session Handling**: Firebase automatically handles the session after email verification

## Troubleshooting

### Email Not Received
- Check spam/junk folder
- Verify email domain is added to Firebase authorized domains
- Check `VITE_APP_URL` environment variable is correct

### "Invalid Email Link" Error
- Email link may have expired (valid for 1 hour)
- User can enter email manually on verification page
- Ensure domain in email link matches your authorized domain

### Redirect Not Working
- Check user role is properly set in Firestore
- Verify user has required fields (name, phone, role) for profile completion
- Check browser console for errors

## Files Modified/Created

- **firebaseConfig.js** - Added `actionCodeSettings` for email link configuration
- **Login.jsx** - Added email link sign-in option
- **Signup.jsx** - Added email link sign-up option
- **EmailVerification.jsx** - NEW component to handle email link verification
- **App.jsx** - Added `/verify-email` route

## Testing Email Link Auth

### Development
1. Use a real email address (test email accounts work fine)
2. Set `VITE_APP_URL=http://localhost:5173` in .env.local
3. Run `npm run dev`
4. Test signup/login with email link

### Production
1. Update `VITE_APP_URL` to your actual domain
2. Ensure domain is added to Firebase authorized domains
3. Deploy and test with actual users
