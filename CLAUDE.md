# CLAUDE.md - AI Assistant Guide for Bokitube Cytube Theme

## Project Overview

This is a custom JavaScript and CSS theme for **Cytube channels** that provides a modern, mobile-friendly chat-focused interface. It includes advanced features like emote customization, text styling, GIF search, and chat filtering.

- **License:** MIT (Copyright 2023 deafnv)
- **Live Demo:** https://cytu.be/r/testtheme
- **Distribution:** jsDelivr CDN from GitHub

## Repository Structure

```
bokitubebirdtheme-server/
├── README.md                    # User documentation and setup guide
├── LICENSE                      # MIT License
├── CLAUDE.md                    # This file - AI assistant guide
├── channel/                     # Main theme files
│   ├── script.js                # Core JavaScript (~3,700 lines)
│   ├── style.css                # Main CSS stylesheet (~950 lines)
│   ├── oldjs                    # Backup of previous JS version
│   ├── oldcss                   # Backup of previous CSS version
│   └── self-host/               # Self-hosted Cytube variant
│       ├── script_refactor.js   # Refactored version for self-hosting
│       └── hosted_style.css     # Self-hosted CSS variant
└── images/                      # Documentation screenshots
    ├── ss.png                   # Desktop screenshot
    └── ss-mobile.png            # Mobile screenshot
```

## Technology Stack

- **JavaScript:** Vanilla ES6+ with heavy jQuery usage (provided by Cytube)
- **CSS:** Pure CSS3 with custom properties (variables) for theming
- **External APIs:**
  - Cytube Socket.IO API for chat/media control
  - Tenor API for GIF search
  - Google Fonts API (Quicksand, Ubuntu)
- **Distribution:** jsDelivr CDN

## Key Files

| File | Purpose |
|------|---------|
| `channel/script.js` | Core functionality - emotes, text styling, chat features, popups |
| `channel/style.css` | All styling, responsive design, animations, theme variables |
| `channel/self-host/script_refactor.js` | Variant for self-hosted Cytube instances |

## Build & Development

### No Build Pipeline

This project has no formal build process. Files are distributed directly via jsDelivr CDN:

- **CSS:** `https://cdn.jsdelivr.net/gh/deafnv/bokitube-server@master/channel/style.min.css`
- **JS:** `https://cdn.jsdelivr.net/gh/deafnv/bokitube-server@master/channel/script.min.js`

### Development Workflow

1. Edit files directly in `channel/` directory
2. Test on a Cytube channel (set External CSS/JS to local or GitHub URLs)
3. Commit and push to GitHub
4. jsDelivr automatically serves updated files

### Testing

Manual testing only - no automated tests. Test by:
- Loading theme on a Cytube channel
- Testing all features (emotes, styling, GIFs, chat, etc.)
- Checking mobile responsiveness via browser DevTools

## Code Architecture

### JavaScript Organization (`script.js`)

The script is organized into logical sections with comment headers:

1. **Layout & DOM Manipulation** - Initial page restructuring
2. **Popup System** - Overlay-based modals for emotes, styling, filters
3. **Emote System** - Emote popup, favorites, autocomplete, pagination
4. **GIF Integration** - Tenor API search and embedding
5. **Text Styling** - Color, gradient, effects, animations for messages
6. **Username Styling** - Separate styling system for usernames
7. **Chat Features** - Reply system, timestamps, message formatting
8. **Playlist Features** - Custom naming, observer pattern for new items
9. **Event Handlers** - Global keyboard, focus, click handlers
10. **Storage Functions** - LocalStorage wrappers

### Key Functions

| Category | Functions |
|----------|-----------|
| Emotes | `createEmotePopup()`, `renderEmotes()`, `toggleEmoteFav()` |
| GIFs | `renderGifTab()`, `searchTenorGifs()`, `renderGifResults()` |
| Text Styling | `createTextStylePopup()`, `buildStyleTags()`, `applyStyleToMessage()` |
| Username | `buildUsernameOpenTags()`, `applyUsernameTagsToMessage()` |
| Chat | `replyToMsg()`, `scrollReply()`, `formatChatMsg()` |
| UI | `makeDraggable()`, `showFavoritesDropdown()` |
| Storage | `savePlaylistNames()`, `fetchPlaylistNames()` |

### CSS Organization (`style.css`)

