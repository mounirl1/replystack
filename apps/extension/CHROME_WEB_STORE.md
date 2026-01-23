# Chrome Web Store Submission Guide

## 1. Store Listing Information

### Extension Name
```
ReplyStack - AI Review Replies
```

### Short Description (132 characters max)
```
AI replies for Google, TripAdvisor, Booking & more. Save 10+ hours/week on review management. Free plan!
```
(105 characters)

### Detailed Description (16,000 characters max)
```
ReplyStack helps businesses respond to customer reviews faster with AI-powered reply generation. Works directly on Google Business, TripAdvisor, Booking.com, Yelp, and more review platforms.

🚀 KEY FEATURES

✨ AI-Powered Reply Generation
Generate professional, personalized responses to customer reviews in seconds. Our AI understands context, sentiment, and tone to craft the perfect reply.

🌐 Multi-Platform Support
Works seamlessly on:
• Google Business Profile
• TripAdvisor
• Booking.com
• Yelp
• And more coming soon!

🎨 Customizable Response Style
• Choose your preferred tone (Professional, Warm, Casual, Luxury, Dynamic)
• Set response length (Short, Medium, Detailed)
• Configure business-specific settings for personalized replies

🔄 Automatic Review Sync
Connect your locations and automatically sync reviews to your dashboard for centralized management.

💬 Multiple Languages
Generate replies in the same language as the review or choose your preferred language. Supports English, French, Spanish, German, Italian, Portuguese, and Dutch.

📊 Dashboard & Analytics
Track your review response performance, manage multiple locations, and view analytics from our web dashboard.

🔒 Privacy First
Your data is secure. We never share your information with third parties. See our privacy policy for details.

💰 PRICING PLANS

Free Plan - Get started for free:
• 15 AI replies per month
• Works on all platforms
• Basic customization

Starter Plan ($9.90/month):
• 50 AI replies per month
• Full customization options
• Priority support

Pro Plan ($29/month):
• 200 AI replies per month
• Advanced analytics
• Multiple locations

Business Plan ($79/month):
• 500 AI replies per month
• Team collaboration
• API access

🏆 WHY CHOOSE REPLYSTACK?

• Save 10+ hours per week on review management
• Improve your response rate to 100%
• Boost customer satisfaction with timely responses
• Maintain consistent brand voice across platforms
• No more writer's block when responding to reviews

📧 SUPPORT

Need help? Contact us at support@reply-stack.app
Visit our website: https://www.reply-stack.app

Made with ❤️ for businesses who care about customer feedback.
```

### Category
```
Productivity
```

### Language
```
English (United States)
```

---

## 2. Graphics Requirements

### Extension Icon
✅ Already included: `assets/icon.png` (512x512)
- Plasmo generates all required sizes (16, 32, 48, 64, 128)

### Screenshots (Required: 1-5)
Dimensions: 1280x800 or 640x400 (PNG or JPEG)

**Screenshot 1: Google Business Integration**
- Show the ReplyStack button injected on a Google Business review
- Caption: "One-click AI replies on Google Business"

**Screenshot 2: Reply Generation Modal**
- Show the popup modal with generated reply
- Caption: "Generate professional replies in seconds"

**Screenshot 3: Extension Popup**
- Show the logged-in popup with quota and features
- Caption: "Track your usage and access all platforms"

**Screenshot 4: Customization Options**
- Show tone/length selection in the modal
- Caption: "Customize tone and length for every reply"

**Screenshot 5: Multi-Platform Support**
- Show platform icons grid
- Caption: "Works on Google, TripAdvisor, Booking & more"

### Promotional Tile (Optional but recommended)
- Small: 440x280 PNG
- Large: 920x680 PNG or JPEG
- Marquee: 1400x560 PNG or JPEG

---

## 3. Privacy & Permissions

### Privacy Policy URL
```
https://www.reply-stack.app/privacy
```

### Permission Justifications

| Permission | Justification |
|------------|---------------|
| `storage` | Store user authentication token and preferences locally |
| `activeTab` | Access current tab to inject reply buttons on review pages |
| `alarms` | Schedule periodic review sync operations |
| `tabs` | Open dashboard and authentication pages |

### Host Permissions Justification
```
The extension needs access to these domains to inject reply buttons and extract review data:
- business.google.com: Google Business Profile review management
- tripadvisor.com: TripAdvisor owner center
- admin.booking.com: Booking.com extranet
- biz.yelp.com: Yelp for Business
- api.reply-stack.app: Our API for AI reply generation
```

### Data Usage Declaration
```
We collect:
- Email address for account authentication
- Review content (temporarily, for AI processing only)
- Usage statistics for quota management

We do NOT:
- Sell user data
- Share data with third parties (except AI processing)
- Store review content permanently
- Track browsing history outside supported platforms
```

---

## 4. Build Instructions

### Prerequisites
```bash
# Install dependencies
cd apps/extension
pnpm install
```

### Build for Production
```bash
# Build Chrome extension (creates zip with version in filename)
pnpm build:chrome

# Output: build/replystack-chrome-v1.0.0.zip
```

### Build for Firefox
```bash
pnpm build:firefox

# Output: build/replystack-firefox-v1.0.0.zip
```

---

## 5. Pre-Submission Checklist

### Technical Checks
- [ ] Build completes without errors
- [ ] Extension loads in Chrome (chrome://extensions in developer mode)
- [ ] All content scripts inject correctly on supported platforms
- [ ] Authentication flow works
- [ ] Reply generation works
- [ ] No console errors in background script
- [ ] No console errors in content scripts

### Manifest Checks
- [ ] Version number is correct
- [ ] All required icons are present
- [ ] Permissions are minimal and justified
- [ ] Privacy policy URL is valid and accessible

### Store Listing Checks
- [ ] Description is accurate and compelling
- [ ] Screenshots show actual functionality
- [ ] Category is appropriate
- [ ] Contact email is valid

### Legal Checks
- [ ] Privacy policy is up to date
- [ ] Terms of service are published
- [ ] No trademark violations in name/description

---

## 6. Submission Process

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

2. Pay one-time $5 developer fee (if first submission)

3. Click "New Item" and upload the zip file

4. Fill in store listing:
   - Name, descriptions, category
   - Upload screenshots
   - Add privacy policy URL

5. Fill in Privacy tab:
   - Declare permissions usage
   - Declare data collection practices
   - Single purpose description

6. Submit for review

### Review Timeline
- First submission: 1-3 business days
- Updates: Usually faster (hours to 1 day)

---

## 7. Post-Publication

### Monitoring
- Check reviews and ratings regularly
- Respond to user feedback
- Monitor crash reports in Developer Dashboard

### Updates
```bash
# Increment version in package.json
# Then rebuild and repackage
pnpm build && pnpm package
```

### Support Channels
- Email: support@reply-stack.app
- Website: https://www.reply-stack.app/help
- In-app: Feedback button in extension popup

---

## 8. Environment Variables

Make sure `.env.production` has correct values:

```env
PLASMO_PUBLIC_API_URL=https://api.reply-stack.app
PLASMO_PUBLIC_WEB_URL=https://www.reply-stack.app
```
