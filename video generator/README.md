# 🎬 AI Video Generator

A modern web application that generates professional AI-powered videos from text using cutting-edge APIs (D-ID and Tavus). No installation required - just HTML, CSS, and JavaScript!

## Features

✨ **Key Features:**
- 🤖 Multiple AI Avatar Options (D-ID & Tavus)
- 🎙️ Professional Voice Selection
- 🎨 Customizable Video Styles
- 📊 Progress Tracking
- 📹 Video Preview & Download
- 📜 Generation History
- 💾 Local Storage Integration
- 📱 Fully Responsive Design
- ⚡ Real-time Status Updates

## Quick Start

### 1. Get API Keys

**D-ID API:**
1. Visit [D-ID Platform](https://www.d-id.com)
2. Sign up for a free account
3. Go to Settings → API Keys
4. Copy your API Key

**Tavus API:**
1. Visit [Tavus Platform](https://www.tavus.io)
2. Sign up for a free account
3. Go to Dashboard → API Keys
4. Copy your API Key

### 2. Configure API Keys

1. Open the application in your browser
2. A settings prompt will appear if no keys are configured
3. Enter your D-ID and/or Tavus API keys
4. Click "Save Settings"

**Settings are saved locally** - you won't need to enter them again!

### 3. Generate Your First Video

1. **Enter Text**: Write or paste the script for your video (max 5000 characters)
2. **Select Avatar**: Choose a talking avatar
3. **Pick Voice**: Select from available voice options
4. **Choose Style**: Pick a video style (Professional, Casual, Educational, Marketing)
5. **Select Background**: Choose background style
6. **Click Generate**: Start the video generation process

### 4. Download & Share

Once your video is ready:
- ▶️ **Preview** in the built-in player
- ⬇️ **Download** as MP4
- 📝 **Access History** of all generated videos

## API Integration

### D-ID API

**Supported Features:**
- Multiple language voices
- Realistic avatar animations
- Professional video quality
- Real-time processing

**API Endpoint:** `https://api.d-id.com/talks`

**Example Response:**
```json
{
  "id": "talk_123",
  "status": "done",
  "result_url": "https://video-url.mp4"
}
```

### Tavus API

**Supported Features:**
- Custom avatar creation
- Multiple video styles
- HD/4K Resolution
- Batch processing

**API Endpoint:** `https://api.tavus.io/v1/video-generation`

## Video Options

### Avatar Types
- **D-ID Avatars**: Professional, Casual, Realistic options
- **Tavus Avatars**: Custom-trained avatars with unique personalities

### Voice Options
| Type | Provider | Details |
|------|----------|---------|
| Male - Deep | Both | Deep, authoritative tone |
| Male - Neutral | Both | Clear, standard tone |
| Female - Warm | Both | Friendly, approachable tone |
| Female - Professional | Both | Business, confident tone |

### Video Styles
- **Professional**: Corporate presentations, business content
- **Casual**: Social media, friendly content
- **Educational**: Tutorials, educational content
- **Marketing**: Promotional, sales-focused content

### Background Options
- Solid Blue
- Solid White
- Gradient
- Custom Image

## File Structure

```
video-generator/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling
├── app.js              # Main application logic
├── config.js           # API configuration
└── README.md           # This file
```

## Technical Details

### Technologies Used
- **HTML5**: Semantic structure
- **CSS3**: Modern responsive design
- **JavaScript ES6**: Async/await, Fetch API
- **Local Storage**: Persistent data storage
- **REST APIs**: D-ID and Tavus integration

### Browser Compatibility
- Chrome/Chromium: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support
- IE11: ❌ Not supported

### Performance
- Initial Load: ~100ms
- Video Generation: 1-3 minutes (depends on API)
- Download Size: ~50KB (uncompressed)

## How It Works

### Generation Process

```
1. User Input (Script, Avatar, Voice) 
   ↓
2. API Authentication (Bearer Token)
   ↓
3. Send Video Generation Request
   ↓
4. Receive Job ID
   ↓
5. Poll API for Status (Every 3 seconds)
   ↓
6. Video Processing on Server
   ↓
7. Video Complete → Return URL
   ↓
8. Display Preview + Download
   ↓
9. Save to History
```

### Data Flow

```javascript
// Example: Generating with D-ID
const payload = {
  script: { type: 'text', input: 'Your text here' },
  config: { fluent: true }
}

// API returns job ID
// Poll: GET /talks/{job_id}
// Receive: { status: 'done', result_url: 'https://...' }
// Display video in player
```

## Advanced Features

### History Management
- Stores up to 20 recent generations
- Quick replay of past videos
- One-click delete from history
- Timestamped entries

### Error Handling
- Network error recovery
- API timeout management
- User-friendly error messages
- Automatic retry logic

### Settings
All settings stored in browser's Local Storage:
- API Keys (encrypted storage recommended)
- Generation history
- User preferences

## API Rate Limits

### D-ID
- **Free Tier**: 5 videos/day
- **Pro Tier**: 100 videos/day
- **Enterprise**: Custom limits

### Tavus
- **Free Tier**: 10 videos/month
- **Pro Tier**: Unlimited
- **Enterprise**: Custom limits

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never** commit API keys to version control
2. Use environment variables in production
3. API keys are visible in browser (Local Storage)
4. For production: Use backend proxy for API calls
5. Implement rate limiting on backend

### Production Implementation

For production use, consider:
1. Moving API keys to backend environment variables
2. Creating a backend proxy endpoint
3. Adding user authentication
4. Implementing request signing
5. Using CDN for video delivery

## Troubleshooting

### "API Key Not Found"
- Ensure API key is correctly configured
- Check for spaces or typos in key
- Verify key is valid on the provider's dashboard

### "Video Generation Timeout"
- Check internet connection
- Verify API service status
- Try again with shorter text
- Check API rate limits

### "Video Won't Download"
- Clear browser cache
- Try different browser
- Check popup blocker settings
- Ensure enough disk space

### "Settings Not Saving"
- Check if Local Storage is enabled
- Verify browser privacy settings
- Clear browser cache and retry
- Try an incognito/private window

## Customization

### Change Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary: #6366f1;        /* Primary color */
    --secondary: #ec4899;      /* Secondary color */
    --success: #10b981;        /* Success color */
    --error: #ef4444;          /* Error color */
}
```

### Add New Voice Options

Edit `config.js`:

```javascript
VOICES: {
    DID: {
        'new-voice': { 
            id: 'new-id', 
            name: 'New Voice' 
        }
    }
}
```

## API Documentation

### D-ID API Docs
https://docs.d-id.com/reference/talks

### Tavus API Docs
https://tavus.docs.readme.io/

## Support & Resources

- 📧 Email: support@example.com
- 💬 Discord: [Join Community]
- 🐛 Report Bugs: GitHub Issues
- 📚 Documentation: Full API docs available

## License

MIT License - Feel free to use and modify!

## Credits

Built with ❤️ using:
- [D-ID](https://www.d-id.com) - AI Avatar Technology
- [Tavus](https://www.tavus.io) - Video Generation Platform

## Version History

### v1.0.0 (2024)
- Initial release
- D-ID & Tavus integration
- Full video generation workflow
- History management
- Responsive design

---

**Happy Video Creating! 🎬✨**
