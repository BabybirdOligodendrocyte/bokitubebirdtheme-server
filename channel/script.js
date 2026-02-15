/* Remove Name Color button - uses MutationObserver instead of polling */
(function removeNameColorButton() {
    function isNameColorButton(el) {
        if (!el || el.nodeType !== 1) return false;
        if (el.textContent.trim() === 'Name Color') return true;
        if (el.classList.contains('btn-success')) return true;
        // Check computed style only for buttons (expensive operation)
        if (el.tagName === 'BUTTON' || el.classList.contains('btn')) {
            var style = window.getComputedStyle(el);
            var bg = style.backgroundColor;
            if (bg.indexOf('40, 167, 69') !== -1 || bg.indexOf('0, 128, 0') !== -1 ||
                bg.indexOf('34, 139, 34') !== -1) return true;
        }
        return false;
    }

    function removeButton(el) {
        el.style.display = 'none';
        el.remove();
    }

    // Initial cleanup
    document.querySelectorAll('button, .btn, .btn-success').forEach(function(el) {
        if (isNameColorButton(el)) removeButton(el);
    });

    // Watch for dynamically added buttons
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (isNameColorButton(node)) {
                    removeButton(node);
                } else if (node.nodeType === 1) {
                    // Check children of added nodes
                    node.querySelectorAll && node.querySelectorAll('button, .btn, .btn-success').forEach(function(el) {
                        if (isNameColorButton(el)) removeButton(el);
                    });
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Disconnect after 60 seconds - button should be loaded by then
    setTimeout(function() { observer.disconnect(); }, 60000);
})();

/* Removes the buttons for resizing video and user list size toggle */
var resizes = document.getElementById("resize-video-smaller");
var resizel = document.getElementById("resize-video-larger");
if (resizes) resizes.remove();
if (resizel) resizel.remove();

/* Display none on container-fluid after accepting permissions */
var containerFluid = document.querySelector('.container-fluid');
if (containerFluid) containerFluid.style.display = "none";

/* Adds scrolling banner to MOTD wrap */
if (typeof scrollingBannerEnabled !== 'undefined' && scrollingBannerEnabled)
    $("#motdwrap").prepend($('<div class="banner-slideshow"><div class="mover-1"></div></div>'));

/* Theme credits */
$(".credit").append($('<p class="text-muted credit">Theme by deafnv, available on <a href="https://github.com/deafnv/bokitube-server" target="_blank" rel="noreferrer noopener">Github</a></p>'));

/* Create basic two column layout */
$("#mainpage").prepend($('<div id="content-wrap">'))
$("#content-wrap").prepend($('<div id="rightcontent">'))
$("#content-wrap").prepend($('<div id="leftcontent">'))

/* Place video and the rest of the page into the left column */
$("<div id='video-container'>").prependTo($("#leftcontent"));
$("#videowrap").prependTo($("#video-container"));
$('<div id="channel-content">').appendTo($("#leftcontent"));
$("#announcements").appendTo($("#channel-content"));
$("#drinkbar").appendTo($("#channel-content"));
$("#motdrow").appendTo($("#channel-content"));
$("#controlsrow").appendTo($("#channel-content"));
$("#playlistrow").appendTo($("#channel-content"));
$("#sitefooter").appendTo($("#channel-content"));
$("#footer").appendTo($("#channel-content"));
$("#leftcontent").prepend($("#pollwrap"));

/* Place chat and buttons into the right column */
$("#chatheader").appendTo($("#rightcontent"));
$("#userlist").appendTo($("#rightcontent"));
$("#messagebuffer").appendTo($("#rightcontent"));
var formLine = document.querySelector("div#chatwrap > form");
if (formLine) formLine.setAttribute("id", "formline");
$("#formline").appendTo($("#rightcontent"));
$("#leftcontrols").appendTo($("#rightcontent"));

/* Meant for implementation of scrolling title - remove if unused */
$("#rightcontent").prepend($("<div id='currenttitlewrap'>"));
$("#videowrap-header").prependTo($("#currenttitlewrap"));

var nodecurrenttitle = document.getElementById("currenttitle");
var clonecurrenttitle = nodecurrenttitle ? nodecurrenttitle.cloneNode(true) : null;

/* Remove padding on wrap */
var pagewrap = document.getElementById("wrap");
if (pagewrap) pagewrap.setAttribute("style", "padding-bottom: 0px;");

/* Add hint text for chatline and disables spellcheck */
var chatline = document.getElementById("chatline");
if (chatline) {
    chatline.removeAttribute("placeholder");
    chatline.setAttribute("placeholder", "Send a message");
    chatline.setAttribute("spellcheck", "false");
}

/* Sets the variable used for mobile chat sizing - uses resize event instead of polling */
(function() {
    function updateVH() {
        document.documentElement.style.setProperty('--vh', window.innerHeight/100 + 'px');
    }
    var vhTimer;
    window.addEventListener('resize', function() {
        clearTimeout(vhTimer);
        vhTimer = setTimeout(updateVH, 100);
    });
    window.addEventListener('orientationchange', updateVH);
    updateVH(); // Initial call
})();

/* Positions the chat depending on media query */
function chatPosition(x) {
    if (x.matches) {
        $("#rightcontent").appendTo($("#leftcontent"));
        $("#channel-content").appendTo($("#leftcontent"));
        $("#footer").appendTo($("#leftcontent"));
        document.getElementById("chatline").onclick = function() {
            var counter = 0;
            var clickChatInterval = setInterval(function() {
                document.documentElement.scrollTop = 0;
                if (++counter === 10) window.clearInterval(clickChatInterval);
            }, 50);
        }
    } else {
        $("#rightcontent").appendTo($("#content-wrap"));
        document.documentElement.style.setProperty('--vh', window.innerHeight/100 + 'px');
    }
}
var mediaQuery = window.matchMedia("(max-width: 768px)");
chatPosition(mediaQuery);
mediaQuery.addEventListener('change', chatPosition);

/* Add jump to current item button */
var jumpBtn = document.createElement("button");
jumpBtn.innerHTML = "Scroll to current";
jumpBtn.setAttribute("id", "jump-btn");
jumpBtn.setAttribute("class", "btn");
jumpBtn.onclick = function() {
    var currentItem = document.querySelector('.queue_entry.queue_active');
    if (currentItem) {
        // Scroll the playlist container, not the whole page
        var queue = document.getElementById('queue');
        if (queue) {
            var queueRect = queue.getBoundingClientRect();
            var itemRect = currentItem.getBoundingClientRect();
            var scrollTop = queue.scrollTop + (itemRect.top - queueRect.top) - (queueRect.height / 2) + (itemRect.height / 2);
            queue.scrollTo({ top: scrollTop, behavior: 'smooth' });
        }
        // Brief highlight effect
        currentItem.style.transition = 'background-color 0.3s';
        currentItem.style.backgroundColor = 'rgba(143, 100, 9, 0.4)';
        setTimeout(function() {
            currentItem.style.backgroundColor = '';
        }, 800);
    }
};
var rightControls = document.getElementById("rightcontrols");
if (rightControls) rightControls.insertBefore(jumpBtn, rightControls.children[1]);

/* AFK on unfocus function */
var VOL_AFK = false;
var FOCUS_AFK = false;
var _afkIntervalId = setInterval(function() {
    if (!VOL_AFK && !FOCUS_AFK) {
        $("#userlist").find('span[class^=userlist]').each(function() {
            if ($(this).html() == CLIENT.name && $(this).css('font-style') == "italic") {
                socket.emit("chatMsg", { msg: '/afk' });
                return;
            }
        });
    }
}, 500);

window.addEventListener("focus", function() {
    if (FOCUS_AFK && VOL_AFK) {
        socket.emit("chatMsg", { msg: '/afk' });
        FOCUS_AFK = !FOCUS_AFK;
        VOL_AFK = !VOL_AFK;
    }
});

window.addEventListener("blur", function() {
    if (!FOCUS_AFK && !VOL_AFK) {
        socket.emit("chatMsg", { msg: '/afk' });
        FOCUS_AFK = !FOCUS_AFK;
        VOL_AFK = !VOL_AFK;
    }
});

/* Adds favicon and fonts */
$(document).ready(function() {
    if (window.location.host == 'cytu.be') {
        if (typeof channelName !== 'undefined') $(".navbar-brand").html(channelName);
        if (typeof faviconUrl !== 'undefined') $('<link id="chanfavicon" href="' + faviconUrl + '" type="image/x-icon" rel="shortcut icon" />').appendTo("head");
    }
    $('<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Ubuntu">').appendTo("head");
    $('<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Quicksand">').appendTo("head");
});

/* CSS preview button */
$('<button class="btn btn-primary" id="cs-csspreview">Preview CSS</button>')
    .appendTo("#cs-csseditor")
    .on("mousedown", function() {
        document.getElementById("channeloptions").style.visibility = "hidden";
        document.getElementById("cs-csseditor").style.visibility = "hidden";
        document.getElementById("cs-csspreview").style.visibility = "visible";
    })
    .on("mouseout mouseup", function() {
        document.getElementById("channeloptions").style.visibility = "visible";
        document.getElementById("cs-csseditor").style.visibility = "visible";
    });

/* AFK button */
$('<button id="afk-btn" class="btn btn-default btn-sm">AFK</button>')
    .appendTo("#leftcontrols")
    .on("click", function() {
        socket.emit("chatMsg", { msg: '/afk' });
        VOL_AFK = !VOL_AFK;
    });

/* Clear chat button */
$('<button id="clear-btn" class="btn btn-default btn-sm">Clear</button>')
    .appendTo("#leftcontrols")
    .on("click", function() { socket.emit("chatMsg", { msg: '/clear' }); });

/* ========== UNIFIED CHAT MESSAGE DISPATCHER ========== */
/* All socket.on('chatMsg') handlers are centralized here for performance and extensibility */

var BokiChatDispatcher = (function() {
    var handlers = [];
    var initialized = false;

    // Register a chat message handler
    // Options: { priority: 0-100 (higher = runs first), name: 'handlerName' }
    function register(name, handler, priority) {
        handlers.push({
            name: name,
            fn: handler,
            priority: priority || 50
        });
        // Sort by priority (higher first)
        handlers.sort(function(a, b) { return b.priority - a.priority; });
    }

    // Process a chat message through all handlers
    function dispatch(data) {
        if (!data) return;

        for (var i = 0; i < handlers.length; i++) {
            try {
                // If handler returns true, stop processing (message was handled)
                if (handlers[i].fn(data) === true) {
                    return;
                }
            } catch (e) {
                console.error('[ChatDispatcher] Error in handler ' + handlers[i].name + ':', e);
            }
        }
    }

    // Initialize the dispatcher (call once when socket is ready)
    function init() {
        if (initialized || typeof socket === 'undefined') return;

        socket.on('chatMsg', function(data) {
            dispatch(data);
        });

        initialized = true;
        console.log('[ChatDispatcher] Initialized with', handlers.length, 'handlers');
    }

    // Get list of registered handlers (for debugging)
    function getHandlers() {
        return handlers.map(function(h) {
            return { name: h.name, priority: h.priority };
        });
    }

    return {
        register: register,
        init: init,
        dispatch: dispatch,
        getHandlers: getHandlers
    };
})();

// Expose globally for extensibility
window.BokiChatDispatcher = BokiChatDispatcher;

/* ========== BOKITHEME NAMESPACE ========== */
/* Centralized API for theme customization, extension, and debugging */

var BokiTheme = (function() {
    // Version info
    var VERSION = '2.0.0';

    // Internal state references (will be populated after globals are declared)
    var _state = {};
    var _config = {};

    // Public API
    return {
        // Version
        version: VERSION,

        // Chat message handling
        Chat: {
            registerHandler: function(name, handler, priority) {
                BokiChatDispatcher.register(name, handler, priority || 50);
            },
            getHandlers: function() {
                return BokiChatDispatcher.getHandlers();
            }
        },

        // Settings management
        Settings: {
            get: function(key) {
                var storageKey = key + 'Settings';
                try {
                    return JSON.parse(localStorage.getItem(storageKey) || '{}');
                } catch (e) {
                    return {};
                }
            },
            set: function(key, value) {
                var storageKey = key + 'Settings';
                try {
                    localStorage.setItem(storageKey, JSON.stringify(value));
                    return true;
                } catch (e) {
                    console.error('[BokiTheme] Failed to save settings:', e);
                    return false;
                }
            },
            // Access specific setting categories
            getText: function() { return textStyleSettings; },
            getUsername: function() { return usernameStyleSettings; },
            getReply: function() { return replyStyleSettings; }
        },

        // Emote system
        Emotes: {
            getFavorites: function() { return emoteFavorites; },
            addFavorite: function(name) {
                if (emoteFavorites.indexOf(name) === -1) {
                    emoteFavorites.push(name);
                    localStorage.setItem('emoteFavorites', JSON.stringify(emoteFavorites));
                }
            },
            removeFavorite: function(name) {
                var idx = emoteFavorites.indexOf(name);
                if (idx !== -1) {
                    emoteFavorites.splice(idx, 1);
                    localStorage.setItem('emoteFavorites', JSON.stringify(emoteFavorites));
                }
            }
        },

        // Buddy system (populated after buddy system loads)
        Buddy: {
            getAll: function() { return typeof buddyCharacters !== 'undefined' ? buddyCharacters : {}; },
            getSettings: function() { return typeof myBuddySettings !== 'undefined' ? myBuddySettings : null; },
            getSprites: function() { return typeof BUDDY_SPRITES !== 'undefined' ? BUDDY_SPRITES : []; },
            isSyncEnabled: function() { return typeof syncEnabled !== 'undefined' ? syncEnabled : false; }
        },

        // User management
        Users: {
            getIgnored: function() { return ignoredUsers; },
            ignore: function(username) {
                var lower = username.toLowerCase();
                if (ignoredUsers.indexOf(lower) === -1) {
                    ignoredUsers.push(lower);
                    localStorage.setItem('ignoredUsers', JSON.stringify(ignoredUsers));
                }
            },
            unignore: function(username) {
                var lower = username.toLowerCase();
                ignoredUsers = ignoredUsers.filter(function(u) { return u !== lower; });
                localStorage.setItem('ignoredUsers', JSON.stringify(ignoredUsers));
            }
        },

        // UI preferences
        UI: {
            getEmoteSize: function() { return emoteSize; },
            setEmoteSize: function(size) {
                emoteSize = size;
                localStorage.setItem('emoteSize', size);
                if (typeof applyEmoteSize === 'function') applyEmoteSize();
            },
            getFontSize: function() { return chatFontSize; },
            setFontSize: function(size) {
                chatFontSize = size;
                localStorage.setItem('chatFontSize', size);
                if (typeof applyChatFontSize === 'function') applyChatFontSize();
            },
            isCompactMode: function() { return compactMode; },
            setCompactMode: function(enabled) {
                compactMode = enabled;
                localStorage.setItem('compactMode', enabled);
                document.body.classList.toggle('compact-mode', enabled);
            },
            isTimestampsVisible: function() { return timestampsVisible; },
            setTimestampsVisible: function(visible) {
                timestampsVisible = visible;
                localStorage.setItem('timestampsVisible', visible);
                if (typeof applyTimestampVisibility === 'function') applyTimestampVisibility();
            },
            isSoundEnabled: function() { return soundEnabled; },
            setSoundEnabled: function(enabled) {
                soundEnabled = enabled;
                localStorage.setItem('soundEnabled', enabled);
            }
        },

        // Memory management
        Memory: {
            // Configuration
            config: {
                maxChatMessages: 500,      // Max DOM nodes in message buffer
                maxBuddySettings: 100,     // Max cached buddy settings
                cleanupInterval: 60000     // Cleanup every 60 seconds
            },

            // Cleanup message buffer (remove old messages from DOM)
            cleanupMessageBuffer: function() {
                var msgBuffer = document.getElementById('messagebuffer');
                if (!msgBuffer) return 0;

                var messages = msgBuffer.querySelectorAll(':scope > div');
                var removed = 0;
                var maxMessages = this.config.maxChatMessages;

                if (messages.length > maxMessages) {
                    var toRemove = messages.length - maxMessages;
                    for (var i = 0; i < toRemove; i++) {
                        messages[i].remove();
                        removed++;
                    }
                }
                return removed;
            },

            // Cleanup buddy settings for users no longer present
            // Uses a 5-minute grace period so settings survive brief disconnects/rejoins
            cleanupBuddySettings: function() {
                if (typeof customBuddySettings === 'undefined' || typeof buddyCharacters === 'undefined') return 0;

                var removed = 0;
                var activeUsers = Object.keys(buddyCharacters);
                var now = Date.now();
                var GRACE_PERIOD = 5 * 60 * 1000; // 5 minutes

                Object.keys(customBuddySettings).forEach(function(username) {
                    if (activeUsers.indexOf(username) === -1) {
                        var departedAt = customBuddySettings[username]._departedAt;
                        if (departedAt && (now - departedAt) > GRACE_PERIOD) {
                            delete customBuddySettings[username];
                            removed++;
                        } else if (!departedAt) {
                            // First cleanup cycle after they left - start grace period
                            customBuddySettings[username]._departedAt = now;
                        }
                    } else {
                        // User is active - clear departure timestamp
                        if (customBuddySettings[username] && customBuddySettings[username]._departedAt) {
                            delete customBuddySettings[username]._departedAt;
                        }
                    }
                });
                return removed;
            },

            // Run all cleanup tasks
            runCleanup: function() {
                var results = {
                    messages: this.cleanupMessageBuffer(),
                    buddySettings: this.cleanupBuddySettings(),
                    timestamp: new Date().toISOString()
                };

                if (results.messages > 0 || results.buddySettings > 0) {
                    console.log('[BokiTheme:Memory] Cleanup:', results);
                }
                return results;
            },

            // Start automatic cleanup interval
            _intervalId: null,
            startAutoCleanup: function() {
                var self = this;
                if (this._intervalId) return;

                this._intervalId = setInterval(function() {
                    self.runCleanup();
                }, this.config.cleanupInterval);

                console.log('[BokiTheme:Memory] Auto-cleanup started (interval: ' + this.config.cleanupInterval + 'ms)');
            },

            stopAutoCleanup: function() {
                if (this._intervalId) {
                    clearInterval(this._intervalId);
                    this._intervalId = null;
                    console.log('[BokiTheme:Memory] Auto-cleanup stopped');
                }
            },

            // Get memory stats
            getStats: function() {
                var msgBuffer = document.getElementById('messagebuffer');
                return {
                    chatMessages: msgBuffer ? msgBuffer.querySelectorAll(':scope > div').length : 0,
                    buddySettings: typeof customBuddySettings !== 'undefined' ? Object.keys(customBuddySettings).length : 0,
                    buddyCharacters: typeof buddyCharacters !== 'undefined' ? Object.keys(buddyCharacters).length : 0,
                    autoCleanupActive: this._intervalId !== null
                };
            }
        },

        // Error handling utilities
        Safe: {
            // Wrap a function with try-catch error handling
            wrap: function(fn, fallback, context) {
                return function() {
                    try {
                        return fn.apply(context || this, arguments);
                    } catch (e) {
                        console.error('[BokiTheme:Error]', e.message, e.stack);
                        return typeof fallback === 'function' ? fallback(e) : fallback;
                    }
                };
            },

            // Execute a function safely with optional fallback
            exec: function(fn, fallback) {
                try {
                    return fn();
                } catch (e) {
                    console.error('[BokiTheme:Error]', e.message);
                    return fallback;
                }
            },

            // Safe JSON parse
            parseJSON: function(str, fallback) {
                try {
                    return JSON.parse(str);
                } catch (e) {
                    return fallback !== undefined ? fallback : null;
                }
            },

            // Safe localStorage get
            getStorage: function(key, fallback) {
                try {
                    var value = localStorage.getItem(key);
                    if (value === null) return fallback;
                    return JSON.parse(value);
                } catch (e) {
                    return fallback;
                }
            },

            // Safe localStorage set
            setStorage: function(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    console.error('[BokiTheme:Storage] Failed to save:', key, e.message);
                    return false;
                }
            }
        },

        // Debug utilities
        Debug: {
            getState: function() {
                return {
                    version: VERSION,
                    chatHandlers: BokiChatDispatcher.getHandlers(),
                    emoteFavorites: emoteFavorites.length,
                    ignoredUsers: ignoredUsers.length,
                    buddyCount: typeof buddyCharacters !== 'undefined' ? Object.keys(buddyCharacters).length : 0,
                    activeArtifacts: typeof buddyArtifacts !== 'undefined' ? Object.keys(buddyArtifacts).length : 0,
                    syncEnabled: typeof syncEnabled !== 'undefined' ? syncEnabled : false,
                    memory: BokiTheme.Memory.getStats(),
                    settings: {
                        emoteSize: emoteSize,
                        chatFontSize: chatFontSize,
                        compactMode: compactMode,
                        timestampsVisible: timestampsVisible,
                        soundEnabled: soundEnabled
                    }
                };
            },
            log: function(category, message) {
                console.log('[BokiTheme:' + category + ']', message);
            }
        },

        // Extension registration (for plugins)
        extend: function(name, extension) {
            if (this[name]) {
                console.warn('[BokiTheme] Extension "' + name + '" would overwrite existing property');
                return false;
            }
            this[name] = extension;
            console.log('[BokiTheme] Extension "' + name + '" registered');
            return true;
        }
    };
})();

// Expose globally
window.BokiTheme = BokiTheme;

// Central registry for cleanup of intervals and observers
var _bokiCleanup = {
    intervals: {},
    observers: {},
    registerInterval: function(name, id) { this.intervals[name] = id; },
    registerObserver: function(name, obs) { this.observers[name] = obs; },
    clearInterval: function(name) {
        if (this.intervals[name]) { clearInterval(this.intervals[name]); delete this.intervals[name]; }
    },
    disconnectObserver: function(name) {
        if (this.observers[name]) { this.observers[name].disconnect(); delete this.observers[name]; }
    },
    disconnectAll: function() {
        var self = this;
        Object.keys(self.intervals).forEach(function(k) { clearInterval(self.intervals[k]); });
        Object.keys(self.observers).forEach(function(k) { self.observers[k].disconnect(); });
        self.intervals = {};
        self.observers = {};
    }
};
window._bokiCleanup = _bokiCleanup;

/* ========== POPUP SYSTEM ========== */
var emoteFavorites = BokiTheme.Safe.getStorage('emoteFavorites', []);
var gifFavorites = BokiTheme.Safe.getStorage('gifFavorites', []);
var recentlyUsed = BokiTheme.Safe.getStorage('recentlyUsed', []);
var gifSearchHistory = BokiTheme.Safe.getStorage('gifSearchHistory', []);
var ignoredUsers = BokiTheme.Safe.getStorage('ignoredUsers', []);
var currentEmotePage = 0;
var emotesPerPage = 50;
var emoteSize = localStorage.getItem('emoteSize') || 'medium';
var compactMode = localStorage.getItem('compactMode') === 'true';
var soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
var chatFontSize = parseInt(localStorage.getItem('chatFontSize')) || 14;
var timestampsVisible = localStorage.getItem('timestampsVisible') !== 'false';
var theaterMode = false;
// Default settings objects
var TEXT_STYLE_DEFAULTS = {
    color: null,
    gradient: null,
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    glow: null,
    customGlow: null,
    animation: null,
    font: null,
    customColor: null
};

var USERNAME_STYLE_DEFAULTS = {
    enabled: false,
    color: null,
    gradient: null,
    glow: null,
    customGlow: null,
    animation: null,
    font: null,
    bold: false,
    customColor: null
};

var REPLY_STYLE_DEFAULTS = {
    enabled: false,
    borderColor: null,
    bgColor: null,
    bgOpacity: 15,
    animation: null,      // glow, pulse, shimmer, breathe, rainbow, neon
    borderStyle: null,    // thick, double, dotted, dashed
    borderRadius: null,   // rounded, pill
    glowColor: null,      // custom glow color
    glowIntensity: 10     // glow intensity
};

// Merge saved settings with defaults to ensure all fields exist
var textStyleSettings = Object.assign({}, TEXT_STYLE_DEFAULTS, BokiTheme.Safe.getStorage('textStyleSettings', {}));
var usernameStyleSettings = Object.assign({}, USERNAME_STYLE_DEFAULTS, BokiTheme.Safe.getStorage('usernameStyleSettings', {}));
var replyStyleSettings = Object.assign({}, REPLY_STYLE_DEFAULTS, BokiTheme.Safe.getStorage('replyStyleSettings', {}));

// Shared style lookup objects - used by both message and username preview functions
var STYLE_FONTS = {
    'comic': 'font-family:"Comic Sans MS",cursive',
    'impact': 'font-family:Impact,sans-serif',
    'papyrus': 'font-family:Papyrus,fantasy',
    'copperplate': 'font-family:Copperplate,fantasy',
    'brush': 'font-family:"Brush Script MT",cursive',
    'lucida': 'font-family:"Lucida Handwriting",cursive',
    'courier': 'font-family:"Courier New",monospace',
    'times': 'font-family:"Times New Roman",serif',
    'georgia': 'font-family:Georgia,serif',
    'trebuchet': 'font-family:"Trebuchet MS",sans-serif',
    'verdana': 'font-family:Verdana,sans-serif',
    'gothic': 'font-family:"Century Gothic",sans-serif',
    'garamond': 'font-family:Garamond,serif',
    'palatino': 'font-family:"Palatino Linotype",serif',
    'bookman': 'font-family:"Bookman Old Style",serif',
    'mono': 'font-family:monospace',
    'cursive': 'font-family:cursive',
    'fantasy': 'font-family:fantasy',
    'system': 'font-family:system-ui',
    'serif': 'font-family:serif'
};

var STYLE_GRADIENTS = {
    'rainbow': 'background:linear-gradient(90deg,#ff0000,#ff7700,#ffff00,#00ff00,#0077ff,#8b00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
    'fire': 'background:linear-gradient(90deg,#ff0000,#ff5500,#ffaa00,#ffcc00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
    'ocean': 'background:linear-gradient(90deg,#00ffff,#0088ff,#0044aa,#002255);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
    'sunset': 'background:linear-gradient(90deg,#ff6b6b,#ffa500,#ffdb58,#ff6b9d);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
    'neon': 'background:linear-gradient(90deg,#ff00ff,#00ffff,#ff00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
    'forest': 'background:linear-gradient(90deg,#228b22,#32cd32,#90ee90,#006400);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
    'gold': 'background:linear-gradient(90deg,#ffd700,#ffec8b,#daa520,#b8860b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
    'ice': 'background:linear-gradient(90deg,#e0ffff,#87ceeb,#add8e6,#b0e0e6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text'
};

var STYLE_GLOWS = {
    'glow-white': 'text-shadow:0 0 10px #fff,0 0 20px #fff,0 0 30px #fff',
    'glow-red': 'text-shadow:0 0 10px #f00,0 0 20px #f00,0 0 30px #f00',
    'glow-blue': 'text-shadow:0 0 10px #00f,0 0 20px #00f,0 0 30px #0ff',
    'glow-green': 'text-shadow:0 0 10px #0f0,0 0 20px #0f0,0 0 30px #0f0',
    'glow-gold': 'text-shadow:0 0 10px #ffd700,0 0 20px #ffa500,0 0 30px #ff8c00',
    'glow-pink': 'text-shadow:0 0 10px #ff69b4,0 0 20px #ff1493,0 0 30px #ff69b4',
    'glow-rainbow': 'text-shadow:0 0 5px #f00,0 0 10px #ff0,0 0 15px #0f0,0 0 20px #0ff,0 0 25px #00f,0 0 30px #f0f'
};

// Helper function to convert hex to rgba
function hexToRgba(hex, opacity) {
    if (!hex) return 'rgba(143, 100, 9, 0.15)';
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (opacity / 100) + ')';
}

// Inject popup CSS with !important to override any conflicts
(function() {
    var s = document.createElement('style');
    s.id = 'custom-popup-styles';
    s.textContent = `
        /* FIX: Button layout in leftcontrols - horizontal scroll */
        #leftcontrols {
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: 3px !important;
            padding: 6px 8px !important;
            align-items: center !important;
            justify-content: flex-start !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            flex-shrink: 0 !important;
        }
        #leftcontrols::-webkit-scrollbar {
            display: block !important;
            height: 6px !important;
        }
        #leftcontrols::-webkit-scrollbar-thumb {
            background: var(--tertiarycolor, #8F6409) !important;
            border-radius: 3px !important;
        }
        #leftcontrols::-webkit-scrollbar-track {
            background: var(--secondarycolor, #0F0F0F) !important;
        }
        #leftcontrols .btn {
            flex: 0 0 auto !important;
            margin: 0 !important;
            padding: 5px 10px !important;
            font-size: 12px !important;
        }
        /* Hide Name Color button from external scripts - aggressive targeting */
        .btn-success,
        .btn[style*="green"],
        button[style*="green"],
        .btn[style*="#28a745"],
        button[style*="#28a745"],
        .btn[style*="rgb(40, 167, 69)"],
        button[style*="rgb(40, 167, 69)"],
        #chatheader .btn-success,
        #chatheader .btn[style*="green"],
        #rightcontent .btn-success,
        #rightcontent > .btn-success,
        #usercount + .btn,
        #usercount ~ .btn {
            display: none !important;
            visibility: hidden !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
            position: absolute !important;
            left: -9999px !important;
        }
        
        #emote-popup-overlay, #textstyle-popup-overlay, #filter-popup-overlay, #buddy-settings-overlay {
            display: none !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0,0,0,0.7) !important;
            z-index: 999999 !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        #emote-popup-overlay.visible, #textstyle-popup-overlay.visible, #filter-popup-overlay.visible, #buddy-settings-overlay.visible {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        #emote-popup, #textstyle-popup, #filter-popup, #buddy-settings-popup {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            background: #1e1e24 !important;
            border: 2px solid #555 !important;
            border-radius: 12px !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.9) !important;
        }
        #buddy-settings-popup {
            width: 480px !important;
            max-width: 95vw !important;
            max-height: 85vh !important;
            display: flex !important;
            flex-direction: column !important;
        }
        /* Hide buddy sync messages in chat and NND overlay */
        .buddy-sync-msg { display: none !important; }
        #emote-popup {
            width: 460px !important;
            max-width: 95vw !important;
            height: 560px !important;
            max-height: 85vh !important;
            display: flex !important;
            flex-direction: column !important;
        }
        #textstyle-popup {
            width: 450px !important;
            max-width: 95vw !important;
            max-height: 85vh !important;
            display: flex !important;
            flex-direction: column !important;
        }
        #textstyle-tabs {
            display: flex !important;
            background: #252530 !important;
            padding: 8px !important;
            gap: 8px !important;
        }
        .style-tab {
            flex: 1 !important;
            padding: 10px !important;
            background: #333 !important;
            border: none !important;
            color: #999 !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            font-size: 14px !important;
            transition: all 0.15s !important;
        }
        .style-tab:hover {
            background: #444 !important;
        }
        .style-tab.active {
            background: #555 !important;
            color: #fff !important;
        }
        #textstyle-tab-content {
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
            overflow: hidden !important;
        }
        .textstyle-popup-scroll {
            flex: 1 !important;
            overflow-y: auto !important;
            max-height: 60vh !important;
        }
        /* Animation preview classes */
        .text-shake {
            animation: shake 0.5s ease-in-out infinite !important;
            display: inline-block !important;
        }
        .text-pulse {
            animation: pulse 1s ease-in-out infinite !important;
            display: inline-block !important;
        }
        .text-bounce {
            animation: bounce 0.6s ease infinite !important;
            display: inline-block !important;
        }
        .text-wave {
            animation: wave 2s ease-in-out infinite !important;
            display: inline-block !important;
        }
        .text-flicker {
            animation: flicker 0.3s ease-in-out infinite !important;
            display: inline-block !important;
        }
        .text-spin {
            animation: spin 2s linear infinite !important;
            display: inline-block !important;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            75% { transform: translateX(3px); }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        @keyframes wave {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-3px) rotate(-2deg); }
            75% { transform: translateY(3px) rotate(2deg); }
        }
        @keyframes flicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        #filter-popup {
            width: 700px !important;
            max-width: 95vw !important;
            max-height: 85vh !important;
            display: flex !important;
            flex-direction: column !important;
        }
        .popup-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 14px 18px !important;
            background: #2d2d35 !important;
            border-radius: 10px 10px 0 0 !important;
            cursor: move !important;
        }
        .popup-header span {
            color: #fff !important;
            font-weight: bold !important;
            font-size: 16px !important;
        }
        .popup-close {
            background: #e44 !important;
            border: none !important;
            color: #fff !important;
            width: 32px !important;
            height: 32px !important;
            border-radius: 50% !important;
            font-size: 20px !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        .popup-close:hover { background: #f66 !important; }

        /* Impersonation popup styles */
        #impersonate-popup-overlay {
            display: none !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0,0,0,0.7) !important;
            z-index: 999999 !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        #impersonate-popup-overlay.visible {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        #impersonate-popup {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            background: #1e1e24 !important;
            border: 2px solid #555 !important;
            border-radius: 12px !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.9) !important;
            width: 380px !important;
            max-width: 95vw !important;
        }
        #impersonate-popup-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 14px 18px !important;
            background: #2d2d35 !important;
            border-radius: 10px 10px 0 0 !important;
            cursor: move !important;
        }
        #impersonate-popup-header span {
            color: #fff !important;
            font-weight: bold !important;
            font-size: 16px !important;
        }
        #impersonate-popup-body {
            padding: 16px !important;
        }
        #impersonate-target-display {
            background: #252530 !important;
            padding: 12px !important;
            border-radius: 8px !important;
            margin-bottom: 12px !important;
            color: #ccc !important;
            font-size: 14px !important;
        }
        #impersonate-target-display .target-label {
            color: #888 !important;
            font-size: 12px !important;
            margin-bottom: 4px !important;
        }
        #impersonate-target-display .target-name {
            color: #fff !important;
            font-weight: bold !important;
            font-size: 15px !important;
        }
        #impersonate-message-input {
            width: 100% !important;
            padding: 12px !important;
            background: #333 !important;
            border: 1px solid #555 !important;
            border-radius: 8px !important;
            color: #fff !important;
            font-size: 14px !important;
            box-sizing: border-box !important;
            resize: vertical !important;
            min-height: 60px !important;
        }
        #impersonate-message-input:focus {
            outline: none !important;
            border-color: #8F6409 !important;
        }
        #impersonate-popup-actions {
            display: flex !important;
            gap: 10px !important;
            margin-top: 14px !important;
        }
        #impersonate-popup-actions button {
            flex: 1 !important;
            padding: 12px !important;
            border: none !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            font-size: 14px !important;
            font-weight: bold !important;
        }
        #impersonate-send-btn {
            background: #8F6409 !important;
            color: #fff !important;
        }
        #impersonate-send-btn:hover {
            background: #A67A0A !important;
        }
        #impersonate-cancel-btn {
            background: #444 !important;
            color: #ccc !important;
        }
        #impersonate-cancel-btn:hover {
            background: #555 !important;
        }

        #emote-popup-tabs {
            display: flex !important;
            background: #252530 !important;
            padding: 8px !important;
            gap: 8px !important;
        }
        .emote-tab {
            flex: 1 !important;
            padding: 10px !important;
            background: #333 !important;
            border: none !important;
            color: #999 !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            font-size: 14px !important;
        }
        .emote-tab.active {
            background: #555 !important;
            color: #fff !important;
        }
        #emote-popup-search {
            padding: 10px !important;
            background: #252530 !important;
        }
        #emote-popup-search input {
            width: 100% !important;
            padding: 10px 12px !important;
            background: #333 !important;
            border: 1px solid #555 !important;
            border-radius: 6px !important;
            color: #fff !important;
            font-size: 14px !important;
            box-sizing: border-box !important;
        }
        #emote-popup-body {
            flex: 1 !important;
            overflow-y: auto !important;
            padding: 12px !important;
            display: flex !important;
            flex-wrap: wrap !important;
            align-content: flex-start !important;
            gap: 8px !important;
            background: #1e1e24 !important;
        }
        .emote-item {
            position: relative !important;
            width: 68px !important;
            height: 68px !important;
            background: #2a2a32 !important;
            border-radius: 8px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            transition: all .15s !important;
        }
        .emote-item:hover {
            background: #3a3a44 !important;
            transform: scale(1.08) !important;
        }
        .emote-item.gif-item {
            width: 100px !important;
            height: 100px !important;
        }
        .emote-item.gif-item img {
            max-width: 90px !important;
            max-height: 90px !important;
        }
        .emote-item img {
            max-width: 58px !important;
            max-height: 58px !important;
        }
        .emote-fav {
            position: absolute !important;
            top: -6px !important;
            right: -6px !important;
            width: 24px !important;
            height: 24px !important;
            background: #333 !important;
            border: 1px solid #555 !important;
            border-radius: 50% !important;
            color: #666 !important;
            font-size: 14px !important;
            cursor: pointer !important;
            display: none !important;
            align-items: center !important;
            justify-content: center !important;
        }
        .emote-item:hover .emote-fav { display: flex !important; }
        .emote-fav.faved {
            display: flex !important;
            color: gold !important;
            background: #4a4a00 !important;
        }
        #emote-popup-pagination {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 15px !important;
            padding: 12px !important;
            background: #252530 !important;
            border-radius: 0 0 10px 10px !important;
        }
        #emote-popup-pagination button {
            padding: 8px 18px !important;
            background: #444 !important;
            border: none !important;
            color: #fff !important;
            border-radius: 6px !important;
            cursor: pointer !important;
        }
        #emote-popup-pagination button:disabled {
            opacity: .4 !important;
            cursor: not-allowed !important;
        }
        #emote-popup-pageinfo { color: #aaa !important; }

        /* Emote size toggle */
        .emote-size-toggle {
            display: flex !important;
            gap: 2px !important;
            margin-left: auto !important;
            margin-right: 10px !important;
        }
        .size-btn {
            width: 24px !important;
            height: 24px !important;
            background: #333 !important;
            border: 1px solid #555 !important;
            color: #888 !important;
            font-size: 11px !important;
            cursor: pointer !important;
            border-radius: 4px !important;
        }
        .size-btn.active {
            background: var(--tertiarycolor, #8F6409) !important;
            color: #fff !important;
        }

        /* GIF search history */
        #gif-search-history {
            display: none;
            flex-wrap: wrap;
            gap: 6px;
            padding: 8px 0 0 0;
        }
        .gif-history-item {
            background: #333 !important;
            padding: 4px 10px !important;
            border-radius: 12px !important;
            font-size: 11px !important;
            color: #aaa !important;
            cursor: pointer !important;
        }
        .gif-history-item:hover {
            background: #444 !important;
            color: #fff !important;
        }

        /* GIF preview popup */
        #gif-preview-popup {
            display: none;
            position: fixed !important;
            bottom: 20px !important;
            left: 20px !important;
            background: #1e1e24 !important;
            border: 2px solid #555 !important;
            border-radius: 10px !important;
            padding: 10px !important;
            z-index: 1000002 !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8) !important;
        }
        #gif-preview-popup img {
            max-width: 250px !important;
            max-height: 250px !important;
        }

        /* Mention autocomplete */
        #mention-autocomplete {
            display: none;
            position: absolute !important;
            background: #1e1e24 !important;
            border: 1px solid #555 !important;
            border-radius: 8px !important;
            max-height: 200px !important;
            overflow-y: auto !important;
            z-index: 100000 !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
        #mention-autocomplete.visible { display: block !important; }
        .mention-item {
            padding: 8px 12px !important;
            cursor: pointer !important;
            color: #ccc !important;
        }
        .mention-item:hover, .mention-item.selected {
            background: var(--tertiarycolor, #8F6409) !important;
            color: #fff !important;
        }

        /* Settings panel */
        #settings-panel {
            display: none;
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            background: #1e1e24 !important;
            border: 2px solid #555 !important;
            border-radius: 12px !important;
            padding: 20px !important;
            z-index: 1000000 !important;
            min-width: 300px !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8) !important;
        }
        #settings-panel.visible { display: block !important; }
        .settings-row {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 10px 0 !important;
            border-bottom: 1px solid #333 !important;
        }
        .settings-row:last-child { border-bottom: none !important; }
        .settings-label { color: #ccc !important; }
        .settings-toggle {
            width: 44px !important;
            height: 24px !important;
            background: #444 !important;
            border-radius: 12px !important;
            position: relative !important;
            cursor: pointer !important;
            transition: background 0.2s !important;
        }
        .settings-toggle.on { background: var(--tertiarycolor, #8F6409) !important; }
        .settings-toggle::after {
            content: '' !important;
            position: absolute !important;
            width: 20px !important;
            height: 20px !important;
            background: #fff !important;
            border-radius: 50% !important;
            top: 2px !important;
            left: 2px !important;
            transition: left 0.2s !important;
        }
        .settings-toggle.on::after { left: 22px !important; }
        .settings-slider {
            width: 100px !important;
            -webkit-appearance: none !important;
            background: #444 !important;
            height: 6px !important;
            border-radius: 3px !important;
        }
        .settings-slider::-webkit-slider-thumb {
            -webkit-appearance: none !important;
            width: 16px !important;
            height: 16px !important;
            background: var(--tertiarycolor, #8F6409) !important;
            border-radius: 50% !important;
            cursor: pointer !important;
        }

        /* Compact mode */
        body.compact-mode #messagebuffer > div {
            padding: 2px 8px !important;
            margin: 1px 0 !important;
        }
        body.compact-mode .timestamp { font-size: 9px !important; }

        /* Reply button styling */
        .reply-button {
            background: transparent !important;
            border: none !important;
            color: #555 !important;
            cursor: pointer !important;
            padding: 2px 6px !important;
            font-size: 14px !important;
            opacity: 0 !important;
            transition: opacity 0.2s !important;
            margin-left: 8px !important;
            vertical-align: middle !important;
        }
        .reply-button::before { content: '↩'; }
        .reply-button:hover { color: var(--tertiarycolor, #8F6409) !important; }
        #messagebuffer > div:hover .reply-button { opacity: 1 !important; }

        /* Reply indicator above chat input */
        #reply-indicator {
            display: none;
            background: linear-gradient(90deg, rgba(143,100,9,0.2) 0%, rgba(30,30,36,0.9) 100%) !important;
            border-left: 3px solid var(--tertiarycolor, #8F6409) !important;
            padding: 8px 12px !important;
            margin: 0 !important;
            font-size: 13px !important;
            color: #ccc !important;
            justify-content: space-between !important;
            align-items: center !important;
            gap: 10px !important;
        }
        .reply-indicator-content {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            cursor: pointer !important;
            flex: 1 !important;
            overflow: hidden !important;
        }
        .reply-indicator-content:hover { color: #fff !important; }
        .reply-indicator-icon { color: var(--tertiarycolor, #8F6409) !important; font-size: 16px !important; }
        .reply-indicator-user { font-weight: bold !important; }
        .reply-indicator-msg { color: #888 !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
        .reply-indicator-close {
            background: transparent !important;
            border: none !important;
            color: #666 !important;
            cursor: pointer !important;
            font-size: 18px !important;
            padding: 0 4px !important;
            line-height: 1 !important;
        }
        .reply-indicator-close:hover { color: #fff !important; }

        /* Highlight source message when replying */
        .reply-source-highlight {
            background: rgba(143, 100, 9, 0.15) !important;
            border-left: 3px solid var(--tertiarycolor, #8F6409) !important;
            margin-left: -3px !important;
        }

        /* Inline reply display in messages */
        .inline-reply {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            background: rgba(143, 100, 9, 0.1) !important;
            border-left: 2px solid var(--tertiarycolor, #8F6409) !important;
            padding: 4px 8px !important;
            margin-bottom: 4px !important;
            font-size: 12px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            transition: background 0.2s !important;
        }
        .inline-reply:hover { background: rgba(143, 100, 9, 0.25) !important; }
        .inline-reply-icon { color: var(--tertiarycolor, #8F6409) !important; }
        .inline-reply-user { font-weight: bold !important; color: #bbb !important; }
        .inline-reply-msg { color: #777 !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; flex: 1 !important; }

        /* Message that has a reply attached */
        .has-reply {
            background: rgba(143, 100, 9, 0.05) !important;
        }

        /* Message that is being replied to (original message) */
        .reply-target {
            border-left: 3px solid var(--tertiarycolor, #8F6409) !important;
            margin-left: -3px !important;
            padding-left: 10px !important;
            background: rgba(143, 100, 9, 0.1) !important;
            position: relative !important;
        }

        /* Message that IS a reply (starts with ▶) */
        .is-reply-message {
            border-left: 3px solid var(--tertiarycolor, #8F6409) !important;
            margin-left: -3px !important;
            padding-left: 10px !important;
            background: rgba(143, 100, 9, 0.15) !important;
            position: relative !important;
        }
        /* Connecting line from reply to original */
        .is-reply-message::before {
            content: '↳' !important;
            position: absolute !important;
            left: -1px !important;
            top: -2px !important;
            font-size: 14px !important;
            color: var(--tertiarycolor, #8F6409) !important;
            transform: translateX(-50%) !important;
        }

        /* Reply color cycling - 12 colors that complement the dark theme */
        .is-reply-message.reply-color-0, .reply-target.reply-color-0 {
            border-left-color: #8F6409 !important;
            background: rgba(143, 100, 9, 0.15) !important;
        }
        .is-reply-message.reply-color-0::before { color: #8F6409 !important; }

        .is-reply-message.reply-color-1, .reply-target.reply-color-1 {
            border-left-color: #0D8F8F !important;
            background: rgba(13, 143, 143, 0.15) !important;
        }
        .is-reply-message.reply-color-1::before { color: #0D8F8F !important; }

        .is-reply-message.reply-color-2, .reply-target.reply-color-2 {
            border-left-color: #7B4B9E !important;
            background: rgba(123, 75, 158, 0.15) !important;
        }
        .is-reply-message.reply-color-2::before { color: #7B4B9E !important; }

        .is-reply-message.reply-color-3, .reply-target.reply-color-3 {
            border-left-color: #A34D4D !important;
            background: rgba(163, 77, 77, 0.15) !important;
        }
        .is-reply-message.reply-color-3::before { color: #A34D4D !important; }

        .is-reply-message.reply-color-4, .reply-target.reply-color-4 {
            border-left-color: #4A8F4A !important;
            background: rgba(74, 143, 74, 0.15) !important;
        }
        .is-reply-message.reply-color-4::before { color: #4A8F4A !important; }

        .is-reply-message.reply-color-5, .reply-target.reply-color-5 {
            border-left-color: #4A6FA5 !important;
            background: rgba(74, 111, 165, 0.15) !important;
        }
        .is-reply-message.reply-color-5::before { color: #4A6FA5 !important; }

        .is-reply-message.reply-color-6, .reply-target.reply-color-6 {
            border-left-color: #9E4B7B !important;
            background: rgba(158, 75, 123, 0.15) !important;
        }
        .is-reply-message.reply-color-6::before { color: #9E4B7B !important; }

        .is-reply-message.reply-color-7, .reply-target.reply-color-7 {
            border-left-color: #B37400 !important;
            background: rgba(179, 116, 0, 0.15) !important;
        }
        .is-reply-message.reply-color-7::before { color: #B37400 !important; }

        .is-reply-message.reply-color-8, .reply-target.reply-color-8 {
            border-left-color: #3D9EAA !important;
            background: rgba(61, 158, 170, 0.15) !important;
        }
        .is-reply-message.reply-color-8::before { color: #3D9EAA !important; }

        .is-reply-message.reply-color-9, .reply-target.reply-color-9 {
            border-left-color: #6B8F2E !important;
            background: rgba(107, 143, 46, 0.15) !important;
        }
        .is-reply-message.reply-color-9::before { color: #6B8F2E !important; }

        .is-reply-message.reply-color-10, .reply-target.reply-color-10 {
            border-left-color: #B36666 !important;
            background: rgba(179, 102, 102, 0.15) !important;
        }
        .is-reply-message.reply-color-10::before { color: #B36666 !important; }

        .is-reply-message.reply-color-11, .reply-target.reply-color-11 {
            border-left-color: #5B5BAA !important;
            background: rgba(91, 91, 170, 0.15) !important;
        }
        .is-reply-message.reply-color-11::before { color: #5B5BAA !important; }

        /* Custom reply styling (user override) - higher specificity to override color classes */
        .is-reply-message.reply-custom,
        .reply-target.reply-custom,
        #messagebuffer .is-reply-message.reply-custom,
        #messagebuffer .reply-target.reply-custom {
            border-left-color: var(--custom-reply-color, #8F6409) !important;
            background: var(--custom-reply-bg, rgba(143, 100, 9, 0.15)) !important;
        }
        .is-reply-message.reply-custom::before { color: var(--custom-reply-color, #8F6409) !important; }

        /* Custom reply animations */
        .is-reply-message.reply-anim-glow, .reply-target.reply-anim-glow {
            box-shadow: 0 0 var(--custom-reply-glow-intensity, 10px) var(--custom-reply-glow-color, var(--custom-reply-color, #8F6409)), inset 0 0 4px rgba(255,255,255,0.1) !important;
        }
        .is-reply-message.reply-anim-pulse, .reply-target.reply-anim-pulse {
            animation: reply-pulse 2s ease-in-out infinite !important;
        }
        .is-reply-message.reply-anim-shimmer, .reply-target.reply-anim-shimmer {
            animation: reply-shimmer 3s linear infinite !important;
            background-size: 200% 100% !important;
        }
        .is-reply-message.reply-anim-breathe, .reply-target.reply-anim-breathe {
            animation: reply-breathe 4s ease-in-out infinite !important;
        }
        .is-reply-message.reply-anim-rainbow, .reply-target.reply-anim-rainbow {
            animation: reply-rainbow 5s linear infinite !important;
        }
        .is-reply-message.reply-anim-neon, .reply-target.reply-anim-neon {
            animation: reply-neon 1.5s ease-in-out infinite alternate !important;
        }
        /* Flash effect - subtle highlight flash */
        .is-reply-message.reply-anim-flash, .reply-target.reply-anim-flash {
            animation: reply-flash 1s ease-in-out infinite !important;
        }
        /* Slide effect - subtle horizontal movement */
        .is-reply-message.reply-anim-slide, .reply-target.reply-anim-slide {
            animation: reply-slide 2s ease-in-out infinite !important;
        }

        /* Reply border styles */
        .is-reply-message.reply-border-thick, .reply-target.reply-border-thick {
            border-left-width: 5px !important;
        }
        .is-reply-message.reply-border-double, .reply-target.reply-border-double {
            border-left-width: 6px !important;
            border-left-style: double !important;
        }
        .is-reply-message.reply-border-dotted, .reply-target.reply-border-dotted {
            border-left-style: dotted !important;
            border-left-width: 4px !important;
        }
        .is-reply-message.reply-border-dashed, .reply-target.reply-border-dashed {
            border-left-style: dashed !important;
        }

        /* Reply border radius options */
        .is-reply-message.reply-rounded, .reply-target.reply-rounded {
            border-radius: 8px !important;
        }
        .is-reply-message.reply-pill, .reply-target.reply-pill {
            border-radius: 20px !important;
        }

        /* Reply keyframe animations */
        @keyframes reply-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.85; transform: scale(1.005); }
        }
        @keyframes reply-shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        @keyframes reply-breathe {
            0%, 100% { box-shadow: 0 0 5px var(--custom-reply-glow-color, var(--custom-reply-color, #8F6409)); }
            50% { box-shadow: 0 0 15px var(--custom-reply-glow-color, var(--custom-reply-color, #8F6409)), 0 0 25px var(--custom-reply-glow-color, var(--custom-reply-color, #8F6409)); }
        }
        @keyframes reply-rainbow {
            0% { border-left-color: #ff0000; }
            17% { border-left-color: #ff8000; }
            33% { border-left-color: #ffff00; }
            50% { border-left-color: #00ff00; }
            67% { border-left-color: #0080ff; }
            83% { border-left-color: #8000ff; }
            100% { border-left-color: #ff0000; }
        }
        @keyframes reply-neon {
            0% { box-shadow: 0 0 5px var(--custom-reply-glow-color, var(--custom-reply-color, #8F6409)), 0 0 10px var(--custom-reply-glow-color, var(--custom-reply-color, #8F6409)); }
            100% { box-shadow: 0 0 10px var(--custom-reply-glow-color, var(--custom-reply-color, #8F6409)), 0 0 20px var(--custom-reply-glow-color, var(--custom-reply-color, #8F6409)), 0 0 30px var(--custom-reply-glow-color, var(--custom-reply-color, #8F6409)); }
        }
        @keyframes reply-flash {
            0%, 100% { background-color: var(--custom-reply-bg, rgba(143, 100, 9, 0.15)); }
            50% { background-color: var(--custom-reply-bg, rgba(143, 100, 9, 0.35)); filter: brightness(1.2); }
        }
        @keyframes reply-slide {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(3px); }
        }

        /* Legacy reply styling */
        .reply {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            background: rgba(143, 100, 9, 0.1) !important;
            border-left: 2px solid var(--tertiarycolor, #8F6409) !important;
            padding: 4px 8px !important;
            margin-bottom: 4px !important;
            font-size: 12px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
        }
        .reply:hover { background: rgba(143, 100, 9, 0.25) !important; }
        .reply-header { font-weight: bold !important; color: #bbb !important; }
        .reply-msg { color: #777 !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; max-width: 200px !important; }

        /* Mention highlight */
        .mention-highlight {
            background: rgba(143, 100, 9, 0.3) !important;
            border-left: 3px solid var(--tertiarycolor, #8F6409) !important;
        }

        /* Theater mode */
        body.theater-mode #leftcontent {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 99999 !important;
        }
        body.theater-mode #rightcontent { display: none !important; }
        body.theater-mode #videowrap { height: 100vh !important; }
        #theater-exit-btn {
            display: none;
            position: fixed !important;
            top: 10px !important;
            right: 10px !important;
            z-index: 100000 !important;
            background: rgba(0,0,0,0.7) !important;
            color: #fff !important;
            border: none !important;
            padding: 10px 20px !important;
            border-radius: 8px !important;
            cursor: pointer !important;
        }
        body.theater-mode #theater-exit-btn { display: block !important; }

        /* Ignored user message */
        .ignored-user-msg {
            opacity: 0.3 !important;
            font-style: italic !important;
        }

        #favorites-dropdown {
            display: none;
            position: fixed !important;
            z-index: 1000001 !important;
            background: #1e1e24 !important;
            border: 2px solid #555 !important;
            border-radius: 10px !important;
            padding: 12px !important;
            max-width: 350px !important;
            max-height: 240px !important;
            overflow-y: auto !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8) !important;
        }
        #favorites-dropdown.visible { display: block !important; }
        #favorites-dropdown .fav-grid {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
        }
        #favorites-dropdown img {
            width: 52px !important;
            height: 52px !important;
            object-fit: contain !important;
            background: #2a2a32 !important;
            border-radius: 6px !important;
            padding: 5px !important;
            cursor: pointer !important;
            transition: all .15s !important;
        }
        #favorites-dropdown img:hover {
            transform: scale(1.12) !important;
            background: #3a3a44 !important;
        }
        .textstyle-section {
            padding: 14px 18px !important;
            border-bottom: 1px solid #333 !important;
        }
        .textstyle-section:last-child { border-bottom: none !important; }
        .textstyle-section h4 {
            color: #888 !important;
            font-size: 11px !important;
            text-transform: uppercase !important;
            margin: 0 0 10px !important;
            letter-spacing: 1px !important;
        }
        .textstyle-grid {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 6px !important;
        }
        .textstyle-btn {
            padding: 8px 12px !important;
            background: #333 !important;
            border: 2px solid #444 !important;
            border-radius: 6px !important;
            color: #fff !important;
            font-size: 12px !important;
            cursor: pointer !important;
            transition: all .15s !important;
        }
        .textstyle-btn:hover { background: #444 !important; }
        .textstyle-btn.active {
            border-color: gold !important;
            box-shadow: 0 0 10px rgba(255,215,0,0.4) !important;
        }
        .custom-color-row {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            margin-top: 10px !important;
            padding: 8px !important;
            background: #252530 !important;
            border-radius: 6px !important;
        }
        .custom-color-row label {
            color: #aaa !important;
            font-size: 12px !important;
            white-space: nowrap !important;
        }
        .custom-color-row input[type="color"] {
            width: 40px !important;
            height: 30px !important;
            border: none !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            background: none !important;
            padding: 0 !important;
        }
        .custom-color-row .textstyle-btn {
            flex: 1 !important;
        }
        .buddy-slider-row {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            margin-bottom: 8px !important;
            padding: 6px 10px !important;
            background: #252530 !important;
            border-radius: 6px !important;
        }
        .buddy-slider-row label {
            flex: 1 !important;
            color: #aaa !important;
            font-size: 12px !important;
        }
        .buddy-slider-row label span {
            color: #fc0 !important;
            font-weight: bold !important;
        }
        .buddy-slider-row input[type="range"] {
            flex: 2 !important;
            height: 6px !important;
            -webkit-appearance: none !important;
            background: #444 !important;
            border-radius: 3px !important;
        }
        .buddy-slider-row input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none !important;
            width: 16px !important;
            height: 16px !important;
            border-radius: 50% !important;
            background: #fc0 !important;
            cursor: pointer !important;
        }
        .sprite-grid .textstyle-btn {
            min-width: 40px !important;
            padding: 4px !important;
        }
        #textstyle-preview {
            padding: 16px !important;
            background: #111 !important;
            border-radius: 6px !important;
            text-align: center !important;
            min-height: 50px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        #textstyle-reset {
            width: 100% !important;
            padding: 12px !important;
            background: #422 !important;
            border: 1px solid #633 !important;
            border-radius: 6px !important;
            color: #f88 !important;
            cursor: pointer !important;
        }
        .textstyle-info {
            padding: 12px 18px !important;
            background: #252530 !important;
            font-size: 12px !important;
            color: #aaa !important;
        }
        .textstyle-info a { color: #5af !important; }
        #filter-popup-body {
            padding: 18px !important;
            overflow-y: auto !important;
            color: #ddd !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            flex: 1 !important;
            min-height: 0 !important;
        }
        #filter-popup-body details {
            margin-bottom: 5px !important;
        }
        #filter-popup-body summary {
            padding: 8px 0 !important;
            user-select: none !important;
        }
        #filter-popup-body details[open] summary {
            margin-bottom: 8px !important;
        }
        #filter-popup-body table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 15px 0 !important;
            font-size: 11px !important;
        }
        #filter-popup-body th, #filter-popup-body td {
            padding: 8px !important;
            border: 1px solid #444 !important;
            text-align: left !important;
        }
        #filter-popup-body th { background: #333 !important; }
        #filter-popup-body td { background: #222 !important; font-family: monospace !important; }
        
        /* Styled username */
        .styled-username {
            font-weight: bold !important;
        }
        .styled-username::after {
            content: ': ' !important;
        }
        
        /* Hide styled username from niconico overlay */
        #nnd-container .styled-username,
        .nnd-message .styled-username,
        [class*="nnd"] .styled-username,
        .danmaku .styled-username {
            display: none !important;
        }
        
        /* Hide consecutive styled usernames */
        .styled-username.hidden-consecutive {
            display: none !important;
        }
        
        /* When styled username is present, hide original username element */
        /* Note: Only hide .username itself, not siblings (removed + * which was hiding message content) */
        .chat-msg-with-styled-name > .username {
            display: none !important;
        }

        /* Pure CSS detection using :has() - hides original username instantly without waiting for JS */
        /* This fixes the race condition where JS runs before Cytube filters process [uname] tags */
        /* Using both > (direct child) and descendant selector to handle all DOM structures */
        #messagebuffer > div:has(.styled-username) > .username,
        #messagebuffer > div:has(.styled-username) .username {
            display: none !important;
        }

        /* Ensure regular usernames (without styled-username) are always visible */
        /* Added :not(:has(.styled-username)) to prevent this rule from overriding the hide rule above */
        #messagebuffer > div:not(.chat-msg-with-styled-name):not(:has(.styled-username)) > .username {
            display: flex !important;
        }

        /* Chat message styling - 80% size and new layout */
        #messagebuffer > div {
            font-size: 80% !important;
            position: relative !important;
        }
        
        /* Timestamp styling */
        #messagebuffer > div > .timestamp {
            font-size: 85% !important;
            opacity: 0.6 !important;
        }
        
        /* When message has visible username - timestamp floats right on username line */
        #messagebuffer > div.has-visible-username > .timestamp {
            float: right !important;
        }
        
        /* When message has hidden username - timestamp hidden, full width message */
        #messagebuffer > div.has-hidden-username > .timestamp {
            display: none !important;
        }
        
        /* Styled username on its own line */
        .styled-username {
            display: block !important;
            font-weight: bold !important;
        }
        .styled-username::after {
            content: '' !important;
        }
        
        /* Hide consecutive styled usernames */
        .styled-username.hidden-consecutive {
            display: none !important;
        }
        
        /* Connected users list - vertical and scrollable */
        #userlist {
            max-height: 50vh !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            flex-wrap: nowrap !important;
        }
        
        /* User items stack vertically */
        #userlist .userlist_item {
            display: flex !important;
            width: 100% !important;
            flex-shrink: 0 !important;
        }
        
        /* User dropdown menu - keep on screen */
        .user-dropdown {
            max-height: 60vh !important;
            overflow-y: auto !important;
            position: absolute !important;
            z-index: 1000 !important;
        }
        
        /* Chatheader dropdown if it exists */
        #chatheader {
            position: relative !important;
        }
        
        /* Username animations */
        .username-shake { display: inline-block; animation: shake 0.5s ease-in-out infinite; }
        .username-pulse { display: inline-block; animation: pulse 1s ease-in-out infinite; }
        .username-bounce { display: inline-block; animation: bounce 0.6s ease infinite; }
        .username-wave { display: inline-block; animation: wave 2s ease-in-out infinite; }
        .username-flicker { display: inline-block; animation: flicker 0.3s ease-in-out infinite; }
        .username-spin { display: inline-block; animation: spin 2s linear infinite; }
    `;
    document.head.appendChild(s);
})();

// TENOR GIF API KEY
var TENOR_API_KEY = 'AIzaSyD7rP9x4VgpMzVSOPku2Awjh_OARNuJK9o';
var gifSearchResults = [];
var currentGifPage = 0;
var gifsPerPage = 20;
var lastGifSearch = '';
var gifNextPos = '';

// EMOTE POPUP
function createEmotePopup() {
    if (document.getElementById('emote-popup-overlay')) return;
    var o = document.createElement('div');
    o.id = 'emote-popup-overlay';
    o.onclick = function(e) { if (e.target === o) closeEmotePopup(); };
    var p = document.createElement('div');
    p.id = 'emote-popup';
    p.innerHTML = '<div class="popup-header" id="emote-popup-header"><span>Emotes</span><div class="emote-size-toggle" title="Emote size"><button onclick="setEmoteSize(\'small\')" class="size-btn' + (emoteSize === 'small' ? ' active' : '') + '">S</button><button onclick="setEmoteSize(\'medium\')" class="size-btn' + (emoteSize === 'medium' ? ' active' : '') + '">M</button><button onclick="setEmoteSize(\'large\')" class="size-btn' + (emoteSize === 'large' ? ' active' : '') + '">L</button></div><button class="popup-close" onclick="closeEmotePopup()">×</button></div>' +
        '<div id="emote-popup-tabs"><button class="emote-tab active" data-tab="all" onclick="switchEmoteTab(\'all\')">All</button><button class="emote-tab" data-tab="recent" onclick="switchEmoteTab(\'recent\')">🕐 Recent</button><button class="emote-tab" data-tab="fav" onclick="switchEmoteTab(\'fav\')">★ Favs</button><button class="emote-tab" data-tab="gif" onclick="switchEmoteTab(\'gif\')">🔍 GIFs</button></div>' +
        '<div id="emote-popup-search"><input type="text" placeholder="Search emotes..." oninput="filterEmotePopup(this.value)" onkeydown="handleEmoteSearchKey(event)"><div id="gif-search-history"></div></div>' +
        '<div id="emote-popup-body"></div>' +
        '<div id="emote-popup-pagination"><button onclick="emotePrevPage()">◀ Prev</button><span id="emote-popup-pageinfo">Page 1</span><button onclick="emoteNextPage()">Next ▶</button></div>';
    o.appendChild(p);
    document.body.appendChild(o);
    makeDraggable(p, document.getElementById('emote-popup-header'));
}

function openEmotePopup() {
    createEmotePopup();
    var overlay = document.getElementById('emote-popup-overlay');
    overlay.classList.add('visible');
    var input = document.querySelector('#emote-popup-search input');
    if (input) input.value = '';
    currentEmotePage = 0;
    switchEmoteTab('all');
}

function closeEmotePopup() {
    var o = document.getElementById('emote-popup-overlay');
    if (o) o.classList.remove('visible');
}

function toggleEmotePopup() {
    var o = document.getElementById('emote-popup-overlay');
    if (o && o.classList.contains('visible')) closeEmotePopup();
    else openEmotePopup();
}

function switchEmoteTab(tab) {
    document.querySelectorAll('.emote-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelector('.emote-tab[data-tab="' + tab + '"]').classList.add('active');
    currentEmotePage = 0;
    currentGifPage = 0;
    var searchInput = document.querySelector('#emote-popup-search input');
    var historyEl = document.getElementById('gif-search-history');
    if (historyEl) historyEl.style.display = 'none';

    if (tab === 'gif') {
        searchInput.placeholder = 'Search Tenor GIFs... (press Enter)';
        searchInput.value = lastGifSearch;
        showGifSearchHistory();
        renderGifTab();
    } else if (tab === 'recent') {
        searchInput.placeholder = 'Search recent...';
        renderRecentlyUsed();
    } else if (tab === 'fav') {
        searchInput.placeholder = 'Search favorites...';
        renderFavorites();
    } else {
        searchInput.placeholder = 'Search emotes...';
        renderEmotes(tab);
    }
}

function showGifSearchHistory() {
    var historyEl = document.getElementById('gif-search-history');
    if (!historyEl || gifSearchHistory.length === 0) return;
    historyEl.innerHTML = '';
    gifSearchHistory.slice(0, 5).forEach(function(q) {
        var span = document.createElement('span');
        span.className = 'gif-history-item';
        span.textContent = q;
        span.onclick = function() { searchTenorGifs(q); };
        historyEl.appendChild(span);
    });
    historyEl.style.display = 'flex';
}

function renderRecentlyUsed() {
    var body = document.getElementById('emote-popup-body');
    if (!body) return;
    body.innerHTML = '';

    if (recentlyUsed.length === 0) {
        body.innerHTML = '<div style="width:100%;text-align:center;color:#888;padding:40px">No recently used emotes/GIFs yet!</div>';
        return;
    }

    recentlyUsed.forEach(function(item) {
        var d = document.createElement('div');
        d.className = 'emote-item' + (item.type === 'gif' ? ' gif-item' : '');
        var img = document.createElement('img');
        var favBtn = document.createElement('button');
        if (item.type === 'gif') {
            d.style.width = '100px';
            d.style.height = '100px';
            var isFav = gifFavorites.some(function(g) { return g.url === item.url; });
            img.src = item.preview;
            img.title = 'Click to insert';
            img.onclick = function() { insertGif(item.url); };
            favBtn.className = 'emote-fav' + (isFav ? ' faved' : '');
            favBtn.textContent = '\u2605';
            favBtn.onclick = function(ev) { toggleGifFav(item.url, item.preview, ev); };
        } else {
            var isFav = emoteFavorites.indexOf(item.name) !== -1;
            img.src = item.image;
            img.title = item.name;
            img.onclick = function() { insertEmote(item.name); };
            favBtn.className = 'emote-fav' + (isFav ? ' faved' : '');
            favBtn.textContent = '\u2605';
            favBtn.onclick = function(ev) { toggleEmoteFav(item.name, ev); };
        }
        d.appendChild(img);
        d.appendChild(favBtn);
        body.appendChild(d);
    });

    document.getElementById('emote-popup-pageinfo').textContent = recentlyUsed.length + ' recent';
    var btns = document.querySelectorAll('#emote-popup-pagination button');
    btns[0].disabled = true;
    btns[1].disabled = true;
}

function renderFavorites() {
    var body = document.getElementById('emote-popup-body');
    if (!body) return;
    body.innerHTML = '';

    var emotes = (CHANNEL && CHANNEL.emotes) ? CHANNEL.emotes.slice() : [];
    var favEmotes = emotes.filter(function(e) { return emoteFavorites.indexOf(e.name) !== -1; });

    if (favEmotes.length === 0 && gifFavorites.length === 0) {
        body.innerHTML = '<div style="width:100%;text-align:center;color:#888;padding:40px">No favorites yet! Click ★ on emotes or GIFs.</div>';
        return;
    }

    // Render emote favorites
    favEmotes.forEach(function(e) {
        var d = document.createElement('div');
        d.className = 'emote-item';
        var img = document.createElement('img');
        img.src = e.image;
        img.title = e.name;
        img.onclick = function() { insertEmote(e.name); };
        var favBtn = document.createElement('button');
        favBtn.className = 'emote-fav faved';
        favBtn.textContent = '\u2605';
        favBtn.onclick = function(ev) { toggleEmoteFav(e.name, ev); };
        d.appendChild(img);
        d.appendChild(favBtn);
        body.appendChild(d);
    });

    // Render GIF favorites
    gifFavorites.forEach(function(gif) {
        var d = document.createElement('div');
        d.className = 'emote-item gif-item';
        d.style.width = '100px';
        d.style.height = '100px';
        var img = document.createElement('img');
        img.src = gif.preview;
        img.title = 'Click to insert';
        img.onclick = function() { insertGif(gif.url); };
        var favBtn = document.createElement('button');
        favBtn.className = 'emote-fav faved';
        favBtn.textContent = '\u2605';
        favBtn.onclick = function(ev) { toggleGifFav(gif.url, gif.preview, ev); };
        d.appendChild(img);
        d.appendChild(favBtn);
        body.appendChild(d);
    });

    document.getElementById('emote-popup-pageinfo').textContent = (favEmotes.length + gifFavorites.length) + ' favorites';
    var btns = document.querySelectorAll('#emote-popup-pagination button');
    btns[0].disabled = true;
    btns[1].disabled = true;
}

function handleEmoteSearchKey(e) {
    var tab = document.querySelector('.emote-tab.active').dataset.tab;
    if (tab === 'gif' && (e.keyCode === 13 || e.key === 'Enter')) {
        var query = e.target.value.trim();
        if (query) {
            searchTenorGifs(query);
        }
    }
}

function filterEmotePopup(s) {
    var tab = document.querySelector('.emote-tab.active').dataset.tab;
    if (tab === 'gif') return; // GIF search uses Enter key
    currentEmotePage = 0;
    renderEmotes(tab, s);
}

function renderEmotes(tab, search) {
    var body = document.getElementById('emote-popup-body');
    if (!body) return;
    var emotes = (CHANNEL && CHANNEL.emotes) ? CHANNEL.emotes.slice() : [];
    if (tab === 'fav') emotes = emotes.filter(function(e) { return emoteFavorites.indexOf(e.name) !== -1; });
    if (search && search.trim()) {
        var s = search.toLowerCase();
        emotes = emotes.filter(function(e) { return e.name.toLowerCase().indexOf(s) !== -1; });
    }
    var total = Math.ceil(emotes.length / emotesPerPage) || 1;
    var start = currentEmotePage * emotesPerPage;
    var page = emotes.slice(start, start + emotesPerPage);
    body.innerHTML = '';
    if (page.length === 0) {
        body.innerHTML = '<div style="width:100%;text-align:center;color:#888;padding:40px">' + (tab === 'fav' ? 'No favorites yet! Click ★ on emotes.' : 'No emotes found.') + '</div>';
    } else {
        page.forEach(function(e) {
            var fav = emoteFavorites.indexOf(e.name) !== -1;
            var d = document.createElement('div');
            d.className = 'emote-item';
            var img = document.createElement('img');
            img.src = e.image;
            img.title = e.name;
            img.onclick = function() { insertEmote(e.name); };
            var favBtn = document.createElement('button');
            favBtn.className = 'emote-fav' + (fav ? ' faved' : '');
            favBtn.textContent = '\u2605';
            favBtn.onclick = function(ev) { toggleEmoteFav(e.name, ev); };
            d.appendChild(img);
            d.appendChild(favBtn);
            body.appendChild(d);
        });
    }
    document.getElementById('emote-popup-pageinfo').textContent = 'Page ' + (currentEmotePage + 1) + ' of ' + total;
    var btns = document.querySelectorAll('#emote-popup-pagination button');
    btns[0].disabled = currentEmotePage === 0;
    btns[1].disabled = currentEmotePage >= total - 1;
}

function emotePrevPage() { 
    var tab = document.querySelector('.emote-tab.active').dataset.tab;
    if (tab === 'gif') {
        if (currentGifPage > 0) { currentGifPage--; renderGifResults(); }
    } else {
        if (currentEmotePage > 0) { currentEmotePage--; renderEmotes(tab, document.querySelector('#emote-popup-search input').value); }
    }
}
function emoteNextPage() { 
    var tab = document.querySelector('.emote-tab.active').dataset.tab;
    if (tab === 'gif') {
        currentGifPage++; 
        // If we need more results, fetch next page
        if ((currentGifPage + 1) * gifsPerPage >= gifSearchResults.length && gifNextPos) {
            searchTenorGifs(lastGifSearch, true);
        } else {
            renderGifResults();
        }
    } else {
        currentEmotePage++; renderEmotes(tab, document.querySelector('#emote-popup-search input').value); 
    }
}
function insertEmote(name) {
    var c = document.getElementById('chatline');
    if (c) { c.value += name + ' '; c.focus(); }
    // Add to recently used
    var emote = (CHANNEL && CHANNEL.emotes) ? CHANNEL.emotes.find(function(e) { return e.name === name; }) : null;
    if (emote) {
        addToRecentlyUsed({ type: 'emote', name: emote.name, image: emote.image });
    }
}

function insertGif(url) {
    var c = document.getElementById('chatline');
    if (c) {
        c.value += url + ' ';
        c.focus();
    }
    // Add to recently used (find preview from current results)
    var gif = gifSearchResults.find(function(g) {
        return (g.media_formats.gif && g.media_formats.gif.url === url) ||
               (g.media_formats.tinygif && g.media_formats.tinygif.url === url);
    });
    if (gif) {
        var preview = gif.media_formats.tinygif ? gif.media_formats.tinygif.url : url;
        addToRecentlyUsed({ type: 'gif', url: url, preview: preview });
    }
    closeEmotePopup();
}

function addToRecentlyUsed(item) {
    // Remove if already exists
    recentlyUsed = recentlyUsed.filter(function(r) {
        if (item.type === 'gif') return r.url !== item.url;
        return r.name !== item.name;
    });
    // Add to front
    recentlyUsed.unshift(item);
    // Keep only 20
    recentlyUsed = recentlyUsed.slice(0, 20);
    localStorage.setItem('recentlyUsed', JSON.stringify(recentlyUsed));
}

function toggleEmoteFav(name, e) {
    e.stopPropagation();
    var i = emoteFavorites.indexOf(name);
    if (i !== -1) emoteFavorites.splice(i, 1); else emoteFavorites.unshift(name);
    localStorage.setItem('emoteFavorites', JSON.stringify(emoteFavorites));
    var tab = document.querySelector('.emote-tab.active').dataset.tab;
    if (tab === 'fav') renderFavorites();
    else if (tab === 'recent') renderRecentlyUsed();
    else renderEmotes(tab, document.querySelector('#emote-popup-search input').value);
}

function toggleGifFav(url, preview, e) {
    e.stopPropagation();
    var idx = gifFavorites.findIndex(function(g) { return g.url === url; });
    if (idx !== -1) {
        gifFavorites.splice(idx, 1);
    } else {
        gifFavorites.unshift({ url: url, preview: preview });
    }
    localStorage.setItem('gifFavorites', JSON.stringify(gifFavorites));
    var tab = document.querySelector('.emote-tab.active').dataset.tab;
    if (tab === 'fav') renderFavorites();
    else if (tab === 'recent') renderRecentlyUsed();
    else if (tab === 'gif') renderGifResults();
}

function setEmoteSize(size) {
    emoteSize = size;
    localStorage.setItem('emoteSize', size);
    document.querySelectorAll('.size-btn').forEach(function(b) { b.classList.remove('active'); });
    document.querySelector('.size-btn:nth-child(' + (size === 'small' ? 1 : size === 'medium' ? 2 : 3) + ')').classList.add('active');
    applyEmoteSize();
}

function applyEmoteSize() {
    var sizes = { small: 40, medium: 60, large: 80 };
    var sz = sizes[emoteSize] || 60;
    document.documentElement.style.setProperty('--emote-size', sz + 'px');
}

// GIF SEARCH FUNCTIONS
function renderGifTab() {
    var body = document.getElementById('emote-popup-body');
    if (!body) return;
    if (gifSearchResults.length === 0) {
        body.innerHTML = '<div style="width:100%;text-align:center;color:#888;padding:40px">' +
            '<div style="font-size:48px;margin-bottom:15px">🔍</div>' +
            '<div>Search for GIFs using the search bar above</div>' +
            '<div style="font-size:12px;margin-top:8px;color:#666">Powered by Tenor</div></div>';
        document.getElementById('emote-popup-pageinfo').textContent = 'Search GIFs';
        var btns = document.querySelectorAll('#emote-popup-pagination button');
        btns[0].disabled = true;
        btns[1].disabled = true;
    } else {
        renderGifResults();
    }
}

function showGifPreview(url) {
    var preview = document.getElementById('gif-preview-popup');
    if (!preview) {
        preview = document.createElement('div');
        preview.id = 'gif-preview-popup';
        document.body.appendChild(preview);
    }
    preview.innerHTML = '<img src="' + url + '">';
    preview.style.display = 'block';
}

function hideGifPreview() {
    var preview = document.getElementById('gif-preview-popup');
    if (preview) preview.style.display = 'none';
}

function searchTenorGifs(query, loadMore) {
    if (!query.trim()) return;
    lastGifSearch = query;
    // Save to search history
    if (!loadMore) {
        gifSearchHistory = gifSearchHistory.filter(function(q) { return q !== query; });
        gifSearchHistory.unshift(query);
        gifSearchHistory = gifSearchHistory.slice(0, 10);
        localStorage.setItem('gifSearchHistory', JSON.stringify(gifSearchHistory));
        var historyEl = document.getElementById('gif-search-history');
        if (historyEl) historyEl.style.display = 'none';
    }
    var searchInput = document.querySelector('#emote-popup-search input');
    if (searchInput) searchInput.value = query;
    var body = document.getElementById('emote-popup-body');
    if (!loadMore) {
        gifSearchResults = [];
        currentGifPage = 0;
        gifNextPos = '';
        body.innerHTML = '<div style="width:100%;text-align:center;color:#888;padding:40px"><div style="font-size:32px">⏳</div><div>Searching...</div></div>';
    }
    
    var url = 'https://tenor.googleapis.com/v2/search?q=' + encodeURIComponent(query) + 
              '&key=' + TENOR_API_KEY + 
              '&limit=30&media_filter=gif,tinygif' +
              (gifNextPos ? '&pos=' + gifNextPos : '');
    
    fetch(url)
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.results) {
                gifSearchResults = gifSearchResults.concat(data.results);
                gifNextPos = data.next || '';
                renderGifResults();
            } else {
                body.innerHTML = '<div style="width:100%;text-align:center;color:#888;padding:40px">No GIFs found</div>';
            }
        })
        .catch(function(err) {
            console.error('Tenor API error:', err);
            body.innerHTML = '<div style="width:100%;text-align:center;color:#f88;padding:40px">Error searching GIFs. Try again.</div>';
        });
}

function renderGifResults() {
    var body = document.getElementById('emote-popup-body');
    if (!body) return;
    
    var total = Math.ceil(gifSearchResults.length / gifsPerPage) || 1;
    var start = currentGifPage * gifsPerPage;
    var page = gifSearchResults.slice(start, start + gifsPerPage);
    
    body.innerHTML = '';
    if (page.length === 0) {
        body.innerHTML = '<div style="width:100%;text-align:center;color:#888;padding:40px">No GIFs found</div>';
    } else {
        page.forEach(function(gif) {
            var d = document.createElement('div');
            d.className = 'emote-item gif-item';
            d.style.width = '100px';
            d.style.height = '100px';
            // Get the smallest GIF format for preview
            var previewUrl = gif.media_formats.tinygif ? gif.media_formats.tinygif.url :
                            (gif.media_formats.gif ? gif.media_formats.gif.url : '');
            var fullUrl = gif.media_formats.gif ? gif.media_formats.gif.url : previewUrl;
            var isFav = gifFavorites.some(function(g) { return g.url === fullUrl; });
            var img = document.createElement('img');
            img.src = previewUrl;
            img.title = 'Click to insert';
            img.style.cssText = 'max-width:90px;max-height:90px;object-fit:contain;';
            img.onclick = function() { insertGif(fullUrl); };
            var favBtn = document.createElement('button');
            favBtn.className = 'emote-fav' + (isFav ? ' faved' : '');
            favBtn.textContent = '\u2605';
            favBtn.onclick = function(ev) { toggleGifFav(fullUrl, previewUrl, ev); };
            d.appendChild(img);
            d.appendChild(favBtn);
            // GIF preview on hover
            d.onmouseenter = function() { showGifPreview(previewUrl); };
            d.onmouseleave = function() { hideGifPreview(); };
            body.appendChild(d);
        });
    }
    
    // Update pagination
    var hasMore = gifNextPos || (currentGifPage < total - 1);
    document.getElementById('emote-popup-pageinfo').textContent = 'Page ' + (currentGifPage + 1) + (gifNextPos ? '+' : ' of ' + total);
    var btns = document.querySelectorAll('#emote-popup-pagination button');
    btns[0].disabled = currentGifPage === 0;
    btns[1].disabled = !hasMore && currentGifPage >= total - 1;
}

function makeDraggable(el, handle) {
    handle.onmousedown = function(e) {
        if (e.target.tagName === 'BUTTON') return;
        e.preventDefault();
        
        // Get current position
        var rect = el.getBoundingClientRect();
        
        // Calculate mouse offset within element
        var offsetX = e.clientX - rect.left;
        var offsetY = e.clientY - rect.top;
        
        // Get current styles to preserve them
        var computedStyle = window.getComputedStyle(el);
        var width = computedStyle.width;
        var maxWidth = computedStyle.maxWidth;
        var height = computedStyle.height;
        var maxHeight = computedStyle.maxHeight;
        
        // Build base style string
        var baseStyle = 'position:fixed !important; margin:0 !important; transform:none !important;' +
            'width:' + width + '; max-width:' + maxWidth + '; height:' + height + '; max-height:' + maxHeight + ';' +
            'display:flex; flex-direction:column; background:#1e1e24; border:2px solid #555; border-radius:12px; box-shadow:0 20px 60px rgba(0,0,0,0.9);';
        
        // Set initial position
        el.style.cssText = baseStyle + 'top:' + rect.top + 'px !important; left:' + rect.left + 'px !important;';
        
        document.onmousemove = function(e) {
            var newLeft = e.clientX - offsetX;
            var newTop = e.clientY - offsetY;
            el.style.cssText = baseStyle + 'top:' + newTop + 'px !important; left:' + newLeft + 'px !important;';
        };
        
        document.onmouseup = function() {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
}

// FAVORITES DROPDOWN
function showFavoritesDropdown() {
    closeFavoritesDropdown();
    var dd = document.createElement('div');
    dd.id = 'favorites-dropdown';
    var btn = document.getElementById('favorites-btn');
    if (btn) {
        var r = btn.getBoundingClientRect();
        dd.style.bottom = (window.innerHeight - r.top + 8) + 'px';
        dd.style.left = Math.max(10, r.left) + 'px';
    }
    if (emoteFavorites.length === 0) {
        dd.innerHTML = '<div style="color:#888;padding:20px;text-align:center">No favorites yet!<br>Open emotes and click \u2605</div>';
    } else {
        var grid = document.createElement('div');
        grid.className = 'fav-grid';
        var emotes = (CHANNEL && CHANNEL.emotes) ? CHANNEL.emotes : [];
        emoteFavorites.forEach(function(name) {
            var em = emotes.find(function(e) { return e.name === name; });
            if (em) {
                var img = document.createElement('img');
                img.src = em.image;
                img.title = em.name;
                img.onclick = function() { insertEmote(em.name); closeFavoritesDropdown(); };
                grid.appendChild(img);
            }
        });
        dd.appendChild(grid);
    }
    document.body.appendChild(dd);
    // Small delay to allow DOM to update before adding visible class
    setTimeout(function() { dd.classList.add('visible'); }, 10);
}

function closeFavoritesDropdown() {
    var dd = document.getElementById('favorites-dropdown');
    if (dd) dd.remove();
}

function toggleFavoritesDropdown() {
    var dd = document.getElementById('favorites-dropdown');
    if (dd && dd.classList.contains('visible')) closeFavoritesDropdown();
    else showFavoritesDropdown();
}

document.addEventListener('click', function(e) {
    var dd = document.getElementById('favorites-dropdown');
    var btn = document.getElementById('favorites-btn');
    if (dd && btn && !dd.contains(e.target) && e.target !== btn && !btn.contains(e.target)) closeFavoritesDropdown();
});

// TEXT STYLE POPUP (with tabs for Message and Username)
var currentStyleTab = 'message';

function createTextStylePopup() {
    if (document.getElementById('textstyle-popup-overlay')) return;
    var o = document.createElement('div');
    o.id = 'textstyle-popup-overlay';
    o.onclick = function(e) { if (e.target === o) closeTextStylePopup(); };
    
    var p = document.createElement('div');
    p.id = 'textstyle-popup';
    p.innerHTML = '<div class="popup-header" id="textstyle-popup-header"><span>✨ Style Settings</span><button class="popup-close" onclick="closeTextStylePopup()">×</button></div>' +
        '<div id="textstyle-tabs"><button class="style-tab active" data-tab="message" onclick="switchStyleTab(\'message\')">💬 Message</button><button class="style-tab" data-tab="username" onclick="switchStyleTab(\'username\')">👤 Username</button><button class="style-tab" data-tab="reply" onclick="switchStyleTab(\'reply\')">↩ Reply</button></div>' +
        '<div id="textstyle-tab-content"></div>';
    o.appendChild(p);
    document.body.appendChild(o);
    makeDraggable(p, document.getElementById('textstyle-popup-header'));
    renderStyleTabContent('message');
}

function switchStyleTab(tab) {
    currentStyleTab = tab;
    document.querySelectorAll('.style-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelector('.style-tab[data-tab="' + tab + '"]').classList.add('active');
    renderStyleTabContent(tab);
}

function renderStyleTabContent(tab) {
    var container = document.getElementById('textstyle-tab-content');
    if (!container) return;
    
    // Shared options
    var colors = ['white','yellow','orange','pink','red','lime','green','aqua','blue','violet','brown','silver'];
    var gradients = ['rainbow','fire','ocean','sunset','neon','forest','gold','ice'];
    var gradientLabels = {rainbow:'Rainbow',fire:'Fire',ocean:'Ocean',sunset:'Sunset',neon:'Neon',forest:'Forest',gold:'Gold',ice:'Ice'};
    var glows = ['glow-white','glow-red','glow-blue','glow-green','glow-gold','glow-pink','glow-rainbow'];
    var glowLabels = {'glow-white':'✦ White','glow-red':'✦ Red','glow-blue':'✦ Blue','glow-green':'✦ Green','glow-gold':'✦ Gold','glow-pink':'✦ Pink','glow-rainbow':'✦ Rainbow'};
    var animations = ['shake','pulse','bounce','wave','flicker','spin'];
    var animLabels = {shake:'〰️ Shake',pulse:'💗 Pulse',bounce:'⬆️ Bounce',wave:'🌊 Wave',flicker:'⚡ Flicker',spin:'🔄 Spin'};
    var fonts = ['comic','impact','papyrus','copperplate','brush','lucida','courier','times','georgia','trebuchet','verdana','gothic','garamond','palatino','bookman','mono','cursive','fantasy','system','serif'];
    var fontLabels = {comic:'Comic',impact:'Impact',papyrus:'Papyrus',copperplate:'Copper',brush:'Brush',lucida:'Lucida',courier:'Courier',times:'Times',georgia:'Georgia',trebuchet:'Trebuchet',verdana:'Verdana',gothic:'Gothic',garamond:'Garamond',palatino:'Palatino',bookman:'Bookman',mono:'Mono',cursive:'Cursive',fantasy:'Fantasy',system:'System',serif:'Serif'};
    var fontStyles = {comic:'font-family:"Comic Sans MS",cursive',impact:'font-family:Impact,sans-serif',papyrus:'font-family:Papyrus,fantasy',copperplate:'font-family:Copperplate,fantasy',brush:'font-family:"Brush Script MT",cursive',lucida:'font-family:"Lucida Handwriting",cursive',courier:'font-family:"Courier New",monospace',times:'font-family:"Times New Roman",serif',georgia:'font-family:Georgia,serif',trebuchet:'font-family:"Trebuchet MS",sans-serif',verdana:'font-family:Verdana,sans-serif',gothic:'font-family:"Century Gothic",sans-serif',garamond:'font-family:Garamond,serif',palatino:'font-family:"Palatino Linotype",serif',bookman:'font-family:"Bookman Old Style",serif',mono:'font-family:monospace',cursive:'font-family:cursive',fantasy:'font-family:fantasy',system:'font-family:system-ui',serif:'font-family:serif'};
    
    if (tab === 'message') {
        // MESSAGE STYLE TAB
        var settings = textStyleSettings;
        var prefix = '';
        
        var cbtns = colors.map(function(c) {
            var act = settings.color === c ? ' active' : '';
            var st = 'color:' + (c === 'blue' ? '#55f' : c) + ';' + (c === 'white' ? 'background:#333;' : '');
            return '<button class="textstyle-btn color-btn' + act + '" data-color="' + c + '" style="' + st + '" onclick="selectStyleColor(\'' + c + '\')">' + c + '</button>';
        }).join('');
        
        var gbtns = gradients.map(function(g) {
            var act = settings.gradient === g ? ' active' : '';
            return '<button class="textstyle-btn gradient-btn' + act + '" data-gradient="' + g + '" onclick="selectStyleGradient(\'' + g + '\')">' + gradientLabels[g] + '</button>';
        }).join('');
        
        var glowbtns = glows.map(function(g) {
            var act = settings.glow === g ? ' active' : '';
            return '<button class="textstyle-btn glow-btn' + act + '" data-glow="' + g + '" onclick="selectStyleGlow(\'' + g + '\')">' + glowLabels[g] + '</button>';
        }).join('');
        
        var animbtns = animations.map(function(a) {
            var act = settings.animation === a ? ' active' : '';
            return '<button class="textstyle-btn anim-btn' + act + '" data-anim="' + a + '" onclick="selectStyleAnimation(\'' + a + '\')">' + animLabels[a] + '</button>';
        }).join('');
        
        var fontbtns = fonts.map(function(f) {
            var act = settings.font === f ? ' active' : '';
            return '<button class="textstyle-btn font-btn' + act + '" data-font="' + f + '" style="' + fontStyles[f] + '" onclick="selectStyleFont(\'' + f + '\')">' + fontLabels[f] + '</button>';
        }).join('');
        
        container.innerHTML = '<div class="textstyle-info"><p style="margin:0 0 8px">Style your messages. <strong>Auto-applies</strong> when you send.</p><p style="margin:0;color:#fc0">⚠️ Admin must set up <a href="#" onclick="showFilterPopup();return false;">Chat Filters</a> first.</p></div>' +
            '<div class="textstyle-popup-scroll">' +
            '<div class="textstyle-section"><h4>Solid Colors</h4><div class="textstyle-grid">' + cbtns + '</div>' +
            '<div class="custom-color-row"><label>Custom: </label><input type="color" id="custom-color-picker" value="#' + (settings.customColor || 'ffffff') + '" onchange="selectCustomColor(this.value)"><button class="textstyle-btn' + (settings.customColor ? ' active' : '') + '" id="custom-color-btn" onclick="applyCustomColor()" style="' + (settings.customColor ? 'background:#' + settings.customColor + ';' : '') + 'color:#fff;text-shadow:0 0 2px #000">Use Custom</button>' + (settings.customColor ? '<button class="textstyle-btn" onclick="clearCustomColor()" style="padding:8px 10px;background:#633">✕</button>' : '') + '</div></div>' +
            '<div class="textstyle-section"><h4>🌈 Gradients</h4><div class="textstyle-grid">' + gbtns + '</div></div>' +
            '<div class="textstyle-section"><h4>✨ Glow Effects</h4><div class="textstyle-grid">' + glowbtns + '</div>' +
            '<div class="custom-color-row"><label>Custom Glow: </label><input type="color" id="custom-glow-picker" value="#' + (settings.customGlow || 'ffffff') + '" onchange="selectCustomGlow(this.value)"><button class="textstyle-btn' + (settings.customGlow ? ' active' : '') + '" id="custom-glow-btn" onclick="applyCustomGlow()" style="text-shadow:0 0 8px #' + (settings.customGlow || '888') + '">Use Custom</button>' + (settings.customGlow ? '<button class="textstyle-btn" onclick="clearCustomGlow()" style="padding:8px 10px;background:#633">✕</button>' : '') + '</div></div>' +
            '<div class="textstyle-section"><h4>🎬 Animations</h4><div class="textstyle-grid">' + animbtns + '</div></div>' +
            '<div class="textstyle-section"><h4>🔤 Fonts</h4><div class="textstyle-grid">' + fontbtns + '</div></div>' +
            '<div class="textstyle-section"><h4>Text Effects</h4><div class="textstyle-grid">' +
            '<button class="textstyle-btn effect-btn' + (settings.bold ? ' active' : '') + '" data-effect="bold" style="font-weight:bold" onclick="toggleStyleEffect(\'bold\')">Bold</button>' +
            '<button class="textstyle-btn effect-btn' + (settings.italic ? ' active' : '') + '" data-effect="italic" style="font-style:italic" onclick="toggleStyleEffect(\'italic\')">Italic</button>' +
            '<button class="textstyle-btn effect-btn' + (settings.underline ? ' active' : '') + '" data-effect="underline" style="text-decoration:underline" onclick="toggleStyleEffect(\'underline\')">Underline</button>' +
            '<button class="textstyle-btn effect-btn' + (settings.strikethrough ? ' active' : '') + '" data-effect="strikethrough" style="text-decoration:line-through" onclick="toggleStyleEffect(\'strikethrough\')">Strike</button>' +
            '</div></div>' +
            '<div class="textstyle-section"><h4>Preview</h4><div id="textstyle-preview">Your message will look like this</div></div>' +
            '</div>' +
            '<div class="textstyle-section" style="border-top:1px solid #333;"><button id="textstyle-reset" onclick="resetTextStyle()">↺ Reset to Default</button></div>';
        
        updateStylePreview();

    } else if (tab === 'username') {
        // USERNAME STYLE TAB
        var settings = usernameStyleSettings;
        
        var cbtns = colors.map(function(c) {
            var act = settings.color === c ? ' active' : '';
            var st = 'color:' + (c === 'blue' ? '#55f' : c) + ';' + (c === 'white' ? 'background:#333;' : '');
            return '<button class="textstyle-btn uname-color-btn' + act + '" data-color="' + c + '" style="' + st + '" onclick="selectUsernameColor(\'' + c + '\')">' + c + '</button>';
        }).join('');
        
        var gbtns = gradients.map(function(g) {
            var act = settings.gradient === g ? ' active' : '';
            return '<button class="textstyle-btn uname-gradient-btn' + act + '" data-gradient="' + g + '" onclick="selectUsernameGradient(\'' + g + '\')">' + gradientLabels[g] + '</button>';
        }).join('');
        
        var glowbtns = glows.map(function(g) {
            var act = settings.glow === g ? ' active' : '';
            return '<button class="textstyle-btn uname-glow-btn' + act + '" data-glow="' + g + '" onclick="selectUsernameGlow(\'' + g + '\')">' + glowLabels[g] + '</button>';
        }).join('');
        
        var animbtns = animations.map(function(a) {
            var act = settings.animation === a ? ' active' : '';
            return '<button class="textstyle-btn uname-anim-btn' + act + '" data-anim="' + a + '" onclick="selectUsernameAnimation(\'' + a + '\')">' + animLabels[a] + '</button>';
        }).join('');
        
        var fontbtns = fonts.map(function(f) {
            var act = settings.font === f ? ' active' : '';
            return '<button class="textstyle-btn uname-font-btn' + act + '" data-font="' + f + '" style="' + fontStyles[f] + '" onclick="selectUsernameFont(\'' + f + '\')">' + fontLabels[f] + '</button>';
        }).join('');
        
        container.innerHTML = '<div class="textstyle-info"><p style="margin:0">Style your username! Others with this theme will see it.</p></div>' +
            '<div class="textstyle-popup-scroll">' +
            '<div class="textstyle-section"><h4>Enable Username Styling</h4><button id="username-style-toggle" class="textstyle-btn' + (settings.enabled ? ' active' : '') + '" onclick="toggleUsernameStyleEnabled()" style="width:100%">' + (settings.enabled ? '✓ Enabled' : '✗ Disabled') + '</button></div>' +
            '<div class="textstyle-section"><h4>Solid Colors</h4><div class="textstyle-grid">' + cbtns + '</div>' +
            '<div class="custom-color-row"><label>Custom: </label><input type="color" id="uname-custom-color-picker" value="#' + (settings.customColor || 'ffffff') + '" onchange="selectUsernameCustomColor(this.value)"><button class="textstyle-btn' + (settings.customColor ? ' active' : '') + '" id="uname-custom-color-btn" onclick="applyUsernameCustomColor()" style="' + (settings.customColor ? 'background:#' + settings.customColor + ';' : '') + 'color:#fff;text-shadow:0 0 2px #000">Use Custom</button>' + (settings.customColor ? '<button class="textstyle-btn" onclick="clearUsernameCustomColor()" style="padding:8px 10px;background:#633">✕</button>' : '') + '</div></div>' +
            '<div class="textstyle-section"><h4>🌈 Gradients</h4><div class="textstyle-grid">' + gbtns + '</div></div>' +
            '<div class="textstyle-section"><h4>✨ Glow Effects</h4><div class="textstyle-grid">' + glowbtns + '</div>' +
            '<div class="custom-color-row"><label>Custom Glow: </label><input type="color" id="uname-custom-glow-picker" value="#' + (settings.customGlow || 'ffffff') + '" onchange="selectUsernameCustomGlow(this.value)"><button class="textstyle-btn' + (settings.customGlow ? ' active' : '') + '" id="uname-custom-glow-btn" onclick="applyUsernameCustomGlow()" style="text-shadow:0 0 8px #' + (settings.customGlow || '888') + '">Use Custom</button>' + (settings.customGlow ? '<button class="textstyle-btn" onclick="clearUsernameCustomGlow()" style="padding:8px 10px;background:#633">✕</button>' : '') + '</div></div>' +
            '<div class="textstyle-section"><h4>🎬 Animations</h4><div class="textstyle-grid">' + animbtns + '</div></div>' +
            '<div class="textstyle-section"><h4>🔤 Fonts</h4><div class="textstyle-grid">' + fontbtns + '</div></div>' +
            '<div class="textstyle-section"><h4>Effects</h4><div class="textstyle-grid"><button id="uname-bold-btn" class="textstyle-btn' + (settings.bold ? ' active' : '') + '" style="font-weight:bold" onclick="toggleUsernameBold()">Bold</button></div></div>' +
            '<div class="textstyle-section"><h4>Preview</h4><div id="username-preview" style="padding:16px;background:#111;border-radius:6px;text-align:center;min-height:50px;display:flex;align-items:center;justify-content:center;font-size:16px;">YourName</div></div>' +
            '</div>' +
            '<div class="textstyle-section" style="border-top:1px solid #333;"><button onclick="resetUsernameStyle()" style="width:100%;padding:12px;background:#422;border:1px solid #633;border-radius:6px;color:#f88;cursor:pointer;">↺ Reset to Default</button></div>';
        
        updateUsernamePreview();

    } else if (tab === 'reply') {
        // REPLY STYLE TAB
        var settings = replyStyleSettings;

        // Preset colors (same 12 as cycling)
        var replyColors = [
            {name: 'Gold', hex: '#8F6409'},
            {name: 'Teal', hex: '#0D8F8F'},
            {name: 'Purple', hex: '#7B4B9E'},
            {name: 'Coral', hex: '#A34D4D'},
            {name: 'Green', hex: '#4A8F4A'},
            {name: 'Blue', hex: '#4A6FA5'},
            {name: 'Pink', hex: '#9E4B7B'},
            {name: 'Orange', hex: '#B37400'},
            {name: 'Cyan', hex: '#3D9EAA'},
            {name: 'Lime', hex: '#6B8F2E'},
            {name: 'Salmon', hex: '#B36666'},
            {name: 'Indigo', hex: '#5B5BAA'}
        ];

        var colorBtns = replyColors.map(function(c) {
            var act = settings.borderColor === c.hex ? ' active' : '';
            return '<button class="textstyle-btn reply-color-btn' + act + '" style="background:' + c.hex + ';color:#fff;text-shadow:0 0 2px #000" onclick="selectReplyBorderColor(\'' + c.hex + '\')">' + c.name + '</button>';
        }).join('');

        var previewBg = hexToRgba(settings.bgColor || settings.borderColor || '#8F6409', settings.bgOpacity || 15);

        // Animation options
        var animations = [
            {id: 'glow', name: 'Glow'},
            {id: 'pulse', name: 'Pulse'},
            {id: 'shimmer', name: 'Shimmer'},
            {id: 'breathe', name: 'Breathe'},
            {id: 'rainbow', name: 'Rainbow'},
            {id: 'neon', name: 'Neon'},
            {id: 'flash', name: 'Flash'},
            {id: 'slide', name: 'Slide'}
        ];
        var animBtns = animations.map(function(a) {
            var act = settings.animation === a.id ? ' active' : '';
            return '<button class="textstyle-btn' + act + '" onclick="selectReplyAnimation(\'' + a.id + '\')">' + a.name + '</button>';
        }).join('');

        // Border style options
        var borderStyles = [
            {id: 'thick', name: 'Thick'},
            {id: 'double', name: 'Double'},
            {id: 'dotted', name: 'Dotted'},
            {id: 'dashed', name: 'Dashed'}
        ];
        var borderBtns = borderStyles.map(function(b) {
            var act = settings.borderStyle === b.id ? ' active' : '';
            return '<button class="textstyle-btn' + act + '" onclick="selectReplyBorderStyle(\'' + b.id + '\')">' + b.name + '</button>';
        }).join('');

        // Border radius options
        var radiusOpts = [
            {id: 'rounded', name: 'Rounded'},
            {id: 'pill', name: 'Pill'}
        ];
        var radiusBtns = radiusOpts.map(function(r) {
            var act = settings.borderRadius === r.id ? ' active' : '';
            return '<button class="textstyle-btn' + act + '" onclick="selectReplyBorderRadius(\'' + r.id + '\')">' + r.name + '</button>';
        }).join('');

        // Build preview classes for live preview
        var previewClasses = 'reply-custom';
        if (settings.animation) previewClasses += ' reply-anim-' + settings.animation;
        if (settings.borderStyle) previewClasses += ' reply-border-' + settings.borderStyle;
        if (settings.borderRadius) previewClasses += ' reply-' + settings.borderRadius;

        // Preview styles
        var previewBorderWidth = settings.borderStyle === 'thick' ? '5px' : (settings.borderStyle === 'double' ? '6px' : (settings.borderStyle === 'dotted' ? '4px' : '3px'));
        var previewBorderStyle = settings.borderStyle === 'double' ? 'double' : (settings.borderStyle === 'dotted' ? 'dotted' : (settings.borderStyle === 'dashed' ? 'dashed' : 'solid'));
        var previewRadius = settings.borderRadius === 'pill' ? '20px' : (settings.borderRadius === 'rounded' ? '8px' : '4px');
        var previewGlow = '';
        if (settings.animation === 'glow' || settings.animation === 'neon' || settings.animation === 'breathe') {
            var glowCol = settings.glowColor || settings.borderColor || '#8F6409';
            var glowInt = settings.glowIntensity || 10;
            previewGlow = 'box-shadow: 0 0 ' + glowInt + 'px ' + glowCol + ';';
        }

        container.innerHTML = '<div class="textstyle-info"><p style="margin:0">Customize how YOUR replies appear. Overrides cycling colors.</p></div>' +
            '<div class="textstyle-popup-scroll">' +
            '<div class="textstyle-section"><h4>Enable Custom Style</h4><button id="reply-style-toggle" class="textstyle-btn' + (settings.enabled ? ' active' : '') + '" onclick="toggleReplyStyleEnabled()" style="width:100%">' + (settings.enabled ? '✓ ENABLED - Your replies use custom style' : '✗ DISABLED - Using color cycling') + '</button></div>' +
            '<div class="textstyle-section"><h4>Border Color</h4><div class="textstyle-grid">' + colorBtns + '</div>' +
            '<div class="custom-color-row"><label>Custom: </label><input type="color" id="reply-border-picker" value="' + (settings.borderColor || '#8F6409') + '" onchange="selectReplyBorderColor(this.value)"></div></div>' +
            '<div class="textstyle-section"><h4>Background</h4>' +
            '<div class="custom-color-row"><label>Color: </label><input type="color" id="reply-bg-picker" value="' + (settings.bgColor || '#8F6409') + '" onchange="selectReplyBgColor(this.value)"></div>' +
            '<div class="custom-color-row" style="margin-top:8px"><label>Opacity: </label><input type="range" id="reply-bg-opacity" min="5" max="50" value="' + (settings.bgOpacity || 15) + '" oninput="updateReplyBgOpacity(this.value)" style="flex:1"><span id="reply-opacity-val" style="margin-left:8px;min-width:35px">' + (settings.bgOpacity || 15) + '%</span></div></div>' +
            '<div class="textstyle-section"><h4>Animation Effect</h4><div class="textstyle-grid">' + animBtns + '<button class="textstyle-btn' + (!settings.animation ? ' active' : '') + '" onclick="selectReplyAnimation(null)">None</button></div></div>' +
            '<div class="textstyle-section"><h4>Border Style</h4><div class="textstyle-grid">' + borderBtns + '<button class="textstyle-btn' + (!settings.borderStyle ? ' active' : '') + '" onclick="selectReplyBorderStyle(null)">Normal</button></div></div>' +
            '<div class="textstyle-section"><h4>Border Shape</h4><div class="textstyle-grid">' + radiusBtns + '<button class="textstyle-btn' + (!settings.borderRadius ? ' active' : '') + '" onclick="selectReplyBorderRadius(null)">Square</button></div></div>' +
            '<div class="textstyle-section"><h4>Glow Settings</h4>' +
            '<div class="custom-color-row"><label>Glow Color: </label><input type="color" id="reply-glow-picker" value="' + (settings.glowColor || settings.borderColor || '#8F6409') + '" onchange="selectReplyGlowColor(this.value)"></div>' +
            '<div class="custom-color-row" style="margin-top:8px"><label>Intensity: </label><input type="range" id="reply-glow-intensity" min="5" max="30" value="' + (settings.glowIntensity || 10) + '" oninput="updateReplyGlowIntensity(this.value)" style="flex:1"><span id="reply-glow-val" style="margin-left:8px;min-width:35px">' + (settings.glowIntensity || 10) + 'px</span></div></div>' +
            '<div class="textstyle-section"><h4>Live Preview</h4><div style="padding:12px;background:#111;border-radius:6px;"><div id="reply-preview-box" class="' + previewClasses + '" style="border-left:' + previewBorderWidth + ' ' + previewBorderStyle + ' ' + (settings.borderColor || '#8F6409') + ';background:' + previewBg + ';padding:8px 12px;border-radius:' + previewRadius + ';' + previewGlow + '"><span style="color:#888">▶1:abc @user:</span> <span style="color:#ccc">Your custom reply style</span></div></div></div>' +
            '</div>' +
            '<div class="textstyle-section" style="border-top:1px solid #333;"><button onclick="resetReplyStyle()" style="width:100%;padding:12px;background:#422;border:1px solid #633;border-radius:6px;color:#f88;cursor:pointer;">↺ Reset All Settings</button></div>';
    }
}

// Reply style functions
function toggleReplyStyleEnabled() {
    replyStyleSettings.enabled = !replyStyleSettings.enabled;
    saveReplyStyleSettings();
    renderStyleTabContent('reply');
    applyCustomReplyCSS();
}

function selectReplyBorderColor(color) {
    replyStyleSettings.borderColor = color;
    saveReplyStyleSettings();
    renderStyleTabContent('reply');
    applyCustomReplyCSS();
}

function selectReplyBgColor(color) {
    replyStyleSettings.bgColor = color;
    saveReplyStyleSettings();
    renderStyleTabContent('reply');
    applyCustomReplyCSS();
}

function updateReplyBgOpacity(value) {
    replyStyleSettings.bgOpacity = parseInt(value, 10);
    var valSpan = document.getElementById('reply-opacity-val');
    if (valSpan) valSpan.textContent = value + '%';
    var preview = document.getElementById('reply-preview-box');
    if (preview) {
        preview.style.background = hexToRgba(replyStyleSettings.bgColor || replyStyleSettings.borderColor || '#8F6409', replyStyleSettings.bgOpacity);
    }
    saveReplyStyleSettings();
    applyCustomReplyCSS();
}

function selectReplyAnimation(anim) {
    replyStyleSettings.animation = anim;
    saveReplyStyleSettings();
    renderStyleTabContent('reply');
    applyCustomReplyCSS();
}

function selectReplyBorderStyle(style) {
    replyStyleSettings.borderStyle = style;
    saveReplyStyleSettings();
    renderStyleTabContent('reply');
    applyCustomReplyCSS();
}

function selectReplyBorderRadius(radius) {
    replyStyleSettings.borderRadius = radius;
    saveReplyStyleSettings();
    renderStyleTabContent('reply');
    applyCustomReplyCSS();
}

function selectReplyGlowColor(color) {
    replyStyleSettings.glowColor = color;
    saveReplyStyleSettings();
    renderStyleTabContent('reply');
    applyCustomReplyCSS();
}

function updateReplyGlowIntensity(value) {
    replyStyleSettings.glowIntensity = parseInt(value, 10);
    var valSpan = document.getElementById('reply-glow-val');
    if (valSpan) valSpan.textContent = value + 'px';
    saveReplyStyleSettings();
    applyCustomReplyCSS();
}

function resetReplyStyle() {
    replyStyleSettings = {
        enabled: false,
        borderColor: null,
        bgColor: null,
        bgOpacity: 15,
        animation: null,
        borderStyle: null,
        borderRadius: null,
        glowColor: null,
        glowIntensity: 10
    };
    saveReplyStyleSettings();
    renderStyleTabContent('reply');
    applyCustomReplyCSS();
}

function saveReplyStyleSettings() {
    localStorage.setItem('replyStyleSettings', JSON.stringify(replyStyleSettings));
}

function applyCustomReplyCSS() {
    var root = document.documentElement;
    if (replyStyleSettings.enabled && replyStyleSettings.borderColor) {
        root.style.setProperty('--custom-reply-color', replyStyleSettings.borderColor);
        var bgColor = replyStyleSettings.bgColor || replyStyleSettings.borderColor;
        root.style.setProperty('--custom-reply-bg', hexToRgba(bgColor, replyStyleSettings.bgOpacity || 15));
        // Set glow properties
        var glowColor = replyStyleSettings.glowColor || replyStyleSettings.borderColor;
        var glowIntensity = replyStyleSettings.glowIntensity || 10;
        root.style.setProperty('--custom-reply-glow-color', glowColor);
        root.style.setProperty('--custom-reply-glow-intensity', glowIntensity + 'px');
    } else {
        root.style.removeProperty('--custom-reply-color');
        root.style.removeProperty('--custom-reply-bg');
        root.style.removeProperty('--custom-reply-glow-color');
        root.style.removeProperty('--custom-reply-glow-intensity');
    }
}

// Initialize custom reply CSS on page load
$(document).ready(function() {
    setTimeout(applyCustomReplyCSS, 100);
});

function openTextStylePopup() {
    createTextStylePopup();
    document.getElementById('textstyle-popup-overlay').classList.add('visible');
    refreshStyleBtns();
    updateStylePreview();
}

function closeTextStylePopup() {
    var o = document.getElementById('textstyle-popup-overlay');
    if (o) o.classList.remove('visible');
}

function toggleTextStylePopup() {
    var o = document.getElementById('textstyle-popup-overlay');
    if (o && o.classList.contains('visible')) closeTextStylePopup();
    else openTextStylePopup();
}

// ========== BUDDY SETTINGS POPUP ==========
var currentBuddyTab = 'appearance';

function createBuddySettingsPopup() {
    if (document.getElementById('buddy-settings-overlay')) return;
    var o = document.createElement('div');
    o.id = 'buddy-settings-overlay';
    o.className = 'textstyle-popup-overlay';
    o.onclick = function(e) { if (e.target === o) closeBuddySettingsPopup(); };

    var p = document.createElement('div');
    p.id = 'buddy-settings-popup';
    p.className = 'textstyle-popup';
    p.innerHTML = '<div class="popup-header" id="buddy-settings-header"><span>🐦 Buddy Settings</span><button class="popup-close" onclick="closeBuddySettingsPopup()">×</button></div>' +
        '<div id="buddy-tabs" class="textstyle-tabs">' +
        '<button class="style-tab active" data-tab="appearance" onclick="switchBuddyTab(\'appearance\')">🎨 Look</button>' +
        '<button class="style-tab" data-tab="personality" onclick="switchBuddyTab(\'personality\')">💭 Personality</button>' +
        '<button class="style-tab" data-tab="behavior" onclick="switchBuddyTab(\'behavior\')">🏃 Behavior</button>' +
        '<button class="style-tab" data-tab="phrases" onclick="switchBuddyTab(\'phrases\')">💬 Phrases</button>' +
        '</div>' +
        '<div id="buddy-tab-content"></div>';
    o.appendChild(p);
    document.body.appendChild(o);
    makeDraggable(p, document.getElementById('buddy-settings-header'));
    renderBuddyTabContent('appearance');
}

function switchBuddyTab(tab) {
    currentBuddyTab = tab;
    document.querySelectorAll('#buddy-tabs .style-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelector('#buddy-tabs .style-tab[data-tab="' + tab + '"]').classList.add('active');
    renderBuddyTabContent(tab);
}

function renderBuddyTabContent(tab) {
    var container = document.getElementById('buddy-tab-content');
    if (!container) return;

    var settings = myBuddySettings || JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));

    if (tab === 'appearance') {
        // APPEARANCE TAB
        var spriteOptions = BUDDY_SPRITES.map(function(s, i) {
            var act = settings.spriteIndex === i ? ' active' : '';
            return '<button class="textstyle-btn sprite-btn' + act + '" onclick="selectBuddySprite(' + i + ')" style="font-size:24px">' + s.body + '</button>';
        }).join('');

        var sizeOptions = Object.keys(BUDDY_SIZES).map(function(s) {
            var act = settings.size === s ? ' active' : '';
            return '<button class="textstyle-btn' + act + '" onclick="selectBuddySize(\'' + s + '\')">' + s.charAt(0).toUpperCase() + s.slice(1) + '</button>';
        }).join('');

        container.innerHTML = '<div class="textstyle-popup-scroll">' +
            '<div class="textstyle-section"><h4>Choose Sprite</h4>' +
            '<button class="textstyle-btn' + (settings.spriteIndex === -1 ? ' active' : '') + '" onclick="selectBuddySprite(-1)" style="width:100%;margin-bottom:8px">🎲 Random (based on username)</button>' +
            '<div class="textstyle-grid sprite-grid">' + spriteOptions + '</div></div>' +
            '<div class="textstyle-section"><h4>Custom Sprite URL</h4>' +
            '<input type="text" id="buddy-custom-sprite" class="form-control" placeholder="https://example.com/sprite.gif" value="' + (settings.customSpriteUrl || '') + '" style="width:100%;margin-bottom:8px">' +
            '<button class="textstyle-btn" onclick="applyCustomBuddySprite()" style="width:100%">Apply Custom Sprite</button>' +
            '<p style="font-size:11px;color:#888;margin-top:4px">Supports GIFs! Direct image link required.</p></div>' +
            '<div class="textstyle-section"><h4>Size</h4><div class="textstyle-grid">' + sizeOptions + '</div></div>' +
            '<div class="textstyle-section"><h4>Color Adjustments</h4>' +
            '<div class="buddy-slider-row"><label>Hue Rotate: <span id="hue-val">' + settings.hueRotate + '°</span></label><input type="range" min="0" max="360" value="' + settings.hueRotate + '" oninput="updateBuddyHue(this.value)"></div>' +
            '<div class="buddy-slider-row"><label>Saturation: <span id="sat-val">' + settings.saturation + '%</span></label><input type="range" min="50" max="200" value="' + settings.saturation + '" oninput="updateBuddySaturation(this.value)"></div>' +
            '<div class="buddy-slider-row"><label>Brightness: <span id="bright-val">' + settings.brightness + '%</span></label><input type="range" min="50" max="150" value="' + settings.brightness + '" oninput="updateBuddyBrightness(this.value)"></div></div>' +
            '<div class="textstyle-section"><h4>Glow Effect</h4>' +
            '<div class="custom-color-row"><label>Color: </label><input type="color" id="buddy-glow-color" value="' + (settings.glowColor || '#FFD700') + '" onchange="updateBuddyGlowColor(this.value)"></div>' +
            '<div class="buddy-slider-row"><label>Intensity: <span id="glow-val">' + settings.glowIntensity + 'px</span></label><input type="range" min="0" max="20" value="' + settings.glowIntensity + '" oninput="updateBuddyGlowIntensity(this.value)"></div></div>' +
            '<div class="textstyle-section"><h4>Display Name</h4>' +
            '<input type="text" id="buddy-display-name" class="form-control" placeholder="Leave empty to use username" value="' + (settings.displayName || '') + '" style="width:100%" onchange="updateBuddyDisplayName(this.value)"></div>' +
            '<div class="textstyle-section"><h4>Preview</h4><div id="buddy-preview" style="height:80px;background:#111;border-radius:6px;position:relative;display:flex;align-items:center;justify-content:center;font-size:32px"></div></div>' +
            '</div>';
        updateBuddyPreview();

    } else if (tab === 'personality') {
        // PERSONALITY TAB
        var personalityOptions = Object.keys(PERSONALITIES).map(function(p) {
            var act = settings.personality === p ? ' active' : '';
            var pers = PERSONALITIES[p];
            return '<button class="textstyle-btn' + act + '" onclick="selectBuddyPersonality(\'' + p + '\')" title="' + (pers.desc || '') + '">' + p.charAt(0).toUpperCase() + p.slice(1) + '</button>';
        }).join('');

        container.innerHTML = '<div class="textstyle-popup-scroll">' +
            '<div class="textstyle-section"><h4>Personality Type</h4>' +
            '<button class="textstyle-btn' + (settings.personality === null ? ' active' : '') + '" onclick="selectBuddyPersonality(null)" style="width:100%;margin-bottom:8px">🎲 Random (based on username)</button>' +
            '<div class="textstyle-grid">' + personalityOptions + '</div></div>' +
            '<div class="textstyle-section"><h4>Interaction Preferences</h4>' +
            '<p style="font-size:11px;color:#888;margin-bottom:8px">-1 = use personality default, 0-100 = custom chance</p>' +
            '<div class="buddy-slider-row"><label>Kiss: <span id="kiss-val">' + (settings.kissChance === -1 ? 'Default' : settings.kissChance + '%') + '</span></label><input type="range" min="-1" max="100" value="' + settings.kissChance + '" oninput="updateBuddyChance(\'kiss\', this.value)"></div>' +
            '<div class="buddy-slider-row"><label>Chase: <span id="chase-val">' + (settings.chaseChance === -1 ? 'Default' : settings.chaseChance + '%') + '</span></label><input type="range" min="-1" max="100" value="' + settings.chaseChance + '" oninput="updateBuddyChance(\'chase\', this.value)"></div>' +
            '<div class="buddy-slider-row"><label>Fight: <span id="fight-val">' + (settings.fightChance === -1 ? 'Default' : settings.fightChance + '%') + '</span></label><input type="range" min="-1" max="100" value="' + settings.fightChance + '" oninput="updateBuddyChance(\'fight\', this.value)"></div>' +
            '<div class="buddy-slider-row"><label>Flee: <span id="flee-val">' + (settings.fleeChance === -1 ? 'Default' : settings.fleeChance + '%') + '</span></label><input type="range" min="-1" max="100" value="' + settings.fleeChance + '" oninput="updateBuddyChance(\'flee\', this.value)"></div>' +
            '<div class="buddy-slider-row"><label>Confess: <span id="confess-val">' + (settings.confessChance === -1 ? 'Default' : settings.confessChance + '%') + '</span></label><input type="range" min="-1" max="100" value="' + settings.confessChance + '" oninput="updateBuddyChance(\'confess\', this.value)"></div>' +
            '<div class="buddy-slider-row"><label>Crazy: <span id="crazy-val">' + (settings.crazyChance === -1 ? 'Default' : settings.crazyChance + '%') + '</span></label><input type="range" min="-1" max="100" value="' + settings.crazyChance + '" oninput="updateBuddyChance(\'crazy\', this.value)"></div>' +
            '</div></div>';

    } else if (tab === 'behavior') {
        // BEHAVIOR TAB
        var idleOptions = Object.keys(IDLE_STYLES).map(function(s) {
            var act = settings.idleStyle === s ? ' active' : '';
            return '<button class="textstyle-btn' + act + '" onclick="selectBuddyIdleStyle(\'' + s + '\')">' + s.charAt(0).toUpperCase() + s.slice(1) + '</button>';
        }).join('');

        var movementOptions = ['default', 'smooth', 'bouncy', 'floaty', 'erratic', 'teleporty'].map(function(m) {
            var act = settings.movementStyle === m ? ' active' : '';
            return '<button class="textstyle-btn' + act + '" onclick="selectBuddyMovementStyle(\'' + m + '\')">' + m.charAt(0).toUpperCase() + m.slice(1) + '</button>';
        }).join('');

        var socialOptions = ['social', 'neutral', 'shy', 'aggressive'].map(function(s) {
            var act = settings.socialTendency === s ? ' active' : '';
            return '<button class="textstyle-btn' + act + '" onclick="selectBuddySocialTendency(\'' + s + '\')">' + s.charAt(0).toUpperCase() + s.slice(1) + '</button>';
        }).join('');

        var posOptions = ['ground', 'high', 'chatFollow', 'roam'].map(function(p) {
            var act = settings.positionPreference === p ? ' active' : '';
            var label = p === 'chatFollow' ? 'Follow Chat' : p.charAt(0).toUpperCase() + p.slice(1);
            return '<button class="textstyle-btn' + act + '" onclick="selectBuddyPosition(\'' + p + '\')">' + label + '</button>';
        }).join('');

        container.innerHTML = '<div class="textstyle-popup-scroll">' +
            '<div class="textstyle-section"><h4>Idle Style</h4><div class="textstyle-grid">' + idleOptions + '</div></div>' +
            '<div class="textstyle-section"><h4>Movement Style</h4><div class="textstyle-grid">' + movementOptions + '</div></div>' +
            '<div class="textstyle-section"><h4>Social Tendency</h4><div class="textstyle-grid">' + socialOptions + '</div></div>' +
            '<div class="textstyle-section"><h4>Position Preference</h4><div class="textstyle-grid">' + posOptions + '</div></div>' +
            '<div class="textstyle-section"><h4>Fine Tuning</h4>' +
            '<div class="buddy-slider-row"><label>Speed: <span id="speed-val">' + settings.movementSpeed + 'x</span></label><input type="range" min="50" max="200" value="' + (settings.movementSpeed * 100) + '" oninput="updateBuddySpeed(this.value)"></div>' +
            '<div class="buddy-slider-row"><label>Interaction Rate: <span id="interact-val">' + settings.interactionFrequency + 'x</span></label><input type="range" min="50" max="200" value="' + (settings.interactionFrequency * 100) + '" oninput="updateBuddyInteractRate(this.value)"></div>' +
            '<div class="buddy-slider-row"><label>Chattiness: <span id="chat-val">' + settings.chattiness + 'x</span></label><input type="range" min="50" max="200" value="' + (settings.chattiness * 100) + '" oninput="updateBuddyChattiness(this.value)"></div>' +
            '<div class="buddy-slider-row"><label>Energy: <span id="energy-val">' + settings.energyLevel + 'x</span></label><input type="range" min="50" max="200" value="' + (settings.energyLevel * 100) + '" oninput="updateBuddyEnergy(this.value)"></div>' +
            '</div></div>';

    } else if (tab === 'phrases') {
        // PHRASES TAB
        var phrases = settings.customPhrases || [];
        var phraseInputs = '';
        for (var i = 0; i < 5; i++) {
            phraseInputs += '<input type="text" class="form-control buddy-phrase-input" data-index="' + i + '" placeholder="Custom phrase ' + (i+1) + '" value="' + (phrases[i] || '') + '" style="margin-bottom:4px" onchange="updateBuddyPhrase(' + i + ', this.value)">';
        }

        container.innerHTML = '<div class="textstyle-popup-scroll">' +
            '<div class="textstyle-section"><h4>Catchphrase</h4>' +
            '<input type="text" id="buddy-catchphrase" class="form-control" placeholder="e.g. \'Kawaii desu!\'" value="' + (settings.catchphrase || '') + '" onchange="updateBuddyCatchphrase(this.value)">' +
            '<p style="font-size:11px;color:#888">Said randomly during idle</p></div>' +
            '<div class="textstyle-section"><h4>Custom Phrases</h4>' +
            '<p style="font-size:11px;color:#888;margin-bottom:4px">Used in interactions and conversations</p>' +
            phraseInputs + '</div>' +
            '<div class="textstyle-section"><h4>Greeting</h4>' +
            '<input type="text" id="buddy-greeting" class="form-control" placeholder="e.g. \'Hello there!\'" value="' + (settings.greeting || '') + '" onchange="updateBuddyGreeting(this.value)"></div>' +
            '<div class="textstyle-section"><h4>Victory Line</h4>' +
            '<input type="text" id="buddy-victory" class="form-control" placeholder="e.g. \'I win!\'" value="' + (settings.victoryLine || '') + '" onchange="updateBuddyVictory(this.value)"></div>' +
            '<div class="textstyle-section"><h4>Defeat Line</h4>' +
            '<input type="text" id="buddy-defeat" class="form-control" placeholder="e.g. \'Next time...\'" value="' + (settings.defeatLine || '') + '" onchange="updateBuddyDefeat(this.value)"></div>' +
            '<div class="textstyle-section"><h4>Love Line</h4>' +
            '<input type="text" id="buddy-love" class="form-control" placeholder="e.g. \'Senpai noticed me!\'" value="' + (settings.loveLine || '') + '" onchange="updateBuddyLove(this.value)"></div>' +
            '</div>';
    }
}

function updateBuddyPreview() {
    var preview = document.getElementById('buddy-preview');
    if (!preview) return;

    var settings = myBuddySettings || DEFAULT_BUDDY_SETTINGS;
    var sprite = '';

    if (settings.customSpriteUrl) {
        sprite = '<img src="' + escapeHtml(settings.customSpriteUrl) + '" style="max-height:60px;max-width:60px;object-fit:contain">';
    } else {
        var idx = settings.spriteIndex >= 0 ? settings.spriteIndex : 0;
        sprite = BUDDY_SPRITES[idx] ? BUDDY_SPRITES[idx].body : '🐦';
    }

    var filters = [];
    if (settings.hueRotate) filters.push('hue-rotate(' + settings.hueRotate + 'deg)');
    if (settings.saturation !== 100) filters.push('saturate(' + settings.saturation + '%)');
    if (settings.brightness !== 100) filters.push('brightness(' + settings.brightness + '%)');
    if (settings.glowIntensity > 0) {
        var glowColor = settings.glowColor || '#FFD700';
        filters.push('drop-shadow(0 0 ' + settings.glowIntensity + 'px ' + glowColor + ')');
    }

    var filterStyle = filters.length ? 'filter:' + filters.join(' ') + ';' : '';
    preview.innerHTML = '<div style="' + filterStyle + '">' + sprite + '</div>';
}

function openBuddySettingsPopup() {
    createBuddySettingsPopup();
    document.getElementById('buddy-settings-overlay').classList.add('visible');
}

function closeBuddySettingsPopup() {
    var o = document.getElementById('buddy-settings-overlay');
    if (o) o.classList.remove('visible');
}

function toggleBuddySettingsPopup() {
    var o = document.getElementById('buddy-settings-overlay');
    if (o && o.classList.contains('visible')) closeBuddySettingsPopup();
    else openBuddySettingsPopup();
}

// Buddy Settings Update Functions
function selectBuddySprite(index) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.spriteIndex = index;
    myBuddySettings.customSpriteUrl = null;
    saveMyBuddySettings();
    broadcastMyBuddySettings();
    renderBuddyTabContent('appearance');
    applyMyBuddySettings();
}

function applyCustomBuddySprite() {
    var url = document.getElementById('buddy-custom-sprite').value.trim();
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.customSpriteUrl = url || null;
    if (url) myBuddySettings.spriteIndex = -1;
    saveMyBuddySettings();
    broadcastMyBuddySettings();
    updateBuddyPreview();
    applyMyBuddySettings();
}

function selectBuddySize(size) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.size = size;
    saveMyBuddySettings();
    broadcastMyBuddySettings();
    renderBuddyTabContent('appearance');
    applyMyBuddySettings();
}

function updateBuddyHue(val) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.hueRotate = parseInt(val);
    document.getElementById('hue-val').textContent = val + '°';
    saveMyBuddySettings();
    updateBuddyPreview();
    applyMyBuddySettings();
    scheduleVisualBroadcast(); // Sync to other users with debounce
}

function updateBuddySaturation(val) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.saturation = parseInt(val);
    document.getElementById('sat-val').textContent = val + '%';
    saveMyBuddySettings();
    updateBuddyPreview();
    applyMyBuddySettings();
    scheduleVisualBroadcast(); // Sync to other users with debounce
}

function updateBuddyBrightness(val) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.brightness = parseInt(val);
    document.getElementById('bright-val').textContent = val + '%';
    saveMyBuddySettings();
    updateBuddyPreview();
    applyMyBuddySettings();
    scheduleVisualBroadcast(); // Sync to other users with debounce
}

function updateBuddyGlowColor(color) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.glowColor = color;
    saveMyBuddySettings();
    updateBuddyPreview();
    applyMyBuddySettings();
    scheduleVisualBroadcast(); // Sync to other users with debounce
}

function updateBuddyGlowIntensity(val) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.glowIntensity = parseInt(val);
    document.getElementById('glow-val').textContent = val + 'px';
    saveMyBuddySettings();
    updateBuddyPreview();
    applyMyBuddySettings();
    scheduleVisualBroadcast(); // Sync to other users with debounce
}

function updateBuddyDisplayName(name) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.displayName = name || null;
    saveMyBuddySettings();
    broadcastMyBuddySettings();
    applyMyBuddySettings();
}

function selectBuddyPersonality(personality) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.personality = personality;
    saveMyBuddySettings();
    broadcastMyBuddySettings();
    renderBuddyTabContent('personality');
    applyMyBuddySettings();
}

function updateBuddyChance(type, val) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    var v = parseInt(val);
    myBuddySettings[type + 'Chance'] = v;
    document.getElementById(type + '-val').textContent = v === -1 ? 'Default' : v + '%';
    saveMyBuddySettings();
    broadcastMyBuddySettings();
}

function selectBuddyIdleStyle(style) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.idleStyle = style;
    saveMyBuddySettings();
    broadcastMyBuddySettings();
    renderBuddyTabContent('behavior');
    applyMyBuddySettings();
}

function selectBuddyMovementStyle(style) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.movementStyle = style;
    saveMyBuddySettings();
    broadcastMyBuddySettings();
    renderBuddyTabContent('behavior');
}

function selectBuddySocialTendency(tendency) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.socialTendency = tendency;
    saveMyBuddySettings();
    broadcastMyBuddySettings();
    renderBuddyTabContent('behavior');
}

function selectBuddyPosition(pos) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.positionPreference = pos;
    saveMyBuddySettings();
    broadcastMyBuddySettings();
    renderBuddyTabContent('behavior');
}

function updateBuddySpeed(val) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.movementSpeed = val / 100;
    document.getElementById('speed-val').textContent = (val / 100).toFixed(1) + 'x';
    saveMyBuddySettings();
    broadcastMyBuddySettings();
}

function updateBuddyInteractRate(val) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.interactionFrequency = val / 100;
    document.getElementById('interact-val').textContent = (val / 100).toFixed(1) + 'x';
    saveMyBuddySettings();
    broadcastMyBuddySettings();
}

function updateBuddyChattiness(val) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.chattiness = val / 100;
    document.getElementById('chat-val').textContent = (val / 100).toFixed(1) + 'x';
    saveMyBuddySettings();
    broadcastMyBuddySettings();
}

function updateBuddyEnergy(val) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.energyLevel = val / 100;
    document.getElementById('energy-val').textContent = (val / 100).toFixed(1) + 'x';
    saveMyBuddySettings();
    broadcastMyBuddySettings();
}

function updateBuddyCatchphrase(text) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.catchphrase = text || null;
    saveMyBuddySettings();
    broadcastMyBuddySettings();
}

function updateBuddyPhrase(index, text) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    if (!myBuddySettings.customPhrases) myBuddySettings.customPhrases = [];
    myBuddySettings.customPhrases[index] = text || '';
    saveMyBuddySettings();
    broadcastMyBuddySettings();
}

function updateBuddyGreeting(text) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.greeting = text || null;
    saveMyBuddySettings();
    broadcastMyBuddySettings();
}

function updateBuddyVictory(text) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.victoryLine = text || null;
    saveMyBuddySettings();
    broadcastMyBuddySettings();
}

function updateBuddyDefeat(text) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.defeatLine = text || null;
    saveMyBuddySettings();
    broadcastMyBuddySettings();
}

function updateBuddyLove(text) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.loveLine = text || null;
    saveMyBuddySettings();
    broadcastMyBuddySettings();
}

function applyMyBuddySettings() {
    var myName = getMyUsername();
    if (!myName || !myBuddySettings) return;

    // Apply to own buddy if exists
    var buddy = buddyCharacters[myName];
    if (buddy) {
        applyCustomSettingsToBuddy(myName);
    }
}

// ========== END BUDDY SETTINGS POPUP ==========

// Parameterized style property selector - used by both message and username styling
function _selectStyleProp(settings, prop, value, clearProps, saveFn, tab) {
    if (settings[prop] === value) {
        settings[prop] = null;
    } else {
        settings[prop] = value;
        if (clearProps) {
            clearProps.forEach(function(p) { settings[p] = null; });
        }
    }
    saveFn();
    renderStyleTabContent(tab);
}

function selectStyleColor(c) {
    _selectStyleProp(textStyleSettings, 'color', c, ['gradient', 'customColor'], function() { saveStyleSettings(); updateStylePreview(); }, 'message');
}

function selectStyleGradient(g) {
    _selectStyleProp(textStyleSettings, 'gradient', g, ['color', 'customColor'], function() { saveStyleSettings(); updateStylePreview(); }, 'message');
}

function selectStyleGlow(g) {
    _selectStyleProp(textStyleSettings, 'glow', g, ['customGlow'], function() { saveStyleSettings(); updateStylePreview(); }, 'message');
}

function selectStyleFont(f) {
    _selectStyleProp(textStyleSettings, 'font', f, null, function() { saveStyleSettings(); updateStylePreview(); }, 'message');
}

function selectStyleAnimation(a) {
    _selectStyleProp(textStyleSettings, 'animation', a, null, function() { saveStyleSettings(); updateStylePreview(); }, 'message');
}

function toggleStyleEffect(eff) {
    textStyleSettings[eff] = !textStyleSettings[eff];
    saveStyleSettings();
    renderStyleTabContent('message');
    updateStylePreview();
}

function resetTextStyle() {
    textStyleSettings = {
        color: null,
        gradient: null,
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        glow: null,
        animation: null,
        font: null,
        customColor: null,
        customGlow: null
    };
    saveStyleSettings();
    renderStyleTabContent('message');
    updateStylePreview();
}

// Custom color functions for message styling
function selectCustomColor(hex) {
    var btn = document.getElementById('custom-color-btn');
    if (btn) {
        btn.style.background = hex;
    }
}

function applyCustomColor() {
    var picker = document.getElementById('custom-color-picker');
    if (picker) {
        // Store hex without the # prefix
        var hex = picker.value.replace('#', '');
        textStyleSettings.color = null;
        textStyleSettings.gradient = null;
        textStyleSettings.customColor = hex;
        saveStyleSettings();
        renderStyleTabContent('message');
        updateStylePreview();
    }
}

function clearCustomColor() {
    textStyleSettings.customColor = null;
    saveStyleSettings();
    renderStyleTabContent('message');
    updateStylePreview();
}

function selectCustomGlow(hex) {
    var btn = document.getElementById('custom-glow-btn');
    if (btn) {
        btn.style.textShadow = '0 0 8px ' + hex;
    }
}

function applyCustomGlow() {
    var picker = document.getElementById('custom-glow-picker');
    if (picker) {
        var hex = picker.value.replace('#', '');
        textStyleSettings.glow = null;
        textStyleSettings.customGlow = hex;
        saveStyleSettings();
        renderStyleTabContent('message');
        updateStylePreview();
    }
}

function clearCustomGlow() {
    textStyleSettings.customGlow = null;
    saveStyleSettings();
    renderStyleTabContent('message');
    updateStylePreview();
}

// Custom color functions for username styling
function selectUsernameCustomColor(hex) {
    var btn = document.getElementById('uname-custom-color-btn');
    if (btn) {
        btn.style.background = hex;
    }
}

function applyUsernameCustomColor() {
    var picker = document.getElementById('uname-custom-color-picker');
    if (picker) {
        var hex = picker.value.replace('#', '');
        usernameStyleSettings.color = null;
        usernameStyleSettings.gradient = null;
        usernameStyleSettings.customColor = hex;
        saveUsernameStyleSettings();
        renderStyleTabContent('username');
    }
}

function clearUsernameCustomColor() {
    usernameStyleSettings.customColor = null;
    saveUsernameStyleSettings();
    renderStyleTabContent('username');
}

function selectUsernameCustomGlow(hex) {
    var btn = document.getElementById('uname-custom-glow-btn');
    if (btn) {
        btn.style.textShadow = '0 0 8px ' + hex;
    }
}

function applyUsernameCustomGlow() {
    var picker = document.getElementById('uname-custom-glow-picker');
    if (picker) {
        var hex = picker.value.replace('#', '');
        usernameStyleSettings.glow = null;
        usernameStyleSettings.customGlow = hex;
        saveUsernameStyleSettings();
        renderStyleTabContent('username');
    }
}

function clearUsernameCustomGlow() {
    usernameStyleSettings.customGlow = null;
    saveUsernameStyleSettings();
    renderStyleTabContent('username');
}

function refreshStyleBtns() {
    document.querySelectorAll('.color-btn').forEach(function(b) { 
        b.classList.toggle('active', textStyleSettings.color === b.dataset.color); 
    });
    document.querySelectorAll('.gradient-btn').forEach(function(b) { 
        b.classList.toggle('active', textStyleSettings.gradient === b.dataset.gradient); 
    });
    document.querySelectorAll('.glow-btn').forEach(function(b) { 
        b.classList.toggle('active', textStyleSettings.glow === b.dataset.glow); 
    });
    document.querySelectorAll('.anim-btn').forEach(function(b) { 
        b.classList.toggle('active', textStyleSettings.animation === b.dataset.anim); 
    });
    document.querySelectorAll('.font-btn').forEach(function(b) { 
        b.classList.toggle('active', textStyleSettings.font === b.dataset.font); 
    });
    document.querySelectorAll('.effect-btn').forEach(function(b) { 
        b.classList.toggle('active', textStyleSettings[b.dataset.effect]); 
    });
    updateFontBtnIndicator();
}

function updateStylePreview() {
    var p = document.getElementById('textstyle-preview');
    if (!p) return;

    var s = [];
    var classes = [];

    // Font
    if (textStyleSettings.font) {
        if (STYLE_FONTS[textStyleSettings.font]) s.push(STYLE_FONTS[textStyleSettings.font]);
    }

    // Color or gradient or custom color
    if (textStyleSettings.gradient) {
        if (STYLE_GRADIENTS[textStyleSettings.gradient]) s.push(STYLE_GRADIENTS[textStyleSettings.gradient]);
    } else if (textStyleSettings.color) {
        s.push('color:' + (textStyleSettings.color === 'blue' ? '#55f' : textStyleSettings.color));
    } else if (textStyleSettings.customColor) {
        s.push('color:#' + textStyleSettings.customColor);
    }

    // Glow or custom glow
    if (textStyleSettings.glow) {
        if (STYLE_GLOWS[textStyleSettings.glow]) s.push(STYLE_GLOWS[textStyleSettings.glow]);
    } else if (textStyleSettings.customGlow) {
        s.push('text-shadow:0 0 10px #' + textStyleSettings.customGlow + ',0 0 20px #' + textStyleSettings.customGlow + ',0 0 30px #' + textStyleSettings.customGlow);
    }
    
    // Text effects
    if (textStyleSettings.bold) s.push('font-weight:bold');
    if (textStyleSettings.italic) s.push('font-style:italic');
    var td = [];
    if (textStyleSettings.underline) td.push('underline');
    if (textStyleSettings.strikethrough) td.push('line-through');
    if (td.length) s.push('text-decoration:' + td.join(' '));
    
    // Animation class
    if (textStyleSettings.animation) {
        classes.push('text-' + textStyleSettings.animation);
    }
    
    var hasStyle = textStyleSettings.color || textStyleSettings.gradient || textStyleSettings.bold || 
                   textStyleSettings.italic || textStyleSettings.underline || textStyleSettings.strikethrough ||
                   textStyleSettings.glow || textStyleSettings.animation || textStyleSettings.font;
    
    p.style.cssText = s.join(';');
    p.className = classes.join(' ');
    p.textContent = hasStyle ? 'Your message will look like this!' : 'No styling (default)';
    if (!hasStyle) { p.style.color = '#666'; p.style.fontStyle = 'italic'; }
}

function saveStyleSettings() {
    localStorage.setItem('textStyleSettings', JSON.stringify(textStyleSettings));
    updateFontBtnIndicator();
}

function updateFontBtnIndicator() {
    var btn = document.getElementById('font-tags-btn');
    if (!btn) return;
    var hasStyle = textStyleSettings.color || textStyleSettings.gradient || textStyleSettings.bold || 
                   textStyleSettings.italic || textStyleSettings.underline || textStyleSettings.strikethrough ||
                   textStyleSettings.glow || textStyleSettings.animation || textStyleSettings.font;
    btn.style.borderColor = hasStyle ? 'gold' : '';
    btn.style.boxShadow = hasStyle ? '0 0 8px rgba(255,215,0,0.5)' : '';
}

function buildStyleTags(msg) {
    if (!msg.trim()) return msg;
    var open = '', close = '';
    
    // Gradient (outermost)
    if (textStyleSettings.gradient) { 
        open += '[' + textStyleSettings.gradient + ']'; 
        close = '[/]' + close; 
    }
    // Or solid color
    else if (textStyleSettings.color) { 
        open += '[' + textStyleSettings.color + ']'; 
        close = '[/]' + close; 
    }
    // Or custom color
    else if (textStyleSettings.customColor) { 
        open += '[#' + textStyleSettings.customColor + ']'; 
        close = '[/]' + close; 
    }
    
    // Glow effect
    if (textStyleSettings.glow) { 
        open += '[' + textStyleSettings.glow + ']'; 
        close = '[/]' + close; 
    }
    // Or custom glow
    else if (textStyleSettings.customGlow) { 
        open += '[glow-#' + textStyleSettings.customGlow + ']'; 
        close = '[/]' + close; 
    }
    
    // Animation
    if (textStyleSettings.animation) { 
        open += '[' + textStyleSettings.animation + ']'; 
        close = '[/]' + close; 
    }
    
    // Font (inside color/glow/animation so it applies to the text)
    if (textStyleSettings.font) { 
        open += '[font-' + textStyleSettings.font + ']'; 
        close = '[/]' + close; 
    }
    
    // Text formatting (innermost)
    if (textStyleSettings.bold) { open += '[b]'; close = '[/]' + close; }
    if (textStyleSettings.italic) { open += '[i]'; close = '[/]' + close; }
    if (textStyleSettings.underline) { open += '[u]'; close = '[/]' + close; }
    if (textStyleSettings.strikethrough) { open += '[s]'; close = '[/]' + close; }
    
    return open ? open + msg + close : msg;
}

function applyStyleToMessage() {
    var c = document.getElementById('chatline');
    if (!c) return;
    var msg = c.value;
    // Skip commands
    if (msg.startsWith('/')) return;
    // Skip empty
    if (!msg.trim()) return;
    // Skip if already has tags
    if (msg.match(/^\[(?:font-\w+|red|blue|green|yellow|orange|pink|lime|aqua|violet|white|silver|brown|b|i|u|s|rainbow|fire|ocean|sunset|neon|forest|gold|ice|glow-\w+|shake|pulse|bounce|wave|flicker|spin)\]/)) return;
    
    // Skip if message contains URLs (for GIF embedding to work)
    if (msg.match(/https?:\/\//)) return;
    
    // Check if any style is active
    var hasStyle = textStyleSettings.color || textStyleSettings.gradient || textStyleSettings.bold || 
                   textStyleSettings.italic || textStyleSettings.underline || textStyleSettings.strikethrough ||
                   textStyleSettings.glow || textStyleSettings.animation || textStyleSettings.font;
    if (!hasStyle) return;
    
    // Skip if message contains any emotes (emotes won't render if wrapped in tags)
    if (typeof CHANNEL !== 'undefined' && CHANNEL.emotes && CHANNEL.emotes.length > 0) {
        for (var i = 0; i < CHANNEL.emotes.length; i++) {
            var emoteName = CHANNEL.emotes[i].name;
            if (msg.indexOf(emoteName) !== -1) {
                return; // Don't apply styling - let emote render normally
            }
        }
    }
    
    // Apply tags
    c.value = buildStyleTags(msg);
}

function initStyleInterceptor() {
    var chatline = document.getElementById('chatline');
    var form = document.getElementById('formline');
    if (!chatline) return;
    
    // Hook into Enter key press
    chatline.addEventListener('keydown', function(e) {
        if (e.keyCode === 13 || e.key === 'Enter') {
            applyStyleToMessage();
        }
    }, true);
    
    // Also hook into form submit as backup
    if (form) {
        form.addEventListener('submit', function(e) {
            applyStyleToMessage();
        }, true);
    }
    
    // Hook into any send button click
    var sendBtn = document.querySelector('#formline button[type="submit"], #formline .btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', function(e) {
            applyStyleToMessage();
        }, true);
    }
}

function initUsernameStyleInterceptor() {
    var chatline = document.getElementById('chatline');
    var form = document.getElementById('formline');
    if (!chatline) return;
    
    // Hook into Enter key press - run AFTER text style
    chatline.addEventListener('keydown', function(e) {
        if (e.keyCode === 13 || e.key === 'Enter') {
            applyUsernameTagsToMessage();
        }
    }, true);
    
    // Also hook into form submit as backup
    if (form) {
        form.addEventListener('submit', function(e) {
            applyUsernameTagsToMessage();
        }, true);
    }
    
    // Hook into any send button click
    var sendBtn = document.querySelector('#formline button[type="submit"], #formline .btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', function(e) {
            applyUsernameTagsToMessage();
        }, true);
    }
}

// FILTER INSTRUCTIONS POPUP
function showFilterPopup() {
    closeTextStylePopup();
    if (document.getElementById('filter-popup-overlay')) document.getElementById('filter-popup-overlay').remove();
    var o = document.createElement('div');
    o.id = 'filter-popup-overlay';
    o.onclick = function(e) { if (e.target === o) closeFilterPopup(); };
    var p = document.createElement('div');
    p.id = 'filter-popup';

    // Build comprehensive filter documentation
    var html = '<div class="popup-header"><span>Chat Filters Setup (Admin)</span><button class="popup-close" onclick="closeFilterPopup()">×</button></div>' +
        '<div id="filter-popup-body">' +
        '<p>Admin must add these Chat Filters in <strong>Channel Settings → Edit → Chat Filters</strong>.</p>' +
        '<p style="background:#422;padding:10px;border-radius:6px;margin-bottom:15px;">⚠️ <strong>Without these filters, tags display as raw text!</strong></p>' +

        // REQUIRED - Username wrapper
        '<details open><summary style="cursor:pointer;font-weight:bold;color:#fc0;margin-bottom:8px;">🔴 REQUIRED - Username Styling</summary>' +
        '<table><tr><th>Name</th><th>Regex</th><th>Flags</th><th>Replacement</th></tr>' +
        '<tr style="background:#332"><td>uname</td><td>\\[uname\\](.+?)\\[/uname\\]</td><td>g</td><td>&lt;span class="styled-username" data-ignore-nnd="true"&gt;$1&lt;/span&gt;</td></tr>' +
        '</table></details>' +

        // CUSTOM HEX COLORS - Dynamic
        '<details open><summary style="cursor:pointer;font-weight:bold;color:#f80;margin:15px 0 8px;">🎨 Custom Hex Colors (Color Picker)</summary>' +
        '<p style="font-size:12px;color:#aaa;margin-bottom:8px;">Enables the custom color picker feature. Uses $1 for hex, $2 for text.</p>' +
        '<table><tr><th>Name</th><th>Regex</th><th>Flags</th><th>Replacement</th></tr>' +
        '<tr style="background:#332"><td>hexcolor</td><td>\\[#([0-9a-fA-F]{6})\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#$1"&gt;$2&lt;/span&gt;</td></tr>' +
        '</table></details>' +

        // CUSTOM HEX GLOWS - Dynamic
        '<details open><summary style="cursor:pointer;font-weight:bold;color:#f80;margin:15px 0 8px;">✨ Custom Hex Glows (Glow Picker)</summary>' +
        '<p style="font-size:12px;color:#aaa;margin-bottom:8px;">Enables the custom glow picker feature. Uses $1 for hex, $2 for text.</p>' +
        '<table><tr><th>Name</th><th>Regex</th><th>Flags</th><th>Replacement</th></tr>' +
        '<tr style="background:#332"><td>hexglow</td><td>\\[glow-#([0-9a-fA-F]{6})\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="text-shadow:0 0 10px #$1,0 0 20px #$1,0 0 30px #$1"&gt;$2&lt;/span&gt;</td></tr>' +
        '</table></details>' +

        // NAMED COLORS
        '<details><summary style="cursor:pointer;font-weight:bold;margin:15px 0 8px;">🎨 Named Colors (12)</summary>' +
        '<table><tr><th>Name</th><th>Regex</th><th>Flags</th><th>Replacement</th></tr>' +
        '<tr><td>white</td><td>\\[white\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#fff"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>yellow</td><td>\\[yellow\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#ff0"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>orange</td><td>\\[orange\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#ffa500"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>pink</td><td>\\[pink\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#ff69b4"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>red</td><td>\\[red\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#f00"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>lime</td><td>\\[lime\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#0f0"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>green</td><td>\\[green\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#008000"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>aqua</td><td>\\[aqua\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#0ff"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>blue</td><td>\\[blue\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#55f"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>violet</td><td>\\[violet\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#ee82ee"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>brown</td><td>\\[brown\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#8b4513"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>silver</td><td>\\[silver\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#c0c0c0"&gt;$1&lt;/span&gt;</td></tr>' +
        '</table></details>' +

        // GRADIENTS
        '<details><summary style="cursor:pointer;font-weight:bold;margin:15px 0 8px;">🌈 Gradients (8)</summary>' +
        '<table><tr><th>Name</th><th>Regex</th><th>Flags</th><th>Replacement</th></tr>' +
        '<tr><td>rainbow</td><td>\\[rainbow\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="background:linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f);-webkit-background-clip:text;-webkit-text-fill-color:transparent"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>fire</td><td>\\[fire\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="background:linear-gradient(90deg,#f00,#f80,#ff0);-webkit-background-clip:text;-webkit-text-fill-color:transparent"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>ocean</td><td>\\[ocean\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="background:linear-gradient(90deg,#006,#08f,#0ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>sunset</td><td>\\[sunset\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="background:linear-gradient(90deg,#f60,#f0f,#60f);-webkit-background-clip:text;-webkit-text-fill-color:transparent"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>neon</td><td>\\[neon\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="background:linear-gradient(90deg,#f0f,#0ff,#f0f);-webkit-background-clip:text;-webkit-text-fill-color:transparent"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>forest</td><td>\\[forest\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="background:linear-gradient(90deg,#040,#0a0,#8f0);-webkit-background-clip:text;-webkit-text-fill-color:transparent"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>gold</td><td>\\[gold\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="background:linear-gradient(90deg,#b8860b,#ffd700,#b8860b);-webkit-background-clip:text;-webkit-text-fill-color:transparent"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>ice</td><td>\\[ice\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="background:linear-gradient(90deg,#aef,#fff,#aef);-webkit-background-clip:text;-webkit-text-fill-color:transparent"&gt;$1&lt;/span&gt;</td></tr>' +
        '</table></details>' +

        // NAMED GLOWS
        '<details><summary style="cursor:pointer;font-weight:bold;margin:15px 0 8px;">✨ Named Glows (7)</summary>' +
        '<table><tr><th>Name</th><th>Regex</th><th>Flags</th><th>Replacement</th></tr>' +
        '<tr><td>glow-white</td><td>\\[glow-white\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="text-shadow:0 0 10px #fff,0 0 20px #fff,0 0 30px #fff"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>glow-red</td><td>\\[glow-red\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="text-shadow:0 0 10px #f00,0 0 20px #f00,0 0 30px #f00"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>glow-blue</td><td>\\[glow-blue\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="text-shadow:0 0 10px #00f,0 0 20px #00f,0 0 30px #00f"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>glow-green</td><td>\\[glow-green\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="text-shadow:0 0 10px #0f0,0 0 20px #0f0,0 0 30px #0f0"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>glow-gold</td><td>\\[glow-gold\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="text-shadow:0 0 10px #ffd700,0 0 20px #ffd700,0 0 30px #ffd700"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>glow-pink</td><td>\\[glow-pink\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="text-shadow:0 0 10px #ff69b4,0 0 20px #ff69b4,0 0 30px #ff69b4"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>glow-rainbow</td><td>\\[glow-rainbow\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="text-shadow:0 0 5px #f00,0 0 10px #ff0,0 0 15px #0f0,0 0 20px #0ff,0 0 25px #00f,0 0 30px #f0f"&gt;$1&lt;/span&gt;</td></tr>' +
        '</table></details>' +

        // ANIMATIONS
        '<details><summary style="cursor:pointer;font-weight:bold;margin:15px 0 8px;">🎬 Animations (6)</summary>' +
        '<p style="font-size:12px;color:#aaa;margin-bottom:8px;">Note: @keyframes must be defined in Channel CSS for animations to work.</p>' +
        '<table><tr><th>Name</th><th>Regex</th><th>Flags</th><th>Replacement</th></tr>' +
        '<tr><td>shake</td><td>\\[shake\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="display:inline-block;animation:shake 0.5s ease infinite"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>pulse</td><td>\\[pulse\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="display:inline-block;animation:pulse 1s ease infinite"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>bounce</td><td>\\[bounce\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="display:inline-block;animation:bounce 0.6s ease infinite"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>wave</td><td>\\[wave\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="display:inline-block;animation:wave 2s ease infinite"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>flicker</td><td>\\[flicker\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="display:inline-block;animation:flicker 0.3s ease infinite"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>spin</td><td>\\[spin\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="display:inline-block;animation:spin 2s linear infinite"&gt;$1&lt;/span&gt;</td></tr>' +
        '</table></details>' +

        // FONTS
        '<details><summary style="cursor:pointer;font-weight:bold;margin:15px 0 8px;">🔤 Fonts (20)</summary>' +
        '<table><tr><th>Name</th><th>Regex</th><th>Flags</th><th>Replacement</th></tr>' +
        '<tr><td>comic</td><td>\\[comic\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Comic Sans MS,cursive"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>impact</td><td>\\[impact\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Impact,sans-serif"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>papyrus</td><td>\\[papyrus\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Papyrus,fantasy"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>copperplate</td><td>\\[copperplate\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Copperplate,serif"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>brush</td><td>\\[brush\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Brush Script MT,cursive"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>lucida</td><td>\\[lucida\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Lucida Console,monospace"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>courier</td><td>\\[courier\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Courier New,monospace"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>times</td><td>\\[times\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Times New Roman,serif"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>georgia</td><td>\\[georgia\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Georgia,serif"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>trebuchet</td><td>\\[trebuchet\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Trebuchet MS,sans-serif"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>verdana</td><td>\\[verdana\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Verdana,sans-serif"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>gothic</td><td>\\[gothic\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Century Gothic,sans-serif"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>garamond</td><td>\\[garamond\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Garamond,serif"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>palatino</td><td>\\[palatino\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Palatino,serif"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>bookman</td><td>\\[bookman\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:Bookman,serif"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>mono</td><td>\\[mono\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:monospace"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>cursive</td><td>\\[cursive\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:cursive"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>fantasy</td><td>\\[fantasy\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:fantasy"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>system</td><td>\\[system\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:system-ui,sans-serif"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>serif</td><td>\\[serif\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="font-family:serif"&gt;$1&lt;/span&gt;</td></tr>' +
        '</table></details>' +

        // TEXT FORMATTING
        '<details><summary style="cursor:pointer;font-weight:bold;margin:15px 0 8px;">✏️ Text Formatting (4)</summary>' +
        '<table><tr><th>Name</th><th>Regex</th><th>Flags</th><th>Replacement</th></tr>' +
        '<tr><td>bold</td><td>\\[b\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;strong&gt;$1&lt;/strong&gt;</td></tr>' +
        '<tr><td>italic</td><td>\\[i\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;em&gt;$1&lt;/em&gt;</td></tr>' +
        '<tr><td>underline</td><td>\\[u\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;u&gt;$1&lt;/u&gt;</td></tr>' +
        '<tr><td>strike</td><td>\\[s\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;s&gt;$1&lt;/s&gt;</td></tr>' +
        '</table></details>' +

        '<p style="background:#234;padding:12px;border-radius:6px;margin-top:15px;">After adding filters, text styling works for everyone! <br><small style="color:#aaa;">Note: Custom hex color/glow filters require Cytube to support multi-group regex ($1, $2).</small></p>' +
        '</div>';

    p.innerHTML = html;
    o.appendChild(p);
    document.body.appendChild(o);
    setTimeout(function() { o.classList.add('visible'); }, 10);
}

function closeFilterPopup() {
    var o = document.getElementById('filter-popup-overlay');
    if (o) o.remove();
}

/* ========== BUTTON SETUP ========== */
$("#emotelistbtn").remove();
$("#newpollbtn").html('<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#FFF" viewBox="0 0 490.4 490.4"><path d="M17.2,251.55c-9.5,0-17.2,7.7-17.2,17.1v179.7c0,9.5,7.7,17.2,17.2,17.2h113c9.5,0,17.1-7.7,17.1-17.2v-179.7c0-9.5-7.7-17.1-17.1-17.1L17.2,251.55z M113,431.25H34.3v-145.4H113V431.25z"/><path d="M490.4,448.45v-283.7c0-9.5-7.7-17.2-17.2-17.2h-113c-9.5,0-17.2,7.7-17.2,17.2v283.6c0,9.5,7.7,17.2,17.2,17.2h113C482.7,465.55,490.4,457.85,490.4,448.45z M456.1,431.25h-78.7v-249.3h78.7V431.25z"/><path d="M301.7,465.55c9.5,0,17.1-7.7,17.1-17.2V42.05c0-9.5-7.7-17.2-17.1-17.2h-113c-9.5,0-17.2,7.7-17.2,17.2v406.3c0,9.5,7.7,17.2,17.2,17.2H301.7z M205.9,59.25h78.7v372h-78.7V59.25z"/></svg>').attr("title", "Create poll");

$('<button id="emotes-btn" class="btn btn-sm btn-default" title="Emotes"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#FFF" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.507 13.941c-1.512 1.195-3.174 1.931-5.506 1.931-2.334 0-3.996-.736-5.508-1.931l-.493.493c1.127 1.72 3.2 3.566 6.001 3.566 2.8 0 4.872-1.846 5.999-3.566l-.493-.493zm-9.007-5.941c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm7 0c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5z"/></svg></button>')
    .prependTo("#leftcontrols").on("click", toggleEmotePopup);

$('<button id="favorites-btn" class="btn btn-sm btn-default" title="Favorites"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#FFD700" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>')
    .insertAfter("#emotes-btn").on("click", function(e) { e.stopPropagation(); toggleFavoritesDropdown(); });

$('<button id="font-tags-btn" class="btn btn-sm btn-default" title="Text Style"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#FFF" viewBox="0 0 24 24"><path d="M5 4v3h5.5v12h3V7H19V4z"/></svg></button>')
    .insertAfter("#favorites-btn").on("click", toggleTextStylePopup);

$('<button id="buddy-settings-btn" class="btn btn-sm btn-default" title="Buddy Settings">🐦</button>')
    .insertAfter("#font-tags-btn").on("click", toggleBuddySettingsPopup);

$('<button id="draw-btn" class="btn btn-sm btn-default" title="Draw on Video">🖌️</button>')
    .insertAfter("#buddy-settings-btn").on("click", toggleDrawingOverlay);

$("#favorites-btn").after($("#voteskip"));
$('#newpollbtn').prependTo($("#leftcontrols"));

/* ========== OVERFLOW MENU SYSTEM ========== */
/* Groups less-used buttons behind a "..." menu to keep the bar compact */
/* Visible: Emotes, Favorites, Style, Buddy, Draw                      */
/* Overflow: Poll, Skip, AFK, Clear, Settings, CC, NND, etc.           */

(function initOverflowMenu() {
  try {
    var leftControls = document.getElementById('leftcontrols');
    if (!leftControls) return;

    // Inject overflow menu CSS
    var overflowStyle = document.createElement('style');
    overflowStyle.id = 'overflow-menu-styles';
    overflowStyle.textContent = `
        /* Overflow menu wrapper - pushed right */
        #overflow-menu-wrap {
            position: relative;
            margin-left: auto;
            flex: 0 0 auto;
        }
        #overflow-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 32px;
            font-size: 16px;
            letter-spacing: 2px;
            line-height: 1;
            padding: 5px 8px;
        }
        #overflow-menu-btn:hover {
            filter: brightness(1.3);
        }
        /* Dropdown - fixed position so it escapes overflow:hidden parents */
        #overflow-menu-dropdown {
            display: none;
            position: fixed;
            background: #1a1a1e;
            border: 1px solid #444;
            border-radius: 8px;
            padding: 4px;
            min-width: 170px;
            box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.7);
            z-index: 1000000;
            flex-direction: column;
            gap: 2px;
        }
        #overflow-menu-dropdown.open {
            display: flex;
        }
        /* Items inside dropdown */
        #overflow-menu-dropdown .overflow-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            background: transparent;
            color: #ddd;
            font-size: 13px;
            cursor: pointer;
            white-space: nowrap;
            transition: background 0.15s;
            text-align: left;
            width: 100%;
        }
        #overflow-menu-dropdown .overflow-item:hover {
            background: #2a2a32;
        }
        #overflow-menu-dropdown .overflow-item .overflow-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            flex-shrink: 0;
        }
        #overflow-menu-dropdown .overflow-item .overflow-icon svg {
            width: 16px;
            height: 16px;
        }
        #overflow-menu-dropdown .overflow-item .overflow-label {
            flex: 1;
        }
        /* Active/highlighted state for CC when subs loaded */
        #overflow-menu-dropdown .overflow-item.srt-active {
            color: #8f8;
        }
        /* Force-hide buttons that were moved to overflow */
        .overflow-hidden-btn,
        #leftcontrols .overflow-hidden-btn {
            display: none !important;
        }
    `;
    document.head.appendChild(overflowStyle);

    // Create the "..." button inside #leftcontrols
    var wrap = document.createElement('div');
    wrap.id = 'overflow-menu-wrap';

    var moreBtn = document.createElement('button');
    moreBtn.id = 'overflow-menu-btn';
    moreBtn.className = 'btn btn-sm btn-default';
    moreBtn.title = 'More options';
    moreBtn.innerHTML = '&middot;&middot;&middot;';
    wrap.appendChild(moreBtn);

    leftControls.appendChild(wrap);

    // Create dropdown on <body> so it escapes all overflow:hidden containers
    var dropdown = document.createElement('div');
    dropdown.id = 'overflow-menu-dropdown';
    document.body.appendChild(dropdown);

    // Position the dropdown above the "..." button
    function positionDropdown() {
        var rect = moreBtn.getBoundingClientRect();
        dropdown.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
        dropdown.style.right = (window.innerWidth - rect.right) + 'px';
    }

    // Toggle dropdown on click
    moreBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (dropdown.classList.contains('open')) {
            dropdown.classList.remove('open');
        } else {
            positionDropdown();
            dropdown.classList.add('open');
        }
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
        if (!wrap.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    // Reposition on scroll/resize
    window.addEventListener('resize', function() { dropdown.classList.remove('open'); });

    // === Hide & delegate buttons into the overflow ===

    // IDs of buttons that should always be visible (NOT moved to overflow)
    var keepVisible = {
        'emotes-btn': true,
        'favorites-btn': true,
        'font-tags-btn': true,
        'buddy-settings-btn': true,
        'draw-btn': true,
        'overflow-menu-wrap': true
    };

    // Icon fallbacks for buttons that use text instead of SVG
    var iconFallbacks = {
        'afk-btn': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#FFF" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm1-13h-2v5.414l3.293 3.293 1.414-1.414L13 11.586V7z"/></svg>',
        'clear-btn': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#FFF" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>'
    };

    // Label overrides (some native buttons have no good title)
    var labelOverrides = {
        'newpollbtn': 'Create Poll',
        'voteskip': 'Vote Skip',
        'afk-btn': 'AFK',
        'clear-btn': 'Clear Chat'
    };

    // Move a single button into the overflow dropdown
    function moveButtonToOverflow(btn) {
        if (!btn || !btn.id) return;
        if (keepVisible[btn.id]) return;
        if (document.getElementById('overflow-' + btn.id)) return; // Already moved

        var iconHTML = '';
        var svg = btn.querySelector('svg');
        if (svg) {
            iconHTML = svg.outerHTML;
        } else {
            iconHTML = iconFallbacks[btn.id] || '';
        }

        // Determine label
        var label = labelOverrides[btn.id] || btn.title || btn.textContent.trim() || btn.id;

        var item = document.createElement('button');
        item.className = 'overflow-item';
        item.id = 'overflow-' + btn.id;
        item.innerHTML = '<span class="overflow-icon">' + iconHTML + '</span><span class="overflow-label">' + label + '</span>';

        item.addEventListener('click', function(e) {
            e.stopPropagation();
            btn.click();
            dropdown.classList.remove('open');
        });

        dropdown.appendChild(item);

        // Force hide with both inline style and CSS class (belt and suspenders)
        btn.style.setProperty('display', 'none', 'important');
        btn.classList.add('overflow-hidden-btn');
    }

    // Scan all children of #leftcontrols and move non-visible ones
    function scanAndMoveButtons() {
        var children = leftControls.children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.id === 'overflow-menu-wrap') continue;
            if (keepVisible[child.id]) continue;

            // Accept any element that looks like a button
            var isButton = (child.tagName === 'BUTTON') ||
                           (child.classList && child.classList.contains('btn')) ||
                           (child.tagName === 'A' && child.classList && child.classList.contains('btn'));
            if (!isButton) continue;

            moveButtonToOverflow(child);
        }

        // Also explicitly target known IDs that may use non-standard elements
        var explicitIds = ['newpollbtn', 'voteskip', 'afk-btn', 'clear-btn'];
        for (var j = 0; j < explicitIds.length; j++) {
            var el = document.getElementById(explicitIds[j]);
            if (el) moveButtonToOverflow(el);
        }
    }

    // Run initial scan
    scanAndMoveButtons();

    // Watch for buttons added later by external scripts (e.g. NND toggle)
    var controlsObserver = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var added = mutations[i].addedNodes;
            for (var j = 0; j < added.length; j++) {
                var node = added[j];
                if (node.nodeType !== 1) continue;
                if (node.id === 'overflow-menu-wrap') continue;
                if (node.classList && (node.classList.contains('btn') || node.tagName === 'BUTTON')) {
                    if (!keepVisible[node.id]) {
                        // Small delay so the button fully initializes
                        setTimeout(function(n) { moveButtonToOverflow(n); }, 100, node);
                    }
                }
            }
        }
    });
    controlsObserver.observe(leftControls, { childList: true });

    // Also retry after a delay to catch any Cytube-native buttons that appear late
    setTimeout(scanAndMoveButtons, 2000);
    setTimeout(scanAndMoveButtons, 5000);
  } catch (e) {
    console.error('[OverflowMenu] Init error (non-fatal):', e);
  }
})();

// Helper to add a button to the overflow menu (used by later-initialized features)
function addToOverflowMenu(id, iconHTML, label, onClick) {
    var dropdown = document.getElementById('overflow-menu-dropdown');
    if (!dropdown) return false;

    // Don't add duplicates
    if (document.getElementById('overflow-' + id)) return true;

    var item = document.createElement('button');
    item.className = 'overflow-item';
    item.id = 'overflow-' + id;
    item.innerHTML = '<span class="overflow-icon">' + iconHTML + '</span><span class="overflow-label">' + label + '</span>';

    item.addEventListener('click', function(e) {
        e.stopPropagation();
        onClick(e);
        dropdown.classList.remove('open');
    });

    dropdown.appendChild(item);
    return true;
}

$(document).ready(function() {
    initStyleInterceptor();
    initUsernameStyleInterceptor();
    updateFontBtnIndicator();

    // Fix userlist display - with delay to ensure elements exist
    setTimeout(fixUserlistLayout, 1500);

    // Name Color button removal is handled by MutationObserver at top of file
});

function fixUserlistLayout() {
    // Add CSS for our custom dropdown
    $('<style id="userlist-dropdown-style">').text(`
        #userlist-dropdown {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            max-height: 50vh;
            overflow-y: auto;
            overflow-x: hidden;
            background: #1a1a1a;
            padding: 5px;
            z-index: 99999;
            border: 1px solid #333;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            flex-direction: column;
            gap: 2px;
        }
        #userlist-dropdown.open {
            display: flex;
        }
        /* Show ALL user types */
        #userlist-dropdown .userlist_item,
        #userlist-dropdown .userlist_item.userlist_afk,
        #userlist-dropdown .userlist_item.userlist_guest,
        #userlist-dropdown .userlist_item.userlist_anon,
        #userlist-dropdown .userlist_item.userlist_owner,
        #userlist-dropdown .userlist_item.userlist_mod,
        #userlist-dropdown .userlist_item.userlist_admin {
            display: flex !important;
            flex-shrink: 0;
            padding: 6px 10px;
            background: #2a2a2a;
            border-radius: 3px;
            width: 100%;
            box-sizing: border-box;
            cursor: pointer;
        }
        #userlist-dropdown .userlist_item:hover {
            background: #444;
        }
        /* Hide the inline user-dropdown since we'll use floating panel */
        #userlist-dropdown .user-dropdown {
            display: none !important;
        }
        #chatheader {
            position: relative;
            cursor: pointer;
        }
        /* Hide original userlist */
        #userlist {
            display: none !important;
        }
        
        /* Floating user options panel */
        #user-options-panel {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1e1e24;
            border: 1px solid #444;
            border-radius: 8px;
            padding: 0;
            z-index: 999999;
            min-width: 200px;
            max-width: 90vw;
            box-shadow: 0 8px 32px rgba(0,0,0,0.7);
        }
        #user-options-panel.open {
            display: block;
        }
        #user-options-panel .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            background: #2a2a30;
            border-bottom: 1px solid #444;
            border-radius: 8px 8px 0 0;
            cursor: move;
        }
        #user-options-panel .panel-header span {
            font-weight: bold;
            color: #fff;
        }
        #user-options-panel .panel-close {
            background: none;
            border: none;
            color: #888;
            font-size: 20px;
            cursor: pointer;
            padding: 0 5px;
        }
        #user-options-panel .panel-close:hover {
            color: #fff;
        }
        #user-options-panel .panel-body {
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        #user-options-panel .panel-body .btn {
            display: block;
            width: 100%;
            padding: 8px 12px;
            text-align: left;
            background: #333;
            border: 1px solid #444;
            color: #ddd;
            border-radius: 4px;
            cursor: pointer;
        }
        #user-options-panel .panel-body .btn:hover {
            background: #444;
            color: #fff;
        }
        
        /* Overlay behind panel */
        #user-options-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999998;
        }
        #user-options-overlay.open {
            display: block;
        }
    `).appendTo('head');
    
    // Create overlay and floating panel
    $('<div id="user-options-overlay">').appendTo('body').on('click', closeUserOptionsPanel);
    $('<div id="user-options-panel"><div class="panel-header"><span id="panel-username">User</span><button class="panel-close">&times;</button></div><div class="panel-body"></div></div>').appendTo('body');
    $('#user-options-panel .panel-close').on('click', closeUserOptionsPanel);
    
    // Create our dropdown container
    var $dropdown = $('<div id="userlist-dropdown">').appendTo('#chatheader');
    
    function closeUserOptionsPanel() {
        $('#user-options-panel').removeClass('open');
        $('#user-options-overlay').removeClass('open');
    }
    
    function openUserOptionsPanel(username, $clonedDropdown) {
        var $panel = $('#user-options-panel');
        var $body = $panel.find('.panel-body');
        
        // Set username in header
        $panel.find('#panel-username').text(username);
        
        // Find the ORIGINAL userlist item in #userlist (not our clone)
        var $origItem = null;
        $('#userlist .userlist_item').each(function() {
            var $item = $(this);
            var name = $item.find('.userlist_owner').text().trim();
            if (!name) {
                // Try other span elements
                $item.find('span').each(function() {
                    var txt = $(this).text().trim();
                    if (txt && !$(this).hasClass('glyphicon') && txt.length > 0) {
                        name = txt;
                        return false;
                    }
                });
            }
            if (name === username) {
                $origItem = $item;
                return false;
            }
        });
        
        $body.empty();
        
        // Use original item's dropdown if found, otherwise use the cloned one
        var $dropdown = $origItem ? $origItem.find('.user-dropdown') : $clonedDropdown;
        
        if (!$dropdown || $dropdown.length === 0) {
            $body.append('<div style="color:#888;padding:10px;text-align:center;">No options available</div>');
            $('#user-options-overlay').addClass('open');
            $panel.addClass('open');
            return;
        }
        
        // Get all buttons from the dropdown
        var $buttons = $dropdown.find('button');
        
        if ($buttons.length === 0) {
            $body.append('<div style="color:#888;padding:10px;text-align:center;">No options available</div>');
            $('#user-options-overlay').addClass('open');
            $panel.addClass('open');
            return;
        }
        
        $buttons.each(function() {
            var $origBtn = $(this);
            var btnText = $origBtn.text().trim();
            
            // Skip if button is hidden or has no text
            if (!btnText) return;
            var style = window.getComputedStyle(this);
            if (style.display === 'none' || style.visibility === 'hidden') return;
            
            var $newBtn = $('<button class="btn">').text(btnText);
            $newBtn.on('click', function() {
                // Click the ORIGINAL button
                $origBtn[0].click();
                closeUserOptionsPanel();
            });
            $body.append($newBtn);
        });
        
        // If still no buttons after filtering, show message
        if ($body.children().length === 0) {
            $body.append('<div style="color:#888;padding:10px;text-align:center;">No options available</div>');
        }
        
        // Show panel
        $('#user-options-overlay').addClass('open');
        $panel.addClass('open');
    }
    
    // Function to update dropdown content
    function updateDropdownContent() {
        // Clone ALL children from userlist, including all user types
        var $clone = $('#userlist').children().clone(true);
        // Make sure all items are visible
        $clone.css('display', 'flex');
        $dropdown.empty().append($clone);
        
        // Add click handlers to each user item
        $dropdown.find('.userlist_item').each(function() {
            var $item = $(this);
            var $userDropdown = $item.find('.user-dropdown');
            var username = $item.find('.userlist_owner').text().trim() || $item.find('span').last().text().trim();
            
            // Click on user name to open floating panel
            $item.on('click', function(e) {
                e.stopPropagation();
                openUserOptionsPanel(username, $userDropdown);
            });
        });
    }
    
    // Initial population
    updateDropdownContent();
    
    // Update periodically in case users join/leave
    var _userlistIntervalId = setInterval(updateDropdownContent, 5000);
    
    // Toggle on chatheader click (but not on dropdown or user items)
    $('#chatheader').on('click', function(e) {
        // Only toggle if clicking directly on chatheader area, not on dropdown content
        if (!$(e.target).closest('#userlist-dropdown').length) {
            $dropdown.toggleClass('open');
            if ($dropdown.hasClass('open')) {
                updateDropdownContent();
            }
        }
    });
    
    // Close when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#chatheader').length) {
            $dropdown.removeClass('open');
        }
    });
}

/* ========== AUTOCOMPLETE FOR EMOTES ========== */
var autocompleteArr = [];

function emotesPanel() {
    autocompleteArr = [];
    var len = CHANNEL.emotes.length;
    if (len < 1) {
        console.log('No emotes found, reloading in 1 second');
        setTimeout(emotesPanel, 1000);
    } else {
        for (var i in CHANNEL.emotes) {
            autocompleteArr.push({"name": CHANNEL.emotes[i].name, "image": CHANNEL.emotes[i].image});
        }
        autocompleteArr.sort(function(a, b) { return a.name.localeCompare(b.name); });
        if (!window.matchMedia("(max-width: 768px)").matches) {
            autocomplete(document.getElementById("chatline"), autocompleteArr);
        }
    }
}
emotesPanel();

function autocomplete(inp, arr) {
    var currentFocus;
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) return false;
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        a.style.bottom = ($('#rightcontent > form').outerHeight() + $('#leftcontrols').outerHeight()) + 'px';
        this.parentNode.appendChild(a);
        $("#autocomplete-list").insertBefore(document.querySelectorAll('form')[1]);
        var matched = document.getElementById("chatline").value.match(/(?<!\S)\/\S*$/gim);
        if (!matched) return;
        matched = matched.toString();
        var matchedNoSlash = matched.substring(1);
        for (i = 0; i < arr.length; i++) {
            if (arr[i].name.substr(0, matched.length).toUpperCase() == matched.toUpperCase()) {
                b = document.createElement("DIV");
                b.innerHTML = "<strong>" + arr[i].name.substr(0, matched.length) + "</strong>" + arr[i].name.substr(matched.length);
                b.innerHTML += "<input type='hidden' value='" + arr[i].name + "'><img id='autocomplete-image' src='" + arr[i].image + "'>";
                b.addEventListener("click", function(e) {
                    var m = $("#chatline").val().match(/(?<!\S)\/\S*$/gim);
                    if (m) $("#chatline").val($("#chatline").val().substring(0, $("#chatline").val().length - m.toString().length) + this.getElementsByTagName("input")[0].value);
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
        if (!document.getElementById("autocomplete-list").childNodes.length) closeAllLists();
    });
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById("autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) { currentFocus++; addActive(x); e.preventDefault(); }
        else if (e.keyCode == 38) { currentFocus--; addActive(x); e.preventDefault(); }
        else if (e.keyCode == 9 && document.getElementById("autocomplete-list") && document.getElementById("autocomplete-list").childNodes.length >= 1) {
            e.preventDefault();
            if (currentFocus < 0) currentFocus = 0;
            if (x) x[currentFocus].click();
        }
    });
    function addActive(x) {
        if (!x) return;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = x.length - 1;
        x[currentFocus].classList.add("autocomplete-active");
        x[currentFocus].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    function removeActive(x) { for (var i = 0; i < x.length; i++) x[i].classList.remove("autocomplete-active"); }
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) if (elmnt != x[i] && elmnt != inp) x[i].parentNode.removeChild(x[i]);
    }
    document.addEventListener("click", function(e) { closeAllLists(e.target); });
}

/* ========== REPLY SYSTEM ========== */
var md5=function(d){var r=M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}

function formatChatMsg(data, last) {
    if (!data.msg || data.meta.addClass == "shout") return;
    var msghtml = data.msg;
    if (data.username) {
        var dateObj = new Date(data.time);
        var formattedString = dateObj.toLocaleTimeString('en-US');
        var id = md5(data.username + msghtml + formattedString);
        if (document.querySelectorAll("#chat-msg-" + id).length >= 1) return;
        last.attr("id", "chat-msg-" + id);
        var replyWrap = '';
        var replyMsgWrap = '';
        if (typeof data.meta.reply !== 'undefined') {
            var replySource = document.getElementById("chat-msg-" + data.meta.reply);
            if (replySource) {
                var replyTarget = replySource.getElementsByClassName('username')[0];
                var replySourceMsgE = replySource.querySelectorAll('span');
                var replySourceMsg = replySourceMsgE[replySourceMsgE.length - 1];
                replyWrap = '<div class="reply" onclick="scrollReply(\'chat-msg-' + data.meta.reply + '\')"><div class="reply-header">' + (replyTarget ? replyTarget.innerHTML : 'Unknown') + '</div><div class="reply-msg">' + (replySourceMsg ? replySourceMsg.innerHTML : '') + '</div></div>';
            }
        }
        if (data.meta.addClass != 'action' && data.meta.addClass != 'drink' && data.meta.addClass != 'greentext' && data.meta.addClass != 'spoiler') {
            replyMsgWrap = '<button class="reply-button" onclick="replyToMsg(\'' + id + '\')"><i class="reply-icon"></i></button>';
        }
        $(replyWrap).prependTo("#chat-msg-" + id);
        $(replyMsgWrap).appendTo("#chat-msg-" + id);
    }
}

function scrollReply(target) {
    var source = document.getElementById(target);
    if (!source) {
        source = document.getElementById('chat-msg-' + target);
    }
    if (source) {
        source.scrollIntoView({ behavior: "smooth", block: "center" });
        // Highlight effect
        source.style.transition = 'background-color 0.3s';
        source.style.backgroundColor = 'rgba(143, 100, 9, 0.4)';
        setTimeout(function() {
            source.style.backgroundColor = '';
        }, 1500);
    }
}

// Add reply buttons to existing messages (for messages that existed before joining)
function addReplyButtonsToExistingMessages() {
    $('#messagebuffer > div').each(function() {
        var $msg = $(this);
        // Skip if already has a reply button
        if ($msg.find('.reply-button').length > 0) return;
        // Skip special message types
        if ($msg.hasClass('action') || $msg.hasClass('drink') || $msg.hasClass('greentext') || $msg.hasClass('spoiler')) return;
        // Skip if no username (system messages)
        var $username = $msg.find('.username');
        if ($username.length === 0) return;

        // Generate ID if not present
        var msgId = $msg.attr('id');
        if (!msgId || !msgId.startsWith('chat-msg-')) {
            var username = $username.text().replace(/:$/, '').trim();
            var msgText = $msg.text();
            var timestamp = Date.now().toString();
            msgId = 'chat-msg-' + md5(username + msgText + timestamp);
            $msg.attr('id', msgId);
        }

        var id = msgId.replace('chat-msg-', '');
        var replyBtn = '<button class="reply-button" onclick="replyToMsg(\'' + id + '\')"><i class="reply-icon"></i></button>';
        $msg.append(replyBtn);
    });
}

// Store the current reply target
var currentReplyTarget = null;
var currentReplyData = null;

// Color cycling for replies - colors are assigned to ORIGINAL messages being replied to
// All replies to the same message share the same color
var replyColorCounter = 0; // Cycles through 0-11
var REPLY_COLORS_COUNT = 12;

// Get the next color in the cycle
function getNextReplyColor() {
    var color = replyColorCounter;
    replyColorCounter = (replyColorCounter + 1) % REPLY_COLORS_COUNT;
    return color;
}

// Get the color class from an element (returns number or -1 if none)
function getReplyColorFromElement(el) {
    if (!el) return -1;
    for (var i = 0; i < REPLY_COLORS_COUNT; i++) {
        if (el.classList.contains('reply-color-' + i)) {
            return i;
        }
    }
    return -1;
}

// Get existing style codes from an element (animation, border, radius)
// Returns object with animCode, borderCode, radiusCode (or null if not found)
function getReplyStyleFromElement(el) {
    if (!el) return null;

    var result = { animCode: '0', borderCode: '0', radiusCode: '0', hasStyle: false };

    // Animation codes: g=glow, p=pulse, s=shimmer, b=breathe, w=rainbow, n=neon, f=flash, l=slide
    var animClasses = {
        'reply-anim-glow': 'g',
        'reply-anim-pulse': 'p',
        'reply-anim-shimmer': 's',
        'reply-anim-breathe': 'b',
        'reply-anim-rainbow': 'w',
        'reply-anim-neon': 'n',
        'reply-anim-flash': 'f',
        'reply-anim-slide': 'l'
    };
    for (var cls in animClasses) {
        if (el.classList.contains(cls)) {
            result.animCode = animClasses[cls];
            result.hasStyle = true;
            break;
        }
    }

    // Border style codes: t=thick, d=double, o=dotted, a=dashed
    var borderClasses = {
        'reply-border-thick': 't',
        'reply-border-double': 'd',
        'reply-border-dotted': 'o',
        'reply-border-dashed': 'a'
    };
    for (var cls in borderClasses) {
        if (el.classList.contains(cls)) {
            result.borderCode = borderClasses[cls];
            result.hasStyle = true;
            break;
        }
    }

    // Border radius codes: r=rounded, p=pill
    if (el.classList.contains('reply-rounded')) {
        result.radiusCode = 'r';
        result.hasStyle = true;
    } else if (el.classList.contains('reply-pill')) {
        result.radiusCode = 'p';
        result.hasStyle = true;
    }

    return result;
}

// Find reply-target messages from a specific user (most recent first)
function findReplyTargetForUser(username) {
    if (!username) return null;
    var cleanName = username.toLowerCase().trim();
    var targets = document.querySelectorAll('.reply-target');
    for (var i = targets.length - 1; i >= 0; i--) {
        var target = targets[i];
        var usernameEl = target.querySelector('.username');
        if (usernameEl) {
            var targetUser = usernameEl.textContent.replace(/:?\s*$/, '').trim().toLowerCase();
            if (targetUser === cleanName) {
                return target;
            }
        }
    }
    return null;
}

function replyToMsg(target) {
    // Handle both "chat-msg-123" and just "123" formats
    currentReplyTarget = target.replace('chat-msg-', '');

    // Get the message element
    var sourceEl = document.getElementById('chat-msg-' + currentReplyTarget);
    if (!sourceEl) {
        sourceEl = document.getElementById(target);
    }

    if (!sourceEl) {
        console.log('[Reply] Could not find message element:', target);
        return;
    }

    // Try multiple selectors to find username
    var usernameEl = sourceEl.querySelector('.username');
    if (!usernameEl) usernameEl = sourceEl.querySelector('[class*="username"]');
    if (!usernameEl) usernameEl = sourceEl.querySelector('span.nick');
    if (!usernameEl) usernameEl = sourceEl.querySelector('.nick');

    var usernameHtml = 'Unknown';
    var usernameText = 'Unknown';

    if (usernameEl) {
        usernameHtml = usernameEl.innerHTML.replace(/:?\s*$/, '');
        usernameText = usernameEl.textContent.replace(/:?\s*$/, '').trim();
    } else {
        // Fallback: try to get username from first strong/bold element
        var boldEl = sourceEl.querySelector('strong, b');
        if (boldEl) {
            usernameText = boldEl.textContent.replace(/:?\s*$/, '').trim();
            usernameHtml = boldEl.innerHTML.replace(/:?\s*$/, '');
        }
    }

    console.log('[Reply] Found username:', usernameText);

    // Extract message text - try multiple approaches
    var msgText = '';
    var msgSpans = sourceEl.querySelectorAll('span:not(.username):not(.timestamp):not([class*="username"])');
    if (msgSpans.length > 0) {
        msgText = msgSpans[msgSpans.length - 1].textContent.substring(0, 60);
    }
    if (!msgText) {
        // Fallback: get text content after username
        var fullText = sourceEl.textContent;
        var colonIndex = fullText.indexOf(':');
        if (colonIndex !== -1) {
            msgText = fullText.substring(colonIndex + 1).trim().substring(0, 60);
        }
    }

    currentReplyData = {
        targetId: currentReplyTarget,
        usernameHtml: usernameHtml,
        usernameText: usernameText,
        msgPreview: msgText
    };

    // Highlight the original message
    sourceEl.classList.add('reply-source-highlight');

    // Show reply indicator
    showReplyIndicator();

    // Focus chat input
    var chatline = document.getElementById('chatline');
    if (chatline) chatline.focus();
}

function showReplyIndicator() {
    if (!currentReplyData) return;

    var indicator = document.getElementById('reply-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'reply-indicator';
        var form = document.getElementById('formline');
        if (form) {
            form.insertBefore(indicator, form.firstChild);
        }
    }
    indicator.innerHTML = '<div class="reply-indicator-content" onclick="scrollReply(\'' + currentReplyData.targetId + '\')">' +
        '<span class="reply-indicator-icon">↩</span>' +
        '<span class="reply-indicator-user">' + currentReplyData.usernameHtml + '</span>' +
        '<span class="reply-indicator-msg">' + currentReplyData.msgPreview + '</span>' +
        '</div><button class="reply-indicator-close" onclick="cancelReply()">×</button>';
    indicator.style.display = 'flex';
}

function cancelReply() {
    // Remove highlight from source message
    if (currentReplyTarget) {
        var sourceEl = document.getElementById('chat-msg-' + currentReplyTarget);
        if (sourceEl) sourceEl.classList.remove('reply-source-highlight');
    }

    currentReplyTarget = null;
    currentReplyData = null;
    var indicator = document.getElementById('reply-indicator');
    if (indicator) indicator.style.display = 'none';
}

// Initialize reply system - prepend text marker to message
function initReplySystem() {
    var form = document.getElementById('formline');
    var chatline = document.getElementById('chatline');
    if (!form || !chatline) {
        setTimeout(initReplySystem, 500);
        return;
    }

    console.log('[Reply] System initialized');

    // Prepend reply marker before message is sent
    function prependReplyMarker() {
        if (currentReplyData && chatline.value.trim()) {
            // Get or assign a color for this reply thread
            var sourceMsg = document.getElementById('chat-msg-' + currentReplyData.targetId);
            var colorIndex = -1;
            var existingChainStyle = null; // Track existing chain styling (color + effects)
            var msgId = currentReplyData.targetId || '';

            if (sourceMsg) {
                sourceMsg.classList.add('reply-target');
                // Check if it already has a color (from being replied to OR from being a reply itself)
                colorIndex = getReplyColorFromElement(sourceMsg);
                if (colorIndex !== -1) {
                    // Chain already has a color - preserve it and check for other styles
                    existingChainStyle = getReplyStyleFromElement(sourceMsg) || { animCode: '0', borderCode: '0', radiusCode: '0', hasStyle: false };
                    existingChainStyle.colorIndex = colorIndex;
                } else {
                    // Assign a new color
                    colorIndex = getNextReplyColor();
                    sourceMsg.classList.add('reply-color-' + colorIndex);
                }
            } else {
                // No source message found, assign a color anyway
                colorIndex = getNextReplyColor();
            }

            // Build style code if custom styling is enabled OR if preserving existing chain style
            // Format: XYZ where X=animation, Y=border style, Z=border radius
            // Uses 0 for "none/default"
            // Color is determined by the main color index (first number in marker)
            var styleCode = '';
            var customColorIndex = colorIndex; // Default to cycling color
            var animCode = '0';
            var borderCode = '0';
            var radiusCode = '0';

            // If chain already has styling, preserve it
            if (existingChainStyle) {
                animCode = existingChainStyle.animCode;
                borderCode = existingChainStyle.borderCode;
                radiusCode = existingChainStyle.radiusCode;
                customColorIndex = existingChainStyle.colorIndex;
                // Build style code if chain has any styling
                if (existingChainStyle.hasStyle) {
                    styleCode = ':' + animCode + borderCode + radiusCode;
                }
            } else if (replyStyleSettings.enabled) {
                // New chain - use user's custom styling
                // Animation codes: g=glow, p=pulse, s=shimmer, b=breathe, w=rainbow, n=neon, f=flash, l=slide
                var animMap = {glow:'g', pulse:'p', shimmer:'s', breathe:'b', rainbow:'w', neon:'n', flash:'f', slide:'l'};
                if (replyStyleSettings.animation && animMap[replyStyleSettings.animation]) {
                    animCode = animMap[replyStyleSettings.animation];
                }

                // Border style codes: t=thick, d=double, o=dotted, a=dashed
                var borderMap = {thick:'t', double:'d', dotted:'o', dashed:'a'};
                if (replyStyleSettings.borderStyle && borderMap[replyStyleSettings.borderStyle]) {
                    borderCode = borderMap[replyStyleSettings.borderStyle];
                }

                // Border radius codes: r=rounded, p=pill
                var radiusMap = {rounded:'r', pill:'p'};
                if (replyStyleSettings.borderRadius && radiusMap[replyStyleSettings.borderRadius]) {
                    radiusCode = radiusMap[replyStyleSettings.borderRadius];
                }

                // Find which preset color the user selected to use as the main color index
                var presetColors = ['#8F6409','#0D8F8F','#7B4B9E','#A34D4D','#4A8F4A','#4A6FA5','#9E4B7B','#B37400','#3D9EAA','#6B8F2E','#B36666','#5B5BAA'];
                var userColor = (replyStyleSettings.borderColor || '#8F6409').toUpperCase();
                var userColorIdx = presetColors.findIndex(function(c) { return c.toUpperCase() === userColor; });
                if (userColorIdx >= 0) {
                    customColorIndex = userColorIdx;
                }

                styleCode = ':' + animCode + borderCode + radiusCode;
            }

            // Create marker - use existing chain style if present, otherwise use custom/cycling
            // Format: ▶colorNum:msgId:styleCode @username:
            var finalColorIndex = existingChainStyle ? existingChainStyle.colorIndex : (replyStyleSettings.enabled ? customColorIndex : colorIndex);
            var colorNum = finalColorIndex + 1; // 1-indexed for display
            var shortId = msgId.substring(0, 6); // First 6 chars of message ID
            var marker = '▶' + colorNum + ':' + shortId + styleCode + ' @' + currentReplyData.usernameText + ': ';

            // Only add if not already there
            if (!chatline.value.startsWith('▶')) {
                chatline.value = marker + chatline.value;
            }

            console.log('[Reply] Added marker:', marker);
            cancelReply();
        }
    }

    // Intercept Enter key - capture phase to run before Cytube
    chatline.addEventListener('keydown', function(e) {
        if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey) {
            prependReplyMarker();
        }
    }, true);

    // Also hook form submit
    form.addEventListener('submit', function(e) {
        prependReplyMarker();
    }, true);

    // Watch for new messages and style reply messages with color cycling
    function styleReplyMessages() {
        // Maps to decode style codes from marker
        var animDecode = {g:'glow', p:'pulse', s:'shimmer', b:'breathe', w:'rainbow', n:'neon', f:'flash', l:'slide'};
        var borderDecode = {t:'thick', d:'double', o:'dotted', a:'dashed'};
        var radiusDecode = {r:'rounded', p:'pill'};
        // Preset colors for decoding color index
        var presetColors = ['#8F6409','#0D8F8F','#7B4B9E','#A34D4D','#4A8F4A','#4A6FA5','#9E4B7B','#B37400','#3D9EAA','#6B8F2E','#B36666','#5B5BAA'];

        $('#messagebuffer > div').each(function() {
            var $msg = $(this);
            // Check if already processed
            if ($msg.hasClass('is-reply-message') || $msg.data('reply-checked')) return;
            $msg.data('reply-checked', true);

            // Check if message contains reply marker
            var text = $msg.text();
            if (text.indexOf('▶') !== -1 && text.indexOf('@') !== -1) {
                $msg.addClass('is-reply-message');

                var colorIndex = -1;
                var replyToUser = null;
                var msgIdShort = null;
                var styleCode = null;

                // Try format with style: ▶1:abc123:b00a or ▶1:abc123:b00xFFFFFF @username:
                // Use permissive regex, parse style code in code
                var styledMatch = text.match(/▶(\d+):([a-zA-Z0-9]+):([a-zA-Z0-9]+)\s*@([^:]+):/);
                if (styledMatch && styledMatch[1]) {
                    colorIndex = parseInt(styledMatch[1], 10) - 1;
                    if (colorIndex < 0 || colorIndex >= REPLY_COLORS_COUNT) {
                        colorIndex = -1;
                    }
                    msgIdShort = styledMatch[2] || null;
                    styleCode = styledMatch[3] || null;
                    replyToUser = styledMatch[4] ? styledMatch[4].trim() : null;
                    console.log('[Reply] Parsed styleCode:', styleCode, 'from message');
                }

                // Fallback: format without style ▶1:abc123 @username: (color + message ID)
                if (colorIndex === -1) {
                    var idMatch = text.match(/▶(\d+):([a-zA-Z0-9]+)\s*@([^:]+):/);
                    if (idMatch && idMatch[1]) {
                        colorIndex = parseInt(idMatch[1], 10) - 1;
                        if (colorIndex < 0 || colorIndex >= REPLY_COLORS_COUNT) {
                            colorIndex = -1;
                        }
                        msgIdShort = idMatch[2] || null;
                        replyToUser = idMatch[3] ? idMatch[3].trim() : null;
                    }
                }

                // Fallback: format without ID ▶1 @username:
                if (colorIndex === -1) {
                    var newMatch = text.match(/▶(\d+)\s*@([^:]+):/);
                    if (newMatch && newMatch[1]) {
                        colorIndex = parseInt(newMatch[1], 10) - 1;
                        if (colorIndex < 0 || colorIndex >= REPLY_COLORS_COUNT) {
                            colorIndex = -1;
                        }
                        replyToUser = newMatch[2] ? newMatch[2].trim() : null;
                    }
                }

                // Fallback: old format ▶ @username:
                if (colorIndex === -1) {
                    var oldMatch = text.match(/▶\s*@([^:]+):/);
                    if (oldMatch && oldMatch[1]) {
                        replyToUser = oldMatch[1].trim();
                        var originalMsg = findReplyTargetForUser(replyToUser);
                        if (originalMsg) {
                            colorIndex = getReplyColorFromElement(originalMsg);
                        }
                    }
                }

                // If still no color found, assign a new one
                if (colorIndex === -1) {
                    colorIndex = getNextReplyColor();
                }

                // Determine if custom styling should be applied
                // Priority: 1) Style code from marker (visible to all), 2) Local settings for own messages
                var msgUsername = $msg.find('.username').text().replace(/:?\s*$/, '').trim();
                var currentUser = (typeof CLIENT !== 'undefined' && CLIENT.name) ? CLIENT.name : null;
                var isOwnMessage = currentUser && msgUsername.toLowerCase() === currentUser.toLowerCase();

                // Decode style from marker (applies to ALL users viewing the message)
                // Style code is 3 chars: animation, border style, border radius
                // Color comes from the main colorIndex in the marker (first number)
                var markerAnim = null, markerBorder = null, markerRadius = null;
                if (styleCode && styleCode.length >= 3) {
                    markerAnim = animDecode[styleCode[0]] || null;
                    markerBorder = borderDecode[styleCode[1]] || null;
                    markerRadius = radiusDecode[styleCode[2]] || null;
                }

                // Check if style code indicates custom styling (has any non-zero values in first 3 chars)
                var hasMarkerStyle = styleCode && styleCode.length >= 3 && !/^0{3}/.test(styleCode);

                // Use marker style if present, otherwise fall back to local settings for own messages
                var useCustom = hasMarkerStyle || (isOwnMessage && replyStyleSettings.enabled);

                var animToApply = markerAnim || (isOwnMessage && replyStyleSettings.enabled ? replyStyleSettings.animation : null);
                var borderToApply = markerBorder || (isOwnMessage && replyStyleSettings.enabled ? replyStyleSettings.borderStyle : null);
                var radiusToApply = markerRadius || (isOwnMessage && replyStyleSettings.enabled ? replyStyleSettings.borderRadius : null);

                // Color comes from the colorIndex (first number in marker) - use preset colors
                var colorToApply = null;
                if (useCustom && colorIndex >= 0 && colorIndex < presetColors.length) {
                    colorToApply = presetColors[colorIndex];
                }

                // Always add the color class for chain detection (even with custom styling)
                $msg.addClass('reply-color-' + colorIndex);

                if (useCustom) {
                    $msg.addClass('reply-custom');
                    // Add animation class if set
                    if (animToApply) {
                        $msg.addClass('reply-anim-' + animToApply);
                    }
                    // Add border style class if set
                    if (borderToApply) {
                        $msg.addClass('reply-border-' + borderToApply);
                    }
                    // Add border radius class if set
                    if (radiusToApply) {
                        $msg.addClass('reply-' + radiusToApply);
                    }
                    // Apply color from preset (derived from colorIndex in marker)
                    if (colorToApply) {
                        var r = parseInt(colorToApply.slice(1,3), 16);
                        var g = parseInt(colorToApply.slice(3,5), 16);
                        var b = parseInt(colorToApply.slice(5,7), 16);
                        var bgRgba = 'rgba(' + r + ',' + g + ',' + b + ',0.15)';
                        $msg[0].style.setProperty('--custom-reply-color', colorToApply);
                        $msg[0].style.setProperty('--custom-reply-bg', bgRgba);
                        $msg[0].style.setProperty('--custom-reply-glow-color', colorToApply);
                        $msg[0].style.borderLeftColor = colorToApply;
                        $msg[0].style.background = bgRgba;
                    }
                }

                // Hide the reply marker text from the message
                var msgEl = $msg[0];
                var walker = document.createTreeWalker(msgEl, NodeFilter.SHOW_TEXT, null, false);
                var node;
                while (node = walker.nextNode()) {
                    // Match reply marker patterns and replace
                    var nodeText = node.textContent;
                    // Pattern: ▶11:abc123:btr @username: or ▶1:abc123 @username: or ▶1 @username: or ▶ @username:
                    // Use \d+ to match 1 or 2 digit color numbers (1-12)
                    var markerMatch = nodeText.match(/▶\d*:?[a-zA-Z0-9]*:?[a-zA-Z0-9]*\s*@[^:]+:/);
                    if (markerMatch) {
                        node.textContent = nodeText.replace(/▶\d*:?[a-zA-Z0-9]*:?[a-zA-Z0-9]*\s*@[^:]+:\s*/, '');
                    }
                }

                // Also mark the original message being replied to (for other users)
                // Pass the decoded styles so original message gets same styling
                markOriginalMessage(msgIdShort, replyToUser, colorIndex, useCustom, animToApply, borderToApply, radiusToApply, colorToApply);
            }
        });
    }

    // Find and mark the original message being replied to
    function markOriginalMessage(msgIdShort, username, colorIndex, useCustom, animStyle, borderStyle, radiusStyle, colorStyle) {
        var colorClass = 'reply-color-' + colorIndex;

        // Helper to remove all reply color classes from an element
        function removeColorClasses(msgEl) {
            for (var i = 0; i < 12; i++) {
                msgEl.classList.remove('reply-color-' + i);
            }
        }

        // Helper to apply custom classes to a message element
        function applyCustomClasses(msgEl) {
            msgEl.classList.add('reply-target');
            // Always add color class for chain detection (even with custom styling)
            msgEl.classList.add(colorClass);

            if (useCustom) {
                msgEl.classList.add('reply-custom');
                // Use passed-in styles (from marker) which are visible to all users
                if (animStyle) {
                    msgEl.classList.add('reply-anim-' + animStyle);
                }
                if (borderStyle) {
                    msgEl.classList.add('reply-border-' + borderStyle);
                }
                if (radiusStyle) {
                    msgEl.classList.add('reply-' + radiusStyle);
                }
                // Apply color directly as inline style (so all users see same color)
                if (colorStyle) {
                    var r = parseInt(colorStyle.slice(1,3), 16);
                    var g = parseInt(colorStyle.slice(3,5), 16);
                    var b = parseInt(colorStyle.slice(5,7), 16);
                    var bgRgba = 'rgba(' + r + ',' + g + ',' + b + ',0.15)';
                    msgEl.style.setProperty('--custom-reply-color', colorStyle);
                    msgEl.style.setProperty('--custom-reply-bg', bgRgba);
                    msgEl.style.setProperty('--custom-reply-glow-color', colorStyle);
                    msgEl.style.borderLeftColor = colorStyle;
                    msgEl.style.background = bgRgba;
                }
            }
        }

        // First try: find by message ID (most reliable)
        if (msgIdShort) {
            var messages = document.querySelectorAll('#messagebuffer > div[id^="chat-msg-"]');
            for (var i = 0; i < messages.length; i++) {
                var msg = messages[i];
                var fullId = msg.id.replace('chat-msg-', '');
                // Check if the ID starts with our short ID
                if (fullId.substring(0, msgIdShort.length) === msgIdShort) {
                    // Always apply if useCustom, otherwise only if not already styled
                    if (useCustom || !msg.classList.contains('reply-target')) {
                        applyCustomClasses(msg);
                    }
                    return; // Found exact match by ID
                }
            }
        }

        // Fallback: find by username (for old format or if ID not found)
        if (!username) return;
        var cleanName = username.toLowerCase().trim();
        var messages = document.querySelectorAll('#messagebuffer > div');
        for (var i = messages.length - 1; i >= 0; i--) {
            var msg = messages[i];
            if (msg.classList.contains('is-reply-message')) continue;

            var usernameEl = msg.querySelector('.username');
            if (usernameEl) {
                var msgUser = usernameEl.textContent.replace(/:?\s*$/, '').trim().toLowerCase();
                if (msgUser === cleanName) {
                    // Always apply if useCustom, otherwise only if not already styled
                    if (useCustom || !msg.classList.contains('reply-target')) {
                        applyCustomClasses(msg);
                    }
                    return;
                }
            }
        }
    }

    // Run on existing messages
    styleReplyMessages();

    // Watch for new messages
    var replyObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(styleReplyMessages, 50);
            }
        });
    });

    var msgBuffer = document.getElementById('messagebuffer');
    if (msgBuffer) {
        replyObserver.observe(msgBuffer, { childList: true });
        _bokiCleanup.registerObserver('replyObserver', replyObserver);
    }
}

// Initialize on load
$(document).ready(function() {
    setTimeout(initReplySystem, 1000);
});

// USERNAME STYLING SYSTEM
// usernameStyleSettings is initialized at the top of the file with BokiTheme.Safe.getStorage

function getMyUsername() {
    return (typeof CLIENT !== 'undefined' && CLIENT.name) ? CLIENT.name : null;
}

function buildUsernameOpenTags() {
    var tags = '';
    
    // Font (outermost)
    if (usernameStyleSettings.font) {
        tags += '[font-' + usernameStyleSettings.font + ']';
    }
    
    // Gradient or color or custom color
    if (usernameStyleSettings.gradient) {
        tags += '[' + usernameStyleSettings.gradient + ']';
    } else if (usernameStyleSettings.color) {
        tags += '[' + usernameStyleSettings.color + ']';
    } else if (usernameStyleSettings.customColor) {
        tags += '[#' + usernameStyleSettings.customColor + ']';
    }
    
    // Glow or custom glow
    if (usernameStyleSettings.glow) {
        tags += '[' + usernameStyleSettings.glow + ']';
    } else if (usernameStyleSettings.customGlow) {
        tags += '[glow-#' + usernameStyleSettings.customGlow + ']';
    }
    
    // Animation
    if (usernameStyleSettings.animation) {
        tags += '[' + usernameStyleSettings.animation + ']';
    }
    
    // Bold
    if (usernameStyleSettings.bold) {
        tags += '[b]';
    }
    
    return tags;
}

function buildUsernameCloseTags() {
    var tags = '';
    
    if (usernameStyleSettings.bold) tags += '[/]';
    if (usernameStyleSettings.animation) tags += '[/]';
    if (usernameStyleSettings.glow || usernameStyleSettings.customGlow) tags += '[/]';
    if (usernameStyleSettings.gradient || usernameStyleSettings.color || usernameStyleSettings.customColor) tags += '[/]';
    if (usernameStyleSettings.font) tags += '[/]';
    
    return tags;
}

function applyUsernameTagsToMessage() {
    console.log('[UsernameStyle] applyUsernameTagsToMessage called, enabled:', usernameStyleSettings.enabled);
    if (!usernameStyleSettings.enabled) {
        console.log('[UsernameStyle] Skipping - not enabled');
        return;
    }

    var myName = getMyUsername();
    console.log('[UsernameStyle] myName:', myName);
    if (!myName) return;

    var c = document.getElementById('chatline');
    if (!c) return;
    var msg = c.value;
    console.log('[UsernameStyle] Original message:', msg);

    // Skip commands
    if (msg.startsWith('/')) return;
    // Skip empty
    if (!msg.trim()) return;
    // Skip if already has username tag
    if (msg.startsWith('[uname]')) return;

    var openTags = buildUsernameOpenTags();
    var closeTags = buildUsernameCloseTags();
    console.log('[UsernameStyle] Tags - open:', openTags, 'close:', closeTags);

    // Always add [uname] wrapper when enabled, even without specific styles
    // This ensures the styled-username CSS is applied
    var styled = '[uname]' + openTags + myName + closeTags + '[/uname] ' + msg;

    // Cytube truncates messages >240 chars without warning, which breaks closing tags
    // and causes raw BBCode to appear in chat. Skip styling if too long.
    if (styled.length > 240) {
        console.log('[UsernameStyle] Message too long for styling:', styled.length, '(limit 240). Sending unstyled.');
        return;
    }

    c.value = styled;
    console.log('[UsernameStyle] Modified message:', c.value);
}

function processStyledUsername(msgElement) {
    if (!msgElement) return;
    
    // Find the styled username span
    var styledUsername = msgElement.querySelector('.styled-username');
    if (!styledUsername) return;
    
    // Add class to message element so CSS can hide original username
    msgElement.classList.add('chat-msg-with-styled-name');
    
    // Get the styled username text (without the colon from ::after)
    var styledName = styledUsername.textContent.trim();
    
    // Check previous messages for consecutive posts from same user
    var prevMsg = msgElement.previousElementSibling;
    var isConsecutive = false;
    
    while (prevMsg) {
        // Skip non-chat messages (like server messages)
        if (!prevMsg.querySelector('.username') && !prevMsg.querySelector('.styled-username')) {
            prevMsg = prevMsg.previousElementSibling;
            continue;
        }
        
        // Check if previous message has styled username
        var prevStyledUsername = prevMsg.querySelector('.styled-username');
        if (prevStyledUsername) {
            var prevName = prevStyledUsername.textContent.trim();
            if (prevName === styledName) {
                isConsecutive = true;
            }
        } else {
            // Check regular username
            var prevUsernameSpan = prevMsg.querySelector('.username');
            if (prevUsernameSpan && prevUsernameSpan.textContent.trim() === styledName) {
                isConsecutive = true;
            }
        }
        break; // Only check immediate previous message
    }
    
    if (isConsecutive) {
        // Same user - hide username and timestamp
        styledUsername.classList.add('hidden-consecutive');
        msgElement.classList.add('has-hidden-username');
        var timestamp = msgElement.querySelector('.timestamp');
        if (timestamp) timestamp.style.display = 'none';
    } else {
        // First message from this user - show username, timestamp floats right
        msgElement.classList.add('has-visible-username');
    }
}

function saveUsernameStyleSettings() {
    localStorage.setItem('usernameStyleSettings', JSON.stringify(usernameStyleSettings));
    updateUsernamePreview();
    refreshUsernameStyleBtns();
}

function selectUsernameColor(c) {
    _selectStyleProp(usernameStyleSettings, 'color', c, ['gradient', 'customColor'], saveUsernameStyleSettings, 'username');
}

function selectUsernameGradient(g) {
    _selectStyleProp(usernameStyleSettings, 'gradient', g, ['color', 'customColor'], saveUsernameStyleSettings, 'username');
}

function selectUsernameGlow(g) {
    _selectStyleProp(usernameStyleSettings, 'glow', g, ['customGlow'], saveUsernameStyleSettings, 'username');
}

function selectUsernameAnimation(a) {
    _selectStyleProp(usernameStyleSettings, 'animation', a, null, saveUsernameStyleSettings, 'username');
}

function selectUsernameFont(f) {
    _selectStyleProp(usernameStyleSettings, 'font', f, null, saveUsernameStyleSettings, 'username');
}

function toggleUsernameBold() {
    usernameStyleSettings.bold = !usernameStyleSettings.bold;
    saveUsernameStyleSettings();
    renderStyleTabContent('username');
}

function toggleUsernameStyleEnabled() {
    usernameStyleSettings.enabled = !usernameStyleSettings.enabled;
    saveUsernameStyleSettings();
    renderStyleTabContent('username');
    var btn = document.getElementById('username-style-toggle');
    if (btn) {
        btn.textContent = usernameStyleSettings.enabled ? '✓ Enabled' : '✗ Disabled';
        btn.classList.toggle('active', usernameStyleSettings.enabled);
    }
}

function resetUsernameStyle() {
    usernameStyleSettings = {
        enabled: false,
        color: null,
        gradient: null,
        glow: null,
        animation: null,
        font: null,
        bold: false
    };
    saveUsernameStyleSettings();
}

function refreshUsernameStyleBtns() {
    document.querySelectorAll('.uname-color-btn').forEach(function(b) { 
        b.classList.toggle('active', usernameStyleSettings.color === b.dataset.color); 
    });
    document.querySelectorAll('.uname-gradient-btn').forEach(function(b) { 
        b.classList.toggle('active', usernameStyleSettings.gradient === b.dataset.gradient); 
    });
    document.querySelectorAll('.uname-glow-btn').forEach(function(b) { 
        b.classList.toggle('active', usernameStyleSettings.glow === b.dataset.glow); 
    });
    document.querySelectorAll('.uname-anim-btn').forEach(function(b) { 
        b.classList.toggle('active', usernameStyleSettings.animation === b.dataset.anim); 
    });
    document.querySelectorAll('.uname-font-btn').forEach(function(b) { 
        b.classList.toggle('active', usernameStyleSettings.font === b.dataset.font); 
    });
    var boldBtn = document.getElementById('uname-bold-btn');
    if (boldBtn) boldBtn.classList.toggle('active', usernameStyleSettings.bold);
    var toggleBtn = document.getElementById('username-style-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = usernameStyleSettings.enabled ? '✓ Enabled' : '✗ Disabled';
        toggleBtn.classList.toggle('active', usernameStyleSettings.enabled);
    }
}

function updateUsernamePreview() {
    var p = document.getElementById('username-preview');
    if (!p) return;

    var myName = getMyUsername() || 'YourName';
    var s = [];

    // Font
    if (usernameStyleSettings.font) {
        if (STYLE_FONTS[usernameStyleSettings.font]) s.push(STYLE_FONTS[usernameStyleSettings.font]);
    }

    // Color or gradient
    if (usernameStyleSettings.gradient) {
        if (STYLE_GRADIENTS[usernameStyleSettings.gradient]) s.push(STYLE_GRADIENTS[usernameStyleSettings.gradient]);
    } else if (usernameStyleSettings.color) {
        s.push('color:' + (usernameStyleSettings.color === 'blue' ? '#55f' : usernameStyleSettings.color));
    }

    // Glow
    if (usernameStyleSettings.glow) {
        if (STYLE_GLOWS[usernameStyleSettings.glow]) s.push(STYLE_GLOWS[usernameStyleSettings.glow]);
    }
    
    // Bold
    if (usernameStyleSettings.bold) s.push('font-weight:bold');
    
    // Animation class
    var animClass = usernameStyleSettings.animation ? 'text-' + usernameStyleSettings.animation : '';
    
    var hasStyle = usernameStyleSettings.color || usernameStyleSettings.gradient || usernameStyleSettings.bold || 
                   usernameStyleSettings.glow || usernameStyleSettings.animation || usernameStyleSettings.font;
    
    p.style.cssText = s.join(';');
    p.className = animClass;
    p.textContent = hasStyle ? myName : 'No styling (default)';
    if (!hasStyle) { p.style.color = '#666'; p.style.fontStyle = 'italic'; }
}

// GIF EMBEDDING - Convert GIF links to inline images
function embedGifsInMessage(msgElement) {
    if (!msgElement) return;
    
    // Find all links in the message
    var links = msgElement.querySelectorAll('a');
    links.forEach(function(link) {
        var href = link.getAttribute('href');
        if (!href) return;
        
        // Check if it's a GIF URL (Tenor, Giphy, or any .gif)
        var isGif = href.match(/\.(gif)$/i) ||
                    href.match(/media\.tenor\.com/i) ||
                    href.match(/giphy\.com/i) ||
                    href.match(/media\d*\.giphy\.com/i);
        
        if (isGif) {
            // Create image element
            var img = document.createElement('img');
            img.src = href;
            img.alt = 'GIF';
            img.style.cssText = 'height:100px;max-width:250px;object-fit:contain;vertical-align:middle;cursor:pointer;';
            img.title = 'Click to open full size';
            img.onclick = function() { window.open(href, '_blank'); };
            
            // Handle load errors - revert to link if image fails
            img.onerror = function() {
                img.replaceWith(link);
            };
            
            // Replace link with image
            link.replaceWith(img);
        }
    });
}

// Run on all existing messages when script loads
function embedAllExistingGifs() {
    var messages = document.querySelectorAll('#messagebuffer > div');
    messages.forEach(function(msg) {
        embedGifsInMessage(msg);
        processStyledUsername(msg);
    });
}

// Run after page loads
setTimeout(embedAllExistingGifs, 1000);

// Watch for new messages using MutationObserver
var gifObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1 && node.classList && node.classList.contains('chat-msg-')) {
                // Small delay to let CyTube finish processing the message
                setTimeout(function() { 
                    embedGifsInMessage(node); 
                    processStyledUsername(node);
                }, 50);
            }
            // Also check if it's a div directly added to messagebuffer
            if (node.nodeType === 1 && node.tagName === 'DIV' && node.parentElement && node.parentElement.id === 'messagebuffer') {
                setTimeout(function() { 
                    embedGifsInMessage(node); 
                    processStyledUsername(node);
                }, 50);
            }
        });
    });
});

// Start observing the message buffer
var msgBuffer = document.getElementById('messagebuffer');
if (msgBuffer) {
    gifObserver.observe(msgBuffer, { childList: true, subtree: true });
    _bokiCleanup.registerObserver('gifObserver', gifObserver);
}

// Register formatChatMsg with dispatcher (priority 40 - runs after sync checks)
BokiChatDispatcher.register('formatChatMsg', function(data) {
    formatChatMsg(data, $("#messagebuffer > div").last());
    return false; // Continue to other handlers
}, 40);

// Hook into niconico script to strip username tags and show GIFs in scrolling messages
(function() {
    function installNNDHook() {
        if (!window.nnd || !window.nnd._fn || !window.nnd._fn.addScrollingMessage) {
            return false;
        }
        
        // Check if already hooked
        if (window.nnd._fn._hookedByBokitube) {
            return true;
        }
        
        // Store original function
        var originalAddScrollingMessage = window.nnd._fn.addScrollingMessage;
        
        // Override with our version that strips username tags, buddy sync, and converts GIF URLs
        window.nnd._fn.addScrollingMessage = function(message, extraClass) {
            if (typeof message === 'string') {
                // Skip screenspam messages entirely - they have their own display
                if (message.indexOf('SCREENSPAM:') !== -1 || message.indexOf('\u200B\u200C\u200B') !== -1) {
                    return;
                }

                // Skip subtitle messages entirely - they display as actual subtitles
                if (message.indexOf('SUBTITLE:') !== -1 || message.indexOf('\u200B\u200D\u200B') !== -1) {
                    return;
                }

                // Skip buddy sync messages entirely - BSET (settings) and BACT (actions)
                if (message.indexOf('BSET:') !== -1 || message.indexOf('BACT:') !== -1 ||
                    message.indexOf('\u200B\u200C') !== -1) {
                    return;
                }

                // Remove [uname]...[/uname] tags and their contents (including styled spans)
                message = message.replace(/\[uname\][\s\S]*?\[\/uname\]\s*/gi, '');
                
                // Also remove already-processed styled-username spans
                message = message.replace(/<span[^>]*class="[^"]*styled-username[^"]*"[^>]*>[\s\S]*?<\/span>\s*/gi, '');
                
                // Convert Tenor/Giphy/GIF URLs to img tags for display
                // Match URLs that are GIFs (including those in anchor tags)
                message = message.replace(/<a[^>]*href="(https?:\/\/[^"]*(?:tenor\.com|giphy\.com|\.gif)[^"]*)"[^>]*>[^<]*<\/a>/gi, function(match, url) {
                    return '<img src="' + url + '" alt="GIF">';
                });
                
                // Also convert plain GIF URLs that aren't in anchor tags
                message = message.replace(/(?<![">])(https?:\/\/(?:media\.tenor\.com|[^\s]*\.gif)[^\s<]*)/gi, function(match, url) {
                    return '<img src="' + url + '" alt="GIF">';
                });
            }
            // Call original function with cleaned message
            return originalAddScrollingMessage.call(this, message, extraClass);
        };
        
        window.nnd._fn._hookedByBokitube = true;
        console.log('NND username/GIF filter hook installed');
        return true;
    }
    
    // Try to install hook immediately
    if (!installNNDHook()) {
        // If NND not loaded yet, keep trying
        var checkNND = setInterval(function() {
            if (installNNDHook()) {
                clearInterval(checkNND);
            }
        }, 200);
        
        // Stop checking after 30 seconds
        setTimeout(function() { clearInterval(checkNND); }, 30000);
    }
    
    // Also hook when socket reconnects (NND might reload)
    if (typeof socket !== 'undefined') {
        socket.on('connect', function() {
            setTimeout(installNNDHook, 1000);
        });
    }
})();

/* ========== PLAYLIST RENAME SYSTEM ========== */
/* Add this code to your script.js file */

// JSONBin Configuration
var JSONBIN_BIN_ID = '69607c81d0ea881f405ea137';
var JSONBIN_API_KEY = '$2a$10$d8GSLo33pwEFh6n31kbyEOotfsidBcVubhZEk7kYOg0sC6DvHJgjW';
var JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3/b/';

// Local cache of custom playlist names
var playlistCustomNames = {};
var playlistNamesLoaded = false;

// Inject CSS for rename feature
(function() {
    var renameStyles = document.createElement('style');
    renameStyles.id = 'playlist-rename-styles';
    renameStyles.textContent = `
        /* Rename button on playlist items */
        .queue_entry .rename-btn {
            display: none;
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(100, 100, 100, 0.8);
            border: none;
            border-radius: 4px;
            color: #fff;
            font-size: 14px;
            padding: 4px 8px;
            cursor: pointer;
            z-index: 10;
            transition: background 0.2s;
        }
        .queue_entry:hover .rename-btn {
            display: block;
        }
        .queue_entry .rename-btn:hover {
            background: rgba(150, 150, 150, 0.9);
        }
        .queue_entry {
            position: relative !important;
        }
        
        /* Custom name indicator */
        .queue_entry .custom-name-indicator {
            color: #ffd700;
            font-size: 10px;
            margin-left: 5px;
            opacity: 0.7;
        }
        
        /* Rename popup overlay */
        #rename-popup-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 999999;
            align-items: center;
            justify-content: center;
        }
        #rename-popup-overlay.visible {
            display: flex !important;
        }
        
        /* Rename popup */
        #rename-popup {
            background: #1e1e24;
            border: 2px solid #555;
            border-radius: 12px;
            padding: 0;
            width: 400px;
            max-width: 90vw;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);
        }
        #rename-popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 18px;
            background: #2d2d35;
            border-radius: 10px 10px 0 0;
        }
        #rename-popup-header span {
            color: #fff;
            font-weight: bold;
            font-size: 16px;
        }
        #rename-popup-close {
            background: #e44;
            border: none;
            color: #fff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #rename-popup-close:hover {
            background: #f66;
        }
        #rename-popup-body {
            padding: 18px;
        }
        #rename-popup-body label {
            display: block;
            color: #aaa;
            font-size: 12px;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        #rename-popup-body input {
            width: 100%;
            padding: 12px;
            background: #333;
            border: 1px solid #555;
            border-radius: 6px;
            color: #fff;
            font-size: 14px;
            box-sizing: border-box;
            margin-bottom: 12px;
        }
        #rename-popup-body input:focus {
            outline: none;
            border-color: #888;
        }
        #rename-original-title {
            color: #888;
            font-size: 12px;
            margin-bottom: 15px;
            padding: 10px;
            background: #252530;
            border-radius: 6px;
            word-break: break-word;
        }
        #rename-popup-actions {
            display: flex;
            gap: 10px;
        }
        #rename-popup-actions button {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.15s;
        }
        #rename-save-btn {
            background: #4a7;
            color: #fff;
        }
        #rename-save-btn:hover {
            background: #5b8;
        }
        #rename-save-btn:disabled {
            background: #555;
            cursor: not-allowed;
        }
        #rename-reset-btn {
            background: #744;
            color: #fff;
        }
        #rename-reset-btn:hover {
            background: #855;
        }
        #rename-cancel-btn {
            background: #444;
            color: #fff;
        }
        #rename-cancel-btn:hover {
            background: #555;
        }
        
        /* Status message */
        #rename-status {
            margin-top: 10px;
            padding: 8px;
            border-radius: 4px;
            font-size: 12px;
            text-align: center;
            display: none;
        }
        #rename-status.success {
            display: block;
            background: rgba(100, 200, 100, 0.2);
            color: #8f8;
        }
        #rename-status.error {
            display: block;
            background: rgba(200, 100, 100, 0.2);
            color: #f88;
        }
        #rename-status.loading {
            display: block;
            background: rgba(100, 100, 200, 0.2);
            color: #88f;
        }
    `;
    document.head.appendChild(renameStyles);
})();

// Fetch custom names from JSONBin
function fetchPlaylistNames() {
    return fetch(JSONBIN_BASE_URL + JSONBIN_BIN_ID + '/latest', {
        method: 'GET',
        headers: {
            'X-Master-Key': JSONBIN_API_KEY
        }
    })
    .then(function(response) {
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
    })
    .then(function(data) {
        playlistCustomNames = data.record || {};
        // Remove initialization placeholder if present
        delete playlistCustomNames._init;
        delete playlistCustomNames.placeholder;
        playlistNamesLoaded = true;
        console.log('Playlist custom names loaded:', Object.keys(playlistCustomNames).length, 'entries');
        applyAllCustomNames();
        return playlistCustomNames;
    })
    .catch(function(err) {
        console.error('Error fetching playlist names:', err);
        playlistNamesLoaded = true; // Mark as loaded even on error to prevent blocking
        return {};
    });
}

// Save custom names to JSONBin
function savePlaylistNames() {
    return fetch(JSONBIN_BASE_URL + JSONBIN_BIN_ID, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': JSONBIN_API_KEY
        },
        body: JSON.stringify(playlistCustomNames)
    })
    .then(function(response) {
        if (!response.ok) throw new Error('Failed to save');
        return response.json();
    })
    .then(function(data) {
        console.log('Playlist names saved successfully');
        return true;
    })
    .catch(function(err) {
        console.error('Error saving playlist names:', err);
        throw err;
    });
}

// Generate a unique key for a playlist item
function getPlaylistItemKey(item) {
    // Use media type + id as the unique key
    if (item && item.media) {
        return item.media.type + '_' + item.media.id;
    }
    return null;
}

// Get custom name for a playlist item
function getCustomName(mediaKey) {
    return playlistCustomNames[mediaKey] || null;
}

// Set custom name for a playlist item
function setCustomName(mediaKey, customName) {
    if (customName && customName.trim()) {
        playlistCustomNames[mediaKey] = customName.trim();
    } else {
        delete playlistCustomNames[mediaKey];
    }
}

// Extract media key from a playlist entry element
function getMediaKeyFromEntry(entryElement) {
    if (!entryElement) return null;
    
    // PRIMARY: Use video URL - it's unique and persistent
    var mediaLink = entryElement.querySelector('a.qe_title');
    if (!mediaLink) {
        mediaLink = entryElement.querySelector('a[href]');
    }
    
    var mediaUrl = mediaLink ? mediaLink.getAttribute('href') : null;
    
    if (mediaUrl) {
        // Extract just the filename/ID part to keep keys shorter
        // e.g., "https://pomf2.lain.la/f/h7gfu0h.mp4" -> "h7gfu0h.mp4"
        var urlParts = mediaUrl.split('/');
        var filename = urlParts[urlParts.length - 1] || mediaUrl;
        // Also handle YouTube, etc.
        var ytMatch = mediaUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (ytMatch) {
            return 'yt_' + ytMatch[1];
        }
        return 'url_' + filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
    }
    
    // FALLBACK: Use UID if no URL (less reliable but better than nothing)
    var uid = getEntryUid(entryElement);
    if (uid) {
        return 'uid_' + uid;
    }
    
    return null;
}

// Apply custom name to a single playlist entry element
function applyCustomNameToEntry(entryElement) {
    if (!entryElement) return;
    
    var mediaKey = getMediaKeyFromEntry(entryElement);
    if (!mediaKey) return;
    
    var customName = getCustomName(mediaKey);
    var titleElement = entryElement.querySelector('.qe_title');
    
    if (!titleElement) return;
    
    // Store original title if not already stored
    if (!titleElement.getAttribute('data-original-title')) {
        titleElement.setAttribute('data-original-title', titleElement.textContent);
    }
    
    var originalTitle = titleElement.getAttribute('data-original-title');
    
    // Remove existing indicator if present
    var existingIndicator = entryElement.querySelector('.custom-name-indicator');
    if (existingIndicator) existingIndicator.remove();
    
    if (customName) {
        titleElement.textContent = customName;
        titleElement.title = 'Original: ' + originalTitle;
        
        // Add indicator that this has a custom name
        var indicator = document.createElement('span');
        indicator.className = 'custom-name-indicator';
        indicator.textContent = '✎';
        indicator.title = 'Custom name';
        titleElement.parentNode.insertBefore(indicator, titleElement.nextSibling);
    } else {
        titleElement.textContent = originalTitle;
        titleElement.title = '';
    }
}

// Apply custom names to all playlist entries
function applyAllCustomNames() {
    var entries = document.querySelectorAll('#queue .queue_entry');
    entries.forEach(function(entry) {
        applyCustomNameToEntry(entry);
    });
    // Also update the "currently playing" title
    updateCurrentTitleDisplay();
}

// Update the "currently playing" title above chat with custom name if available
var currentTitleObserver = null;
var isUpdatingTitle = false;

function updateCurrentTitleDisplay() {
    if (isUpdatingTitle) return; // Prevent recursion

    var currentTitleEl = document.getElementById('currenttitle');
    if (!currentTitleEl) return;

    // Find the currently playing item in the playlist
    var activeEntry = document.querySelector('.queue_entry.queue_active');
    if (!activeEntry) return;

    // Get the media key for this entry
    var mediaKey = getMediaKeyFromEntry(activeEntry);
    if (!mediaKey) return;

    // Check for custom name
    var customName = getCustomName(mediaKey);

    if (customName) {
        isUpdatingTitle = true;
        // Store the original (raw) title from the active entry
        var originalTitle = activeEntry.querySelector('.qe_title');
        var origText = originalTitle ? (originalTitle.getAttribute('data-original-title') || originalTitle.textContent) : currentTitleEl.textContent;

        // Always show "Currently Playing:" prefix with custom name
        currentTitleEl.textContent = 'Currently Playing: ' + customName;
        currentTitleEl.title = 'Original: ' + origText;
        currentTitleEl.setAttribute('data-has-custom', 'true');
        isUpdatingTitle = false;
    } else {
        currentTitleEl.removeAttribute('data-has-custom');
    }
}

// Watch #currenttitle for changes by Cytube and re-apply custom name
function initCurrentTitleObserver() {
    var currentTitleEl = document.getElementById('currenttitle');
    if (!currentTitleEl) {
        setTimeout(initCurrentTitleObserver, 500);
        return;
    }

    if (currentTitleObserver) return; // Already initialized

    currentTitleObserver = new MutationObserver(function(mutations) {
        // When Cytube updates the title, re-apply custom name if we have one
        if (!isUpdatingTitle) {
            setTimeout(updateCurrentTitleDisplay, 50);
        }
    });

    currentTitleObserver.observe(currentTitleEl, {
        childList: true,
        characterData: true,
        subtree: true
    });
    _bokiCleanup.registerObserver('currentTitleObserver', currentTitleObserver);

    // Initial update
    updateCurrentTitleDisplay();
    console.log('[CustomTitle] Observer initialized');
}

// Check if current user is a moderator or higher
function canRenamePlaylist() {
    // CLIENT.rank values in CyTube:
    // 0 = Guest
    // 1 = Regular user
    // 2 = Moderator
    // 3 = Channel Admin
    // 4 = Channel Owner
    // 5+ = Site admin/superuser
    if (typeof CLIENT !== 'undefined' && CLIENT.rank >= 2) {
        return true;
    }
    return false;
}

// Add rename button to a playlist entry
function addRenameButton(entryElement) {
    if (!entryElement) return;
    if (entryElement.querySelector('.rename-btn')) return; // Already has button
    
    // Only add button if user is moderator or higher
    if (!canRenamePlaylist()) {
        return;
    }
    
    var btn = document.createElement('button');
    btn.className = 'rename-btn';
    btn.innerHTML = '✏️';
    btn.title = 'Rename this item (Mod only)';
    
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        console.log('Rename button clicked');
        try {
            openRenamePopup(entryElement);
        } catch (err) {
            console.error('Error opening rename popup:', err);
        }
    });
    
    entryElement.appendChild(btn);
}

// Extract UID from entry element (can be in data-uid or class name)
function getEntryUid(entryElement) {
    // Try data-uid first
    var uid = entryElement.getAttribute('data-uid');
    if (uid) return uid;
    
    // Try to extract from class name (e.g., "queue_entry pluid-265")
    var classList = entryElement.className || '';
    var match = classList.match(/pluid-(\d+)/);
    if (match) return match[1];
    
    return null;
}

// Add rename buttons to all playlist entries
function addAllRenameButtons() {
    var entries = document.querySelectorAll('#queue .queue_entry');
    entries.forEach(function(entry) {
        addRenameButton(entry);
    });
}

// Current item being renamed
var currentRenameItem = null;
var currentRenameKey = null;

// Create rename popup
function createRenamePopup() {
    if (document.getElementById('rename-popup-overlay')) return;
    
    var overlay = document.createElement('div');
    overlay.id = 'rename-popup-overlay';
    overlay.onclick = function(e) {
        if (e.target === overlay) closeRenamePopup();
    };
    
    var popup = document.createElement('div');
    popup.id = 'rename-popup';
    popup.innerHTML = 
        '<div id="rename-popup-header">' +
            '<span>✏️ Rename Playlist Item</span>' +
            '<button id="rename-popup-close" onclick="closeRenamePopup()">×</button>' +
        '</div>' +
        '<div id="rename-popup-body">' +
            '<label>Original Title</label>' +
            '<div id="rename-original-title"></div>' +
            '<label>Custom Name</label>' +
            '<input type="text" id="rename-input" placeholder="Enter custom name..." maxlength="200">' +
            '<div id="rename-popup-actions">' +
                '<button id="rename-save-btn" onclick="saveRename()">💾 Save</button>' +
                '<button id="rename-reset-btn" onclick="resetRename()">↺ Reset</button>' +
                '<button id="rename-cancel-btn" onclick="closeRenamePopup()">Cancel</button>' +
            '</div>' +
            '<div id="rename-status"></div>' +
        '</div>';
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Handle Enter key in input
    document.getElementById('rename-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            saveRename();
        } else if (e.key === 'Escape') {
            closeRenamePopup();
        }
    });
}

// Open rename popup for a playlist entry
function openRenamePopup(entryElement) {
    console.log('openRenamePopup called');
    
    // Double-check permission
    if (!canRenamePlaylist()) {
        console.log('Permission denied');
        return;
    }
    
    createRenamePopup();
    
    // Get the title element
    var titleEl = entryElement.querySelector('.qe_title');
    var title = titleEl ? titleEl.textContent.trim() : '';
    console.log('Title:', title);
    
    // Get UID from class or data attribute
    var uid = getEntryUid(entryElement);
    console.log('UID:', uid);
    
    // PRIMARY: Use video URL as key - it's unique and persistent across server restarts
    var mediaLink = entryElement.querySelector('a.qe_title');
    if (!mediaLink) {
        mediaLink = entryElement.querySelector('a[href]');
    }
    var mediaUrl = mediaLink ? mediaLink.getAttribute('href') : null;
    console.log('Media URL:', mediaUrl);
    
    if (mediaUrl) {
        // Extract just the filename/ID part
        var urlParts = mediaUrl.split('/');
        var filename = urlParts[urlParts.length - 1] || mediaUrl;
        // Handle YouTube
        var ytMatch = mediaUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (ytMatch) {
            currentRenameKey = 'yt_' + ytMatch[1];
        } else {
            currentRenameKey = 'url_' + filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
        }
    } else if (uid) {
        // Fallback to UID if no URL
        currentRenameKey = 'uid_' + uid;
    } else {
        // Last resort
        currentRenameKey = 'temp_' + Date.now();
    }
    
    console.log('Media key:', currentRenameKey);
    
    // Create playlist item object for reference
    currentRenameItem = {
        title: title,
        uid: uid,
        url: mediaUrl
    };
    
    // Store original title
    if (titleEl && !titleEl.getAttribute('data-original-title')) {
        titleEl.setAttribute('data-original-title', title);
    }
    
    var originalTitle = titleEl ? (titleEl.getAttribute('data-original-title') || title) : 'Unknown';
    var currentCustom = getCustomName(currentRenameKey) || '';
    
    document.getElementById('rename-original-title').textContent = originalTitle;
    document.getElementById('rename-input').value = currentCustom;
    document.getElementById('rename-status').className = '';
    document.getElementById('rename-status').style.display = 'none';
    
    document.getElementById('rename-popup-overlay').classList.add('visible');
    document.getElementById('rename-input').focus();
    document.getElementById('rename-input').select();
    console.log('Popup opened');
}

// Close rename popup
function closeRenamePopup() {
    var overlay = document.getElementById('rename-popup-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
    }
    currentRenameItem = null;
    currentRenameKey = null;
}

// Save the rename
function saveRename() {
    if (!currentRenameKey) return;
    
    var input = document.getElementById('rename-input');
    var status = document.getElementById('rename-status');
    var saveBtn = document.getElementById('rename-save-btn');
    var newName = input.value.trim();
    
    // Show loading
    status.textContent = 'Saving...';
    status.className = 'loading';
    saveBtn.disabled = true;
    
    // Update local cache
    setCustomName(currentRenameKey, newName);
    
    // Save to JSONBin
    savePlaylistNames()
        .then(function() {
            status.textContent = '✓ Saved successfully!';
            status.className = 'success';
            saveBtn.disabled = false;
            
            // Apply the change to the UI
            applyAllCustomNames();
            
            // Close popup after short delay
            setTimeout(function() {
                closeRenamePopup();
            }, 800);
        })
        .catch(function(err) {
            status.textContent = '✕ Failed to save. Try again.';
            status.className = 'error';
            saveBtn.disabled = false;
        });
}

// Reset to original name
function resetRename() {
    if (!currentRenameKey) return;
    
    var status = document.getElementById('rename-status');
    var saveBtn = document.getElementById('rename-save-btn');
    
    // Show loading
    status.textContent = 'Resetting...';
    status.className = 'loading';
    saveBtn.disabled = true;
    
    // Remove custom name from cache
    delete playlistCustomNames[currentRenameKey];
    
    // Save to JSONBin
    savePlaylistNames()
        .then(function() {
            status.textContent = '✓ Reset to original!';
            status.className = 'success';
            saveBtn.disabled = false;
            document.getElementById('rename-input').value = '';
            
            // Apply the change to the UI
            applyAllCustomNames();
            
            // Close popup after short delay
            setTimeout(function() {
                closeRenamePopup();
            }, 800);
        })
        .catch(function(err) {
            status.textContent = '✕ Failed to reset. Try again.';
            status.className = 'error';
            saveBtn.disabled = false;
        });
}

// Watch for playlist changes
function initPlaylistRenameObserver() {
    var queue = document.getElementById('queue');
    if (!queue) {
        // Queue not ready yet, try again
        setTimeout(initPlaylistRenameObserver, 500);
        return;
    }
    
    // Initial setup
    addAllRenameButtons();
    if (playlistNamesLoaded) {
        applyAllCustomNames();
    }
    
    // Watch for new items added to playlist
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.classList && node.classList.contains('queue_entry')) {
                    addRenameButton(node);
                    if (playlistNamesLoaded) {
                        setTimeout(function() {
                            applyCustomNameToEntry(node);
                        }, 100);
                    }
                }
            });
        });
    });
    
    observer.observe(queue, { childList: true });
    _bokiCleanup.registerObserver('playlistRenameObserver', observer);

    // Debounced playlist update to prevent scroll bounce
    var playlistUpdateTimer = null;
    function debouncedPlaylistUpdate(delay) {
        if (playlistUpdateTimer) clearTimeout(playlistUpdateTimer);
        playlistUpdateTimer = setTimeout(function() {
            addAllRenameButtons();
            applyAllCustomNames();
            playlistUpdateTimer = null;
        }, delay);
    }

    // Also listen for playlist socket events to refresh names
    // Use flag to prevent duplicate handler registration on reconnect
    if (typeof socket !== 'undefined' && !window._bokiPlaylistSocketInit) {
        window._bokiPlaylistSocketInit = true;
        socket.on('playlist', function() {
            debouncedPlaylistUpdate(600);
        });

        socket.on('queue', function() {
            debouncedPlaylistUpdate(400);
        });

        socket.on('delete', function() {
            debouncedPlaylistUpdate(400);
        });

        // Refresh emote panel when emotes are updated
        socket.on('emoteList', function() {
            console.log('[Emotes] Channel emotes updated, count:', CHANNEL.emotes ? CHANNEL.emotes.length : 0);
            // Re-render if popup is open
            var popup = document.getElementById('emote-popup-overlay');
            if (popup && popup.classList.contains('visible')) {
                var activeTab = document.querySelector('.emote-tab.active');
                if (activeTab && activeTab.dataset.tab !== 'gif') {
                    renderEmotes(activeTab.dataset.tab, document.querySelector('#emote-popup-search input').value);
                }
            }
        });

        // Update current title when media changes
        socket.on('changeMedia', function() {
            setTimeout(function() {
                updateCurrentTitleDisplay();
            }, 300);
        });

        socket.on('setCurrent', function() {
            setTimeout(function() {
                updateCurrentTitleDisplay();
            }, 300);
        });
        
        // Listen for rank changes - add/remove buttons accordingly
        socket.on('rank', function(rank) {
            console.log('Rank changed to:', rank);
            setTimeout(function() {
                // Remove all existing rename buttons first
                document.querySelectorAll('.rename-btn').forEach(function(btn) {
                    btn.remove();
                });
                // Re-add buttons (will only add if user has permission)
                addAllRenameButtons();
            }, 100);
        });
        
        // Also listen for setUserRank which is used when promoted/demoted
        socket.on('setUserRank', function(data) {
            if (typeof CLIENT !== 'undefined' && data.name === CLIENT.name) {
                console.log('Your rank was changed to:', data.rank);
                setTimeout(function() {
                    document.querySelectorAll('.rename-btn').forEach(function(btn) {
                        btn.remove();
                    });
                    addAllRenameButtons();
                }, 100);
            }
        });
    }
}

// Initialize the rename system
function initPlaylistRename() {
    console.log('Initializing playlist rename system...');

    // Fetch names from JSONBin
    fetchPlaylistNames().then(function() {
        // Start the observer after names are loaded
        initPlaylistRenameObserver();
        // Also start the current title observer
        initCurrentTitleObserver();
    }).catch(function(err) {
        console.error('[PlaylistRename] Failed to fetch names, continuing with defaults:', err);
        // Still initialize observers so rename UI works even if fetch failed
        initPlaylistRenameObserver();
        initCurrentTitleObserver();
    });
}

// Start when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initPlaylistRename, 1000);
    });
} else {
    setTimeout(initPlaylistRename, 1000);
}

// Make functions globally available
window.openRenamePopup = openRenamePopup;
window.closeRenamePopup = closeRenamePopup;
window.saveRename = saveRename;
window.resetRename = resetRename;

/* ========== HIDE JOIN/LEAVE MESSAGES ========== */
// CyTube adds join/leave messages with specific classes
// This CSS hides them completely
(function() {
    var hideJoinLeaveCSS = document.createElement('style');
    hideJoinLeaveCSS.id = 'hide-join-leave-css';
    hideJoinLeaveCSS.textContent =
        '#messagebuffer .server-whisper { display: none !important; }' +
        '#messagebuffer .chat-shadow { display: none !important; }';
    document.head.appendChild(hideJoinLeaveCSS);
})();

/* ========== CUSTOM COLUMN RESIZER ========== */
(function() {
    'use strict';

    var isResizing = false;
    var startX = 0;
    var startWidth = 0;
    var leftContent = null;
    var contentWrap = null;
    var EDGE_THRESHOLD = 8; // pixels from edge to trigger resize cursor

    // Add CSS for resizer - NO visible element, just layout fixes
    var resizerCSS = document.createElement('style');
    resizerCSS.id = 'column-resizer-css';
    resizerCSS.textContent = `
        @media (min-width: 769px) {
            #content-wrap {
                display: flex !important;
                flex-direction: row !important;
                width: 100% !important;
                height: calc(100vh - 50px) !important;
                gap: 0 !important;
                overflow: hidden !important;
            }

            #leftcontent {
                flex-shrink: 0 !important;
                box-sizing: border-box !important;
                height: 100% !important;
                overflow-y: auto !important;
            }

            #rightcontent {
                flex: 1 !important;
                min-width: 200px !important;
                box-sizing: border-box !important;
                position: relative !important;
                right: unset !important;
                width: auto !important;
                height: 100% !important;
            }

            body.col-resizing,
            body.col-resizing * {
                cursor: col-resize !important;
                user-select: none !important;
            }
        }
    `;
    document.head.appendChild(resizerCSS);

    function isNearEdge(e) {
        if (!leftContent) return false;
        var rect = leftContent.getBoundingClientRect();
        var distFromEdge = Math.abs(e.clientX - rect.right);
        return distFromEdge <= EDGE_THRESHOLD;
    }

    function initResizer() {
        if (window.innerWidth <= 768) return;

        contentWrap = document.getElementById('content-wrap');
        leftContent = document.getElementById('leftcontent');
        var rightContent = document.getElementById('rightcontent');

        if (!contentWrap || !leftContent || !rightContent) {
            setTimeout(initResizer, 500);
            return;
        }

        if (rightContent.parentElement !== contentWrap) return;
        if (contentWrap.dataset.resizerInit) return;
        contentWrap.dataset.resizerInit = 'true';

        // Load saved width
        var savedWidth = localStorage.getItem('cytube_column_width');
        if (savedWidth) {
            leftContent.style.width = savedWidth;
        } else {
            leftContent.style.width = '88%';
        }

        // Mouse move - detect edge hover and handle resize drag
        document.addEventListener('mousemove', function(e) {
            if (isResizing) {
                var deltaX = e.clientX - startX;
                var newWidth = startWidth + deltaX;
                var containerWidth = contentWrap.offsetWidth;
                var percentWidth = (newWidth / containerWidth) * 100;

                if (percentWidth >= 50 && percentWidth <= 95) {
                    leftContent.style.width = percentWidth + '%';
                }
            } else {
                // Show resize cursor when near edge
                if (isNearEdge(e)) {
                    document.body.style.cursor = 'col-resize';
                } else if (document.body.style.cursor === 'col-resize') {
                    document.body.style.cursor = '';
                }
            }
        });

        // Mouse down - start resize if near edge
        document.addEventListener('mousedown', function(e) {
            if (isNearEdge(e)) {
                isResizing = true;
                startX = e.clientX;
                startWidth = leftContent.offsetWidth;
                document.body.classList.add('col-resizing');
                e.preventDefault();
            }
        });

        // Mouse up - end resize
        document.addEventListener('mouseup', function() {
            if (isResizing) {
                isResizing = false;
                document.body.classList.remove('col-resizing');
                document.body.style.cursor = '';

                var containerWidth = contentWrap.offsetWidth;
                var percentWidth = (leftContent.offsetWidth / containerWidth) * 100;
                localStorage.setItem('cytube_column_width', percentWidth.toFixed(1) + '%');

                // Return buddies that ended up in the video area after column resize
                if (typeof returnBuddiesToZone === 'function') {
                    setTimeout(returnBuddiesToZone, 100);
                }
            }
        });

        console.log('[Resizer] Initialized (edge detection mode)');
    }

    setTimeout(initResizer, 1500);

    var currentlyMobile = window.innerWidth <= 768;
    window.addEventListener('resize', function() {
        var nowMobile = window.innerWidth <= 768;
        if (currentlyMobile && !nowMobile) {
            setTimeout(initResizer, 500);
        }
        currentlyMobile = nowMobile;
    });
})();

/* ========== ENHANCED FEATURES ========== */

// Mention notification sound (base64 encoded short beep)
var mentionSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+cnpuYlZebnZuZl5WUlZibnZuZl5WTk5WWl5iZmpqampqampqam5ubm5ycnJycnJ2dnZ2dnZ6enp6enp6enp6enp6enp6enp+fn5+fn5+fn5+fn5+fn5+fn56enp6enp6enp6enp6enp6enp6enp6enp2dnZ2dnZycnJycnJubm5ubmpqampqamZmZmZiYmJiXl5eXlpaWlpWVlZWUlJSTk5OTkpKSkpGRkZGQkJCQj4+Pj46Ojo6NjY2NjIyMi4uLi4qKioqJiYmJiIiIiIeHh4eGhoaGhYWFhYSEhIODg4OCgoKCgYGBgYCAgIB/f39/fn5+fn19fX18fHx8e3t7e3p6enp5eXl5eHh4eHd3d3d2dnZ2dXV1dXR0dHRzc3NzcnJycnFxcXFwcHBwb29vb25ubm5tbW1tbGxsbGtra2tqampqaWlpaWhoaGhnZ2dnZmZmZmVlZWVkZGRkY2NjY2JiYmJhYWFhYGBgYF9fX19eXl5eXV1dXVxcXFxbW1tbWlpaWllZWVlYWFhYV1dXV1ZWVlZVVVVVVFRUVFNTU1NSUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUFBQUFBQUFBQUFBQUFBQT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PUFBQUFBQUFBQUFBQUFBQUFFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFSU1NTU1NUVFRUVFRUVFVVVVVWVlZWV1dXV1hYWFhZWVlZWlpaWltbW1tcXFxcXV1dXV5eXl5fX19fYGBgYGFhYWFiYmJiY2NjY2RkZGRlZWVlZmZmZmdnZ2doaGhoaWlpaWpqampra2trbGxsbG1tbW1ubm5ub29vb3BwcHBxcXFxcnJycnNzc3N0dHR0dXV1dXZ2dnZ3d3d3eHh4eHl5eXl6enp6e3t7e3x8fHx9fX19fn5+fn9/f3+AgICAgYGBgYKCgoKDg4ODhISEhIWFhYWGhoaGh4eHh4iIiIiJiYmJioqKiouLi4uMjIyMjY2NjY6Ojo6Pj4+PkJCQkJGRkZGSkpKSk5OTk5SUlJSVlZWVlpaWlpeXl5eYmJiYmZmZmZqampqbm5ubnJycnJ2dnZ2enp6en5+fnw==');

// Initialize mention autocomplete
function initMentionAutocomplete() {
    var chatline = document.getElementById('chatline');
    if (!chatline) return;

    var autocomplete = document.createElement('div');
    autocomplete.id = 'mention-autocomplete';
    chatline.parentElement.style.position = 'relative';
    chatline.parentElement.appendChild(autocomplete);

    var selectedIndex = -1;
    var filteredUsers = [];

    chatline.addEventListener('input', function(e) {
        var val = chatline.value;
        var cursorPos = chatline.selectionStart;
        var textBeforeCursor = val.substring(0, cursorPos);
        var atMatch = textBeforeCursor.match(/@(\w*)$/);

        if (atMatch) {
            var query = atMatch[1].toLowerCase();
            var users = [];
            $('#userlist .userlist_item span').each(function() {
                var name = $(this).text().trim();
                if (name && name.toLowerCase().indexOf(query) !== -1) {
                    users.push(name);
                }
            });
            filteredUsers = users.slice(0, 8);
            selectedIndex = 0;

            if (filteredUsers.length > 0) {
                autocomplete.innerHTML = filteredUsers.map(function(u, i) {
                    return '<div class="mention-item' + (i === 0 ? ' selected' : '') + '" data-name="' + u + '">' + u + '</div>';
                }).join('');
                autocomplete.classList.add('visible');
                positionAutocomplete();
            } else {
                autocomplete.classList.remove('visible');
            }
        } else {
            autocomplete.classList.remove('visible');
        }
    });

    chatline.addEventListener('keydown', function(e) {
        if (!autocomplete.classList.contains('visible')) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, filteredUsers.length - 1);
            updateSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateSelection();
        } else if (e.key === 'Tab' || e.key === 'Enter') {
            if (filteredUsers[selectedIndex]) {
                e.preventDefault();
                insertMention(filteredUsers[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            autocomplete.classList.remove('visible');
        }
    });

    autocomplete.addEventListener('click', function(e) {
        if (e.target.classList.contains('mention-item')) {
            insertMention(e.target.dataset.name);
        }
    });

    function updateSelection() {
        autocomplete.querySelectorAll('.mention-item').forEach(function(el, i) {
            el.classList.toggle('selected', i === selectedIndex);
        });
    }

    function insertMention(name) {
        var val = chatline.value;
        var cursorPos = chatline.selectionStart;
        var textBeforeCursor = val.substring(0, cursorPos);
        var textAfterCursor = val.substring(cursorPos);
        var newBefore = textBeforeCursor.replace(/@\w*$/, '@' + name + ' ');
        chatline.value = newBefore + textAfterCursor;
        chatline.selectionStart = chatline.selectionEnd = newBefore.length;
        chatline.focus();
        autocomplete.classList.remove('visible');
    }

    function positionAutocomplete() {
        autocomplete.style.bottom = (chatline.offsetHeight + 5) + 'px';
        autocomplete.style.left = '0';
        autocomplete.style.minWidth = '150px';
    }
}

/* ========== IMPERSONATION SYSTEM ========== */
// Store current impersonation target and captured styles
var currentImpersonateTarget = null;
var currentImpersonateUsernameStyle = null; // CSS from username element
var currentImpersonateMsgStyle = null; // CSS from message body
var currentImpersonateUsernameClasses = null; // Classes for animations

// Convert inline CSS style to BBCode tags
// Returns { open: '[tag1][tag2]', close: '[/][/]' }
function cssToTags(style, classes) {
    if (!style && !classes) return { open: '', close: '' };

    var open = '';
    var close = '';
    style = style || '';
    classes = classes || '';

    // --- FONT DETECTION ---
    var fontMatch = style.match(/font-family\s*:\s*([^;]+)/i);
    if (fontMatch) {
        var fontVal = fontMatch[1].toLowerCase();
        var fontMap = {
            'comic sans': 'comic', 'comic sans ms': 'comic',
            'impact': 'impact',
            'papyrus': 'papyrus',
            'copperplate': 'copperplate',
            'brush script': 'brush', 'brush script mt': 'brush',
            'lucida handwriting': 'lucida',
            'courier': 'courier', 'courier new': 'courier',
            'times': 'times', 'times new roman': 'times',
            'georgia': 'georgia',
            'trebuchet': 'trebuchet', 'trebuchet ms': 'trebuchet',
            'verdana': 'verdana',
            'century gothic': 'gothic',
            'garamond': 'garamond',
            'palatino': 'palatino', 'palatino linotype': 'palatino',
            'bookman': 'bookman', 'bookman old style': 'bookman',
            'monospace': 'mono',
            'cursive': 'cursive',
            'fantasy': 'fantasy',
            'system-ui': 'system',
            'serif': 'serif'
        };
        for (var fontKey in fontMap) {
            if (fontVal.indexOf(fontKey) !== -1) {
                open += '[font-' + fontMap[fontKey] + ']'; close = '[/]' + close;
                break;
            }
        }
    }

    // --- COLOR DETECTION ---
    // Check for gradient (has background-clip or -webkit-text-fill-color)
    if (style.indexOf('-webkit-text-fill-color') !== -1 || style.indexOf('background-clip') !== -1) {
        // Detect which gradient based on colors
        if (style.indexOf('#ff0000') !== -1 && style.indexOf('#ff7700') !== -1) {
            open += '[rainbow]'; close = '[/]' + close;
        } else if (style.indexOf('#ff0000') !== -1 && style.indexOf('#ffaa00') !== -1) {
            open += '[fire]'; close = '[/]' + close;
        } else if (style.indexOf('#00ffff') !== -1 && style.indexOf('#0088ff') !== -1) {
            open += '[ocean]'; close = '[/]' + close;
        } else if (style.indexOf('#ff6b6b') !== -1 && style.indexOf('#ffa500') !== -1) {
            open += '[sunset]'; close = '[/]' + close;
        } else if (style.indexOf('#ff00ff') !== -1 && style.indexOf('#00ffff') !== -1) {
            open += '[neon]'; close = '[/]' + close;
        } else if (style.indexOf('#228b22') !== -1 || style.indexOf('#32cd32') !== -1) {
            open += '[forest]'; close = '[/]' + close;
        } else if (style.indexOf('#ffd700') !== -1 && style.indexOf('#ffec8b') !== -1) {
            open += '[gold]'; close = '[/]' + close;
        } else if (style.indexOf('#e0ffff') !== -1 || style.indexOf('#87ceeb') !== -1) {
            open += '[ice]'; close = '[/]' + close;
        }
    } else {
        // Check for solid colors
        var colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
        if (colorMatch) {
            var color = colorMatch[1].trim().toLowerCase();
            // Map color values to tags
            var colorMap = {
                'red': 'red', '#ff0000': 'red', '#f00': 'red',
                'blue': 'blue', '#0000ff': 'blue', '#00f': 'blue', '#55f': 'blue', '#5555ff': 'blue',
                'green': 'green', '#008000': 'green', '#0f0': 'green', '#00ff00': 'green',
                'yellow': 'yellow', '#ffff00': 'yellow', '#ff0': 'yellow',
                'orange': 'orange', '#ffa500': 'orange',
                'pink': 'pink', '#ffc0cb': 'pink',
                'lime': 'lime', '#00ff00': 'lime',
                'aqua': 'aqua', 'cyan': 'aqua', '#00ffff': 'aqua', '#0ff': 'aqua',
                'violet': 'violet', '#ee82ee': 'violet', 'purple': 'violet',
                'white': 'white', '#ffffff': 'white', '#fff': 'white',
                'silver': 'silver', '#c0c0c0': 'silver',
                'brown': 'brown', '#a52a2a': 'brown',
                'gold': 'yellow', '#ffd700': 'yellow'
            };
            if (colorMap[color]) {
                open += '[' + colorMap[color] + ']'; close = '[/]' + close;
            } else if (color.match(/^#[0-9a-f]{3,6}$/i)) {
                // Custom hex color
                open += '[' + color + ']'; close = '[/]' + close;
            }
        }
    }

    // --- GLOW DETECTION ---
    var shadowMatch = style.match(/text-shadow\s*:\s*([^;]+)/i);
    if (shadowMatch) {
        var shadow = shadowMatch[1].toLowerCase();
        // Detect glow color from text-shadow
        // Check for rainbow glow (multiple colors in shadow)
        if ((shadow.indexOf('#f00') !== -1 || shadow.indexOf('red') !== -1) &&
            (shadow.indexOf('#0f0') !== -1 || shadow.indexOf('#00f') !== -1)) {
            open += '[glow-rainbow]'; close = '[/]' + close;
        } else if (shadow.indexOf('#fff') !== -1 || shadow.indexOf('white') !== -1) {
            open += '[glow-white]'; close = '[/]' + close;
        } else if (shadow.indexOf('#f00') !== -1 || shadow.indexOf('red') !== -1) {
            open += '[glow-red]'; close = '[/]' + close;
        } else if (shadow.indexOf('#00f') !== -1 || shadow.indexOf('blue') !== -1) {
            open += '[glow-blue]'; close = '[/]' + close;
        } else if (shadow.indexOf('#0f0') !== -1 || shadow.indexOf('green') !== -1) {
            open += '[glow-green]'; close = '[/]' + close;
        } else if (shadow.indexOf('#ffd700') !== -1 || shadow.indexOf('#ffa500') !== -1 || shadow.indexOf('gold') !== -1) {
            open += '[glow-gold]'; close = '[/]' + close;
        } else if (shadow.indexOf('#ff69b4') !== -1 || shadow.indexOf('pink') !== -1) {
            open += '[glow-pink]'; close = '[/]' + close;
        } else {
            // Try to extract custom glow color
            var glowColorMatch = shadow.match(/#[0-9a-f]{3,6}/i);
            if (glowColorMatch) {
                open += '[glow-' + glowColorMatch[0] + ']'; close = '[/]' + close;
            }
        }
    }

    // --- ANIMATION DETECTION (from classes OR style) ---
    var animDetected = false;
    if (classes) {
        var animMatch = classes.match(/text-(shake|pulse|bounce|wave|flicker|spin)/);
        if (animMatch) {
            open += '[' + animMatch[1] + ']'; close = '[/]' + close;
            animDetected = true;
        }
    }
    // Also check for animation in style attribute (e.g., "animation:bounce 0.6s")
    if (!animDetected && style) {
        var styleAnimMatch = style.match(/animation\s*:\s*(shake|pulse|bounce|wave|flicker|spin)/i);
        if (styleAnimMatch) {
            open += '[' + styleAnimMatch[1].toLowerCase() + ']'; close = '[/]' + close;
        }
    }

    // --- TEXT FORMATTING ---
    if (style.indexOf('font-weight') !== -1 && style.indexOf('bold') !== -1) {
        open += '[b]'; close = '[/]' + close;
    }
    if (style.indexOf('font-style') !== -1 && style.indexOf('italic') !== -1) {
        open += '[i]'; close = '[/]' + close;
    }
    if (style.indexOf('text-decoration') !== -1) {
        if (style.indexOf('underline') !== -1) {
            open += '[u]'; close = '[/]' + close;
        }
        if (style.indexOf('line-through') !== -1) {
            open += '[s]'; close = '[/]' + close;
        }
    }

    return { open: open, close: close };
}

// Create the impersonation popup
function createImpersonatePopup() {
    if (document.getElementById('impersonate-popup-overlay')) return;

    var o = document.createElement('div');
    o.id = 'impersonate-popup-overlay';
    o.onclick = function(e) { if (e.target === o) closeImpersonatePopup(); };

    var p = document.createElement('div');
    p.id = 'impersonate-popup';
    p.innerHTML = '<div id="impersonate-popup-header"><span>Send As...</span><button class="popup-close" onclick="closeImpersonatePopup()">x</button></div>' +
        '<div id="impersonate-popup-body">' +
        '<div id="impersonate-target-display"><div class="target-label">Impersonating:</div><div class="target-name" id="impersonate-target-name"></div></div>' +
        '<textarea id="impersonate-message-input" placeholder="Type your message..."></textarea>' +
        '<div id="impersonate-popup-actions">' +
        '<button id="impersonate-cancel-btn" onclick="closeImpersonatePopup()">Cancel</button>' +
        '<button id="impersonate-send-btn" onclick="sendImpersonateMessage()">Send</button>' +
        '</div></div>';

    o.appendChild(p);
    document.body.appendChild(o);
    makeDraggable(p, document.getElementById('impersonate-popup-header'));

    // Enter key to send
    document.getElementById('impersonate-message-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendImpersonateMessage();
        }
    });
}

var currentImpersonateMsgClasses = null; // Classes for message animations

function openImpersonatePopup(username, usernameStyle, msgStyle, usernameClasses, msgClasses) {
    createImpersonatePopup();
    currentImpersonateTarget = username;
    currentImpersonateUsernameStyle = usernameStyle || '';
    currentImpersonateMsgStyle = msgStyle || '';
    currentImpersonateUsernameClasses = usernameClasses || '';
    currentImpersonateMsgClasses = msgClasses || '';

    // Show styled preview of who we're impersonating
    var previewStyle = usernameStyle ? ' style="' + usernameStyle + '"' : '';
    var previewClass = usernameClasses ? ' class="' + usernameClasses + '"' : '';
    document.getElementById('impersonate-target-name').innerHTML = '<span' + previewStyle + previewClass + '>' + username + '</span>';
    document.getElementById('impersonate-message-input').value = '';
    document.getElementById('impersonate-popup-overlay').classList.add('visible');

    setTimeout(function() {
        document.getElementById('impersonate-message-input').focus();
    }, 100);
}

function closeImpersonatePopup() {
    var o = document.getElementById('impersonate-popup-overlay');
    if (o) o.classList.remove('visible');
    currentImpersonateTarget = null;
    currentImpersonateUsernameStyle = null;
    currentImpersonateMsgStyle = null;
    currentImpersonateUsernameClasses = null;
    currentImpersonateMsgClasses = null;
}

function sendImpersonateMessage() {
    var input = document.getElementById('impersonate-message-input');
    var message = input.value.trim();

    if (!message || !currentImpersonateTarget) {
        closeImpersonatePopup();
        return;
    }

    // Convert captured CSS styles to BBCode tags
    var usernameTags = cssToTags(currentImpersonateUsernameStyle, currentImpersonateUsernameClasses);
    var msgTags = cssToTags(currentImpersonateMsgStyle, currentImpersonateMsgClasses);

    // Build the formatted message with tags
    // Format: [uname]{userTags}USERNAME{/userTags}[/uname] {msgTags}message{/msgTags}
    // The [uname] wrapper creates a styled-username span that hides the real sender's username
    var formattedMsg = '';

    // Debug: show what tags were generated
    console.log('Username tags:', usernameTags);
    console.log('Message tags:', msgTags);

    // Add username with [uname] wrapper (this hides the real sender's username via CSS)
    formattedMsg = '[uname]' + usernameTags.open + currentImpersonateTarget + usernameTags.close + '[/uname] ';

    // Add message with styling tags
    if (msgTags.open) {
        formattedMsg += msgTags.open + message + msgTags.close;
    } else {
        formattedMsg += message;
    }

    // Debug: log what we're sending
    console.log('Impersonate sending:', formattedMsg);

    // Send via socket (same as normal chat)
    if (typeof socket !== 'undefined' && socket.emit) {
        socket.emit('chatMsg', { msg: formattedMsg });
    }

    closeImpersonatePopup();
}

// Click username in chat to mention, Shift+Click to impersonate
function initClickToMention() {
    // Use native event listener on document for reliability
    document.addEventListener('click', function(e) {
        var target = e.target;

        // Walk up the DOM to find username element
        var usernameEl = null;
        var el = target;
        while (el && el !== document.body) {
            if (el.classList && (el.classList.contains('username') || el.classList.contains('styled-username'))) {
                usernameEl = el;
                break;
            }
            el = el.parentElement;
        }

        if (!usernameEl) return;

        // Make sure it's in the messagebuffer
        var inMessageBuffer = false;
        el = usernameEl;
        while (el && el !== document.body) {
            if (el.id === 'messagebuffer') {
                inMessageBuffer = true;
                break;
            }
            el = el.parentElement;
        }
        if (!inMessageBuffer) return;

        var username = usernameEl.textContent.replace(/:$/, '').trim();
        if (!username) return;

        if (e.shiftKey) {
            // Shift+Click: Open impersonation popup
            e.preventDefault();
            e.stopPropagation();

            // Collect ALL styles from the username element and ALL its children
            var usernameStyle = usernameEl.getAttribute('style') || '';
            var usernameClasses = usernameEl.className || '';

            // Get styles from all nested spans and combine them
            var allSpans = usernameEl.querySelectorAll('span[style]');
            allSpans.forEach(function(span) {
                var spanStyle = span.getAttribute('style') || '';
                if (spanStyle) {
                    usernameStyle += ';' + spanStyle;
                }
                var spanClass = span.className || '';
                if (spanClass) {
                    usernameClasses += ' ' + spanClass;
                }
            });

            // Find the parent message element to get message styling
            var msgEl = usernameEl.parentElement;
            while (msgEl && msgEl.id !== 'messagebuffer' && !msgEl.id.startsWith('chat-msg-')) {
                msgEl = msgEl.parentElement;
            }

            // Extract ALL message styling from THIS specific message
            var msgStyle = '';
            var msgClasses = '';
            if (msgEl && msgEl.id !== 'messagebuffer') {
                var spans = msgEl.querySelectorAll('span[style], span[class*="text-"]');
                for (var i = 0; i < spans.length; i++) {
                    var span = spans[i];
                    var cls = span.className || '';
                    // Skip username/timestamp spans
                    if (cls.indexOf('username') !== -1 || cls.indexOf('timestamp') !== -1) continue;
                    // Skip spans inside username
                    if (span.closest('.username, .styled-username')) continue;
                    // Collect ALL styles from content spans (don't break, combine them)
                    var style = span.getAttribute('style');
                    if (style && style.length > 0) {
                        msgStyle += (msgStyle ? ';' : '') + style;
                    }
                    if (cls.indexOf('text-') !== -1) {
                        msgClasses += (msgClasses ? ' ' : '') + cls;
                    }
                }
            }

            // Debug: log what we captured
            console.log('Captured username style:', usernameStyle);
            console.log('Captured username classes:', usernameClasses);
            console.log('Captured message style:', msgStyle);
            console.log('Captured message classes:', msgClasses);

            openImpersonatePopup(username, usernameStyle, msgStyle, usernameClasses, msgClasses);
        } else {
            // Regular click: Add @mention to chatline
            var chatline = document.getElementById('chatline');
            if (chatline) {
                chatline.value += '@' + username + ' ';
                chatline.focus();
            }
        }
    }, true); // Use capture phase
}

// Mention notifications
function initMentionNotifications() {
    var myUsername = CLIENT && CLIENT.name ? CLIENT.name.toLowerCase() : '';

    // Register with dispatcher (priority 30 - runs after formatting)
    BokiChatDispatcher.register('mentionNotifications', function(data) {
        if (!myUsername) {
            myUsername = CLIENT && CLIENT.name ? CLIENT.name.toLowerCase() : '';
        }
        if (!myUsername || !data.msg) return false;

        // Skip buddy sync messages - they contain usernames but aren't real mentions
        if (isBuddySyncMessage(data.msg)) return false;

        var msgLower = data.msg.toLowerCase();
        if (msgLower.indexOf('@' + myUsername) !== -1 || msgLower.indexOf(myUsername) !== -1) {
            // Play sound
            if (soundEnabled) {
                mentionSound.currentTime = 0;
                mentionSound.play().catch(function() {});
            }
            // Highlight the message
            setTimeout(function() {
                var msgs = document.querySelectorAll('#messagebuffer > div');
                var lastMsg = msgs[msgs.length - 1];
                if (lastMsg && lastMsg.querySelector('.username')?.textContent.replace(/:$/, '').trim().toLowerCase() === data.username.toLowerCase()) {
                    lastMsg.classList.add('mention-highlight');
                }
            }, 100);
        }
        return false; // Continue to other handlers
    }, 30);
}

// User ignore list
function initIgnoreList() {
    // Add ignore option to user context
    $(document).on('contextmenu', '#messagebuffer .username', function(e) {
        e.preventDefault();
        var username = $(this).text().replace(/:$/, '').trim();
        if (confirm('Ignore messages from ' + username + '?')) {
            addToIgnoreList(username);
        }
    });

    // Register with dispatcher (priority 20 - runs after mentions)
    BokiChatDispatcher.register('ignoreList', function(data) {
        if (ignoredUsers.indexOf(data.username.toLowerCase()) !== -1) {
            setTimeout(function() {
                var msgs = document.querySelectorAll('#messagebuffer > div');
                var lastMsg = msgs[msgs.length - 1];
                if (lastMsg) {
                    lastMsg.classList.add('ignored-user-msg');
                    lastMsg.title = 'Message from ignored user';
                }
            }, 50);
        }
        return false; // Continue to other handlers
    }, 20);
}

function addToIgnoreList(username) {
    var lowerName = username.toLowerCase();
    if (ignoredUsers.indexOf(lowerName) === -1) {
        ignoredUsers.push(lowerName);
        localStorage.setItem('ignoredUsers', JSON.stringify(ignoredUsers));
    }
}

function removeFromIgnoreList(username) {
    var lowerName = username.toLowerCase();
    ignoredUsers = ignoredUsers.filter(function(u) { return u !== lowerName; });
    localStorage.setItem('ignoredUsers', JSON.stringify(ignoredUsers));
}

// Quote reply is now handled by replyToMsg function with socket interception

// Keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Escape - close popups
        if (e.key === 'Escape') {
            closeEmotePopup();
            closeTextStylePopup();
            closeImpersonatePopup();
            var settingsPanel = document.getElementById('settings-panel');
            if (settingsPanel) settingsPanel.classList.remove('visible');
            if (theaterMode) toggleTheaterMode();
        }

        // Slash - focus chat (when not in input)
        if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            e.preventDefault();
            var chatline = document.getElementById('chatline');
            if (chatline) chatline.focus();
        }

        // Ctrl+Shift+T - toggle theater mode
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            toggleTheaterMode();
        }
    });
}

// Theater mode
function toggleTheaterMode() {
    theaterMode = !theaterMode;
    document.body.classList.toggle('theater-mode', theaterMode);

    if (theaterMode && !document.getElementById('theater-exit-btn')) {
        var btn = document.createElement('button');
        btn.id = 'theater-exit-btn';
        btn.textContent = 'Exit Theater Mode (Esc)';
        btn.onclick = toggleTheaterMode;
        document.body.appendChild(btn);
    }
}

// Timestamp toggle
function toggleTimestamps() {
    timestampsVisible = !timestampsVisible;
    localStorage.setItem('timestampsVisible', timestampsVisible);
    applyTimestampVisibility();
}

function applyTimestampVisibility() {
    var style = document.getElementById('timestamp-visibility-style');
    if (!style) {
        style = document.createElement('style');
        style.id = 'timestamp-visibility-style';
        document.head.appendChild(style);
    }
    style.textContent = timestampsVisible ? '' : '.timestamp { display: none !important; }';
}

// Compact mode
function toggleCompactMode() {
    compactMode = !compactMode;
    localStorage.setItem('compactMode', compactMode);
    document.body.classList.toggle('compact-mode', compactMode);
}

// Font size
function setChatFontSize(size) {
    chatFontSize = size;
    localStorage.setItem('chatFontSize', size);
    applyChatFontSize();
}

function applyChatFontSize() {
    var style = document.getElementById('chat-fontsize-style');
    if (!style) {
        style = document.createElement('style');
        style.id = 'chat-fontsize-style';
        document.head.appendChild(style);
    }
    style.textContent = '#messagebuffer { font-size: ' + chatFontSize + 'px !important; }';
}

// Sound toggle
function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
}

// Settings panel
function createSettingsPanel() {
    if (document.getElementById('settings-panel')) return;

    var panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.innerHTML = '<div class="popup-header"><span>⚙️ Settings</span><button class="popup-close" onclick="closeSettingsPanel()">×</button></div>' +
        '<div class="settings-row"><span class="settings-label">Compact Mode</span><div class="settings-toggle' + (compactMode ? ' on' : '') + '" onclick="toggleCompactMode();this.classList.toggle(\'on\')"></div></div>' +
        '<div class="settings-row"><span class="settings-label">Sound Notifications</span><div class="settings-toggle' + (soundEnabled ? ' on' : '') + '" onclick="toggleSound();this.classList.toggle(\'on\')"></div></div>' +
        '<div class="settings-row"><span class="settings-label">Show Timestamps</span><div class="settings-toggle' + (timestampsVisible ? ' on' : '') + '" onclick="toggleTimestamps();this.classList.toggle(\'on\')"></div></div>' +
        '<div class="settings-row"><span class="settings-label">Font Size</span><input type="range" class="settings-slider" min="10" max="20" value="' + chatFontSize + '" oninput="setChatFontSize(this.value)"><span id="fontsize-val">' + chatFontSize + 'px</span></div>' +
        '<div class="settings-row"><span class="settings-label">Theater Mode</span><button class="btn btn-sm" onclick="toggleTheaterMode();closeSettingsPanel()">Enter</button></div>' +
        '<div class="settings-row"><span class="settings-label">Ignored Users</span><button class="btn btn-sm" onclick="showIgnoredUsers()">Manage</button></div>';
    document.body.appendChild(panel);
}

function openSettingsPanel() {
    createSettingsPanel();
    document.getElementById('settings-panel').classList.add('visible');
}

function closeSettingsPanel() {
    var panel = document.getElementById('settings-panel');
    if (panel) panel.classList.remove('visible');
}

function showIgnoredUsers() {
    if (ignoredUsers.length === 0) {
        alert('No ignored users.');
        return;
    }
    var result = prompt('Ignored users (remove one by typing their name):\\n' + ignoredUsers.join(', '));
    if (result) {
        removeFromIgnoreList(result.trim());
        alert(result.trim() + ' removed from ignore list.');
    }
}

// Add settings button to overflow menu
function addSettingsButton() {
    if (document.getElementById('overflow-settings-btn')) return;
    addToOverflowMenu(
        'settings-btn',
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#FFF" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z"/></svg>',
        'Settings',
        function() { openSettingsPanel(); }
    );
}

/* ========== SCREENSPAM SYSTEM ========== */
/* /screenspam command - displays message across video in zany ways */

// Screenspam configuration
var SCREENSPAM_COOLDOWN = 30000; // 30 seconds per user
var SCREENSPAM_DURATION = 5000; // 5 seconds display
var SCREENSPAM_MAX_LENGTH = 50; // Max characters
var screenspamCooldowns = {}; // Track cooldowns per user
var screenspamMarker = '\u200B\u200C\u200B'; // Zero-width chars as marker

// Inject screenspam CSS
(function() {
    var screenspamStyles = document.createElement('style');
    screenspamStyles.id = 'screenspam-styles';
    screenspamStyles.textContent = `
        /* Screenspam overlay container */
        #screenspam-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 9999;
        }

        /* Base screenspam message - HIGHLY LEGIBLE */
        .screenspam-msg {
            position: absolute;
            font-family: 'Impact', 'Arial Black', sans-serif;
            font-weight: bold;
            font-size: 48px;
            color: #fff;
            text-shadow:
                -4px -4px 0 #000,
                4px -4px 0 #000,
                -4px 4px 0 #000,
                4px 4px 0 #000,
                0 0 20px rgba(0,0,0,0.8);
            white-space: nowrap;
            pointer-events: none;
            z-index: 10000;
        }

        /* LEGIBLE FUN ANIMATIONS - No crazy spinning! */

        /* Rain down - falls gently from top */
        @keyframes screenspam-rain {
            0% { transform: translateY(-100%); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
        }

        /* Float across - gentle horizontal movement */
        @keyframes screenspam-float {
            0% { transform: translateX(-100%) translateY(0); }
            25% { transform: translateX(0%) translateY(-20px); }
            50% { transform: translateX(50%) translateY(20px); }
            75% { transform: translateX(75%) translateY(-10px); }
            100% { transform: translateX(100vw) translateY(0); }
        }

        /* Bounce in place - stays readable */
        @keyframes screenspam-bounce {
            0%, 100% { transform: translateY(0) scale(1); }
            25% { transform: translateY(-40px) scale(1.05); }
            50% { transform: translateY(0) scale(1); }
            75% { transform: translateY(-20px) scale(1.02); }
        }

        /* Grow and shrink - pulsing effect */
        @keyframes screenspam-pulse {
            0% { transform: scale(0.5); opacity: 0; }
            20% { transform: scale(1.2); opacity: 1; }
            40% { transform: scale(1); }
            60% { transform: scale(1.1); }
            80% { transform: scale(1); }
            100% { transform: scale(1.5); opacity: 0; }
        }

        /* Shake - vibrates in place */
        @keyframes screenspam-shake {
            0%, 100% { transform: translateX(0); }
            10% { transform: translateX(-10px); }
            20% { transform: translateX(10px); }
            30% { transform: translateX(-10px); }
            40% { transform: translateX(10px); }
            50% { transform: translateX(-5px); }
            60% { transform: translateX(5px); }
            70% { transform: translateX(-5px); }
            80% { transform: translateX(5px); }
            90% { transform: translateX(-2px); }
        }

        /* Spiral path - moves in gentle spiral, NO rotation */
        @keyframes screenspam-spiral {
            0% { transform: translate(0, 0); opacity: 0; }
            10% { transform: translate(10vw, 10vh); opacity: 1; }
            20% { transform: translate(5vw, 25vh); }
            30% { transform: translate(20vw, 35vh); }
            40% { transform: translate(10vw, 50vh); }
            50% { transform: translate(30vw, 45vh); }
            60% { transform: translate(20vw, 60vh); }
            70% { transform: translate(40vw, 55vh); }
            80% { transform: translate(30vw, 70vh); }
            90% { transform: translate(50vw, 65vh); opacity: 1; }
            100% { transform: translate(40vw, 80vh); opacity: 0; }
        }

        /* Wander - moves around randomly like an ant */
        @keyframes screenspam-wander {
            0% { transform: translate(0, 0); }
            10% { transform: translate(8vw, -5vh); }
            20% { transform: translate(3vw, 8vh); }
            30% { transform: translate(15vw, 3vh); }
            40% { transform: translate(10vw, 12vh); }
            50% { transform: translate(20vw, 5vh); }
            60% { transform: translate(12vw, 15vh); }
            70% { transform: translate(25vw, 8vh); }
            80% { transform: translate(18vw, 18vh); }
            90% { transform: translate(30vw, 10vh); }
            100% { transform: translate(22vw, 22vh); opacity: 0; }
        }

        /* Zoom in - grows from center */
        @keyframes screenspam-zoom {
            0% { transform: scale(0.1); opacity: 0; }
            20% { transform: scale(1); opacity: 1; }
            80% { transform: scale(1); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
        }

        /* Slide across - smooth horizontal */
        @keyframes screenspam-slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100vw); }
        }

        /* Pop up - appears with bounce */
        @keyframes screenspam-popup {
            0% { transform: scale(0) translateY(50px); opacity: 0; }
            30% { transform: scale(1.2) translateY(-10px); opacity: 1; }
            50% { transform: scale(0.95) translateY(5px); }
            70% { transform: scale(1.05) translateY(-3px); }
            85% { transform: scale(1) translateY(0); }
            100% { transform: scale(1) translateY(0); opacity: 0; }
        }

        /* Wave - gentle wave motion */
        @keyframes screenspam-wave {
            0% { transform: translateX(-100%) translateY(0); }
            20% { transform: translateX(-50%) translateY(-30px); }
            40% { transform: translateX(0%) translateY(30px); }
            60% { transform: translateX(50%) translateY(-30px); }
            80% { transform: translateX(80%) translateY(30px); }
            100% { transform: translateX(100vw) translateY(0); }
        }

        /* Drop and bounce - falls and bounces */
        @keyframes screenspam-drop {
            0% { transform: translateY(-100vh); }
            50% { transform: translateY(10vh); }
            65% { transform: translateY(-5vh); }
            80% { transform: translateY(5vh); }
            90% { transform: translateY(-2vh); }
            100% { transform: translateY(0); opacity: 0; }
        }

        /* Typewriter - appears letter by letter effect via scale */
        @keyframes screenspam-typewriter {
            0% { clip-path: inset(0 100% 0 0); opacity: 1; }
            80% { clip-path: inset(0 0 0 0); opacity: 1; }
            100% { clip-path: inset(0 0 0 0); opacity: 0; }
        }

        /* Glow pulse - glows brighter and dimmer */
        @keyframes screenspam-glow {
            0% { filter: brightness(1) drop-shadow(0 0 10px currentColor); opacity: 0; }
            20% { filter: brightness(1.5) drop-shadow(0 0 30px currentColor); opacity: 1; }
            40% { filter: brightness(1) drop-shadow(0 0 10px currentColor); }
            60% { filter: brightness(2) drop-shadow(0 0 50px currentColor); }
            80% { filter: brightness(1) drop-shadow(0 0 20px currentColor); }
            100% { filter: brightness(0.5) drop-shadow(0 0 5px currentColor); opacity: 0; }
        }

        /* Scatter - starts center, moves to random position */
        @keyframes screenspam-scatter1 {
            0% { transform: translate(0, 0) scale(0); opacity: 0; }
            20% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(-30vw, -20vh) scale(1); opacity: 0; }
        }
        @keyframes screenspam-scatter2 {
            0% { transform: translate(0, 0) scale(0); opacity: 0; }
            20% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(30vw, -25vh) scale(1); opacity: 0; }
        }
        @keyframes screenspam-scatter3 {
            0% { transform: translate(0, 0) scale(0); opacity: 0; }
            20% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(-25vw, 30vh) scale(1); opacity: 0; }
        }
        @keyframes screenspam-scatter4 {
            0% { transform: translate(0, 0) scale(0); opacity: 0; }
            20% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(35vw, 25vh) scale(1); opacity: 0; }
        }
        @keyframes screenspam-scatter5 {
            0% { transform: translate(0, 0) scale(0); opacity: 0; }
            20% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(0vw, -35vh) scale(1); opacity: 0; }
        }

        /* Swing - pendulum motion */
        @keyframes screenspam-swing {
            0% { transform: translateX(-50%) rotate(-15deg); transform-origin: top center; }
            25% { transform: translateX(-50%) rotate(15deg); }
            50% { transform: translateX(-50%) rotate(-10deg); }
            75% { transform: translateX(-50%) rotate(10deg); }
            100% { transform: translateX(-50%) rotate(0deg); opacity: 0; }
        }

        /* Jello wobble - legible version */
        @keyframes screenspam-jello {
            0% { transform: scale(1, 1); }
            10% { transform: scale(1.1, 0.9); }
            20% { transform: scale(0.9, 1.1); }
            30% { transform: scale(1.05, 0.95); }
            40% { transform: scale(0.95, 1.05); }
            50% { transform: scale(1.02, 0.98); }
            60% { transform: scale(0.98, 1.02); }
            70% { transform: scale(1.01, 0.99); }
            80% { transform: scale(0.99, 1.01); }
            90% { transform: scale(1, 1); }
            100% { transform: scale(1, 1); opacity: 0; }
        }

        /* Color cycle - hue shifts while staying in place */
        @keyframes screenspam-colorshift {
            0% { filter: hue-rotate(0deg); opacity: 0; transform: scale(0.8); }
            20% { filter: hue-rotate(0deg); opacity: 1; transform: scale(1); }
            40% { filter: hue-rotate(90deg); }
            60% { filter: hue-rotate(180deg); }
            80% { filter: hue-rotate(270deg); }
            100% { filter: hue-rotate(360deg); opacity: 0; transform: scale(1.2); }
        }

        /* Screenspam color variations - BRIGHT AND READABLE */
        .screenspam-color-0 {
            color: #ff3333;
            text-shadow: -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000,
                         0 0 30px #ff0000, 0 0 60px #ff0000;
        }
        .screenspam-color-1 {
            color: #33ff33;
            text-shadow: -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000,
                         0 0 30px #00ff00, 0 0 60px #00ff00;
        }
        .screenspam-color-2 {
            color: #33ffff;
            text-shadow: -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000,
                         0 0 30px #00ffff, 0 0 60px #00ffff;
        }
        .screenspam-color-3 {
            color: #ff33ff;
            text-shadow: -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000,
                         0 0 30px #ff00ff, 0 0 60px #ff00ff;
        }
        .screenspam-color-4 {
            color: #ffff33;
            text-shadow: -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000,
                         0 0 30px #ffff00, 0 0 60px #ffff00;
        }
        .screenspam-color-5 {
            color: #ff9933;
            text-shadow: -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000,
                         0 0 30px #ff6600, 0 0 60px #ff6600;
        }
        .screenspam-color-6 {
            color: #ff99cc;
            text-shadow: -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000,
                         0 0 30px #ff69b4, 0 0 60px #ff69b4;
        }
        .screenspam-color-7 {
            color: #ffffff;
            text-shadow: -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000,
                         0 0 30px #fff, 0 0 60px #fff;
        }

        /* Toast indicator */
        .screenspam-cooldown-toast {
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 50, 50, 0.9);
            color: #fff;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 999999;
            animation: toast-fade 2s ease-out forwards;
        }
        @keyframes toast-fade {
            0% { opacity: 1; transform: translateX(-50%) translateY(0); }
            70% { opacity: 1; }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(screenspamStyles);
})();

/* ========== SUBTITLE SYSTEM ========== */
/* Authentic DVD-style subtitles synced across all viewers */
/* Command: /sub message or /sub line1 / line2 / line3 for sequences */

var SUBTITLE_CONFIG = {
    baseDuration: 2500,      // Minimum display time (ms)
    perCharDuration: 60,     // Additional time per character (ms)
    maxDuration: 8000,       // Maximum display time (ms)
    maxLength: 150,          // Max characters per subtitle
    fadeInTime: 300,         // Fade in duration (ms)
    fadeOutTime: 300,        // Fade out duration (ms)
    gapBetweenSubs: 200      // Gap between sequential subtitles (ms)
};

var subtitleMarker = '\u200B\u200D\u200B'; // Different marker from screenspam
var subtitleQueue = [];      // Queue for sequential subtitles
var subtitlePlaying = false; // Is a subtitle currently showing

// Inject subtitle CSS
(function() {
    var subtitleStyles = document.createElement('style');
    subtitleStyles.id = 'subtitle-styles';
    subtitleStyles.textContent = `
        /* Subtitle overlay container */
        #subtitle-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 9998;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            padding-bottom: 4%;
            box-sizing: border-box;
        }

        /* Authentic DVD-style subtitle */
        .subtitle-msg {
            font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
            font-weight: bold;
            font-size: clamp(18px, 4.5vh, 42px);
            color: #ffffff;
            text-align: center;
            max-width: 80%;
            line-height: 1.4;
            padding: 0.2em 0.5em;

            /* Classic DVD subtitle stroke effect - 8 shadows for full outline */
            text-shadow:
                /* Black outline - all 8 directions */
                -2px -2px 0 #000,
                2px -2px 0 #000,
                -2px 2px 0 #000,
                2px 2px 0 #000,
                -2px 0 0 #000,
                2px 0 0 #000,
                0 -2px 0 #000,
                0 2px 0 #000,
                /* Subtle outer glow for depth */
                0 0 8px rgba(0, 0, 0, 0.8);

            /* Smooth fade animation */
            opacity: 0;
            transition: opacity 300ms ease-in-out;
        }

        /* Visible state */
        .subtitle-msg.visible {
            opacity: 1;
        }

        /* Fading out state */
        .subtitle-msg.fading {
            opacity: 0;
            transition: opacity 300ms ease-in-out;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
            #subtitle-overlay {
                padding-bottom: 5%;
            }
            .subtitle-msg {
                font-size: clamp(14px, 4vh, 28px);
                max-width: 90%;
                text-shadow:
                    -1px -1px 0 #000,
                    1px -1px 0 #000,
                    -1px 1px 0 #000,
                    1px 1px 0 #000,
                    -1px 0 0 #000,
                    1px 0 0 #000,
                    0 -1px 0 #000,
                    0 1px 0 #000,
                    0 0 6px rgba(0, 0, 0, 0.8);
            }
        }

        /* Toast for subtitle errors */
        .subtitle-toast {
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(50, 50, 50, 0.95);
            color: #fff;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 999999;
            animation: subtitle-toast-fade 2.5s ease-out forwards;
        }
        @keyframes subtitle-toast-fade {
            0% { opacity: 1; transform: translateX(-50%) translateY(0); }
            80% { opacity: 1; }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(subtitleStyles);
})();

// Create or get subtitle overlay
function createSubtitleOverlay() {
    var videoContainer = document.getElementById('video-container');
    if (!videoContainer) {
        videoContainer = document.getElementById('videowrap');
    }
    if (!videoContainer) return null;

    var overlay = document.getElementById('subtitle-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'subtitle-overlay';
        videoContainer.style.position = 'relative';
        videoContainer.appendChild(overlay);
    }
    return overlay;
}

// Calculate duration based on text length (reading speed)
function calculateSubtitleDuration(text) {
    var duration = SUBTITLE_CONFIG.baseDuration + (text.length * SUBTITLE_CONFIG.perCharDuration);
    return Math.min(SUBTITLE_CONFIG.maxDuration, Math.max(SUBTITLE_CONFIG.baseDuration, duration));
}

// Display a single subtitle
function displaySubtitle(text, onComplete) {
    var overlay = createSubtitleOverlay();
    if (!overlay) {
        if (onComplete) onComplete();
        return;
    }

    // Remove any existing subtitle
    var existing = overlay.querySelector('.subtitle-msg');
    if (existing) {
        existing.remove();
    }

    // Create subtitle element
    var el = document.createElement('div');
    el.className = 'subtitle-msg';
    el.textContent = text;
    overlay.appendChild(el);

    // Calculate display duration
    var displayDuration = calculateSubtitleDuration(text);

    // Trigger fade in
    requestAnimationFrame(function() {
        el.classList.add('visible');
    });

    // Schedule fade out
    setTimeout(function() {
        el.classList.remove('visible');
        el.classList.add('fading');

        // Remove after fade out completes
        setTimeout(function() {
            if (el.parentNode) el.remove();
            if (onComplete) onComplete();
        }, SUBTITLE_CONFIG.fadeOutTime);

    }, displayDuration);
}

// Process subtitle queue (plays subtitles in sequence)
function processSubtitleQueue() {
    if (subtitlePlaying || subtitleQueue.length === 0) return;

    subtitlePlaying = true;
    var nextSub = subtitleQueue.shift();

    displaySubtitle(nextSub, function() {
        subtitlePlaying = false;
        // Small gap before next subtitle
        setTimeout(function() {
            processSubtitleQueue();
        }, SUBTITLE_CONFIG.gapBetweenSubs);
    });
}

// Queue subtitles for display (handles sequences)
function queueSubtitles(subtitles) {
    // Add all subtitles to queue
    for (var i = 0; i < subtitles.length; i++) {
        var trimmed = subtitles[i].trim();
        if (trimmed.length > 0) {
            subtitleQueue.push(trimmed);
        }
    }
    // Start processing if not already
    processSubtitleQueue();
}

// Show toast notification
function showSubtitleToast(message) {
    var existing = document.querySelector('.subtitle-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'subtitle-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function() {
        if (toast.parentNode) toast.remove();
    }, 2500);
}

// Intercept /sub command
function initSubtitleCommand() {
    var chatline = document.getElementById('chatline');
    if (!chatline) return;

    chatline.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter' || e.shiftKey) return;

        var msg = chatline.value.trim();
        var msgLower = msg.toLowerCase();

        // Check for /sub command
        if (!msgLower.startsWith('/sub ')) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        // Extract content after "/sub "
        var content = msg.substring(5).trim();

        // Validate
        if (content.length === 0) {
            showSubtitleToast('Subtitle requires a message!');
            return;
        }

        // Split by / for sequences, but check individual lengths
        var parts = content.split('/');
        var validParts = [];
        var tooLong = false;

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i].trim();
            if (part.length > 0) {
                if (part.length > SUBTITLE_CONFIG.maxLength) {
                    tooLong = true;
                    break;
                }
                validParts.push(part);
            }
        }

        if (tooLong) {
            showSubtitleToast('Each subtitle must be under ' + SUBTITLE_CONFIG.maxLength + ' characters!');
            return;
        }

        if (validParts.length === 0) {
            showSubtitleToast('Subtitle requires a message!');
            return;
        }

        // Encode subtitles as pipe-separated (since / is used in user input)
        var encoded = validParts.join('|');

        // Send with subtitle marker
        var markedMessage = subtitleMarker + 'SUBTITLE:' + encoded + ':SUBTITLE' + subtitleMarker;

        // Check message length for Cytube limit
        if (markedMessage.length > 240) {
            showSubtitleToast('Subtitle sequence too long! Try fewer lines.');
            return;
        }

        if (typeof socket !== 'undefined' && socket.emit) {
            socket.emit('chatMsg', { msg: markedMessage });
        }

        // Clear input
        chatline.value = '';

    }, true); // Use capture phase
}

// Process incoming subtitle messages
function initSubtitleReceiver() {
    // Register with dispatcher (priority 75 - after buddy sync, before screenspam)
    BokiChatDispatcher.register('subtitle', function(data) {
        if (!data.msg) return false;

        // Check for subtitle marker
        var markerPattern = subtitleMarker + 'SUBTITLE:';
        var endMarker = ':SUBTITLE' + subtitleMarker;

        if (data.msg.indexOf(markerPattern) !== -1) {
            var startIdx = data.msg.indexOf(markerPattern) + markerPattern.length;
            var endIdx = data.msg.indexOf(endMarker);

            if (endIdx > startIdx) {
                var encoded = data.msg.substring(startIdx, endIdx);
                // Decode pipe-separated subtitles
                var subtitles = encoded.split('|');

                // Queue them for display
                queueSubtitles(subtitles);

                // Hide the chat message
                hideSubtitleMessage();
            }
        }
        return false; // Continue to other handlers
    }, 75);
}

// Hide subtitle messages from chat
function hideSubtitleMessage() {
    setTimeout(function() {
        var msgs = document.querySelectorAll('#messagebuffer > div');
        for (var i = msgs.length - 1; i >= 0; i--) {
            var msgEl = msgs[i];
            if (msgEl.textContent.indexOf('SUBTITLE:') !== -1) {
                msgEl.style.display = 'none';
                break;
            }
        }
    }, 100);
}

// Filter subtitle messages from chat history on page load
function filterSubtitlesFromHistory() {
    var msgs = document.querySelectorAll('#messagebuffer > div');
    var hiddenCount = 0;

    for (var i = 0; i < msgs.length; i++) {
        var msgEl = msgs[i];
        var text = msgEl.textContent || '';

        // Check for subtitle broadcast markers
        if (text.indexOf('SUBTITLE:') !== -1) {
            msgEl.style.display = 'none';
            hiddenCount++;
            continue;
        }

        // Check for raw /sub commands
        var msgSpan = msgEl.querySelector('.chat-msg');
        var msgText = msgSpan ? msgSpan.textContent.trim() : text;

        if (/^\/sub\s/.test(msgText)) {
            msgEl.style.display = 'none';
            hiddenCount++;
        }
    }

    if (hiddenCount > 0) {
        console.log('[Subtitle] Filtered', hiddenCount, 'subtitle messages from chat history');
    }
}

// Initialize subtitle system
function initSubtitleSystem() {
    initSubtitleCommand();
    initSubtitleReceiver();
    createSubtitleOverlay();
    filterSubtitlesFromHistory();
    console.log('[Subtitle] System initialized');
}

/* ========== END SUBTITLE SYSTEM ========== */

/* ========== PLAYLIST SRT SUBTITLE SYSTEM ========== */
/* Attach .srt subtitle files to playlist items for time-synced display */
/* Subtitles are broadcast to all viewers via Pusher */

var SRT_SUBTITLE_CONFIG = {
    pollInterval: 250,       // Check video time every 250ms
    chunkSize: 8000,         // Max Pusher event payload per chunk (bytes)
    maxFileSize: 512000,     // Max .srt file size (500KB)
    storageKey: 'playlistSrtSubtitles'
};

// State
var srtSubtitles = {};           // mediaKey -> [{start, end, text}]
var activeSrtMediaKey = null;    // Media key of currently playing video
var srtPollTimer = null;         // Polling interval ID
var currentSrtCueIndex = -1;     // Index of currently displayed cue
var srtEnabled = true;           // Global toggle for SRT display
var srtChunkBuffer = {};         // For reassembling chunked Pusher broadcasts

// ===== SRT PARSER =====

function parseSRT(srtText) {
    if (!srtText || typeof srtText !== 'string') return [];

    var cues = [];
    // Normalize line endings
    var text = srtText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Split into blocks by double newlines
    var blocks = text.split(/\n\n+/);

    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i].trim();
        if (!block) continue;

        var lines = block.split('\n');
        // Need at least 2 lines: timecode + text (sequence number may be absent)
        if (lines.length < 2) continue;

        // Find the timecode line (contains -->)
        var timecodeLineIdx = -1;
        for (var j = 0; j < lines.length; j++) {
            if (lines[j].indexOf('-->') !== -1) {
                timecodeLineIdx = j;
                break;
            }
        }
        if (timecodeLineIdx === -1) continue;

        var timeParts = lines[timecodeLineIdx].split('-->');
        if (timeParts.length !== 2) continue;

        var startTime = parseSrtTimestamp(timeParts[0].trim());
        var endTime = parseSrtTimestamp(timeParts[1].trim());

        if (startTime === null || endTime === null) continue;

        // Text is everything after the timecode line
        var subtitleText = [];
        for (var k = timecodeLineIdx + 1; k < lines.length; k++) {
            var line = lines[k].trim();
            if (line) subtitleText.push(line);
        }

        if (subtitleText.length === 0) continue;

        cues.push({
            start: startTime,
            end: endTime,
            text: subtitleText.join('\n')
        });
    }

    // Sort by start time
    cues.sort(function(a, b) { return a.start - b.start; });

    return cues;
}

// Parse SRT timestamp "HH:MM:SS,mmm" or "HH:MM:SS.mmm" to seconds
function parseSrtTimestamp(ts) {
    // Handle both comma and period as ms separator
    ts = ts.replace(',', '.');
    // Remove any position/styling data after the timestamp
    ts = ts.split(' ')[0];

    var parts = ts.split(':');
    if (parts.length !== 3) return null;

    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);
    var secParts = parts[2].split('.');
    var seconds = parseInt(secParts[0], 10);
    var ms = secParts.length > 1 ? parseInt(secParts[1], 10) : 0;

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || isNaN(ms)) return null;

    return hours * 3600 + minutes * 60 + seconds + ms / 1000;
}

// ===== TIME-SYNCED DISPLAY ENGINE =====

function startSrtSync() {
    stopSrtSync(); // Clear any existing timer

    if (!activeSrtMediaKey || !srtSubtitles[activeSrtMediaKey]) return;
    if (!srtEnabled) return;

    currentSrtCueIndex = -1;
    console.log('[SRT] Starting sync for:', activeSrtMediaKey, '(' + srtSubtitles[activeSrtMediaKey].length + ' cues)');

    srtPollTimer = setInterval(function() {
        pollSrtTime();
    }, SRT_SUBTITLE_CONFIG.pollInterval);
}

function stopSrtSync() {
    if (srtPollTimer) {
        clearInterval(srtPollTimer);
        srtPollTimer = null;
    }
    currentSrtCueIndex = -1;
    hideSrtSubtitle();
}

function pollSrtTime() {
    if (!activeSrtMediaKey || !srtSubtitles[activeSrtMediaKey]) {
        stopSrtSync();
        return;
    }

    // Get current playback time from Cytube's PLAYER
    if (typeof PLAYER === 'undefined' || !PLAYER) return;

    var currentTime = null;

    // Cytube PLAYER.getTime() uses callback in some versions, returns directly in others
    if (typeof PLAYER.getTime === 'function') {
        try {
            var result = PLAYER.getTime(function(t) {
                currentTime = t;
            });
            // Some implementations return the value directly
            if (typeof result === 'number') {
                currentTime = result;
            }
        } catch (e) {
            return;
        }
    } else if (PLAYER.currentTime !== undefined) {
        currentTime = PLAYER.currentTime;
    }

    if (currentTime === null || typeof currentTime !== 'number') return;

    var cues = srtSubtitles[activeSrtMediaKey];
    var foundIndex = -1;

    // Binary search for active cue
    var low = 0, high = cues.length - 1;
    while (low <= high) {
        var mid = Math.floor((low + high) / 2);
        if (currentTime < cues[mid].start) {
            high = mid - 1;
        } else if (currentTime > cues[mid].end) {
            low = mid + 1;
        } else {
            foundIndex = mid;
            break;
        }
    }

    if (foundIndex !== currentSrtCueIndex) {
        currentSrtCueIndex = foundIndex;
        if (foundIndex >= 0) {
            displaySrtSubtitle(cues[foundIndex].text);
        } else {
            hideSrtSubtitle();
        }
    }
}

function displaySrtSubtitle(text) {
    var overlay = createSubtitleOverlay();
    if (!overlay) return;

    var el = overlay.querySelector('.srt-subtitle-msg');
    if (!el) {
        el = document.createElement('div');
        el.className = 'subtitle-msg srt-subtitle-msg visible';
        overlay.appendChild(el);
    }

    // Convert newlines to <br> for multi-line subtitles, escape HTML first
    var safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    el.innerHTML = safeText.replace(/\n/g, '<br>');
    el.classList.add('visible');
    el.classList.remove('fading');
}

function hideSrtSubtitle() {
    var overlay = document.getElementById('subtitle-overlay');
    if (!overlay) return;

    var el = overlay.querySelector('.srt-subtitle-msg');
    if (el) {
        el.classList.remove('visible');
        el.classList.add('fading');
        setTimeout(function() {
            if (el.parentNode) el.remove();
        }, 300);
    }
}

// ===== STORAGE =====

function saveSrtSubtitles() {
    try {
        localStorage.setItem(SRT_SUBTITLE_CONFIG.storageKey, JSON.stringify(srtSubtitles));
    } catch (e) {
        console.warn('[SRT] Failed to save to localStorage:', e);
    }
}

function loadSrtSubtitles() {
    try {
        var saved = localStorage.getItem(SRT_SUBTITLE_CONFIG.storageKey);
        if (saved) {
            srtSubtitles = JSON.parse(saved);
        }
    } catch (e) {
        srtSubtitles = {};
    }
}

// ===== MEDIA CHANGE DETECTION =====

function getCurrentMediaKey() {
    var activeEntry = document.querySelector('.queue_entry.queue_active');
    if (activeEntry) {
        return getMediaKeyFromEntry(activeEntry);
    }
    return null;
}

function onMediaChange() {
    stopSrtSync();

    var mediaKey = getCurrentMediaKey();
    activeSrtMediaKey = mediaKey;

    // Update the video button state
    updateSrtVideoButton();

    if (mediaKey && srtSubtitles[mediaKey] && srtEnabled) {
        // Small delay for player to initialize
        setTimeout(function() {
            startSrtSync();
        }, 500);
    }
}

// ===== POPUP UI =====

var currentSrtPopupKey = null;

function createSrtPopup() {
    if (document.getElementById('srt-popup-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'srt-popup-overlay';
    overlay.onclick = function(e) {
        if (e.target === overlay) closeSrtPopup();
    };

    overlay.innerHTML = [
        '<div id="srt-popup">',
        '  <div id="srt-popup-header">',
        '    <span>Attach Subtitles (.srt)</span>',
        '    <button id="srt-popup-close" onclick="closeSrtPopup()">&times;</button>',
        '  </div>',
        '  <div id="srt-popup-body">',
        '    <div id="srt-popup-video-title"></div>',
        '    <label>Upload .srt file</label>',
        '    <input type="file" id="srt-file-input" accept=".srt,.txt" />',
        '    <label style="margin-top:12px">Or paste .srt content</label>',
        '    <textarea id="srt-text-input" placeholder="1\n00:00:01,000 --> 00:00:04,000\nFirst subtitle line\n\n2\n00:00:05,000 --> 00:00:08,000\nSecond subtitle line" rows="8"></textarea>',
        '    <div id="srt-popup-info"></div>',
        '    <div id="srt-popup-actions">',
        '      <button id="srt-apply-btn" onclick="applySrtFromPopup()">Apply Subtitles</button>',
        '      <button id="srt-remove-btn" onclick="removeSrtFromPopup()">Remove</button>',
        '      <button id="srt-cancel-btn" onclick="closeSrtPopup()">Cancel</button>',
        '    </div>',
        '    <div id="srt-popup-status"></div>',
        '  </div>',
        '</div>'
    ].join('\n');

    document.body.appendChild(overlay);
}

function openSrtPopup(mediaKey, videoTitle) {
    createSrtPopup();

    currentSrtPopupKey = mediaKey;

    var overlay = document.getElementById('srt-popup-overlay');
    overlay.classList.add('visible');

    // Show video title
    var titleEl = document.getElementById('srt-popup-video-title');
    if (titleEl) {
        titleEl.textContent = videoTitle || mediaKey || 'Unknown video';
    }

    // Clear inputs
    var fileInput = document.getElementById('srt-file-input');
    if (fileInput) fileInput.value = '';
    var textInput = document.getElementById('srt-text-input');
    if (textInput) textInput.value = '';

    // Show info about existing subtitles
    var infoEl = document.getElementById('srt-popup-info');
    if (infoEl) {
        if (srtSubtitles[mediaKey]) {
            infoEl.textContent = 'Current: ' + srtSubtitles[mediaKey].length + ' subtitle cues loaded';
            infoEl.style.color = '#8f8';
        } else {
            infoEl.textContent = 'No subtitles attached to this video';
            infoEl.style.color = '#aaa';
        }
    }

    // Clear status
    var status = document.getElementById('srt-popup-status');
    if (status) {
        status.textContent = '';
        status.className = '';
    }
}

function closeSrtPopup() {
    var overlay = document.getElementById('srt-popup-overlay');
    if (overlay) overlay.classList.remove('visible');
    currentSrtPopupKey = null;
}

function showSrtStatus(msg, type) {
    var status = document.getElementById('srt-popup-status');
    if (!status) return;
    status.textContent = msg;
    status.className = 'srt-status-' + type;
}

function applySrtFromPopup() {
    if (!currentSrtPopupKey) return;

    var fileInput = document.getElementById('srt-file-input');
    var textInput = document.getElementById('srt-text-input');

    // Prefer file if selected
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        var file = fileInput.files[0];
        if (file.size > SRT_SUBTITLE_CONFIG.maxFileSize) {
            showSrtStatus('File too large (max 500KB)', 'error');
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            processAndApplySrt(e.target.result);
        };
        reader.onerror = function() {
            showSrtStatus('Failed to read file', 'error');
        };
        reader.readAsText(file);
    } else if (textInput && textInput.value.trim()) {
        processAndApplySrt(textInput.value);
    } else {
        showSrtStatus('Upload a file or paste .srt content', 'error');
    }
}

function processAndApplySrt(srtText) {
    var cues = parseSRT(srtText);

    if (cues.length === 0) {
        showSrtStatus('No valid subtitle cues found. Check the .srt format.', 'error');
        return;
    }

    // Store subtitles
    srtSubtitles[currentSrtPopupKey] = cues;
    saveSrtSubtitles();

    showSrtStatus('Loaded ' + cues.length + ' subtitle cues', 'success');

    // Update info
    var infoEl = document.getElementById('srt-popup-info');
    if (infoEl) {
        infoEl.textContent = 'Current: ' + cues.length + ' subtitle cues loaded';
        infoEl.style.color = '#8f8';
    }

    // Broadcast via Pusher to other viewers
    broadcastSrtSubtitles(currentSrtPopupKey, cues);

    // If this is the currently playing video, start sync
    if (currentSrtPopupKey === activeSrtMediaKey) {
        startSrtSync();
    }

    // Update button states
    updateAllSrtButtonStates();
    updateSrtVideoButton();

    setTimeout(closeSrtPopup, 1200);
}

function removeSrtFromPopup() {
    if (!currentSrtPopupKey) return;

    delete srtSubtitles[currentSrtPopupKey];
    saveSrtSubtitles();

    // Stop sync if currently playing
    if (currentSrtPopupKey === activeSrtMediaKey) {
        stopSrtSync();
    }

    // Broadcast removal via Pusher
    broadcastSrtRemoval(currentSrtPopupKey);

    showSrtStatus('Subtitles removed', 'success');

    var infoEl = document.getElementById('srt-popup-info');
    if (infoEl) {
        infoEl.textContent = 'No subtitles attached to this video';
        infoEl.style.color = '#aaa';
    }

    updateAllSrtButtonStates();
    updateSrtVideoButton();

    setTimeout(closeSrtPopup, 800);
}

// ===== VIDEO PLAYER BUTTON =====

function addSrtVideoButton() {
    if (document.getElementById('overflow-srt-video-btn')) return;

    addToOverflowMenu(
        'srt-video-btn',
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#FFF" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2zm-6-4h8v2h-8v-2z"/></svg>',
        'Subtitles (.srt)',
        function() {
            var mediaKey = getCurrentMediaKey();
            if (!mediaKey) {
                showSubtitleToast('No video currently playing');
                return;
            }
            var activeEntry = document.querySelector('.queue_entry.queue_active');
            var title = '';
            if (activeEntry) {
                var titleEl = activeEntry.querySelector('.qe_title');
                title = titleEl ? titleEl.textContent : '';
            }
            openSrtPopup(mediaKey, title);
        }
    );

    updateSrtVideoButton();
}

function updateSrtVideoButton() {
    var btn = document.getElementById('overflow-srt-video-btn');
    if (!btn) return;

    var mediaKey = getCurrentMediaKey();
    if (mediaKey && srtSubtitles[mediaKey]) {
        btn.classList.add('srt-active');
        var label = btn.querySelector('.overflow-label');
        if (label) label.textContent = 'Subtitles (' + srtSubtitles[mediaKey].length + ' cues)';
    } else {
        btn.classList.remove('srt-active');
        var label = btn.querySelector('.overflow-label');
        if (label) label.textContent = 'Subtitles (.srt)';
    }
}

// ===== PLAYLIST ENTRY BUTTONS =====

function addSrtButton(entryElement) {
    if (!entryElement) return;
    if (entryElement.querySelector('.srt-btn')) return;

    var btn = document.createElement('button');
    btn.className = 'srt-btn';
    btn.textContent = 'CC';
    btn.title = 'Attach subtitles (.srt)';

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();

        var mediaKey = getMediaKeyFromEntry(entryElement);
        if (!mediaKey) return;

        var titleEl = entryElement.querySelector('.qe_title');
        var title = titleEl ? titleEl.textContent : '';
        openSrtPopup(mediaKey, title);
    });

    entryElement.appendChild(btn);

    // Update state
    updateSrtButtonState(entryElement);
}

function updateSrtButtonState(entryElement) {
    var btn = entryElement.querySelector('.srt-btn');
    if (!btn) return;

    var mediaKey = getMediaKeyFromEntry(entryElement);
    if (mediaKey && srtSubtitles[mediaKey]) {
        btn.classList.add('srt-has-subs');
        btn.title = 'Subtitles loaded (' + srtSubtitles[mediaKey].length + ' cues)';
    } else {
        btn.classList.remove('srt-has-subs');
        btn.title = 'Attach subtitles (.srt)';
    }
}

function addAllSrtButtons() {
    var entries = document.querySelectorAll('#queue .queue_entry');
    entries.forEach(function(entry) {
        addSrtButton(entry);
    });
}

function updateAllSrtButtonStates() {
    var entries = document.querySelectorAll('#queue .queue_entry');
    entries.forEach(function(entry) {
        updateSrtButtonState(entry);
    });
}

// ===== WEBSOCKET BROADCAST =====

function broadcastSrtSubtitles(mediaKey, cues) {
    if (!syncEnabled) {
        console.log('[SRT] Sync not available, subtitles stored locally only');
        return;
    }

    var payload = JSON.stringify(cues);
    var chunkSize = SRT_SUBTITLE_CONFIG.chunkSize;
    var totalChunks = Math.ceil(payload.length / chunkSize);
    var sessionId = mediaKey + '_' + Date.now();

    console.log('[SRT] Broadcasting subtitles:', cues.length, 'cues in', totalChunks, 'chunk(s)');

    // Send chunks with 150ms delay between each to avoid Pusher rate limits
    function sendChunk(i) {
        if (i >= totalChunks) return;
        var chunk = payload.substring(i * chunkSize, (i + 1) * chunkSize);
        wsSend('srt-subtitle', {
            from: getMyUsername(),
            mediaKey: mediaKey,
            sessionId: sessionId,
            chunkIndex: i,
            totalChunks: totalChunks,
            data: chunk
        });
        if (i + 1 < totalChunks) {
            setTimeout(function() { sendChunk(i + 1); }, 150);
        }
    }
    sendChunk(0);
}

function broadcastSrtRemoval(mediaKey) {
    if (!syncEnabled) return;

    wsSend('srt-remove', {
        from: getMyUsername(),
        mediaKey: mediaKey
    });
}

function handleSrtBroadcast(data) {
    if (!data || !data.mediaKey || !data.sessionId) return;

    var sessionId = data.sessionId;

    // Initialize buffer for this session
    if (!srtChunkBuffer[sessionId]) {
        srtChunkBuffer[sessionId] = {
            mediaKey: data.mediaKey,
            totalChunks: data.totalChunks,
            chunks: {},
            received: 0,
            timestamp: Date.now()
        };
    }

    var buffer = srtChunkBuffer[sessionId];
    buffer.chunks[data.chunkIndex] = data.data;
    buffer.received++;

    // Check if we have all chunks
    if (buffer.received === buffer.totalChunks) {
        // Reassemble
        var fullPayload = '';
        for (var i = 0; i < buffer.totalChunks; i++) {
            fullPayload += buffer.chunks[i];
        }

        try {
            var cues = JSON.parse(fullPayload);
            srtSubtitles[buffer.mediaKey] = cues;
            saveSrtSubtitles();

            console.log('[SRT] Received subtitles from', data.from, ':', cues.length, 'cues for', buffer.mediaKey);

            // If this is the current video, start sync
            if (buffer.mediaKey === activeSrtMediaKey && srtEnabled) {
                startSrtSync();
            }

            updateAllSrtButtonStates();
            updateSrtVideoButton();
        } catch (e) {
            console.warn('[SRT] Failed to parse received subtitle data:', e);
        }

        // Clean up buffer
        delete srtChunkBuffer[sessionId];
    }

    // Clean up stale buffers (older than 30 seconds)
    var now = Date.now();
    for (var sid in srtChunkBuffer) {
        if (now - srtChunkBuffer[sid].timestamp > 30000) {
            delete srtChunkBuffer[sid];
        }
    }
}

function handleSrtRemoval(data) {
    if (!data || !data.mediaKey) return;

    delete srtSubtitles[data.mediaKey];
    saveSrtSubtitles();

    if (data.mediaKey === activeSrtMediaKey) {
        stopSrtSync();
    }

    updateAllSrtButtonStates();
    updateSrtVideoButton();

    console.log('[SRT] Subtitles removed by', data.from, 'for', data.mediaKey);
}

// ===== SYNC LISTENER SETUP =====

// Check if SRT sync is ready (listeners are centralized in connectWebSocket)
function initSrtSync() {
    if (!syncEnabled) return false;
    console.log('[SRT] Sync listeners active (via central message router)');
    return true;
}

// ===== CSS INJECTION =====

(function injectSrtCSS() {
    var style = document.createElement('style');
    style.id = 'srt-subtitle-styles';
    style.textContent = `
        /* Playlist Entry SRT Button */
        .queue_entry .srt-btn {
            display: none;
            position: absolute;
            right: 36px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(80, 80, 80, 0.8);
            border: none;
            border-radius: 3px;
            color: #ccc;
            font-size: 10px;
            font-weight: bold;
            font-family: monospace;
            padding: 2px 5px;
            cursor: pointer;
            z-index: 10;
            transition: all 0.2s;
            letter-spacing: 0.5px;
        }
        .queue_entry:hover .srt-btn {
            display: block;
        }
        .queue_entry .srt-btn:hover {
            background: rgba(120, 120, 120, 0.9);
            color: #fff;
        }
        .queue_entry .srt-btn.srt-has-subs {
            display: block;
            background: rgba(40, 100, 40, 0.8);
            color: #8f8;
        }
        .queue_entry .srt-btn.srt-has-subs:hover {
            background: rgba(40, 120, 40, 0.95);
            color: #fff;
        }

        /* SRT Popup Overlay */
        #srt-popup-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 999999;
            align-items: center;
            justify-content: center;
        }
        #srt-popup-overlay.visible {
            display: flex !important;
        }

        /* SRT Popup */
        #srt-popup {
            background: #1e1e24;
            border: 2px solid #555;
            border-radius: 12px;
            padding: 0;
            width: 460px;
            max-width: 92vw;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);
        }
        #srt-popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 18px;
            background: #2d2d35;
            border-radius: 10px 10px 0 0;
            position: sticky;
            top: 0;
            z-index: 1;
        }
        #srt-popup-header span {
            color: #fff;
            font-weight: bold;
            font-size: 15px;
        }
        #srt-popup-close {
            background: #e44;
            border: none;
            color: #fff;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #srt-popup-close:hover { background: #f66; }
        #srt-popup-body {
            padding: 16px 18px;
        }
        #srt-popup-body label {
            display: block;
            color: #aaa;
            font-size: 11px;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        #srt-popup-video-title {
            color: #ddd;
            font-size: 13px;
            margin-bottom: 14px;
            padding: 8px 10px;
            background: #252530;
            border-radius: 6px;
            word-break: break-word;
            border-left: 3px solid #8F6409;
        }
        #srt-file-input {
            width: 100%;
            padding: 8px;
            background: #333;
            border: 1px solid #555;
            border-radius: 6px;
            color: #fff;
            font-size: 13px;
            box-sizing: border-box;
            margin-bottom: 4px;
            cursor: pointer;
        }
        #srt-file-input::file-selector-button {
            background: #444;
            color: #fff;
            border: 1px solid #666;
            border-radius: 4px;
            padding: 4px 10px;
            margin-right: 10px;
            cursor: pointer;
        }
        #srt-file-input::file-selector-button:hover {
            background: #555;
        }
        #srt-text-input {
            width: 100%;
            padding: 10px;
            background: #2a2a32;
            border: 1px solid #555;
            border-radius: 6px;
            color: #ccc;
            font-size: 12px;
            font-family: 'Courier New', monospace;
            box-sizing: border-box;
            resize: vertical;
            line-height: 1.5;
        }
        #srt-text-input:focus {
            outline: none;
            border-color: #888;
        }
        #srt-popup-info {
            font-size: 12px;
            margin: 10px 0;
            padding: 6px 8px;
            background: #252530;
            border-radius: 4px;
        }
        #srt-popup-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }
        #srt-popup-actions button {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.15s;
            font-weight: 500;
        }
        #srt-apply-btn { background: #4a7; color: #fff; }
        #srt-apply-btn:hover { background: #5b8; }
        #srt-remove-btn { background: #744; color: #fff; }
        #srt-remove-btn:hover { background: #855; }
        #srt-cancel-btn { background: #444; color: #fff; }
        #srt-cancel-btn:hover { background: #555; }
        #srt-popup-status {
            margin-top: 8px;
            padding: 6px 8px;
            border-radius: 4px;
            font-size: 12px;
            text-align: center;
        }
        .srt-status-success { background: rgba(100,200,100,0.15); color: #8f8; }
        .srt-status-error { background: rgba(200,100,100,0.15); color: #f88; }
        .srt-status-info { background: rgba(100,100,200,0.15); color: #88f; }

        /* SRT subtitle message - inherits from .subtitle-msg but stays persistent */
        .srt-subtitle-msg {
            transition: opacity 200ms ease-in-out !important;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
            #srt-popup {
                width: 95vw;
            }
        }
    `;
    document.head.appendChild(style);
})();

// ===== INITIALIZATION =====

function initSrtSubtitleSystem() {
    // Load saved subtitles
    loadSrtSubtitles();

    // Add video player button
    addSrtVideoButton();

    // Add buttons to existing playlist entries
    addAllSrtButtons();

    // Watch for new playlist entries
    var queue = document.getElementById('queue');
    if (queue) {
        var srtObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('queue_entry')) {
                        addSrtButton(node);
                    }
                });
            });
        });
        srtObserver.observe(queue, { childList: true });
        if (typeof _bokiCleanup !== 'undefined') {
            _bokiCleanup.registerObserver('srtPlaylistObserver', srtObserver);
        }
    }

    // Listen for media changes
    if (typeof socket !== 'undefined') {
        socket.on('changeMedia', function() {
            setTimeout(onMediaChange, 400);
        });
        socket.on('setCurrent', function() {
            setTimeout(onMediaChange, 400);
        });
    }

    // Initial check for currently playing video
    setTimeout(onMediaChange, 1000);

    // Try to init sync listeners (may need to wait for WebSocket connection)
    if (!initSrtSync()) {
        var srtSyncCheck = setInterval(function() {
            if (initSrtSync()) {
                clearInterval(srtSyncCheck);
            }
        }, 1000);
        setTimeout(function() {
            clearInterval(srtSyncCheck);
        }, 30000);
    }

    console.log('[SRT] Playlist subtitle system initialized (' + Object.keys(srtSubtitles).length + ' videos with subtitles)');
}

// Expose functions globally
window.openSrtPopup = openSrtPopup;
window.closeSrtPopup = closeSrtPopup;
window.applySrtFromPopup = applySrtFromPopup;
window.removeSrtFromPopup = removeSrtFromPopup;

// Initialize when ready (wrapped in try-catch to prevent crashing buddy system init)
$(document).ready(function() {
    setTimeout(function() {
        try {
            initSrtSubtitleSystem();
        } catch (e) {
            console.error('[SRT] Init error (non-fatal):', e);
        }
    }, 1500);
});

/* ========== END PLAYLIST SRT SUBTITLE SYSTEM ========== */

// Pool of FUN but LEGIBLE animation effects
var SCREENSPAM_EFFECTS = [
    {
        name: 'rain',
        apply: function(el, container) {
            el.style.left = (10 + Math.random() * 80) + '%';
            el.style.top = '0';
            el.style.fontSize = (40 + Math.random() * 20) + 'px';
            el.style.animation = 'screenspam-rain 4s linear forwards';
        }
    },
    {
        name: 'float',
        apply: function(el, container) {
            el.style.left = '0';
            el.style.top = (20 + Math.random() * 60) + '%';
            el.style.fontSize = (40 + Math.random() * 20) + 'px';
            el.style.animation = 'screenspam-float 5s ease-in-out forwards';
        }
    },
    {
        name: 'bounce',
        apply: function(el, container) {
            el.style.left = (20 + Math.random() * 60) + '%';
            el.style.top = (30 + Math.random() * 40) + '%';
            el.style.fontSize = (45 + Math.random() * 25) + 'px';
            el.style.animation = 'screenspam-bounce 0.5s ease-in-out 10';
            setTimeout(function() { el.style.opacity = '0'; }, 4800);
        }
    },
    {
        name: 'pulse',
        apply: function(el, container) {
            el.style.left = '50%';
            el.style.top = '50%';
            el.style.transform = 'translate(-50%, -50%)';
            el.style.fontSize = (50 + Math.random() * 30) + 'px';
            el.style.animation = 'screenspam-pulse 5s ease-in-out forwards';
        }
    },
    {
        name: 'shake',
        apply: function(el, container) {
            el.style.left = '50%';
            el.style.top = '50%';
            el.style.transform = 'translate(-50%, -50%)';
            el.style.fontSize = (50 + Math.random() * 30) + 'px';
            el.style.animation = 'screenspam-shake 0.3s ease-in-out 17';
            setTimeout(function() { el.style.opacity = '0'; }, 4800);
        }
    },
    {
        name: 'spiral',
        apply: function(el, container) {
            el.style.left = '10%';
            el.style.top = '10%';
            el.style.fontSize = (40 + Math.random() * 20) + 'px';
            el.style.animation = 'screenspam-spiral 5s ease-in-out forwards';
        }
    },
    {
        name: 'wander',
        apply: function(el, container) {
            el.style.left = (10 + Math.random() * 30) + '%';
            el.style.top = (20 + Math.random() * 30) + '%';
            el.style.fontSize = (40 + Math.random() * 20) + 'px';
            el.style.animation = 'screenspam-wander 5s ease-in-out forwards';
        }
    },
    {
        name: 'zoom',
        apply: function(el, container) {
            el.style.left = '50%';
            el.style.top = '50%';
            el.style.transform = 'translate(-50%, -50%)';
            el.style.fontSize = (55 + Math.random() * 35) + 'px';
            el.style.animation = 'screenspam-zoom 5s ease-out forwards';
        }
    },
    {
        name: 'slide',
        apply: function(el, container) {
            el.style.left = '0';
            el.style.top = (20 + Math.random() * 60) + '%';
            el.style.fontSize = (45 + Math.random() * 25) + 'px';
            el.style.animation = 'screenspam-slide 4s linear forwards';
        }
    },
    {
        name: 'popup',
        apply: function(el, container) {
            el.style.left = (20 + Math.random() * 60) + '%';
            el.style.top = (30 + Math.random() * 40) + '%';
            el.style.fontSize = (50 + Math.random() * 30) + 'px';
            el.style.animation = 'screenspam-popup 5s ease-out forwards';
        }
    },
    {
        name: 'wave',
        apply: function(el, container) {
            el.style.left = '0';
            el.style.top = (30 + Math.random() * 40) + '%';
            el.style.fontSize = (45 + Math.random() * 25) + 'px';
            el.style.animation = 'screenspam-wave 5s ease-in-out forwards';
        }
    },
    {
        name: 'drop',
        apply: function(el, container) {
            el.style.left = (20 + Math.random() * 60) + '%';
            el.style.top = '0';
            el.style.fontSize = (50 + Math.random() * 30) + 'px';
            el.style.animation = 'screenspam-drop 4s ease-out forwards';
        }
    },
    {
        name: 'typewriter',
        apply: function(el, container) {
            el.style.left = '10%';
            el.style.top = (30 + Math.random() * 40) + '%';
            el.style.fontSize = (45 + Math.random() * 25) + 'px';
            el.style.animation = 'screenspam-typewriter 5s steps(20) forwards';
        }
    },
    {
        name: 'glow',
        apply: function(el, container) {
            el.style.left = '50%';
            el.style.top = '50%';
            el.style.transform = 'translate(-50%, -50%)';
            el.style.fontSize = (55 + Math.random() * 35) + 'px';
            el.style.animation = 'screenspam-glow 5s ease-in-out forwards';
        }
    },
    {
        name: 'swing',
        apply: function(el, container) {
            el.style.left = '50%';
            el.style.top = '20%';
            el.style.fontSize = (50 + Math.random() * 30) + 'px';
            el.style.animation = 'screenspam-swing 5s ease-in-out forwards';
        }
    },
    {
        name: 'jello',
        apply: function(el, container) {
            el.style.left = '50%';
            el.style.top = '50%';
            el.style.transform = 'translate(-50%, -50%)';
            el.style.fontSize = (55 + Math.random() * 35) + 'px';
            el.style.animation = 'screenspam-jello 5s ease-in-out forwards';
        }
    },
    {
        name: 'colorshift',
        apply: function(el, container) {
            el.style.left = '50%';
            el.style.top = '50%';
            el.style.transform = 'translate(-50%, -50%)';
            el.style.fontSize = (55 + Math.random() * 35) + 'px';
            el.style.animation = 'screenspam-colorshift 5s linear forwards';
        }
    },
    {
        name: 'rain-multi',
        apply: function(el, container) {
            // Multiple copies raining down
            var text = el.textContent;
            var html = el.innerHTML;
            var colorClass = el.className.match(/screenspam-color-\d/);
            el.remove();

            for (var i = 0; i < 6; i++) {
                var copy = document.createElement('div');
                copy.className = 'screenspam-msg ' + (colorClass ? colorClass[0] : 'screenspam-color-' + Math.floor(Math.random() * 8));
                copy.innerHTML = html;
                copy.style.left = (5 + i * 15 + Math.random() * 10) + '%';
                copy.style.top = '-50px';
                copy.style.fontSize = (35 + Math.random() * 20) + 'px';
                copy.style.animation = 'screenspam-rain ' + (3 + Math.random() * 2) + 's linear forwards';
                copy.style.animationDelay = (i * 0.3) + 's';
                container.appendChild(copy);

                (function(elem) {
                    setTimeout(function() { if (elem.parentNode) elem.remove(); }, SCREENSPAM_DURATION + 2000);
                })(copy);
            }
        }
    },
    {
        name: 'scatter',
        apply: function(el, container) {
            // Multiple copies scattering from center
            var text = el.textContent;
            var html = el.innerHTML;
            var colorClass = el.className.match(/screenspam-color-\d/);
            el.remove();

            var scatters = ['screenspam-scatter1', 'screenspam-scatter2', 'screenspam-scatter3', 'screenspam-scatter4', 'screenspam-scatter5'];
            for (var i = 0; i < 5; i++) {
                var copy = document.createElement('div');
                copy.className = 'screenspam-msg ' + (colorClass ? colorClass[0] : 'screenspam-color-' + Math.floor(Math.random() * 8));
                copy.innerHTML = html;
                copy.style.left = '50%';
                copy.style.top = '50%';
                copy.style.transform = 'translate(-50%, -50%)';
                copy.style.fontSize = (35 + Math.random() * 20) + 'px';
                copy.style.animation = scatters[i] + ' 5s ease-out forwards';
                container.appendChild(copy);

                (function(elem) {
                    setTimeout(function() { if (elem.parentNode) elem.remove(); }, SCREENSPAM_DURATION + 500);
                })(copy);
            }
        }
    },
    {
        name: 'ants',
        apply: function(el, container) {
            // Many copies wandering around like ants
            var text = el.textContent;
            var html = el.innerHTML;
            el.remove();

            for (var i = 0; i < 8; i++) {
                var copy = document.createElement('div');
                copy.className = 'screenspam-msg screenspam-color-' + Math.floor(Math.random() * 8);
                copy.innerHTML = html;
                copy.style.left = (Math.random() * 70 + 5) + '%';
                copy.style.top = (Math.random() * 70 + 5) + '%';
                copy.style.fontSize = (30 + Math.random() * 15) + 'px';
                copy.style.animation = 'screenspam-wander ' + (4 + Math.random() * 2) + 's ease-in-out forwards';
                copy.style.animationDelay = (i * 0.15) + 's';
                container.appendChild(copy);

                (function(elem) {
                    setTimeout(function() { if (elem.parentNode) elem.remove(); }, SCREENSPAM_DURATION + 1500);
                })(copy);
            }
        }
    }
];

// Create screenspam overlay
function createScreenspamOverlay() {
    var videoContainer = document.getElementById('video-container');
    if (!videoContainer) {
        videoContainer = document.getElementById('videowrap');
    }
    if (!videoContainer) return null;

    var overlay = document.getElementById('screenspam-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'screenspam-overlay';
        videoContainer.style.position = 'relative';
        videoContainer.appendChild(overlay);
    }
    return overlay;
}

// Display screenspam message with random effect
function displayScreenspam(message, username) {
    var overlay = createScreenspamOverlay();
    if (!overlay) return;

    // Pick random effect
    var effect = SCREENSPAM_EFFECTS[Math.floor(Math.random() * SCREENSPAM_EFFECTS.length)];

    // Pick random color
    var colorIndex = Math.floor(Math.random() * 8);

    // Create message element
    var el = document.createElement('div');
    el.className = 'screenspam-msg screenspam-color-' + colorIndex;
    el.textContent = message;

    // Check if message contains emotes/images (parse HTML for img tags)
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = message;
    if (tempDiv.querySelector('img')) {
        el.innerHTML = message;
    }

    overlay.appendChild(el);

    // Apply random effect
    effect.apply(el, overlay);

    // Remove after duration
    setTimeout(function() {
        if (el.parentNode) el.remove();
    }, SCREENSPAM_DURATION + 500);
}

// Check and apply cooldown
function checkScreenspamCooldown(username) {
    var now = Date.now();
    var lastUse = screenspamCooldowns[username] || 0;
    var remaining = SCREENSPAM_COOLDOWN - (now - lastUse);

    if (remaining > 0) {
        return remaining;
    }
    return 0;
}

function setScreenspamCooldown(username) {
    screenspamCooldowns[username] = Date.now();
}

// Show cooldown toast
function showCooldownToast(seconds) {
    var existing = document.querySelector('.screenspam-cooldown-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'screenspam-cooldown-toast';
    toast.textContent = 'Screenspam cooldown: ' + Math.ceil(seconds) + 's remaining';
    document.body.appendChild(toast);

    setTimeout(function() {
        if (toast.parentNode) toast.remove();
    }, 2000);
}

// Intercept /screenspam command (also /ss, /screenspam2, /ss2)
function initScreenspamCommand() {
    var chatline = document.getElementById('chatline');
    if (!chatline) return;

    chatline.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter' || e.shiftKey) return;

        var msg = chatline.value.trim();
        var msgLower = msg.toLowerCase();

        // Check for all screenspam command variants
        var isScreenspam = msgLower.startsWith('/screenspam ');
        var isSS = msgLower.startsWith('/ss ') && !msgLower.startsWith('/ss2 ');
        var isScreenspam2 = msgLower.startsWith('/screenspam2 ');
        var isSS2 = msgLower.startsWith('/ss2 ');

        if (!isScreenspam && !isSS && !isScreenspam2 && !isSS2) return;

        // Determine if this is a multi-screenspam command
        var isMulti = isScreenspam2 || isSS2;

        // Extract message content based on command length
        var commandLength;
        if (isScreenspam2) commandLength = 13; // '/screenspam2 '
        else if (isScreenspam) commandLength = 12; // '/screenspam '
        else if (isSS2) commandLength = 5; // '/ss2 '
        else commandLength = 4; // '/ss '

        var content = msg.substring(commandLength).trim();

        // Validate length
        if (content.length === 0) {
            e.preventDefault();
            e.stopImmediatePropagation();
            showCooldownToast(0);
            var toast = document.querySelector('.screenspam-cooldown-toast');
            if (toast) toast.textContent = 'Screenspam requires a message!';
            return;
        }

        if (content.length > SCREENSPAM_MAX_LENGTH) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var toast = document.createElement('div');
            toast.className = 'screenspam-cooldown-toast';
            toast.textContent = 'Message too long! Max ' + SCREENSPAM_MAX_LENGTH + ' characters.';
            document.body.appendChild(toast);
            setTimeout(function() { toast.remove(); }, 2000);
            return;
        }

        // Modify message to include screenspam marker
        // The marker is invisible zero-width characters that other clients will detect
        e.preventDefault();
        e.stopImmediatePropagation();

        // Send with special marker format: [SCREENSPAM]content[/SCREENSPAM] or [SCREENSPAM2]content[/SCREENSPAM2]
        var markerType = isMulti ? 'SCREENSPAM2' : 'SCREENSPAM';
        var markedMessage = screenspamMarker + markerType + ':' + content + ':' + markerType + screenspamMarker;

        if (typeof socket !== 'undefined' && socket.emit) {
            socket.emit('chatMsg', { msg: markedMessage });
        }

        // Clear input
        chatline.value = '';
    }, true); // Use capture phase to run before other handlers
}

// Process incoming messages for screenspam
function initScreenspamReceiver() {
    // Register with dispatcher (priority 80 - runs early, can hide screenspam messages)
    BokiChatDispatcher.register('screenspam', function(data) {
        if (!data.msg) return false;

        // Check for screenspam2 marker FIRST (multi-effect, 3-6 at once)
        var marker2Pattern = screenspamMarker + 'SCREENSPAM2:';
        var endMarker2 = ':SCREENSPAM2' + screenspamMarker;

        if (data.msg.indexOf(marker2Pattern) !== -1) {
            var startIdx = data.msg.indexOf(marker2Pattern) + marker2Pattern.length;
            var endIdx = data.msg.indexOf(endMarker2);

            if (endIdx > startIdx) {
                var screenspamContent = data.msg.substring(startIdx, endIdx);

                // Display 3-6 screenspam effects at once
                var effectCount = Math.floor(Math.random() * 4) + 3; // 3 to 6
                for (var i = 0; i < effectCount; i++) {
                    displayScreenspam(screenspamContent, data.username);
                }

                // Hide the chat message
                hideScreenspamMessage('SCREENSPAM2:');
            }
            return false;
        }

        // Check for regular screenspam marker (single effect)
        var markerPattern = screenspamMarker + 'SCREENSPAM:';
        var endMarker = ':SCREENSPAM' + screenspamMarker;

        if (data.msg.indexOf(markerPattern) !== -1) {
            var startIdx = data.msg.indexOf(markerPattern) + markerPattern.length;
            var endIdx = data.msg.indexOf(endMarker);

            if (endIdx > startIdx) {
                var screenspamContent = data.msg.substring(startIdx, endIdx);

                // Display single screenspam effect
                displayScreenspam(screenspamContent, data.username);

                // Hide the chat message
                hideScreenspamMessage('SCREENSPAM:');
            }
        }
        return false; // Continue to other handlers (message still needs formatting)
    }, 80);
}

// Helper to hide screenspam messages from chat
function hideScreenspamMessage(marker) {
    setTimeout(function() {
        var msgs = document.querySelectorAll('#messagebuffer > div');
        for (var i = msgs.length - 1; i >= 0; i--) {
            var msgEl = msgs[i];
            if (msgEl.textContent.indexOf(marker) !== -1) {
                msgEl.style.display = 'none';
                break;
            }
        }
    }, 100);
}

// Filter screenspam messages from chat history on page load
// Hides both raw commands (/ss, /screenspam, /ss2, /screenspam2) and broadcast markers
function filterScreenspamFromHistory() {
    var msgs = document.querySelectorAll('#messagebuffer > div');
    var hiddenCount = 0;

    for (var i = 0; i < msgs.length; i++) {
        var msgEl = msgs[i];
        var text = msgEl.textContent || '';

        // Check for screenspam broadcast markers
        if (text.indexOf('SCREENSPAM:') !== -1 || text.indexOf('SCREENSPAM2:') !== -1) {
            msgEl.style.display = 'none';
            hiddenCount++;
            continue;
        }

        // Check for raw commands - need to check the actual message content, not timestamps
        // Look for the message span or text that contains the command
        var msgSpan = msgEl.querySelector('.chat-msg');
        var msgText = msgSpan ? msgSpan.textContent.trim() : text;

        // Match commands at the start of the message
        if (/^\/ss\s/.test(msgText) || /^\/screenspam\s/.test(msgText) ||
            /^\/ss2\s/.test(msgText) || /^\/screenspam2\s/.test(msgText)) {
            msgEl.style.display = 'none';
            hiddenCount++;
        }
    }

    if (hiddenCount > 0) {
        console.log('[Screenspam] Filtered', hiddenCount, 'screenspam messages from chat history');
    }
}

// Initialize all enhanced features
$(document).ready(function() {
    setTimeout(function() {
        // Initialize chat dispatcher first (registers handlers, then starts listening)
        initMentionAutocomplete();
        initClickToMention();
        initMentionNotifications();
        initIgnoreList();
        initKeyboardShortcuts();
        addReplyButtonsToExistingMessages();
        addSettingsButton();

        // Initialize screenspam system
        initScreenspamCommand();
        initScreenspamReceiver();
        createScreenspamOverlay();
        filterScreenspamFromHistory(); // Clean up screenspam from chat history on page load

        // Initialize subtitle system
        initSubtitleSystem();

        // Initialize connected users buddies
        initConnectedBuddies();

        // Apply saved settings
        applyEmoteSize();
        applyTimestampVisibility();
        applyChatFontSize();
        if (compactMode) document.body.classList.add('compact-mode');

        // Start the unified chat dispatcher (after all handlers registered)
        BokiChatDispatcher.init();

        // Start memory auto-cleanup (every 60 seconds)
        BokiTheme.Memory.startAutoCleanup();
    }, 2000);
});

/* ========== CONNECTED USERS BUDDIES ========== */
/* Cute characters that roam chat, interact, speak, kiss, fight & more! */
/* Deterministic assignment - same user = same character across all browsers */

var BUDDY_CONFIG = {
    characterSize: 24,
    updateInterval: 50,
    moveSpeed: 2,
    hopSpeed: 1.5,
    interactDistance: 38,
    fightDuration: 1800,
    perchDuration: 4000,
    gravity: 1.5,
    speechDuration: 3500,
    speechChance: 0.006,
    conversationChance: 0.003,
    crazyInteractionChance: 0.4,
    // Advanced movement & behavior config
    moodDecayRate: 0.002,         // Mood intensity lost per tick (neutral in ~25s)
    flockingStrength: 0.08,       // Attraction/repulsion force multiplier
    flockingRange: 200,           // Max distance for social gravity effect
    surfaceScanInterval: 5000,    // How often to rescan UI surfaces (ms)
    wallRunChance: 0.15,          // Chance to wall-run when hitting boundary
    wallRunSpeed: 1.2,            // Speed multiplier while wall-running
    territorySize: 120,           // Territory radius in pixels
    territoryShiftRate: 10,       // Pixels territory shifts per fight outcome
    chatEnergyDecay: 0.97,        // Chat energy multiplier per tick (decays ~3%/tick)
    chatEnergyPerMsg: 0.15,       // Energy added per chat message
    chatFlinchRadius: 100,        // Radius for ALL CAPS flinch reaction
    sleepThreshold: 60000,        // ms of silence before buddies sleep
    physicsObjSpawnInterval: 45000, // How often physics objects may spawn
    physicsObjChance: 0.3,        // Chance to actually spawn per interval
    physicsObjMaxCount: 3,        // Max physics objects at once
    physicsObjGravity: 0.8,       // Gravity for physics objects
    jobDuration: 45000,           // How long buddy jobs last (ms)
    jobAssignInterval: 60000,     // How often to try assigning jobs
    multiInteractDistance: 60,    // Proximity for multi-buddy detection
    chainReactionRadius: 120,     // How far chain reactions spread
    evolutionThreshold: 15,       // Interactions needed per evolution tier
    predatorChaseSpeed: 2.5,      // How fast predators chase
    preyFleeSpeed: 3.0,           // How fast prey flee
    predatorHuntRadius: 100,      // Detection range for predator/prey
    respawnEggDuration: 8000      // How long egg sits before hatching
};

var buddyCharacters = {};
var buddyAnimationId = null;
var buddiesInitialized = false;
var chatWordTargets = [];
var recentChatMessages = [];
var jsonBinMessages = [];       // Cached messages from JSONBin
var jsonBinLastFetch = 0;       // Timestamp of last successful fetch
var jsonBinPendingWrites = [];  // Buffer of new messages to write to JSONBin
var jsonBinWriteTimer = null;   // Timer for batched writes
var JSONBIN_REFRESH_MS = 300000; // Refresh every 5 minutes
var JSONBIN_WRITE_INTERVAL = 60000; // Write buffered messages every 60 seconds
var customBuddySettings = {};  // Store custom settings received from other users
var myBuddySettings = null;    // Current user's custom settings
var lastSettingsBroadcast = 0; // Debounce settings broadcast
var lastChatRejoinBroadcast = 0; // Rate-limit chat-based re-broadcasts on user join
var visualBroadcastTimer = null; // Debounce timer for visual slider changes

// ===== Advanced Buddy Systems State =====
var buddyRelationships = {};    // Keyed by "name1|name2" (sorted), value = score (-100 to 100)
var buddyEventBus = { handlers: {} };  // Simple pub/sub event bus
var chatEnergyLevel = 0;        // 0-1, decays over time, spikes on messages
var lastChatTimestamp = Date.now(); // For sleep detection
var uiSurfaces = [];             // Cached DOM element surfaces for perching
var lastSurfaceScan = 0;         // When surfaces were last scanned
var physicsObjects = [];         // Active physics objects in the world
var lastPhysicsSpawn = 0;        // Last time a physics object spawned
var lastJobAssign = 0;           // Last time jobs were assigned
var buddyEvolutionData = {};     // Keyed by username, tracks interaction counts
var buddyTerritories = {};       // Keyed by username, {cx, cy, radius}
var activePredatorHunts = {};    // Track active hunt interactions

// Schedule a visual settings broadcast with debouncing (for sliders that fire many events)
function scheduleVisualBroadcast() {
    if (visualBroadcastTimer) clearTimeout(visualBroadcastTimer);
    visualBroadcastTimer = setTimeout(function() {
        broadcastMyBuddySettings();
    }, 500); // 500ms after last slider change
}

// ========== JSONBIN BUDDY SPEECH SOURCE ==========
// Auto-collects chat messages and stores pure text in a JSONBin.
// Buddy speech bubbles pull random messages from the bin.
//
// Configure in Cytube Channel JS:
//   var JSONBIN_SPEECH_BIN_ID = 'your-speech-bin-id';
//
// Uses the existing JSONBIN_API_KEY (master key) from the playlist rename system.
// Bin format: { "messages": ["hello", "lol", "bruh moment", ...] }

function getSpeechBinId() {
    if (typeof JSONBIN_SPEECH_BIN_ID !== 'undefined' && JSONBIN_SPEECH_BIN_ID) return JSONBIN_SPEECH_BIN_ID;
    return null;
}

function getSpeechBinKey() {
    // Reuse the master key from playlist rename system
    if (typeof JSONBIN_API_KEY !== 'undefined' && JSONBIN_API_KEY) return JSONBIN_API_KEY;
    return null;
}

// Fetch all messages from the speech JSONBin
function fetchJsonBinMessages() {
    var binId = getSpeechBinId();
    var apiKey = getSpeechBinKey();
    if (!binId || !apiKey) {
        console.log('[BuddySpeech] No JSONBIN_SPEECH_BIN_ID configured, using local chat quotes');
        return;
    }

    $.ajax({
        url: JSONBIN_BASE_URL + binId + '/latest',
        method: 'GET',
        headers: { 'X-Master-Key': apiKey },
        success: function(resp) {
            var data = resp && resp.record ? resp.record : resp;
            if (data && Array.isArray(data.messages)) {
                jsonBinMessages = data.messages.filter(function(m) {
                    return typeof m === 'string' && m.trim().length > 0;
                });
                jsonBinLastFetch = Date.now();
                console.log('[BuddySpeech] Loaded ' + jsonBinMessages.length + ' messages from JSONBin');
            } else {
                // Bin exists but empty — initialize with empty array
                jsonBinMessages = [];
                console.log('[BuddySpeech] Bin is empty, will populate from chat');
            }
        },
        error: function(xhr) {
            console.error('[BuddySpeech] Failed to fetch:', xhr.status, xhr.statusText);
        }
    });
}

// Strip BBCode tags, HTML, formatting — extract pure text only
function stripToPlainText(msg) {
    // Remove BBCode-style tags: [color], [/], [b], [glow-red], [font-comic], etc.
    msg = msg.replace(/\[[^\]]*\]/g, '');
    // Remove HTML tags
    msg = msg.replace(/<[^>]*>/g, '');
    // Remove zero-width characters
    msg = msg.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
    // Remove hidden sync markers (BSET, BACT, SCREENSPAM)
    msg = msg.replace(/BSET:.*?:BSET/g, '');
    msg = msg.replace(/BACT:.*?:BACT/g, '');
    msg = msg.replace(/SCREENSPAM:.*?:SCREENSPAM/g, '');
    // Collapse whitespace
    msg = msg.replace(/\s+/g, ' ').trim();
    return msg;
}

// Queue a chat message for writing to JSONBin
function queueMessageForJsonBin(rawMsg) {
    if (!getSpeechBinId() || !getSpeechBinKey()) return;

    var clean = stripToPlainText(rawMsg);

    // Skip empty, too short, or too long messages
    if (clean.length < 3 || clean.length > 200) return;

    // Skip if it looks like a command or system message
    if (clean.charAt(0) === '/' || clean.charAt(0) === '!') return;

    // Skip if already in cache (dedup)
    if (jsonBinMessages.indexOf(clean) !== -1) return;

    // Skip if already in pending writes
    if (jsonBinPendingWrites.indexOf(clean) !== -1) return;

    jsonBinPendingWrites.push(clean);
}

// Flush pending messages to JSONBin
function flushJsonBinWrites() {
    if (jsonBinPendingWrites.length === 0) return;

    var binId = getSpeechBinId();
    var apiKey = getSpeechBinKey();
    if (!binId || !apiKey) return;

    // Merge pending into cached list
    var merged = jsonBinMessages.concat(jsonBinPendingWrites);

    var toWrite = jsonBinPendingWrites.length;
    jsonBinPendingWrites = [];

    attemptJsonBinWrite(merged, toWrite, 0);
}

// Attempt to write to JSONBin, deleting random messages on size failure
function attemptJsonBinWrite(messages, newCount, retryNum) {
    var binId = getSpeechBinId();
    var apiKey = getSpeechBinKey();
    var maxRetries = 20; // Safety limit to prevent infinite loop

    $.ajax({
        url: JSONBIN_BASE_URL + binId,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': apiKey
        },
        data: JSON.stringify({ messages: messages }),
        success: function() {
            jsonBinMessages = messages;
            console.log('[BuddySpeech] Wrote ' + newCount + ' new messages (total: ' + messages.length + ')');
        },
        error: function(xhr) {
            // Bin full (413 or 400) — delete random messages and retry
            if (retryNum < maxRetries && messages.length > newCount) {
                var deleteCount = Math.max(1, Math.ceil(messages.length * 0.1)); // Remove 10% each retry
                for (var i = 0; i < deleteCount && messages.length > newCount; i++) {
                    var randIdx = Math.floor(Math.random() * (messages.length - newCount)); // Only delete old messages, not the new ones
                    messages.splice(randIdx, 1);
                }
                console.log('[BuddySpeech] Bin full, deleted ' + deleteCount + ' random messages, retrying... (' + messages.length + ' remaining)');
                attemptJsonBinWrite(messages, newCount, retryNum + 1);
            } else {
                console.error('[BuddySpeech] Failed to write after retries:', xhr.status, xhr.statusText);
                // Re-queue the new messages for next flush cycle
                jsonBinPendingWrites = jsonBinPendingWrites.concat(messages.slice(messages.length - newCount));
            }
        }
    });
}

// Periodically refresh and flush
function scheduleJsonBinRefresh() {
    if (!getSpeechBinId()) return;

    // Refresh cache from bin every 5 minutes
    setInterval(function() {
        fetchJsonBinMessages();
    }, JSONBIN_REFRESH_MS);

    // Flush pending writes every 60 seconds
    jsonBinWriteTimer = setInterval(function() {
        flushJsonBinWrites();
    }, JSONBIN_WRITE_INTERVAL);
}

// Truncate string to max length for BSET messages
function truncateForSync(str, maxLen) {
    if (!str) return null;
    return str.length > maxLen ? str.substring(0, maxLen) : str;
}

// ========== WEBSOCKET SYNC CONFIGURATION ==========
// Set SYNC_WS_URL in your channel's External JS to enable WebSocket sync
// var SYNC_WS_URL = 'https://buddy-sync.yourname.workers.dev';
// (Legacy Pusher config still works as fallback: PUSHER_KEY, PUSHER_CLUSTER, PUSHER_AUTH_ENDPOINT)
var syncWebSocket = null;
var syncEnabled = false;
var syncMemberCount = 1; // Track connected members for adaptive throttling

// ========== BUDDY SETTINGS SCHEMA ==========
var DEFAULT_BUDDY_SETTINGS = {
    // Appearance
    spriteIndex: -1,           // -1 = use hash, 0+ = specific sprite
    customSpriteUrl: null,     // URL to custom image
    hueRotate: 0,              // 0-360 degrees
    saturation: 100,           // 50-200%
    brightness: 100,           // 50-150%
    glowColor: null,           // hex color or null
    glowIntensity: 0,          // 0-20px
    size: 'medium',            // small, medium, large
    displayName: null,         // custom name or null for username

    // Personality
    personality: null,         // null = use hash, or specific personality name
    kissChance: -1,            // -1 = use personality, 0-100 = override
    chaseChance: -1,
    fightChance: -1,
    fleeChance: -1,
    confessChance: -1,
    crazyChance: -1,
    conversationChance: -1,

    // Behavior/Stance
    idleStyle: 'default',      // default, calm, bouncy, sleepy, hyperactive, dramatic, robotic
    movementSpeed: 1.0,        // 0.5-2.0 multiplier
    movementStyle: 'default',  // default, smooth, bouncy, floaty, erratic, teleporty
    socialTendency: 'neutral', // social, neutral, shy, aggressive
    positionPreference: 'roam',// ground, high, chatFollow, roam
    interactionFrequency: 1.0, // 0.5-2.0 multiplier
    chattiness: 1.0,           // 0.5-2.0 multiplier
    energyLevel: 1.0,          // 0.5-2.0 multiplier

    // Phrases
    catchphrase: null,         // main phrase used often
    customPhrases: [],         // array of up to 5 custom phrases
    greeting: null,            // said when appearing
    victoryLine: null,         // said when winning
    defeatLine: null,          // said when losing
    loveLine: null             // said in romantic moments
};

// Size configurations (reduced ~15% to minimize chat obstruction)
var BUDDY_SIZES = {
    small: 17,
    medium: 24,
    large: 27
};

// Idle style animations
var IDLE_STYLES = {
    default: 'idle',
    calm: 'idle',
    bouncy: 'hopping',
    sleepy: 'idle',
    hyperactive: 'hopping',
    dramatic: 'idle',
    robotic: 'idle'
};

// ========== SETTINGS SYNC SYSTEM ==========

// Get current user's username
function getMyUsername() {
    // Primary: Cytube CLIENT object (set after joining channel)
    if (typeof CLIENT !== 'undefined' && CLIENT.name) {
        // Cache it for faster fallback next time
        try { localStorage.setItem('cytube_username', CLIENT.name); } catch(e) {}
        return CLIENT.name;
    }
    // Fallback 1: Cytube USEROPTS
    if (typeof USEROPTS !== 'undefined' && USEROPTS.name) {
        return USEROPTS.name;
    }
    // Fallback 2: localStorage (cached from previous session)
    var cached = localStorage.getItem('cytube_username');
    if (cached) return cached;
    return null;
}

// Generate or retrieve a persistent guest ID for WebSocket sync
function getGuestSyncName() {
    var guestId = localStorage.getItem('cytube_guest_sync_id');
    if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 8);
        try { localStorage.setItem('cytube_guest_sync_id', guestId); } catch(e) {}
    }
    return guestId;
}

// Load my settings from localStorage
function loadMyBuddySettings() {
    try {
        var saved = localStorage.getItem('myBuddySettings');
        if (saved) {
            myBuddySettings = JSON.parse(saved);
            // Merge with defaults for any missing fields
            myBuddySettings = Object.assign({}, DEFAULT_BUDDY_SETTINGS, myBuddySettings);
        } else {
            myBuddySettings = Object.assign({}, DEFAULT_BUDDY_SETTINGS);
        }
    } catch (e) {
        myBuddySettings = Object.assign({}, DEFAULT_BUDDY_SETTINGS);
    }
    return myBuddySettings;
}

// Save my settings to localStorage
function saveMyBuddySettings() {
    try {
        localStorage.setItem('myBuddySettings', JSON.stringify(myBuddySettings));
    } catch (e) {
        console.warn('Could not save buddy settings:', e);
    }
}

// Encode settings to base64 for broadcast
function encodeBuddySettings(settings) {
    try {
        return btoa(unescape(encodeURIComponent(JSON.stringify(settings))));
    } catch (e) {
        return null;
    }
}

// Decode settings from base64
function decodeBuddySettings(encoded) {
    try {
        return JSON.parse(decodeURIComponent(escape(atob(encoded))));
    } catch (e) {
        return null;
    }
}

// ========== WEBSOCKET SYNC INITIALIZATION ==========
var syncRetryCount = 0;
var SYNC_MAX_RETRIES = 5;
var SYNC_RETRY_DELAYS = [1000, 3000, 8000, 15000, 30000];
var memberJoinBroadcastTimer = null;

// Send a message via WebSocket (replaces pusherChannel.trigger)
function wsSend(type, data) {
    if (!syncEnabled || !syncWebSocket || syncWebSocket.readyState !== WebSocket.OPEN) return false;
    try {
        data.type = type;
        syncWebSocket.send(JSON.stringify(data));
        return true;
    } catch (e) {
        console.log('[Sync] Send failed:', e);
        return false;
    }
}

function initSync() {
    if (typeof SYNC_WS_URL !== 'undefined' && SYNC_WS_URL) {
        console.log('[Sync] Using WebSocket sync (Cloudflare DO)');
        connectWebSocket();
    } else {
        console.log('[Sync] SYNC_WS_URL not configured');
        console.log('[Sync] Buddy sync, drawing, and SRT broadcast require WebSocket sync');
    }
}

var syncUsernameRetries = 0;
var SYNC_USERNAME_MAX_RETRIES = 30; // Give up after 30 seconds

function connectWebSocket() {
    var username = getMyUsername();
    if (!username) {
        syncUsernameRetries++;
        // Wait up to 10 seconds for a real login, then connect as guest
        if (syncUsernameRetries > 10) {
            username = getGuestSyncName();
            console.log('[Sync] No login detected, connecting as guest:', username);
        } else {
            if (syncUsernameRetries <= 3) {
                console.log('[Sync] Waiting for username... (' + syncUsernameRetries + '/10)');
            }
            setTimeout(connectWebSocket, 1000);
            return;
        }
    }

    var roomName = window.CHANNEL ? window.CHANNEL.name : 'default';
    // Convert https:// to wss:// and http:// to ws://
    var wsUrl = SYNC_WS_URL.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
    wsUrl += '/ws/' + encodeURIComponent(roomName) + '?username=' + encodeURIComponent(username);

    console.log('[Sync] Connecting to', wsUrl);
    syncWebSocket = new WebSocket(wsUrl);

    syncWebSocket.onopen = function() {
        console.log('[Sync] WebSocket connected');
        // Don't set syncEnabled here - wait for 'connected' message from server
    };

    syncWebSocket.onmessage = function(event) {
        var msg;
        try { msg = JSON.parse(event.data); } catch (e) { return; }

        var type = msg.type;
        var myName = getMyUsername();

        switch (type) {
            // ===== Server-originated events =====
            case 'connected':
                console.log('[Sync] Connected to room, members:', msg.members);
                syncEnabled = true;
                syncRetryCount = 0;
                syncMemberCount = (msg.members ? msg.members.length : 0) + 1;
                // Broadcast our settings to existing members
                setTimeout(broadcastMyBuddySettings, 500);
                // Request settings from others
                setTimeout(function() {
                    wsSend('request-settings', { username: getMyUsername() });
                }, 1000);
                break;

            case 'member-added':
                console.log('[Sync] Member joined:', msg.username);
                syncMemberCount++;
                // Coalesce: if multiple members join rapidly, only broadcast once
                if (memberJoinBroadcastTimer) clearTimeout(memberJoinBroadcastTimer);
                memberJoinBroadcastTimer = setTimeout(function() {
                    memberJoinBroadcastTimer = null;
                    lastSettingsBroadcast = 0;
                    broadcastMyBuddySettings();
                }, 1000 + Math.random() * 1500);
                break;

            case 'member-removed':
                console.log('[Sync] Member left:', msg.username);
                syncMemberCount = Math.max(1, syncMemberCount - 1);
                break;

            // ===== Client-relayed events =====
            case 'request-settings':
                if (msg.username && msg.username !== myName) {
                    console.log('[Sync] Settings requested by:', msg.username);
                    if (memberJoinBroadcastTimer) clearTimeout(memberJoinBroadcastTimer);
                    memberJoinBroadcastTimer = setTimeout(function() {
                        memberJoinBroadcastTimer = null;
                        lastSettingsBroadcast = 0;
                        broadcastMyBuddySettings();
                    }, 500 + Math.random() * 1000);
                }
                break;

            case 'buddy-settings':
                if (msg.username && msg.username !== myName) {
                    handlePusherBuddySettings(msg);
                }
                break;

            case 'buddy-action':
                if (msg.user1 && msg.user1 !== myName) {
                    handlePusherBuddyAction(msg);
                }
                break;

            case 'buddy-positions':
                if (msg.from && msg.from !== myName) {
                    handlePositionCorrection(msg.positions, msg.ts);
                    // Handle piggybacked speech broadcasts
                    if (msg.speech && Array.isArray(msg.speech)) {
                        for (var i = 0; i < msg.speech.length; i++) {
                            handlePusherBuddySpeech(msg.speech[i]);
                        }
                    }
                }
                break;

            case 'buddy-speech':
                if (msg.from && msg.from !== myName) {
                    handlePusherBuddySpeech(msg);
                }
                break;

            case 'drag-start':
                if (msg.dragger && msg.dragger !== myName) {
                    handlePusherDragStart(msg);
                }
                break;

            case 'drag-move':
                if (msg.dragger && msg.dragger !== myName) {
                    handlePusherDragMove(msg);
                }
                break;

            case 'drag-end':
                if (msg.dragger && msg.dragger !== myName) {
                    handlePusherDragEnd(msg);
                }
                break;

            case 'draw-stroke':
                handleReceivedStroke(msg);
                break;

            case 'draw-clear':
                handleReceivedClear(msg);
                break;

            case 'srt-subtitle':
                if (msg.from && msg.from !== myName) {
                    handleSrtBroadcast(msg);
                }
                break;

            case 'srt-remove':
                if (msg.from && msg.from !== myName) {
                    handleSrtRemoval(msg);
                }
                break;
        }
    };

    syncWebSocket.onclose = function(event) {
        console.log('[Sync] WebSocket closed (code:', event.code + ')');
        syncEnabled = false;
        syncWebSocket = null;

        // Reconnect with exponential backoff
        if (syncRetryCount < SYNC_MAX_RETRIES) {
            var delay = SYNC_RETRY_DELAYS[syncRetryCount] || 30000;
            syncRetryCount++;
            console.log('[Sync] Reconnecting in', delay / 1000, 's (attempt', syncRetryCount + '/' + SYNC_MAX_RETRIES + ')');
            setTimeout(connectWebSocket, delay);
        } else {
            console.error('[Sync] All retry attempts exhausted. Real-time sync disabled.');
        }
    };

    syncWebSocket.onerror = function() {
        console.error('[Sync] WebSocket error');
        // onclose will fire after this, handling reconnection
    };
}

function handlePusherBuddySettings(data) {
    // Coerce spriteIndex to number to prevent strict type check failures downstream
    var parsedSi = data.si !== undefined ? parseInt(data.si, 10) : -1;
    if (isNaN(parsedSi)) parsedSi = -1;

    var settings = {
        // Appearance
        spriteIndex: parsedSi,
        size: data.sz || 'medium',
        hueRotate: data.hr || 0,
        saturation: data.st || 100,
        brightness: data.br || 100,
        displayName: data.dn || '',
        customSpriteUrl: data.cu || null,

        // Glow settings
        glowColor: data.gc || null,
        glowIntensity: data.gi || 0,

        // Visual behavior
        idleStyle: data.is || 'default',
        movementStyle: data.ms || 'default',
        energyLevel: data.el || 1.0,

        // Phrases
        catchphrase: data.cp || null,
        greeting: data.gr || null,
        victoryLine: data.vl || null,
        defeatLine: data.dl || null,
        loveLine: data.ll || null,
        customPhrases: data.ph || []
    };
    customBuddySettings[data.username] = settings;
    console.log('[Pusher] Received settings for', data.username, '- hue:', settings.hueRotate, 'glow:', settings.glowColor, 'sprite:', settings.spriteIndex);
    console.log('[Pusher] Buddy exists for', data.username, '?', !!buddyCharacters[data.username]);
    console.log('[Pusher] Current buddyCharacters keys:', Object.keys(buddyCharacters));
    if (buddyCharacters[data.username]) {
        console.log('[Pusher] Applying settings to existing buddy:', data.username);
        applyCustomSettingsToBuddy(data.username);
    } else {
        console.log('[Pusher] Buddy not found, settings stored for later application');
    }
}

function handlePusherBuddyAction(data) {
    // Extended actions carry extra fields beyond user1/user2/action/seed
    if (data.action === 'group' || data.action === 'hunt' || data.action === 'job' ||
        data.action === 'evolve' || data.action === 'physics' || data.action === 'rel' ||
        data.action === 'artifact' || data.action === 'wallrun' || data.action === 'huntend') {
        handleSyncedAdvancedAction(data);
        return;
    }

    // Denormalize positions if they were sent as normalized (0-1) coords
    var pos1 = data.pos1 ? data.pos1.split(',').map(Number) : null;
    var pos2 = data.pos2 ? data.pos2.split(',').map(Number) : null;

    if (data.normalized && pos1 && pos2) {
        var zone = getBuddyZone();
        var zoneW = Math.max(1, zone.right - zone.left);
        var zoneH = Math.max(1, zone.absoluteBottom - zone.top);
        pos1 = [zone.left + pos1[0] * zoneW, zone.top + pos1[1] * zoneH];
        pos2 = [zone.left + pos2[0] * zoneW, zone.top + pos2[1] * zoneH];
    }

    handleSyncedInteraction(data.user1, data.user2, data.action, data.seed, pos1, pos2);
}

// Handle synced speech bubbles from other clients
function handlePusherBuddySpeech(data) {
    if (!data.username || !data.text) return;
    var b = buddyCharacters[data.username];
    if (!b) return;
    showSpeechBubble(b, data.text, data.type || '');
    if (data.expr) showExpression(b, data.expr);
}

// Broadcast a speech bubble via WebSocket sync
// Optimized: queues speech to piggyback on next position broadcast instead of separate message
function broadcastSpeech(username, text, type, expr) {
    if (!syncEnabled) return;
    // Queue speech to piggyback on next position broadcast (saves a separate Pusher message)
    pendingSpeechBroadcasts.push({
        username: username,
        text: text,
        type: type || '',
        expr: expr || null
    });
}

// Broadcast my settings via Pusher (preferred) or chat fallback
function broadcastMyBuddySettings() {
    var myName = getMyUsername();
    if (!myName || !myBuddySettings) {
        console.log('[BuddySync] Broadcast skipped - no username or settings');
        return;
    }

    // Debounce - don't broadcast more than once per 2 seconds
    var now = Date.now();
    if (now - lastSettingsBroadcast < 2000) {
        console.log('[BuddySync] Broadcast debounced');
        return;
    }
    lastSettingsBroadcast = now;

    // WebSocket broadcast
    if (syncEnabled) {
        wsSend('buddy-settings', {
            username: myName,
            si: myBuddySettings.spriteIndex,
            sz: myBuddySettings.size || 'medium',
            hr: myBuddySettings.hueRotate || 0,
            st: myBuddySettings.saturation || 100,
            br: myBuddySettings.brightness || 100,
            dn: myBuddySettings.displayName || '',
            gc: myBuddySettings.glowColor || null,
            gi: myBuddySettings.glowIntensity || 0,
            cu: myBuddySettings.customSpriteUrl || null,
            is: myBuddySettings.idleStyle || 'default',
            ms: myBuddySettings.movementStyle || 'default',
            el: myBuddySettings.energyLevel || 1.0,
            cp: myBuddySettings.catchphrase || null,
            gr: myBuddySettings.greeting || null,
            vl: myBuddySettings.victoryLine || null,
            dl: myBuddySettings.defeatLine || null,
            ll: myBuddySettings.loveLine || null,
            ph: myBuddySettings.customPhrases || []
        });
        console.log('[Sync] Settings broadcast for', myName);
        return;
    }

    console.log('[Sync] Not connected - settings not broadcast');
}

// Send a ONE-TIME minimal BSET via chat ONLY on self-rejoin so visual sprites
// can be restored even if Pusher is slow to reconnect. This is the ONLY chat message.
function broadcastRejoinVisual() {
    var myName = getMyUsername();
    if (!myName || !myBuddySettings) return;

    var minimalSettings = {
        si: myBuddySettings.spriteIndex,
        sz: myBuddySettings.size || 'medium',
        hr: myBuddySettings.hueRotate || 0,
        st: myBuddySettings.saturation || 100,
        br: myBuddySettings.brightness || 100,
        dn: myBuddySettings.displayName || ''
    };
    if (myBuddySettings.glowColor) minimalSettings.gc = myBuddySettings.glowColor;
    if (myBuddySettings.glowIntensity > 0) minimalSettings.gi = myBuddySettings.glowIntensity;
    if (myBuddySettings.customSpriteUrl) minimalSettings.cu = myBuddySettings.customSpriteUrl;

    var encoded = encodeBuddySettings(minimalSettings);
    if (!encoded) return;

    var hiddenMsg = '\u200B\u200CBSET:' + myName + ':' + encoded + ':BSET\u200B\u200C';
    if (hiddenMsg.length > 240) {
        console.log('[BuddySync] Rejoin visual too long, skipping chat message');
        return;
    }

    if (typeof socket !== 'undefined' && socket.emit) {
        socket.emit('chatMsg', { msg: hiddenMsg, meta: {} });
        console.log('[BuddySync] Rejoin visual sent via chat (one-time)');
    }
}

// Broadcast an interaction for sync via Pusher (normalized positions for cross-screen consistency)
function broadcastInteraction(user1, user2, interactionType, seed) {
    if (!syncEnabled) return;

    var b1 = buddyCharacters[user1];
    var b2 = buddyCharacters[user2];
    var zone = getBuddyZone();
    var zoneW = Math.max(1, zone.right - zone.left);
    var zoneH = Math.max(1, zone.absoluteBottom - zone.top);

    var npos1 = b1 ? ((b1.x - zone.left) / zoneW).toFixed(4) + ',' + ((b1.y - zone.top) / zoneH).toFixed(4) : '0.5,0.5';
    var npos2 = b2 ? ((b2.x - zone.left) / zoneW).toFixed(4) + ',' + ((b2.y - zone.top) / zoneH).toFixed(4) : '0.5,0.5';

    wsSend('buddy-action', {
        user1: user1,
        user2: user2,
        action: interactionType,
        seed: seed,
        pos1: npos1,
        pos2: npos2,
        normalized: true
    });
}

// Broadcast an advanced action (group, hunt, job, evolve, physics, rel)
function broadcastAdvancedAction(actionType, extraData) {
    if (!syncEnabled) return;

    var myName = getMyUsername();
    if (!myName) return;

    wsSend('buddy-action', {
        user1: myName,
        user2: extraData.user2 || '',
        action: actionType,
        seed: extraData.seed || Math.floor(Math.random() * 1000000),
        extra: extraData
    });
}

// Handle incoming advanced actions (from Pusher or parsed chat)
function handleSyncedAdvancedAction(data) {
    var myName = getMyUsername();
    if (data.user1 === myName) return; // Don't process own actions

    var extra = data.extra || {};
    switch(data.action) {
        case 'group':
            handleSyncedGroupInteraction(extra);
            break;
        case 'hunt':
            handleSyncedHunt(extra);
            break;
        case 'job':
            handleSyncedJob(extra);
            break;
        case 'evolve':
            handleSyncedEvolution(extra);
            break;
        case 'physics':
            handleSyncedPhysicsSpawn(extra);
            break;
        case 'rel':
            handleSyncedRelationship(extra);
            break;
        case 'artifact':
            handleSyncedArtifact(extra);
            break;
        case 'wallrun':
            handleSyncedWallRun(extra);
            break;
        case 'huntend':
            handleSyncedHuntEnd(extra);
            break;
    }
}

// --- Synced Group Interaction ---
function handleSyncedGroupInteraction(extra) {
    var participants = extra.participants;
    var groupType = extra.groupType;
    if (!participants || !groupType) return;

    // Verify participants exist
    var valid = participants.filter(function(n) { return buddyCharacters[n]; });
    if (valid.length < 3) return;

    // Use startGroupInteraction with fromSync=true to avoid re-broadcasting
    startGroupInteraction(valid, true, groupType);
}

// --- Synced Hunt ---
function handleSyncedHunt(extra) {
    var predator = extra.predator;
    var prey = extra.prey;
    if (!predator || !prey) return;
    if (!buddyCharacters[predator] || !buddyCharacters[prey]) return;
    startHunt(predator, prey, true);
}

// --- Synced Job ---
function handleSyncedJob(extra) {
    var worker = extra.worker;
    var jobName = extra.jobName;
    if (!worker || !jobName) return;
    var b = buddyCharacters[worker];
    if (!b || b.interacting || b.job) return;

    var job = BUDDY_JOBS.find(function(j) { return j.name === jobName; });
    if (!job) return;

    if (job.init && !job.init(b)) return;
    b.job = job;
    b.jobTimer = BUDDY_CONFIG.jobDuration;
    showExpression(b, job.emoji);
    showSpeechBubble(b, 'Time for work!', 'flirt');
    b.element.classList.add('buddy-job-' + job.name);
}

// --- Synced Evolution ---
function handleSyncedEvolution(extra) {
    var username = extra.username;
    var tier = extra.tier;
    if (!username || tier === undefined) return;
    if (!buddyEvolutionData[username]) {
        buddyEvolutionData[username] = { interactions: 0, tier: 0 };
    }
    buddyEvolutionData[username].tier = tier;
    applyEvolutionTier(username, tier);
}

// --- Synced Physics Spawn ---
function handleSyncedPhysicsSpawn(extra) {
    var zone = getBuddyZone();
    spawnPhysicsObject(zone, true, extra);
}

// --- Synced Relationship ---
function handleSyncedRelationship(extra) {
    var n1 = extra.n1;
    var n2 = extra.n2;
    var delta = extra.delta;
    if (!n1 || !n2 || delta === undefined) return;
    updateRelationship(n1, n2, delta, true);
}

// --- Synced Artifact ---
function handleSyncedArtifact(extra) {
    var username = extra.username;
    var artifactIdx = extra.artifactIdx;
    if (!username || artifactIdx === undefined) return;
    if (!buddyCharacters[username]) return;
    spawnArtifactNear(username, artifactIdx);
}

// --- Synced Wall-Run ---
function handleSyncedWallRun(extra) {
    var username = extra.username;
    var side = extra.side;
    if (!username || !side) return;
    var b = buddyCharacters[username];
    if (!b || b.wallRunning) return;
    var zone = getBuddyZone();
    startWallRun(b, side, zone, true); // fromSync=true to prevent re-broadcast
}

// --- Synced Hunt End (master determines outcome) ---
function handleSyncedHuntEnd(extra) {
    var predator = extra.predator;
    var prey = extra.prey;
    var caught = extra.caught;
    if (!predator || !prey || caught === undefined) return;
    endHunt(predator, prey, caught, true);
}

// ===== POSITION CORRECTION SYSTEM =====
var lastPositionBroadcast = 0;
var POSITION_BROADCAST_IDLE_INTERVAL = 5000;   // 5s when no buddies are actively interacting
var POSITION_BROADCAST_ACTIVE_INTERVAL = 2000; // 2s during active interactions/movement
var POSITION_LERP_DURATION = 400; // Smooth correction over 400ms
var SYNC_SEED_EPOCH = 5000; // Shared seed rotation period (must be same on all clients)
var lastBroadcastPositions = {}; // Cache last broadcast for delta detection
var POSITION_DELTA_THRESHOLD = 0.005; // Min normalized movement to include in broadcast
var pendingSpeechBroadcasts = []; // Queued speech to piggyback on position broadcasts

// Master broadcasts all buddy positions as NORMALIZED coordinates (0-1)
// This ensures positions map correctly across different screen sizes
// Optimized: adaptive interval (2s active / 5s idle), delta compression, speech piggybacking
function broadcastPositionCorrection() {
    if (!isInteractionMaster()) return;
    if (!syncEnabled) return;

    var now = Date.now();

    // Adaptive interval: use shorter interval if any buddy is interacting or moving fast
    var anyActive = false;
    var names = Object.keys(buddyCharacters);
    for (var i = 0; i < names.length; i++) {
        var b = buddyCharacters[names[i]];
        if (b && (b.interacting || Math.abs(b.vx) > 0.5 || Math.abs(b.vy || 0) > 0.5)) {
            anyActive = true;
            break;
        }
    }
    var interval = anyActive ? POSITION_BROADCAST_ACTIVE_INTERVAL : POSITION_BROADCAST_IDLE_INTERVAL;
    if (now - lastPositionBroadcast < interval) return;

    var zone = getBuddyZone();
    var zoneW = Math.max(1, zone.right - zone.left);
    var zoneH = Math.max(1, zone.absoluteBottom - zone.top);

    var positions = {};
    var syncSeedBase = Math.floor(now / SYNC_SEED_EPOCH);
    var hasChanges = false;

    for (var i = 0; i < names.length; i++) {
        var b = buddyCharacters[names[i]];
        if (!b) continue;
        // Normalized format: "nx,ny,state,vx,vy" where nx/ny are 0-1 ratios
        var nx = (b.x - zone.left) / zoneW;
        var ny = (b.y - zone.top) / zoneH;

        // Delta compression: only include positions that changed significantly
        var lastPos = lastBroadcastPositions[names[i]];
        if (lastPos && Math.abs(nx - lastPos.nx) < POSITION_DELTA_THRESHOLD &&
            Math.abs(ny - lastPos.ny) < POSITION_DELTA_THRESHOLD &&
            b.state === lastPos.state) {
            continue; // Skip unchanged buddy
        }

        positions[names[i]] = nx.toFixed(4) + ',' + ny.toFixed(4) + ',' + b.state + ',' + b.vx.toFixed(2) + ',' + (b.vy || 0).toFixed(2);
        lastBroadcastPositions[names[i]] = { nx: nx, ny: ny, state: b.state };
        hasChanges = true;

        // Re-seed own RNG to match what receivers will get
        var syncSeed = hashUsername(names[i]) + syncSeedBase;
        b.moveRng = createSeededRandom(syncSeed);
    }

    // Skip broadcast if nothing changed AND no pending speech
    if (!hasChanges && pendingSpeechBroadcasts.length === 0) return;

    lastPositionBroadcast = now;

    var payload = {
        from: getMyUsername(),
        positions: positions,
        ts: now
    };

    // Piggyback pending speech broadcasts to avoid separate messages
    if (pendingSpeechBroadcasts.length > 0) {
        payload.speech = pendingSpeechBroadcasts;
        pendingSpeechBroadcasts = [];
    }

    wsSend('buddy-positions', payload);
}

// Receive position correction from master and set lerp targets
// Uses NORMALIZED coordinates (0-1) to handle different screen sizes
function handlePositionCorrection(positions, timestamp) {
    if (!positions) return;
    var zone = getBuddyZone();
    var zoneW = Math.max(1, zone.right - zone.left);
    var zoneH = Math.max(1, zone.absoluteBottom - zone.top);
    var syncSeedBase = Math.floor(Date.now() / SYNC_SEED_EPOCH);

    Object.keys(positions).forEach(function(name) {
        var b = buddyCharacters[name];
        if (!b) return;

        // Don't correct buddies that are interacting, wall-running, sleeping, or eggs
        if (b.interacting || b.wallRunning || b.sleeping || b.isEgg) return;

        var parts = positions[name].split(',');
        var nx = parseFloat(parts[0]);
        var ny = parseFloat(parts[1]);
        var masterState = parts[2] || 'idle';
        var masterVx = parseFloat(parts[3]) || 0;
        var masterVy = parseFloat(parts[4]) || 0;

        if (isNaN(nx) || isNaN(ny)) return;

        // Convert normalized coords to local screen coords
        var targetX = zone.left + nx * zoneW;
        var targetY = zone.top + ny * zoneH;

        // Clamp to local zone bounds
        targetX = Math.max(zone.left, Math.min(zone.right, targetX));
        targetY = Math.max(zone.top, Math.min(zone.absoluteBottom, targetY));

        // Sync state from master to prevent state machine divergence
        if (b.state !== masterState && !b.job) {
            b.state = masterState;
            b.stateTime = 0;
            setAnim(b, masterState === 'hopping' ? 'hopping' : (masterState === 'perched' ? 'perched' : 'idle'));
        }

        // Sync velocity direction for consistent visual facing
        b.vx = masterVx;
        b.vy = masterVy;
        updateFace(b);

        // Re-seed the buddy's RNG to re-synchronize decision sequences
        // CRITICAL: Use same SYNC_SEED_EPOCH as master for consistent seeding
        var syncSeed = hashUsername(name) + syncSeedBase;
        b.moveRng = createSeededRandom(syncSeed);

        var dx = targetX - b.x;
        var dy = targetY - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 3) return; // Tighter threshold for better precision

        // If very far off (>100px), snap closer immediately (reduced from 150)
        if (dist > 100) {
            b.x += dx * 0.8;
            b.y += dy * 0.8;
        }

        // Set lerp target for smooth correction
        b.posLerpTarget = { x: targetX, y: targetY };
        b.posLerpProgress = 0;
    });
}

// Apply position lerp smoothing in update loop (overrides normal movement)
function applyPositionLerp(b) {
    if (!b.posLerpTarget) return;

    b.posLerpProgress += BUDDY_CONFIG.updateInterval / POSITION_LERP_DURATION;
    if (b.posLerpProgress >= 1) {
        // Lerp complete - snap to final position
        b.x = b.posLerpTarget.x;
        b.y = b.posLerpTarget.y;
        b.posLerpTarget = null;
        b.posLerpProgress = 0;
    } else {
        // Smooth interpolation with ease-out curve
        var t = b.posLerpProgress;
        t = 1 - (1 - t) * (1 - t); // Ease-out quadratic
        var lerpStrength = 0.2 + t * 0.4; // Ramps from 20% to 60% pull (stronger correction)
        b.x += (b.posLerpTarget.x - b.x) * lerpStrength;
        b.y += (b.posLerpTarget.y - b.y) * lerpStrength;
    }
}

// Check if a message is a buddy sync message
function isBuddySyncMessage(msgText) {
    if (!msgText) return false;
    return msgText.indexOf('\u200B\u200CBSET:') !== -1 ||
           msgText.indexOf('\u200B\u200CBACT:') !== -1 ||
           msgText.indexOf('BSET:') !== -1 && msgText.indexOf(':BSET') !== -1 ||
           msgText.indexOf('BACT:') !== -1 && msgText.indexOf(':BACT') !== -1;
}

// Parse incoming chat messages for buddy sync data
function parseBuddySyncMessage(msgText) {
    console.log('[BuddySync] parseBuddySyncMessage called, length:', msgText.length);

    // Check for settings broadcast - try multiple patterns
    // Pattern 1: With zero-width chars
    // Pattern 2: Without zero-width chars (in case they're stripped)
    var settingsMatch = msgText.match(/[\u200B\u200C]*BSET:([^:]+):([A-Za-z0-9+/=]+):BSET[\u200B\u200C]*/) ||
                        msgText.match(/BSET:([^:]+):([A-Za-z0-9+/=]+):BSET/);

    // Debug: check if BSET markers exist
    var hasBSET = msgText.indexOf('BSET:') !== -1;
    var hasEndBSET = msgText.indexOf(':BSET') !== -1;
    console.log('[BuddySync] BSET markers - start:', hasBSET, 'end:', hasEndBSET, 'match:', !!settingsMatch);

    if (!settingsMatch && hasBSET) {
        // Try to find what's between BSET markers
        var startIdx = msgText.indexOf('BSET:');
        var endIdx = msgText.lastIndexOf(':BSET');
        console.log('[BuddySync] BSET positions - start:', startIdx, 'end:', endIdx);
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            var content = msgText.substring(startIdx + 5, endIdx);
            var parts = content.split(':');
            console.log('[BuddySync] Manual parse - parts count:', parts.length, 'username:', parts[0]);
            if (parts.length >= 2) {
                // Manual extraction as fallback
                var username = parts[0];
                var encoded = parts.slice(1).join(':'); // In case base64 has :
                console.log('[BuddySync] Manual parse - encoded length:', encoded.length, 'first 20:', encoded.substring(0, 20));
                settingsMatch = [msgText, username, encoded];
            }
        }
    }

    if (settingsMatch) {
        var username = settingsMatch[1];
        var encoded = settingsMatch[2];
        console.log('[BuddySync] Received BSET from:', username);
        var minimalSettings = decodeBuddySettings(encoded);
        if (minimalSettings) {
            // Convert minimal format (si, sz, hr, etc.) to full format (spriteIndex, size, hueRotate, etc.)
            // Pusher sends all fields, chat fallback sends minimal - handle both
            // Coerce spriteIndex to number to prevent strict type check failures downstream
            var rawSi = minimalSettings.si !== undefined ? minimalSettings.si : (minimalSettings.spriteIndex !== undefined ? minimalSettings.spriteIndex : -1);
            var parsedSi = parseInt(rawSi, 10);
            if (isNaN(parsedSi)) parsedSi = -1;

            var settings = {
                // Appearance
                spriteIndex: parsedSi,
                size: minimalSettings.sz || minimalSettings.size || 'medium',
                hueRotate: minimalSettings.hr !== undefined ? minimalSettings.hr : (minimalSettings.hueRotate || 0),
                saturation: minimalSettings.st !== undefined ? minimalSettings.st : (minimalSettings.saturation || 100),
                brightness: minimalSettings.br !== undefined ? minimalSettings.br : (minimalSettings.brightness || 100),
                displayName: minimalSettings.dn || minimalSettings.displayName || '',
                customSpriteUrl: minimalSettings.cu || minimalSettings.customSpriteUrl || null,

                // Glow settings
                glowColor: minimalSettings.gc || minimalSettings.glowColor || null,
                glowIntensity: minimalSettings.gi !== undefined ? minimalSettings.gi : (minimalSettings.glowIntensity || 0),

                // Visual behavior (from Pusher, defaults for chat fallback)
                idleStyle: minimalSettings.is || minimalSettings.idleStyle || 'default',
                movementStyle: minimalSettings.ms || minimalSettings.movementStyle || 'default',
                energyLevel: minimalSettings.el !== undefined ? minimalSettings.el : (minimalSettings.energyLevel || 1.0),

                // Phrases (full from Pusher, catchphrase only from chat fallback)
                catchphrase: minimalSettings.cp || minimalSettings.catchphrase || null,
                greeting: minimalSettings.gr || minimalSettings.greeting || null,
                victoryLine: minimalSettings.vl || minimalSettings.victoryLine || null,
                defeatLine: minimalSettings.dl || minimalSettings.defeatLine || null,
                loveLine: minimalSettings.ll || minimalSettings.loveLine || null,
                customPhrases: minimalSettings.ph || minimalSettings.customPhrases || []
            };
            console.log('[BuddySync] Decoded settings - spriteIndex:', settings.spriteIndex, 'size:', settings.size, 'hue:', settings.hueRotate, 'glow:', settings.glowColor, settings.glowIntensity);
            var myName = getMyUsername();
            if (username !== myName) {
                // Store settings for other users
                customBuddySettings[username] = settings;
                console.log('[BuddySync] ✓ SUCCESS: Received settings for', username, '- spriteIndex:', settings.spriteIndex);
                // Force update existing buddy if present
                if (buddyCharacters[username]) {
                    applyCustomSettingsToBuddy(username);
                    console.log('[BuddySync] ✓ SUCCESS: Applied settings to buddy:', username);
                } else {
                    console.log('[BuddySync] Settings stored but buddy not yet created for:', username);
                }
            } else {
                console.log('[BuddySync] Ignoring own settings broadcast');
            }
        } else {
            console.log('[BuddySync] Failed to decode settings');
        }
        return true; // Message was a sync message
    }

    // Check for interaction broadcast (with positions) - flexible pattern
    var actionMatch = msgText.match(/[\u200B\u200C]*BACT:([^:]+):([^:]+):([^:]+):(\d+):([^:]+):([^:]+):BACT[\u200B\u200C]*/);
    if (actionMatch) {
        var user1 = actionMatch[1];
        var user2 = actionMatch[2];
        var actionType = actionMatch[3];
        var seed = parseInt(actionMatch[4]);

        // Only process if we didn't initiate this (to avoid double-triggering)
        var myName = getMyUsername();
        if (user1 !== myName) {
            // Check if this is an advanced action (extra data is base64 JSON, not coordinates)
            var ADVANCED_ACTIONS = ['group', 'hunt', 'job', 'evolve', 'physics', 'rel', 'artifact', 'wallrun', 'huntend'];
            if (ADVANCED_ACTIONS.indexOf(actionType) !== -1) {
                try {
                    var extraJson = atob(actionMatch[5]);
                    var extra = JSON.parse(extraJson);
                    handleSyncedAdvancedAction({ user1: user1, action: actionType, seed: seed, extra: extra });
                } catch(e) {
                    console.log('[BuddySync] Failed to parse advanced action:', e);
                }
            } else {
                var pos1 = actionMatch[5].split(',').map(Number);
                var pos2 = actionMatch[6].split(',').map(Number);
                console.log('[BuddySync] ✓ SUCCESS: Received action', actionType, 'between', user1, 'and', user2);
                handleSyncedInteraction(user1, user2, actionType, seed, pos1, pos2);
            }
        }
        return true;
    }

    // Fallback for old format without positions
    var oldActionMatch = msgText.match(/[\u200B\u200C]*BACT:([^:]+):([^:]+):([^:]+):(\d+):BACT[\u200B\u200C]*/);
    if (oldActionMatch) {
        var user1 = oldActionMatch[1];
        var user2 = oldActionMatch[2];
        var actionType = oldActionMatch[3];
        var seed = parseInt(oldActionMatch[4]);

        var myName = getMyUsername();
        if (user1 !== myName) {
            console.log('[BuddySync] ✓ SUCCESS: Received action (old format)', actionType, 'between', user1, 'and', user2);
            handleSyncedInteraction(user1, user2, actionType, seed);
        }
        return true;
    }

    return false; // Not a sync message
}

// Apply custom settings to an existing buddy
function applyCustomSettingsToBuddy(username) {
    var buddy = buddyCharacters[username];
    if (!buddy) {
        console.log('[BuddySync] Apply skipped - buddy not found:', username);
        return;
    }

    // Check both customBuddySettings (for other users) and myBuddySettings (for own buddy)
    var myName = getMyUsername();
    var settings = customBuddySettings[username];
    if (username === myName && myBuddySettings) {
        settings = myBuddySettings;
    }
    if (!settings) {
        console.log('[BuddySync] Apply skipped - no settings for:', username);
        return;
    }

    console.log('[BuddySync] Applying settings to', username, '- spriteIndex:', settings.spriteIndex, 'current sprite:', buddy.sprite?.name);

    // Get display name
    var displayName = settings.displayName || username;

    // Apply sprite - handle all cases
    if (settings.customSpriteUrl) {
        // Custom image URL with fallback to hash-based emoji if image fails to load
        var fallbackHash = hashUsername(username);
        var fallbackSprite = BUDDY_SPRITES[fallbackHash % BUDDY_SPRITES.length];
        var img = document.createElement('img');
        img.src = settings.customSpriteUrl;
        img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
        img.onerror = function() {
            console.log('[BuddySync] Custom sprite failed to load for', username, '- falling back to emoji');
            buddy.element.innerHTML = fallbackSprite.body + '<span class="buddy-nametag">' + escapeHtml(displayName) + '</span>';
            buddy.sprite = fallbackSprite;
            buddy.isCustomSprite = false;
        };
        buddy.element.innerHTML = '';
        buddy.element.appendChild(img);
        var nametag = document.createElement('span');
        nametag.className = 'buddy-nametag';
        nametag.textContent = displayName;
        buddy.element.appendChild(nametag);
        buddy.isCustomSprite = true;
        console.log('[BuddySync] Applied custom URL sprite to', username);
    } else if (typeof settings.spriteIndex === 'number' && settings.spriteIndex >= 0 && settings.spriteIndex < BUDDY_SPRITES.length) {
        // Specific sprite selected
        buddy.sprite = BUDDY_SPRITES[settings.spriteIndex];
        buddy.element.innerHTML = buddy.sprite.body + '<span class="buddy-nametag">' + escapeHtml(displayName) + '</span>';
        buddy.isCustomSprite = false;
        console.log('[BuddySync] Applied sprite index', settings.spriteIndex, '(' + buddy.sprite.name + ') to', username);
    } else {
        // Use hash-based default (spriteIndex is -1 or undefined)
        var hash = hashUsername(username);
        buddy.sprite = BUDDY_SPRITES[hash % BUDDY_SPRITES.length];
        buddy.element.innerHTML = buddy.sprite.body + '<span class="buddy-nametag">' + escapeHtml(displayName) + '</span>';
        buddy.isCustomSprite = false;
        console.log('[BuddySync] Applied hash-based sprite to', username, '- hash:', hash, 'sprite:', buddy.sprite.name);
    }

    // Apply size
    var size = BUDDY_SIZES[settings.size] || BUDDY_SIZES.medium;
    buddy.element.style.fontSize = size + 'px';

    // Apply color filters (clamp values to safe ranges to prevent invisible/unrecognizable buddies)
    var filters = [];
    var hr = Math.max(0, Math.min(360, Number(settings.hueRotate) || 0));
    var sat = Math.max(50, Math.min(200, Number(settings.saturation) || 100));
    var br = Math.max(50, Math.min(150, Number(settings.brightness) || 100));
    if (hr) filters.push('hue-rotate(' + hr + 'deg)');
    if (sat !== 100) filters.push('saturate(' + sat + '%)');
    if (br !== 100) filters.push('brightness(' + br + '%)');
    if (settings.glowColor && settings.glowIntensity > 0) {
        var gi = Math.max(0, Math.min(20, Number(settings.glowIntensity) || 0));
        filters.push('drop-shadow(0 0 ' + gi + 'px ' + settings.glowColor + ')');
    }
    buddy.element.style.filter = filters.length > 0 ? filters.join(' ') : '';

    // Apply personality override
    if (settings.personality && PERSONALITIES[settings.personality]) {
        buddy.personality = settings.personality;
    }

    // Store settings reference
    buddy.customSettings = settings;
}

// Handle a synced interaction from another client
function handleSyncedInteraction(user1, user2, actionType, seed, pos1, pos2) {
    var b1 = buddyCharacters[user1];
    var b2 = buddyCharacters[user2];
    if (!b1 || !b2) return;
    if (b1.interacting || b2.interacting) return;

    // Get current zone bounds for this client (may differ from sender's screen size)
    var zone = getBuddyZone();

    // Calculate target positions with bounds clamping
    var target1 = null;
    var target2 = null;
    var maxAnimationTime = 0;
    var SYNC_DISTANCE_THRESHOLD = 20; // Only animate if > 20px away
    var SYNC_SPEED_MULTIPLIER = 1.5;  // Fast animated movement
    var FRAME_DURATION = BUDDY_CONFIG.updateInterval || 50;

    // Check if buddy 1 needs to move
    if (pos1 && pos1.length === 2 && !isNaN(pos1[0])) {
        var targetX1 = Math.max(zone.left, Math.min(zone.right, pos1[0]));
        var targetY1 = Math.max(zone.top, Math.min(zone.absoluteBottom, pos1[1]));
        var dist1 = Math.sqrt(Math.pow(b1.x - targetX1, 2) + Math.pow(b1.y - targetY1, 2));

        if (dist1 > SYNC_DISTANCE_THRESHOLD) {
            target1 = { x: targetX1, y: targetY1 };
            var frames1 = Math.max(8, Math.round(18 / SYNC_SPEED_MULTIPLIER));
            maxAnimationTime = Math.max(maxAnimationTime, frames1 * FRAME_DURATION);
        } else {
            // Close enough, just set position directly
            b1.x = targetX1;
            b1.y = targetY1;
            b1.element.style.left = b1.x + 'px';
            b1.element.style.top = b1.y + 'px';
        }
    }

    // Check if buddy 2 needs to move
    if (pos2 && pos2.length === 2 && !isNaN(pos2[0])) {
        var targetX2 = Math.max(zone.left, Math.min(zone.right, pos2[0]));
        var targetY2 = Math.max(zone.top, Math.min(zone.absoluteBottom, pos2[1]));
        var dist2 = Math.sqrt(Math.pow(b2.x - targetX2, 2) + Math.pow(b2.y - targetY2, 2));

        if (dist2 > SYNC_DISTANCE_THRESHOLD) {
            target2 = { x: targetX2, y: targetY2 };
            var frames2 = Math.max(8, Math.round(18 / SYNC_SPEED_MULTIPLIER));
            maxAnimationTime = Math.max(maxAnimationTime, frames2 * FRAME_DURATION);
        } else {
            // Close enough, just set position directly
            b2.x = targetX2;
            b2.y = targetY2;
            b2.element.style.left = b2.x + 'px';
            b2.element.style.top = b2.y + 'px';
        }
    }

    // Start animated movement for buddies that need it
    if (target1) {
        startJumpTo(b1, target1, SYNC_SPEED_MULTIPLIER);
    }
    if (target2) {
        startJumpTo(b2, target2, SYNC_SPEED_MULTIPLIER);
    }

    // Delay interaction start until movement completes (or start immediately if no movement needed)
    if (maxAnimationTime > 0) {
        setTimeout(function() {
            // Re-check that buddies still exist and aren't in another interaction
            if (buddyCharacters[user1] && buddyCharacters[user2] &&
                !buddyCharacters[user1].interacting && !buddyCharacters[user2].interacting) {
                startInteraction(user1, user2, buddyCharacters[user1], buddyCharacters[user2], true, actionType, seed);
            }
        }, maxAnimationTime + 100); // Add 100ms buffer for animation to fully complete
    } else {
        // No movement needed, start interaction immediately
        startInteraction(user1, user2, b1, b2, true, actionType, seed);
    }
}

// Legacy handler for backwards compatibility - kept for reference
function handleSyncedInteractionLegacy(user1, user2, actionType, seed) {
    var b1 = buddyCharacters[user1];
    var b2 = buddyCharacters[user2];
    if (!b1 || !b2) return;
    if (b1.interacting || b2.interacting) return;

    // Use the seed for deterministic random
    var seededRandom = createSeededRandom(seed);

    // Trigger the same interaction
    switch (actionType) {
        case 'kiss': startKiss(user1, user2, seededRandom); break;
        case 'confess': startConfess(user1, user2, seededRandom); break;
        case 'chase': startChase(user1, user2, seededRandom); break;
        case 'flee': startFlee(user1, user2, seededRandom); break;
        case 'fight': startFight(user1, user2, seededRandom); break;
        case 'conversation': startConversation(user1, user2, seededRandom); break;
        // Crazy interactions
        case 'fireworks': startFireworks(user1, user2, seededRandom); break;
        case 'wizardDuel': startWizardDuel(user1, user2, seededRandom); break;
        case 'danceOff': startDanceOff(user1, user2, seededRandom); break;
        case 'teatime': startTeatime(user1, user2, seededRandom); break;
        case 'stareContest': startStareContest(user1, user2, seededRandom); break;
        case 'serenade': startSerenade(user1, user2, seededRandom); break;
        case 'ghostPossession': startGhostPossession(user1, user2, seededRandom); break;
        case 'transformSequence': startTransformSequence(user1, user2, seededRandom); break;
        case 'pillowFight': startPillowFight(user1, user2, seededRandom); break;
        case 'fortuneTelling': startFortuneTelling(user1, user2, seededRandom); break;
        case 'dramaDeath': startDramaDeath(user1, user2, seededRandom); break;
        case 'telepathy': startTelepathy(user1, user2, seededRandom); break;
        case 'fusion': startFusion(user1, user2, seededRandom); break;
        case 'timewarp': startTimewarp(user1, user2, seededRandom); break;
        case 'foodFight': startFoodFight(user1, user2, seededRandom); break;
        case 'karaoke': startKaraoke(user1, user2, seededRandom); break;
        case 'armWrestle': startArmWrestle(user1, user2, seededRandom); break;
        case 'portal': startPortal(user1, user2, seededRandom); break;
        case 'summoning': startSummoning(user1, user2, seededRandom); break;
    }
}

// Create a seeded random function for deterministic results
function createSeededRandom(seed) {
    return function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

// Get custom phrase for a buddy, or fall back to default
function getBuddyPhrase(buddy, phraseType, defaultPhrases, seededRandom) {
    var rng = seededRandom || Math.random;
    var settings = buddy.customSettings || customBuddySettings[buddy.username];

    if (settings) {
        // Check for specific phrase type
        if (phraseType === 'victory' && settings.victoryLine) return settings.victoryLine;
        if (phraseType === 'defeat' && settings.defeatLine) return settings.defeatLine;
        if (phraseType === 'love' && settings.loveLine) return settings.loveLine;
        if (phraseType === 'greeting' && settings.greeting) return settings.greeting;
        if (phraseType === 'catchphrase' && settings.catchphrase) return settings.catchphrase;

        // Check custom phrases
        if (settings.customPhrases && settings.customPhrases.length > 0) {
            // 50% chance to use custom phrase
            if (rng() < 0.5) {
                return settings.customPhrases[Math.floor(rng() * settings.customPhrases.length)];
            }
        }
    }

    // Fall back to default
    if (Array.isArray(defaultPhrases)) {
        return defaultPhrases[Math.floor(rng() * defaultPhrases.length)];
    }
    return defaultPhrases;
}

// Initialize sync message listener
function initBuddySyncListener() {
    console.log('[BuddySync] Initializing sync listener (Pusher-primary)...');

    // Register with dispatcher (priority 100) - catches any straggler BSET messages
    // from chat (rejoin visual restore only). BACT no longer goes through chat.
    BokiChatDispatcher.register('buddySync', function(data) {
        if (!data.msg) return false;

        if (isBuddySyncMessage(data.msg)) {
            // Only process BSET messages (visual settings restore)
            if (data.msg.indexOf('BSET:') !== -1) {
                parseBuddySyncMessage(data.msg);
            }
            // Always hide sync messages from chat display
            setTimeout(function() {
                var msgs = document.querySelectorAll('#messagebuffer > div');
                var lastMsg = msgs[msgs.length - 1];
                if (lastMsg && isBuddySyncMessage(lastMsg.textContent)) {
                    lastMsg.remove();
                }
            }, 50);
            return true; // STOP processing
        }
        return false;
    }, 100);

    // Clean up any existing sync messages from chat history
    function cleanupExistingMessages() {
        var msgBuffer = document.getElementById('messagebuffer');
        if (msgBuffer) {
            var msgs = msgBuffer.querySelectorAll(':scope > div');
            msgs.forEach(function(msg) {
                var text = msg.textContent || '';
                if (isBuddySyncMessage(text)) {
                    // Parse BSET for visual restore, ignore BACT
                    if (text.indexOf('BSET:') !== -1) {
                        parseBuddySyncMessage(text);
                    }
                    msg.remove();
                }
            });
        }
    }
    cleanupExistingMessages();
    setTimeout(cleanupExistingMessages, 1500);

    // Watch messagebuffer for any sync messages that sneak through and remove them
    var msgBuffer = document.getElementById('messagebuffer');
    if (msgBuffer) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        var text = node.textContent || '';
                        if (isBuddySyncMessage(text)) {
                            if (text.indexOf('BSET:') !== -1) {
                                parseBuddySyncMessage(text);
                            }
                            node.remove();
                        }
                    }
                });
            });
        });
        observer.observe(msgBuffer, { childList: true, subtree: false });
        _bokiCleanup.registerObserver('buddySyncMsgObserver', observer);
    }

    // Load my settings and broadcast via Pusher on init
    loadMyBuddySettings();
    setTimeout(function() {
        broadcastMyBuddySettings();
    }, 2000);
}

// Hash function for deterministic assignment
function hashUsername(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// Mixed sprites - birds AND cute characters!
var BUDDY_SPRITES = [
    // Birds
    { body: '🐤', name: 'chick', type: 'bird' },
    { body: '🐣', name: 'hatching', type: 'bird' },
    { body: '🐥', name: 'babychick', type: 'bird' },
    { body: '🐦', name: 'bluebird', type: 'bird' },
    { body: '🦆', name: 'duck', type: 'bird' },
    { body: '🦉', name: 'owl', type: 'bird' },
    { body: '🐧', name: 'penguin', type: 'bird' },
    { body: '🦜', name: 'parrot', type: 'bird' },
    { body: '🦩', name: 'flamingo', type: 'bird' },
    { body: '🦚', name: 'peacock', type: 'bird' },
    // Cute girls
    { body: '💃', name: 'dancer', type: 'girl' },
    { body: '💁‍♀️', name: 'sassy', type: 'girl' },
    { body: '🙆‍♀️', name: 'sweet', type: 'girl' },
    { body: '🧚‍♀️', name: 'fairy', type: 'girl' },
    { body: '👯‍♀️', name: 'bunny', type: 'girl' },
    { body: '👸', name: 'princess', type: 'girl' },
    { body: '🧝‍♀️', name: 'elf', type: 'girl' },
    { body: '🧜‍♀️', name: 'mermaid', type: 'girl' },
    { body: '👩‍🦰', name: 'redhead', type: 'girl' },
    { body: '👱‍♀️', name: 'blonde', type: 'girl' },
    { body: '🧙‍♀️', name: 'witch', type: 'magical' },
    { body: '🦹‍♀️', name: 'hero', type: 'magical' },
    // Cute creatures
    { body: '🐱', name: 'cat', type: 'cute' },
    { body: '🐰', name: 'bunny', type: 'cute' },
    { body: '🦊', name: 'fox', type: 'cute' },
    { body: '🐼', name: 'panda', type: 'cute' },
    { body: '🐨', name: 'koala', type: 'cute' },
    { body: '🦄', name: 'unicorn', type: 'magical' },
    { body: '🐲', name: 'dragon', type: 'magical' },
    { body: '👻', name: 'ghost', type: 'spooky' },
    { body: '👽', name: 'alien', type: 'weird' },
    { body: '🤖', name: 'robot', type: 'weird' }
];

// Personality types with behavior weights
var PERSONALITIES = {
    flirty: { kiss: 0.35, chase: 0.2, fight: 0.05, flee: 0.1, confess: 0.15, crazy: 0.15 },
    shy: { kiss: 0.1, chase: 0.05, fight: 0.0, flee: 0.5, confess: 0.15, crazy: 0.2 },
    feisty: { kiss: 0.1, chase: 0.25, fight: 0.35, flee: 0.05, confess: 0.05, crazy: 0.2 },
    sweet: { kiss: 0.25, chase: 0.1, fight: 0.0, flee: 0.15, confess: 0.3, crazy: 0.2 },
    playful: { kiss: 0.15, chase: 0.3, fight: 0.1, flee: 0.1, confess: 0.1, crazy: 0.25 },
    chaotic: { kiss: 0.1, chase: 0.15, fight: 0.15, flee: 0.1, confess: 0.1, crazy: 0.4 },
    dramatic: { kiss: 0.2, chase: 0.1, fight: 0.1, flee: 0.15, confess: 0.25, crazy: 0.2 },
    mysterious: { kiss: 0.1, chase: 0.1, fight: 0.1, flee: 0.2, confess: 0.1, crazy: 0.4 }
};
var PERSONALITY_NAMES = Object.keys(PERSONALITIES);

// Interaction effects
var FIGHT_MOVES = [
    { name: 'BONK!', emoji: '💥', color: '#FF4444' },
    { name: 'POW!', emoji: '⭐', color: '#FFD700' },
    { name: 'SLAP!', emoji: '✋', color: '#FF6B6B' },
    { name: 'KYAA!', emoji: '😤', color: '#FF69B4' },
    { name: 'HMPH!', emoji: '💢', color: '#FF1493' },
    { name: 'WHAM!', emoji: '💫', color: '#9400D3' },
    { name: 'YEET!', emoji: '🌪️', color: '#00CED1' },
    { name: 'OOF!', emoji: '😵', color: '#FF8C00' }
];

var LOVE_CONFESSIONS = [
    "I love you~!", "Be mine forever!", "You're so cute!", "My heart is yours!",
    "I can't stop thinking about you!", "You make me so happy!", "Stay with me!",
    "I've always liked you!", "You're my favorite!", "Let's be together!",
    "You complete me!", "I'm yours!", "My heart goes doki doki!", "Notice me~!",
    "You're my sunshine!", "I'd cross oceans for you!", "Be my player 2?"
];

var KISS_EFFECTS = ['💋', '💕', '💗', '💖', '💘', '💝', '❤️', '😘', '💓', '💞'];

// ========== MADLIB CONVERSATION TEMPLATES ==========
var CONVERSATION_TEMPLATES = [
    // Eternally online existential crisis
    {
        name: 'eternally_online',
        lines: [
            { speaker: 0, text: "how long have we been watching {content}...?", mood: 'confused' },
            { speaker: 1, text: "idk... since {year} maybe??", mood: 'uncertain' },
            { speaker: 0, text: "do u ever feel like we're {adjective} trapped here?", mood: 'existential' },
            { speaker: 1, text: "lol wut no this is fine *nervous laughter*", mood: 'denial' },
            { speaker: 0, text: "just one more {content}... then i'll go outside", mood: 'lying' },
            { speaker: 1, text: "haha yeah... *clicks next video*", mood: 'surrendering' }
        ]
    },
    // Random penguin of doom energy
    {
        name: 'random',
        lines: [
            { speaker: 0, text: "hi every1!!! *holds up {item}*", mood: 'random' },
            { speaker: 1, text: "OMG ur so {adjective}!!! XD", mood: 'excited' },
            { speaker: 0, text: "DOOOOOM!!!! <-- me bein random again ^_^", mood: 'chaos' },
            { speaker: 1, text: "lol so randum!! {exclamation}!!", mood: 'matching_energy' },
            { speaker: 0, text: "rawr means {thing} in dinosaur!!!", mood: 'informative' },
            { speaker: 1, text: "hehe toodles!!! love and {food}~", mood: 'wholesome' }
        ]
    },
    // YouTube rabbit hole
    {
        name: 'youtube_hole',
        lines: [
            { speaker: 0, text: "wait how did we get from {content} to THIS", mood: 'confused' },
            { speaker: 1, text: "the {noun} recommended it 2 us...", mood: 'hypnotized' },
            { speaker: 0, text: "i just wanted to watch {content} for 5 mins", mood: 'regret' },
            { speaker: 1, text: "that was {time} ago bestie...", mood: 'concerned' },
            { speaker: 0, text: "*checks clock* oh no its {late_time}", mood: 'horror' },
            { speaker: 1, text: "one more vid won't hurt :3", mood: 'enabling' }
        ]
    },
    // Forum nostalgia
    {
        name: 'forum_vibes',
        lines: [
            { speaker: 0, text: "u remember {oldsite}??? good times...", mood: 'nostalgic' },
            { speaker: 1, text: "yesss my {noun} was so {adjective} back then", mood: 'reminiscing' },
            { speaker: 0, text: "i miss when {thing} was still {adjective}", mood: 'sad' },
            { speaker: 1, text: "*plays {song} in background*", mood: 'emotional' },
            { speaker: 0, text: "we've been here so long... seen so much {content}...", mood: 'ancient' },
            { speaker: 1, text: "and we'll never leave lol", mood: 'accepting' }
        ]
    },
    // Chronically online drama
    {
        name: 'internet_drama',
        lines: [
            { speaker: 0, text: "did u see what {person} posted about {noun}???", mood: 'gossip' },
            { speaker: 1, text: "WAIT NO show me rn!!!", mood: 'desperate' },
            { speaker: 0, text: "*sends link* its so {adjective} i cant-", mood: 'shocked' },
            { speaker: 1, text: "{exclamation} THEYRE SO UNHINGED", mood: 'dramatic' },
            { speaker: 0, text: "the replies are sending me to {place}", mood: 'dying' },
            { speaker: 1, text: "we live in the {superlative} timeline", mood: 'philosophical' }
        ]
    },
    // Sleep deprivation posting
    {
        name: 'sleep_deprived',
        lines: [
            { speaker: 0, text: "its {late_time} and im still watching {content}", mood: 'unwell' },
            { speaker: 1, text: "bestie go 2 sleep!!!", mood: 'concerned' },
            { speaker: 0, text: "no u dont understand this {content} is {adjective}", mood: 'manic' },
            { speaker: 1, text: "...ok send me the link", mood: 'giving_in' },
            { speaker: 0, text: "*3 hours later* see i told u", mood: 'vindicated' },
            { speaker: 1, text: "im never sleeping again {exclamation}", mood: 'converted' }
        ]
    },
    // Parasocial moment
    {
        name: 'parasocial',
        lines: [
            { speaker: 0, text: "do u think {person} knows we exist...", mood: 'hopeful' },
            { speaker: 1, text: "ofc they do!! they said '{quote}' that one time", mood: 'coping' },
            { speaker: 0, text: "u think they're talking about US specifically??", mood: 'delusional' },
            { speaker: 1, text: "100% we're basically {adjective} friends", mood: 'certain' },
            { speaker: 0, text: "*donates $5* notice me senpai~", mood: 'desperate' },
            { speaker: 1, text: "they read ur name!!! WE WON", mood: 'ecstatic' }
        ]
    },
    // Cursed content discovery
    {
        name: 'cursed_content',
        lines: [
            { speaker: 0, text: "i found something {adjective} in the {place}", mood: 'ominous' },
            { speaker: 1, text: "omg show me immediately", mood: 'curious' },
            { speaker: 0, text: "*shows {content}* r u ok???", mood: 'concerned' },
            { speaker: 1, text: "i... i need to send this to everyone i know", mood: 'possessed' },
            { speaker: 0, text: "NO WAIT ITS TOO {adjective}-", mood: 'warning' },
            { speaker: 1, text: "*already sent* oopsie :3", mood: 'chaotic' }
        ]
    },
    // Touch grass intervention
    {
        name: 'touch_grass',
        lines: [
            { speaker: 0, text: "when did u last go outside???", mood: 'concerned' },
            { speaker: 1, text: "define 'outside'... like the {place}?", mood: 'confused' },
            { speaker: 0, text: "grass. trees. the sun??", mood: 'explaining' },
            { speaker: 1, text: "those are just {adjective} myths bestie", mood: 'denial' },
            { speaker: 0, text: "we've been watching {content} for {time}...", mood: 'worried' },
            { speaker: 1, text: "and ill do it again lol", mood: 'defiant' }
        ]
    },
    // Comfort content ritual
    {
        name: 'comfort_rewatch',
        lines: [
            { speaker: 0, text: "rewatching {content} for the {ordinal} time ^_^", mood: 'cozy' },
            { speaker: 1, text: "omg same its so {adjective}!!!", mood: 'excited' },
            { speaker: 0, text: "i know every word but it still hits different", mood: 'emotional' },
            { speaker: 1, text: "*quote* '{quote}' gets me every time", mood: 'nostalgic' },
            { speaker: 0, text: "we're eternally trapped in comfort content loop", mood: 'philosophical' },
            { speaker: 1, text: "wouldnt have it any other way tbh", mood: 'content' }
        ]
    }
];

// Madlib word banks - eternally online internet culture themed
var MADLIB_WORDS = {
    noun: ['the algorithm', 'my sanity', 'the wifi', 'serotonin', 'clout', 'copium', 'my browser history', 'touch grass', 'main character energy', 'the timeline', 'my last brain cell', 'the void', 'the matrix', 'bandwidth', 'my dignity'],
    noun2: ['a parasocial relationship', 'internet poisoning', 'chronically online behavior', 'a fever dream', 'an ARG', 'lore', 'the backrooms', 'liminal space vibes'],
    adjective: ['so random XD', 'unhinged', 'chronically online', 'based', 'cringe', 'cursed', 'blessed', 'chaotic neutral', 'feral', 'terminally online', 'deranged', 'iconic', 'slay', 'goated', 'no cap'],
    verb: ['doom scroll', 'hyperfixate on', 'parasocially attach to', 'stan', 'simp for', 'subscribe to', 'binge watch', 'rewatch', 'spam'],
    verb_past: ['doom scrolled', 'hyperfixated on', 'binged', 'subscribed to', 'got recommended', 'fell down rabbit hole about', 'got brain rot from'],
    person: ['the youtube algorithm', 'my favorite streamer', 'that one youtuber', 'the discord mod', 'a vtuber', 'MrBeast', 'that one creator', 'internet historians'],
    place: ['the youtube comments', 'twitter dot com', 'the discord server', 'reddit', 'tumblr circa 2014', 'my recommended page', 'the shadow realm', 'offline'],
    food: ['waffles', 'hot pockets', 'energy drinks', 'instant ramen', 'gamer fuel', 'doritos', 'pizza rolls', 'chickie nuggies', 'tendies'],
    exclamation: ['OMG', 'LMAOOO', 'SCREAMING', 'IM DECEASED', 'BRUH', 'NO WAY', 'HELP', 'CRYING', 'I CANT', 'ASDFJKL'],
    superlative: ['most unhinged', 'most chronically online', 'most chaotic', 'wildest', 'most cursed', 'most iconic'],
    quote: ['it do be like that', 'we live in a society', 'no thoughts head empty', 'this is fine', 'and I oop-', 'rent free', 'say sike rn', 'hi every1 im new', 'rawr XD'],
    emotion: ['screaming', 'crying', 'ascending', 'dissociating', 'vibrating', 'transcending', 'malfunctioning'],
    year: ['2007', 'before youtube existed', 'dial-up era', 'the flash games era', 'vine days', 'the newgrounds era'],
    // New categories for internet content theme
    content: ['cat videos', 'video essays', 'true crime docs', 'ASMR', 'drama commentary', 'reaction videos', 'compilation vids', 'shorts', 'streams', 'lore videos', 'iceberg vids', 'cooking fails'],
    item: ['spork', 'gaming mouse', 'ring light', 'blahaj', 'keyboard', 'monster energy', 'bodypillow', 'funko pop', 'RGB lights'],
    thing: ['i love you', 'subscribe', 'parasocial bonding', 'internet culture', 'touch grass', 'memes', 'vibes', 'chaos'],
    time: ['3 hours', '6 hours', '12 hours', 'since yesterday', 'idk time isnt real here', 'too long', 'an eternity'],
    late_time: ['4am', '5:47am', '3am', 'way past bedtime', 'dawn already??', 'birds are chirping o_o'],
    oldsite: ['old youtube', 'newgrounds', 'neopets', 'club penguin', 'MySpace', 'flash game sites', 'early tumblr', 'old reddit', 'forums'],
    song: ['nyan cat', 'caramelldansen', 'numa numa', 'all star', 'never gonna give you up', 'dreamscape', 'fireflies'],
    ordinal: ['47th', '100th', 'millionth', '69th', 'idk i lost count', 'infinite', 'too many']
};

// ========== CRAZY INTERACTION TYPES ==========
var CRAZY_INTERACTIONS = [
    'fireworks', 'wizardDuel', 'danceOff', 'teatime', 'stareContest',
    'serenade', 'ghostPossession', 'transformSequence', 'pillowFight',
    'fortuneTelling', 'dramaDeath', 'telepathy', 'fusion', 'timewarp',
    'foodFight', 'karaoke', 'armWrestle', 'portal', 'summoning'
];

// Get the safe zone - everywhere EXCEPT the video player and chat input area
// Returns preferred zone (upper ~70%) and absolute limit (above chatline)
function getBuddyZone() {
    var navHeight = 50;
    var sidePadding = 20;

    // Dynamically calculate bottom padding based on chat input position
    // This ensures buddies never cover the typing area
    var chatline = document.getElementById('chatline');
    var chatwrap = document.getElementById('chatwrap');
    var absoluteBottomPadding = 120; // Default fallback

    if (chatline) {
        var chatlineRect = chatline.getBoundingClientRect();
        // Add 20px buffer above the chat input
        absoluteBottomPadding = window.innerHeight - chatlineRect.top + 20;
    } else if (chatwrap) {
        // Fallback: use chatwrap bottom area
        var chatwrapRect = chatwrap.getBoundingClientRect();
        absoluteBottomPadding = window.innerHeight - chatwrapRect.bottom + 80;
    }

    // Ensure minimum padding
    absoluteBottomPadding = Math.max(absoluteBottomPadding, 100);

    // Preferred zone: upper 70% of the available area
    // This keeps buddies away from recent messages most of the time
    var absoluteBottom = window.innerHeight - absoluteBottomPadding;
    var availableHeight = absoluteBottom - navHeight;
    var preferredBottom = navHeight + availableHeight * 0.65;

    // Get video player bounds to exclude it
    var videoWrap = document.getElementById('videowrap');
    var videoRect = videoWrap ? videoWrap.getBoundingClientRect() : null;

    // Buddies stay to the RIGHT of the video player
    var leftBound = sidePadding;
    if (videoRect && videoRect.width > 0) {
        leftBound = Math.max(sidePadding, videoRect.right + 10);
    }

    return {
        left: leftBound,
        right: window.innerWidth - BUDDY_CONFIG.characterSize - sidePadding,
        top: navHeight,
        bottom: preferredBottom,          // Normal roaming stops here (upper ~65%)
        absoluteBottom: absoluteBottom     // Hard limit - never go below this
    };
}

// Clamp a buddy's position within the zone boundaries
function clampToZone(b, zone) {
    if (!zone) zone = getBuddyZone();
    b.x = Math.max(zone.left, Math.min(zone.right, b.x));
    b.y = Math.max(zone.top, Math.min(zone.absoluteBottom, b.y));
}

// Scan chat messages for word positions to land on
function scanChatForWords() {
    chatWordTargets = [];
    var zone = getBuddyZone();
    var msgBuffer = document.getElementById('messagebuffer');
    if (!msgBuffer) return;

    var messages = msgBuffer.querySelectorAll(':scope > div');
    var startIdx = Math.max(0, messages.length - 12);

    for (var i = startIdx; i < messages.length; i++) {
        var msg = messages[i];
        var msgRect = msg.getBoundingClientRect();
        // Only pick targets within the preferred zone (not the lower area)
        if (msgRect.top < zone.top - 20 || msgRect.bottom > zone.bottom + 20) continue;

        // Get text spans
        var textNodes = msg.querySelectorAll('span:not(.username):not(.timestamp):not(.buddy-nametag)');
        textNodes.forEach(function(span) {
            var rect = span.getBoundingClientRect();
            if (rect.width > 15 && rect.left >= zone.left - 10 && rect.right <= zone.right + 30) {
                chatWordTargets.push({
                    x: rect.left + Math.random() * Math.min(rect.width - 10, 50),
                    y: rect.top - BUDDY_CONFIG.characterSize + 8,
                    width: rect.width,
                    msgEl: msg
                });
            }
        });
    }
}

// Initialize buddy system
function initConnectedBuddies() {
    if (buddiesInitialized) return;
    buddiesInitialized = true;

    injectBuddyStyles();
    initSync();               // WebSocket sync (Cloudflare DO)
    initBuddySyncListener();  // Fallback chat-based sync system
    fetchJsonBinMessages();   // Load buddy speech messages from JSONBin
    scheduleJsonBinRefresh(); // Auto-refresh every 5 minutes

    setTimeout(function() {
        scanChatForWords();
        syncBuddiesWithUserlist();
        startBuddyAnimation();
        initArtifactSystem();
        initAdvancedBuddySystems();
        initBuddyResizeContainment();
    }, 1500);

    // Re-apply custom settings after enough time for responses to arrive
    // This catches late-arriving settings from other users
    setTimeout(function() {
        console.log('[BuddySync] Applying late-arriving custom settings...');
        Object.keys(customBuddySettings).forEach(function(username) {
            if (buddyCharacters[username]) {
                applyCustomSettingsToBuddy(username);
            }
        });
    }, 3000);

    // Rescan periodically
    var _buddyWordScanIntervalId = setInterval(scanChatForWords, 3000);

    observeUserlistChanges();
    observeChatMessages();

    if (typeof socket !== 'undefined' && !window._bokiBuddyUserSocketInit) {
        window._bokiBuddyUserSocketInit = true;
        socket.on('addUser', function(data) {
            if (!data.name) return;
            addBuddy(data.name);

            var myName = getMyUsername();

            // If WE just reconnected, re-broadcast settings via WebSocket + send ONE chat BSET for visual restore
            if (data.name === myName && myBuddySettings) {
                console.log('[BuddySync] Self rejoin detected');
                setTimeout(function() {
                    lastSettingsBroadcast = 0;
                    broadcastMyBuddySettings();   // WebSocket (full settings)
                    broadcastRejoinVisual();       // Chat (minimal visual only, one-time)
                }, 2000);
                return;
            }

            // Other user joins: WebSocket handles via member-added event, no chat broadcast needed
        });
        socket.on('userLeave', function(data) { if (data.name) removeBuddy(data.name); });
        socket.on('userlist', function() { setTimeout(syncBuddiesWithUserlist, 500); });
    }
}

function injectBuddyStyles() {
    if (document.getElementById('buddy-styles')) return;

    var styles = document.createElement('style');
    styles.id = 'buddy-styles';
    styles.textContent = `
        .buddy-character {
            position: fixed;
            font-size: ${BUDDY_CONFIG.characterSize}px;
            cursor: pointer;
            pointer-events: auto;
            filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.4));
            z-index: 9991;
            user-select: none;
        }
        .buddy-character:hover {
            transform: scale(1.3) !important;
            z-index: 9999;
        }
        .buddy-character.idle { animation: buddy-idle 1.5s ease-in-out infinite; }
        .buddy-character.hopping { animation: buddy-hop 0.25s ease-out infinite; }
        .buddy-character.perched { animation: buddy-perch 2s ease-in-out infinite; }
        .buddy-character.fighting { animation: buddy-fight 0.12s ease-in-out infinite; }
        .buddy-character.chasing { animation: buddy-chase 0.2s ease-in-out infinite; }
        .buddy-character.fleeing { animation: buddy-flee 0.15s ease-in-out infinite; }
        .buddy-character.kissing { animation: buddy-kiss 0.4s ease-in-out infinite; }
        .buddy-character.in-love { animation: buddy-love 0.5s ease-in-out infinite; }
        .buddy-character.face-left { transform: scaleX(-1); }
        .buddy-character.face-left:hover { transform: scaleX(-1) scale(1.3) !important; }
        .buddy-nametag {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.85);
            color: #fff;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 9px;
            font-family: monospace;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
        }
        .buddy-character.face-left .buddy-nametag { transform: translateX(-50%) scaleX(-1); }
        .buddy-character:hover .buddy-nametag { opacity: 1; }

        /* Speech bubbles */
        .buddy-speech {
            position: fixed;
            background: rgba(255,255,255,0.95);
            color: #333;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-family: 'Comic Sans MS', cursive, sans-serif;
            max-width: 150px;
            word-wrap: break-word;
            pointer-events: none;
            z-index: 10001;
            box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
            animation: speech-appear 0.3s ease-out;
            border: 2px solid #FF69B4;
        }
        .buddy-speech::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 15px;
            border: 4px solid transparent;
            border-top-color: #FF69B4;
        }
        .buddy-speech.love { border-color: #FF1493; background: linear-gradient(135deg, #FFE4EC, #FFF0F5); }
        .buddy-speech.flirt { border-color: #FF69B4; background: linear-gradient(135deg, #FFF0F5, #FFE4E1); }
        .buddy-speech.angry { border-color: #FF4444; background: linear-gradient(135deg, #FFE4E4, #FFF); }
        .buddy-speech.shy { border-color: #DDA0DD; background: linear-gradient(135deg, #F8F0FF, #FFF0F5); }

        /* Kiss effects */
        .buddy-kiss-effect {
            position: fixed;
            font-size: 20px;
            pointer-events: none;
            z-index: 10002;
            animation: kiss-float 1.5s ease-out forwards;
        }
        .buddy-heart-burst {
            position: fixed;
            font-size: 16px;
            pointer-events: none;
            z-index: 10002;
            animation: heart-burst 0.8s ease-out forwards;
        }

        /* Expression overlay */
        .buddy-expression {
            position: absolute;
            top: -8px;
            right: -8px;
            font-size: 14px;
            animation: expression-pop 2s ease-out forwards;
            pointer-events: none;
        }

        .buddy-fight-effect {
            position: fixed;
            font-size: 16px;
            font-weight: bold;
            font-family: Impact, sans-serif;
            pointer-events: none;
            z-index: 10000;
            animation: fight-pop 0.6s ease-out forwards;
            text-shadow: 1px 1px 0 #000, -1px -1px 0 #000;
        }
        .buddy-dust {
            position: fixed;
            font-size: 18px;
            pointer-events: none;
            z-index: 9997;
            animation: dust-poof 0.5s ease-out forwards;
        }
        .buddy-excited { animation: buddy-excited 0.3s ease-in-out 2 !important; }

        @keyframes buddy-idle {
            0%, 100% { transform: translateY(0) rotate(0); }
            50% { transform: translateY(-2px) rotate(2deg); }
        }
        @keyframes buddy-hop {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        @keyframes buddy-perch {
            0%, 100% { transform: translateY(0) rotate(0); }
            25% { transform: translateY(-1px) rotate(-2deg); }
            75% { transform: translateY(-1px) rotate(2deg); }
        }
        @keyframes buddy-fight {
            0%, 100% { transform: translateX(0) rotate(0); }
            25% { transform: translateX(-4px) rotate(-8deg); }
            75% { transform: translateX(4px) rotate(8deg); }
        }
        @keyframes buddy-chase {
            0%, 100% { transform: translateY(0) skewX(-5deg); }
            50% { transform: translateY(-3px) skewX(5deg); }
        }
        @keyframes buddy-flee {
            0%, 100% { transform: translateY(0) skewX(8deg); }
            50% { transform: translateY(-6px) skewX(-8deg); }
        }
        @keyframes buddy-kiss {
            0%, 100% { transform: scale(1) rotate(-5deg); }
            50% { transform: scale(1.1) rotate(5deg); }
        }
        @keyframes buddy-love {
            0%, 100% { transform: scale(1) translateY(0); filter: drop-shadow(0 0 5px #FF69B4); }
            50% { transform: scale(1.1) translateY(-5px); filter: drop-shadow(0 0 15px #FF1493); }
        }
        @keyframes buddy-excited {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-10px) scale(1.15); }
        }
        @keyframes fight-pop {
            0% { transform: translate(-50%, 0) scale(0.5); opacity: 1; }
            100% { transform: translate(-50%, -35px) scale(1); opacity: 0; }
        }
        @keyframes dust-poof {
            0% { transform: scale(0.5); opacity: 0.7; }
            100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes speech-appear {
            0% { transform: scale(0) translateY(10px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes kiss-float {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
        }
        @keyframes heart-burst {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        @keyframes expression-pop {
            0% { transform: scale(0); opacity: 1; }
            20% { transform: scale(1.3); opacity: 1; }
            40% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1); opacity: 0; }
        }

        /* ========== CRAZY INTERACTION EFFECTS ========== */
        .buddy-firework {
            position: fixed;
            font-size: 24px;
            pointer-events: none;
            z-index: 10003;
            animation: firework-burst 1.2s ease-out forwards;
        }
        .buddy-sparkle {
            position: fixed;
            font-size: 16px;
            pointer-events: none;
            z-index: 10002;
            animation: sparkle-fade 0.8s ease-out forwards;
        }
        .buddy-magic {
            position: fixed;
            font-size: 20px;
            pointer-events: none;
            z-index: 10003;
            animation: magic-spiral 1.5s ease-out forwards;
        }
        .buddy-portal {
            position: fixed;
            font-size: 40px;
            pointer-events: none;
            z-index: 10001;
            animation: portal-spin 2s ease-in-out forwards;
        }
        .buddy-beam {
            position: fixed;
            height: 3px;
            background: linear-gradient(90deg, transparent, #00ffff, #ff00ff, transparent);
            pointer-events: none;
            z-index: 10002;
            animation: beam-flash 0.5s ease-out forwards;
        }
        .buddy-ghost-effect {
            position: fixed;
            font-size: 28px;
            pointer-events: none;
            z-index: 10003;
            animation: ghost-float 2s ease-in-out forwards;
        }
        .buddy-music-note {
            position: fixed;
            font-size: 18px;
            pointer-events: none;
            z-index: 10002;
            animation: music-float 1.5s ease-out forwards;
        }
        .buddy-food-projectile {
            position: fixed;
            font-size: 20px;
            pointer-events: none;
            z-index: 10002;
        }
        .buddy-transformation {
            animation: transform-flash 0.3s ease-in-out 3;
        }

        @keyframes firework-burst {
            0% { transform: scale(0) rotate(0deg); opacity: 1; }
            50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
            100% { transform: scale(2) rotate(360deg); opacity: 0; }
        }
        @keyframes sparkle-fade {
            0% { transform: scale(0) rotate(0deg); opacity: 1; }
            50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
            100% { transform: scale(0.5) rotate(360deg); opacity: 0; }
        }
        @keyframes magic-spiral {
            0% { transform: translate(0, 0) rotate(0deg) scale(0); opacity: 1; }
            50% { transform: translate(20px, -30px) rotate(360deg) scale(1.2); opacity: 1; }
            100% { transform: translate(40px, -60px) rotate(720deg) scale(0); opacity: 0; }
        }
        @keyframes portal-spin {
            0% { transform: scale(0) rotate(0deg); opacity: 0; }
            20% { transform: scale(1) rotate(180deg); opacity: 1; }
            80% { transform: scale(1.2) rotate(540deg); opacity: 1; }
            100% { transform: scale(0) rotate(720deg); opacity: 0; }
        }
        @keyframes beam-flash {
            0% { opacity: 0; transform: scaleX(0); }
            30% { opacity: 1; transform: scaleX(1); }
            100% { opacity: 0; transform: scaleX(1.2); }
        }
        @keyframes ghost-float {
            0% { transform: translateY(0) scale(1); opacity: 0.8; }
            50% { transform: translateY(-30px) scale(1.2); opacity: 1; }
            100% { transform: translateY(-60px) scale(0.5); opacity: 0; }
        }
        @keyframes music-float {
            0% { transform: translateY(0) rotate(-20deg); opacity: 1; }
            100% { transform: translateY(-40px) rotate(20deg); opacity: 0; }
        }
        @keyframes transform-flash {
            0%, 100% { filter: brightness(1) hue-rotate(0deg); }
            50% { filter: brightness(2) hue-rotate(180deg); }
        }

        .buddy-character.dancing { animation: buddy-dance 0.4s ease-in-out infinite; }
        .buddy-character.singing { animation: buddy-sing 0.5s ease-in-out infinite; }
        .buddy-character.possessed { animation: buddy-possessed 0.2s ease-in-out infinite; filter: hue-rotate(180deg); }
        .buddy-character.dramatic-death { animation: buddy-death 2s ease-out forwards; }
        .buddy-character.telepathy { animation: buddy-telepathy 0.8s ease-in-out infinite; }
        .buddy-character.fused { animation: buddy-fused 0.5s ease-in-out infinite; filter: drop-shadow(0 0 10px gold); }
        .buddy-character.timewarp { animation: buddy-timewarp 0.3s linear infinite; }

        @keyframes buddy-dance {
            0%, 100% { transform: translateY(0) rotate(-10deg); }
            25% { transform: translateY(-8px) rotate(10deg); }
            50% { transform: translateY(0) rotate(-10deg); }
            75% { transform: translateY(-8px) rotate(10deg); }
        }
        @keyframes buddy-sing {
            0%, 100% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.1) translateY(-5px); }
        }
        @keyframes buddy-possessed {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            25% { transform: translateX(-3px) rotate(-5deg); }
            75% { transform: translateX(3px) rotate(5deg); }
        }
        @keyframes buddy-death {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            30% { transform: translateY(-20px) rotate(-20deg); opacity: 1; }
            60% { transform: translateY(0) rotate(90deg); opacity: 0.8; }
            100% { transform: translateY(10px) rotate(90deg); opacity: 0.3; }
        }
        @keyframes buddy-telepathy {
            0%, 100% { filter: drop-shadow(0 0 5px #9400D3); }
            50% { filter: drop-shadow(0 0 20px #9400D3) brightness(1.3); }
        }
        @keyframes buddy-fused {
            0%, 100% { transform: scale(1.3); }
            50% { transform: scale(1.5); }
        }
        @keyframes buddy-timewarp {
            0% { opacity: 1; filter: blur(0); }
            50% { opacity: 0.5; filter: blur(2px); }
            100% { opacity: 1; filter: blur(0); }
        }

        /* ========== BUDDY COURT SYSTEM ========== */
        .buddy-court-judge {
            position: fixed;
            font-size: 28px;
            z-index: 10003;
            pointer-events: none;
            animation: judge-enter 0.5s ease-out forwards;
            filter: drop-shadow(0 0 6px rgba(255,215,0,0.8));
        }
        .buddy-court-judge .judge-wig {
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 14px;
        }
        .buddy-court-gavel {
            position: fixed;
            font-size: 24px;
            z-index: 10004;
            pointer-events: none;
            animation: gavel-slam 0.4s ease-in forwards;
        }
        .buddy-speech.court {
            border-color: #DAA520;
            background: linear-gradient(135deg, #FFF8DC, #FFFACD);
            color: #333;
            font-family: 'Georgia', serif;
            font-style: italic;
            max-width: 200px;
            z-index: 10005;
        }
        .buddy-speech.court::after {
            border-top-color: #DAA520;
        }
        .buddy-speech.verdict {
            border-color: #FF4500;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: #FFD700;
            font-family: Impact, sans-serif;
            font-style: normal;
            font-size: 13px;
            max-width: 220px;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 0 15px rgba(255,215,0,0.4);
        }
        .buddy-speech.verdict::after {
            border-top-color: #FF4500;
        }
        .buddy-character.court-punishment-dance {
            animation: court-forced-dance 0.3s ease-in-out infinite !important;
        }
        .buddy-character.court-punishment-shrink {
            animation: court-forced-shrink 2s ease-in-out forwards !important;
        }
        .buddy-character.court-punishment-spin {
            animation: court-forced-spin 0.5s linear infinite !important;
        }
        .buddy-character.court-punishment-vibrate {
            animation: court-forced-vibrate 0.08s linear infinite !important;
        }
        .buddy-character.court-punishment-float {
            animation: court-forced-float 1.5s ease-in-out infinite !important;
        }
        @keyframes judge-enter {
            0% { transform: translateY(-40px) scale(0); opacity: 0; }
            60% { transform: translateY(5px) scale(1.2); opacity: 1; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes gavel-slam {
            0% { transform: rotate(-45deg) scale(1.5); opacity: 1; }
            50% { transform: rotate(15deg) scale(1); }
            70% { transform: rotate(-5deg) scale(1.2); }
            100% { transform: rotate(0deg) scale(1); opacity: 0; }
        }
        @keyframes court-forced-dance {
            0% { transform: translateX(0) rotate(0deg); }
            25% { transform: translateX(-8px) rotate(-15deg); }
            50% { transform: translateX(0) rotate(0deg) scaleY(0.85); }
            75% { transform: translateX(8px) rotate(15deg); }
            100% { transform: translateX(0) rotate(0deg); }
        }
        @keyframes court-forced-shrink {
            0% { transform: scale(1); }
            50% { transform: scale(0.3) rotate(720deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes court-forced-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes court-forced-vibrate {
            0% { transform: translate(0, 0); }
            25% { transform: translate(-2px, 2px); }
            50% { transform: translate(2px, -2px); }
            75% { transform: translate(-2px, -1px); }
            100% { transform: translate(1px, 2px); }
        }
        @keyframes court-forced-float {
            0%, 100% { transform: translateY(0); opacity: 0.5; }
            50% { transform: translateY(-25px); opacity: 1; }
        }

        /* ========== BUDDY ARTIFACT SYSTEM ========== */
        .buddy-artifact {
            position: fixed;
            font-size: 18px;
            z-index: 9990;
            pointer-events: none;
            animation: artifact-spawn 0.6s ease-out forwards;
            filter: drop-shadow(0 0 8px rgba(255,215,0,0.6));
        }
        .buddy-artifact.artifact-discovered {
            animation: artifact-pickup 0.5s ease-in forwards;
        }
        .buddy-artifact-sparkle {
            position: fixed;
            font-size: 10px;
            pointer-events: none;
            z-index: 9989;
            animation: artifact-sparkle-anim 1s ease-out infinite;
        }
        .buddy-artifact-toast {
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: #FFD700;
            padding: 8px 18px;
            border-radius: 8px;
            font-family: 'Georgia', serif;
            font-size: 14px;
            z-index: 10010;
            box-shadow: 0 0 20px rgba(255,215,0,0.3);
            border: 1px solid #DAA520;
            animation: artifact-toast-anim 3s ease-in-out forwards;
            pointer-events: none;
            text-align: center;
        }
        .buddy-character.artifact-sword {
            filter: drop-shadow(0 0 6px #FF4444) !important;
        }
        .buddy-character.artifact-potion {
            animation: buddy-idle 1.5s ease-in-out infinite, artifact-potion-colors 2s linear infinite !important;
        }
        .buddy-character.artifact-scroll {
            filter: drop-shadow(0 0 5px #DAA520) !important;
        }
        .buddy-character.artifact-orb {
            filter: drop-shadow(0 0 10px #9400D3) drop-shadow(0 0 20px #9400D3) !important;
        }
        .buddy-character.artifact-crown {
            filter: drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 16px #FFD700) !important;
        }
        .buddy-character.artifact-mirror {
            filter: drop-shadow(0 0 6px #00CED1) !important;
        }
        .buddy-artifact-badge {
            position: absolute;
            top: -4px;
            left: -4px;
            font-size: 10px;
            animation: artifact-badge-pulse 1.5s ease-in-out infinite;
            pointer-events: none;
        }
        @keyframes artifact-spawn {
            0% { transform: scale(0) rotate(-180deg); opacity: 0; }
            60% { transform: scale(1.3) rotate(10deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes artifact-pickup {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5) translateY(-15px); opacity: 1; }
            100% { transform: scale(0) translateY(-30px); opacity: 0; }
        }
        @keyframes artifact-sparkle-anim {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes artifact-toast-anim {
            0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            15% { opacity: 1; transform: translateX(-50%) translateY(0); }
            80% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
        @keyframes artifact-potion-colors {
            0% { filter: hue-rotate(0deg) drop-shadow(1px 1px 2px rgba(0,0,0,0.4)); }
            33% { filter: hue-rotate(120deg) drop-shadow(1px 1px 2px rgba(0,0,0,0.4)); }
            66% { filter: hue-rotate(240deg) drop-shadow(1px 1px 2px rgba(0,0,0,0.4)); }
            100% { filter: hue-rotate(360deg) drop-shadow(1px 1px 2px rgba(0,0,0,0.4)); }
        }
        @keyframes artifact-badge-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.3); }
        }

        /* ===== ADVANCED BUDDY SYSTEMS CSS ===== */

        /* Mood visual effects */
        .mood-happy { filter: brightness(1.2) saturate(1.3); }
        .mood-angry { filter: saturate(1.5) hue-rotate(-10deg); }
        .mood-sad { filter: brightness(0.7) saturate(0.5); }
        .mood-scared { animation: buddy-tremble 0.15s ease-in-out infinite !important; }
        .mood-lovestruck { animation: buddy-float 2s ease-in-out infinite !important; }
        .mood-sleepy { filter: brightness(0.6) saturate(0.3); opacity: 0.7; }

        @keyframes buddy-tremble {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-1px) rotate(-1deg); }
            75% { transform: translateX(1px) rotate(1deg); }
        }
        @keyframes buddy-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
        }

        /* Sleeping state */
        .buddy-sleeping {
            animation: buddy-snooze 3s ease-in-out infinite !important;
        }
        .buddy-sleeping::after {
            content: '💤';
            position: absolute;
            top: -15px;
            right: -8px;
            font-size: 10px;
            animation: buddy-zzz 2s ease-in-out infinite;
        }
        @keyframes buddy-snooze {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(5deg); }
        }
        @keyframes buddy-zzz {
            0% { opacity: 0; transform: translateY(0) scale(0.5); }
            50% { opacity: 1; transform: translateY(-8px) scale(1); }
            100% { opacity: 0; transform: translateY(-16px) scale(0.8); }
        }

        /* Wall-running */
        .wall-running {
            transition: transform 0.3s ease !important;
        }
        .wall-left { transform: rotate(90deg) !important; }
        .wall-right { transform: rotate(-90deg) !important; }
        .wall-top { transform: rotate(180deg) !important; }

        /* Physics objects */
        .buddy-physics-obj {
            transition: none;
            filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
        }

        /* Group dance animation */
        .buddy-group-dance {
            animation: buddy-boogie 0.4s ease-in-out infinite !important;
        }
        @keyframes buddy-boogie {
            0%, 100% { transform: scaleX(1) rotate(0deg); }
            25% { transform: scaleX(0.9) rotate(-5deg); }
            50% { transform: scaleX(1.1) rotate(0deg) translateY(-3px); }
            75% { transform: scaleX(0.9) rotate(5deg); }
        }

        /* Ritual circle for summoning */
        .buddy-ritual-circle {
            font-size: 30px;
            text-align: center;
            animation: ritual-spin 2s linear infinite;
            filter: drop-shadow(0 0 8px gold) drop-shadow(0 0 15px #ff8c00);
        }
        .buddy-ritual-burst {
            animation: ritual-burst 0.5s ease-out forwards !important;
        }
        @keyframes ritual-spin {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.2); }
            100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes ritual-burst {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(3); opacity: 0; }
        }

        /* Buddy jobs visual indicators */
        .buddy-job-guard::before { content: '🛡️'; position: absolute; top: -12px; left: 50%; font-size: 8px; transform: translateX(-50%); }
        .buddy-job-messenger::before { content: '📩'; position: absolute; top: -12px; left: 50%; font-size: 8px; transform: translateX(-50%); }
        .buddy-job-dj::before { content: '🎧'; position: absolute; top: -12px; left: 50%; font-size: 8px; transform: translateX(-50%); }
        .buddy-job-janitor::before { content: '🧹'; position: absolute; top: -12px; left: 50%; font-size: 8px; transform: translateX(-50%); }

        /* Egg respawn */
        .buddy-egg {
            animation: buddy-egg-wobble 0.8s ease-in-out infinite !important;
        }
        .buddy-hatching {
            animation: buddy-hatch 1s ease-out !important;
        }
        @keyframes buddy-egg-wobble {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-8deg); }
            75% { transform: rotate(8deg); }
        }
        @keyframes buddy-hatch {
            0% { transform: scale(0.5); opacity: 0.5; }
            50% { transform: scale(1.3); opacity: 1; }
            100% { transform: scale(1); }
        }

        /* Evolution tiers */
        .buddy-evo-1 {
            font-size: 26px !important;
            filter: drop-shadow(0 0 3px rgba(255,215,0,0.5));
        }
        .buddy-evo-2 {
            font-size: 28px !important;
            filter: drop-shadow(0 0 5px rgba(255,165,0,0.7));
        }
        .buddy-evo-2::after {
            content: '👑';
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 8px;
        }
        .buddy-evo-3 {
            font-size: 30px !important;
            filter: drop-shadow(0 0 8px rgba(255,69,0,0.8)) drop-shadow(0 0 15px rgba(255,215,0,0.4));
            animation: buddy-evo-glow 2s ease-in-out infinite !important;
        }
        .buddy-evo-3::after {
            content: '🌟';
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            animation: buddy-evo-crown 1.5s ease-in-out infinite;
        }
        @keyframes buddy-evo-glow {
            0%, 100% { filter: drop-shadow(0 0 8px rgba(255,69,0,0.8)) drop-shadow(0 0 15px rgba(255,215,0,0.4)); }
            50% { filter: drop-shadow(0 0 12px rgba(255,69,0,1)) drop-shadow(0 0 20px rgba(255,215,0,0.7)); }
        }
        @keyframes buddy-evo-crown {
            0%, 100% { transform: translateX(-50%) translateY(0) rotate(0deg); }
            50% { transform: translateX(-50%) translateY(-3px) rotate(5deg); }
        }

        /* ========== BUDDY DRAG & DROP ========== */
        .buddy-character.buddy-being-dragged {
            z-index: 10010 !important;
            cursor: grabbing !important;
            animation: none !important;
            transition: none !important;
        }
        .buddy-character.buddy-being-dragged .buddy-nametag {
            opacity: 0 !important;
        }
        .buddy-drag-ring {
            position: fixed;
            pointer-events: none;
            z-index: 10009;
            border: 2px solid rgba(255,215,0,0.9);
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(255,215,0,0.5), inset 0 0 6px rgba(255,215,0,0.3);
            animation: buddy-drag-ring-pulse 0.8s ease-in-out infinite;
        }
        .buddy-drag-label {
            position: fixed;
            pointer-events: none;
            z-index: 10010;
            background: rgba(0,0,0,0.85);
            color: #ffd700;
            padding: 2px 8px;
            border-radius: 8px;
            font-size: 10px;
            font-family: monospace;
            white-space: nowrap;
            border: 1px solid rgba(255,215,0,0.6);
            box-shadow: 0 0 6px rgba(255,215,0,0.3);
        }
        @keyframes buddy-drag-ring-pulse {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.12); opacity: 0.6; }
        }
        .buddy-character.buddy-returning {
            transition: left 0.4s ease-out, top 0.4s ease-out !important;
        }

        @media (max-width: 768px) {
            .buddy-character { display: none; }
            .buddy-speech { display: none; }
            .buddy-artifact { display: none; }
            .buddy-artifact-toast { display: none; }
            .buddy-physics-obj { display: none; }
            .buddy-ritual-circle { display: none; }
        }
    `;
    document.head.appendChild(styles);
}

function syncBuddiesWithUserlist() {
    var currentUsers = [];
    $('#userlist .userlist_item span').each(function() {
        var name = $(this).text().trim();
        if (name) currentUsers.push(name);
    });

    Object.keys(buddyCharacters).forEach(function(u) {
        if (currentUsers.indexOf(u) === -1) removeBuddy(u);
    });
    currentUsers.forEach(function(u) {
        if (!buddyCharacters[u]) addBuddy(u);
    });

    // After all buddies are created/synced, apply any stored custom settings
    // This catches settings that arrived before buddies were created
    Object.keys(customBuddySettings).forEach(function(username) {
        if (buddyCharacters[username]) {
            applyCustomSettingsToBuddy(username);
        }
    });
}

function observeUserlistChanges() {
    var userlist = document.getElementById('userlist');
    if (!userlist) return;
    var observer = new MutationObserver(function() {
        clearTimeout(window.buddySyncTimeout);
        window.buddySyncTimeout = setTimeout(syncBuddiesWithUserlist, 300);
    });
    observer.observe(userlist, { childList: true, subtree: true });
    _bokiCleanup.registerObserver('buddyUserlistObserver', observer);
}

function observeChatMessages() {
    var msgBuffer = document.getElementById('messagebuffer');
    if (!msgBuffer) return;
    var observer = new MutationObserver(function(mutations) {
        scanChatForWords();

        // Collect new messages for buddies to quote (user messages ONLY)
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType !== 1) return;

                // MUST have a .username span — this filters out join/leave/system messages
                var usernameEl = node.querySelector && node.querySelector('.username');
                if (!usernameEl) return;

                // Skip system/server/poll messages
                if (node.classList.contains('server-msg') ||
                    node.classList.contains('poll-notify') ||
                    node.classList.contains('server-whisper')) return;

                // Extract just the message body text after the username
                var cleanMsg = '';
                var foundColon = false;
                var children = node.childNodes;
                for (var ci = 0; ci < children.length; ci++) {
                    var child = children[ci];
                    // Skip the username element and anything before it
                    if (child === usernameEl || (child.querySelector && child.querySelector('.username'))) {
                        foundColon = true;
                        continue;
                    }
                    if (foundColon) {
                        cleanMsg += (child.textContent || '');
                    }
                }
                // Strip leading colon/spaces
                cleanMsg = cleanMsg.replace(/^[\s:]+/, '').trim();

                if (cleanMsg.length > 3 && cleanMsg.length < 200) {
                    recentChatMessages.push(cleanMsg);
                    if (recentChatMessages.length > 30) {
                        recentChatMessages.shift();
                    }
                    queueMessageForJsonBin(cleanMsg);
                }
            });
        });

        // Random buddy gets excited on new message
        var names = Object.keys(buddyCharacters);
        if (names.length > 0) {
            var lucky = buddyCharacters[names[Math.floor(Math.random() * names.length)]];
            if (lucky && !lucky.interacting && lucky.state !== 'jumping') {
                lucky.element.classList.add('buddy-excited');
                showExpression(lucky, ['😄', '😮', '✨', '💭'][Math.floor(Math.random() * 4)]);
                setTimeout(function() {
                    lucky.element.classList.remove('buddy-excited');
                    // Maybe jump to the new message
                    if (chatWordTargets.length > 0 && Math.random() < 0.4) {
                        var target = chatWordTargets[chatWordTargets.length - 1 - Math.floor(Math.random() * Math.min(3, chatWordTargets.length))];
                        if (target) startJumpTo(lucky, target);
                    }
                }, 600);
            }
        }
    });
    observer.observe(msgBuffer, { childList: true });
    _bokiCleanup.registerObserver('buddyChatObserver', observer);
}

function addBuddy(username) {
    if (buddyCharacters[username]) return;
    var zone = getBuddyZone();

    // Check for custom settings (from sync or if it's our own buddy)
    var customSettings = customBuddySettings[username];
    var myName = getMyUsername();
    if (username === myName && myBuddySettings) {
        customSettings = myBuddySettings;
    }

    // DETERMINISTIC: Same username = same sprite & personality across all browsers
    var hash = hashUsername(username);
    var sprite, personality, displayName;
    console.log('[BuddyCreate] Creating buddy for', username, '- hash:', hash, 'spriteCount:', BUDDY_SPRITES.length, 'index:', hash % BUDDY_SPRITES.length);
    console.log('[BuddyCreate] customSettings:', customSettings ? JSON.stringify(customSettings).substring(0, 100) : 'null');

    // Apply custom settings or use defaults
    if (customSettings && customSettings.spriteIndex >= 0) {
        sprite = BUDDY_SPRITES[customSettings.spriteIndex] || BUDDY_SPRITES[hash % BUDDY_SPRITES.length];
        console.log('[BuddyCreate] Using custom spriteIndex:', customSettings.spriteIndex, '- sprite:', sprite.name);
    } else {
        sprite = BUDDY_SPRITES[hash % BUDDY_SPRITES.length];
        console.log('[BuddyCreate] Using hash-based sprite:', sprite.name);
    }

    if (customSettings && customSettings.personality) {
        personality = customSettings.personality;
    } else {
        personality = PERSONALITY_NAMES[(hash >> 8) % PERSONALITY_NAMES.length];
    }

    displayName = (customSettings && customSettings.displayName) ? customSettings.displayName : username;

    var el = document.createElement('div');
    el.className = 'buddy-character idle';

    // Custom sprite URL or emoji
    if (customSettings && customSettings.customSpriteUrl) {
        // Custom image with fallback to emoji if image fails to load
        var customImg = document.createElement('img');
        customImg.src = customSettings.customSpriteUrl;
        customImg.style.cssText = 'width:100%;height:100%;object-fit:contain;';
        customImg.onerror = function() {
            console.log('[BuddyCreate] Custom sprite failed to load for', username, '- falling back to emoji');
            el.innerHTML = sprite.body + '<span class="buddy-nametag">' + escapeHtml(displayName) + '</span>';
        };
        el.appendChild(customImg);
        var customNametag = document.createElement('span');
        customNametag.className = 'buddy-nametag';
        customNametag.textContent = displayName;
        el.appendChild(customNametag);
    } else {
        el.innerHTML = sprite.body + '<span class="buddy-nametag">' + escapeHtml(displayName) + '</span>';
    }

    // Apply size
    var size = BUDDY_SIZES.medium;
    if (customSettings && customSettings.size && BUDDY_SIZES[customSettings.size]) {
        size = BUDDY_SIZES[customSettings.size];
    }
    el.style.fontSize = size + 'px';

    // Apply color filters (clamp values to safe ranges to prevent invisible/unrecognizable buddies)
    if (customSettings) {
        var filters = [];
        var hr = Math.max(0, Math.min(360, Number(customSettings.hueRotate) || 0));
        var sat = Math.max(50, Math.min(200, Number(customSettings.saturation) || 100));
        var br = Math.max(50, Math.min(150, Number(customSettings.brightness) || 100));
        if (hr) filters.push('hue-rotate(' + hr + 'deg)');
        if (sat !== 100) filters.push('saturate(' + sat + '%)');
        if (br !== 100) filters.push('brightness(' + br + '%)');
        if (customSettings.glowColor && customSettings.glowIntensity > 0) {
            var gi = Math.max(0, Math.min(20, Number(customSettings.glowIntensity) || 0));
            filters.push('drop-shadow(0 0 ' + gi + 'px ' + customSettings.glowColor + ')');
        }
        if (filters.length > 0) {
            el.style.filter = filters.join(' ');
        }
    }

    // Starting position uses hash for some consistency (within preferred upper zone)
    var startX = zone.left + ((hash % 100) / 100) * (zone.right - zone.left);
    var startY = zone.top + (((hash >> 4) % 100) / 100) * (zone.bottom - zone.top);
    el.style.left = startX + 'px';
    el.style.top = startY + 'px';

    // Drag-and-drop (includes click fallback for non-drag taps)
    initBuddyDrag(el, username);

    document.body.appendChild(el);

    buddyCharacters[username] = {
        element: el,
        username: username,
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        sprite: sprite,
        personality: personality,
        customSettings: customSettings,
        state: 'idle',
        stateTime: 0,
        target: null,
        interacting: false,
        interactCooldown: 0,
        speechCooldown: 0,
        conversationCooldown: 0,
        currentTarget: null,
        inConversation: false,
        // Advanced systems
        mood: { type: 'neutral', intensity: 0, decayTimer: 0 },
        perchedSurface: null,     // DOM surface buddy is perched on
        wallRunning: false,       // Currently wall-running
        wallRunSide: null,        // 'left', 'right', 'top'
        wallRunProgress: 0,       // 0-1 along the wall
        job: null,                // Current job assignment
        jobTimer: 0,              // Time left on job
        jobData: null,            // Job-specific state
        sleeping: false,          // Asleep from chat silence
        totalInteractions: 0,     // Lifetime interaction count
        evolutionTier: 0,         // Visual evolution level (0-3)
        huntTarget: null,         // For predator/prey system
        isEgg: false,             // Respawning as egg
        eggTimer: 0,              // Time left as egg
        moveRng: createSeededRandom(hashUsername(username)),  // Deterministic movement RNG
        posLerpTarget: null,      // Target position for smooth correction lerp
        posLerpProgress: 0,       // 0-1 lerp progress
        hopFriction: 0.97,        // Deceleration rate during hopping (organic movement)
        hopPauseTime: 0,          // Time at which to pause mid-hop (0 = no pause)
        _stuckTimer: 0,           // Tracks how long buddy has been in blocking state
        _trackedIntervals: [],    // All setInterval IDs for cleanup on removal
        _trackedTimeouts: []      // All setTimeout IDs for cleanup on removal
    };

    // Delayed re-sync: if custom settings arrive after buddy creation, apply them
    // Check multiple times in case sync messages arrive later
    setTimeout(function() {
        if (customBuddySettings[username] && buddyCharacters[username]) {
            applyCustomSettingsToBuddy(username);
        }
    }, 2000);

    setTimeout(function() {
        if (customBuddySettings[username] && buddyCharacters[username]) {
            applyCustomSettingsToBuddy(username);
        }
    }, 5000);
}

function removeBuddy(username) {
    var buddy = buddyCharacters[username];
    if (!buddy) return;

    // Preserve custom settings so sprite can be restored on rejoin
    if (buddy.customSettings && !customBuddySettings[username]) {
        customBuddySettings[username] = buddy.customSettings;
    }
    if (customBuddySettings[username]) {
        customBuddySettings[username]._departedAt = Date.now();
    }

    // Clean up all tracked intervals/timeouts to prevent ghost interactions
    cleanupBuddyTimers(buddy);

    // Reset interaction flag immediately so other buddies aren't blocked
    buddy.interacting = false;
    buddy.isEgg = false;
    buddy.sleeping = false;
    buddy.wallRunning = false;
    buddy.job = null;

    buddy.element.style.transition = 'opacity 0.4s, transform 0.4s';
    buddy.element.style.opacity = '0';
    buddy.element.style.transform = 'scale(0.3)';
    setTimeout(function() {
        if (buddy.element.parentNode) buddy.element.remove();
        delete buddyCharacters[username];
    }, 400);
}

// Clean up all tracked timers on a buddy to prevent stuck states
function cleanupBuddyTimers(buddy) {
    if (!buddy) return;
    // Clear all tracked intervals
    if (buddy._trackedIntervals) {
        buddy._trackedIntervals.forEach(function(id) {
            clearInterval(id);
        });
        buddy._trackedIntervals = [];
    }
    // Clear all tracked timeouts
    if (buddy._trackedTimeouts) {
        buddy._trackedTimeouts.forEach(function(id) {
            clearTimeout(id);
        });
        buddy._trackedTimeouts = [];
    }
    // Clear hunt-specific cleanup
    if (buddy._huntEnded) {
        buddy._huntEnded();
        buddy._huntEnded = null;
    }
}

// Track an interval on a buddy for cleanup when removed
function trackBuddyInterval(buddy, intervalId) {
    if (!buddy) return intervalId;
    if (!buddy._trackedIntervals) buddy._trackedIntervals = [];
    buddy._trackedIntervals.push(intervalId);
    return intervalId;
}

// Track a timeout on a buddy for cleanup when removed
function trackBuddyTimeout(buddy, timeoutId) {
    if (!buddy) return timeoutId;
    if (!buddy._trackedTimeouts) buddy._trackedTimeouts = [];
    buddy._trackedTimeouts.push(timeoutId);
    return timeoutId;
}

// Remove a specific interval from tracking (when it completes naturally)
function untrackBuddyInterval(buddy, intervalId) {
    if (!buddy || !buddy._trackedIntervals) return;
    var idx = buddy._trackedIntervals.indexOf(intervalId);
    if (idx !== -1) buddy._trackedIntervals.splice(idx, 1);
}

function startBuddyAnimation() {
    if (buddyAnimationId) return;

    // Get ALL settings for a buddy (combines myBuddySettings, customBuddySettings, and defaults)
    function getBuddySettings(name) {
        var myName = getMyUsername();
        var settings = null;

        if (name === myName && myBuddySettings) {
            settings = myBuddySettings;
        } else if (customBuddySettings[name]) {
            settings = customBuddySettings[name];
        }

        // Return settings with defaults
        // CRITICAL: energyLevel must NEVER be 0 or falsy, or stateTime stops incrementing and buddy freezes
        var rawEnergy = settings ? settings.energyLevel : 1.0;
        var safeEnergy = (typeof rawEnergy === 'number' && rawEnergy > 0) ? rawEnergy : 1.0;

        return {
            positionPreference: (settings && settings.positionPreference) || 'roam',
            movementSpeed: Math.max(0.1, (settings && settings.movementSpeed) || 1.0),
            movementStyle: (settings && settings.movementStyle) || 'default',
            energyLevel: safeEnergy,
            chattiness: (settings && settings.chattiness) || 1.0,
            interactionFrequency: (settings && settings.interactionFrequency) || 1.0,
            catchphrase: (settings && settings.catchphrase) || null,
            customPhrases: (settings && settings.customPhrases) || [],
            greeting: (settings && settings.greeting) || null,
            victoryLine: (settings && settings.victoryLine) || null,
            defeatLine: (settings && settings.defeatLine) || null,
            loveLine: (settings && settings.loveLine) || null
        };
    }

    // Get position preference for a buddy (legacy helper)
    function getBuddyPositionPref(name) {
        return getBuddySettings(name).positionPreference;
    }

    // Generate a random target anywhere in the zone based on position preference
    // 95% of the time targets stay in the preferred upper zone (zone.bottom)
    // 5% of the time allows venturing into the lower area (zone.absoluteBottom)
    function getRandomTarget(zone, posPref, rng) {
        var r = rng || Math.random;
        var x = zone.left + r() * (zone.right - zone.left);
        var y;

        // 5% chance to use extended lower area
        var useExtended = r() < 0.05;
        var effectiveBottom = useExtended ? zone.absoluteBottom : zone.bottom;

        switch (posPref) {
            case 'ground':
                // Stay in bottom third of effective zone
                y = effectiveBottom - r() * ((effectiveBottom - zone.top) * 0.3);
                break;
            case 'high':
                // Stay in top third of zone (unaffected by extended)
                y = zone.top + r() * ((zone.bottom - zone.top) * 0.3);
                break;
            case 'chatFollow':
                // Only go where chat messages are (use chatWordTargets)
                if (chatWordTargets.length > 0) {
                    return chatWordTargets[Math.floor(r() * chatWordTargets.length)];
                }
                // Fallback to random if no chat targets
                y = zone.top + r() * (effectiveBottom - zone.top);
                break;
            case 'roam':
            default:
                // Roam within effective zone
                y = zone.top + r() * (effectiveBottom - zone.top);
                break;
        }

        return { x: x, y: y };
    }

    // Apply movement style modifiers
    function applyMovementStyle(b, settings, baseVx, baseVy) {
        var style = settings.movementStyle;
        var speed = settings.movementSpeed;
        var r = b.moveRng || Math.random;

        switch (style) {
            case 'smooth':
                // Smooth: slower, more gradual movement
                b.vx = baseVx * speed * 0.7;
                b.vy = (baseVy || 0) * speed * 0.7;
                break;
            case 'bouncy':
                // Bouncy: more vertical action
                b.vx = baseVx * speed;
                b.vy = (baseVy || 0) * speed * 1.5 + (r() - 0.5) * 2;
                break;
            case 'floaty':
                // Floaty: slow, drifting movement
                b.vx = baseVx * speed * 0.5;
                b.vy = (baseVy || 0) * speed * 0.3;
                break;
            case 'erratic':
                // Erratic: unpredictable direction changes
                b.vx = baseVx * speed * (0.5 + r());
                b.vy = (baseVy || 0) * speed * (0.5 + r());
                if (r() < 0.3) b.vx *= -1;
                break;
            case 'teleporty':
                // Teleporty: occasional instant position shifts
                b.vx = baseVx * speed * 1.5;
                b.vy = (baseVy || 0) * speed * 1.5;
                break;
            default:
                // Default: just apply speed multiplier
                b.vx = baseVx * speed;
                b.vy = (baseVy || 0) * speed;
        }
    }

    // Max time any interaction/state should last before forced recovery (15 seconds)
    var MAX_INTERACTION_TIME = 15000;
    var MAX_STATE_TIME = 60000; // Max 60s in any single state before forced transition

    function update() {
        var names = Object.keys(buddyCharacters);
        var zone = getBuddyZone();

        names.forEach(function(name) {
            var b = buddyCharacters[name];
            if (!b) return;

            // Skip buddies being dragged - position controlled by drag handler
            if (b.dragging) return;

            // ===== STUCK BUDDY RECOVERY =====
            // Track how long buddy has been in current interaction or blocking state
            if (!b._stuckTimer) b._stuckTimer = 0;

            if (b.interacting || b.isEgg || b.sleeping) {
                b._stuckTimer += BUDDY_CONFIG.updateInterval;

                // Force-unstick buddies that have been interacting too long
                if (b.interacting && b._stuckTimer > MAX_INTERACTION_TIME) {
                    console.log('[BuddyRecovery] Force-unsticking', name, 'after', b._stuckTimer, 'ms in interaction');
                    cleanupBuddyTimers(b);
                    b.interacting = false;
                    b.inConversation = false;
                    b.interactCooldown = 3000;
                    b.state = 'idle';
                    b.stateTime = 0;
                    b._stuckTimer = 0;
                    b.wallRunning = false;
                    setAnim(b, 'idle');
                    b.element.style.transform = '';
                    b.element.classList.remove('wall-running', 'wall-left', 'wall-right', 'wall-top');
                }

                // Force-unstick eggs that have been eggs too long (2x normal duration)
                if (b.isEgg && b._stuckTimer > BUDDY_CONFIG.respawnEggDuration * 2) {
                    console.log('[BuddyRecovery] Force-hatching stuck egg', name);
                    b.isEgg = false;
                    b.interacting = false;
                    b.eggTimer = 0;
                    b.state = 'idle';
                    b.stateTime = 0;
                    b._stuckTimer = 0;
                    b.element.classList.remove('buddy-egg');
                    // Restore sprite
                    if (b.sprite) {
                        b.element.childNodes[0].textContent = b.sprite.body;
                    }
                    setAnim(b, 'idle');
                }

                // Force wake sleeping buddies after 5 minutes
                if (b.sleeping && b._stuckTimer > 300000) {
                    console.log('[BuddyRecovery] Force-waking', name, 'after 5 min sleep');
                    b.sleeping = false;
                    b._stuckTimer = 0;
                    b.element.classList.remove('buddy-sleeping');
                }
            } else {
                b._stuckTimer = 0;
            }

            // Skip further processing for interacting buddies
            if (b.interacting) return;

            // Get all settings for this buddy
            var settings = getBuddySettings(name);
            var posPref = settings.positionPreference;
            var energy = settings.energyLevel;
            var speed = settings.movementSpeed;

            if (b.interactCooldown > 0) b.interactCooldown -= BUDDY_CONFIG.updateInterval;
            b.stateTime += BUDDY_CONFIG.updateInterval * energy; // Energy affects time progression

            // Force state transition if stuck too long in any state
            if (b.stateTime > MAX_STATE_TIME && b.state !== 'idle') {
                console.log('[BuddyRecovery] Forcing', name, 'out of stuck state:', b.state);
                b.state = 'idle';
                b.stateTime = 0;
                b.wallRunning = false;
                b.element.style.transform = '';
                b.element.classList.remove('wall-running', 'wall-left', 'wall-right', 'wall-top');
                setAnim(b, 'idle');
            }

            // Skip normal movement for buddies with jobs, sleeping, or eggs
            if (b.job || b.sleeping || b.isEgg) return;

            // Wall-running state (handled separately)
            if (b.wallRunning) {
                if (!updateWallRun(b, zone)) {
                    // Wall run ended, resume normal
                }
                b.element.style.left = b.x + 'px';
                b.element.style.top = b.y + 'px';
                return;
            }

            // Mood speed modifier
            var moodSpeed = getMoodSpeedMultiplier(b);
            var evoBonus = getEvolutionSpeedBonus(name);

            var r = b.moveRng || Math.random;

            if (b.state === 'idle') {
                // Subtle idle bobbing - makes buddies feel alive while standing still
                var bobPhase = (Date.now() + hashUsername(name) * 137) / (800 + hashUsername(name) % 400);
                var bob = Math.sin(bobPhase) * 1.2;
                b.y += bob * 0.03; // Tiny Y oscillation

                // Personality-varied idle time: base 1.5-5s scaled by energy
                var personalityFactor = 0.7 + (hashUsername(name) % 100) / 150; // 0.7-1.37
                var idleTime = (1500 + r() * 3500) * personalityFactor / energy;
                if (b.stateTime > idleTime) {
                    var action = r();
                    var useChatTargets = (posPref === 'chatFollow') && chatWordTargets.length > 0;

                    // Teleporty style: chance to teleport instead of jump
                    if (settings.movementStyle === 'teleporty' && r() < 0.3) {
                        var teleportTarget = useChatTargets
                            ? chatWordTargets[Math.floor(r() * chatWordTargets.length)]
                            : getRandomTarget(zone, posPref, r);
                        b.x = teleportTarget.x;
                        b.y = teleportTarget.y;
                        showExpression(b, '✨');
                        b.stateTime = 0;
                    } else if (action < 0.12 && uiSurfaces.length > 0) {
                        // Perch on a UI element (12% chance)
                        var surfaceTarget = getRandomSurface(zone, r);
                        if (surfaceTarget) {
                            b.perchedSurface = surfaceTarget.surface;
                            startJumpTo(b, surfaceTarget, speed * moodSpeed * evoBonus);
                        } else {
                            var fallbackTarget = getRandomTarget(zone, posPref, r);
                            startJumpTo(b, fallbackTarget, speed * moodSpeed * evoBonus);
                        }
                    } else if (action < 0.22 && buddyTerritories[name]) {
                        // Patrol territory (10% chance if territory assigned)
                        var patrolTarget = getPatrolTarget(b);
                        patrolTarget.x = Math.max(zone.left, Math.min(zone.right, patrolTarget.x));
                        patrolTarget.y = Math.max(zone.top, Math.min(zone.absoluteBottom, patrolTarget.y));
                        startJumpTo(b, patrolTarget, speed * moodSpeed * evoBonus);
                    } else if (action < 0.55) {
                        // Jump to a specific target (most common)
                        var target = useChatTargets
                            ? chatWordTargets[Math.floor(r() * chatWordTargets.length)]
                            : getRandomTarget(zone, posPref, r);
                        startJumpTo(b, target, speed * moodSpeed * evoBonus);
                    } else if (action < 0.65) {
                        // Short wander: brief hop in a direction, then pause
                        b.state = 'hopping';
                        b.stateTime = 0;
                        b.hopFriction = 0.96 + r() * 0.03; // 0.96-0.99 friction
                        b.hopPauseTime = 0; // No mid-hop pause yet
                        var moodMod = getMoodHopModifier(b, r);
                        var baseVx = (r() - 0.5) * BUDDY_CONFIG.hopSpeed * 1.4 + moodMod.vxMod;
                        var baseVy = (posPref === 'roam') ? (r() - 0.5) * BUDDY_CONFIG.hopSpeed * 0.7 + moodMod.vyMod : moodMod.vyMod;
                        applyMovementStyle(b, settings, baseVx * moodSpeed * evoBonus, baseVy * moodSpeed * evoBonus);
                        setAnim(b, 'hopping');
                        updateFace(b);
                    } else {
                        // Full wander: longer hop with possible mid-hop direction change
                        b.state = 'hopping';
                        b.stateTime = 0;
                        b.hopFriction = 0.985 + r() * 0.01; // Slower deceleration
                        b.hopPauseTime = r() < 0.35 ? (800 + r() * 1200) : 0; // 35% chance of mid-hop pause
                        var moodMod2 = getMoodHopModifier(b, r);
                        var baseVx2 = (r() - 0.5) * BUDDY_CONFIG.hopSpeed * 2.2 + moodMod2.vxMod;
                        var baseVy2 = (posPref === 'roam') ? (r() - 0.5) * BUDDY_CONFIG.hopSpeed + moodMod2.vyMod : moodMod2.vyMod;
                        applyMovementStyle(b, settings, baseVx2 * moodSpeed * evoBonus, baseVy2 * moodSpeed * evoBonus);
                        setAnim(b, 'hopping');
                        updateFace(b);
                    }
                }
            } else if (b.state === 'jumping') {
                b.x += b.vx;
                b.y += b.vy;
                b.vy += BUDDY_CONFIG.gravity;

                if (b.target && b.y >= b.target.y) {
                    b.y = b.target.y;
                    b.x = b.target.x;
                    b.state = 'perched';
                    b.stateTime = 0;
                    setAnim(b, 'perched');
                } else if (b.y > zone.absoluteBottom) {
                    b.y = zone.absoluteBottom;
                    b.state = 'idle';
                    b.stateTime = 0;
                    setAnim(b, 'idle');
                } else if (b.y < zone.top) {
                    b.y = zone.top;
                    b.vy = Math.abs(b.vy) * 0.5;
                }
                b.x = Math.max(zone.left, Math.min(zone.right, b.x));
            } else if (b.state === 'perched') {
                // Subtle perch sway
                var swayPhase = (Date.now() + hashUsername(name) * 89) / 1200;
                b.x += Math.sin(swayPhase) * 0.15;

                var perchTime = BUDDY_CONFIG.perchDuration / energy;
                // Personality varies perch duration: some buddies perch longer
                perchTime *= (0.6 + (hashUsername(name) % 80) / 100);
                if (b.stateTime > perchTime) {
                    var useChatTargets = (posPref === 'chatFollow') && chatWordTargets.length > 1;

                    if (r() < 0.6) {
                        var newTarget = useChatTargets
                            ? chatWordTargets[Math.floor(r() * chatWordTargets.length)]
                            : getRandomTarget(zone, posPref, r);
                        startJumpTo(b, newTarget, speed);
                    } else {
                        b.state = 'hopping';
                        b.stateTime = 0;
                        b.hopFriction = 0.97 + r() * 0.02;
                        b.hopPauseTime = 0;
                        var baseVx = (r() - 0.5) * BUDDY_CONFIG.hopSpeed * 2;
                        var baseVy = (posPref === 'roam') ? (r() - 0.5) * BUDDY_CONFIG.hopSpeed : 0;
                        applyMovementStyle(b, settings, baseVx, baseVy);
                        setAnim(b, 'hopping');
                        updateFace(b);
                    }
                }
            } else if (b.state === 'hopping') {
                // Friction-based deceleration for organic movement
                var friction = b.hopFriction || 0.97;
                b.vx *= friction;
                if (b.vy) b.vy *= friction;

                // Erratic style: random direction changes while hopping
                if (settings.movementStyle === 'erratic' && r() < 0.1) {
                    b.vx += (r() - 0.5) * 2;
                    if (b.vy) b.vy += (r() - 0.5) * 2;
                }

                // Mid-hop pause: briefly stop moving, then resume (looks like "looking around")
                if (b.hopPauseTime > 0 && b.stateTime > b.hopPauseTime && b.stateTime < b.hopPauseTime + 600) {
                    b.vx *= 0.8; // Strong deceleration during pause
                    if (b.vy) b.vy *= 0.8;
                } else {
                    b.x += b.vx;
                    if (posPref === 'roam' && b.vy) {
                        b.y += b.vy;
                        if (b.y <= zone.top) { b.y = zone.top; b.vy = Math.abs(b.vy) * 0.6; }
                        else if (b.y >= zone.absoluteBottom) { b.y = zone.absoluteBottom; b.vy = -Math.abs(b.vy) * 0.6; }
                    }
                }

                if (b.x <= zone.left) {
                    // Wall-run chance when hitting left wall
                    if (r() < BUDDY_CONFIG.wallRunChance && !b.wallRunning) {
                        startWallRun(b, 'left', zone);
                        return;
                    }
                    b.x = zone.left; b.vx = Math.abs(b.vx) * 0.5; updateFace(b); // Softer bounce
                } else if (b.x >= zone.right) {
                    if (r() < BUDDY_CONFIG.wallRunChance && !b.wallRunning) {
                        startWallRun(b, 'right', zone);
                        return;
                    }
                    b.x = zone.right; b.vx = -Math.abs(b.vx) * 0.5; updateFace(b); // Softer bounce
                }

                // Stop hopping when velocity is negligible (natural deceleration stop)
                var totalV = Math.abs(b.vx) + Math.abs(b.vy || 0);
                var hopTime = (2500 + r() * 2000) / energy;
                if (totalV < 0.15 || b.stateTime > hopTime) {
                    var useChatTargets = (posPref === 'chatFollow') && chatWordTargets.length > 0;

                    if (r() < 0.5) {
                        var t = useChatTargets
                            ? chatWordTargets[Math.floor(r() * chatWordTargets.length)]
                            : getRandomTarget(zone, posPref, r);
                        startJumpTo(b, t, speed);
                    } else {
                        b.state = 'idle';
                        b.stateTime = 0;
                        setAnim(b, 'idle');
                    }
                }
            }

            // Apply position correction lerp from master
            applyPositionLerp(b);

            // Final boundary enforcement - ALWAYS clamp to zone
            clampToZone(b, zone);

            b.element.style.left = b.x + 'px';
            b.element.style.top = b.y + 'px';
        });

        checkInteractions(names);
        updateAdvancedBuddySystems(names, zone);
        buddyAnimationId = setTimeout(update, BUDDY_CONFIG.updateInterval);
    }
    update();
}

function startJumpTo(b, target, speedMultiplier) {
    speedMultiplier = speedMultiplier || 1.0;
    b.state = 'jumping';
    b.stateTime = 0;
    b.target = target;
    var dx = target.x - b.x;
    var dy = target.y - b.y;
    // Higher speed = fewer frames = faster arrival
    var frames = Math.max(8, Math.round(18 / speedMultiplier));
    b.vx = dx / frames;
    b.vy = (dy - 0.5 * BUDDY_CONFIG.gravity * frames * frames) / frames;
    setAnim(b, 'idle');
    updateFace(b);
}

function setAnim(b, cls) {
    b.element.classList.remove('idle', 'hopping', 'perched', 'fighting', 'chasing', 'fleeing', 'kissing', 'in-love');
    b.element.classList.add(cls);
}

function updateFace(b) {
    if (b.vx < -0.1) b.element.classList.add('face-left');
    else if (b.vx > 0.1) b.element.classList.remove('face-left');
}

// Show expression emoji above buddy
function showExpression(b, emoji) {
    var existing = b.element.querySelector('.buddy-expression');
    if (existing) existing.remove();
    var exp = document.createElement('span');
    exp.className = 'buddy-expression';
    exp.textContent = emoji;
    b.element.appendChild(exp);
    setTimeout(function() { if (exp.parentNode) exp.remove(); }, 2000);
}

// Show speech bubble above buddy
function showSpeechBubble(b, text, type) {
    // Remove existing speech
    var existing = document.querySelectorAll('.buddy-speech[data-buddy="' + b.element.id + '"]');
    existing.forEach(function(e) { e.remove(); });

    // Always use a random JSONBin message if available
    var displayText = text;
    if (jsonBinMessages.length > 0) {
        displayText = jsonBinMessages[Math.floor(Math.random() * jsonBinMessages.length)];
        if (displayText.length > 30) displayText = displayText.substring(0, 27) + '...';
    }

    // Artifact buff: Scroll modifies speech to archaic English
    displayText = getArtifactModifiedSpeech(b.username, displayText);

    var speech = document.createElement('div');
    speech.className = 'buddy-speech ' + (type || '');
    speech.setAttribute('data-buddy', b.element.id || '');
    speech.textContent = displayText;
    speech.style.left = (b.x - 20) + 'px';
    speech.style.top = (b.y - 50) + 'px';
    document.body.appendChild(speech);

    setTimeout(function() { if (speech.parentNode) speech.remove(); }, BUDDY_CONFIG.speechDuration);
}

// Get a random chat quote - uses JSONBin if available, otherwise local chat
function getRandomChatQuote() {
    // JSONBin source (primary)
    if (jsonBinMessages.length > 0) {
        var msg = jsonBinMessages[Math.floor(Math.random() * jsonBinMessages.length)];
        if (msg.length > 30) msg = msg.substring(0, 27) + '...';
        return msg;
    }
    // Fallback to local recent chat messages
    if (recentChatMessages.length === 0) return null;
    var msg = recentChatMessages[Math.floor(Math.random() * recentChatMessages.length)];
    if (msg.length > 30) msg = msg.substring(0, 27) + '...';
    var modifiers = ['', '', '', '~', '!', '?', '!!', ' lol', ' hehe', ' uwu'];
    return msg + modifiers[Math.floor(Math.random() * modifiers.length)];
}

// Check if current user is the "interaction master" (initiates all interactions)
// Only ONE client should initiate interactions to prevent desync
// We use alphabetically first online user as master
function isInteractionMaster() {
    var myName = getMyUsername();
    if (!myName) return false;

    var onlineUsers = [];
    $('#userlist .userlist_item span').each(function() {
        var name = $(this).text().trim();
        if (name) onlineUsers.push(name.toLowerCase());
    });

    if (onlineUsers.length === 0) return true; // Only user, so master

    onlineUsers.sort();
    return onlineUsers[0] === myName.toLowerCase();
}

// Get buddy settings helper (used outside animation loop)
function getBuddySettingsForName(name) {
    var myName = getMyUsername();
    var settings = null;

    if (name === myName && myBuddySettings) {
        settings = myBuddySettings;
    } else if (customBuddySettings[name]) {
        settings = customBuddySettings[name];
    }

    return {
        chattiness: (settings && settings.chattiness) || 1.0,
        interactionFrequency: (settings && settings.interactionFrequency) || 1.0,
        catchphrase: (settings && settings.catchphrase) || null,
        customPhrases: (settings && settings.customPhrases) || [],
        greeting: (settings && settings.greeting) || null,
        victoryLine: (settings && settings.victoryLine) || null,
        defeatLine: (settings && settings.defeatLine) || null,
        loveLine: (settings && settings.loveLine) || null
    };
}

// Get a phrase for a buddy - always pulls from JSONBin messages
function getBuddySpeechPhrase(name, phraseType) {
    return getRandomChatQuote();
}

// Check for all interactions between buddies
function checkInteractions(names) {
    // Random speech - only master initiates to prevent duplicates, broadcasts to others
    if (isInteractionMaster()) {
        names.forEach(function(name) {
            var b = buddyCharacters[name];
            if (!b || b.interacting || b.speechCooldown > 0) return;
            b.speechCooldown -= BUDDY_CONFIG.updateInterval;

            // Get chattiness setting - higher = more likely to speak
            var settings = getBuddySettingsForName(name);
            var speechChance = BUDDY_CONFIG.speechChance * settings.chattiness;

            if (Math.random() < speechChance) {
                var phrase = getBuddySpeechPhrase(name, 'random');
                if (phrase) {
                    var expr = ['💬', '😊', '🗣️', '💭'][Math.floor(Math.random() * 4)];
                    showSpeechBubble(b, phrase, 'flirt');
                    showExpression(b, expr);
                    // Broadcast to other clients
                    broadcastSpeech(name, phrase, 'flirt', expr);
                    // Lower chattiness = longer cooldown between speeches
                    b.speechCooldown = 8000 / settings.chattiness;
                }
            }
        });
    } else {
        // Non-master: just decrement cooldowns (speech comes via Pusher)
        names.forEach(function(name) {
            var b = buddyCharacters[name];
            if (!b || b.interacting) return;
            if (b.speechCooldown > 0) b.speechCooldown -= BUDDY_CONFIG.updateInterval;
        });
    }

    // Apply artifact buffs (orb gravity pull)
    applyOrbGravity();

    // Only the "master" client initiates proximity interactions
    // This prevents multiple clients from broadcasting conflicting interactions
    if (!isInteractionMaster()) return;

    // Check proximity interactions
    for (var i = 0; i < names.length; i++) {
        for (var j = i + 1; j < names.length; j++) {
            var b1 = buddyCharacters[names[i]];
            var b2 = buddyCharacters[names[j]];
            if (!b1 || !b2 || b1.interacting || b2.interacting) continue;
            if (b1.interactCooldown > 0 || b2.interactCooldown > 0) continue;

            var dist = Math.sqrt(Math.pow(b1.x - b2.x, 2) + Math.pow(b1.y - b2.y, 2));
            if (dist < BUDDY_CONFIG.interactDistance) {
                // Get interaction frequency for both buddies (average them)
                var settings1 = getBuddySettingsForName(names[i]);
                var settings2 = getBuddySettingsForName(names[j]);
                var avgInteractionFreq = (settings1.interactionFrequency + settings2.interactionFrequency) / 2;

                // Higher frequency = more likely to interact when close
                if (Math.random() < avgInteractionFreq) {
                    startInteraction(names[i], names[j], b1, b2);
                }
            }
        }
    }
}

// Start an interaction based on personalities
// If fromSync is true, this was triggered by another client's broadcast
function startInteraction(n1, n2, b1, b2, fromSync, syncedType, syncedSeed) {
    var p1 = PERSONALITIES[b1.personality] || PERSONALITIES.playful;
    var p2 = PERSONALITIES[b2.personality] || PERSONALITIES.playful;

    var seed, seededRandom, interactionType;

    if (fromSync && syncedType && syncedSeed) {
        // This is a synced interaction - use the provided type and seed
        seed = syncedSeed;
        seededRandom = createSeededRandom(seed);
        interactionType = syncedType;
    } else {
        // This is a locally-initiated interaction - generate seed and determine type
        seed = Math.floor(Math.random() * 1000000);
        seededRandom = createSeededRandom(seed);

        // Maybe start a prolonged conversation instead
        if (seededRandom() < BUDDY_CONFIG.conversationChance * 5 && !b1.inConversation && !b2.inConversation) {
            interactionType = 'conversation';
        } else {
            // Calculate combined probabilities (now includes crazy)
            // Modify based on relationship history
            var relMod = getRelationshipInteractionModifier(n1, n2);
            var kissChance = Math.max(0, (p1.kiss + p2.kiss) / 2 + relMod.kissBonus);
            var chaseChance = (p1.chase + p2.chase) / 2;
            var fightChance = Math.max(0, (p1.fight + p2.fight) / 2 + relMod.fightPenalty);
            var confessChance = Math.max(0, (p1.confess + p2.confess) / 2 + relMod.kissBonus * 0.5);
            var fleeChance = (p1.flee + p2.flee) / 2;
            var crazyChance = (p1.crazy + p2.crazy) / 2;

            var total = kissChance + chaseChance + fightChance + confessChance + fleeChance + crazyChance;
            var roll = seededRandom() * total;

            if (roll < kissChance) {
                interactionType = 'kiss';
            } else if (roll < kissChance + confessChance) {
                interactionType = 'confess';
            } else if (roll < kissChance + confessChance + chaseChance) {
                interactionType = 'chase';
            } else if (roll < kissChance + confessChance + chaseChance + fleeChance) {
                interactionType = 'flee';
            } else if (roll < kissChance + confessChance + chaseChance + fleeChance + crazyChance) {
                // For crazy interactions, we need to pick one specifically
                var crazyIndex = Math.floor(seededRandom() * CRAZY_INTERACTIONS.length);
                interactionType = CRAZY_INTERACTIONS[crazyIndex];
            } else {
                interactionType = 'fight';
            }
        }

        // Broadcast this interaction to other clients
        broadcastInteraction(n1, n2, interactionType, seed);
    }

    // Reset the seeded random for consistent effect generation
    seededRandom = createSeededRandom(seed);
    // Skip the rolls we already did
    seededRandom(); seededRandom();

    // Execute the interaction with seeded random
    switch (interactionType) {
        case 'kiss': startKiss(n1, n2, seededRandom); break;
        case 'confess': startConfess(n1, n2, seededRandom); break;
        case 'chase': startChase(n1, n2, seededRandom); break;
        case 'flee': startFlee(n1, n2, seededRandom); break;
        case 'fight': startFight(n1, n2, seededRandom); break;
        case 'conversation': startConversation(n1, n2, seededRandom); break;
        // Crazy interactions
        case 'fireworks': startFireworks(n1, n2, seededRandom); break;
        case 'wizardDuel': startWizardDuel(n1, n2, seededRandom); break;
        case 'danceOff': startDanceOff(n1, n2, seededRandom); break;
        case 'teatime': startTeatime(n1, n2, seededRandom); break;
        case 'stareContest': startStareContest(n1, n2, seededRandom); break;
        case 'serenade': startSerenade(n1, n2, seededRandom); break;
        case 'ghostPossession': startGhostPossession(n1, n2, seededRandom); break;
        case 'transformSequence': startTransformSequence(n1, n2, seededRandom); break;
        case 'pillowFight': startPillowFight(n1, n2, seededRandom); break;
        case 'fortuneTelling': startFortuneTelling(n1, n2, seededRandom); break;
        case 'dramaDeath': startDramaDeath(n1, n2, seededRandom); break;
        case 'telepathy': startTelepathy(n1, n2, seededRandom); break;
        case 'fusion': startFusion(n1, n2, seededRandom); break;
        case 'timewarp': startTimewarp(n1, n2, seededRandom); break;
        case 'foodFight': startFoodFight(n1, n2, seededRandom); break;
        case 'karaoke': startKaraoke(n1, n2, seededRandom); break;
        case 'armWrestle': startArmWrestle(n1, n2, seededRandom); break;
        case 'portal': startPortal(n1, n2, seededRandom); break;
        case 'summoning': startSummoning(n1, n2, seededRandom); break;
        default: startKiss(n1, n2, seededRandom);
    }
}

// Kissing interaction
function startKiss(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    setAnim(b1, 'kissing');
    setAnim(b2, 'kissing');

    // Show expressions
    showExpression(b1, '😘');
    showExpression(b2, '🥰');

    var mx = (b1.x + b2.x) / 2, my = (b1.y + b2.y) / 2;

    // Pre-generate heart effects for sync (use rng for determinism)
    var hearts = [];
    for (var i = 0; i < 6; i++) {
        hearts.push({
            heart: KISS_EFFECTS[Math.floor(rng() * KISS_EFFECTS.length)],
            offsetX: (rng() - 0.5) * 30
        });
    }

    // Spawn floating hearts (tracked for cleanup)
    var count = 0;
    var heartInterval = setInterval(function() {
        var h = hearts[count];
        createKissEffect(mx + h.offsetX, my - 10, h.heart);
        if (++count >= 6) {
            clearInterval(heartInterval);
            untrackBuddyInterval(b1, heartInterval);
            untrackBuddyInterval(b2, heartInterval);
        }
    }, 200);
    trackBuddyInterval(b1, heartInterval);
    trackBuddyInterval(b2, heartInterval);

    // Heart burst in middle
    createHeartBurst(mx, my);

    var kissTimeout = setTimeout(function() { endKiss(n1, n2, rng); }, 2000);
    trackBuddyTimeout(b1, kissTimeout);
    trackBuddyTimeout(b2, kissTimeout);
}

function endKiss(n1, n2, rng) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    var r = rng || Math.random;
    var exprs = ['💕', '💗', '😊', '✨'];
    var e1 = exprs[Math.floor(r() * 4)];
    var e2 = exprs[Math.floor(r() * 4)];
    if (b1) {
        b1.interacting = false;
        b1.interactCooldown = 6000;
        b1.state = 'idle';
        setAnim(b1, 'in-love');
        showExpression(b1, e1);
        setTimeout(function() { if (b1) setAnim(b1, 'idle'); }, 2000);
    }
    if (b2) {
        b2.interacting = false;
        b2.interactCooldown = 6000;
        b2.state = 'idle';
        setAnim(b2, 'in-love');
        showExpression(b2, e2);
        setTimeout(function() { if (b2) setAnim(b2, 'idle'); }, 2000);
    }
    onInteractionEnd('kiss', n1, n2);
}

function createKissEffect(x, y, emoji) {
    var e = document.createElement('div');
    e.className = 'buddy-kiss-effect';
    e.textContent = emoji;
    e.style.left = x + 'px';
    e.style.top = y + 'px';
    document.body.appendChild(e);
    setTimeout(function() { e.remove(); }, 1500);
}

function createHeartBurst(x, y) {
    var e = document.createElement('div');
    e.className = 'buddy-heart-burst';
    e.textContent = '💖';
    e.style.left = x + 'px';
    e.style.top = y + 'px';
    document.body.appendChild(e);
    setTimeout(function() { e.remove(); }, 800);
}

// Love confession
function startConfess(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    setAnim(b1, 'in-love');

    var confession = LOVE_CONFESSIONS[Math.floor(rng() * LOVE_CONFESSIONS.length)];
    showSpeechBubble(b1, confession, 'love');
    showExpression(b1, '💝');

    // Pre-select reaction for sync
    var reactions = [
        { text: 'R-really?!', expr: '😳', type: 'shy' },
        { text: 'I love you too!', expr: '🥰', type: 'love' },
        { text: 'Kyaa~!', expr: '😊', type: 'shy' },
        { text: '*blushes*', expr: '☺️', type: 'shy' },
        { text: 'So cute!', expr: '💕', type: 'flirt' }
    ];
    var selectedReaction = reactions[Math.floor(rng() * reactions.length)];

    // Other buddy reacts
    var reactTimeout = setTimeout(function() {
        showSpeechBubble(b2, selectedReaction.text, selectedReaction.type);
        showExpression(b2, selectedReaction.expr);
    }, 800);
    trackBuddyTimeout(b1, reactTimeout);
    trackBuddyTimeout(b2, reactTimeout);

    var confessEndTimeout = setTimeout(function() { endConfess(n1, n2); }, 3500);
    trackBuddyTimeout(b1, confessEndTimeout);
    trackBuddyTimeout(b2, confessEndTimeout);
}

function endConfess(n1, n2) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (b1) { b1.interacting = false; b1.interactCooldown = 8000; b1.state = 'idle'; setAnim(b1, 'idle'); }
    if (b2) { b2.interacting = false; b2.interactCooldown = 8000; b2.state = 'idle'; setAnim(b2, 'idle'); }
    onInteractionEnd('confess', n1, n2);
}

// Chase interaction
function startChase(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    // Decide who chases who based on personality
    var chaser = (PERSONALITIES[b1.personality].chase > PERSONALITIES[b2.personality].chase) ? b1 : b2;
    var runner = (chaser === b1) ? b2 : b1;

    chaser.interacting = runner.interacting = true;
    chaser.currentTarget = runner;
    runner.currentTarget = chaser;

    setAnim(chaser, 'chasing');
    setAnim(runner, 'fleeing');

    var chaserExprs = ['😈', '😏', '🏃', '💨'];
    var runnerExprs = ['😱', '😅', '💦', '🏃'];
    var phrases = ['Come back!', 'Wait~!', 'Hehe!', 'Catch you!'];
    showExpression(chaser, chaserExprs[Math.floor(rng() * 4)]);
    showExpression(runner, runnerExprs[Math.floor(rng() * 4)]);
    showSpeechBubble(chaser, phrases[Math.floor(rng() * 4)], 'flirt');

    var zone = getBuddyZone();
    var chaseInterval = setInterval(function() {
        if (!buddyCharacters[n1] || !buddyCharacters[n2]) {
            clearInterval(chaseInterval);
            untrackBuddyInterval(chaser, chaseInterval);
            untrackBuddyInterval(runner, chaseInterval);
            return;
        }

        // Runner moves away
        var dx = runner.x - chaser.x;
        var dir = dx > 0 ? 1 : -1;
        runner.x += dir * BUDDY_CONFIG.moveSpeed * 2;
        runner.vx = dir * BUDDY_CONFIG.moveSpeed * 2;
        updateFace(runner);

        // Chaser follows
        chaser.x += dir * BUDDY_CONFIG.moveSpeed * 1.5;
        chaser.vx = dir * BUDDY_CONFIG.moveSpeed * 1.5;
        updateFace(chaser);

        // Keep in bounds
        runner.x = Math.max(zone.left, Math.min(zone.right, runner.x));
        chaser.x = Math.max(zone.left, Math.min(zone.right, chaser.x));

        runner.element.style.left = runner.x + 'px';
        chaser.element.style.left = chaser.x + 'px';
    }, 50);
    trackBuddyInterval(chaser, chaseInterval);
    trackBuddyInterval(runner, chaseInterval);

    var chaseTimeout = setTimeout(function() {
        clearInterval(chaseInterval);
        untrackBuddyInterval(chaser, chaseInterval);
        untrackBuddyInterval(runner, chaseInterval);
        endChase(n1, n2);
    }, 2500);
    trackBuddyTimeout(chaser, chaseTimeout);
    trackBuddyTimeout(runner, chaseTimeout);
}

function endChase(n1, n2) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (b1) {
        b1.interacting = false;
        b1.interactCooldown = 5000;
        b1.state = 'idle';
        b1.currentTarget = null;
        setAnim(b1, 'idle');
        showExpression(b1, ['😮‍💨', '😊', '✨'][Math.floor(Math.random() * 3)]);
    }
    if (b2) {
        b2.interacting = false;
        b2.interactCooldown = 5000;
        b2.state = 'idle';
        b2.currentTarget = null;
        setAnim(b2, 'idle');
        showExpression(b2, ['😮‍💨', '😊', '✨'][Math.floor(Math.random() * 3)]);
    }
    onInteractionEnd('chase', n1, n2);
}

// Flee interaction (both run away from each other)
function startFlee(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    setAnim(b1, 'fleeing');
    setAnim(b2, 'fleeing');

    showExpression(b1, '😳');
    showExpression(b2, '😳');
    var phrases = ['Eep!', 'Kyaa!', 'S-sorry!', '*runs*'];
    showSpeechBubble(b1, phrases[Math.floor(rng() * 4)], 'shy');

    var zone = getBuddyZone();
    var dir1 = b1.x < b2.x ? -1 : 1;
    var dir2 = -dir1;

    var fleeInterval = setInterval(function() {
        if (!buddyCharacters[n1] || !buddyCharacters[n2]) {
            clearInterval(fleeInterval);
            untrackBuddyInterval(b1, fleeInterval);
            untrackBuddyInterval(b2, fleeInterval);
            return;
        }
        b1.x += dir1 * BUDDY_CONFIG.moveSpeed * 2;
        b2.x += dir2 * BUDDY_CONFIG.moveSpeed * 2;
        b1.x = Math.max(zone.left, Math.min(zone.right, b1.x));
        b2.x = Math.max(zone.left, Math.min(zone.right, b2.x));
        b1.vx = dir1 * BUDDY_CONFIG.moveSpeed * 2;
        b2.vx = dir2 * BUDDY_CONFIG.moveSpeed * 2;
        updateFace(b1);
        updateFace(b2);
        b1.element.style.left = b1.x + 'px';
        b2.element.style.left = b2.x + 'px';
    }, 50);
    trackBuddyInterval(b1, fleeInterval);
    trackBuddyInterval(b2, fleeInterval);

    var fleeTimeout = setTimeout(function() {
        clearInterval(fleeInterval);
        untrackBuddyInterval(b1, fleeInterval);
        untrackBuddyInterval(b2, fleeInterval);
        endFlee(n1, n2);
    }, 1500);
    trackBuddyTimeout(b1, fleeTimeout);
    trackBuddyTimeout(b2, fleeTimeout);
}

function endFlee(n1, n2) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (b1) { b1.interacting = false; b1.interactCooldown = 4000; b1.state = 'idle'; setAnim(b1, 'idle'); }
    if (b2) { b2.interacting = false; b2.interactCooldown = 4000; b2.state = 'idle'; setAnim(b2, 'idle'); }
    onInteractionEnd('flee', n1, n2);
}

// Fighting interaction
function startFight(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    setAnim(b1, 'fighting');
    setAnim(b2, 'fighting');

    // Artifact buff: Sword causes screen shake during fights
    var hasSword = (buddyArtifacts[n1] && buddyArtifacts[n1].type === 'sword') ||
                   (buddyArtifacts[n2] && buddyArtifacts[n2].type === 'sword');
    if (hasSword) triggerSwordScreenShake();

    var exprs = ['😤', '💢', '😠'];
    showExpression(b1, exprs[Math.floor(rng() * 3)]);
    showExpression(b2, exprs[Math.floor(rng() * 3)]);

    var mx = (b1.x + b2.x) / 2, my = (b1.y + b2.y) / 2;
    createDust(mx, my);

    // Pre-generate fight moves for sync
    var moves = [];
    for (var i = 0; i < 4; i++) {
        moves.push(FIGHT_MOVES[Math.floor(rng() * FIGHT_MOVES.length)]);
    }
    var count = 0;
    var iv = setInterval(function() {
        createFightEffect(mx, my, moves[count]);
        if (++count >= 4) {
            clearInterval(iv);
            untrackBuddyInterval(b1, iv);
            untrackBuddyInterval(b2, iv);
        }
    }, 250);
    trackBuddyInterval(b1, iv);
    trackBuddyInterval(b2, iv);

    var fightTimeout = setTimeout(function() { endFight(n1, n2, rng); }, BUDDY_CONFIG.fightDuration);
    trackBuddyTimeout(b1, fightTimeout);
    trackBuddyTimeout(b2, fightTimeout);
}

function endFight(n1, n2, rng) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    var r = rng || Math.random;

    // 5% chance of triggering a court trial after a fight
    if (b1 && b2 && r() < 0.05) {
        startCourtTrial(n1, n2, r);
        return;
    }

    var exprs = ['😮‍💨', '😤', '😊'];
    var e1 = exprs[Math.floor(r() * 3)];
    var e2 = exprs[Math.floor(r() * 3)];
    var fightZone = getBuddyZone();
    if (b1) {
        b1.interacting = false;
        b1.interactCooldown = 5000;
        b1.state = 'idle';
        b1.x -= 25;
        clampToZone(b1, fightZone);
        setAnim(b1, 'idle');
        showExpression(b1, e1);
    }
    if (b2) {
        b2.interacting = false;
        b2.interactCooldown = 5000;
        b2.state = 'idle';
        b2.x += 25;
        clampToZone(b2, fightZone);
        setAnim(b2, 'idle');
        showExpression(b2, e2);
    }
    onInteractionEnd('fight', n1, n2);
}

function createFightEffect(x, y, move) {
    var e = document.createElement('div');
    e.className = 'buddy-fight-effect';
    e.innerHTML = move.emoji + ' ' + move.name;
    e.style.left = x + 'px';
    e.style.top = y + 'px';
    e.style.color = move.color;
    document.body.appendChild(e);
    setTimeout(function() { e.remove(); }, 600);
}

function createDust(x, y) {
    var d = document.createElement('div');
    d.className = 'buddy-dust';
    d.innerHTML = '💨';
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    document.body.appendChild(d);
    setTimeout(function() { d.remove(); }, 500);
}

// ========== BUDDY COURT SYSTEM ==========
// After a fight, there's a small chance a Judge appears and holds a trial

var COURT_PROSECUTIONS = [
    function(n1, n2) { return n1 + " CLEARLY threw the first BONK"; },
    function(n1, n2) { return "Witnesses report " + n1 + " was vibing aggressively"; },
    function(n1, n2) { return n1 + " has a HISTORY of unsanctioned yeet-ing"; },
    function(n1, n2) { return "The defendant " + n1 + " was caught red-handed doing crimes"; },
    function(n1, n2) { return n1 + " violated Section 69 of the Buddy Code"; },
    function(n1, n2) { return "Exhibit A: " + n1 + " looked at " + n2 + " with MALICE"; },
    function(n1, n2) { return n1 + " did a violence. The evidence is... vibes"; },
    function(n1, n2) { return "My client " + n2 + " was simply existing when " + n1 + " chose CHAOS"; }
];

var COURT_DEFENSES = [
    function(n1) { return "My client was simply vibing, your honor"; },
    function(n1) { return n1 + " pleads not guilty by reason of being adorable"; },
    function(n1) { return "Objection! " + n1 + " was provoked by... existence"; },
    function(n1) { return n1 + " claims diplomatic immunity as a registered silly goose"; },
    function(n1) { return "The defense argues that bonking is a love language"; },
    function(n1) { return n1 + " was sleepwalking. Sleepfighting. It's a condition"; },
    function(n1) { return "Your honor, my client doesn't even have hands"; },
    function(n1) { return "We plead the fifth... dimension of cuteness"; }
];

var COURT_VERDICTS = [
    { text: "GUILTY! Sentenced to 30 seconds of mandatory dancing", punishment: 'court-punishment-dance', duration: 30000 },
    { text: "GUILTY! The defendant must spin until they learn their lesson", punishment: 'court-punishment-spin', duration: 20000 },
    { text: "GUILTY! Shrunk to humbling size for crimes against vibes", punishment: 'court-punishment-shrink', duration: 15000 },
    { text: "GUILTY! Sentenced to existential vibrating", punishment: 'court-punishment-vibrate', duration: 20000 },
    { text: "GUILTY! Must float in shame for 25 seconds", punishment: 'court-punishment-float', duration: 25000 },
    { text: "NOT GUILTY! But the judge is suspicious...", punishment: null, duration: 0 },
    { text: "MISTRIAL! The gavel has gone missing", punishment: null, duration: 0 },
    { text: "GUILTY of being too cute. This is worse than jail", punishment: 'court-punishment-dance', duration: 20000 },
    { text: "GUILTY! Community service: 20 seconds of vibing penance", punishment: 'court-punishment-float', duration: 20000 },
    { text: "DOUBLE GUILTY! Both parties sentenced to synchronized dancing", punishment: 'court-punishment-dance', duration: 25000, punishBoth: true }
];

function startCourtTrial(n1, n2, rng) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var r = rng || Math.random;

    console.log('[BuddyCourt] Trial initiated between', n1, 'and', n2);

    // Keep both buddies locked in interacting state during trial
    b1.interacting = true;
    b2.interacting = true;
    setAnim(b1, 'idle');
    setAnim(b2, 'idle');

    // Separate the fighters
    b1.x -= 30;
    b2.x += 30;
    b1.element.style.left = b1.x + 'px';
    b2.element.style.left = b2.x + 'px';

    // Spawn the judge between them
    var judgeX = (b1.x + b2.x) / 2;
    var judgeY = Math.min(b1.y, b2.y) - 20;

    var judge = document.createElement('div');
    judge.className = 'buddy-court-judge';
    judge.innerHTML = '🦉<span class="judge-wig">⚖️</span>';
    judge.style.left = judgeX + 'px';
    judge.style.top = judgeY + 'px';
    document.body.appendChild(judge);

    // Pre-generate trial elements using seeded random
    var prosecutionIdx = Math.floor(r() * COURT_PROSECUTIONS.length);
    var defenseIdx = Math.floor(r() * COURT_DEFENSES.length);
    var verdictIdx = Math.floor(r() * COURT_VERDICTS.length);

    // Randomly pick who is the defendant
    var defendant = r() < 0.5 ? n1 : n2;
    var plaintiff = defendant === n1 ? n2 : n1;

    showExpression(b1, '😰');
    showExpression(b2, '😰');

    // Phase 1: Judge announces (1s delay)
    setTimeout(function() {
        showCourtSpeech(judgeX, judgeY - 50, "ORDER IN THE COURT!", 'court');
    }, 800);

    // Phase 2: Prosecution (3s delay)
    setTimeout(function() {
        var prosecutionText = COURT_PROSECUTIONS[prosecutionIdx](defendant, plaintiff);
        showCourtSpeech(judgeX - 40, judgeY - 50, prosecutionText, 'court');
        var bDef = buddyCharacters[defendant];
        if (bDef) showExpression(bDef, '😨');
    }, 3000);

    // Phase 3: Defense (5.5s delay)
    setTimeout(function() {
        var defenseText = COURT_DEFENSES[defenseIdx](defendant);
        showCourtSpeech(judgeX + 20, judgeY - 50, defenseText, 'court');
        var bDef = buddyCharacters[defendant];
        if (bDef) showExpression(bDef, '🥺');
    }, 5500);

    // Phase 4: Gavel slam (8s delay)
    setTimeout(function() {
        var gavel = document.createElement('div');
        gavel.className = 'buddy-court-gavel';
        gavel.textContent = '🔨';
        gavel.style.left = (judgeX + 10) + 'px';
        gavel.style.top = (judgeY - 10) + 'px';
        document.body.appendChild(gavel);
        setTimeout(function() { if (gavel.parentNode) gavel.remove(); }, 500);
    }, 8000);

    // Phase 5: Verdict (8.8s delay)
    setTimeout(function() {
        var verdict = COURT_VERDICTS[verdictIdx];
        showCourtSpeech(judgeX - 20, judgeY - 60, verdict.text, 'verdict');

        // Apply punishment
        if (verdict.punishment) {
            var bDef = buddyCharacters[defendant];
            var bPlain = buddyCharacters[plaintiff];

            if (bDef) {
                bDef.element.classList.add(verdict.punishment);
                showExpression(bDef, '😵');
            }
            if (verdict.punishBoth && bPlain) {
                bPlain.element.classList.add(verdict.punishment);
                showExpression(bPlain, '😵');
            }

            // Remove punishment after duration
            setTimeout(function() {
                if (bDef && bDef.element) bDef.element.classList.remove(verdict.punishment);
                if (verdict.punishBoth && bPlain && bPlain.element) bPlain.element.classList.remove(verdict.punishment);
            }, verdict.duration);
        } else {
            // Not guilty - show relief
            var bDef = buddyCharacters[defendant];
            if (bDef) showExpression(bDef, '😮‍💨');
        }
    }, 8800);

    // Phase 6: Judge exits (11s delay)
    setTimeout(function() {
        if (judge.parentNode) {
            judge.style.animation = 'judge-enter 0.5s ease-in reverse forwards';
            setTimeout(function() { if (judge.parentNode) judge.remove(); }, 500);
        }

        // Release buddies from trial
        endCourtTrial(n1, n2);
    }, 11000);
}

function showCourtSpeech(x, y, text, type) {
    var speech = document.createElement('div');
    speech.className = 'buddy-speech ' + (type || 'court');
    speech.textContent = text;
    speech.style.left = x + 'px';
    speech.style.top = y + 'px';
    document.body.appendChild(speech);
    setTimeout(function() { if (speech.parentNode) speech.remove(); }, 2500);
}

function endCourtTrial(n1, n2) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (b1) {
        b1.interacting = false;
        b1.interactCooldown = 10000;
        b1.state = 'idle';
        setAnim(b1, 'idle');
    }
    if (b2) {
        b2.interacting = false;
        b2.interactCooldown = 10000;
        b2.state = 'idle';
        setAnim(b2, 'idle');
    }
}

// ========== BUDDY ARTIFACT SYSTEM ==========
// Buddies occasionally discover artifacts while roaming, gaining temporary buffs

var BUDDY_ARTIFACTS = [
    {
        emoji: '🗡️',
        name: 'Sword of Mild Inconvenience',
        type: 'sword',
        cssClass: 'artifact-sword',
        badge: '⚔️',
        duration: 300000,
        rarity: 'common',
        description: 'Fights cause dramatic screen shake',
        speechOnFind: ["A WEAPON!", "en garde!", "finally... power", "*unsheathes menacingly*"]
    },
    {
        emoji: '⚗️',
        name: 'Potion of Chromatic Chaos',
        type: 'potion',
        cssClass: 'artifact-potion',
        badge: '🧪',
        duration: 300000,
        rarity: 'common',
        description: 'Colors cycle wildly',
        speechOnFind: ["ooh shiny!", "what does this do--", "*glug glug*", "i feel... different"]
    },
    {
        emoji: '📜',
        name: 'Scroll of Ye Olde Internet',
        type: 'scroll',
        cssClass: 'artifact-scroll',
        badge: '📜',
        duration: 300000,
        rarity: 'common',
        description: 'Speaks in faux-archaic',
        speechOnFind: ["hark!", "ancient wisdom!", "it says... 'lol'", "*adjusts monocle*"]
    },
    {
        emoji: '🔮',
        name: 'Orb of Gravitational Sass',
        type: 'orb',
        cssClass: 'artifact-orb',
        badge: '🔮',
        duration: 300000,
        rarity: 'uncommon',
        description: 'Pulls nearby buddies closer',
        speechOnFind: ["UNLIMITED POWER", "come to me...", "the orb... it speaks", "*ominous humming*"]
    },
    {
        emoji: '👑',
        name: 'Crown of Unearned Authority',
        type: 'crown',
        cssClass: 'artifact-crown',
        badge: '👑',
        duration: 300000,
        rarity: 'uncommon',
        description: 'Radiates golden energy',
        speechOnFind: ["I AM THE LAW", "bow before me!", "finally, recognition", "*adjusts crown*"]
    },
    {
        emoji: '🪞',
        name: 'Mirror of Existential Dread',
        type: 'mirror',
        cssClass: 'artifact-mirror',
        badge: '🪞',
        duration: 300000,
        rarity: 'rare',
        description: 'Nearby buddies briefly face the mirror holder',
        speechOnFind: ["what... am I?", "it shows... the void", "*stares into infinity*", "oh no it's me"]
    }
];

var ARCHAIC_SPEECH = [
    "Forsooth!", "Hark, a commotion!", "By mine honor!", "Prithee, cease thy tomfoolery!",
    "Verily, this is most vexing!", "Thou art a scallywag!", "'Twas foretold in the prophecy!",
    "Mayhaps we should touch grass?", "I declare this most sus!", "Mine eyes have seen cringe",
    "Methinks the vibes are off", "Lo, the algorithm provides!", "By the ancient forums!",
    "Hear ye, hear ye!", "In sooth, I know not why I am so based"
];

// Track active artifacts per buddy
var buddyArtifacts = {};  // { username: { type, expiresAt, element } }
var artifactSpawnTimer = null;

function initArtifactSystem() {
    // Check for artifact spawns every 30 seconds (master-only to sync across clients)
    artifactSpawnTimer = setInterval(function() {
        if (!isInteractionMaster()) return; // Only master decides artifact spawns
        var names = Object.keys(buddyCharacters);
        if (names.length === 0) return;

        names.forEach(function(name) {
            var b = buddyCharacters[name];
            if (!b || b.interacting) return;

            // Skip if buddy already has an artifact
            if (buddyArtifacts[name] && buddyArtifacts[name].expiresAt > Date.now()) return;

            // 8% chance per buddy per check (roughly every 3-5 minutes per buddy)
            if (Math.random() < 0.08) {
                // Pick artifact deterministically and broadcast
                var roll = Math.random();
                var pool;
                if (roll < 0.1) {
                    pool = BUDDY_ARTIFACTS.filter(function(a) { return a.rarity === 'rare'; });
                } else if (roll < 0.35) {
                    pool = BUDDY_ARTIFACTS.filter(function(a) { return a.rarity === 'uncommon'; });
                } else {
                    pool = BUDDY_ARTIFACTS.filter(function(a) { return a.rarity === 'common'; });
                }
                if (pool.length === 0) pool = BUDDY_ARTIFACTS;
                var artifact = pool[Math.floor(Math.random() * pool.length)];
                var artifactIdx = BUDDY_ARTIFACTS.indexOf(artifact);

                // Broadcast artifact spawn to all clients
                broadcastAdvancedAction('artifact', {
                    username: name,
                    artifactIdx: artifactIdx,
                    speechIdx: Math.floor(Math.random() * artifact.speechOnFind.length)
                });

                // Apply locally
                spawnArtifactNear(name, artifactIdx);
            }
        });
    }, 30000);

    // Cleanup expired artifacts every 10 seconds
    setInterval(function() {
        var now = Date.now();
        Object.keys(buddyArtifacts).forEach(function(name) {
            var art = buddyArtifacts[name];
            if (art && art.expiresAt <= now) {
                removeArtifactFromBuddy(name);
            }
        });
    }, 10000);

    console.log('[Artifacts] System initialized');
}

function spawnArtifactNear(username, artifactIdx) {
    var b = buddyCharacters[username];
    if (!b) return;

    // Use provided artifact index (synced from master) or pick randomly (legacy fallback)
    var artifact;
    if (artifactIdx !== undefined && artifactIdx >= 0 && artifactIdx < BUDDY_ARTIFACTS.length) {
        artifact = BUDDY_ARTIFACTS[artifactIdx];
    } else {
        var roll = Math.random();
        var pool;
        if (roll < 0.1) {
            pool = BUDDY_ARTIFACTS.filter(function(a) { return a.rarity === 'rare'; });
        } else if (roll < 0.35) {
            pool = BUDDY_ARTIFACTS.filter(function(a) { return a.rarity === 'uncommon'; });
        } else {
            pool = BUDDY_ARTIFACTS.filter(function(a) { return a.rarity === 'common'; });
        }
        if (pool.length === 0) pool = BUDDY_ARTIFACTS;
        artifact = pool[Math.floor(Math.random() * pool.length)];
    }

    // Spawn artifact element near buddy
    var offsetX = (Math.random() - 0.5) * 60;
    var offsetY = (Math.random() - 0.5) * 40;
    var artX = b.x + offsetX;
    var artY = b.y + offsetY;

    var artEl = document.createElement('div');
    artEl.className = 'buddy-artifact';
    artEl.textContent = artifact.emoji;
    artEl.style.left = artX + 'px';
    artEl.style.top = artY + 'px';
    document.body.appendChild(artEl);

    // Add sparkles around artifact
    var sparkleInterval = setInterval(function() {
        if (!artEl.parentNode) { clearInterval(sparkleInterval); return; }
        var sparkle = document.createElement('div');
        sparkle.className = 'buddy-artifact-sparkle';
        sparkle.textContent = '✨';
        sparkle.style.left = (artX + (Math.random() - 0.5) * 30) + 'px';
        sparkle.style.top = (artY + (Math.random() - 0.5) * 20) + 'px';
        document.body.appendChild(sparkle);
        setTimeout(function() { if (sparkle.parentNode) sparkle.remove(); }, 1000);
    }, 400);

    console.log('[Artifacts] Spawned', artifact.name, 'near', username);

    // After 1.5s, buddy walks to it and picks it up
    setTimeout(function() {
        if (!buddyCharacters[username] || !artEl.parentNode) {
            clearInterval(sparkleInterval);
            if (artEl.parentNode) artEl.remove();
            return;
        }

        // Buddy discovers artifact
        artEl.classList.add('artifact-discovered');
        clearInterval(sparkleInterval);

        setTimeout(function() {
            if (artEl.parentNode) artEl.remove();
            applyArtifactToBuddy(username, artifact);
        }, 500);
    }, 1500);
}

function applyArtifactToBuddy(username, artifact) {
    var b = buddyCharacters[username];
    if (!b) return;

    // Remove any existing artifact
    removeArtifactFromBuddy(username);

    // Apply CSS class for visual effect
    b.element.classList.add(artifact.cssClass);

    // Add badge indicator
    var badge = document.createElement('span');
    badge.className = 'buddy-artifact-badge';
    badge.textContent = artifact.badge;
    badge.setAttribute('data-artifact', 'true');
    b.element.appendChild(badge);

    // Store artifact data
    buddyArtifacts[username] = {
        type: artifact.type,
        artifact: artifact,
        expiresAt: Date.now() + artifact.duration,
        cssClass: artifact.cssClass
    };

    // Speech on find
    var speech = artifact.speechOnFind[Math.floor(Math.random() * artifact.speechOnFind.length)];
    showSpeechBubble(b, speech, 'excited');
    showExpression(b, '✨');

    console.log('[Artifacts]', username, 'found', artifact.name, '(' + artifact.rarity + ')');
}

function removeArtifactFromBuddy(username) {
    var art = buddyArtifacts[username];
    if (!art) return;

    var b = buddyCharacters[username];
    if (b && b.element) {
        b.element.classList.remove(art.cssClass);
        var badge = b.element.querySelector('[data-artifact]');
        if (badge) badge.remove();
    }

    delete buddyArtifacts[username];
}

function showArtifactToast(username, artifact) {
    var rarityStars = artifact.rarity === 'rare' ? ' ★★★' : (artifact.rarity === 'uncommon' ? ' ★★' : ' ★');
    var toast = document.createElement('div');
    toast.className = 'buddy-artifact-toast';
    toast.innerHTML = artifact.emoji + ' <strong>' + username + '</strong> found ' + artifact.name + rarityStars;
    document.body.appendChild(toast);
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 3500);
}

// Artifact buff: Scroll makes buddy speak in archaic English
function getArtifactModifiedSpeech(username, originalText) {
    var art = buddyArtifacts[username];
    if (!art || art.type !== 'scroll') return originalText;

    // 50% chance to replace speech with archaic version
    if (Math.random() < 0.5) {
        return ARCHAIC_SPEECH[Math.floor(Math.random() * ARCHAIC_SPEECH.length)];
    }
    return originalText;
}

// Artifact buff: Sword causes screen shake on fight
function triggerSwordScreenShake() {
    var body = document.body;
    body.style.transition = 'none';
    var shakeCount = 0;
    var shakeInterval = setInterval(function() {
        var x = (Math.random() - 0.5) * 8;
        var y = (Math.random() - 0.5) * 8;
        body.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        if (++shakeCount >= 8) {
            clearInterval(shakeInterval);
            body.style.transform = '';
        }
    }, 50);
}

// Artifact buff: Orb gravity pull
function applyOrbGravity() {
    Object.keys(buddyArtifacts).forEach(function(orbOwner) {
        var art = buddyArtifacts[orbOwner];
        if (!art || art.type !== 'orb') return;

        var orbBuddy = buddyCharacters[orbOwner];
        if (!orbBuddy) return;

        Object.keys(buddyCharacters).forEach(function(otherName) {
            if (otherName === orbOwner) return;
            var other = buddyCharacters[otherName];
            if (!other || other.interacting) return;

            var dx = orbBuddy.x - other.x;
            var dy = orbBuddy.y - other.y;
            var dist = Math.sqrt(dx * dx + dy * dy);

            // Only pull within 150px range
            if (dist < 150 && dist > 30) {
                var pullStrength = 0.3;
                other.x += (dx / dist) * pullStrength;
                other.y += (dy / dist) * pullStrength;
                other.element.style.left = other.x + 'px';
                other.element.style.top = other.y + 'px';
            }
        });
    });
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Escape a string for safe use in HTML attributes (single/double quotes, &, <, >)
function escapeAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\/g, '&#92;');
}

// ========== MADLIB CONVERSATION SYSTEM ==========

function fillMadlib(text, rng) {
    var r = rng || Math.random;
    return text.replace(/\{(\w+)\}/g, function(match, key) {
        var words = MADLIB_WORDS[key];
        if (words && words.length > 0) {
            return words[Math.floor(r() * words.length)];
        }
        return match;
    });
}

function getMoodExpression(mood) {
    var moods = {
        excited: ['😄', '✨', '🎉'],
        curious: ['🤔', '👀', '❓'],
        shocked: ['😱', '😮', '🤯'],
        gossipy: ['👀', '🤭', '💅'],
        dramatic: ['😭', '💔', '🎭'],
        thinking: ['🤔', '💭', '🧐'],
        pondering: ['🤔', '💭', '✨'],
        deep: ['🌌', '💫', '🔮'],
        crisis: ['😵', '💀', '🌀'],
        comforting: ['🤗', '💕', '☺️'],
        admiring: ['🥺', '✨', '💖'],
        angry: ['😤', '💢', '😠'],
        defensive: ['😅', '💦', '🙅'],
        conspiracy: ['👁️', '🔺', '🤫'],
        theatrical: ['🎭', '✨', '🌟'],
        flirty: ['😘', '💕', '😏'],
        shy: ['😳', '👉👈', '☺️'],
        romantic: ['💕', '🥰', '💖'],
        touched: ['🥺', '💗', '😊'],
        hopeful: ['🥺', '✨', '💫'],
        paranoid: ['👁️', '😰', '🔍'],
        distressed: ['😰', '😢', '💔'],
        revealing: ['🤯', '💡', '👁️'],
        suspicious: ['🤨', '🧐', '👀'],
        determined: ['💪', '🔥', '✊'],
        heroic: ['⚔️', '🦸', '✨'],
        hungry: ['🤤', '😋', '🍽️'],
        agreeing: ['👏', '💯', '🙌'],
        genius: ['🧠', '💡', '✨'],
        amazed: ['🤩', '✨', '😍'],
        entrepreneurial: ['💰', '📈', '🚀'],
        emotional: ['😭', '💕', '🥺'],
        proud: ['😤', '💪', '✨'],
        worried: ['😰', '😟', '💦'],
        powerful: ['⚡', '🔥', '💪'],
        intense: ['🔥', '⚡', '💥'],
        urgent: ['⚠️', '🚨', '⏰'],
        ominous: ['👁️', '🌑', '⚫'],
        panicked: ['😱', '🏃', '💨'],
        doom: ['💀', '🌑', '⚰️'],
        chaos: ['🌀', '💥', '🔥']
    };
    var arr = moods[mood] || ['😊', '✨', '💫'];
    return arr[Math.floor(Math.random() * arr.length)];
}

function startConversation(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    b1.inConversation = b2.inConversation = true;

    var template = CONVERSATION_TEMPLATES[Math.floor(rng() * CONVERSATION_TEMPLATES.length)];
    var buddies = [b1, b2];
    var lineIndex = 0;

    // Pre-generate all madlibs and timings for sync
    var pregenerated = [];
    for (var i = 0; i < template.lines.length; i++) {
        pregenerated.push({
            text: fillMadlib(template.lines[i].text, rng),
            delay: 2000 + rng() * 1000
        });
    }

    function nextLine() {
        // Safety check: if buddies no longer exist or were force-unstuck, stop conversation
        if (!buddyCharacters[n1] || !buddyCharacters[n2] ||
            !buddyCharacters[n1].interacting || !buddyCharacters[n2].interacting) {
            endConversation(n1, n2);
            return;
        }

        if (lineIndex >= template.lines.length) {
            endConversation(n1, n2);
            return;
        }

        var line = template.lines[lineIndex];
        var speaker = buddies[line.speaker];
        var text = pregenerated[lineIndex].text;
        var expr = getMoodExpression(line.mood);

        showSpeechBubble(speaker, text, line.mood);
        showExpression(speaker, expr);

        var delay = pregenerated[lineIndex].delay;
        lineIndex++;
        var lineTimeout = setTimeout(nextLine, delay);
        trackBuddyTimeout(b1, lineTimeout);
        trackBuddyTimeout(b2, lineTimeout);
    }

    // Start the conversation
    nextLine();
}

function endConversation(n1, n2) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (b1) {
        b1.interacting = false;
        b1.inConversation = false;
        b1.interactCooldown = 10000;
        b1.conversationCooldown = 15000;
        b1.state = 'idle';
        setAnim(b1, 'idle');
    }
    if (b2) {
        b2.interacting = false;
        b2.inConversation = false;
        b2.interactCooldown = 10000;
        b2.conversationCooldown = 15000;
        b2.state = 'idle';
        setAnim(b2, 'idle');
    }
}

// ========== CRAZY INTERACTIONS ==========

function startCrazyInteraction(n1, n2) {
    var type = CRAZY_INTERACTIONS[Math.floor(Math.random() * CRAZY_INTERACTIONS.length)];

    switch(type) {
        case 'fireworks': startFireworks(n1, n2); break;
        case 'wizardDuel': startWizardDuel(n1, n2); break;
        case 'danceOff': startDanceOff(n1, n2); break;
        case 'teatime': startTeatime(n1, n2); break;
        case 'stareContest': startStareContest(n1, n2); break;
        case 'serenade': startSerenade(n1, n2); break;
        case 'ghostPossession': startGhostPossession(n1, n2); break;
        case 'transformSequence': startTransformSequence(n1, n2); break;
        case 'pillowFight': startPillowFight(n1, n2); break;
        case 'fortuneTelling': startFortuneTelling(n1, n2); break;
        case 'dramaDeath': startDramaDeath(n1, n2); break;
        case 'telepathy': startTelepathy(n1, n2); break;
        case 'fusion': startFusion(n1, n2); break;
        case 'timewarp': startTimewarp(n1, n2); break;
        case 'foodFight': startFoodFight(n1, n2); break;
        case 'karaoke': startKaraoke(n1, n2); break;
        case 'armWrestle': startArmWrestle(n1, n2); break;
        case 'portal': startPortal(n1, n2); break;
        case 'summoning': startSummoning(n1, n2); break;
        default: startFireworks(n1, n2);
    }
}

// FIREWORKS
function startFireworks(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    showExpression(b1, '🎆');
    showExpression(b2, '🎇');
    showSpeechBubble(b1, "Let's celebrate!", 'excited');

    var mx = (b1.x + b2.x) / 2, my = (b1.y + b2.y) / 2;
    var fireworks = ['🎆', '🎇', '✨', '💥', '🌟', '⭐', '🔥', '💫'];

    // Pre-generate firework effects for sync
    var fwEffects = [];
    for (var j = 0; j < 8; j++) {
        var burst = [];
        for (var i = 0; i < 3; i++) {
            burst.push({
                fw: fireworks[Math.floor(rng() * fireworks.length)],
                ox: (rng() - 0.5) * 80,
                oy: (rng() - 0.5) * 60
            });
        }
        fwEffects.push(burst);
    }
    var count = 0;

    var interval = setInterval(function() {
        var burst = fwEffects[count];
        for (var i = 0; i < burst.length; i++) {
            createFirework(mx + burst[i].ox, my + burst[i].oy, burst[i].fw);
        }
        if (++count >= 8) clearInterval(interval);
    }, 200);

    setTimeout(function() { endCrazyInteraction(n1, n2); }, 3000);
}

function createFirework(x, y, emoji) {
    var e = document.createElement('div');
    e.className = 'buddy-firework';
    e.textContent = emoji;
    e.style.left = x + 'px';
    e.style.top = y + 'px';
    document.body.appendChild(e);
    setTimeout(function() { e.remove(); }, 1200);
}

// WIZARD DUEL
function startWizardDuel(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    showExpression(b1, '🧙');
    showExpression(b2, '🔮');
    showSpeechBubble(b1, "EXPECTO PATRONUM!", 'powerful');

    var spells = ['⚡', '🔥', '❄️', '💫', '✨', '🌟', '💥', '🌀'];
    // Pre-generate spells for sync
    var preSpells = [];
    for (var i = 0; i < 5; i++) {
        preSpells.push(spells[Math.floor(rng() * spells.length)]);
    }
    var count = 0;

    var interval = setInterval(function() {
        var spell = preSpells[count];
        createMagic(b1.x + 15, b1.y, spell);
        createMagic(b2.x + 15, b2.y, spell);

        if (count === 2) showSpeechBubble(b2, "AVADA KEDAVRA!", 'intense');
        if (++count >= 5) clearInterval(interval);
    }, 400);

    setTimeout(function() {
        showExpression(b1, '😵');
        showExpression(b2, '🏆');
        showSpeechBubble(b2, "I win this round!", 'proud');
        setTimeout(function() { endCrazyInteraction(n1, n2); }, 1500);
    }, 2500);
}

function createMagic(x, y, emoji) {
    var e = document.createElement('div');
    e.className = 'buddy-magic';
    e.textContent = emoji;
    e.style.left = x + 'px';
    e.style.top = y + 'px';
    document.body.appendChild(e);
    setTimeout(function() { e.remove(); }, 1500);
}

// DANCE OFF
function startDanceOff(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    b1.element.classList.add('dancing');
    b2.element.classList.add('dancing');
    showExpression(b1, '💃');
    showExpression(b2, '🕺');
    showSpeechBubble(b1, "Dance battle!", 'excited');

    var notes = ['🎵', '🎶', '💃', '🕺', '✨', '🌟'];
    // Pre-generate notes for sync
    var preNotes = [];
    for (var i = 0; i < 8; i++) {
        preNotes.push({
            note: notes[Math.floor(rng() * notes.length)],
            ox1: rng() * 20,
            ox2: rng() * 20
        });
    }
    var count = 0;

    var interval = setInterval(function() {
        var n = preNotes[count];
        createMusicNote(b1.x + n.ox1, b1.y - 10, n.note);
        createMusicNote(b2.x + n.ox2, b2.y - 10, n.note);
        if (++count >= 8) clearInterval(interval);
    }, 300);

    setTimeout(function() {
        b1.element.classList.remove('dancing');
        b2.element.classList.remove('dancing');
        showSpeechBubble(b2, "You've got moves!", 'amazed');
        endCrazyInteraction(n1, n2);
    }, 3000);
}

function createMusicNote(x, y, emoji) {
    var e = document.createElement('div');
    e.className = 'buddy-music-note';
    e.textContent = emoji;
    e.style.left = x + 'px';
    e.style.top = y + 'px';
    document.body.appendChild(e);
    setTimeout(function() { e.remove(); }, 1500);
}

// TEA TIME
function startTeatime(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    // No random in teatime but add param for consistency

    b1.interacting = b2.interacting = true;
    showExpression(b1, '🍵');
    showExpression(b2, '☕');
    showSpeechBubble(b1, "Tea time~!", 'sweet');

    setTimeout(function() {
        showSpeechBubble(b2, "How delightful!", 'happy');
        createSparkle((b1.x + b2.x) / 2, (b1.y + b2.y) / 2, '🫖');
    }, 1000);

    setTimeout(function() {
        showSpeechBubble(b1, "*sips elegantly*", 'fancy');
    }, 2000);

    setTimeout(function() {
        showExpression(b1, '😌');
        showExpression(b2, '😌');
        endCrazyInteraction(n1, n2);
    }, 3500);
}

function createSparkle(x, y, emoji) {
    var e = document.createElement('div');
    e.className = 'buddy-sparkle';
    e.textContent = emoji;
    e.style.left = x + 'px';
    e.style.top = y + 'px';
    document.body.appendChild(e);
    setTimeout(function() { e.remove(); }, 800);
}

// STARE CONTEST
function startStareContest(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    // Pre-determine winner for sync
    var b1Loses = rng() < 0.5;

    b1.interacting = b2.interacting = true;
    showExpression(b1, '👁️');
    showExpression(b2, '👁️');
    showSpeechBubble(b1, "Staring contest. GO!", 'intense');

    setTimeout(function() {
        showSpeechBubble(b2, "...", 'focused');
    }, 1500);

    setTimeout(function() {
        showSpeechBubble(b1, "*intense staring*", 'focused');
    }, 2500);

    setTimeout(function() {
        var loser = b1Loses ? b1 : b2;
        var winner = b1Loses ? b2 : b1;
        showExpression(loser, '😣');
        showExpression(winner, '🏆');
        showSpeechBubble(loser, "I BLINKED!", 'shocked');
        showSpeechBubble(winner, "VICTORY!", 'excited');
        endCrazyInteraction(n1, n2);
    }, 4000);
}

// SERENADE
function startSerenade(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    b1.element.classList.add('singing');
    showExpression(b1, '🎤');
    showExpression(b2, '🥰');

    var lyrics = [
        "🎵 You are my sunshine~ 🎵",
        "🎶 My only sunshine~ 🎶",
        "✨ You make me happy~ ✨",
        "💕 When skies are gray~ 💕"
    ];

    // Pre-generate note positions for sync
    var noteOffsets = [];
    for (var j = 0; j < lyrics.length; j++) {
        noteOffsets.push(rng() * 30);
    }

    var i = 0;
    var interval = setInterval(function() {
        if (i < lyrics.length) {
            showSpeechBubble(b1, lyrics[i], 'romantic');
            createMusicNote(b1.x + noteOffsets[i], b1.y - 20, '🎵');
            i++;
        }
    }, 1200);

    setTimeout(function() {
        clearInterval(interval);
        b1.element.classList.remove('singing');
        showSpeechBubble(b2, "That was beautiful! 😭", 'touched');
        showExpression(b1, '😊');
        endCrazyInteraction(n1, n2);
    }, 5000);
}

// GHOST POSSESSION
function startGhostPossession(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    // No random in ghost possession but add param for consistency

    b1.interacting = b2.interacting = true;
    showExpression(b1, '👻');
    showSpeechBubble(b1, "I shall possess you!", 'spooky');

    createGhostEffect(b1.x, b1.y);

    setTimeout(function() {
        b2.element.classList.add('possessed');
        showExpression(b2, '😵');
        showSpeechBubble(b2, "*speaks in tongues*", 'chaos');
    }, 1000);

    setTimeout(function() {
        showSpeechBubble(b2, "THE POWER COMPELS ME", 'possessed');
    }, 2000);

    setTimeout(function() {
        b2.element.classList.remove('possessed');
        showExpression(b2, '😅');
        showSpeechBubble(b2, "What... happened?", 'confused');
        endCrazyInteraction(n1, n2);
    }, 3500);
}

function createGhostEffect(x, y) {
    var e = document.createElement('div');
    e.className = 'buddy-ghost-effect';
    e.textContent = '👻';
    e.style.left = x + 'px';
    e.style.top = y + 'px';
    document.body.appendChild(e);
    setTimeout(function() { e.remove(); }, 2000);
}

// TRANSFORMATION SEQUENCE
function startTransformSequence(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    showSpeechBubble(b1, "TRANSFORMATION SEQUENCE!", 'powerful');
    showExpression(b1, '✨');
    showExpression(b2, '✨');

    b1.element.classList.add('buddy-transformation');
    b2.element.classList.add('buddy-transformation');

    var sparkles = ['✨', '💫', '⭐', '🌟', '💖'];
    // Pre-generate sparkle positions for sync
    var sparklePos = [];
    for (var i = 0; i < 10; i++) {
        sparklePos.push({
            ox1: (rng() - 0.5) * 40, oy1: (rng() - 0.5) * 40,
            ox2: (rng() - 0.5) * 40, oy2: (rng() - 0.5) * 40
        });
    }
    var count = 0;
    var interval = setInterval(function() {
        var sp = sparklePos[count];
        createSparkle(b1.x + sp.ox1, b1.y + sp.oy1, sparkles[count % sparkles.length]);
        createSparkle(b2.x + sp.ox2, b2.y + sp.oy2, sparkles[count % sparkles.length]);
        if (++count >= 10) clearInterval(interval);
    }, 150);

    setTimeout(function() {
        b1.element.classList.remove('buddy-transformation');
        b2.element.classList.remove('buddy-transformation');
        showSpeechBubble(b1, "ULTIMATE FORM ACHIEVED!", 'excited');
        showExpression(b1, '💪');
        showExpression(b2, '💪');
        endCrazyInteraction(n1, n2);
    }, 2500);
}

// PILLOW FIGHT
function startPillowFight(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    setAnim(b1, 'fighting');
    setAnim(b2, 'fighting');
    showSpeechBubble(b1, "PILLOW FIGHT!", 'excited');

    var pillows = ['🛏️', '🪶', '💨', '✨'];
    // Pre-generate pillow effects for sync
    var pillowEffects = [];
    for (var i = 0; i < 6; i++) {
        pillowEffects.push({
            p: pillows[Math.floor(rng() * pillows.length)],
            ox: (rng() - 0.5) * 30
        });
    }
    var count = 0;
    var interval = setInterval(function() {
        var pe = pillowEffects[count];
        createFightEffect((b1.x + b2.x) / 2 + pe.ox, (b1.y + b2.y) / 2, { emoji: pe.p, name: 'FLOOF!', color: '#FFF' });
        if (++count >= 6) clearInterval(interval);
    }, 300);

    setTimeout(function() {
        showSpeechBubble(b2, "*feathers everywhere*", 'laughing');
        showExpression(b1, '😂');
        showExpression(b2, '😂');
        endCrazyInteraction(n1, n2);
    }, 2500);
}

// FORTUNE TELLING
function startFortuneTelling(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    showExpression(b1, '🔮');
    showSpeechBubble(b1, "I see your future...", 'mysterious');

    setTimeout(function() {
        createMagic(b1.x + 15, b1.y, '🔮');
    }, 800);

    var fortunes = [
        "You will find {noun} in the {place}!",
        "Beware of {person}... they seek your {noun}!",
        "Love will find you when you least expect {food}!",
        "Your destiny involves {adjective} {noun}!",
        "The stars say: {quote}!",
        "{person} holds the key to your {noun}!"
    ];

    // Pre-generate fortune for sync
    var selectedFortune = fillMadlib(fortunes[Math.floor(rng() * fortunes.length)], rng);

    setTimeout(function() {
        showSpeechBubble(b1, selectedFortune, 'mystical');
        showExpression(b2, '😮');
    }, 2000);

    setTimeout(function() {
        showSpeechBubble(b2, "Amazing! How did you know?!", 'amazed');
        endCrazyInteraction(n1, n2);
    }, 4000);
}

// DRAMATIC DEATH
function startDramaDeath(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    var phrase = fillMadlib("Tell my family... I love {food}...", rng);
    showSpeechBubble(b1, phrase, 'dramatic');
    showExpression(b2, '😱');

    setTimeout(function() {
        b1.element.classList.add('dramatic-death');
        showSpeechBubble(b1, "*dramatically falls*", 'dying');
    }, 1000);

    setTimeout(function() {
        showSpeechBubble(b2, "NOOOOOO!", 'devastated');
        showExpression(b2, '😭');
    }, 1500);

    setTimeout(function() {
        showSpeechBubble(b1, "jk I'm fine lol", 'trolling');
        b1.element.classList.remove('dramatic-death');
        showExpression(b1, '😏');
        showExpression(b2, '😤');
        endCrazyInteraction(n1, n2);
    }, 3500);
}

// TELEPATHY
function startTelepathy(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    b1.element.classList.add('telepathy');
    b2.element.classList.add('telepathy');
    showExpression(b1, '🧠');
    showExpression(b2, '🧠');
    showSpeechBubble(b1, "*sending thoughts*", 'psychic');

    // Pre-generate thought for sync
    var thought = fillMadlib("I'm thinking about {noun}!", rng);

    // Create beam between them
    createBeam(b1.x + 15, b1.y + 10, b2.x + 15, b2.y + 10);

    setTimeout(function() {
        showSpeechBubble(b2, thought, 'receiving');
    }, 1500);

    setTimeout(function() {
        showSpeechBubble(b1, "DID YOU GET THAT?!", 'excited');
        showSpeechBubble(b2, "YES! TELEPATHY WORKS!", 'amazed');
    }, 2500);

    setTimeout(function() {
        b1.element.classList.remove('telepathy');
        b2.element.classList.remove('telepathy');
        endCrazyInteraction(n1, n2);
    }, 4000);
}

function createBeam(x1, y1, x2, y2) {
    var e = document.createElement('div');
    e.className = 'buddy-beam';
    var length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    e.style.left = x1 + 'px';
    e.style.top = y1 + 'px';
    e.style.width = length + 'px';
    e.style.transform = 'rotate(' + angle + 'deg)';
    e.style.transformOrigin = '0 50%';
    document.body.appendChild(e);
    setTimeout(function() { e.remove(); }, 500);
}

// FUSION
function startFusion(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    showSpeechBubble(b1, "FUUUU...", 'intense');
    showSpeechBubble(b2, "...SION!", 'intense');
    showExpression(b1, '🤝');
    showExpression(b2, '🤝');

    // Pre-generate sparkle positions for sync
    var sparklePos = [];
    for (var j = 0; j < 8; j++) {
        sparklePos.push({ ox: (rng() - 0.5) * 50, oy: (rng() - 0.5) * 50 });
    }

    setTimeout(function() {
        showSpeechBubble(b1, "HA!", 'powerful');
        b1.element.classList.add('fused');
        b2.element.style.opacity = '0.3';
        for (var i = 0; i < 8; i++) {
            (function(idx) {
                setTimeout(function() {
                    createSparkle(b1.x + sparklePos[idx].ox, b1.y + sparklePos[idx].oy, '✨');
                }, idx * 100);
            })(i);
        }
    }, 1500);

    setTimeout(function() {
        showSpeechBubble(b1, "WE ARE ONE!", 'powerful');
        showExpression(b1, '💪');
    }, 2500);

    setTimeout(function() {
        b1.element.classList.remove('fused');
        b2.element.style.opacity = '1';
        showSpeechBubble(b1, "*defuses*", 'dizzy');
        showExpression(b1, '😵');
        showExpression(b2, '😵');
        endCrazyInteraction(n1, n2);
    }, 4000);
}

// TIMEWARP
function startTimewarp(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    showSpeechBubble(b1, "INITIATING TIMEWARP!", 'urgent');
    showExpression(b1, '⏰');
    showExpression(b2, '🌀');

    b1.element.classList.add('timewarp');
    b2.element.classList.add('timewarp');

    // Pre-generate year for sync
    var year = MADLIB_WORDS.year[Math.floor(rng() * MADLIB_WORDS.year.length)];

    setTimeout(function() {
        createPortalEffect((b1.x + b2.x) / 2, (b1.y + b2.y) / 2);
    }, 500);

    setTimeout(function() {
        showSpeechBubble(b1, "We're in the year " + year + "!", 'shocked');
    }, 1500);

    setTimeout(function() {
        showSpeechBubble(b2, "WHAT HAVE WE DONE?!", 'panicked');
    }, 2500);

    setTimeout(function() {
        b1.element.classList.remove('timewarp');
        b2.element.classList.remove('timewarp');
        showSpeechBubble(b1, "*returns to present*", 'relieved');
        endCrazyInteraction(n1, n2);
    }, 4000);
}

function createPortalEffect(x, y) {
    var e = document.createElement('div');
    e.className = 'buddy-portal';
    e.textContent = '🌀';
    e.style.left = (x - 20) + 'px';
    e.style.top = (y - 20) + 'px';
    document.body.appendChild(e);
    setTimeout(function() { e.remove(); }, 2000);
}

// FOOD FIGHT
function startFoodFight(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    showSpeechBubble(b1, "FOOD FIGHT!", 'chaotic');
    showExpression(b1, '😈');
    showExpression(b2, '😈');

    var foods = ['🍕', '🌮', '🍔', '🍟', '🥧', '🍰', '🍩', '🥗', '🍝', '🍜'];
    // Pre-generate food throws for sync
    var foodThrows = [];
    for (var i = 0; i < 5; i++) {
        foodThrows.push({
            f1: foods[Math.floor(rng() * foods.length)],
            f2: foods[Math.floor(rng() * foods.length)]
        });
    }
    var count = 0;

    var interval = setInterval(function() {
        var ft = foodThrows[count];
        throwFood(b1.x, b1.y, b2.x, b2.y, ft.f1);
        throwFood(b2.x, b2.y, b1.x, b1.y, ft.f2);
        if (++count >= 5) clearInterval(interval);
    }, 350);

    setTimeout(function() {
        showSpeechBubble(b1, "*covered in food*", 'messy');
        showSpeechBubble(b2, "Worth it!", 'satisfied');
        showExpression(b1, '😋');
        showExpression(b2, '😋');
        endCrazyInteraction(n1, n2);
    }, 2500);
}

function throwFood(x1, y1, x2, y2, food) {
    var e = document.createElement('div');
    e.className = 'buddy-food-projectile';
    e.textContent = food;
    e.style.left = x1 + 'px';
    e.style.top = y1 + 'px';
    e.style.transition = 'all 0.3s ease-out';
    document.body.appendChild(e);

    setTimeout(function() {
        e.style.left = x2 + 'px';
        e.style.top = y2 + 'px';
    }, 10);

    setTimeout(function() {
        createSparkle(x2, y2, '💥');
        e.remove();
    }, 300);
}

// KARAOKE
function startKaraoke(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    b1.element.classList.add('singing');
    b2.element.classList.add('singing');
    showExpression(b1, '🎤');
    showExpression(b2, '🎤');
    showSpeechBubble(b1, "🎵 We're no strangers to looove~", 'singing');

    // Pre-generate note positions for sync
    var notePos = [];
    for (var j = 0; j < 5; j++) {
        notePos.push({ ox1: rng() * 40 - 20, ox2: rng() * 40 - 20 });
    }

    setTimeout(function() {
        showSpeechBubble(b2, "🎶 You know the rules and SO DO I~", 'singing');
    }, 1500);

    setTimeout(function() {
        showSpeechBubble(b1, "🎵 NEVER GONNA GIVE YOU UP!", 'powerful');
        for (var i = 0; i < 5; i++) {
            createMusicNote(b1.x + notePos[i].ox1, b1.y - 20, '🎵');
            createMusicNote(b2.x + notePos[i].ox2, b2.y - 20, '🎶');
        }
    }, 3000);

    setTimeout(function() {
        b1.element.classList.remove('singing');
        b2.element.classList.remove('singing');
        showSpeechBubble(b2, "We just got rickrolled!", 'shocked');
        endCrazyInteraction(n1, n2);
    }, 4500);
}

// ARM WRESTLE
function startArmWrestle(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    // Pre-determine winner for sync
    var b1Wins = rng() < 0.5;

    b1.interacting = b2.interacting = true;
    showSpeechBubble(b1, "ARM WRESTLE!", 'competitive');
    showExpression(b1, '💪');
    showExpression(b2, '💪');

    setTimeout(function() {
        showSpeechBubble(b2, "*struggling*", 'straining');
    }, 1000);

    setTimeout(function() {
        showSpeechBubble(b1, "HNNNNG!", 'effort');
    }, 2000);

    setTimeout(function() {
        var winner = b1Wins ? b1 : b2;
        var loser = b1Wins ? b2 : b1;
        showSpeechBubble(winner, "VICTORY IS MINE!", 'triumphant');
        showSpeechBubble(loser, "My arm! 😭", 'defeated');
        showExpression(winner, '🏆');
        showExpression(loser, '😫');
        endCrazyInteraction(n1, n2);
    }, 3000);
}

// PORTAL
function startPortal(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    // Pre-generate madlibs for sync
    var place = fillMadlib("{place}", rng);
    var person = fillMadlib("{person}", rng);

    b1.interacting = b2.interacting = true;
    showSpeechBubble(b1, "Opening portal to " + place + "!", 'excited');
    showExpression(b1, '🌀');

    createPortalEffect(b1.x + 30, b1.y);

    setTimeout(function() {
        createPortalEffect(b2.x - 10, b2.y);
        showExpression(b2, '😮');
    }, 800);

    setTimeout(function() {
        showSpeechBubble(b2, "I can see " + person + " on the other side!", 'amazed');
    }, 1500);

    setTimeout(function() {
        showSpeechBubble(b1, "*closes portal*", 'relieved');
        showSpeechBubble(b2, "That was wild!", 'excited');
        endCrazyInteraction(n1, n2);
    }, 3000);
}

// SUMMONING
function startSummoning(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    // Pre-generate madlib and summoned item for sync
    var nounPhrase = fillMadlib("We shall summon {noun}!", rng);
    var summons = ['a pizza 🍕', 'chaos incarnate 🌀', 'the void 🕳️', 'a very confused cat 🐱', 'pure vibes ✨', 'the algorithm 🤖'];
    var summoned = summons[Math.floor(rng() * summons.length)];

    b1.interacting = b2.interacting = true;
    showSpeechBubble(b1, nounPhrase, 'mystical');
    showExpression(b1, '🕯️');
    showExpression(b2, '🕯️');

    var summonEffects = ['🔥', '⚡', '🌟', '💀', '👁️', '🌙'];
    // Pre-generate effects for sync
    var effectsData = [];
    for (var i = 0; i < 8; i++) {
        effectsData.push({
            effect: summonEffects[Math.floor(rng() * summonEffects.length)],
            ox: (rng() - 0.5) * 50,
            oy: (rng() - 0.5) * 40
        });
    }
    var count = 0;
    var mx = (b1.x + b2.x) / 2, my = (b1.y + b2.y) / 2;

    var interval = setInterval(function() {
        var ed = effectsData[count];
        createMagic(mx + ed.ox, my + ed.oy, ed.effect);
        if (++count >= 8) clearInterval(interval);
    }, 200);

    setTimeout(function() {
        showSpeechBubble(b1, "WE SUMMONED " + summoned + "!", 'shocked');
        showExpression(b1, '😱');
        showExpression(b2, '😱');
    }, 2000);

    setTimeout(function() {
        showSpeechBubble(b2, "Close the portal! CLOSE IT!", 'panicked');
        endCrazyInteraction(n1, n2);
    }, 3500);
}

// Generic end for crazy interactions
function endCrazyInteraction(n1, n2) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (b1) {
        b1.interacting = false;
        b1.interactCooldown = 6000;
        b1.state = 'idle';
        setAnim(b1, 'idle');
    }
    if (b2) {
        b2.interacting = false;
        b2.interactCooldown = 6000;
        b2.state = 'idle';
        setAnim(b2, 'idle');
    }
    onInteractionEnd('conversation', n1, n2);
}

// ========== ADVANCED BUDDY SYSTEMS ==========
// Foundation: Event Bus, Relationship Memory, Mood, Chat Energy
// Movement: UI Perching, Wall-Running, Flocking, Territories
// Environmental: Chat Reactivity, Music Sync, Physics Objects
// Interactions: Multi-Buddy, Chain Reactions, Jobs, Predator/Prey, Evolution

// ===== EVENT BUS =====
buddyEventBus.emit = function(event, data) {
    var list = this.handlers[event];
    if (list) list.forEach(function(fn) { fn(data); });
};
buddyEventBus.on = function(event, fn) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(fn);
};

// ===== RELATIONSHIP MEMORY (#9) =====
function getRelationshipKey(n1, n2) {
    return n1 < n2 ? (n1 + '|' + n2) : (n2 + '|' + n1);
}

function getRelationship(n1, n2) {
    return buddyRelationships[getRelationshipKey(n1, n2)] || 0;
}

function updateRelationship(n1, n2, delta, fromSync) {
    var key = getRelationshipKey(n1, n2);
    var val = (buddyRelationships[key] || 0) + delta;
    buddyRelationships[key] = Math.max(-100, Math.min(100, val));
    buddyEventBus.emit('relationshipChanged', { n1: n1, n2: n2, value: buddyRelationships[key], delta: delta });
    // Broadcast as safety net - only master sends, to avoid all clients broadcasting same delta
    // Primary sync is deterministic: all clients run same interactions = same updates
    if (!fromSync && isInteractionMaster()) {
        broadcastAdvancedAction('rel', { n1: n1, n2: n2, delta: delta });
    }
}

function getRelationshipTier(n1, n2) {
    var r = getRelationship(n1, n2);
    if (r >= 60) return 'soulmates';
    if (r >= 30) return 'friends';
    if (r >= 0) return 'acquaintances';
    if (r >= -30) return 'rivals';
    return 'enemies';
}

// Load relationships from localStorage on init
function loadRelationships() {
    try {
        var saved = localStorage.getItem('buddyRelationships');
        if (saved) buddyRelationships = JSON.parse(saved);
    } catch(e) {}
}

function saveRelationships() {
    try { localStorage.setItem('buddyRelationships', JSON.stringify(buddyRelationships)); } catch(e) {}
}

// ===== MOOD SYSTEM (#2) =====
function setBuddyMood(b, type, intensity) {
    if (!b) return;
    b.mood = { type: type, intensity: Math.min(1, intensity || 0.8), decayTimer: 0 };
    // Apply mood CSS class
    var el = b.element;
    el.classList.remove('mood-happy', 'mood-angry', 'mood-sad', 'mood-scared', 'mood-lovestruck', 'mood-sleepy');
    if (type !== 'neutral') el.classList.add('mood-' + type);
    buddyEventBus.emit('moodChanged', { username: b.username, mood: type, intensity: intensity });
}

function decayBuddyMood(b) {
    if (!b || !b.mood || b.mood.type === 'neutral') return;
    b.mood.intensity -= BUDDY_CONFIG.moodDecayRate;
    if (b.mood.intensity <= 0) {
        b.mood = { type: 'neutral', intensity: 0, decayTimer: 0 };
        b.element.classList.remove('mood-happy', 'mood-angry', 'mood-sad', 'mood-scared', 'mood-lovestruck', 'mood-sleepy');
    }
}

function getMoodSpeedMultiplier(b) {
    if (!b || !b.mood) return 1;
    switch(b.mood.type) {
        case 'happy': return 1 + (b.mood.intensity * 0.3);
        case 'angry': return 1 + (b.mood.intensity * 0.2);
        case 'sad': return 1 - (b.mood.intensity * 0.5);
        case 'scared': return 1 + (b.mood.intensity * 0.6);
        case 'lovestruck': return 1 - (b.mood.intensity * 0.2);
        case 'sleepy': return 0.3;
        default: return 1;
    }
}

function getMoodHopModifier(b, rng) {
    if (!b || !b.mood) return { vxMod: 0, vyMod: 0 };
    var r = rng || b.moveRng || Math.random;
    var i = b.mood.intensity;
    switch(b.mood.type) {
        case 'happy': return { vxMod: 0, vyMod: -i * 2 }; // Higher jumps
        case 'angry': return { vxMod: (r()-0.5) * i * 2, vyMod: 0 }; // Stompy lateral
        case 'sad': return { vxMod: 0, vyMod: i * 0.5 }; // Droopy, lower hops
        case 'scared': return { vxMod: (r()-0.5) * i * 3, vyMod: -i }; // Jittery
        case 'lovestruck': return { vxMod: Math.sin(Date.now()/500) * i, vyMod: -i * 0.5 }; // Floaty drift
        default: return { vxMod: 0, vyMod: 0 };
    }
}

// ===== UI SURFACE PERCHING (#1) =====
function scanUISurfaces() {
    uiSurfaces = [];
    var selectors = [
        '#chatheader', '#currenttitlewrap', '#videowrap-header',
        '#leftcontrols', '#rightcontrols', '#userlist',
        '.navbar', '#navbar-outer', '#queuewrap > .queue_entry',
        '#messagebuffer > div'
    ];
    selectors.forEach(function(sel) {
        try {
            var els = document.querySelectorAll(sel);
            els.forEach(function(el) {
                var rect = el.getBoundingClientRect();
                if (rect.width > 20 && rect.height > 5) {
                    uiSurfaces.push({
                        el: el,
                        x: rect.left,
                        y: rect.top,
                        width: rect.width,
                        height: rect.height,
                        type: sel.indexOf('message') !== -1 ? 'message' : 'ui'
                    });
                }
            });
        } catch(e) {}
    });
    // Sort by y position (top surfaces first) and limit to prevent performance issues
    uiSurfaces.sort(function(a, b) { return a.y - b.y; });
    if (uiSurfaces.length > 30) uiSurfaces = uiSurfaces.slice(0, 30);
    lastSurfaceScan = Date.now();
}

function getRandomSurface(zone, rng) {
    var r = rng || Math.random;
    if (uiSurfaces.length === 0) return null;
    // Filter surfaces within buddy zone
    var valid = uiSurfaces.filter(function(s) {
        return s.x >= zone.left - 20 && s.x + s.width <= zone.right + 40 &&
               s.y >= zone.top && s.y <= zone.absoluteBottom;
    });
    if (valid.length === 0) return null;
    var surface = valid[Math.floor(r() * valid.length)];
    return {
        x: surface.x + r() * Math.max(0, surface.width - BUDDY_CONFIG.characterSize),
        y: surface.y - BUDDY_CONFIG.characterSize + 2, // Sit on top edge
        surface: surface
    };
}

// ===== WALL-RUNNING (#5) =====
function startWallRun(b, side, zone, fromSync) {
    b.wallRunning = true;
    b.wallRunSide = side;
    b.wallRunProgress = 0;
    b.state = 'wall-running';
    b.stateTime = 0;
    b.element.classList.add('wall-running', 'wall-' + side);

    // Broadcast wall-run to other clients
    if (!fromSync && b.username) {
        broadcastAdvancedAction('wallrun', { username: b.username, side: side });
    }
}

function updateWallRun(b, zone) {
    if (!b.wallRunning) return false;
    var speed = BUDDY_CONFIG.wallRunSpeed * getMoodSpeedMultiplier(b);
    // Ensure minimum speed so wall run always progresses
    speed = Math.max(0.1, speed);
    b.wallRunProgress += speed * 0.01;

    // Safety: end wall run if progress exceeds 1 or has been running too long (8 seconds)
    if (b.wallRunProgress >= 1 || b.stateTime > 8000) {
        // Finished wall run, detach
        endWallRun(b);
        return false;
    }

    switch(b.wallRunSide) {
        case 'right':
            b.x = zone.right;
            b.y = zone.absoluteBottom - b.wallRunProgress * (zone.absoluteBottom - zone.top);
            b.element.style.transform = 'rotate(-90deg)';
            break;
        case 'left':
            b.x = zone.left;
            b.y = zone.top + b.wallRunProgress * (zone.absoluteBottom - zone.top);
            b.element.style.transform = 'rotate(90deg)';
            break;
        case 'top':
            b.y = zone.top;
            b.x = zone.left + b.wallRunProgress * (zone.right - zone.left);
            b.element.style.transform = 'rotate(180deg)';
            break;
    }
    return true;
}

function endWallRun(b) {
    b.wallRunning = false;
    b.wallRunSide = null;
    b.wallRunProgress = 0;
    b.state = 'idle';
    b.stateTime = 0;
    b.element.style.transform = '';
    b.element.classList.remove('wall-running', 'wall-left', 'wall-right', 'wall-top');
    setAnim(b, 'idle');
}

// ===== FLOCKING / SOCIAL GRAVITY (#3) =====
function applyFlockingForces(names) {
    var cfg = BUDDY_CONFIG;
    for (var i = 0; i < names.length; i++) {
        var b = buddyCharacters[names[i]];
        if (!b || b.interacting || b.wallRunning || b.sleeping || b.isEgg) continue;

        var fx = 0, fy = 0;
        for (var j = 0; j < names.length; j++) {
            if (i === j) continue;
            var other = buddyCharacters[names[j]];
            if (!other) continue;

            var dx = other.x - b.x;
            var dy = other.y - b.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 1 || dist > cfg.flockingRange) continue;

            var rel = getRelationship(names[i], names[j]);
            // Positive relationship = attraction, negative = repulsion
            var force = (rel / 100) * cfg.flockingStrength / Math.max(dist, 30);
            fx += dx * force;
            fy += dy * force;
        }

        // Clamp forces to prevent teleportation
        fx = Math.max(-1.5, Math.min(1.5, fx));
        fy = Math.max(-1.5, Math.min(1.5, fy));
        b.x += fx;
        b.y += fy;
        // Keep within zone after flocking
        var zone = getBuddyZone();
        clampToZone(b, zone);
    }
}

// ===== PATROL ROUTES & TERRITORIES (#6) =====
function assignTerritory(username) {
    var b = buddyCharacters[username];
    if (!b) return;
    var zone = getBuddyZone();
    buddyTerritories[username] = {
        cx: b.x,
        cy: b.y,
        radius: BUDDY_CONFIG.territorySize
    };
}

function shiftTerritory(winner, loser) {
    var wt = buddyTerritories[winner];
    var lt = buddyTerritories[loser];
    if (wt) wt.radius = Math.min(250, wt.radius + BUDDY_CONFIG.territoryShiftRate);
    if (lt) lt.radius = Math.max(40, lt.radius - BUDDY_CONFIG.territoryShiftRate);
}

function getPatrolTarget(b) {
    var t = buddyTerritories[b.username];
    if (!t) {
        assignTerritory(b.username);
        t = buddyTerritories[b.username];
    }
    // Figure-8 patrol pattern
    var phase = (Date.now() / 3000) % (Math.PI * 2);
    return {
        x: t.cx + Math.sin(phase) * t.radius * 0.6,
        y: t.cy + Math.sin(phase * 2) * t.radius * 0.3
    };
}

function isInTerritory(b, otherName) {
    var t = buddyTerritories[b.username];
    if (!t) return false;
    var other = buddyCharacters[otherName];
    if (!other) return false;
    var dist = Math.sqrt(Math.pow(other.x - t.cx, 2) + Math.pow(other.y - t.cy, 2));
    return dist < t.radius;
}

// ===== CHAT ENERGY & REACTIVITY (#4) =====
function updateChatEnergy() {
    chatEnergyLevel *= BUDDY_CONFIG.chatEnergyDecay;
    if (chatEnergyLevel < 0.01) chatEnergyLevel = 0;
}

function onChatMessage(msg, username) {
    chatEnergyLevel = Math.min(1, chatEnergyLevel + BUDDY_CONFIG.chatEnergyPerMsg);
    lastChatTimestamp = Date.now();

    // Wake up sleeping buddies
    var names = Object.keys(buddyCharacters);
    names.forEach(function(name) {
        var b = buddyCharacters[name];
        if (b && b.sleeping) {
            b.sleeping = false;
            b.element.classList.remove('buddy-sleeping');
            setBuddyMood(b, 'neutral', 0);
            showExpression(b, '😳');
        }
    });

    // ALL CAPS detection - buddies flinch
    if (msg && msg === msg.toUpperCase() && msg.length > 3 && /[A-Z]/.test(msg)) {
        names.forEach(function(name) {
            var b = buddyCharacters[name];
            if (!b || b.interacting) return;
            // Flinch: quick scatter
            b.vx += (Math.random() - 0.5) * 6;
            b.vy -= Math.random() * 3;
            showExpression(b, ['😰', '😱', '🫨', '😵'][Math.floor(Math.random() * 4)]);
            setBuddyMood(b, 'scared', 0.4);
        });
    }

    // Emote reaction - nearest buddy mimics
    if (msg && /^:[a-zA-Z0-9_]+:$/.test(msg.trim())) {
        var nearestDist = Infinity, nearest = null;
        names.forEach(function(name) {
            var b = buddyCharacters[name];
            if (!b || b.interacting) return;
            // Use position relative to chat area
            var dist = Math.abs(b.y - (window.innerHeight * 0.6));
            if (dist < nearestDist) { nearestDist = dist; nearest = b; }
        });
        if (nearest) {
            showExpression(nearest, ['🤔', '😄', '😮', '🤩'][Math.floor(Math.random() * 4)]);
        }
    }

    buddyEventBus.emit('chatMessage', { msg: msg, username: username });
}

function checkSleepState() {
    var silenceDuration = Date.now() - lastChatTimestamp;
    if (silenceDuration > BUDDY_CONFIG.sleepThreshold) {
        Object.keys(buddyCharacters).forEach(function(name) {
            var b = buddyCharacters[name];
            if (b && !b.sleeping && !b.interacting && !b.isEgg) {
                b.sleeping = true;
                b.element.classList.add('buddy-sleeping');
                setBuddyMood(b, 'sleepy', 0.9);
                b.vx = 0;
                b.vy = 0;
                showSpeechBubble(b, 'zzz...', 'shy');
            }
        });
    }
}

// ===== MUSIC/VIDEO SYNC (#7) =====
var lastVideoTitle = '';
function checkVideoSync() {
    // Subtle beat-like movement modifier based on time
    var beatPhase = Math.sin(Date.now() / 400) * 0.3;

    // Detect video change
    var titleEl = document.getElementById('currenttitle');
    var currentTitle = titleEl ? titleEl.textContent : '';
    if (currentTitle && currentTitle !== lastVideoTitle) {
        lastVideoTitle = currentTitle;
        // All buddies look toward video briefly
        Object.keys(buddyCharacters).forEach(function(name) {
            var b = buddyCharacters[name];
            if (b && !b.interacting) {
                // Face toward the left (video side)
                if (!b.element.classList.contains('face-left')) {
                    b.element.classList.add('face-left');
                }
                showExpression(b, ['👀', '🎵', '🎬', '🍿'][Math.floor(Math.random() * 4)]);
                // Resume normal facing after 2s
                setTimeout(function() {
                    if (b.vx > 0) b.element.classList.remove('face-left');
                }, 2000);
            }
        });
    }

    return beatPhase;
}

// ===== PHYSICS OBJECTS (#13) =====
var PHYSICS_OBJ_TYPES = [
    { emoji: '⚽', name: 'ball', bounce: 0.8, mass: 1 },
    { emoji: '🏀', name: 'basketball', bounce: 0.7, mass: 1.2 },
    { emoji: '🎾', name: 'tennis', bounce: 0.9, mass: 0.6 },
    { emoji: '🎈', name: 'balloon', bounce: 0.3, mass: 0.1 },
    { emoji: '💎', name: 'gem', bounce: 0.5, mass: 2 },
    { emoji: '🍎', name: 'apple', bounce: 0.4, mass: 0.8 }
];

function spawnPhysicsObject(zone, fromSync, syncData) {
    if (physicsObjects.length >= BUDDY_CONFIG.physicsObjMaxCount) return;

    var typeIdx, nx, nvx;
    if (fromSync && syncData) {
        // Use synced data for deterministic spawn
        typeIdx = syncData.typeIdx;
        nx = syncData.nx;
        nvx = syncData.nvx;
    } else {
        // Generate spawn data and broadcast
        typeIdx = Math.floor(Math.random() * PHYSICS_OBJ_TYPES.length);
        nx = Math.random(); // Normalized x position (0-1)
        nvx = (Math.random() - 0.5) * 3;
        broadcastAdvancedAction('physics', { typeIdx: typeIdx, nx: nx, nvx: nvx });
    }

    if (typeIdx < 0 || typeIdx >= PHYSICS_OBJ_TYPES.length) return;
    var type = PHYSICS_OBJ_TYPES[typeIdx];

    var obj = {
        type: type,
        x: zone.left + nx * (zone.right - zone.left),
        y: zone.top,
        vx: nvx,
        vy: 0,
        age: 0,
        maxAge: 30000, // Despawn after 30s
        el: null
    };

    var el = document.createElement('div');
    el.className = 'buddy-physics-obj';
    el.textContent = type.emoji;
    el.style.cssText = 'position:fixed;left:' + obj.x + 'px;top:' + obj.y + 'px;font-size:18px;z-index:9990;pointer-events:none;transition:none;';
    document.body.appendChild(el);
    obj.el = el;
    physicsObjects.push(obj);
}

function updatePhysicsObjects(zone, names) {
    for (var i = physicsObjects.length - 1; i >= 0; i--) {
        var obj = physicsObjects[i];
        obj.age += BUDDY_CONFIG.updateInterval;

        // Remove expired objects
        if (obj.age > obj.maxAge) {
            if (obj.el) obj.el.remove();
            physicsObjects.splice(i, 1);
            continue;
        }

        // Apply gravity
        obj.vy += BUDDY_CONFIG.physicsObjGravity * obj.type.mass;
        obj.x += obj.vx;
        obj.y += obj.vy;

        // Bounce off boundaries
        if (obj.x <= zone.left) { obj.x = zone.left; obj.vx = Math.abs(obj.vx) * obj.type.bounce; }
        if (obj.x >= zone.right) { obj.x = zone.right; obj.vx = -Math.abs(obj.vx) * obj.type.bounce; }
        if (obj.y >= zone.absoluteBottom) {
            obj.y = zone.absoluteBottom;
            obj.vy = -Math.abs(obj.vy) * obj.type.bounce;
            obj.vx *= 0.95; // Friction
            if (Math.abs(obj.vy) < 0.5) obj.vy = 0; // Stop bouncing
        }
        if (obj.y <= zone.top) { obj.y = zone.top; obj.vy = Math.abs(obj.vy) * obj.type.bounce; }

        // Check buddy collisions - buddies kick objects
        for (var j = 0; j < names.length; j++) {
            var b = buddyCharacters[names[j]];
            if (!b || b.sleeping || b.isEgg) continue;
            var dx = obj.x - b.x;
            var dy = obj.y - b.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 30) {
                // Buddy kicks the object
                var kickForce = 3 + Math.random() * 2;
                obj.vx += (dx / Math.max(dist, 1)) * kickForce;
                obj.vy -= 2 + Math.random() * 3; // Kick upward
                showExpression(b, ['⚡', '🦶', '💨'][Math.floor(Math.random() * 3)]);
                // If multiple buddies near a ball, it's soccer time!
                var nearbyCount = 0;
                names.forEach(function(n) {
                    var other = buddyCharacters[n];
                    if (other && Math.sqrt(Math.pow(obj.x - other.x, 2) + Math.pow(obj.y - other.y, 2)) < 80) {
                        nearbyCount++;
                    }
                });
                if (nearbyCount >= 3 && !obj.soccerMode) {
                    obj.soccerMode = true;
                    obj.maxAge += 15000; // Extend lifetime during soccer
                    showExpression(b, '⚽');
                }
                break; // Only one buddy kicks per frame
            }
        }

        // Update position
        obj.el.style.left = obj.x + 'px';
        obj.el.style.top = obj.y + 'px';
    }
}

// ===== MULTI-BUDDY INTERACTIONS (#8) =====
function checkMultiBuddyInteraction(names) {
    if (names.length < 3) return false;
    if (!isInteractionMaster()) return false;

    // Find clusters of 3+ non-interacting buddies
    for (var i = 0; i < names.length; i++) {
        var b = buddyCharacters[names[i]];
        if (!b || b.interacting || b.interactCooldown > 0) continue;

        var cluster = [names[i]];
        for (var j = 0; j < names.length; j++) {
            if (i === j) continue;
            var other = buddyCharacters[names[j]];
            if (!other || other.interacting || other.interactCooldown > 0) continue;
            var dist = Math.sqrt(Math.pow(b.x - other.x, 2) + Math.pow(b.y - other.y, 2));
            if (dist < BUDDY_CONFIG.multiInteractDistance) {
                cluster.push(names[j]);
            }
        }

        if (cluster.length >= 3 && Math.random() < 0.02) {
            startGroupInteraction(cluster);
            return true;
        }
    }
    return false;
}

var GROUP_INTERACTIONS = ['huddle', 'groupDance', 'riot', 'summoning'];

function startGroupInteraction(participants, fromSync, syncedType) {
    var type = syncedType || GROUP_INTERACTIONS[Math.floor(Math.random() * GROUP_INTERACTIONS.length)];
    var center = { x: 0, y: 0 };
    participants.forEach(function(name) {
        var b = buddyCharacters[name];
        if (b) { center.x += b.x; center.y += b.y; b.interacting = true; }
    });
    center.x /= participants.length;
    center.y /= participants.length;

    // Broadcast to other clients (only if we initiated, not from sync)
    if (!fromSync) {
        broadcastAdvancedAction('group', {
            participants: participants,
            groupType: type,
            seed: Math.floor(Math.random() * 1000000)
        });
    }

    switch(type) {
        case 'huddle':
            startGroupHuddle(participants, center);
            break;
        case 'groupDance':
            startGroupDance(participants, center);
            break;
        case 'riot':
            startGroupRiot(participants, center);
            break;
        case 'summoning':
            startGroupSummoning(participants, center, fromSync);
            break;
    }

    // Track interactions for evolution
    participants.forEach(function(name) {
        trackInteraction(name);
    });

    buddyEventBus.emit('groupInteraction', { type: type, participants: participants, center: center });
}

function startGroupHuddle(participants, center) {
    // All buddies move to center and whisper
    var gz = getBuddyZone();
    participants.forEach(function(name, idx) {
        var b = buddyCharacters[name];
        if (!b) return;
        var angle = (idx / participants.length) * Math.PI * 2;
        b.x = center.x + Math.cos(angle) * 20;
        b.y = center.y + Math.sin(angle) * 15;
        clampToZone(b, gz);
        b.element.style.left = b.x + 'px';
        b.element.style.top = b.y + 'px';
        setAnim(b, 'idle');
    });
    var whispers = ['*whisper whisper*', 'psst...', 'did you hear?', 'no way!', 'shh!', 'really?!'];
    var delay = 0;
    participants.forEach(function(name, idx) {
        var b = buddyCharacters[name];
        if (!b) return;
        setTimeout(function() {
            showSpeechBubble(b, whispers[idx % whispers.length], 'shy');
        }, delay);
        delay += 800;
    });
    setTimeout(function() { endGroupInteraction(participants); }, 3000 + participants.length * 500);
}

function startGroupDance(participants, center) {
    participants.forEach(function(name) {
        var b = buddyCharacters[name];
        if (!b) return;
        b.element.classList.add('buddy-group-dance');
        showExpression(b, ['💃', '🕺', '🎵', '🎶'][Math.floor(Math.random() * 4)]);
    });
    // Animate circular dance
    var danceStart = Date.now();
    var danceInterval = setInterval(function() {
        var elapsed = Date.now() - danceStart;
        if (elapsed > 4000) {
            clearInterval(danceInterval);
            participants.forEach(function(name) {
                var b = buddyCharacters[name];
                if (b) b.element.classList.remove('buddy-group-dance');
            });
            endGroupInteraction(participants);
            return;
        }
        var dz = getBuddyZone();
        participants.forEach(function(name, idx) {
            var b = buddyCharacters[name];
            if (!b) return;
            var angle = (idx / participants.length) * Math.PI * 2 + elapsed / 500;
            var radius = 30 + Math.sin(elapsed / 300) * 10;
            b.x = center.x + Math.cos(angle) * radius;
            b.y = center.y + Math.sin(angle) * radius;
            clampToZone(b, dz);
            b.element.style.left = b.x + 'px';
            b.element.style.top = b.y + 'px';
        });
    }, 50);
}

function startGroupRiot(participants, center) {
    participants.forEach(function(name) {
        var b = buddyCharacters[name];
        if (b) {
            setAnim(b, 'fighting');
            showExpression(b, ['😤', '💢', '🔥', '💥'][Math.floor(Math.random() * 4)]);
        }
    });
    // Chaotic movement with effects flying everywhere
    var riotStart = Date.now();
    var riotInterval = setInterval(function() {
        var elapsed = Date.now() - riotStart;
        if (elapsed > 3000) {
            clearInterval(riotInterval);
            endGroupInteraction(participants);
            return;
        }
        var rz = getBuddyZone();
        participants.forEach(function(name) {
            var b = buddyCharacters[name];
            if (!b) return;
            b.x += (Math.random() - 0.5) * 8;
            b.y += (Math.random() - 0.5) * 6;
            clampToZone(b, rz);
            b.element.style.left = b.x + 'px';
            b.element.style.top = b.y + 'px';
        });
        // Random fight effects
        if (Math.random() < 0.3) {
            var rIdx = Math.floor(Math.random() * participants.length);
            var rb = buddyCharacters[participants[rIdx]];
            if (rb) {
                var move = FIGHT_MOVES[Math.floor(Math.random() * FIGHT_MOVES.length)];
                createFightEffect(rb.x, rb.y - 15, move.name, move.emoji, move.color);
            }
        }
    }, 50);
    // Everyone gets angry mood
    participants.forEach(function(name) { setBuddyMood(buddyCharacters[name], 'angry', 0.7); });
}

function startGroupSummoning(participants, center, fromSync) {
    // Form a circle and chant
    participants.forEach(function(name, idx) {
        var b = buddyCharacters[name];
        if (!b) return;
        var angle = (idx / participants.length) * Math.PI * 2;
        b.x = center.x + Math.cos(angle) * 35;
        b.y = center.y + Math.sin(angle) * 25;
        b.element.style.left = b.x + 'px';
        b.element.style.top = b.y + 'px';
    });
    // Create pentagram/circle effect
    var ritual = document.createElement('div');
    ritual.className = 'buddy-ritual-circle';
    ritual.style.cssText = 'position:fixed;left:' + (center.x - 40) + 'px;top:' + (center.y - 30) + 'px;width:80px;height:60px;z-index:9989;';
    ritual.textContent = '⭐';
    document.body.appendChild(ritual);

    var chants = ['ooga booga', 'Ph\'nglui!', 'ARISE!', '*chanting*', 'IA! IA!'];
    var delay = 0;
    participants.forEach(function(name, idx) {
        var b = buddyCharacters[name];
        if (!b) return;
        setTimeout(function() {
            showSpeechBubble(b, chants[idx % chants.length], 'shy');
            showExpression(b, '🔮');
        }, delay);
        delay += 600;
    });

    // Climax - summon a random object or effect
    setTimeout(function() {
        ritual.textContent = '💫';
        ritual.classList.add('buddy-ritual-burst');
        // Spawn a physics object as the summoned entity (master-only to prevent double-spawn)
        if (!fromSync) {
            var zone = getBuddyZone();
            spawnPhysicsObject(zone);
        }
        participants.forEach(function(name) {
            showExpression(buddyCharacters[name], '✨');
        });
    }, participants.length * 600 + 500);

    setTimeout(function() {
        ritual.remove();
        endGroupInteraction(participants);
    }, participants.length * 600 + 2500);
}

function endGroupInteraction(participants) {
    participants.forEach(function(name) {
        var b = buddyCharacters[name];
        if (b) {
            b.interacting = false;
            b.interactCooldown = 8000;
            b.state = 'idle';
            setAnim(b, 'idle');
        }
    });
}

// ===== CHAIN REACTIONS / SPECTATORS (#10) =====
function triggerChainReaction(eventType, center, participants) {
    var names = Object.keys(buddyCharacters);
    names.forEach(function(name) {
        if (participants.indexOf(name) !== -1) return; // Skip participants
        var b = buddyCharacters[name];
        if (!b || b.interacting || b.sleeping) return;

        var dist = Math.sqrt(Math.pow(b.x - center.x, 2) + Math.pow(b.y - center.y, 2));
        if (dist > BUDDY_CONFIG.chainReactionRadius) return;

        var p = PERSONALITIES[b.personality] || PERSONALITIES.playful;
        switch(eventType) {
            case 'fight':
            case 'riot':
                // Spectators gather and react
                if (p.fight > 0.2) {
                    showExpression(b, ['🍿', '👀', '📣'][Math.floor(Math.random() * 3)]);
                    showSpeechBubble(b, ['Fight! Fight!', 'Get em!', 'Ooooh!'][Math.floor(Math.random() * 3)], 'flirt');
                } else {
                    showExpression(b, '😨');
                    b.vx += (b.x > center.x ? 2 : -2);
                    setBuddyMood(b, 'scared', 0.3);
                }
                break;
            case 'kiss':
            case 'confess':
                if (p.kiss > 0.2) {
                    showExpression(b, ['😍', '🥹', '💕'][Math.floor(Math.random() * 3)]);
                } else {
                    showExpression(b, ['😳', '🙈', '👀'][Math.floor(Math.random() * 3)]);
                    // Look away embarrassed
                    b.element.classList.toggle('face-left');
                }
                break;
            case 'groupDance':
                // Nearby buddies start dancing too
                if (Math.random() < 0.4) {
                    showExpression(b, '🎵');
                    b.element.classList.add('buddy-group-dance');
                    setTimeout(function() { b.element.classList.remove('buddy-group-dance'); }, 3000);
                }
                break;
            case 'summoning':
                showExpression(b, ['😱', '🫣', '👁️'][Math.floor(Math.random() * 3)]);
                setBuddyMood(b, 'scared', 0.5);
                break;
            default:
                showExpression(b, '👀');
                break;
        }
    });
}

// Wire up chain reactions to events
buddyEventBus.on('groupInteraction', function(data) {
    triggerChainReaction(data.type, data.center, data.participants);
});

// ===== BUDDY JOBS (#11) =====
var BUDDY_JOBS = [
    {
        name: 'guard',
        emoji: '🛡️',
        description: 'Patrols the chat input',
        update: function(b, zone) {
            // Patrol near bottom of zone (near chat input)
            var patrolY = zone.absoluteBottom - 30;
            var patrolPhase = (Date.now() / 2000) % (Math.PI * 2);
            var targetX = zone.left + (zone.right - zone.left) * (0.3 + Math.sin(patrolPhase) * 0.2);
            b.x += (targetX - b.x) * 0.05;
            b.y += (patrolY - b.y) * 0.05;
            // Chase away buddies that come near
            Object.keys(buddyCharacters).forEach(function(name) {
                if (name === b.username) return;
                var other = buddyCharacters[name];
                if (!other || other.interacting) return;
                var dist = Math.sqrt(Math.pow(b.x - other.x, 2) + Math.pow(b.y - other.y, 2));
                if (dist < 40 && other.y > patrolY - 20) {
                    other.vx += (other.x > b.x ? 2 : -2);
                    other.vy -= 1;
                    if (Math.random() < 0.02) showSpeechBubble(b, 'No entry!', 'flirt');
                }
            });
        }
    },
    {
        name: 'messenger',
        emoji: '📩',
        description: 'Runs between two buddies',
        init: function(b) {
            var names = Object.keys(buddyCharacters).filter(function(n) { return n !== b.username; });
            if (names.length < 2) return false;
            b.jobData = {
                target1: names[Math.floor(Math.random() * names.length)],
                target2: names[Math.floor(Math.random() * names.length)],
                currentTarget: 0,
                deliveries: 0
            };
            if (b.jobData.target1 === b.jobData.target2) return false;
            return true;
        },
        update: function(b) {
            if (!b.jobData) return;
            var targetName = b.jobData.currentTarget === 0 ? b.jobData.target1 : b.jobData.target2;
            var target = buddyCharacters[targetName];
            if (!target) return;
            var dx = target.x - b.x;
            var dy = target.y - b.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            b.x += (dx / Math.max(dist, 1)) * 3;
            b.y += (dy / Math.max(dist, 1)) * 2;
            clampToZone(b, getBuddyZone());
            if (dist < 25) {
                // Delivered!
                b.jobData.currentTarget = 1 - b.jobData.currentTarget;
                b.jobData.deliveries++;
                showExpression(b, '📬');
                showSpeechBubble(target, 'Thanks!', 'shy');
                if (b.jobData.deliveries >= 4) b.jobTimer = 0; // Job done
            }
        }
    },
    {
        name: 'dj',
        emoji: '🎧',
        description: 'Bobs near the video player',
        update: function(b, zone) {
            // Sit near top-left (near video) and bob
            var targetX = zone.left + 10;
            var targetY = zone.top + 20;
            b.x += (targetX - b.x) * 0.03;
            b.y += (targetY - b.y) * 0.03;
            // Bob to the "beat"
            b.y += Math.sin(Date.now() / 300) * 0.5;
            if (Math.random() < 0.005) {
                showExpression(b, ['🎵', '🎶', '🎧', '🎤'][Math.floor(Math.random() * 4)]);
            }
        }
    },
    {
        name: 'janitor',
        emoji: '🧹',
        description: 'Sweeps across the bottom',
        update: function(b, zone) {
            if (!b.jobData) b.jobData = { dir: 1, sweepY: zone.absoluteBottom - 10 };
            b.y += (b.jobData.sweepY - b.y) * 0.1;
            b.x += b.jobData.dir * 1.5;
            if (b.x >= zone.right) b.jobData.dir = -1;
            if (b.x <= zone.left) b.jobData.dir = 1;
            updateFace(b);
            // Push nearby physics objects
            physicsObjects.forEach(function(obj) {
                if (Math.abs(obj.x - b.x) < 20 && Math.abs(obj.y - b.y) < 20) {
                    obj.vx += b.jobData.dir * 2;
                    obj.vy -= 1;
                }
            });
        }
    }
];

function assignBuddyJobs(names) {
    if (Date.now() - lastJobAssign < BUDDY_CONFIG.jobAssignInterval) return;
    lastJobAssign = Date.now();

    // Only master assigns jobs to prevent desync
    if (!isInteractionMaster()) return;

    // Only assign to idle, non-interacting buddies without jobs
    var available = names.filter(function(name) {
        var b = buddyCharacters[name];
        return b && !b.interacting && !b.job && !b.sleeping && !b.isEgg;
    });
    if (available.length === 0) return;

    // 20% chance to assign a job each interval
    if (Math.random() > 0.2) return;

    var lucky = available[Math.floor(Math.random() * available.length)];
    var b = buddyCharacters[lucky];
    var job = BUDDY_JOBS[Math.floor(Math.random() * BUDDY_JOBS.length)];

    // Some jobs need initialization
    if (job.init && !job.init(b)) return;

    b.job = job;
    b.jobTimer = BUDDY_CONFIG.jobDuration;
    showExpression(b, job.emoji);
    showSpeechBubble(b, 'Time for work!', 'flirt');
    b.element.classList.add('buddy-job-' + job.name);

    // Broadcast job assignment to other clients
    broadcastAdvancedAction('job', { worker: lucky, jobName: job.name });
}

function updateBuddyJobs(names, zone) {
    names.forEach(function(name) {
        var b = buddyCharacters[name];
        if (!b || !b.job) return;

        b.jobTimer -= BUDDY_CONFIG.updateInterval;
        if (b.jobTimer <= 0 || b.interacting) {
            // Job ended
            b.element.classList.remove('buddy-job-' + b.job.name);
            b.job = null;
            b.jobData = null;
            b.jobTimer = 0;
            return;
        }

        b.job.update(b, zone);
        b.element.style.left = b.x + 'px';
        b.element.style.top = b.y + 'px';
    });
}

// ===== PREDATOR/PREY ECOSYSTEM (#12) =====
var PREDATOR_TYPES = ['cat', 'fox', 'owl', 'dragon', 'witch', 'hero'];
var PREY_TYPES = ['chick', 'hatching', 'babychick', 'bunny', 'koala'];

function isBuddyPredator(b) {
    if (!b || !b.sprite) return false;
    return PREDATOR_TYPES.indexOf(b.sprite.name) !== -1;
}

function isBuddyPrey(b) {
    if (!b || !b.sprite) return false;
    return PREY_TYPES.indexOf(b.sprite.name) !== -1;
}

function checkPredatorPrey(names) {
    if (!isInteractionMaster()) return;

    for (var i = 0; i < names.length; i++) {
        var hunter = buddyCharacters[names[i]];
        if (!hunter || !isBuddyPredator(hunter) || hunter.interacting || hunter.isEgg) continue;
        if (hunter.interactCooldown > 0 || hunter.huntTarget) continue;

        for (var j = 0; j < names.length; j++) {
            if (i === j) continue;
            var prey = buddyCharacters[names[j]];
            if (!prey || !isBuddyPrey(prey) || prey.interacting || prey.isEgg) continue;
            if (prey.interactCooldown > 0) continue;

            var dist = Math.sqrt(Math.pow(hunter.x - prey.x, 2) + Math.pow(hunter.y - prey.y, 2));
            if (dist < BUDDY_CONFIG.predatorHuntRadius && Math.random() < 0.01) {
                startHunt(names[i], names[j]);
                return; // One hunt at a time
            }
        }
    }
}

function startHunt(predatorName, preyName, fromSync) {
    var hunter = buddyCharacters[predatorName];
    var prey = buddyCharacters[preyName];
    if (!hunter || !prey) return;

    // Broadcast to other clients if we initiated this hunt
    if (!fromSync) {
        broadcastAdvancedAction('hunt', { predator: predatorName, prey: preyName });
    }

    hunter.interacting = true;
    prey.interacting = true;
    hunter.huntTarget = preyName;
    prey.huntTarget = predatorName;
    setAnim(hunter, 'chasing');
    setAnim(prey, 'fleeing');
    showExpression(hunter, '😈');
    showExpression(prey, '😱');
    showSpeechBubble(prey, 'AAAH!', 'shy');
    setBuddyMood(hunter, 'happy', 0.6);
    setBuddyMood(prey, 'scared', 1.0);

    var zone = getBuddyZone();
    var huntStart = Date.now();
    var isMaster = isInteractionMaster();
    var huntEnded = false;

    var huntInterval = setInterval(function() {
        if (!buddyCharacters[predatorName] || !buddyCharacters[preyName] || huntEnded) {
            clearInterval(huntInterval);
            untrackBuddyInterval(hunter, huntInterval);
            untrackBuddyInterval(prey, huntInterval);
            return;
        }
        var elapsed = Date.now() - huntStart;

        // Prey flees
        var dx = prey.x - hunter.x;
        var dir = dx > 0 ? 1 : -1;
        prey.x += dir * BUDDY_CONFIG.preyFleeSpeed;
        prey.vx = dir * BUDDY_CONFIG.preyFleeSpeed;
        updateFace(prey);

        // Hunter chases
        hunter.x += dir * BUDDY_CONFIG.predatorChaseSpeed;
        hunter.vx = dir * BUDDY_CONFIG.predatorChaseSpeed;
        updateFace(hunter);

        // Bounds
        prey.x = Math.max(zone.left, Math.min(zone.right, prey.x));
        hunter.x = Math.max(zone.left, Math.min(zone.right, hunter.x));
        prey.element.style.left = prey.x + 'px';
        hunter.element.style.left = hunter.x + 'px';

        // Only master determines outcome and broadcasts it
        if (isMaster) {
            var dist = Math.abs(hunter.x - prey.x);

            // Catch check - close enough or guaranteed after 3s
            if (dist < 15 || (elapsed > 3000 && dist < 40)) {
                huntEnded = true;
                clearInterval(huntInterval);
                untrackBuddyInterval(hunter, huntInterval);
                untrackBuddyInterval(prey, huntInterval);
                // Broadcast outcome to all clients
                broadcastAdvancedAction('huntend', { predator: predatorName, prey: preyName, caught: true });
                endHunt(predatorName, preyName, true);
                return;
            }

            // Prey escapes after 4s
            if (elapsed > 4000) {
                huntEnded = true;
                clearInterval(huntInterval);
                untrackBuddyInterval(hunter, huntInterval);
                untrackBuddyInterval(prey, huntInterval);
                broadcastAdvancedAction('huntend', { predator: predatorName, prey: preyName, caught: false });
                endHunt(predatorName, preyName, false);
            }
        } else {
            // Non-master: safety timeout after 5s in case master broadcast missed
            if (elapsed > 5000) {
                huntEnded = true;
                clearInterval(huntInterval);
                untrackBuddyInterval(hunter, huntInterval);
                untrackBuddyInterval(prey, huntInterval);
                endHunt(predatorName, preyName, false);
            }
        }
    }, 50);
    trackBuddyInterval(hunter, huntInterval);
    trackBuddyInterval(prey, huntInterval);

    // Store huntEnded flag so synced huntend can stop the chase
    hunter._huntEnded = function() {
        huntEnded = true;
        clearInterval(huntInterval);
        untrackBuddyInterval(hunter, huntInterval);
        untrackBuddyInterval(prey, huntInterval);
    };
    prey._huntEnded = function() {
        huntEnded = true;
        clearInterval(huntInterval);
        untrackBuddyInterval(hunter, huntInterval);
        untrackBuddyInterval(prey, huntInterval);
    };
}

function endHunt(predatorName, preyName, caught, fromSync) {
    var hunter = buddyCharacters[predatorName];
    var prey = buddyCharacters[preyName];

    // Stop any running chase interval on this client
    if (hunter && hunter._huntEnded) { hunter._huntEnded(); hunter._huntEnded = null; }
    if (prey && prey._huntEnded) { prey._huntEnded(); prey._huntEnded = null; }

    if (hunter) {
        hunter.interacting = false;
        hunter.interactCooldown = 8000;
        hunter.huntTarget = null;
        hunter.state = 'idle';
        setAnim(hunter, 'idle');
    }

    if (caught && prey) {
        // Comedic eating animation
        showExpression(hunter, '😋');
        showSpeechBubble(hunter, '*nom nom*', 'flirt');
        // Prey becomes an egg
        prey.interacting = false;
        prey.interactCooldown = 0;
        prey.huntTarget = null;
        startEggRespawn(preyName);
        updateRelationship(predatorName, preyName, -15);
    } else if (prey) {
        // Prey escaped
        prey.interacting = false;
        prey.interactCooldown = 6000;
        prey.huntTarget = null;
        prey.state = 'idle';
        setAnim(prey, 'idle');
        showExpression(prey, '😮‍💨');
        showSpeechBubble(prey, 'Phew!', 'shy');
        updateRelationship(predatorName, preyName, -5);
    }

    trackInteraction(predatorName);
    trackInteraction(preyName);
}

function startEggRespawn(username) {
    var b = buddyCharacters[username];
    if (!b) return;

    b.isEgg = true;
    b.eggTimer = BUDDY_CONFIG.respawnEggDuration;
    b.interacting = true;
    b.vx = 0;
    b.vy = 0;

    // Drop egg from top
    var zone = getBuddyZone();
    b.y = zone.top;
    b.element.style.top = b.y + 'px';

    // Change sprite to egg
    var originalSprite = b.element.textContent.charAt(0);
    b.element.childNodes[0].textContent = '🥚';
    b.element.classList.add('buddy-egg');

    // Egg falls (tracked for cleanup)
    var eggFall = setInterval(function() {
        b.y += 2;
        if (b.y >= zone.absoluteBottom - 10) {
            b.y = zone.absoluteBottom - 10;
            clearInterval(eggFall);
            untrackBuddyInterval(b, eggFall);
        }
        b.element.style.top = b.y + 'px';
    }, 50);
    trackBuddyInterval(b, eggFall);

    // Hatch after timer (tracked for cleanup)
    var hatchTimeout = setTimeout(function() {
        if (!buddyCharacters[username]) return;
        b.isEgg = false;
        b.interacting = false;
        b.eggTimer = 0;
        b._stuckTimer = 0;
        if (b.sprite) {
            b.element.childNodes[0].textContent = b.sprite.body;
        }
        b.element.classList.remove('buddy-egg');
        b.element.classList.add('buddy-hatching');
        showExpression(b, '🐣');
        b.state = 'idle';
        b.stateTime = 0;
        setTimeout(function() { b.element.classList.remove('buddy-hatching'); }, 1000);
    }, BUDDY_CONFIG.respawnEggDuration);
    trackBuddyTimeout(b, hatchTimeout);
}

// ===== BUDDY DRAG & DROP =====
// State for active drags (keyed by buddy username)
var buddyDragState = {};

// Throttle helper: returns true if enough time has passed since last call
var _dragBroadcastTimers = {};
function canBroadcastDrag(buddyName) {
    var now = Date.now();
    // Throttle drag broadcasts to ~10 FPS (100ms) - was 15 FPS (66ms)
    if (!_dragBroadcastTimers[buddyName] || now - _dragBroadcastTimers[buddyName] >= 100) {
        _dragBroadcastTimers[buddyName] = now;
        return true;
    }
    return false;
}

// Create the visual ring + label elements for a drag
function createDragHighlight(buddyName, draggerName) {
    removeDragHighlight(buddyName);
    var ring = document.createElement('div');
    ring.className = 'buddy-drag-ring';
    ring.id = 'buddy-drag-ring-' + buddyName;
    document.body.appendChild(ring);

    var label = document.createElement('div');
    label.className = 'buddy-drag-label';
    label.id = 'buddy-drag-label-' + buddyName;
    label.textContent = draggerName + ' is moving...';
    document.body.appendChild(label);
    return { ring: ring, label: label };
}

// Update ring + label position around a buddy
function updateDragHighlight(buddyName, x, y, size) {
    var ring = document.getElementById('buddy-drag-ring-' + buddyName);
    var label = document.getElementById('buddy-drag-label-' + buddyName);
    if (!ring || !label) return;
    var padding = 10;
    var ringSize = size + padding * 2;
    ring.style.width = ringSize + 'px';
    ring.style.height = ringSize + 'px';
    ring.style.left = (x - padding) + 'px';
    ring.style.top = (y - padding) + 'px';
    label.style.left = (x + size / 2) + 'px';
    label.style.top = (y + size + 8) + 'px';
    label.style.transform = 'translateX(-50%)';
}

// Remove drag highlight elements
function removeDragHighlight(buddyName) {
    var ring = document.getElementById('buddy-drag-ring-' + buddyName);
    var label = document.getElementById('buddy-drag-label-' + buddyName);
    if (ring) ring.remove();
    if (label) label.remove();
}

// Get the pixel size of a buddy element
function getBuddyPixelSize(b) {
    if (!b || !b.element) return 24;
    return b.element.offsetWidth || parseFloat(b.element.style.fontSize) || 24;
}

// Broadcast drag events via WebSocket
function broadcastDragStart(buddyName) {
    if (!syncEnabled) return;
    var zone = getBuddyZone();
    var b = buddyCharacters[buddyName];
    if (!b) return;
    var zoneW = Math.max(1, zone.right - zone.left);
    var zoneH = Math.max(1, zone.absoluteBottom - zone.top);
    wsSend('drag-start', {
        target: buddyName,
        dragger: getMyUsername(),
        x: ((b.x - zone.left) / zoneW).toFixed(4),
        y: ((b.y - zone.top) / zoneH).toFixed(4)
    });
}

function broadcastDragMove(buddyName, nx, ny) {
    if (!syncEnabled) return;
    if (!canBroadcastDrag(buddyName)) return;
    wsSend('drag-move', {
        target: buddyName,
        dragger: getMyUsername(),
        x: nx.toFixed(4),
        y: ny.toFixed(4)
    });
}

function broadcastDragEnd(buddyName, nx, ny) {
    if (!syncEnabled) return;
    wsSend('drag-end', {
        target: buddyName,
        dragger: getMyUsername(),
        x: nx.toFixed(4),
        y: ny.toFixed(4)
    });
    delete _dragBroadcastTimers[buddyName];
}

// ---- Local drag handlers (attached to buddy elements) ----

function initBuddyDrag(el, username) {
    var dragging = false;
    var offsetX = 0;
    var offsetY = 0;
    var startX = 0;
    var startY = 0;
    var moved = false;

    function onPointerDown(e) {
        // Only primary button (left click) or touch
        if (e.button && e.button !== 0) return;
        var b = buddyCharacters[username];
        if (!b) return;
        // Don't start drag if another user is already dragging this buddy
        if (buddyDragState[username] && buddyDragState[username].dragger !== getMyUsername()) return;

        e.preventDefault();
        e.stopPropagation();

        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;
        offsetX = clientX - b.x;
        offsetY = clientY - b.y;
        startX = clientX;
        startY = clientY;
        moved = false;
        dragging = true;

        // Mark buddy as being dragged
        b.dragging = true;
        b.draggedBy = getMyUsername();
        buddyDragState[username] = { dragger: getMyUsername(), local: true };
        el.classList.add('buddy-being-dragged');

        var size = getBuddyPixelSize(b);
        createDragHighlight(username, getMyUsername());
        updateDragHighlight(username, b.x, b.y, size);
        broadcastDragStart(username);

        document.addEventListener('mousemove', onPointerMove, { passive: false });
        document.addEventListener('mouseup', onPointerUp);
        document.addEventListener('touchmove', onPointerMove, { passive: false });
        document.addEventListener('touchend', onPointerUp);
        document.addEventListener('touchcancel', onPointerUp);
    }

    function onPointerMove(e) {
        if (!dragging) return;
        e.preventDefault();
        var b = buddyCharacters[username];
        if (!b) { onPointerUp(); return; }

        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // Detect if actually moved (3px dead zone to allow clicks)
        if (!moved && (Math.abs(clientX - startX) > 3 || Math.abs(clientY - startY) > 3)) {
            moved = true;
        }
        if (!moved) return;

        var zone = getBuddyZone();
        var newX = clientX - offsetX;
        var newY = clientY - offsetY;

        // Clamp within zone
        newX = Math.max(zone.left, Math.min(zone.right, newX));
        newY = Math.max(zone.top, Math.min(zone.absoluteBottom, newY));

        b.x = newX;
        b.y = newY;
        b.vx = 0;
        b.vy = 0;
        el.style.left = newX + 'px';
        el.style.top = newY + 'px';

        var size = getBuddyPixelSize(b);
        updateDragHighlight(username, newX, newY, size);

        // Broadcast normalized position
        var zoneW = Math.max(1, zone.right - zone.left);
        var zoneH = Math.max(1, zone.absoluteBottom - zone.top);
        broadcastDragMove(username, (newX - zone.left) / zoneW, (newY - zone.top) / zoneH);
    }

    function onPointerUp(e) {
        if (!dragging) return;
        dragging = false;

        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('mouseup', onPointerUp);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('touchend', onPointerUp);
        document.removeEventListener('touchcancel', onPointerUp);

        var b = buddyCharacters[username];
        if (b) {
            b.dragging = false;
            b.draggedBy = null;
            b.state = 'idle';
            b.stateTime = 0;
            b.vx = 0;
            b.vy = 0;
            el.classList.remove('buddy-being-dragged');
            setAnim(b, 'idle');

            // Broadcast final position
            var zone = getBuddyZone();
            var zoneW = Math.max(1, zone.right - zone.left);
            var zoneH = Math.max(1, zone.absoluteBottom - zone.top);
            broadcastDragEnd(username, (b.x - zone.left) / zoneW, (b.y - zone.top) / zoneH);
        }

        removeDragHighlight(username);
        delete buddyDragState[username];

        // If didn't actually move, treat as click (excited reaction)
        if (!moved && b && b.state !== 'jumping' && !b.interacting) {
            b.element.classList.add('buddy-excited');
            showExpression(b, '😊');
            setTimeout(function() { if (b.element) b.element.classList.remove('buddy-excited'); }, 600);
        }
    }

    el.addEventListener('mousedown', onPointerDown);
    el.addEventListener('touchstart', onPointerDown, { passive: false });
}

// ---- Receive drag events from other users via Pusher ----

function handlePusherDragStart(data) {
    var buddyName = data.target;
    var dragger = data.dragger;
    if (!buddyName || !dragger) return;

    var b = buddyCharacters[buddyName];
    if (!b) return;

    // Mark buddy as being dragged by remote user
    b.dragging = true;
    b.draggedBy = dragger;
    buddyDragState[buddyName] = { dragger: dragger, local: false };
    b.element.classList.add('buddy-being-dragged');

    var size = getBuddyPixelSize(b);
    createDragHighlight(buddyName, dragger);
    updateDragHighlight(buddyName, b.x, b.y, size);
}

function handlePusherDragMove(data) {
    var buddyName = data.target;
    if (!buddyName) return;
    var b = buddyCharacters[buddyName];
    if (!b) return;

    var zone = getBuddyZone();
    var zoneW = Math.max(1, zone.right - zone.left);
    var zoneH = Math.max(1, zone.absoluteBottom - zone.top);
    var newX = zone.left + parseFloat(data.x) * zoneW;
    var newY = zone.top + parseFloat(data.y) * zoneH;

    b.x = newX;
    b.y = newY;
    b.vx = 0;
    b.vy = 0;
    b.element.style.left = newX + 'px';
    b.element.style.top = newY + 'px';

    var size = getBuddyPixelSize(b);
    updateDragHighlight(buddyName, newX, newY, size);
}

function handlePusherDragEnd(data) {
    var buddyName = data.target;
    if (!buddyName) return;
    var b = buddyCharacters[buddyName];
    if (b) {
        // Apply final position
        var zone = getBuddyZone();
        var zoneW = Math.max(1, zone.right - zone.left);
        var zoneH = Math.max(1, zone.absoluteBottom - zone.top);
        b.x = zone.left + parseFloat(data.x) * zoneW;
        b.y = zone.top + parseFloat(data.y) * zoneH;
        b.vx = 0;
        b.vy = 0;
        b.element.style.left = b.x + 'px';
        b.element.style.top = b.y + 'px';

        b.dragging = false;
        b.draggedBy = null;
        b.state = 'idle';
        b.stateTime = 0;
        b.element.classList.remove('buddy-being-dragged');
        setAnim(b, 'idle');
    }

    removeDragHighlight(buddyName);
    delete buddyDragState[buddyName];
}

// ===== BUDDY ZONE CONTAINMENT ON RESIZE =====
var _buddyResizeTimer = null;

function returnBuddiesToZone() {
    var zone = getBuddyZone();
    var names = Object.keys(buddyCharacters);
    names.forEach(function(name) {
        var b = buddyCharacters[name];
        if (!b) return;
        // Don't move buddies being dragged
        if (b.dragging) return;

        var outOfBounds = b.x < zone.left || b.x > zone.right ||
                          b.y < zone.top || b.y > zone.absoluteBottom;

        if (outOfBounds) {
            // Smooth transition back into zone
            b.element.classList.add('buddy-returning');

            var newX = Math.max(zone.left, Math.min(zone.right, b.x));
            var newY = Math.max(zone.top, Math.min(zone.absoluteBottom, b.y));

            b.x = newX;
            b.y = newY;
            b.vx = 0;
            b.vy = 0;
            b.element.style.left = newX + 'px';
            b.element.style.top = newY + 'px';

            // Remove transition class after animation completes
            setTimeout(function() {
                if (b.element) b.element.classList.remove('buddy-returning');
            }, 450);
        }
    });
}

function initBuddyResizeContainment() {
    window.addEventListener('resize', function() {
        clearTimeout(_buddyResizeTimer);
        _buddyResizeTimer = setTimeout(returnBuddiesToZone, 200);
    });

    window.addEventListener('orientationchange', function() {
        clearTimeout(_buddyResizeTimer);
        _buddyResizeTimer = setTimeout(returnBuddiesToZone, 300);
    });
}

// ===== EVOLVING ANIMATIONS (#14) =====
function trackInteraction(username) {
    if (!buddyEvolutionData[username]) {
        buddyEvolutionData[username] = { interactions: 0, tier: 0 };
    }
    buddyEvolutionData[username].interactions++;

    var data = buddyEvolutionData[username];
    var newTier = Math.min(3, Math.floor(data.interactions / BUDDY_CONFIG.evolutionThreshold));

    if (newTier > data.tier) {
        data.tier = newTier;
        applyEvolutionTier(username, newTier);
        // Broadcast tier change to other clients (master-only to prevent duplicate broadcasts)
        if (isInteractionMaster()) {
            broadcastAdvancedAction('evolve', { username: username, tier: newTier });
        }
    }
}

function applyEvolutionTier(username, tier) {
    var b = buddyCharacters[username];
    if (!b) return;

    // Remove old tier classes
    b.element.classList.remove('buddy-evo-1', 'buddy-evo-2', 'buddy-evo-3');
    b.evolutionTier = tier;

    if (tier > 0) {
        b.element.classList.add('buddy-evo-' + tier);
        var effects = [null, '⭐', '👑', '🌟'];
        showExpression(b, effects[tier]);
        showSpeechBubble(b, ['', 'Level up!', 'Power grows!', 'ULTIMATE!'][tier], 'flirt');
    }
}

function getEvolutionSpeedBonus(username) {
    var data = buddyEvolutionData[username];
    if (!data) return 1;
    return 1 + data.tier * 0.1; // 10% per tier
}

// ===== MASTER UPDATE HOOK =====
// Called from the update loop every tick to run all advanced systems
function updateAdvancedBuddySystems(names, zone) {
    // Mood decay for all buddies
    names.forEach(function(name) {
        var b = buddyCharacters[name];
        if (b) decayBuddyMood(b);
    });

    // Chat energy decay
    updateChatEnergy();

    // Check sleep state
    checkSleepState();

    // Flocking / social gravity
    applyFlockingForces(names);

    // Video sync check
    checkVideoSync();

    // Rescan UI surfaces periodically
    if (Date.now() - lastSurfaceScan > BUDDY_CONFIG.surfaceScanInterval) {
        scanUISurfaces();
    }

    // Physics objects - only master spawns to prevent desync
    if (isInteractionMaster() && Date.now() - lastPhysicsSpawn > BUDDY_CONFIG.physicsObjSpawnInterval) {
        lastPhysicsSpawn = Date.now();
        if (Math.random() < BUDDY_CONFIG.physicsObjChance) {
            spawnPhysicsObject(zone);
        }
    }
    updatePhysicsObjects(zone, names);

    // Buddy jobs
    assignBuddyJobs(names);
    updateBuddyJobs(names, zone);

    // Multi-buddy interactions (checked less frequently)
    if (Math.random() < 0.1) {
        checkMultiBuddyInteraction(names);
    }

    // Predator/prey
    checkPredatorPrey(names);

    // Save relationships periodically (every ~30s)
    if (Math.random() < 0.001) saveRelationships();

    // Position correction broadcast (master only, every 5s via Pusher)
    broadcastPositionCorrection();
}

// ===== INTERACTION HOOKS =====
// These wrap existing end functions to add relationship/mood/chain reaction updates

function onInteractionEnd(type, n1, n2) {
    // Update relationships
    switch(type) {
        case 'kiss':
            updateRelationship(n1, n2, 10);
            setBuddyMood(buddyCharacters[n1], 'lovestruck', 0.8);
            setBuddyMood(buddyCharacters[n2], 'lovestruck', 0.8);
            break;
        case 'confess':
            updateRelationship(n1, n2, 8);
            setBuddyMood(buddyCharacters[n1], 'happy', 0.7);
            setBuddyMood(buddyCharacters[n2], 'happy', 0.6);
            break;
        case 'fight':
            updateRelationship(n1, n2, -8);
            setBuddyMood(buddyCharacters[n1], 'angry', 0.7);
            setBuddyMood(buddyCharacters[n2], 'angry', 0.7);
            shiftTerritory(n1, n2); // Winner expands
            break;
        case 'chase':
            updateRelationship(n1, n2, 2);
            setBuddyMood(buddyCharacters[n1], 'happy', 0.4);
            setBuddyMood(buddyCharacters[n2], 'scared', 0.3);
            break;
        case 'flee':
            updateRelationship(n1, n2, -3);
            setBuddyMood(buddyCharacters[n1], 'scared', 0.5);
            setBuddyMood(buddyCharacters[n2], 'scared', 0.5);
            break;
        case 'conversation':
            updateRelationship(n1, n2, 5);
            setBuddyMood(buddyCharacters[n1], 'happy', 0.3);
            setBuddyMood(buddyCharacters[n2], 'happy', 0.3);
            break;
    }

    // Track evolution
    trackInteraction(n1);
    trackInteraction(n2);

    // Trigger chain reactions for nearby spectators
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (b1 && b2) {
        var center = { x: (b1.x + b2.x) / 2, y: (b1.y + b2.y) / 2 };
        triggerChainReaction(type, center, [n1, n2]);
    }
}

// ===== RELATIONSHIP-MODIFIED INTERACTIONS =====
function getRelationshipInteractionModifier(n1, n2) {
    var tier = getRelationshipTier(n1, n2);
    switch(tier) {
        case 'soulmates':
            return { kissBonus: 0.3, fightPenalty: -0.2, uniqueChance: 0.1 };
        case 'friends':
            return { kissBonus: 0.1, fightPenalty: -0.1, uniqueChance: 0.05 };
        case 'rivals':
            return { kissBonus: -0.1, fightPenalty: 0.15, uniqueChance: 0.03 };
        case 'enemies':
            return { kissBonus: -0.2, fightPenalty: 0.3, uniqueChance: 0.05 };
        default:
            return { kissBonus: 0, fightPenalty: 0, uniqueChance: 0 };
    }
}

// Initialize advanced systems
function initAdvancedBuddySystems() {
    loadRelationships();
    scanUISurfaces();
    lastChatTimestamp = Date.now();
    lastPhysicsSpawn = Date.now();
    lastJobAssign = Date.now();

    // Hook into chat messages for energy tracking
    if (typeof socket !== 'undefined') {
        try {
            socket.on('chatMsg', function(data) {
                if (data && data.msg) {
                    onChatMessage(data.msg, data.username);
                }
            });
        } catch(e) {}
    }
}

// ========== VIDEO DRAWING TOOL ==========

var drawingState = {
    sessionActive: false,       // Is a drawing session in progress
    isDrawing: false,           // Currently drawing a stroke (mouse down + Alt held)
    currentStroke: [],          // Points in current stroke
    sessionId: null,            // Unique session ID for this drawing
    clearTimeout: null,         // Timer for clearing after Alt release
    keysHeld: false,            // Is Alt currently held
    brushSize: 'medium',        // small, medium, large
    brushColor: '#ffffff'       // Current color
};

// Drawing settings (saved to localStorage)
var DRAWING_SETTINGS_KEY = 'drawingToolSettings';
var drawingSettings = {
    brushSize: 'medium',
    brushColor: '#ffffff'
};

// Brush sizes as percentage of video height
var DRAW_BRUSH_SIZES = {
    small: 0.005,    // 0.5% of video height
    medium: 0.015,   // 1.5% of video height
    large: 0.03      // 3% of video height
};

// MSPaint-style color palette
var DRAW_COLOR_PALETTE = [
    '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
    '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff',
    '#ff8080', '#80ff80', '#8080ff', '#ff80ff', '#80ffff', '#ffff80', '#ff8000', '#ff0080'
];

var DRAW_CLEAR_DELAY = 8000; // 8 seconds after Alt release

// Load drawing settings from localStorage
function loadDrawingSettings() {
    try {
        var saved = localStorage.getItem(DRAWING_SETTINGS_KEY);
        if (saved) {
            var parsed = JSON.parse(saved);
            drawingSettings.brushSize = parsed.brushSize || 'medium';
            drawingSettings.brushColor = parsed.brushColor || '#ffffff';
        }
    } catch (e) {
        console.log('[Drawing] Failed to load settings:', e);
    }
}

// Save drawing settings to localStorage
function saveDrawingSettings() {
    try {
        localStorage.setItem(DRAWING_SETTINGS_KEY, JSON.stringify(drawingSettings));
    } catch (e) {
        console.log('[Drawing] Failed to save settings:', e);
    }
}

// Inject drawing CSS
function injectDrawingCSS() {
    if (document.getElementById('drawing-tool-css')) return;
    var css = document.createElement('style');
    css.id = 'drawing-tool-css';
    css.textContent = `
        /* Drawing settings popup */
        #drawing-settings-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #drawing-settings-popup {
            background: #1a1a1a;
            border: 1px solid #444;
            border-radius: 8px;
            width: 320px;
            max-width: 90vw;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        #drawing-settings-popup .popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: #252525;
            border-bottom: 1px solid #333;
            border-radius: 8px 8px 0 0;
            cursor: move;
        }
        #drawing-settings-popup .popup-header span {
            font-weight: bold;
            color: #fff;
        }
        #drawing-settings-popup .popup-close {
            background: none;
            border: none;
            color: #888;
            font-size: 20px;
            cursor: pointer;
            padding: 0 4px;
        }
        #drawing-settings-popup .popup-close:hover {
            color: #fff;
        }
        #drawing-settings-popup .popup-content {
            padding: 16px;
        }
        .drawing-section {
            margin-bottom: 16px;
        }
        .drawing-section:last-child {
            margin-bottom: 0;
        }
        .drawing-section h4 {
            color: #aaa;
            font-size: 12px;
            margin: 0 0 8px 0;
            text-transform: uppercase;
        }
        .drawing-brush-sizes {
            display: flex;
            gap: 8px;
            justify-content: center;
        }
        .drawing-brush-btn {
            width: 48px;
            height: 48px;
            border: 2px solid #555;
            border-radius: 50%;
            background: #2a2a2a;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: border-color 0.2s, background 0.2s;
        }
        .drawing-brush-btn.active {
            border-color: #fff;
            background: #444;
        }
        .drawing-brush-btn:hover {
            border-color: #888;
        }
        .drawing-brush-dot {
            background: #fff;
            border-radius: 50%;
        }
        .drawing-brush-btn[data-size="small"] .drawing-brush-dot {
            width: 8px;
            height: 8px;
        }
        .drawing-brush-btn[data-size="medium"] .drawing-brush-dot {
            width: 16px;
            height: 16px;
        }
        .drawing-brush-btn[data-size="large"] .drawing-brush-dot {
            width: 28px;
            height: 28px;
        }
        .drawing-color-palette {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 4px;
        }
        .drawing-color-btn {
            width: 100%;
            aspect-ratio: 1;
            border: 2px solid #333;
            border-radius: 4px;
            cursor: pointer;
            padding: 0;
            transition: border-color 0.2s, transform 0.1s;
        }
        .drawing-color-btn.active {
            border-color: #fff;
            box-shadow: 0 0 6px rgba(255,255,255,0.5);
            transform: scale(1.1);
        }
        .drawing-color-btn:hover {
            border-color: #888;
        }
        .drawing-preview {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: #111;
            border-radius: 6px;
            min-height: 60px;
        }
        .drawing-preview-dot {
            border-radius: 50%;
        }
        .drawing-instructions {
            background: #252525;
            border-radius: 6px;
            padding: 12px;
            margin-top: 16px;
            border: 1px solid #333;
        }
        .drawing-instructions p {
            margin: 0;
            color: #aaa;
            font-size: 12px;
            line-height: 1.5;
        }
        .drawing-instructions kbd {
            background: #333;
            border: 1px solid #555;
            border-radius: 3px;
            padding: 2px 6px;
            font-family: monospace;
            color: #fff;
        }
        /* Drawing canvas (for user's own strokes) */
        #drawing-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
        }
        /* Receiver canvas for other users' strokes */
        #drawing-receiver-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999;
        }
        /* Transparent interaction overlay - captures mouse when Alt held */
        #drawing-interaction-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1001;
            pointer-events: none;
            cursor: default;
        }
        #drawing-interaction-overlay.active {
            pointer-events: auto;
            cursor: crosshair;
        }
    `;
    document.head.appendChild(css);
}

// Create drawing settings popup
function createDrawingSettingsPopup() {
    if (document.getElementById('drawing-settings-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'drawing-settings-overlay';
    overlay.onclick = function(e) { if (e.target === overlay) closeDrawingSettingsPopup(); };

    var popup = document.createElement('div');
    popup.id = 'drawing-settings-popup';

    // Build color palette buttons
    var colorBtns = DRAW_COLOR_PALETTE.map(function(color) {
        var isActive = drawingSettings.brushColor === color ? ' active' : '';
        return '<button class="drawing-color-btn' + isActive + '" data-color="' + color + '" style="background:' + color + '"></button>';
    }).join('');

    popup.innerHTML =
        '<div class="popup-header" id="drawing-popup-header">' +
            '<span>🖌️ Drawing Settings</span>' +
            '<button class="popup-close" onclick="closeDrawingSettingsPopup()">×</button>' +
        '</div>' +
        '<div class="popup-content">' +
            '<div class="drawing-section">' +
                '<h4>Brush Size</h4>' +
                '<div class="drawing-brush-sizes">' +
                    '<button class="drawing-brush-btn' + (drawingSettings.brushSize === 'small' ? ' active' : '') + '" data-size="small" title="Small">' +
                        '<div class="drawing-brush-dot"></div>' +
                    '</button>' +
                    '<button class="drawing-brush-btn' + (drawingSettings.brushSize === 'medium' ? ' active' : '') + '" data-size="medium" title="Medium">' +
                        '<div class="drawing-brush-dot"></div>' +
                    '</button>' +
                    '<button class="drawing-brush-btn' + (drawingSettings.brushSize === 'large' ? ' active' : '') + '" data-size="large" title="Large">' +
                        '<div class="drawing-brush-dot"></div>' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="drawing-section">' +
                '<h4>Color</h4>' +
                '<div class="drawing-color-palette">' + colorBtns + '</div>' +
            '</div>' +
            '<div class="drawing-section">' +
                '<h4>Preview</h4>' +
                '<div class="drawing-preview">' +
                    '<div class="drawing-preview-dot" id="drawing-preview-dot"></div>' +
                '</div>' +
            '</div>' +
            '<div class="drawing-instructions">' +
                '<p>Hold <kbd>Alt</kbd> and draw on the video.<br>Drawing clears 8 seconds after releasing Alt.</p>' +
            '</div>' +
        '</div>';

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Make draggable
    makeDraggable(popup, document.getElementById('drawing-popup-header'));

    // Attach event listeners
    popup.querySelectorAll('.drawing-brush-btn').forEach(function(btn) {
        btn.onclick = function() { selectDrawingBrushSize(btn.dataset.size); };
    });

    popup.querySelectorAll('.drawing-color-btn').forEach(function(btn) {
        btn.onclick = function() { selectDrawingColor(btn.dataset.color); };
    });

    updateDrawingPreview();
}

// Update the preview dot
function updateDrawingPreview() {
    var dot = document.getElementById('drawing-preview-dot');
    if (!dot) return;

    var sizes = { small: 12, medium: 24, large: 40 };
    var size = sizes[drawingSettings.brushSize] || 24;

    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    dot.style.background = drawingSettings.brushColor;
}

// Select brush size in popup
function selectDrawingBrushSize(size) {
    drawingSettings.brushSize = size;
    saveDrawingSettings();

    document.querySelectorAll('#drawing-settings-popup .drawing-brush-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.size === size);
    });

    updateDrawingPreview();
}

// Select color in popup
function selectDrawingColor(color) {
    drawingSettings.brushColor = color;
    saveDrawingSettings();

    document.querySelectorAll('#drawing-settings-popup .drawing-color-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.color === color);
    });

    updateDrawingPreview();
}

// Toggle drawing settings popup
function toggleDrawingOverlay() {
    var overlay = document.getElementById('drawing-settings-overlay');
    if (overlay) {
        closeDrawingSettingsPopup();
    } else {
        openDrawingSettingsPopup();
    }
}

// Open drawing settings popup
function openDrawingSettingsPopup() {
    if (!syncEnabled) {
        alert('Drawing requires WebSocket sync to be configured. Set SYNC_WS_URL in channel settings.');
        return;
    }
    createDrawingSettingsPopup();
}

// Close drawing settings popup
function closeDrawingSettingsPopup() {
    var overlay = document.getElementById('drawing-settings-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// ========== ALT KEY DRAWING ==========

// Create drawing canvas for local user's strokes
function createDrawingCanvas() {
    var videoContainer = document.getElementById('videowrap');
    if (!videoContainer) return null;

    videoContainer.style.position = 'relative';

    var canvas = document.getElementById('drawing-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'drawing-canvas';
        videoContainer.appendChild(canvas);
    }

    resizeDrawingCanvas();
    return canvas;
}

// Create receiver canvas for other users' drawings
function createReceiverCanvas() {
    var videoContainer = document.getElementById('videowrap');
    if (!videoContainer) return null;

    videoContainer.style.position = 'relative';

    var canvas = document.getElementById('drawing-receiver-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'drawing-receiver-canvas';
        videoContainer.appendChild(canvas);
    }

    resizeReceiverCanvas();
    return canvas;
}

// Create transparent interaction overlay (captures mouse events over video/iframe)
function createDrawingInteractionOverlay() {
    var videoContainer = document.getElementById('videowrap');
    if (!videoContainer) return null;

    videoContainer.style.position = 'relative';

    var overlay = document.getElementById('drawing-interaction-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'drawing-interaction-overlay';
        videoContainer.appendChild(overlay);

        // Attach mouse event listeners to the overlay
        overlay.addEventListener('mousedown', onDrawingMouseDown);
        overlay.addEventListener('mousemove', onDrawingMouseMove);
        overlay.addEventListener('mouseup', onDrawingMouseUp);
        overlay.addEventListener('mouseleave', onDrawingMouseUp);
    }

    return overlay;
}

// Show the interaction overlay (when Alt is held)
function showDrawingOverlay() {
    var overlay = document.getElementById('drawing-interaction-overlay');
    if (!overlay) {
        overlay = createDrawingInteractionOverlay();
    }
    if (overlay) {
        overlay.classList.add('active');
    }
}

// Hide the interaction overlay (when Alt is released)
function hideDrawingOverlay() {
    var overlay = document.getElementById('drawing-interaction-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

function resizeDrawingCanvas() {
    var canvas = document.getElementById('drawing-canvas');
    if (!canvas) return;

    var videoContainer = document.getElementById('videowrap');
    if (!videoContainer) return;

    canvas.width = videoContainer.offsetWidth;
    canvas.height = videoContainer.offsetHeight;
}

function resizeReceiverCanvas() {
    var canvas = document.getElementById('drawing-receiver-canvas');
    if (!canvas) return;

    var videoContainer = document.getElementById('videowrap');
    if (!videoContainer) return;

    canvas.width = videoContainer.offsetWidth;
    canvas.height = videoContainer.offsetHeight;
}

// Get relative coordinates (0-1) from mouse event on the overlay
function getDrawingRelativeCoords(e) {
    var overlay = document.getElementById('drawing-interaction-overlay');
    if (!overlay) return null;

    var rect = overlay.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height
    };
}

// Start a drawing session (when Alt pressed and drawing begins)
function startDrawingSession() {
    if (drawingState.sessionActive) return;

    // Cancel any pending clear timer
    if (drawingState.clearTimeout) {
        clearTimeout(drawingState.clearTimeout);
        drawingState.clearTimeout = null;
        console.log('[Drawing] Clear timer cancelled - continuing session');
    }

    drawingState.sessionActive = true;
    drawingState.sessionId = getMyUsername() + '_' + Date.now();

    console.log('[Drawing] Session started:', drawingState.sessionId);
}

// Schedule drawing clear (called when Alt is released)
function scheduleClearDrawing() {
    // Only schedule if there's an active session
    if (!drawingState.sessionActive) return;

    // Cancel any existing timer
    if (drawingState.clearTimeout) {
        clearTimeout(drawingState.clearTimeout);
    }

    console.log('[Drawing] Alt released - clearing in 8 seconds...');

    drawingState.clearTimeout = setTimeout(function() {
        clearDrawingSession();
    }, DRAW_CLEAR_DELAY);
}

// Clear the drawing session (called after 8 second delay)
function clearDrawingSession() {
    drawingState.clearTimeout = null;

    // Broadcast clear
    broadcastDrawingClear();

    // Clear local canvas (own strokes)
    var canvas = document.getElementById('drawing-canvas');
    if (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Clear receiver canvas (other users' strokes)
    var receiverCanvas = document.getElementById('drawing-receiver-canvas');
    if (receiverCanvas) {
        var rctx = receiverCanvas.getContext('2d');
        rctx.clearRect(0, 0, receiverCanvas.width, receiverCanvas.height);
    }

    drawingState.sessionActive = false;
    drawingState.isDrawing = false;
    drawingState.currentStroke = [];

    console.log('[Drawing] Session cleared:', drawingState.sessionId);
}

// Cancel clear timer (called when Alt is pressed again)
function cancelClearTimer() {
    if (drawingState.clearTimeout) {
        clearTimeout(drawingState.clearTimeout);
        drawingState.clearTimeout = null;
        console.log('[Drawing] Clear timer cancelled - can continue drawing');
        return true;
    }
    return false;
}

// Handle mouse down for drawing (on the overlay)
function onDrawingMouseDown(e) {
    if (!drawingState.keysHeld) return;

    e.preventDefault(); // Prevent text selection, etc.

    // Start session on first stroke (or continue existing)
    if (!drawingState.sessionActive) {
        startDrawingSession();
    }

    var coords = getDrawingRelativeCoords(e);
    if (!coords) return;

    drawingState.isDrawing = true;
    drawingState.currentStroke = [coords];

    // Draw starting point on local canvas
    var canvas = document.getElementById('drawing-canvas');
    if (!canvas) canvas = createDrawingCanvas();
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var absSize = DRAW_BRUSH_SIZES[drawingSettings.brushSize] * canvas.height;

    ctx.fillStyle = drawingSettings.brushColor;
    ctx.beginPath();
    ctx.arc(coords.x * canvas.width, coords.y * canvas.height, absSize / 2, 0, Math.PI * 2);
    ctx.fill();

    console.log('[Drawing] Stroke started at', coords.x.toFixed(2), coords.y.toFixed(2));
}

// Handle mouse move for drawing
var DRAW_MIN_POINT_DISTANCE = 0.005; // Min normalized distance between points (reduces payload size)

function onDrawingMouseMove(e) {
    if (!drawingState.isDrawing || !drawingState.keysHeld) return;

    e.preventDefault();

    var coords = getDrawingRelativeCoords(e);
    if (!coords) return;

    var lastCoords = drawingState.currentStroke[drawingState.currentStroke.length - 1];

    // Downsample: skip points too close together (reduces Pusher payload by ~50-70%)
    var dx = coords.x - lastCoords.x;
    var dy = coords.y - lastCoords.y;
    if (Math.abs(dx) < DRAW_MIN_POINT_DISTANCE && Math.abs(dy) < DRAW_MIN_POINT_DISTANCE) {
        // Still draw locally for smooth visuals, just don't record the point for broadcast
        var canvas = document.getElementById('drawing-canvas');
        if (canvas) {
            var ctx = canvas.getContext('2d');
            var absSize = DRAW_BRUSH_SIZES[drawingSettings.brushSize] * canvas.height;
            ctx.strokeStyle = drawingSettings.brushColor;
            ctx.lineWidth = absSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(lastCoords.x * canvas.width, lastCoords.y * canvas.height);
            ctx.lineTo(coords.x * canvas.width, coords.y * canvas.height);
            ctx.stroke();
        }
        return;
    }

    var canvas = document.getElementById('drawing-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var absSize = DRAW_BRUSH_SIZES[drawingSettings.brushSize] * canvas.height;

    ctx.strokeStyle = drawingSettings.brushColor;
    ctx.lineWidth = absSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastCoords.x * canvas.width, lastCoords.y * canvas.height);
    ctx.lineTo(coords.x * canvas.width, coords.y * canvas.height);
    ctx.stroke();

    drawingState.currentStroke.push(coords);
}

// Handle mouse up for drawing
function onDrawingMouseUp(e) {
    if (!drawingState.isDrawing) return;

    drawingState.isDrawing = false;

    // Broadcast completed stroke
    if (drawingState.currentStroke.length > 0 && drawingState.sessionActive) {
        broadcastStroke({
            color: drawingSettings.brushColor,
            size: drawingSettings.brushSize,
            points: drawingState.currentStroke
        });
        console.log('[Drawing] Stroke completed, points:', drawingState.currentStroke.length);
    }

    drawingState.currentStroke = [];
}

// Handle key down - Alt key activates drawing mode
function onDrawingKeyDown(e) {
    // Check for Alt key (e.key === 'Alt' or e.altKey on keydown)
    if (e.key === 'Alt' || e.keyCode === 18) {
        // Prevent default Alt behavior (menu focus in some browsers)
        e.preventDefault();

        if (!drawingState.keysHeld) {
            drawingState.keysHeld = true;
            showDrawingOverlay();

            // Cancel any pending clear timer (user can continue drawing)
            cancelClearTimer();

            console.log('[Drawing] Alt held - drawing mode active');
        }
    }
}

// Handle key up - Alt release deactivates drawing mode
function onDrawingKeyUp(e) {
    if (e.key === 'Alt' || e.keyCode === 18) {
        if (drawingState.keysHeld) {
            drawingState.keysHeld = false;
            hideDrawingOverlay();

            // If we were drawing, end the stroke
            if (drawingState.isDrawing) {
                onDrawingMouseUp(e);
            }

            // Schedule clear after 8 seconds (if there's an active session)
            scheduleClearDrawing();

            console.log('[Drawing] Alt released - drawing mode inactive');
        }
    }
}

// ========== WEBSOCKET BROADCAST (Drawing) ==========

// Broadcast a stroke to all users
function broadcastStroke(strokeData) {
    if (!syncEnabled) {
        console.log('[Drawing] Sync not available');
        return;
    }

    wsSend('draw-stroke', {
        username: getMyUsername(),
        sessionId: drawingState.sessionId,
        stroke: strokeData
    });
    console.log('[Drawing] Stroke broadcast, points:', strokeData.points.length);
}

// Broadcast clear command
function broadcastDrawingClear() {
    if (!syncEnabled) return;

    wsSend('draw-clear', {
        username: getMyUsername(),
        sessionId: drawingState.sessionId
    });
    console.log('[Drawing] Clear broadcast');
}

// Handle received stroke from another user
function handleReceivedStroke(data) {
    if (data.username === getMyUsername()) return;

    var canvas = document.getElementById('drawing-receiver-canvas');
    if (!canvas) {
        canvas = createReceiverCanvas();
    }
    if (!canvas) return;

    // Ensure canvas is sized correctly
    var videoContainer = document.getElementById('videowrap');
    if (canvas.width !== videoContainer.offsetWidth || canvas.height !== videoContainer.offsetHeight) {
        resizeReceiverCanvas();
    }

    var ctx = canvas.getContext('2d');
    var stroke = data.stroke;
    var absSize = DRAW_BRUSH_SIZES[stroke.size] * canvas.height;

    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = absSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.points.length === 1) {
        // Single point - draw a dot
        var p = stroke.points[0];
        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, absSize / 2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Draw path
        ctx.beginPath();
        var first = stroke.points[0];
        ctx.moveTo(first.x * canvas.width, first.y * canvas.height);

        for (var i = 1; i < stroke.points.length; i++) {
            var p = stroke.points[i];
            ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
        }
        ctx.stroke();
    }

    console.log('[Drawing] Received stroke from', data.username, 'points:', stroke.points.length);
}

// Handle received clear command
function handleReceivedClear(data) {
    var canvas = document.getElementById('drawing-receiver-canvas');
    if (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    console.log('[Drawing] Received clear from', data.username);
}

// Check if drawing sync is ready (listeners are centralized in connectWebSocket)
function initDrawingSync() {
    if (!syncEnabled) {
        console.log('[Drawing] Waiting for sync...');
        return false;
    }
    console.log('[Drawing] Sync listeners active (via central message router)');
    return true;
}

// Initialize drawing system
function initDrawingSystem() {
    injectDrawingCSS();
    loadDrawingSettings();
    createDrawingCanvas();
    createReceiverCanvas();
    createDrawingInteractionOverlay();

    // Global key listeners for Alt key drawing
    document.addEventListener('keydown', onDrawingKeyDown);
    document.addEventListener('keyup', onDrawingKeyUp);

    // Handle window resize
    window.addEventListener('resize', function() {
        resizeDrawingCanvas();
        resizeReceiverCanvas();
    });

    // Try to init sync listeners (may need to wait for WebSocket connection)
    if (!initDrawingSync()) {
        var checkInterval = setInterval(function() {
            if (initDrawingSync()) {
                clearInterval(checkInterval);
            }
        }, 1000);

        // Give up after 30 seconds
        setTimeout(function() {
            clearInterval(checkInterval);
        }, 30000);
    }

    console.log('[Drawing] System initialized');
}

// Initialize on document ready
$(document).ready(function() {
    setTimeout(initDrawingSystem, 2000);
});

/* ========== CONNECTION MESSAGE FILTER ========== */
// Only show connect/disconnect messages if the disconnect lasted > 15 seconds
// Suppresses brief reconnect flicker from quick network hiccups

(function initConnectionMessageFilter() {
    var DISCONNECT_THRESHOLD = 15000; // 15 seconds
    var pendingDisconnects = {}; // username -> { element, timeout, timestamp }

    function extractUsernameFromMsg(el) {
        var text = el.textContent || '';
        // Cytube format: "username disconnected." or "username connected."
        var match = text.match(/^(.+?)\s+(disconnected|connected)/);
        return match ? match[1].trim() : null;
    }

    function setupObserver() {
        var msgBuffer = document.getElementById('messagebuffer');
        if (!msgBuffer) {
            setTimeout(setupObserver, 1000);
            return;
        }

        var observer = new MutationObserver(function(mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    var node = added[j];
                    if (!node.classList) continue;

                    if (node.classList.contains('server-msg-disconnect')) {
                        handleDisconnect(node);
                    } else if (node.classList.contains('server-msg-reconnect')) {
                        handleReconnect(node);
                    }
                }
            }
        });

        observer.observe(msgBuffer, { childList: true });
        console.log('[ConnFilter] Connection message filter initialized');
    }

    function handleDisconnect(el) {
        var username = extractUsernameFromMsg(el);
        if (!username) return;

        // Hide immediately
        el.style.display = 'none';

        // Clear any existing pending disconnect for this user
        if (pendingDisconnects[username]) {
            clearTimeout(pendingDisconnects[username].timeout);
        }

        // Store pending with 15 second reveal timer
        pendingDisconnects[username] = {
            element: el,
            timestamp: Date.now(),
            timeout: setTimeout(function() {
                // Disconnect lasted > 15 seconds - show the message
                el.style.display = '';
                delete pendingDisconnects[username];
                console.log('[ConnFilter] Showing disconnect for', username, '(lasted >15s)');
            }, DISCONNECT_THRESHOLD)
        };

        console.log('[ConnFilter] Disconnect hidden for', username, '(waiting 15s)');
    }

    function handleReconnect(el) {
        var username = extractUsernameFromMsg(el);
        if (!username) return;

        var pending = pendingDisconnects[username];
        if (pending) {
            // Reconnected within 15 seconds - suppress both messages
            clearTimeout(pending.timeout);
            if (pending.element && pending.element.parentNode) {
                pending.element.remove();
            }
            el.remove();
            delete pendingDisconnects[username];
            console.log('[ConnFilter] Suppressed short disconnect for', username);
        }
        // If no pending disconnect, show reconnect normally (disconnect was already shown after 15s)
    }

    setupObserver();
})();
