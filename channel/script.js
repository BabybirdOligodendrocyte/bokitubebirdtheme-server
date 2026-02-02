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
const resizes = document.getElementById("resize-video-smaller");
const resizel = document.getElementById("resize-video-larger");
resizes.remove();
resizel.remove();

/* Display none on container-fluid after accepting permissions */
document.querySelector('.container-fluid').style.display = "none";

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
const formLine = document.querySelector("div#chatwrap > form");
formLine.setAttribute("id", "formline");
$("#formline").appendTo($("#rightcontent"));
$("#leftcontrols").appendTo($("#rightcontent"));

/* Meant for implementation of scrolling title - remove if unused */
$("#rightcontent").prepend($("<div id='currenttitlewrap'>"));
$("#videowrap-header").prependTo($("#currenttitlewrap"));

const nodecurrenttitle = document.getElementById("currenttitle");
const clonecurrenttitle = nodecurrenttitle.cloneNode(true);

/* Remove padding on wrap */
const pagewrap = document.getElementById("wrap");
pagewrap.setAttribute("style", "padding-bottom: 0px;")

/* Add hint text for chatline and disables spellcheck */
const chatline = document.getElementById("chatline");
chatline.removeAttribute("placeholder");
chatline.setAttribute("placeholder", "Send a message");
chatline.setAttribute("spellcheck", "false");

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
rightControls.insertBefore(jumpBtn, rightControls.children[1]);

