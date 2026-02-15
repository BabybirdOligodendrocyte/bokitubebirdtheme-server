# BokiTheme Redesign: Efficiency, Stability & Modern UI

## Executive Summary

This document proposes a comprehensive architectural redesign of the BokiTheme Cytube theme. The current codebase (18,174 lines in a single JS file, 1,116 lines CSS) has grown organically and now suffers from memory leaks, global state pollution, unmanaged event listeners, and scaling bottlenecks. This redesign addresses those problems while maintaining the single-file CDN distribution constraint.

---

## Current Architecture Problems

### 1. Memory Leaks (Critical)
- **11 MutationObservers** with inconsistent cleanup
- **15+ setInterval/setTimeout calls** without centralized tracking
- **Unbounded chat DOM growth** - messages accumulate without automatic pruning
- **Event listeners never removed** on reconnect, causing multiplicative handler execution
- **Buddy DOM elements persist** after users leave (5-min grace period, but no guarantee of cleanup)

### 2. Global State Chaos
- **40+ global variables** with no ownership boundaries
- State mutations happen anywhere, impossible to trace data flow
- localStorage reads scattered across 30+ locations with inconsistent error handling
- No state change notifications - UI must poll or be manually triggered

### 3. Performance Bottlenecks
- **O(N²) buddy interactions** - physics loop iterates all buddies × all buddies every 50ms
- **getComputedStyle() in tight loops** - forces layout reflow per call
- **TreeWalker on every reply message** - O(n) text node traversal per new message
- **No DOM query caching** - `document.getElementById('messagebuffer')` called 50+ times
- **No event delegation** - individual listeners on every emote, button, and message
- **1,950+ lines of inline CSS** injected via JavaScript instead of in the stylesheet

### 4. Security Vulnerabilities
- Hardcoded API keys (Tenor, JSONBin) in source code
- innerHTML with unsanitized user data (XSS vectors)
- Insufficient onclick attribute escaping
- No URL protocol validation on custom sprite URLs

### 5. UI Architecture
- Popup system has no lifecycle management (create/destroy, no pool/reuse)
- No component abstraction - each popup is 200+ lines of manual DOM creation
- CSS specificity battles with Cytube defaults resolved by brute-force `!important`
- Inline styles in JS conflict with stylesheet styles

---

## Redesign Architecture

### Principle: Incremental Modernization