1. **CSS Variables** - Theme customization at `:root`
2. **Base Layout** - Two-column layout (video left, chat right)
3. **Component Styles** - Navbar, chat, playlist, user list
4. **Popup Styles** - Emote popup, style popup, modals
5. **Animations** - @keyframes for effects
6. **Responsive Design** - Media queries at 768px, 1264px

## Coding Conventions

### JavaScript

- **Variables/Functions:** camelCase (`emoteFavorites`, `toggleEmotePopup`)
- **jQuery:** Used extensively for DOM selection (`$()`, `.on()`, `.addClass()`)
- **State Management:** Global variables for state
- **Comments:** Section headers with `/* ========== SECTION ========== */`
- **Event Handling:** Mix of inline onclick and addEventListener

### CSS

- **Custom Properties:** kebab-case (`--leftcontentvw`, `--primarycolor`)
- **Classes:** Hyphenated (`.emote-item`, `.popup-header`)
- **Overrides:** `!important` used for overriding Cytube defaults
- **Layout:** Flexbox and Grid
- **Prefixes:** Webkit prefixes for scrollbar styling

### HTML/DOM

- **IDs:** Hyphenated (`emote-popup`, `messagebuffer`)
- **Bootstrap:** Utilizes Bootstrap classes (`.btn`, `.form-control`)

## Configuration System

### CSS Variables (set in Cytube Channel Settings > CSS)

```css
:root {
    --leftcontentvw: 78.4vw;              /* Video player width */
    --bannerimg: url("...");              /* Scrolling banner image */
    --dialogbgimageurl: url("...");       /* Modal background */
    --bgimageurl: url("...");             /* Channel background */
    --primarycolor: #000000;              /* Primary UI color */
    --secondarycolor: #2e2e2e;            /* Secondary UI color */
    --tertiarycolor: #627b83;             /* Accent color */
}
```

### JavaScript Variables (set in Cytube Channel Settings > JS)

```javascript
var channelName = "<custom title>";       // Override channel title
var faviconUrl = "<favicon URL>";         // Custom favicon
var scrollingBannerEnabled = false;       // Enable/disable banner
```

## Current Channel Configuration

The active Cytube channel uses the following internal CSS configuration:

```css
:root {
    --leftcontentvw: 88%;                 /* Wider video (88% vs default 78.4vw) */
    --bannerimg: url("INSERT YOUR IMAGE HERE");
    --dialogbgimageurl: url("INSERT YOUR IMAGE HERE");
    --bgimageurl: url("https://images.alphacoders.com/834/834417.png");
    --primarycolor: #000000;              /* Black */
    --secondarycolor: #0F0F0F;            /* Very dark gray */
    --tertiarycolor: #8F6409;             /* Gold/amber accent */
}
```

**Animation keyframes** are also defined in the internal CSS:
- `shake` - Horizontal shake effect (-3px to +3px)
- `pulse` - Scale and opacity pulse (1.0 to 1.05, opacity 0.7-1.0)
- `bounce` - Vertical bounce (-5px)
- `wave` - Vertical movement with rotation
- `flicker` - Opacity flicker (0.5 to 1.0)
- `spin` - 360-degree rotation

**Note:** The closing brace `}` for `:root` appears to be missing in the current config. This should be added before the `@keyframes` declarations.

### Internal JavaScript Configuration

```javascript
var channelName = "Altar of Victory";
var faviconUrl = "https://i.postimg.cc/zfGQnKKR/aovfavicon2.png";
var scrollingBannerEnabled = false;
$.get('https://cdn.jsdelivr.net/gh/deerfarce/cytube-nnd-chat@master/index.js')
```

