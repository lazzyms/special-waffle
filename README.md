# Dubai Trip PWA

A Progressive Web App (PWA) for tracking your Dubai trip daily routes, fully compatible with iOS and Android devices.

## Features

✅ **Installable** - Add to home screen on iOS and Android  
✅ **Offline Support** - Works without internet connection after first load  
✅ **Responsive** - Optimized for all screen sizes  
✅ **Fast Loading** - Cached resources for instant access  
✅ **Native Feel** - Fullscreen experience when installed

## PWA Components

1. **manifest.json** - App configuration and metadata
2. **sw.js** - Service worker for offline functionality and caching
3. **Icons** - Multiple sizes for different devices and contexts
4. **Meta tags** - iOS-specific tags for optimal experience

## Setup Instructions

### 1. Generate Icons

You have two options to generate the required PWA icons:

#### Option A: Using the HTML Generator (Easiest)

1. Open `generate-icons.html` in your browser
2. Click "Generate & Download Icons"
3. Save all downloaded icons to the `/icons/` folder

#### Option B: Use Your Own Icons

- Create icons in the following sizes: 16x16, 32x32, 72x72, 96x96, 128x128, 144x144, 152x152, 167x167, 180x180, 192x192, 384x384, 512x512
- Save them in the `/icons/` folder with naming pattern: `icon-{size}x{size}.png`

### 2. Testing Locally

To test the PWA locally with service workers, you need to serve it over HTTPS or localhost:

#### Using Python:

```bash
python3 -m http.server 8000
```

#### Using Node.js:

```bash
npx serve
```

#### Using PHP:

```bash
php -S localhost:8000
```

Then visit `http://localhost:8000`

### 3. Deployment

Deploy your PWA to any static hosting service that supports HTTPS:

- **GitHub Pages**: Free, supports custom domains
- **Netlify**: Free tier with automatic HTTPS
- **Vercel**: Free tier with automatic HTTPS
- **Firebase Hosting**: Free tier with automatic HTTPS
- **Cloudflare Pages**: Free tier with automatic HTTPS

### 4. Installation on Devices

#### iOS (Safari):

1. Open the site in Safari
2. Tap the Share button (📤)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

#### Android (Chrome):

1. Open the site in Chrome
2. Tap the menu button (⋮)
3. Tap "Add to Home Screen" or "Install App"
4. Tap "Install"

## File Structure

```
special-waffle/
├── index.html              # Main application file
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── generate-icons.html     # Icon generator utility
├── README.md              # This file
└── icons/                 # App icons directory
    ├── icon-16x16.png
    ├── icon-32x32.png
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-167x167.png
    ├── icon-180x180.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

## Browser Compatibility

- ✅ Chrome (Android & Desktop)
- ✅ Safari (iOS 16.4+)
- ✅ Edge (Windows, macOS, Android)
- ✅ Firefox (with limitations)
- ✅ Samsung Internet

## iOS Specific Features

The PWA includes iOS-specific meta tags for:

- Standalone mode (hides browser UI)
- Status bar styling
- Custom app title
- Apple touch icons

## Offline Functionality

The service worker caches:

- HTML, CSS, and JavaScript files
- App icons
- Previously visited pages

Users can access the app even without an internet connection after the first visit.

## Updating the App

When you make changes:

1. Update the `CACHE_NAME` version in `sw.js` (e.g., 'dubai-trip-v2')
2. Deploy the updated files
3. Users will automatically get the update on their next visit

## Troubleshooting

### Service Worker Not Registering

- Ensure you're serving over HTTPS or localhost
- Check browser console for errors
- Clear browser cache and try again

### App Not Installing on iOS

- Make sure all required meta tags are present
- Icons must be in PNG format
- Test in Safari (not Chrome on iOS)

### Icons Not Displaying

- Verify icon files exist in `/icons/` folder
- Check file names match the manifest
- Ensure icons are PNG format

## Security

- Always serve PWAs over HTTPS in production
- Service workers only work on secure contexts
- localhost is considered secure for development

## Performance Tips

1. Keep the initial cache small (only essential files)
2. Use appropriate cache strategies for different resources
3. Optimize images and icons
4. Minimize JavaScript bundle size

## Credits

Built for Dubai Trip 2026 - January 25-31

---

**Need Help?** Check browser console for PWA-related messages and errors.