All changes maintain backward compatibility. No ES modules (Cytube doesn't support them). No build step required. Single-file distribution preserved. jQuery usage accepted (Cytube provides it).

### A. Module Registry Pattern

Replace 40+ global variables with a centralized state store that supports subscriptions.

```javascript
var BokiState = (function() {
    var _store = {};
    var _listeners = {};

    return {
        get: function(key) { return _store[key]; },
        set: function(key, value) {
            var old = _store[key];
            _store[key] = value;
            if (_listeners[key]) {
                _listeners[key].forEach(function(fn) { fn(value, old); });
            }
        },
        subscribe: function(key, fn) {
            if (!_listeners[key]) _listeners[key] = [];
            _listeners[key].push(fn);
            return function() { /* unsubscribe */ };
        }
    };
})();
```

**Impact:** Eliminates global variable pollution, enables reactive UI updates, makes state flow traceable.

### B. Lifecycle Manager (Timers, Observers, Listeners)

Centralized resource tracking with automatic cleanup on page unload and feature disable.

```javascript
var BokiLifecycle = (function() {
    var _timers = {};
    var _observers = {};
    var _listeners = [];

    window.addEventListener('beforeunload', function() {
        // Automatic cleanup of ALL registered resources
    });

    return {
        setInterval: function(name, fn, ms) { /* tracked */ },
        setTimeout: function(name, fn, ms) { /* tracked */ },
        observe: function(name, target, config, callback) { /* tracked */ },
        listen: function(target, event, handler, options) { /* tracked, returns unlisten */ },
        cleanup: function(name) { /* remove specific resource */ },
        cleanupAll: function() { /* nuclear option */ }
    };
})();
```

**Impact:** Eliminates memory leaks from uncleared timers/observers. Makes resource usage auditable.

### C. Event Delegation Hub

Replace per-element listeners with delegated event handling on container elements.

**Before (current):**
```javascript
// 50 individual click handlers on emotes
emotes.forEach(function(e) {
    var btn = document.createElement('button');
    btn.onclick = function() { insertEmote(e.name); };
});
```

**After:**
```javascript
// 1 delegated handler on the emote container
BokiEvents.delegate('#emote-grid', 'click', '[data-emote]', function(e) {
    insertEmote(e.target.dataset.emote);
});
```

**Impact:** Reduces listener count from hundreds to dozens. Eliminates listener accumulation on popup re-creation.

### D. Virtual Scroll for Chat Buffer

Replace unbounded DOM growth with a windowed rendering approach.

- Keep last 200 messages in DOM (configurable)
- Store overflow in a lightweight array (text + metadata only)
- Render on scroll-up with IntersectionObserver
- Automatic pruning - no manual cleanup needed

**Impact:** Constant memory usage regardless of session length. Smooth 60fps scrolling even after hours.

### E. Component System for Popups

Replace manual DOM creation with a lightweight component pattern.

```javascript
var EmotePopup = BokiComponent.define({
    id: 'emote-popup',
    template: function(state) { /* returns HTML string */ },
    state: { tab: 'channel', page: 0, search: '' },
    events: {
        'click [data-emote]': 'onEmoteClick',
        'input #emote-search': 'onSearch'
    },
    onMount: function() { /* setup */ },
    onUnmount: function() { /* cleanup */ }
});
```

**Impact:** Consistent popup lifecycle. Automatic event cleanup on close. Smaller, testable code.

### F. CSS Architecture Modernization

1. **Move inline JS styles to stylesheet** - the 1,950 lines of CSS currently injected via `<style>` tags belong in `style.css`
2. **CSS Layers** for specificity management (replaces !important battles)
3. **Container Queries** for component-level responsiveness
4. **CSS Custom Properties** expanded for all themeable values

```css
@layer cytube-reset, base, components, utilities, overrides;

@layer cytube-reset {
    /* All Cytube default overrides go here - lowest specificity */
}

@layer components {
    /* Popup, emote panel, chat styles */
}

@layer overrides {
    /* Only truly necessary !important declarations */
}
```

### G. Buddy System Optimization

The buddy system (8,400 lines) is the largest performance concern:

1. **Spatial hashing** for O(1) proximity queries instead of O(N²)
2. **Canvas rendering option** for 10+ buddies (DOM for ≤10, canvas for more)
3. **RequestAnimationFrame** instead of setInterval(50ms) for physics
4. **Lazy interaction evaluation** - only check interactions for visible buddies
5. **Web Worker** for physics calculations (if available, graceful fallback)

### H. Performance Monitoring Dashboard

Built-in diagnostics accessible via `BokiTheme.Perf`:

```javascript
BokiTheme.Perf.getReport();
// Returns:
{
    fps: 58,
    domNodes: 342,
    activeTimers: 8,
    activeObservers: 4,
    activeListeners: 23,
    memoryEstimate: '12.4 MB',
    buddyCount: 6,
    chatMessages: 150,
    lastCleanup: '2m ago'
}
```

---

## Implementation: Core Infrastructure

The following sections contain the actual code that implements the redesign infrastructure. These are injected at the top of `script.js`, before existing code, so all features can opt-in incrementally.

### Phase 1: State Store + Lifecycle Manager + Event Delegation
### Phase 2: DOM Pool + Virtual Scroll
### Phase 3: Component System + CSS Migration
### Phase 4: Buddy Optimization + Performance Dashboard

---

## CSS Improvements

### Current Issues
1. 60 `!important` declarations (justified but could be reduced with CSS Layers)
2. 1,950 lines of CSS injected via JS `<style>` tags
3. Duplicate style rules between stylesheet and JS injection
4. No CSS containment for performance

### Proposed Changes
1. Migrate all JS-injected styles to `style.css`
2. Add `contain: content` to heavy components (chat buffer, buddy container)
3. Use `@layer` for specificity management
4. Add `content-visibility: auto` for off-screen elements
5. Consolidate scrollbar styles into reusable custom properties
6. Add `will-change` hints for animated elements

---

## Migration Strategy

Each improvement is backward-compatible and can be adopted incrementally:

1. New infrastructure (BokiState, BokiLifecycle, BokiEvents) is added alongside existing code
2. Existing features are migrated one at a time to use new infrastructure
3. Old patterns are deprecated but continue working during transition
4. Performance dashboard validates improvements at each step

No big-bang rewrite. No breaking changes. Each commit is a shippable improvement.

---

## Metrics for Success

| Metric | Current | Target |
|--------|---------|--------|
| Global variables | 40+ | 5 (namespaced) |
| Untracked timers | 15+ | 0 |
| Untracked observers | 11 | 0 |
| Chat DOM nodes (1hr session) | 2000+ | 200 (capped) |
| Buddy physics complexity | O(N²) | O(N) |
| Popup event listeners | ~200 | ~20 (delegated) |
| CSS !important count | 60 | <15 |
| Inline JS-injected CSS lines | 1950 | 0 |
| Memory leaks | Multiple | 0 (lifecycle managed) |