/* AFK on unfocus function */
var VOL_AFK = false;
var FOCUS_AFK = false;
setInterval(function() {
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

/* ========== POPUP SYSTEM ========== */
var emoteFavorites = JSON.parse(localStorage.getItem('emoteFavorites')) || [];
var gifFavorites = JSON.parse(localStorage.getItem('gifFavorites')) || [];
var recentlyUsed = JSON.parse(localStorage.getItem('recentlyUsed')) || [];
var gifSearchHistory = JSON.parse(localStorage.getItem('gifSearchHistory')) || [];
var ignoredUsers = JSON.parse(localStorage.getItem('ignoredUsers')) || [];
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
var textStyleSettings = Object.assign({}, TEXT_STYLE_DEFAULTS, JSON.parse(localStorage.getItem('textStyleSettings') || '{}'));
var usernameStyleSettings = Object.assign({}, USERNAME_STYLE_DEFAULTS, JSON.parse(localStorage.getItem('usernameStyleSettings') || '{}'));
var replyStyleSettings = Object.assign({}, REPLY_STYLE_DEFAULTS, JSON.parse(localStorage.getItem('replyStyleSettings') || '{}'));

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
        }
        .text-pulse {
            animation: pulse 1s ease-in-out infinite !important;
        }
        .text-bounce {
            animation: bounce 0.6s ease infinite !important;
        }
        .text-wave {
            animation: wave 2s ease-in-out infinite !important;
        }
        .text-flicker {
            animation: flicker 0.3s ease-in-out infinite !important;
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

        /* Ensure regular usernames (without styled-username) are always visible */
        #messagebuffer > div:not(.chat-msg-with-styled-name) > .username {
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
    historyEl.innerHTML = gifSearchHistory.slice(0, 5).map(function(q) {
        return '<span class="gif-history-item" onclick="searchTenorGifs(\'' + q.replace(/'/g, "\\'") + '\')">' + q + '</span>';
    }).join('');
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
        if (item.type === 'gif') {
            d.style.width = '100px';
            d.style.height = '100px';
            var isFav = gifFavorites.some(function(g) { return g.url === item.url; });
            d.innerHTML = '<img src="' + item.preview + '" title="Click to insert"><button class="emote-fav ' + (isFav ? 'faved' : '') + '" onclick="toggleGifFav(\'' + item.url.replace(/'/g, "\\'") + '\',\'' + item.preview.replace(/'/g, "\\'") + '\',event)">★</button>';
            d.querySelector('img').onclick = function() { insertGif(item.url); };
        } else {
            var isFav = emoteFavorites.indexOf(item.name) !== -1;
            d.innerHTML = '<img src="' + item.image + '" title="' + item.name + '"><button class="emote-fav ' + (isFav ? 'faved' : '') + '" onclick="toggleEmoteFav(\'' + item.name.replace(/'/g, "\\'") + '\',event)">★</button>';
            d.querySelector('img').onclick = function() { insertEmote(item.name); };
        }
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
        d.innerHTML = '<img src="' + e.image + '" title="' + e.name + '"><button class="emote-fav faved" onclick="toggleEmoteFav(\'' + e.name.replace(/'/g, "\\'") + '\',event)">★</button>';
        d.querySelector('img').onclick = function() { insertEmote(e.name); };
        body.appendChild(d);
    });

    // Render GIF favorites
    gifFavorites.forEach(function(gif) {
        var d = document.createElement('div');
        d.className = 'emote-item gif-item';
        d.style.width = '100px';
        d.style.height = '100px';
        d.innerHTML = '<img src="' + gif.preview + '" title="Click to insert"><button class="emote-fav faved" onclick="toggleGifFav(\'' + gif.url.replace(/'/g, "\\'") + '\',\'' + gif.preview.replace(/'/g, "\\'") + '\',event)">★</button>';
        d.querySelector('img').onclick = function() { insertGif(gif.url); };
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
            d.innerHTML = '<img src="' + e.image + '" title="' + e.name + '"><button class="emote-fav ' + (fav ? 'faved' : '') + '" onclick="toggleEmoteFav(\'' + e.name.replace(/'/g, "\\'") + '\',event)">★</button>';
            d.querySelector('img').onclick = function() { insertEmote(e.name); };
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
            d.innerHTML = '<img src="' + previewUrl + '" title="Click to insert" style="max-width:90px;max-height:90px;object-fit:contain;"><button class="emote-fav ' + (isFav ? 'faved' : '') + '" onclick="toggleGifFav(\'' + fullUrl.replace(/'/g, "\\'") + '\',\'' + previewUrl.replace(/'/g, "\\'") + '\',event)">★</button>';
            d.querySelector('img').onclick = function() { insertGif(fullUrl); };
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
    var html = '<div class="fav-grid">';
    if (emoteFavorites.length === 0) {
        html = '<div style="color:#888;padding:20px;text-align:center">No favorites yet!<br>Open emotes and click ★</div>';
    } else {
        var emotes = (CHANNEL && CHANNEL.emotes) ? CHANNEL.emotes : [];
        emoteFavorites.forEach(function(name) {
            var em = emotes.find(function(e) { return e.name === name; });
            if (em) html += '<img src="' + em.image + '" title="' + em.name + '" onclick="insertEmote(\'' + em.name.replace(/'/g, "\\'") + '\');closeFavoritesDropdown();">';
        });
        html += '</div>';
    }
    dd.innerHTML = html;
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
}

function updateBuddySaturation(val) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.saturation = parseInt(val);
    document.getElementById('sat-val').textContent = val + '%';
    saveMyBuddySettings();
    updateBuddyPreview();
    applyMyBuddySettings();
}

function updateBuddyBrightness(val) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.brightness = parseInt(val);
    document.getElementById('bright-val').textContent = val + '%';
    saveMyBuddySettings();
    updateBuddyPreview();
    applyMyBuddySettings();
}

function updateBuddyGlowColor(color) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.glowColor = color;
    saveMyBuddySettings();
    updateBuddyPreview();
    applyMyBuddySettings();
}

function updateBuddyGlowIntensity(val) {
    if (!myBuddySettings) myBuddySettings = JSON.parse(JSON.stringify(DEFAULT_BUDDY_SETTINGS));
    myBuddySettings.glowIntensity = parseInt(val);
    document.getElementById('glow-val').textContent = val + 'px';
    saveMyBuddySettings();
    updateBuddyPreview();
    applyMyBuddySettings();
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

function selectStyleColor(c) {
    // Clear gradient and custom color if selecting solid color
    if (textStyleSettings.color === c) {
        textStyleSettings.color = null;
    } else {
        textStyleSettings.color = c;
        textStyleSettings.gradient = null; // Can't have both
        textStyleSettings.customColor = null; // Clear custom too
    }
    saveStyleSettings();
    renderStyleTabContent('message');
    updateStylePreview();
}

function selectStyleGradient(g) {
    if (textStyleSettings.gradient === g) {
        textStyleSettings.gradient = null;
    } else {
        textStyleSettings.gradient = g;
        textStyleSettings.color = null; // Can't have both
        textStyleSettings.customColor = null; // Clear custom too
    }
    saveStyleSettings();
    renderStyleTabContent('message');
    updateStylePreview();
}

function selectStyleGlow(g) {
    if (textStyleSettings.glow === g) {
        textStyleSettings.glow = null;
    } else {
        textStyleSettings.glow = g;
        textStyleSettings.customGlow = null; // Clear custom too
    }
    saveStyleSettings();
    renderStyleTabContent('message');
    updateStylePreview();
}

function selectStyleFont(f) {
    textStyleSettings.font = (textStyleSettings.font === f) ? null : f;
    saveStyleSettings();
    renderStyleTabContent('message');
    updateStylePreview();
}

function selectStyleAnimation(a) {
    textStyleSettings.animation = (textStyleSettings.animation === a) ? null : a;
    saveStyleSettings();
    renderStyleTabContent('message');
    updateStylePreview();
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
        var fontStyles = {
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
        if (fontStyles[textStyleSettings.font]) s.push(fontStyles[textStyleSettings.font]);
    }
    
    // Color or gradient or custom color
    if (textStyleSettings.gradient) {
        var gradientStyles = {
            'rainbow': 'background:linear-gradient(90deg,#ff0000,#ff7700,#ffff00,#00ff00,#0077ff,#8b00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
            'fire': 'background:linear-gradient(90deg,#ff0000,#ff5500,#ffaa00,#ffcc00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
            'ocean': 'background:linear-gradient(90deg,#00ffff,#0088ff,#0044aa,#002255);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
            'sunset': 'background:linear-gradient(90deg,#ff6b6b,#ffa500,#ffdb58,#ff6b9d);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
            'neon': 'background:linear-gradient(90deg,#ff00ff,#00ffff,#ff00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
            'forest': 'background:linear-gradient(90deg,#228b22,#32cd32,#90ee90,#006400);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
            'gold': 'background:linear-gradient(90deg,#ffd700,#ffec8b,#daa520,#b8860b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
            'ice': 'background:linear-gradient(90deg,#e0ffff,#87ceeb,#add8e6,#b0e0e6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text'
        };
        if (gradientStyles[textStyleSettings.gradient]) s.push(gradientStyles[textStyleSettings.gradient]);
    } else if (textStyleSettings.color) {
        s.push('color:' + (textStyleSettings.color === 'blue' ? '#55f' : textStyleSettings.color));
    } else if (textStyleSettings.customColor) {
        s.push('color:#' + textStyleSettings.customColor);
    }
    
    // Glow or custom glow
    if (textStyleSettings.glow) {
        var glowStyles = {
            'glow-white': 'text-shadow:0 0 10px #fff,0 0 20px #fff,0 0 30px #fff',
            'glow-red': 'text-shadow:0 0 10px #f00,0 0 20px #f00,0 0 30px #f00',
            'glow-blue': 'text-shadow:0 0 10px #00f,0 0 20px #00f,0 0 30px #0ff',
            'glow-green': 'text-shadow:0 0 10px #0f0,0 0 20px #0f0,0 0 30px #0f0',
            'glow-gold': 'text-shadow:0 0 10px #ffd700,0 0 20px #ffa500,0 0 30px #ff8c00',
            'glow-pink': 'text-shadow:0 0 10px #ff69b4,0 0 20px #ff1493,0 0 30px #ff69b4',
            'glow-rainbow': 'text-shadow:0 0 5px #f00,0 0 10px #ff0,0 0 15px #0f0,0 0 20px #0ff,0 0 25px #00f,0 0 30px #f0f'
        };
        if (glowStyles[textStyleSettings.glow]) s.push(glowStyles[textStyleSettings.glow]);
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
    p.innerHTML = '<div class="popup-header"><span>Chat Filters Setup (Admin)</span><button class="popup-close" onclick="closeFilterPopup()">×</button></div>' +
        '<div id="filter-popup-body"><p>Admin must add these Chat Filters in <strong>Channel Settings → Edit → Chat Filters</strong>:</p>' +
        '<p style="background:#422;padding:10px;border-radius:6px;margin-bottom:10px;"><strong>⚠️ REQUIRED for username styling:</strong></p>' +
        '<table><tr><th>Name</th><th>Regex</th><th>Flags</th><th>Replacement</th></tr>' +
        '<tr style="background:#332"><td><strong>uname</strong></td><td>\\[uname\\](.+?)\\[/uname\\]</td><td>g</td><td>&lt;span class="styled-username" data-ignore-nnd="true"&gt;$1&lt;/span&gt;</td></tr>' +
        '</table>' +
        '<p style="margin-top:15px;"><strong>Color filters:</strong></p>' +
        '<table><tr><th>Name</th><th>Regex</th><th>Flags</th><th>Replacement</th></tr>' +
        '<tr><td>red</td><td>\\[red\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:red"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>blue</td><td>\\[blue\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#55f"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>green</td><td>\\[green\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:green"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>yellow</td><td>\\[yellow\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:yellow"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>orange</td><td>\\[orange\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:orange"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>pink</td><td>\\[pink\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:pink"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>lime</td><td>\\[lime\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:lime"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>aqua</td><td>\\[aqua\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:aqua"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>violet</td><td>\\[violet\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:violet"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>white</td><td>\\[white\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:white"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>silver</td><td>\\[silver\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:silver"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>brown</td><td>\\[brown\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:brown"&gt;$1&lt;/span&gt;</td></tr>' +
        '<tr><td>bold</td><td>\\[b\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;strong&gt;$1&lt;/strong&gt;</td></tr>' +
        '<tr><td>italic</td><td>\\[i\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;em&gt;$1&lt;/em&gt;</td></tr>' +
        '<tr><td>underline</td><td>\\[u\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;u&gt;$1&lt;/u&gt;</td></tr>' +
        '<tr><td>strike</td><td>\\[s\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;s&gt;$1&lt;/s&gt;</td></tr>' +
        '</table><p style="background:#234;padding:12px;border-radius:6px;margin-top:15px;">After adding filters, text styling works for everyone!</p></div>';
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

$("#favorites-btn").after($("#voteskip"));
$('#newpollbtn').prependTo($("#leftcontrols"));

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
    setInterval(updateDropdownContent, 5000);
    
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
    }
}

// Initialize on load
$(document).ready(function() {
    setTimeout(initReplySystem, 1000);
});

// USERNAME STYLING SYSTEM
var usernameStyleSettings = JSON.parse(localStorage.getItem('usernameStyleSettings')) || {
    enabled: false,
    color: null,
    gradient: null,
    glow: null,
    animation: null,
    font: null,
    bold: false
};

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
    c.value = '[uname]' + openTags + myName + closeTags + '[/uname] ' + msg;
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
    if (usernameStyleSettings.color === c) {
        usernameStyleSettings.color = null;
    } else {
        usernameStyleSettings.color = c;
        usernameStyleSettings.gradient = null;
        usernameStyleSettings.customColor = null;
    }
    saveUsernameStyleSettings();
    renderStyleTabContent('username');
}

function selectUsernameGradient(g) {
    if (usernameStyleSettings.gradient === g) {
        usernameStyleSettings.gradient = null;
    } else {
        usernameStyleSettings.gradient = g;
        usernameStyleSettings.color = null;
        usernameStyleSettings.customColor = null;
    }
    saveUsernameStyleSettings();
    renderStyleTabContent('username');
}

function selectUsernameGlow(g) {
    if (usernameStyleSettings.glow === g) {
        usernameStyleSettings.glow = null;
    } else {
        usernameStyleSettings.glow = g;
        usernameStyleSettings.customGlow = null;
    }
    saveUsernameStyleSettings();
    renderStyleTabContent('username');
}

function selectUsernameAnimation(a) {
    usernameStyleSettings.animation = (usernameStyleSettings.animation === a) ? null : a;
    saveUsernameStyleSettings();
    renderStyleTabContent('username');
}

function selectUsernameFont(f) {
    usernameStyleSettings.font = (usernameStyleSettings.font === f) ? null : f;
    saveUsernameStyleSettings();
    renderStyleTabContent('username');
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
        var fontStyles = {
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
        if (fontStyles[usernameStyleSettings.font]) s.push(fontStyles[usernameStyleSettings.font]);
    }
    
    // Color or gradient
    if (usernameStyleSettings.gradient) {
        var gradientStyles = {
            'rainbow': 'background:linear-gradient(90deg,#ff0000,#ff7700,#ffff00,#00ff00,#0077ff,#8b00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
            'fire': 'background:linear-gradient(90deg,#ff0000,#ff5500,#ffaa00,#ffcc00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
            'ocean': 'background:linear-gradient(90deg,#00ffff,#0088ff,#0044aa,#002255);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
            'sunset': 'background:linear-gradient(90deg,#ff6b6b,#ffa500,#ffdb58,#ff6b9d);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
            'neon': 'background:linear-gradient(90deg,#ff00ff,#00ffff,#ff00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
            'forest': 'background:linear-gradient(90deg,#228b22,#32cd32,#90ee90,#006400);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
            'gold': 'background:linear-gradient(90deg,#ffd700,#ffec8b,#daa520,#b8860b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
            'ice': 'background:linear-gradient(90deg,#e0ffff,#87ceeb,#add8e6,#b0e0e6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text'
        };
        if (gradientStyles[usernameStyleSettings.gradient]) s.push(gradientStyles[usernameStyleSettings.gradient]);
    } else if (usernameStyleSettings.color) {
        s.push('color:' + (usernameStyleSettings.color === 'blue' ? '#55f' : usernameStyleSettings.color));
    }
    
    // Glow
    if (usernameStyleSettings.glow) {
        var glowStyles = {
            'glow-white': 'text-shadow:0 0 10px #fff,0 0 20px #fff,0 0 30px #fff',
            'glow-red': 'text-shadow:0 0 10px #f00,0 0 20px #f00,0 0 30px #f00',
            'glow-blue': 'text-shadow:0 0 10px #00f,0 0 20px #00f,0 0 30px #0ff',
            'glow-green': 'text-shadow:0 0 10px #0f0,0 0 20px #0f0,0 0 30px #0f0',
            'glow-gold': 'text-shadow:0 0 10px #ffd700,0 0 20px #ffa500,0 0 30px #ff8c00',
            'glow-pink': 'text-shadow:0 0 10px #ff69b4,0 0 20px #ff1493,0 0 30px #ff69b4',
            'glow-rainbow': 'text-shadow:0 0 5px #f00,0 0 10px #ff0,0 0 15px #0f0,0 0 20px #0ff,0 0 25px #00f,0 0 30px #f0f'
        };
        if (glowStyles[usernameStyleSettings.glow]) s.push(glowStyles[usernameStyleSettings.glow]);
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
    if (typeof socket !== 'undefined') {
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

// Add settings button
function addSettingsButton() {
    if (document.getElementById('settings-btn')) return;
    var btn = $('<button id="settings-btn" class="btn btn-sm btn-default" title="Settings">⚙️</button>');
    btn.on('click', openSettingsPanel);
    btn.appendTo('#leftcontrols');
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

// Intercept /screenspam command
function initScreenspamCommand() {
    var chatline = document.getElementById('chatline');
    if (!chatline) return;

    chatline.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter' || e.shiftKey) return;

        var msg = chatline.value.trim();
        if (!msg.toLowerCase().startsWith('/screenspam ')) return;

        // Extract message content
        var content = msg.substring(12).trim();

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

        // Send with special marker format: [SCREENSPAM]content[/SCREENSPAM]
        var markedMessage = screenspamMarker + 'SCREENSPAM:' + content + ':SCREENSPAM' + screenspamMarker;

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

        // Check for screenspam marker
        var markerPattern = screenspamMarker + 'SCREENSPAM:';
        var endMarker = ':SCREENSPAM' + screenspamMarker;

        if (data.msg.indexOf(markerPattern) !== -1) {
            var startIdx = data.msg.indexOf(markerPattern) + markerPattern.length;
            var endIdx = data.msg.indexOf(endMarker);

            if (endIdx > startIdx) {
                var screenspamContent = data.msg.substring(startIdx, endIdx);

                // Display the screenspam effect
                displayScreenspam(screenspamContent, data.username);

                // Hide the chat message (it's just for triggering the effect)
                setTimeout(function() {
                    var msgs = document.querySelectorAll('#messagebuffer > div');
                    for (var i = msgs.length - 1; i >= 0; i--) {
                        var msgEl = msgs[i];
                        if (msgEl.textContent.indexOf('SCREENSPAM:') !== -1) {
                            msgEl.style.display = 'none';
                            break;
                        }
                    }
                }, 100);
            }
        }
        return false; // Continue to other handlers (message still needs formatting)
    }, 80);
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

        // Initialize connected users buddies
        initConnectedBuddies();

        // Apply saved settings
        applyEmoteSize();
        applyTimestampVisibility();
        applyChatFontSize();
        if (compactMode) document.body.classList.add('compact-mode');

        // Start the unified chat dispatcher (after all handlers registered)
        BokiChatDispatcher.init();
    }, 2000);
});

/* ========== CONNECTED USERS BUDDIES ========== */
/* Cute characters that roam chat, interact, speak, kiss, fight & more! */
/* Deterministic assignment - same user = same character across all browsers */

var BUDDY_CONFIG = {
    characterSize: 28,
    updateInterval: 50,
    moveSpeed: 2,
    hopSpeed: 1.5,
    interactDistance: 45,
    fightDuration: 1800,
    perchDuration: 4000,
    gravity: 1.5,
    speechDuration: 3500,
    speechChance: 0.006,
    conversationChance: 0.003,
    crazyInteractionChance: 0.4
};

var buddyCharacters = {};
var buddyAnimationId = null;
var buddiesInitialized = false;
var chatWordTargets = [];
var recentChatMessages = [];
var activeConversations = [];  // Track ongoing conversations
var customBuddySettings = {};  // Store custom settings received from other users
var myBuddySettings = null;    // Current user's custom settings
var lastSettingsBroadcast = 0; // Debounce settings broadcast

// ========== PUSHER CONFIGURATION ==========
// Set these in your channel's External JS to enable Pusher sync (prevents chat flooding)
// var PUSHER_KEY = 'your-pusher-key';
// var PUSHER_CLUSTER = 'your-cluster';
// var PUSHER_AUTH_ENDPOINT = 'https://your-worker.workers.dev/pusher/auth';
var pusherClient = null;
var pusherChannel = null;
var pusherEnabled = false;

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

// Size configurations
var BUDDY_SIZES = {
    small: 20,
    medium: 28,
    large: 38
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
    if (typeof CLIENT !== 'undefined' && CLIENT.name) {
        return CLIENT.name;
    }
    // Fallback: try to get from userlist
    var myName = $('#userlist .userlist_item.userlist_owner span').first().text().trim();
    if (!myName) {
        myName = localStorage.getItem('cytube_username') || null;
    }
    return myName;
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

// ========== PUSHER INITIALIZATION ==========
function initPusher() {
    // Check if Pusher config is set
    if (typeof PUSHER_KEY === 'undefined' || typeof PUSHER_CLUSTER === 'undefined') {
        console.log('[Pusher] Not configured - using chat fallback');
        return;
    }

    // Load Pusher SDK if not already loaded
    if (typeof Pusher === 'undefined') {
        var script = document.createElement('script');
        script.src = 'https://js.pusher.com/8.2.0/pusher.min.js';
        script.onload = function() {
            connectPusher();
        };
        document.head.appendChild(script);
    } else {
        connectPusher();
    }
}

function connectPusher() {
    try {
        var authEndpoint = typeof PUSHER_AUTH_ENDPOINT !== 'undefined' ? PUSHER_AUTH_ENDPOINT : null;

        pusherClient = new Pusher(PUSHER_KEY, {
            cluster: PUSHER_CLUSTER,
            authEndpoint: authEndpoint,
            auth: {
                params: { username: getMyUsername() || 'anonymous' }
            }
        });

        // Get channel name from Cytube room or use default
        var roomName = window.CHANNEL ? window.CHANNEL.name : 'buddy-sync';
        pusherChannel = pusherClient.subscribe('presence-' + roomName);

        pusherChannel.bind('pusher:subscription_succeeded', function() {
            console.log('[Pusher] Connected to channel');
            pusherEnabled = true;
            // Broadcast our settings once connected
            setTimeout(broadcastMyBuddySettings, 500);
        });

        pusherChannel.bind('pusher:subscription_error', function(err) {
            console.log('[Pusher] Subscription error, using chat fallback:', err);
            pusherEnabled = false;
        });

        // Listen for buddy settings
        pusherChannel.bind('client-buddy-settings', function(data) {
            if (data.username && data.username !== getMyUsername()) {
                handlePusherBuddySettings(data);
            }
        });

        // Listen for buddy interactions
        pusherChannel.bind('client-buddy-action', function(data) {
            if (data.user1 && data.user1 !== getMyUsername()) {
                handlePusherBuddyAction(data);
            }
        });

        console.log('[Pusher] Initialized');
    } catch (e) {
        console.log('[Pusher] Init error:', e);
        pusherEnabled = false;
    }
}

function handlePusherBuddySettings(data) {
    var settings = {
        spriteIndex: data.si !== undefined ? data.si : -1,
        size: data.sz || 'medium',
        hueRotate: data.hr || 0,
        saturation: data.st || 100,
        brightness: data.br || 100,
        displayName: data.dn || '',
        customSpriteUrl: data.cu || null
    };
    customBuddySettings[data.username] = settings;
    if (buddyCharacters[data.username]) {
        applyCustomSettingsToBuddy(data.username);
    }
    console.log('[Pusher] Received settings for', data.username);
}

function handlePusherBuddyAction(data) {
    handleSyncedInteraction(data.user1, data.user2, data.action, data.seed,
        data.pos1 ? data.pos1.split(',').map(Number) : null,
        data.pos2 ? data.pos2.split(',').map(Number) : null);
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

    // Create MINIMAL settings object
    var minimalSettings = {
        si: myBuddySettings.spriteIndex,
        sz: myBuddySettings.size || 'medium',
        hr: myBuddySettings.hueRotate || 0,
        st: myBuddySettings.saturation || 100,
        br: myBuddySettings.brightness || 100,
        dn: myBuddySettings.displayName || ''
    };
    if (myBuddySettings.customSpriteUrl) {
        minimalSettings.cu = myBuddySettings.customSpriteUrl;
    }

    // Try Pusher first (no chat pollution)
    if (pusherEnabled && pusherChannel) {
        try {
            pusherChannel.trigger('client-buddy-settings', {
                username: myName,
                ...minimalSettings
            });
            console.log('[Pusher] Broadcast sent for', myName);
            return;
        } catch (e) {
            console.log('[Pusher] Trigger failed, using chat fallback');
        }
    }

    // Fallback to chat-based sync
    var encoded = encodeBuddySettings(minimalSettings);
    if (!encoded) {
        console.log('[BuddySync] Encoding failed');
        return;
    }

    var hiddenMsg = '\u200B\u200CBSET:' + myName + ':' + encoded + ':BSET\u200B\u200C';
    console.log('[BuddySync] Message length:', hiddenMsg.length, '(must be <240 for Cytube)');

    if (typeof socket !== 'undefined' && socket.emit) {
        socket.emit('chatMsg', { msg: hiddenMsg, meta: {} });
        console.log('[BuddySync] Chat broadcast sent for', myName);
    }
}

// Broadcast an interaction for sync (includes positions for visual consistency)
function broadcastInteraction(user1, user2, interactionType, seed) {
    var b1 = buddyCharacters[user1];
    var b2 = buddyCharacters[user2];
    var pos1 = b1 ? Math.round(b1.x) + ',' + Math.round(b1.y) : '0,0';
    var pos2 = b2 ? Math.round(b2.x) + ',' + Math.round(b2.y) : '0,0';

    // Try Pusher first (no chat pollution)
    if (pusherEnabled && pusherChannel) {
        try {
            pusherChannel.trigger('client-buddy-action', {
                user1: user1,
                user2: user2,
                action: interactionType,
                seed: seed,
                pos1: pos1,
                pos2: pos2
            });
            return;
        } catch (e) {
            console.log('[Pusher] Action trigger failed, using chat fallback');
        }
    }

    // Fallback to chat-based sync
    var hiddenMsg = '\u200B\u200CBACT:' + user1 + ':' + user2 + ':' + interactionType + ':' + seed + ':' + pos1 + ':' + pos2 + ':BACT\u200B\u200C';
    if (typeof socket !== 'undefined' && socket.emit) {
        socket.emit('chatMsg', { msg: hiddenMsg, meta: {} });
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
            var settings = {
                spriteIndex: minimalSettings.si !== undefined ? minimalSettings.si : (minimalSettings.spriteIndex !== undefined ? minimalSettings.spriteIndex : -1),
                size: minimalSettings.sz || minimalSettings.size || 'medium',
                hueRotate: minimalSettings.hr !== undefined ? minimalSettings.hr : (minimalSettings.hueRotate || 0),
                saturation: minimalSettings.st !== undefined ? minimalSettings.st : (minimalSettings.saturation || 100),
                brightness: minimalSettings.br !== undefined ? minimalSettings.br : (minimalSettings.brightness || 100),
                displayName: minimalSettings.dn || minimalSettings.displayName || '',
                customSpriteUrl: minimalSettings.cu || minimalSettings.customSpriteUrl || null
            };
            console.log('[BuddySync] Decoded settings - spriteIndex:', settings.spriteIndex, 'size:', settings.size);
            var myName = getMyUsername();
            if (username !== myName) {
                // Store settings for other users
                customBuddySettings[username] = settings;
                console.log('[BuddySync] Stored settings for', username, '- buddy exists:', !!buddyCharacters[username]);
                // Force update existing buddy if present
                if (buddyCharacters[username]) {
                    applyCustomSettingsToBuddy(username);
                    console.log('[BuddySync] Applied settings to existing buddy:', username);
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
        var pos1 = actionMatch[5].split(',').map(Number);
        var pos2 = actionMatch[6].split(',').map(Number);

        // Only process if we didn't initiate this (to avoid double-triggering)
        var myName = getMyUsername();
        if (user1 !== myName) {
            handleSyncedInteraction(user1, user2, actionType, seed, pos1, pos2);
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
        // Custom image URL
        buddy.element.innerHTML = '<img src="' + escapeHtml(settings.customSpriteUrl) + '" style="width:100%;height:100%;object-fit:contain;">' +
            '<span class="buddy-nametag">' + escapeHtml(displayName) + '</span>';
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

    // Apply color filters
    var filters = [];
    if (settings.hueRotate) filters.push('hue-rotate(' + settings.hueRotate + 'deg)');
    if (settings.saturation && settings.saturation !== 100) filters.push('saturate(' + settings.saturation + '%)');
    if (settings.brightness && settings.brightness !== 100) filters.push('brightness(' + settings.brightness + '%)');
    if (settings.glowColor && settings.glowIntensity > 0) {
        filters.push('drop-shadow(0 0 ' + settings.glowIntensity + 'px ' + settings.glowColor + ')');
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

    // Sync buddy positions so visuals match across clients
    if (pos1 && pos1.length === 2 && !isNaN(pos1[0])) {
        b1.x = pos1[0];
        b1.y = pos1[1];
        b1.element.style.left = b1.x + 'px';
        b1.element.style.top = b1.y + 'px';
    }
    if (pos2 && pos2.length === 2 && !isNaN(pos2[0])) {
        b2.x = pos2[0];
        b2.y = pos2[1];
        b2.element.style.left = b2.x + 'px';
        b2.element.style.top = b2.y + 'px';
    }

    // Route through startInteraction with sync flag
    startInteraction(user1, user2, b1, b2, true, actionType, seed);
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
    // Register with dispatcher (priority 100 - HIGHEST, runs first to filter sync messages)
    BokiChatDispatcher.register('buddySync', function(data) {
        if (!data.msg) return false;

        if (isBuddySyncMessage(data.msg)) {
            // Debug logging
            if (data.msg.indexOf('BSET') !== -1 || data.msg.indexOf('BACT') !== -1) {
                console.log('[BuddySync] Sync message detected, parsing...');
            }
            parseBuddySyncMessage(data.msg);

            // Hide the message from chat display
            setTimeout(function() {
                var msgs = document.querySelectorAll('#messagebuffer > div');
                var lastMsg = msgs[msgs.length - 1];
                if (lastMsg && isBuddySyncMessage(lastMsg.textContent)) {
                    lastMsg.remove();
                }
            }, 50);

            return true; // STOP processing - don't pass to other handlers
        }
        return false; // Not a sync message, continue to other handlers
    }, 100);

    // Clean up EXISTING messages in chat history (from before we joined)
    function cleanupExistingMessages() {
        var msgBuffer = document.getElementById('messagebuffer');
        if (msgBuffer) {
            var msgs = msgBuffer.querySelectorAll(':scope > div');
            msgs.forEach(function(msg) {
                var text = msg.textContent || '';
                // Remove if it contains BSET or BACT sync markers
                if (isBuddySyncMessage(text)) {
                    parseBuddySyncMessage(text);
                    msg.remove();
                }
            });
        }
    }
    // Run cleanup immediately and after a delay (for late-loaded history)
    cleanupExistingMessages();
    setTimeout(cleanupExistingMessages, 1000);
    setTimeout(cleanupExistingMessages, 3000);

    // Watch messagebuffer for NEW sync messages
    var msgBuffer = document.getElementById('messagebuffer');
    if (msgBuffer) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        var text = node.textContent || '';
                        if (isBuddySyncMessage(text)) {
                            parseBuddySyncMessage(text);
                            node.remove();
                        }
                    }
                });
            });
        });
        observer.observe(msgBuffer, { childList: true, subtree: false });
    }

    // NND Chat Cleanup - ONLY target NND overlay elements, NOT chat elements
    // NND overlay elements are typically outside #main/#wrap and have specific characteristics
    var nndObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    // Skip if inside important containers
                    if (node.closest('#main, #wrap, #messagebuffer, #userlist, #chatline, .modal')) return;

                    var text = node.textContent || '';
                    if (isBuddySyncMessage(text)) {
                        // Only remove if it looks like an NND element (has animation/transform)
                        var style = window.getComputedStyle(node);
                        if (style.animation !== 'none' ||
                            style.transform !== 'none' ||
                            style.position === 'fixed' ||
                            (style.position === 'absolute' && !node.closest('#main, #wrap'))) {
                            node.remove();
                        }
                    }
                }
            });
        });
    });
    nndObserver.observe(document.body, { childList: true, subtree: false }); // Only direct children

    // Periodic cleanup for NND overlay - be very targeted
    setInterval(function() {
        // Only look at direct children of body that aren't main UI containers
        var bodyChildren = document.body.children;
        for (var i = bodyChildren.length - 1; i >= 0; i--) {
            var el = bodyChildren[i];
            // Skip important containers
            if (el.id === 'main' || el.id === 'wrap' || el.id === 'footer' ||
                el.classList.contains('modal') || el.classList.contains('buddy-character') ||
                el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK') {
                continue;
            }
            var text = el.textContent || '';
            if (isBuddySyncMessage(text)) {
                el.remove();
            }
        }
    }, 100);

    // Load my settings and broadcast ONCE on init
    // We only broadcast when: 1) We first join, 2) Our settings change
    // This prevents flooding chat history with sync messages
    loadMyBuddySettings();

    // Single broadcast after joining (give time for socket to be ready)
    setTimeout(function() {
        broadcastMyBuddySettings();
    }, 2000);

    // NO periodic broadcasts - they flood chat history
    // NO broadcast when others join - hash-based defaults handle most cases
    // Settings only broadcast when user explicitly changes them
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