**Configuration breakdown:**
- **Channel Name:** "Altar of Victory" - custom title displayed in navbar
- **Favicon:** Custom icon hosted on postimg.cc
- **Banner:** Scrolling banner disabled
- **External Script:** Loads [cytube-nnd-chat](https://github.com/deerfarce/cytube-nnd-chat) - NicoNicoDouga-style scrolling chat overlay that displays messages across the video player

## Important Patterns

### Popup System

All popups follow a consistent pattern:
- Overlay div with fixed positioning
- Header with title and close button
- Content area with tabs if needed
- `makeDraggable()` for drag support
- LocalStorage for position persistence

### LocalStorage Keys

- `emoteFavorites` - Array of favorite emote names
- `textStyleSettings` - Object with text styling preferences
- `usernameStyleSettings` - Object with username styling preferences
- `playlistCustomNames` - Object mapping playlist items to custom names
- `cytube_column_width` - Saved video/chat column width percentage (e.g., "75.5%")

### Event Interception

The theme intercepts form submission to apply styling:
```javascript
document.getElementById('chatline').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        // Apply styling to message before sending
    }
});
```

## Responsive Design

### Breakpoints

- **768px:** Primary mobile breakpoint - stacks layout vertically
- **1264px:** Wide desktop adjustments
- **560px/900px (height):** Mobile viewport adjustments

### Mobile Considerations

- Custom `--vh` CSS variable updated for mobile browser bars
- Chat scrolling behavior on input focus
- Horizontal scrolling user list for compact display

## Known Issues & Limitations

1. **API Key Exposure:** Tenor API key is hardcoded in source
2. **Cytube Dependency:** Assumes Cytube's `CLIENT` object exists
3. **No Error Handling:** Many functions lack try-catch
4. **Global Scope:** Heavy use of global variables
5. **jQuery Dependency:** Relies on Cytube providing jQuery

## Recent Fixes (2026-01)

### Column Resizer Fix
- **Issue:** Video resize slider didn't move the chat panel - only the video resized
- **Cause:** `#rightcontent` had `position: fixed` which prevented flexbox from working
- **Fix:** Added `position: relative !important` override in resizer CSS, removed duplicate resizer code
- **File:** `channel/script.js` lines ~3374-3570

### Chat Spacing Improvements
- **Issue:** Chat messages had excessive spacing, not minimalist
- **Fix:** Reduced message margin from 10px to 4px, reduced padding, smaller timestamps
- **File:** `channel/style.css` - `#messagebuffer > div` and `.timestamp` rules

### Button Overflow Fix
- **Issue:** Chat control buttons were pushed off screen on narrow widths
- **Fix:** Added `flex-shrink: 1`, smaller padding, `overflow: hidden` on container
- **File:** `channel/style.css` - `#leftcontrols` rules

### Scroll-to-Current Bounce Fix
- **Issue:** "Scroll to current" button caused playlist to bounce around
- **Cause:** Socket events triggered rapid DOM updates during scroll
- **Fix:**
  - Replaced `window.scrollQueue()` with custom scroll that targets the queue container
  - Added debounced playlist updates to prevent rapid re-rendering
  - Added visual highlight effect on current item
- **File:** `channel/script.js` - jump button onclick and `debouncedPlaylistUpdate()` function

## When Making Changes

### DO

- Maintain backward compatibility with existing Cytube channels
- Test on both desktop and mobile viewports
- Use existing naming conventions (camelCase JS, kebab-case CSS)
- Add section comments for new features
- Keep the single-file architecture for easy CDN distribution

### DON'T

- Remove or rename existing CSS variables (breaks user configurations)
- Break the two-column layout structure
- Add external dependencies (must work via Cytube's External JS/CSS)
- Use ES modules (not supported in Cytube's context)
- Remove backward-compatible code without deprecation notice

## Feature Areas

### Emote System
- Popup with Channel/GIF tabs
- Favorites stored in localStorage
- Autocomplete on `/` prefix
- Pagination (50 per page)
- Drag-and-drop support

### Text Styling
- Colors: Preset palette + hex picker
- Effects: Glow, bold, italic, underline, strikethrough
- Animations: Shake, pulse, bounce, wave, flicker, spin
- Gradients: Multiple color gradient support
- Preview: Real-time style preview

### Chat Enhancements
- Reply buttons with scroll-to-original
- Timestamp display
- Message formatting
- AFK toggle button
- Clear chat button

### Playlist Features
- Custom naming for playlist items
- Persistent storage via localStorage
- MutationObserver for new items

## Git Workflow

- All changes committed to main branch
- No CI/CD pipeline
- jsDelivr auto-updates from GitHub
- Commit messages should be descriptive (improve from "Add files via upload")

## Useful Commands

```bash
# View file structure
ls -la channel/

# Check line counts
wc -l channel/script.js channel/style.css

# Search for function definitions
grep -n "function " channel/script.js

# Find CSS variable usage
grep -r "\-\-" channel/style.css
```

## External Resources

- [Cytube Documentation](https://github.com/calzoneman/sync)
- [jsDelivr CDN](https://www.jsdelivr.com/)
- [Tenor API Docs](https://developers.google.com/tenor)
