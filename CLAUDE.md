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

## Reply System (2026-01)

### Reply Marker Format
Messages use text markers to indicate replies: `▶1:abc123 @username: message`
- `▶` - Reply indicator symbol
- `1` - Color index (1-12, displayed as 1-indexed)
- `abc123` - First 6 chars of original message ID for exact matching
- `@username` - Who is being replied to

### Color Cycling
- 12 colors cycle through for different reply threads
- Colors: Gold, Teal, Purple, Coral, Green, Blue, Pink, Orange, Cyan, Lime, Salmon, Indigo
- Color is assigned to the ORIGINAL message when first replied to
- All replies to same message share that color
- `REPLY_COLORS_COUNT` constant controls the number (currently 12)

### Custom Reply Styling
Users can override the default color cycling with custom styling via the Reply tab in Style Settings:

**Settings stored in `replyStyleSettings` object:**
```javascript
{
    enabled: false,           // Toggle custom styling on/off
    borderColor: null,        // Custom border color (hex)
    bgColor: null,            // Custom background color (hex)
    bgOpacity: 15,            // Background opacity (5-50)
    animation: null,          // Animation effect
    borderStyle: null,        // Border style variant
    borderRadius: null,       // Border shape
    glowColor: null,          // Custom glow color
    glowIntensity: 10         // Glow intensity (5-30px)
}
```

**Animation Effects:**
- `glow` - Static glow around message
- `pulse` - Subtle scale/opacity pulse
- `shimmer` - Horizontal shimmer effect
- `breathe` - Expanding/contracting glow
- `rainbow` - Cycling rainbow border
- `neon` - Pulsing neon glow
- `flash` - Subtle brightness flash
- `slide` - Subtle horizontal movement

**Border Styles:** `thick`, `double`, `dotted`, `dashed`
**Border Shapes:** `rounded`, `pill`

**CSS Variables for Custom Styling:**
- `--custom-reply-color` - Border color
- `--custom-reply-bg` - Background color with opacity
- `--custom-reply-glow-color` - Glow color for animations
- `--custom-reply-glow-intensity` - Glow size in pixels

### Key Functions
- `getNextReplyColor()` - Returns next color index in cycle
- `getReplyColorFromElement(el)` - Extracts color index from element's classes
- `findReplyTargetForUser(username)` - Finds reply-target messages from a user
- `markOriginalMessage(msgIdShort, username, colorIndex, useCustom)` - Highlights original message
- `styleReplyMessages()` - Processes new messages and applies reply styling
- `selectReplyAnimation(anim)` - Set animation effect
- `selectReplyBorderStyle(style)` - Set border style
- `selectReplyBorderRadius(radius)` - Set border shape
- `applyCustomReplyCSS()` - Apply CSS variables to document root

### CSS Classes
- `.is-reply-message` - Applied to messages that ARE replies
- `.reply-target` - Applied to messages that HAVE BEEN replied to
- `.reply-color-0` through `.reply-color-11` - Color variants
- `.reply-custom` - Custom user-defined styling (overrides color cycling)
- `.reply-anim-*` - Animation classes (glow, pulse, shimmer, breathe, rainbow, neon, flash, slide)
- `.reply-border-*` - Border style classes (thick, double, dotted, dashed)
- `.reply-rounded`, `.reply-pill` - Border shape classes

## Development Lessons Learned

### Style Settings Popup Tab Structure
The `renderStyleTabContent()` function uses if/else if structure for tabs:
```javascript
if (tab === 'message') {
    // Message tab content
} else if (tab === 'username') {
    // Username tab content
} else if (tab === 'reply') {
    // Reply tab content
}
```
**CRITICAL**: When adding new tabs, ensure ALL conditions use `else if`, not just `else`. Using `else` as a catch-all prevents subsequent `else if` blocks from being reached, causing syntax errors.

### Testing Changes
- Always run `node -c channel/script.js` to check for syntax errors before committing
- A single syntax error will break the ENTIRE site layout since the script fails to load
- Test tab switching in the Style Settings popup after adding new tabs

### localStorage Keys for Settings
- `textStyleSettings` - Message styling preferences
- `usernameStyleSettings` - Username styling preferences
- `replyStyleSettings` - Custom reply styling preferences
- `emoteFavorites` - Array of favorite emote names
- `playlistCustomNames` - Custom names for playlist items
- `priorityQueueItems` - Priority queue video items (dual playlist system)
- `dualPlaylistPlaybackState` - Playback state for dual playlist system

