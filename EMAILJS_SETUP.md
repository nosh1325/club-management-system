# EmailJS Setup Guide

## Quick Setup for Real Email Sending

### 1. Create EmailJS Account
- Go to https://www.emailjs.com/
- Sign up with your email
- Verify your account

### 2. Add Email Service
- Dashboard → Email Services → Add New Service
- Choose "Gmail" (easiest for testing)
- Connect your Gmail account
- Copy the **Service ID** (looks like: service_xxxxxxx)

### 3. Create Email Template
- Dashboard → Email Templates → Create New Template
- Template Name: "Club Management System"
- Template Content:
```
Subject: {{subject}}

Hello {{to_name}},

{{message}}

Best regards,
{{sender_name}}
From: {{club_name}}

---
This email was sent from the Club Management System.
```
- Save and copy the **Template ID** (looks like: template_xxxxxxx)

### 4. Get Public Key
- Dashboard → Account → General
- Copy your **Public Key** (looks like: user_xxxxxxxxxxxxxxx)

### 5. Update .env File
Replace the placeholder values in your .env file:
```
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_actual_public_key
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_actual_service_id  
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_actual_template_id
```

### 6. Restart Server
```bash
npm run dev
```

### 7. Test Email
- Login as admin: admin@bracu.ac.bd / admin123
- Go to Admin → Notifications
- Send test email
- Check recipient's inbox (including spam folder)

## Free Tier Limits
- EmailJS free tier: 200 emails/month
- Perfect for development and testing

## Troubleshooting
- If emails go to spam, ask recipients to mark as "Not Spam"
- Gmail may block emails initially - check Gmail security settings
- Verify all IDs are copied correctly (no extra spaces)
