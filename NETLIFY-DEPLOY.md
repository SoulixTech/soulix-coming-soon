# Coming Soon Page - Netlify Deployment

## 🚀 Quick Deploy to Netlify

### Files Needed:
- index.html
- style.css
- function.js
- server.js
- package.json
- Something Big is Coming Soon..mp4

### Netlify Configuration:

1. **Build Settings:**
   - Build command: (leave empty for static site)
   - Publish directory: `.`

2. **For Video to Work:**
   - Upload the video file: `Something Big is Coming Soon..mp4`
   - Make sure video is in the same directory as index.html

3. **For Email Database (Optional):**
   If you want email subscriptions to work on Netlify:
   - Use Netlify Functions
   - Or use a third-party service like FormSpree, Netlify Forms, or EmailJS

### Testing Locally:
```bash
npm install
npm start
```
Then open: http://localhost:3000

### Video Not Playing?

If video doesn't autoplay on Netlify:
- Video should be muted (already set)
- Video has autoplay attribute (already added)
- Video format should be MP4 H.264
- File size should be reasonable (under 50MB recommended)

### Simple Deployment:

Just drag and drop these files to Netlify:
- index.html
- style.css  
- function.js
- Something Big is Coming Soon..mp4

The site will work as a static site with the video intro and countdown!

## 📧 Email Collection

For production, consider:
- Netlify Forms (free, easy)
- FormSpree
- EmailJS
- Or keep using Node.js with Netlify Functions