## Cytube Platform Limitations (CRITICAL)

### Message Length Limit (~240 characters)
**CRITICAL**: Cytube truncates chat messages longer than ~240 characters WITHOUT WARNING. This affects any feature that sends data via hidden chat messages.

**Symptoms of truncation:**
- Messages missing their end markers (e.g., `:BSET` marker missing)
- Regex patterns fail to match because message is incomplete
- Debug logs show `start: true end: false` for marker detection

**Solution patterns:**
1. **Use minimal data formats** - Short property names (`si` not `spriteIndex`)
2. **Only send essential data** - Don't include optional/default values
3. **Log message length** - Always log: `console.log('Message length:', msg.length, '(must be <240)')`
4. **Test with longest possible values** - Usernames can be up to 20 chars

### Hidden Message Format for Cross-Browser Sync
Use zero-width characters to hide sync messages from chat display:
```javascript
var hiddenMsg = '\u200B\u200CBSET:' + username + ':' + data + ':BSET\u200B\u200C';
```
- `\u200B` = Zero-width space
- `\u200C` = Zero-width non-joiner
- Always include START and END markers (e.g., `BSET:...:BSET`)
- Regex must handle cases where zero-width chars are stripped

### Socket Event Timing
- `socket.on('chatMsg')` handlers may be registered BEFORE your script runs
- Wrapping `socket.on` only affects FUTURE handler registrations
- Always add a direct listener as backup: `originalOn('chatMsg', handler)`
- Cytube may process messages before passing to handlers

## Buddy System Sync (2026-02)

### Architecture
The buddy system syncs character appearance between browsers using hidden chat messages.

**Two message types:**
1. **BSET** (Settings) - Syncs visual appearance (sprite, size, colors)
2. **BACT** (Action) - Syncs interactions (animations, speech bubbles)

### BSET Message Format (Minimal)
```javascript
// Send only essential visual data to stay under message limit
var minimalSettings = {
    si: spriteIndex,      // number (-1 = hash-based, 0+ = specific sprite)
    sz: size,             // string: 'small', 'medium', 'large'
    hr: hueRotate,        // number: 0-360
    st: saturation,       // number: 0-200 (100 = normal)
    br: brightness,       // number: 0-200 (100 = normal)
    dn: displayName       // string: custom display name
};
// Optional: cu (customSpriteUrl) - only include if set
```

### Why BACT Works But BSET Failed
- **BACT messages are SHORT**: `BACT:user1:user2:action:seed:x,y:x,y:BACT` (~80 chars)
- **Old BSET messages were LONG**: Full settings object with personality, behavior, phrases (~350+ chars)
- **Solution**: Reduced BSET to essential visual data only (~120 chars)

### Sprite Index Convention
- `-1` = Use deterministic hash of username (same sprite across all browsers)
- `0+` = Specific sprite from BUDDY_SPRITES array
- Hash function must be identical across all clients

### Key Functions
| Function | Purpose |
|----------|---------|
| `broadcastMyBuddySettings()` | Send minimal BSET message |
| `parseBuddySyncMessage(text)` | Parse incoming BSET/BACT messages |
| `applyCustomSettingsToBuddy(username)` | Apply received settings to buddy element |
| `encodeBuddySettings(obj)` | JSON stringify + base64 encode |
| `decodeBuddySettings(str)` | base64 decode + JSON parse |
| `hashUsername(str)` | Deterministic hash for default sprite |

### Debugging Buddy Sync
Console logs to look for:
```
[BuddySync] Message length: 120 (must be <240 for Cytube)  ← GOOD
[BuddySync] BSET markers - start: true end: true match: true  ← GOOD
[BuddySync] BSET markers - start: true end: false  ← BAD: Message truncated!
[BuddySync] Decoded settings - spriteIndex: 5 size: medium  ← Successfully parsed
```

## Pusher Integration (Recommended)

Using Pusher prevents chat history pollution from sync messages. Falls back to chat-based sync if not configured.

### Setup Steps

1. **Create Pusher Account** (free tier: 200K messages/day)
   - Go to https://pusher.com and create account
   - Create a new Channels app
   - Note your: App ID, Key, Secret, Cluster
   - Enable "Client Events" in App Settings

