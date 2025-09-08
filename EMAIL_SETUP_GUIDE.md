# Real Email Service Setup Guide

## 🚀 **Setting Up Real Email Sending with Gmail**

### **Step 1: Enable Gmail App Passwords**

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/
   - Sign in with your Gmail account

2. **Enable 2-Factor Authentication** (Required)
   - Security → 2-Step Verification → Get Started
   - Follow the setup process

3. **Generate App Password**
   - Security → App passwords
   - Select app: "Mail"
   - Select device: "Other (custom name)"
   - Enter: "Club Management System"
   - Copy the 16-character password (save it securely)

### **Step 2: Update Environment Variables**

Edit your `.env` file and replace the placeholder values:

```env
# Email Configuration for Nodemailer (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM=Club Management System <your-gmail-address@gmail.com>
```

**Example:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=admin@bracu.ac.bd
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=Club Management System <admin@bracu.ac.bd>
```

### **Step 3: Restart the Server**

```bash
npm run dev
```

### **Step 4: Test Email Sending**

1. **Login as Admin**: `admin@bracu.ac.bd` / `admin123`
2. **Go to**: Admin → Notifications
3. **Send a test email** to any user
4. **Check recipient's inbox** (including spam folder)

### **Step 5: Verify Success**

✅ **Success indicators:**
- No "simulation" message in the response
- Real message ID returned
- Email appears in recipient's inbox
- Server logs show "Email sent successfully"

❌ **If still simulating:**
- Check environment variables are correct
- Restart the server
- Check Gmail app password is valid

## 🔧 **Alternative Email Providers**

### **Outlook/Hotmail**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-outlook-password
```

### **Yahoo Mail**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

### **Custom SMTP Server**
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
```

## 📧 **Features of the Real Email System**

✅ **Server-side sending** (more reliable than client-side)
✅ **HTML email templates** with professional styling
✅ **Bulk email support** for club communications
✅ **Automatic logging** of sent emails
✅ **Rate limiting** to prevent spam
✅ **Fallback simulation** if SMTP not configured
✅ **Error handling** and detailed feedback

## 🛡️ **Security Best Practices**

- ✅ Use app passwords, not regular passwords
- ✅ Never commit real credentials to version control
- ✅ Use environment variables for all sensitive data
- ✅ Regularly rotate app passwords
- ✅ Monitor email sending for unusual activity

## 🔍 **Troubleshooting**

### **Email goes to spam:**
- Ask recipients to mark as "Not Spam"
- Use a proper "From" name and email
- Include unsubscribe instructions

### **Authentication failed:**
- Verify app password is correct
- Check 2FA is enabled
- Ensure EMAIL_USER matches the Gmail account

### **Connection timeout:**
- Check firewall settings
- Try different EMAIL_PORT (465 with EMAIL_SECURE=true)
- Verify internet connection

### **Still seeing simulation:**
- Check all environment variables are set
- Restart the development server
- Look for error messages in server console

## 📞 **Support**

If you encounter issues:
1. Check the server console for error messages
2. Verify all environment variables are correct
3. Test with a simple email client first
4. Check Gmail security settings
