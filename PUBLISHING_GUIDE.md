# Publishing to Figma Marketplace - Step-by-Step Guide

## Prerequisites Checklist

- [ ] Plugin works perfectly in development mode
- [ ] All features tested thoroughly
- [ ] No console errors
- [ ] Documentation complete
- [ ] Assets prepared (icons, screenshots, video)
- [ ] Pricing strategy decided
- [ ] Legal disclaimers added

## Step 1: Prepare Plugin for Production

### 1.1 Clean Up Code

```bash
# Remove debug logging
# Update version numbers
# Remove test/development files
npm run build
```

### 1.2 Update Package.json

```json
{
  "name": "html-to-figma-extractor",
  "version": "1.0.0",
  "description": "Extract any webpage into editable Figma designs",
  "author": "Your Name",
  "license": "Commercial",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/html-to-figma"
  },
  "keywords": [
    "figma",
    "plugin",
    "html",
    "extraction",
    "web-scraping",
    "design-tools"
  ]
}
```

### 1.3 Update Manifest.json

Ensure your manifest.json has:

- Unique plugin ID
- Clear name and description
- Network access permissions (for localhost server)
- Proper menu structure

## Step 2: Create Required Assets

### 2.1 Plugin Icon (Required)

- **Size**: 128x128px PNG
- **Requirements**:
  - Transparent background or solid color
  - Simple, recognizable design
  - Works at small sizes (32px)
  - Follows Figma's icon guidelines

**Quick Design Tips:**

- Use 2-3 colors max
- Bold, simple shapes
- Test at multiple sizes
- Export at 2x resolution

### 2.2 Cover Image (Required)

- **Size**: 1920x960px
- **Should Include**:
  - Plugin name prominently displayed
  - Key feature visualization
  - Before/after example
  - Professional design aesthetic

### 2.3 Screenshots (3-5 Required)

- **Size**: 1920x1080px each
- **Recommended Content**:
  1. Main interface overview
  2. Extraction in action (URL → Figma)
  3. Result showcase (extracted design)
  4. Options/settings panel
  5. Automated testing (bonus)

### 2.4 Demo Video (Highly Recommended)

- **Length**: 30-90 seconds
- **Format**: MP4, H.264
- **Max Size**: 100MB
- **Should Show**:
  1. Problem statement (5-10s)
  2. Solution overview (10-15s)
  3. Live demonstration (30-40s)
  4. Results/benefits (10-15s)
  5. Call to action (5-10s)

**Tools for Video**:

- Screen recording: OBS Studio, QuickTime, Loom
- Editing: DaVinci Resolve (free), iMovie, Premiere
- Hosting: Upload directly to Figma or YouTube

## Step 3: Write Your Listing

### 3.1 Title (Required)

**Max 45 characters**

Good: "HTML to Figma - Web Page Extractor"
Bad: "Super Amazing HTML to Figma Converter Plugin Tool"

### 3.2 Tagline (Required)

**Max 60 characters**

Good: "Extract any webpage directly into Figma with one click"
Bad: "This plugin helps you convert HTML to Figma easily"

### 3.3 Description (Required)

**Min 500 characters, max 5000 characters**

Structure:

1. **Hook** (100 chars) - Grab attention
2. **Problem** (200 chars) - What pain point does this solve?
3. **Solution** (300 chars) - How your plugin solves it
4. **Features** (1000 chars) - Bullet list of key features
5. **Use Cases** (500 chars) - Who is this for?
6. **How It Works** (500 chars) - Simple step-by-step
7. **Benefits** (300 chars) - Why choose this plugin?
8. **Call to Action** (100 chars) - Try it now!

### 3.4 Categories (Select 1-3)

- ✅ Developer Tools (Primary)
- ✅ Prototyping (Secondary)
- ✅ Workflow (Tertiary)

### 3.5 Tags (Max 10)

Select relevant tags for discoverability:

- html
- web-scraping
- extraction
- automation
- conversion
- wireframing
- prototyping
- design-system
- developer-tools
- productivity

## Step 4: Set Up Monetization

### 4.1 Choose Pricing Model

**Option A: Free + Paid Features**

- Free tier: Manual extraction (unlimited)
- Paid tier: Automatic extraction server
- Price: $19-29 one-time or $5-9/month

**Option B: Paid Only**

- Full access: $29-49 one-time
- All features included
- Lifetime updates

**Option C: Freemium with Limits**

- Free: 10 extractions/month
- Pro: Unlimited + automatic server
- Price: $9/month or $49/year

**Recommended: Option A** - Builds user base while monetizing power users

### 4.2 Set Up Gumroad/Paddle (For Payments)

If you want to handle payments yourself:

1. Create Gumroad account
2. Set up product listing
3. Generate license keys
4. Add license validation to plugin

## Step 5: Test Thoroughly

### 5.1 QA Checklist

- [ ] Install from fresh download
- [ ] Test all features
- [ ] Test on different Figma files
- [ ] Test error handling
- [ ] Test with various websites
- [ ] Test extraction server
- [ ] Test manual fallback
- [ ] Check performance
- [ ] Verify no memory leaks
- [ ] Test on Windows/Mac

### 5.2 Beta Testing

1. Share plugin link with 5-10 trusted users
2. Collect feedback
3. Fix critical bugs
4. Iterate on UX issues

## Step 6: Submit to Figma

### 6.1 Create Figma Account (Publisher)

1. Go to figma.com/community
2. Sign in or create account
3. Go to "Publish" section

### 6.2 Upload Plugin