2. **Deploy Cloudflare Worker** (free tier: 100K requests/day)
   - Go to https://dash.cloudflare.com
   - Workers & Pages → Create Application → Create Worker
   - Paste code from `pusher-worker/worker.js`
   - Add environment variables:
     - `PUSHER_APP_ID`: Your app ID
     - `PUSHER_KEY`: Your key
     - `PUSHER_SECRET`: Your secret
     - `PUSHER_CLUSTER`: Your cluster (e.g., 'us2')
   - Deploy and note URL (e.g., `https://buddy-sync.username.workers.dev`)

3. **Configure Channel** (in Cytube External JS)
   ```javascript
   var PUSHER_KEY = 'your-pusher-key';
   var PUSHER_CLUSTER = 'us2';
   var PUSHER_AUTH_ENDPOINT = 'https://buddy-sync.username.workers.dev/pusher/auth';
   ```

### How It Works
- Client connects to Pusher presence channel on page load
- Settings/interactions sent via Pusher client events (no chat messages)
- Falls back to chat-based sync if Pusher not configured or fails
- Each Cytube room gets its own Pusher channel

### Console Logs
```
[Pusher] Initialized
[Pusher] Connected to channel
[Pusher] Broadcast sent for username
[Pusher] Received settings for other_user
```

If Pusher fails:
```
[Pusher] Not configured - using chat fallback
[Pusher] Subscription error, using chat fallback
```

## Username Styling System

### Requirements
1. **Cytube filter MUST exist**: `[uname]` filter in Channel Settings → Edit → Chat Filters
2. **User must enable**: Toggle "Enable Username Styling" in Style Settings → Username tab
3. **usernameStyleSettings.enabled** must be `true`

### How It Works
1. User types message in chatline
2. `applyUsernameTagsToMessage()` intercepts Enter key
3. Message is wrapped: `[uname][color]Username[/][/uname] original message`
4. Cytube filter converts to: `<span class="styled-username">...</span>`
5. CSS hides original `.username` element, shows styled version

### Common Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| Username not styled | `[uname]` filter missing | Add filter in Cytube channel settings |
| Username not styled | Toggle not enabled | Check `usernameStyleSettings.enabled` |
| Username shows twice | CSS selector wrong | Use `.chat-msg-with-styled-name > .username` |
| Message content hidden | CSS selector too broad | Don't use `.username + *` selector |

### CSS Selectors (Correct)
```css
/* Hide original username when styled version present */
.chat-msg-with-styled-name > .username {
    display: none !important;
}

/* Ensure unstyled usernames remain visible */
#messagebuffer > div:not(.chat-msg-with-styled-name) > .username {
    display: flex !important;
}
```

### Settings Object
```javascript
var USERNAME_STYLE_DEFAULTS = {
    enabled: false,      // MUST be true for styling to work
    color: null,         // 'red', 'blue', etc.
    gradient: null,      // 'rainbow', 'fire', etc.
    glow: null,          // 'glow-gold', 'glow-red', etc.
    customGlow: null,    // hex color for custom glow
    animation: null,     // 'shake', 'pulse', etc.
    font: null,          // 'comic', 'impact', etc.
    bold: false,
    customColor: null    // hex color
};
```

## NND (NicoNico) Chat Overlay Filtering

### Filtering Hidden Messages
The NND overlay must NOT display sync messages. Hook into the NND message handler:
```javascript
window.nnd._fn.addScrollingMessage = function(message, extraClass) {
    // Skip buddy sync messages
    if (message.indexOf('BSET:') !== -1 || message.indexOf('BACT:') !== -1) {
        return;
    }
    // Skip screenspam (displayed separately)
    if (message.indexOf('SCREENSPAM:') !== -1) {
        return;
    }
    // Also check for zero-width character markers
    if (message.indexOf('\u200B\u200C') !== -1) {
        return;
    }
    // ... normal processing
};
```

## Dual Playlist System (2026-02)

A dual playlist system with a main playlist (mod-only visible) and priority queue (visible to mods only). Manages video playback between two playlists with visibility and permission controls.

### Visibility & Permissions
- **Main Playlist**: Only visible to rank 2+ (moderators)
- **Priority Queue**: Only visible to rank 2+ (moderators)
- **Non-mods**: Cannot see either playlist, but can add videos
- **Add Media**: All users can add videos; non-mods receive feedback "Video added to queue, position #X"

### UI Layout
- Priority queue appears as a separate panel to the right of main playlist
- Both playlists visible simultaneously to moderators
- Responsive: stacks vertically on mobile (< 768px)

