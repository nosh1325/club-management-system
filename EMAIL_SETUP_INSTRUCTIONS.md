# Email Setup Instructions

## Current Issue
You're getting the error: "Authentication unsuccessful, basic authentication is disabled" because modern Outlook/Microsoft 365 accounts require proper App Password configuration.

## Solution: Set Up App Password for Outlook

### Step 1: Enable 2-Factor Authentication
1. Go to https://account.microsoft.com/security
2. Sign in with your `zeehan27@outlook.com` account
3. Find "Two-step verification" and turn it ON if not already enabled
4. Set up with your phone number or authenticator app

### Step 2: Generate App Password
1. Stay on the same security page
2. Look for "App passwords" section
3. Click "Create a new app password"
4. Choose "Mail" as the app type
5. Copy the 16-digit password that appears (example: abcd efgh ijkl mnop)

### Step 3: IMPORTANT - Remove Spaces from App Password
The App Password you provided: `RJ4AR-9BC59-QS8P5-2YKCP-YCN8B`
Should be formatted as: `RJ4AR9BC59QS8P52YKCPYCN8B` (no spaces or dashes)

### Step 4: Update .env File
1. Open your `.env` file
2. Find this line:
   ```
   EMAIL_PASSWORD=REPLACE_WITH_16_DIGIT_APP_PASSWORD
   ```
3. Replace it with:
   ```
   EMAIL_PASSWORD=RJ4AR9BC59QS8P52YKCPYCN8B
   ```

### Step 5: Additional Outlook Settings
If authentication still fails, try these steps:

1. **Check Account Type**: Make sure `zeehan27@outlook.com` is a personal Outlook account, not a work/school account
2. **Enable SMTP**: Some Outlook accounts have SMTP disabled by default
   - Go to Outlook.com settings
   - Find "Mail" > "Sync email"
   - Enable "Let devices and apps use POP"
3. **Try Alternative Settings**: Update your `.env` with:
   ```
   EMAIL_HOST=smtp.live.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   ```

### Step 6: Restart Server
1. Stop your development server (Ctrl+C in terminal)
2. Run `npm run dev` again
3. Test email functionality

## Alternative: Use Gmail Instead

If Outlook continues to cause issues, Gmail is often easier to set up:

### Gmail Setup
1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication
3. Go to https://myaccount.google.com/apppasswords
4. Generate an app password for "Mail"
5. Update your `.env` file:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-digit-gmail-app-password
EMAIL_FROM=Club Management System <your-gmail@gmail.com>
```

## Testing
Once configured, the system will:
- ✅ Send real emails when configured properly
- 🔄 Fall back to simulation mode if not configured
- 📝 Show helpful error messages for authentication issues

## Current Status
- System is working in **simulation mode**
- All functionality works except actual email delivery
- Emails are logged in the server console for testing

## Troubleshooting Common Issues

1. **"Authentication unsuccessful"**: App password format or 2FA not enabled
2. **"Connection refused"**: Wrong SMTP host or port
3. **"Timeout"**: Network firewall blocking SMTP ports
4. **"Too many connections"**: Rate limiting - add delays between emails