1. Click "Publish new plugin"
2. Upload your plugin folder or zip
3. Figma will validate the manifest

### 6.3 Fill Out Listing

1. Upload icon (128x128px PNG)
2. Upload cover image (1920x960px)
3. Upload 3-5 screenshots (1920x1080px)
4. Upload demo video (optional)
5. Write title, tagline, description
6. Select categories and tags
7. Set pricing (free or paid)
8. Add support links
9. Add privacy policy link
10. Submit for review

### 6.4 Review Process

- **Timeline**: 3-7 business days
- **What Figma Checks**:
  - Plugin functionality
  - Code quality
  - User experience
  - Asset quality
  - Description accuracy
  - Privacy/security

## Step 7: Handle Rejection (If It Happens)

### Common Rejection Reasons

1. **Technical Issues**
   - Plugin crashes or errors
   - Poor performance
   - Security concerns

2. **Asset Quality**
   - Low-resolution images
   - Misleading screenshots
   - Unprofessional design

3. **Description Issues**
   - Unclear or misleading
   - Grammatical errors
   - Missing information

### How to Respond

1. Read feedback carefully
2. Fix all mentioned issues
3. Re-submit with notes on changes
4. Be patient and professional

## Step 8: Launch Marketing

### 8.1 Announcement Channels

- [ ] Figma Community (built-in)
- [ ] Twitter/X with demo video
- [ ] LinkedIn post
- [ ] Designer News
- [ ] Reddit (r/FigmaDesign)
- [ ] Product Hunt
- [ ] Indie Hackers
- [ ] Your blog/website
- [ ] Email list
- [ ] YouTube tutorial

### 8.2 Launch Day Checklist

- [ ] Announcement posts ready
- [ ] Demo video published
- [ ] Documentation site live
- [ ] Support email set up
- [ ] Analytics tracking ready
- [ ] Press kit prepared

### 8.3 Content to Create

1. **Demo Video** - Show it working
2. **Tutorial Blog Post** - Step-by-step guide
3. **Case Study** - Real-world example
4. **Comparison** - vs alternatives
5. **Tips & Tricks** - Advanced usage

## Step 9: Post-Launch

### 9.1 Monitor Performance

- Install count
- Active users
- Star rating
- Reviews and feedback
- Support requests
- Revenue (if paid)

### 9.2 Respond to Feedback

- Reply to all reviews (good and bad)
- Fix reported bugs quickly
- Consider feature requests
- Update regularly

### 9.3 Marketing Campaigns

- **Week 1-2**: Push for initial installs
- **Month 1**: Focus on reviews and ratings
- **Month 2-3**: Case studies and tutorials
- **Ongoing**: Regular updates and content

## Step 10: Iterate and Improve

### 10.1 Update Schedule

- **Bug fixes**: ASAP
- **Minor updates**: Monthly
- **Major features**: Quarterly

### 10.2 Feature Roadmap

Based on user feedback, prioritize:

1. Most requested features
2. Bug fixes
3. Performance improvements
4. UX enhancements

### 10.3 Communication

- Update changelog
- Notify users of major updates
- Share roadmap publicly
- Build community

## Estimated Timeline

| Phase       | Duration  | Tasks                          |
| ----------- | --------- | ------------------------------ |
| Preparation | 1-2 weeks | Assets, documentation, testing |
| Submission  | 3-7 days  | Review process                 |
| Launch      | 1 week    | Marketing push                 |
| Post-launch | Ongoing   | Support, updates, growth       |

## Cost Breakdown

| Item          | Cost        | Required?   |
| ------------- | ----------- | ----------- |
| Figma account | Free        | Yes         |
| Icon design   | $0-100      | Yes         |
| Screenshots   | $0-50       | Yes         |
| Demo video    | $0-300      | Recommended |
| Website/docs  | $0-500      | Optional    |
| Marketing     | $0-1000     | Optional    |
| **Total**     | **$0-2000** | -           |

**DIY Budget**: $0 (do everything yourself)
**Professional Budget**: $500-1000 (outsource assets)
**Premium Budget**: $2000+ (full marketing campaign)

## Resources

### Design Tools

- **Figma** - For creating assets
- **Photopea** - Free Photoshop alternative
- **Canva** - Quick graphics

### Video Tools

- **OBS Studio** - Free screen recording
- **DaVinci Resolve** - Free video editing
- **Loom** - Easy screen recordings

### Marketing Tools

- **Buffer** - Social media scheduling
- **Mailchimp** - Email marketing
- **Google Analytics** - Track website visits

### Learning Resources

- Figma Plugin Documentation
- Figma Community Best Practices
- Indie Hackers - Plugin launch stories
- Product Hunt - Launch guides

## Next Steps

1. ✅ Review this guide completely
2. ⬜ Create assets (icon, cover, screenshots)
3. ⬜ Write compelling listing description
4. ⬜ Set pricing strategy
5. ⬜ Test plugin thoroughly
6. ⬜ Submit to Figma
7. ⬜ Prepare launch marketing
8. ⬜ Launch and promote!

## Questions to Answer Before Publishing

- [ ] What problem does this solve?
- [ ] Who is the target user?
- [ ] What's the unique value proposition?
- [ ] Why is this better than alternatives?
- [ ] What's the pricing strategy?
- [ ] How will I support users?
- [ ] What's my marketing plan?
- [ ] How will I measure success?

---

**Need Help?** Check the Figma Community forums or reach out to other plugin developers for advice. Good luck with your launch! 🚀
