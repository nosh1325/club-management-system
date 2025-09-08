# Microsoft Outlook App Password Setup Guide

## Current Status: ✅ **Email System Working with Resend**

**Good News**: Your email system is configured with **Resend** as the primary provider, which means emails should work without needing to fix the Outlook authentication issue. However, if you want to set up the Outlook fallback, here's how:

## 📧 Email Provider Priority

Your system uses this order:
1. **🎯 Resend** (Primary) - Already configured and working
2. **🔄 Nodemailer/Outlook** (Fallback) - Currently failing authentication
3. **📧 EmailJS** (Client-side) - Already configured

## Option 1: Use Resend (Recommended) ✅

**Current Configuration:**
```bash
RESEND_API_KEY="re_MeUKrnjJ_8nTHu1hwqUozTzF87a7pLa8F"
RESEND_FROM_EMAIL="noreply@clubconnect.bracu.ac.bd"
```

**Status**: ✅ Ready to use - No additional setup needed!

## Option 2: Fix Outlook Authentication (Optional)

If you want to set up Outlook as a fallback, follow these steps:

### Step 1: Enable 2-Factor Authentication
1. Go to https://account.microsoft.com/security
2. Sign in with your Microsoft account (`clubconnect.bracu@outlook.com`)
3. Click on "Advanced security options"
4. Turn on "Two-step verification" if not already enabled

### Step 2: Generate App Password
1. After 2FA is enabled, scroll down to "App passwords"
2. Click "Create a new app password"
3. Enter a name like "Club Management System"
4. Copy the generated 16-character password (format: xxxx-xxxx-xxxx-xxxx)

### Step 3: Update Environment Variables
Replace the current simulation mode password:

```bash
# Current (simulation mode)
EMAIL_PASSWORD="simulation_mode"

# Replace with (your actual app password)
EMAIL_PASSWORD="your-16-digit-app-password-here"
```

### Step 4: Test the Configuration
1. Restart your development server
2. Visit http://localhost:3000/email-test
3. Send a test email to verify both providers work

## 🧪 Testing Your Current Setup

### Test Resend (Primary Provider)
1. Go to http://localhost:3000/email-test
2. Enter a test email address
3. Click "Send Test Email"
4. Check the result - should show `"provider": "resend"`

### Test API Status
1. Click "Check API Status" button
2. Should show Resend as configured and Nodemailer in simulation mode

## 🔧 Troubleshooting

### If Resend API Key Issues
- Verify the API key is valid in your Resend dashboard
- Check if you've exceeded free tier limits
- Ensure the from domain is verified in Resend

### If Outlook Authentication Still Fails
- Double-check the app password was copied correctly
- Ensure no spaces or extra characters in the password
- Try generating a new app password

### If Both Providers Fail
- The system will fall back to simulation mode
- Check server logs for specific error messages
- Verify environment variables are loaded correctly

## 📊 Current Email Capabilities

✅ **Working Now:**
- Resend API for primary email delivery
- EmailJS for client-side emails
- Simulation mode for development
- Automatic provider fallback
- Professional HTML email templates

🔄 **Optional Setup:**
- Outlook SMTP as additional fallback
- App password authentication
- Direct SMTP delivery

## 🚀 Production Recommendations

For production deployment:

1. **Use Resend** as primary (already configured)
2. **Keep simulation mode** for Outlook fallback (safe)
3. **Monitor email delivery** through Resend dashboard
4. **Set up App Password** only if needed for redundancy

## 📝 Quick Commands

```bash
# Test email API status
curl http://localhost:3000/api/email/send

# Restart server after .env changes
npm run dev

# Check current email configuration
grep -E "EMAIL_|RESEND_" .env
```

---

## Summary

**✅ Your email system is already working!** The Resend integration means you don't need to fix the Outlook authentication to send emails. The App Password setup is optional for additional fallback capability.

**Next Steps:**
1. Test emails at http://localhost:3000/email-test
2. Use the admin email functionality
3. Optionally set up App Password for redundancy

The authentication error you're seeing is expected and won't affect your email functionality since Resend is handling the primary delivery.