### Drag & Drop
- **Bidirectional**: Videos can be dragged between priority queue ↔ main playlist
- **Internal reordering**: Mods can reorder within each playlist
- **Visual feedback**: Highlighting during drag operations
- Only mods have drag-drop capability

### Playback Logic
1. **Priority First**: Always play from priority queue if it contains videos
2. **FIFO Order**: Priority queue plays in order added
3. **After Priority Video Plays**: Removed from priority queue, moved to main playlist
4. **When Priority Empty**: Select ONE random video from main playlist
5. **Never Interrupt**: Current video finishes before switching to priority queue

### Key Functions
| Function | Purpose |
|----------|---------|
| `addToPriorityQueue(videoData)` | Add video to priority queue |
| `removePriorityItem(uid)` | Remove item from priority queue |
| `getNextPriorityItem()` | Get first item (FIFO) from priority queue |
| `popPriorityItem()` | Remove and return first item from priority queue |
| `playNextVideo()` | Play next video (priority first, then random main) |
| `interceptVideoAdditions()` | Intercept socket 'queue' events |
| `showQueueFeedback(position, title)` | Show toast notification for non-mods |

### CSS Classes
- `.hide-playlists` - Applied to body when user is not a mod
- `.is-mod` - Applied to body when user is a mod
- `#dual-playlist-wrapper` - Container for both playlists
- `#main-playlist-panel` - Main playlist container
- `#priority-queue-container` - Priority queue container
- `.priority-queue-item` - Individual priority queue item
- `.drag-over` - Applied during drag hover
- `.dragging` - Applied to item being dragged

### Global API
```javascript
window.DualPlaylist = {
    addToPriorityQueue: fn(videoData),
    removePriorityItem: fn(uid),
    getPriorityQueue: fn() -> array,
    clearPriorityQueue: fn(),
    playNext: fn(),
    isModerator: fn() -> boolean
};
```

### localStorage Keys
- `priorityQueueItems` - JSON array of priority queue items
- `dualPlaylistPlaybackState` - Playback state tracking

## Cytube Chat Filters (Channel Configuration)

The following chat filters must be configured in **Channel Settings → Edit → Chat Filters** for styling to work. All filters use `flags: "g"` (global).

### Username Wrapper
| Name | Regex | Replacement |
|------|-------|-------------|
| uname | `\[uname\](.+?)\[/uname\]` | `<span class="styled-username" data-ignore-nnd="true">\1</span>` |