// Get the safe zone - everywhere EXCEPT the video player
function getBuddyZone() {
    var navHeight = 50;
    var bottomPadding = 80;
    var sidePadding = 20;

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
        bottom: window.innerHeight - bottomPadding
    };
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
    initPusher();             // Try Pusher first (no chat pollution)
    initBuddySyncListener();  // Fallback chat-based sync system

    setTimeout(function() {
        scanChatForWords();
        syncBuddiesWithUserlist();
        startBuddyAnimation();
    }, 1500);

    // Rescan periodically
    setInterval(scanChatForWords, 3000);

    observeUserlistChanges();
    observeChatMessages();

    if (typeof socket !== 'undefined') {
        socket.on('addUser', function(data) { if (data.name) addBuddy(data.name); });
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

        @media (max-width: 768px) {
            .buddy-character { display: none; }
            .buddy-speech { display: none; }
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
}

function observeUserlistChanges() {
    var userlist = document.getElementById('userlist');
    if (!userlist) return;
    var observer = new MutationObserver(function() {
        clearTimeout(window.buddySyncTimeout);
        window.buddySyncTimeout = setTimeout(syncBuddiesWithUserlist, 300);
    });
    observer.observe(userlist, { childList: true, subtree: true });
}

function observeChatMessages() {
    var msgBuffer = document.getElementById('messagebuffer');
    if (!msgBuffer) return;
    var observer = new MutationObserver(function(mutations) {
        scanChatForWords();

        // Collect new messages for buddies to quote
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    var msgText = node.textContent || '';
                    // Extract just the message part (after username)
                    var colonIdx = msgText.indexOf(':');
                    if (colonIdx > -1) {
                        var cleanMsg = msgText.substring(colonIdx + 1).trim();
                        if (cleanMsg.length > 3 && cleanMsg.length < 80) {
                            recentChatMessages.push(cleanMsg);
                            // Keep only last 30 messages
                            if (recentChatMessages.length > 30) {
                                recentChatMessages.shift();
                            }
                        }
                    }
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
        el.innerHTML = '<img src="' + escapeHtml(customSettings.customSpriteUrl) + '" style="width:100%;height:100%;object-fit:contain;">' +
            '<span class="buddy-nametag">' + escapeHtml(displayName) + '</span>';
    } else {
        el.innerHTML = sprite.body + '<span class="buddy-nametag">' + escapeHtml(displayName) + '</span>';
    }

    // Apply size
    var size = BUDDY_SIZES.medium;
    if (customSettings && customSettings.size && BUDDY_SIZES[customSettings.size]) {
        size = BUDDY_SIZES[customSettings.size];
    }
    el.style.fontSize = size + 'px';

    // Apply color filters
    if (customSettings) {
        var filters = [];
        if (customSettings.hueRotate) filters.push('hue-rotate(' + customSettings.hueRotate + 'deg)');
        if (customSettings.saturation && customSettings.saturation !== 100) filters.push('saturate(' + customSettings.saturation + '%)');
        if (customSettings.brightness && customSettings.brightness !== 100) filters.push('brightness(' + customSettings.brightness + '%)');
        if (customSettings.glowColor && customSettings.glowIntensity > 0) {
            filters.push('drop-shadow(0 0 ' + customSettings.glowIntensity + 'px ' + customSettings.glowColor + ')');
        }
        if (filters.length > 0) {
            el.style.filter = filters.join(' ');
        }
    }

    // Starting position uses hash for some consistency
    var startX = zone.left + ((hash % 100) / 100) * (zone.right - zone.left);
    var startY = zone.top + (((hash >> 4) % 100) / 100) * (zone.bottom - zone.top);
    el.style.left = startX + 'px';
    el.style.top = startY + 'px';

    el.addEventListener('click', function(e) {
        e.stopPropagation();
        var b = buddyCharacters[username];
        if (b && b.state !== 'jumping' && !b.interacting) {
            b.element.classList.add('buddy-excited');
            showExpression(b, '😊');
            setTimeout(function() { b.element.classList.remove('buddy-excited'); }, 600);
        }
    });

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
        inConversation: false
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
    buddy.element.style.transition = 'opacity 0.4s, transform 0.4s';
    buddy.element.style.opacity = '0';
    buddy.element.style.transform = 'scale(0.3)';
    setTimeout(function() {
        if (buddy.element.parentNode) buddy.element.remove();
        delete buddyCharacters[username];
    }, 400);
}

function startBuddyAnimation() {
    if (buddyAnimationId) return;

    function update() {
        var names = Object.keys(buddyCharacters);
        var zone = getBuddyZone();

        names.forEach(function(name) {
            var b = buddyCharacters[name];
            if (!b || b.interacting) return;

            if (b.interactCooldown > 0) b.interactCooldown -= BUDDY_CONFIG.updateInterval;
            b.stateTime += BUDDY_CONFIG.updateInterval;

            if (b.state === 'idle') {
                if (b.stateTime > 2000 + Math.random() * 2000) {
                    var action = Math.random();
                    if (action < 0.5 && chatWordTargets.length > 0) {
                        var target = chatWordTargets[Math.floor(Math.random() * chatWordTargets.length)];
                        startJumpTo(b, target);
                    } else {
                        b.state = 'hopping';
                        b.stateTime = 0;
                        b.vx = (Math.random() - 0.5) * BUDDY_CONFIG.hopSpeed * 2;
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
                } else if (b.y > zone.bottom) {
                    b.y = zone.bottom;
                    b.state = 'idle';
                    b.stateTime = 0;
                    setAnim(b, 'idle');
                }
                b.x = Math.max(zone.left, Math.min(zone.right, b.x));
            } else if (b.state === 'perched') {
                if (b.stateTime > BUDDY_CONFIG.perchDuration) {
                    if (chatWordTargets.length > 1 && Math.random() < 0.6) {
                        var newTarget = chatWordTargets[Math.floor(Math.random() * chatWordTargets.length)];
                        startJumpTo(b, newTarget);
                    } else {
                        b.state = 'hopping';
                        b.stateTime = 0;
                        b.vx = (Math.random() - 0.5) * BUDDY_CONFIG.hopSpeed * 2;
                        setAnim(b, 'hopping');
                        updateFace(b);
                    }
                }
            } else if (b.state === 'hopping') {
                b.x += b.vx;
                if (b.x <= zone.left) { b.x = zone.left; b.vx = Math.abs(b.vx); updateFace(b); }
                else if (b.x >= zone.right) { b.x = zone.right; b.vx = -Math.abs(b.vx); updateFace(b); }

                if (b.stateTime > 2500 + Math.random() * 2000) {
                    if (chatWordTargets.length > 0 && Math.random() < 0.6) {
                        var t = chatWordTargets[Math.floor(Math.random() * chatWordTargets.length)];
                        startJumpTo(b, t);
                    } else {
                        b.state = 'idle';
                        b.stateTime = 0;
                        setAnim(b, 'idle');
                    }
                }
            }

            b.element.style.left = b.x + 'px';
            b.element.style.top = b.y + 'px';
        });

        checkInteractions(names);
        buddyAnimationId = setTimeout(update, BUDDY_CONFIG.updateInterval);
    }
    update();
}

function startJumpTo(b, target) {
    b.state = 'jumping';
    b.stateTime = 0;
    b.target = target;
    var dx = target.x - b.x;
    var dy = target.y - b.y;
    var frames = 18;
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

    var speech = document.createElement('div');
    speech.className = 'buddy-speech ' + (type || '');
    speech.setAttribute('data-buddy', b.element.id || '');
    speech.textContent = text;
    speech.style.left = (b.x - 20) + 'px';
    speech.style.top = (b.y - 50) + 'px';
    document.body.appendChild(speech);

    setTimeout(function() { if (speech.parentNode) speech.remove(); }, BUDDY_CONFIG.speechDuration);
}

// Get a random chat quote (modified/shortened)
function getRandomChatQuote() {
    if (recentChatMessages.length === 0) return null;
    var msg = recentChatMessages[Math.floor(Math.random() * recentChatMessages.length)];
    // Shorten and maybe modify
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

// Check for all interactions between buddies
function checkInteractions(names) {
    // Random speech from chat (local only, doesn't need sync)
    names.forEach(function(name) {
        var b = buddyCharacters[name];
        if (!b || b.interacting || b.speechCooldown > 0) return;
        b.speechCooldown -= BUDDY_CONFIG.updateInterval;

        if (Math.random() < BUDDY_CONFIG.speechChance) {
            var quote = getRandomChatQuote();
            if (quote) {
                showSpeechBubble(b, quote, 'flirt');
                showExpression(b, ['💬', '😊', '🗣️', '💭'][Math.floor(Math.random() * 4)]);
                b.speechCooldown = 8000; // 8 second cooldown
            }
        }
    });

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
                // Choose interaction based on both personalities
                startInteraction(names[i], names[j], b1, b2);
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
            var kissChance = (p1.kiss + p2.kiss) / 2;
            var chaseChance = (p1.chase + p2.chase) / 2;
            var fightChance = (p1.fight + p2.fight) / 2;
            var confessChance = (p1.confess + p2.confess) / 2;
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

    // Spawn floating hearts
    var count = 0;
    var heartInterval = setInterval(function() {
        var h = hearts[count];
        createKissEffect(mx + h.offsetX, my - 10, h.heart);
        if (++count >= 6) clearInterval(heartInterval);
    }, 200);

    // Heart burst in middle
    createHeartBurst(mx, my);

    setTimeout(function() { endKiss(n1, n2, rng); }, 2000);
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
    setTimeout(function() {
        showSpeechBubble(b2, selectedReaction.text, selectedReaction.type);
        showExpression(b2, selectedReaction.expr);
    }, 800);

    setTimeout(function() { endConfess(n1, n2); }, 3500);
}

function endConfess(n1, n2) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (b1) { b1.interacting = false; b1.interactCooldown = 8000; b1.state = 'idle'; setAnim(b1, 'idle'); }
    if (b2) { b2.interacting = false; b2.interactCooldown = 8000; b2.state = 'idle'; setAnim(b2, 'idle'); }
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

    setTimeout(function() {
        clearInterval(chaseInterval);
        endChase(n1, n2);
    }, 2500);
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

    setTimeout(function() {
        clearInterval(fleeInterval);
        endFlee(n1, n2);
    }, 1500);
}

function endFlee(n1, n2) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (b1) { b1.interacting = false; b1.interactCooldown = 4000; b1.state = 'idle'; setAnim(b1, 'idle'); }
    if (b2) { b2.interacting = false; b2.interactCooldown = 4000; b2.state = 'idle'; setAnim(b2, 'idle'); }
}

// Fighting interaction
function startFight(n1, n2, seededRandom) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    if (!b1 || !b2) return;
    var rng = seededRandom || Math.random;

    b1.interacting = b2.interacting = true;
    setAnim(b1, 'fighting');
    setAnim(b2, 'fighting');

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
        if (++count >= 4) clearInterval(iv);
    }, 250);

    setTimeout(function() { endFight(n1, n2, rng); }, BUDDY_CONFIG.fightDuration);
}

function endFight(n1, n2, rng) {
    var b1 = buddyCharacters[n1], b2 = buddyCharacters[n2];
    var r = rng || Math.random;
    var exprs = ['😮‍💨', '😤', '😊'];
    var e1 = exprs[Math.floor(r() * 3)];
    var e2 = exprs[Math.floor(r() * 3)];
    if (b1) {
        b1.interacting = false;
        b1.interactCooldown = 5000;
        b1.state = 'idle';
        b1.x -= 25;
        setAnim(b1, 'idle');
        showExpression(b1, e1);
    }
    if (b2) {
        b2.interacting = false;
        b2.interactCooldown = 5000;
        b2.state = 'idle';
        b2.x += 25;
        setAnim(b2, 'idle');
        showExpression(b2, e2);
    }
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

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
        setTimeout(nextLine, delay);
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
}