### Colors (12)
`[color]text[/]` → `<span style="color:#hex">\1</span>`
- white (#ffffff), yellow (#ffff00), orange (#ffa500), pink (#ff69b4)
- red (#ff0000), lime (#00ff00), green (#008000), aqua (#00ffff)
- blue (#5555ff), violet (#ee82ee), brown (#8b4513), silver (#c0c0c0)

### Gradients (8)
`[gradient]text[/]` → `<span style="background:linear-gradient(...);-webkit-background-clip:text;-webkit-text-fill-color:transparent">\1</span>`
- rainbow, fire, ocean, sunset, neon, forest, gold, ice

### Glows (7)
`[glow-color]text[/]` → `<span style="text-shadow:0 0 10px #color,0 0 20px #color,0 0 30px #color">\1</span>`
- glow-white, glow-red, glow-blue, glow-green, glow-gold, glow-pink, glow-rainbow

### Animations (6)
`[anim]text[/]` → `<span style="display:inline-block;animation:anim duration ease infinite">\1</span>`
- shake (0.5s), pulse (1s), bounce (0.6s), wave (2s), flicker (0.3s), spin (2s)

### Fonts (20)
`[font-name]text[/]` → `<span style="font-family:'Font Name',fallback">\1</span>`
- comic, impact, papyrus, copperplate, brush, lucida, courier, times
- georgia, trebuchet, verdana, gothic, garamond, palatino, bookman
- mono, cursive, fantasy, system, serif

### Text Formatting (4)
- `[b]text[/]` → bold
- `[i]text[/]` → italic
- `[u]text[/]` → underline
- `[s]text[/]` → strikethrough

### Special
- `[sp]text[/]` → spoiler
- embed-tenor: Converts Tenor URLs to embedded images

## Impersonation System (2026-02)

Shift+click on a username in chat to open the impersonation popup. This allows sending a message that appears to be from that user, copying their styling.

### How It Works
1. Shift+click captures CSS styles from the clicked message (username + message body)
2. `cssToTags()` function converts inline CSS back to BBCode tags
3. Message sent as: `[uname]{userTags}NAME{/userTags}[/uname] {msgTags}message{/msgTags}`
4. Cytube filters process the tags server-side
5. `[uname]` wrapper hides sender's real username via CSS

### Style Detection (`cssToTags` function)
Detects and converts:
- **Fonts**: font-family → [font-*]
- **Colors**: color property → [color] or [#hex]
- **Gradients**: background with -webkit-text-fill-color → [rainbow], [fire], etc.
- **Glows**: text-shadow → [glow-*]
- **Animations**: animation property OR text-* classes → [shake], [bounce], etc.
- **Formatting**: font-weight:bold → [b], font-style:italic → [i], etc.

### Key Functions
- `cssToTags(style, classes)` - Converts CSS to BBCode tags
- `openImpersonatePopup(username, usernameStyle, msgStyle, usernameClasses, msgClasses)` - Opens popup
- `sendImpersonateMessage()` - Builds and sends the formatted message
- `initClickToMention()` - Sets up shift+click handler on usernames

## Screenspam System (2026-02)

NicoNico-style feature that displays messages across the video screen with CRAZY overwhelming animations. Users type `/screenspam <message>` to trigger a random visual effect. Messages are hidden from the normal NicoNico chat overlay.

### Usage
- **Command:** `/screenspam <message>` - displays message on video with random effect
- **Character Limit:** 50 characters max
- **Cooldown:** None (spam away!)
- **Access:** All users
- **NND Integration:** Screenspam messages are automatically hidden from the normal NicoNico scrolling chat

### Animation Effects Pool (18 CRAZY effects)
| Effect | Description |
|--------|-------------|
| `nuke` | Starts tiny, becomes MASSIVE with blinding brightness |
| `seizure` | Rapid chaotic position/scale/rotation/color changes |
| `tornado` | Spins up from bottom while growing and moving chaotically |
| `pinball` | Bounces off walls at crazy angles |
| `rubber` | Stretches and snaps like a rubber band |
| `drunk` | Stumbles across screen with skewing |
| `earthquake` | Violently shakes while growing |
| `blackhole` | Gets sucked into center then EXPLODES outward |
| `glitchnightmare` | Extreme glitching with clip-path and color inversion |
| `firework` | Shoots up and explodes in multiple directions |
| `jello` | Wobbly jello stretching effect |
| `matrix` | Digital rain style falling with green glow |
| `yoyo` | Swings up and down like a yo-yo |
| `portal` | Spins into a portal with hue shifting |
| `helicopter` | Spins like helicopter blades across screen |
| `supernova` | Massive explosion with blinding flash |
| `slots` | Spins vertically like slot machine reels |
| `chaos-multi` | Creates 8 copies with random different effects |

### Color Variations
8 color options randomly applied with INTENSE glows:
- Red, Green, Cyan, Magenta, Yellow, Orange, Hot Pink, Animated Rainbow gradient

### Key Functions
| Function | Purpose |
|----------|---------|
| `initScreenspamCommand()` | Sets up /screenspam command interception |
| `initScreenspamReceiver()` | Listens for screenspam messages from other users |
| `displayScreenspam(message, username)` | Displays the effect on screen |
| `createScreenspamOverlay()` | Creates overlay container over video |

### Message Format
Messages use invisible zero-width character markers:
```
\u200B\u200C\u200BSCREENSPAM:content:SCREENSPAM\u200B\u200C\u200B
```

### CSS Classes
- `#screenspam-overlay` - Container positioned over video
- `.screenspam-msg` - Base message styling (Impact font, intense text shadows)
- `.screenspam-color-0` through `.screenspam-color-7` - Color variants with triple glow layers
- `.screenspam-cooldown-toast` - Error notification

### Configuration Variables
```javascript
var SCREENSPAM_DURATION = 5000;   // 5 seconds display
var SCREENSPAM_MAX_LENGTH = 50;   // Max characters
```

## Video Drawing Tool (2026-02)

Allows users to draw on the video player with strokes synced in real-time to all viewers. Uses relative coordinates (0-1) for cross-screen interpolation so drawings appear in the same position regardless of screen size.

### User Flow
1. **Settings**: Click 🖌️ (paintbrush) button to open settings popup
2. **Configure**: Select brush size (small/medium/large) and color (MSPaint palette)
3. **Draw**: Hold `Alt` and draw on the video with mouse
4. **Session**: First stroke starts invisible 10-second timer
5. **Continue**: Can release Alt, timer keeps running; re-hold to continue drawing
6. **Clear**: After 10 seconds, all strokes clear; must release Alt before new session

### Drawing Controls
- **Alt + Mouse**: Hold Alt, then click and drag on video to draw
- **Release Alt**: Pauses drawing but timer continues
- **Re-hold Alt**: Continue drawing on same canvas
- **After 10s clear**: Must release Alt before starting new session

### Technical: Interaction Overlay
When Alt is held, a transparent overlay appears over the video player. This is necessary because:
- Video players (YouTube, etc.) are iframes that capture mouse events
- The overlay intercepts mouse events so drawing works over any video source
- Overlay only appears when Alt is held (invisible otherwise)

### Coordinate System
Uses **normalized coordinates (0-1)** for cross-screen compatibility:
```javascript
// When drawing
var relX = mouseX / videoWidth;   // 0.0 to 1.0
var relY = mouseY / videoHeight;  // 0.0 to 1.0

// When rendering on another screen
var screenX = relX * theirVideoWidth;
var screenY = relY * theirVideoHeight;
```

### Brush Sizes
| Size | Video Height % | Use Case |
|------|----------------|----------|
| small | 0.5% | Fine details |
| medium | 1.5% | General drawing |
| large | 3% | Bold strokes |

### Color Palette (24 colors)
MSPaint-style 8x3 grid:
- Row 1: Black, Gray, Maroon, Olive, Green, Teal, Navy, Purple
- Row 2: White, Silver, Red, Yellow, Lime, Aqua, Blue, Magenta
- Row 3: Light variants + Orange, Hot Pink

### Multi-User Support
- Multiple users can draw simultaneously
- Each user has independent 10-second session
- All strokes broadcast in real-time to all viewers

### Pusher Events
**Requires Pusher** - no chat fallback (avoids message length limits).

| Event | Purpose |
|-------|---------|
| `client-draw-stroke` | Broadcasts completed stroke with color, size, points array |
| `client-draw-clear` | Clears all strokes when timer ends |

### Key Functions
| Function | Purpose |
|----------|---------|
| `toggleDrawingOverlay()` | Opens/closes the settings popup |
| `createDrawingSettingsPopup()` | Creates the brush/color settings popup |
| `onDrawingKeyDown/Up()` | Handles Ctrl+Shift detection |
| `onDrawingMouseDown/Move/Up()` | Handles drawing on video |
| `startDrawingSession()` | Begins invisible 10-second timer |
| `endDrawingSession()` | Clears strokes and broadcasts clear |
| `broadcastStroke(strokeData)` | Sends stroke via Pusher |
| `handleReceivedStroke(data)` | Renders stroke from another user |

### CSS Classes
- `#drawing-settings-overlay` - Settings popup overlay
- `#drawing-settings-popup` - Settings popup container
- `#drawing-canvas` - Canvas for drawer's strokes
- `#drawing-receiver-canvas` - Canvas for receiving others' strokes
- `#drawing-interaction-overlay` - Transparent overlay for mouse capture (active when Alt held)
- `.drawing-brush-btn` - Brush size buttons
- `.drawing-color-btn` - Color palette buttons
- `.drawing-preview-dot` - Preview of current brush settings

### localStorage
- `drawingToolSettings` - Stores brush size and color preferences

### Data Format
```javascript
// Stroke broadcast
{
    username: 'drawer',
    sessionId: 'drawer_1706976000000',
    stroke: {
        color: '#ff0000',
        size: 'medium',
        points: [{x: 0.5, y: 0.3}, {x: 0.51, y: 0.31}, ...]
    }
}

// Clear broadcast
{
    username: 'drawer',
    sessionId: 'drawer_1706976000000'
}
```

## BokiTheme API (v2.0.0)

The theme exposes a centralized API via `window.BokiTheme` for customization, extension, and debugging.

### Core Modules

| Module | Purpose |
|--------|---------|
| `BokiTheme.Chat` | Register custom message handlers |
| `BokiTheme.Settings` | Read/write theme settings |
| `BokiTheme.Emotes` | Manage favorite emotes |
| `BokiTheme.Buddy` | Access buddy system state |
| `BokiTheme.Users` | Manage ignored users |
| `BokiTheme.UI` | Control UI preferences |
| `BokiTheme.Memory` | Memory management and cleanup |
| `BokiTheme.Safe` | Error handling utilities |
| `BokiTheme.Debug` | Debugging and state inspection |

### Chat Message Handling

```javascript
// Register a custom message handler
BokiTheme.Chat.registerHandler('myPlugin', function(data) {
    if (data.msg.indexOf('!trigger') === 0) {
        console.log('Trigger activated by', data.username);
        return true;  // Stop processing (or false to continue)
    }
    return false;
}, 50);  // Priority: 0-100, higher runs first

// View registered handlers
console.log(BokiTheme.Chat.getHandlers());
```

**Handler Priority Levels:**
- 100: Buddy sync (filters hidden messages)
- 80: Screenspam
- 50: Default for plugins
- 40: Message formatting
- 30: Mention notifications
- 20: Ignore list

### UI Preferences

```javascript
// Font size
BokiTheme.UI.getFontSize();           // Returns current size
BokiTheme.UI.setFontSize(16);         // Set font size

// Emote size
BokiTheme.UI.getEmoteSize();          // 'small', 'medium', 'large'
BokiTheme.UI.setEmoteSize('large');

// Toggles
BokiTheme.UI.isCompactMode();
BokiTheme.UI.setCompactMode(true);
BokiTheme.UI.isTimestampsVisible();
BokiTheme.UI.setTimestampsVisible(false);
BokiTheme.UI.isSoundEnabled();
BokiTheme.UI.setSoundEnabled(true);
```

### Memory Management

```javascript
// Get memory statistics
BokiTheme.Memory.getStats();
// Returns: { chatMessages: 150, buddySettings: 5, buddyCharacters: 5, autoCleanupActive: true }

// Manual cleanup
BokiTheme.Memory.runCleanup();

// Configure limits
BokiTheme.Memory.config.maxChatMessages = 500;  // DOM node limit
BokiTheme.Memory.config.cleanupInterval = 60000; // 60 seconds

// Control auto-cleanup
BokiTheme.Memory.startAutoCleanup();
BokiTheme.Memory.stopAutoCleanup();
```

### Error Handling (Safe Module)

```javascript
// Wrap a function with error handling
var safeFn = BokiTheme.Safe.wrap(riskyFunction, fallbackValue);

// Execute safely with fallback
var result = BokiTheme.Safe.exec(function() {
    return riskyOperation();
}, 'fallback');

// Safe JSON parsing
var obj = BokiTheme.Safe.parseJSON(jsonString, {});

// Safe localStorage
BokiTheme.Safe.setStorage('myKey', { data: 'value' });
var data = BokiTheme.Safe.getStorage('myKey', {});
```

### Plugin Development

```javascript
// Register a plugin extension
BokiTheme.extend('MyPlugin', {
    version: '1.0.0',
    init: function() {
        console.log('MyPlugin initialized');
    },
    doSomething: function() {
        // Plugin functionality
    }
});

// Use the plugin
BokiTheme.MyPlugin.init();
BokiTheme.MyPlugin.doSomething();
```

### Debugging

```javascript
// Get full theme state
console.log(BokiTheme.Debug.getState());
// Returns: {
//   version: '2.0.0',
//   chatHandlers: [...],
//   emoteFavorites: 10,
//   ignoredUsers: 2,
//   buddyCount: 5,
//   pusherEnabled: true,
//   memory: {...},
//   settings: {...}
// }

// Log with category
BokiTheme.Debug.log('MyPlugin', 'Something happened');
// Output: [BokiTheme:MyPlugin] Something happened
```

## BokiChatDispatcher

Low-level chat message dispatcher. Use `BokiTheme.Chat` for the simplified API.

```javascript
// Direct dispatcher access
BokiChatDispatcher.register(name, handler, priority);
BokiChatDispatcher.init();
BokiChatDispatcher.getHandlers();
```

## Responsive Breakpoints

The theme includes enhanced responsive design for all screen sizes:

| Breakpoint | Target |
|------------|--------|
| 2560px+ | Ultra-wide and 4K monitors |
| 1920-2559px | Large desktop monitors |
| 1024-1264px | Small laptops |
| 769-1023px | Large tablets (landscape) |
| ≤768px | Mobile devices |
| 21:9+ aspect ratio | Ultra-wide monitors |
| High DPI | Retina/4K displays |
