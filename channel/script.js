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

/* Sets the variable used for mobile chat sizing */
setInterval(function () {document.documentElement.style.setProperty('--vh', window.innerHeight/100 + 'px');}, 20);

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
jumpBtn.innerHTML = "Scroll to current item";
jumpBtn.setAttribute("id", "jump-btn");
jumpBtn.setAttribute("class", "btn");
jumpBtn.onclick = function() { window.scrollQueue(); }
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

/* ========== POPUP SYSTEM ========== */
var emoteFavorites = JSON.parse(localStorage.getItem('emoteFavorites')) || [];
var currentEmotePage = 0;
var emotesPerPage = 50;
var textStyleSettings = JSON.parse(localStorage.getItem('textStyleSettings')) || {
    color: null,
    gradient: null,
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    glow: null,
    animation: null,
    font: null
};

// Username style settings
var usernameStyleSettings = JSON.parse(localStorage.getItem('usernameStyleSettings')) || {
    color: null,
    gradient: null,
    glow: null,
    animation: null,
    font: null,
    bold: false
};

// Inject popup CSS with !important to override any conflicts
(function() {
    var s = document.createElement('style');
    s.id = 'custom-popup-styles';
    s.textContent = `
        /* FIX: Button overflow in leftcontrols */
        #leftcontrols {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 4px !important;
            padding: 5px !important;
            align-items: center !important;
            justify-content: flex-start !important;
        }
        #leftcontrols .btn {
            flex-shrink: 0 !important;
            margin: 2px !important;
        }
        
        #emote-popup-overlay, #textstyle-popup-overlay, #filter-popup-overlay {
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
        #emote-popup-overlay.visible, #textstyle-popup-overlay.visible, #filter-popup-overlay.visible {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        #emote-popup, #textstyle-popup, #filter-popup {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            background: #1e1e24 !important;
            border: 2px solid #555 !important;
            border-radius: 12px !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.9) !important;
        }
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
        
        /* When styled username is present, hide original username elements via CSS */
        .chat-msg-with-styled-name .username,
        .chat-msg-with-styled-name .username + * {
            display: none !important;
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
    p.innerHTML = '<div class="popup-header" id="emote-popup-header"><span>Emotes</span><button class="popup-close" onclick="closeEmotePopup()">×</button></div>' +
        '<div id="emote-popup-tabs"><button class="emote-tab active" data-tab="all" onclick="switchEmoteTab(\'all\')">All Emotes</button><button class="emote-tab" data-tab="fav" onclick="switchEmoteTab(\'fav\')">★ Favorites</button><button class="emote-tab" data-tab="gif" onclick="switchEmoteTab(\'gif\')">🔍 GIFs</button></div>' +
        '<div id="emote-popup-search"><input type="text" placeholder="Search emotes..." oninput="filterEmotePopup(this.value)" onkeydown="handleEmoteSearchKey(event)"></div>' +
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
    if (tab === 'gif') {
        searchInput.placeholder = 'Search Tenor GIFs... (press Enter)';
        searchInput.value = lastGifSearch;
        renderGifTab();
    } else {
        searchInput.placeholder = 'Search emotes...';
        renderEmotes(tab);
    }
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
function insertEmote(name) { var c = document.getElementById('chatline'); if (c) { c.value += name + ' '; c.focus(); } }
function insertGif(url) { 
    var c = document.getElementById('chatline'); 
    if (c) { 
        c.value += url + ' '; 
        c.focus(); 
    } 
    closeEmotePopup();
}
function toggleEmoteFav(name, e) {
    e.stopPropagation();
    var i = emoteFavorites.indexOf(name);
    if (i !== -1) emoteFavorites.splice(i, 1); else emoteFavorites.unshift(name);
    localStorage.setItem('emoteFavorites', JSON.stringify(emoteFavorites));
    renderEmotes(document.querySelector('.emote-tab.active').dataset.tab, document.querySelector('#emote-popup-search input').value);
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

function searchTenorGifs(query, loadMore) {
    if (!query.trim()) return;
    lastGifSearch = query;
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
            d.innerHTML = '<img src="' + previewUrl + '" title="Click to insert" style="max-width:90px;max-height:90px;object-fit:contain;">';
            d.onclick = function() { insertGif(fullUrl); };
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
        '<div id="textstyle-tabs"><button class="style-tab active" data-tab="message" onclick="switchStyleTab(\'message\')">💬 Message</button><button class="style-tab" data-tab="username" onclick="switchStyleTab(\'username\')">👤 Username</button></div>' +
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
        
    } else {
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
    }
}

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
        '</table><p style="background:#234;padding:12px;border-radius:6px">After adding filters, text styling works for everyone!</p></div>';
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

$("#favorites-btn").after($("#voteskip"));
$('#newpollbtn').prependTo($("#leftcontrols"));

$(document).ready(function() {
    initStyleInterceptor();
    initUsernameStyleInterceptor();
    updateFontBtnIndicator();
    
    // Fix userlist display - with delay to ensure elements exist
    setTimeout(fixUserlistLayout, 1500);
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
    if (source) {
        source.scrollIntoView({ behavior: "smooth", block: "center" });
        source.animate({backgroundColor: ["rgba(0,0,0,0)", "rgba(255,255,255,0.3)", "rgba(0,0,0,0)"]}, 1000);
    }
}

function replyToMsg(target) {
    socket.once("chatMsg", function(data) {
        data.meta.reply = target;
        return data;
    });
}

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
    if (!usernameStyleSettings.enabled) return;
    
    var myName = getMyUsername();
    if (!myName) return;
    
    var c = document.getElementById('chatline');
    if (!c) return;
    var msg = c.value;
    
    // Skip commands
    if (msg.startsWith('/')) return;
    // Skip empty
    if (!msg.trim()) return;
    // Skip if already has username tag
    if (msg.startsWith('[uname]')) return;
    
    var openTags = buildUsernameOpenTags();
    var closeTags = buildUsernameCloseTags();
    
    // Only add if there are actual styles
    if (openTags) {
        c.value = '[uname]' + openTags + myName + closeTags + '[/uname] ' + msg;
    }
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

socket.on('chatMsg', function(data) {
    formatChatMsg(data, $("#messagebuffer > div").last());
});

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
        
        // Override with our version that strips username tags and converts GIF URLs
        window.nnd._fn.addScrollingMessage = function(message, extraClass) {
            if (typeof message === 'string') {
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
    
    // Also listen for playlist socket events to refresh names
    if (typeof socket !== 'undefined') {
        socket.on('playlist', function() {
            setTimeout(function() {
                addAllRenameButtons();
                applyAllCustomNames();
            }, 500);
        });
        
        socket.on('queue', function() {
            setTimeout(function() {
                addAllRenameButtons();
                applyAllCustomNames();
            }, 200);
        });
        
        socket.on('delete', function() {
            setTimeout(function() {
                addAllRenameButtons();
                applyAllCustomNames();
            }, 200);
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
        '#messagebuffer .chat-shadow { display: none !important; }' +
        /* Remove timestamps */ +
        '#messagebuffer .timestamp { display: none !important; }' +
        /* Remove reply buttons */ +
        '.reply-button { display: none !important; }';
    document.head.appendChild(hideJoinLeaveCSS);
})();

/* ========== CUSTOM COLUMN RESIZER ========== */
(function() {
    var resizeHandle = null;
    var isResizing = false;
    var startX = 0;
    var startWidth = 0;
    
    // CSS for resizer
    var resizerCSS = document.createElement('style');
    resizerCSS.id = 'column-resizer-css';
    resizerCSS.textContent = `
        /* Only apply flex layout on desktop */
        @media (min-width: 769px) {
            #content-wrap {
                display: flex !important;
                flex-direction: row !important;
                width: 100% !important;
            }
            
            #leftcontent {
                flex-shrink: 0 !important;
                box-sizing: border-box !important;
            }
            
            #rightcontent {
                flex: 1 !important;
                min-width: 0 !important;
                box-sizing: border-box !important;
            }
            
            #column-resize-handle {
                width: 6px !important;
                background: rgba(100, 100, 100, 0.3) !important;
                cursor: col-resize !important;
                flex-shrink: 0 !important;
                transition: background 0.2s !important;
                position: relative !important;
                z-index: 1000 !important;
            }
            
            #column-resize-handle:hover {
                background: rgba(150, 150, 150, 0.6) !important;
            }
            
            #column-resize-handle::before {
                content: '⋮' !important;
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                color: rgba(255, 255, 255, 0.6) !important;
                font-size: 18px !important;
                pointer-events: none !important;
            }
        }
        
        /* Hide resize handle on mobile */
        @media (max-width: 768px) {
            #column-resize-handle {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(resizerCSS);
    
    function initResizer() {
        // Only initialize on desktop
        if (window.innerWidth <= 768) {
            console.log('[Column Resizer] Skipping on mobile');
            return;
        }
        
        var contentWrap = document.getElementById('content-wrap');
        var leftContent = document.getElementById('leftcontent');
        var rightContent = document.getElementById('rightcontent');
        
        if (!contentWrap || !leftContent || !rightContent) {
            console.log('[Column Resizer] Elements not ready, retrying...');
            setTimeout(initResizer, 500);
            return;
        }
        
        // Check if rightContent is a sibling (desktop mode)
        if (rightContent.parentElement !== contentWrap) {
            console.log('[Column Resizer] Not in desktop layout, skipping');
            return;
        }
        
        // Don't create multiple handles
        if (document.getElementById('column-resize-handle')) {
            console.log('[Column Resizer] Handle already exists');
            return;
        }
        
        // Create resize handle
        resizeHandle = document.createElement('div');
        resizeHandle.id = 'column-resize-handle';
        resizeHandle.title = 'Drag to resize video/chat columns';
        
        // Insert handle between left and right content
        contentWrap.insertBefore(resizeHandle, rightContent);
        
        // Load saved width or use default 88%
        var savedWidth = localStorage.getItem('cytube_video_width');
        if (savedWidth) {
            leftContent.style.width = savedWidth;
            console.log('[Column Resizer] Loaded saved width:', savedWidth);
        } else {
            leftContent.style.width = '88%';
            console.log('[Column Resizer] Using default width: 88%');
        }
        
        // Mouse down on handle
        resizeHandle.addEventListener('mousedown', function(e) {
            isResizing = true;
            startX = e.clientX;
            startWidth = leftContent.offsetWidth;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
            console.log('[Column Resizer] Started resizing');
        });
        
        // Mouse move anywhere
        document.addEventListener('mousemove', function(e) {
            if (!isResizing) return;
            
            var deltaX = e.clientX - startX;
            var newWidth = startWidth + deltaX;
            var containerWidth = contentWrap.offsetWidth;
            var percentWidth = (newWidth / containerWidth) * 100;
            
            // Constrain between 50% and 95%
            if (percentWidth >= 50 && percentWidth <= 95) {
                leftContent.style.width = percentWidth + '%';
            }
        });
        
        // Mouse up anywhere
        document.addEventListener('mouseup', function() {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                
                // Save the width
                var containerWidth = contentWrap.offsetWidth;
                var percentWidth = (leftContent.offsetWidth / containerWidth) * 100;
                var savedValue = percentWidth.toFixed(1) + '%';
                localStorage.setItem('cytube_video_width', savedValue);
                
                console.log('[Column Resizer] Saved width:', savedValue);
            }
        });
        
        console.log('[Column Resizer] ✓ Initialized successfully');
    }
    
    function removeResizer() {
        if (resizeHandle && resizeHandle.parentElement) {
            resizeHandle.parentElement.removeChild(resizeHandle);
            resizeHandle = null;
            console.log('[Column Resizer] Removed for mobile');
        }
    }
    
    // Initialize after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initResizer, 1500);
        });
    } else {
        setTimeout(initResizer, 1500);
    }
    
    // Handle window resize (desktop ↔ mobile)
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            removeResizer();
        } else {
            if (!document.getElementById('column-resize-handle')) {
                setTimeout(initResizer, 500);
            }
        }
    });
})();

/* ========== CUSTOM COLUMN RESIZER ========== */
(function() {
    'use strict';
    
    var resizeHandle = null;
    var isResizing = false;
    var startX = 0;
    var startWidth = 0;
    
    // Add CSS for resizer
    var resizerCSS = document.createElement('style');
    resizerCSS.id = 'column-resizer-css';
    resizerCSS.textContent = `
        /* Only apply flex layout on desktop */
        @media (min-width: 769px) {
            #content-wrap {
                display: flex !important;
                flex-direction: row !important;
                width: 100% !important;
                gap: 0 !important;
            }
            
            #leftcontent {
                flex-shrink: 0 !important;
                box-sizing: border-box !important;
            }
            
            #rightcontent {
                flex: 1 !important;
                min-width: 0 !important;
                box-sizing: border-box !important;
            }
            
            #column-resize-handle {
                width: 6px !important;
                background: rgba(100, 100, 100, 0.3) !important;
                cursor: col-resize !important;
                flex-shrink: 0 !important;
                transition: background 0.2s !important;
                position: relative !important;
                z-index: 1000 !important;
            }
            
            #column-resize-handle:hover {
                background: rgba(150, 150, 150, 0.6) !important;
            }
            
            #column-resize-handle:active,
            #column-resize-handle.resizing {
                background: rgba(200, 200, 200, 0.8) !important;
            }
            
            #column-resize-handle::after {
                content: '⋮' !important;
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                color: rgba(255, 255, 255, 0.4) !important;
                font-size: 18px !important;
                pointer-events: none !important;
            }
            
            body.col-resizing {
                cursor: col-resize !important;
                user-select: none !important;
            }
        }
    `;
    document.head.appendChild(resizerCSS);
    
    function initResizer() {
        // Only run on desktop
        if (window.innerWidth <= 768) {
            console.log('[Resizer] Skipping - mobile view');
            return;
        }
        
        var contentWrap = document.getElementById('content-wrap');
        var leftContent = document.getElementById('leftcontent');
        var rightContent = document.getElementById('rightcontent');
        
        if (!contentWrap || !leftContent || !rightContent) {
            console.log('[Resizer] Elements not ready, retrying...');
            setTimeout(initResizer, 500);
            return;
        }
        
        // Check if rightcontent is a sibling (desktop mode)
        if (rightContent.parentElement !== contentWrap) {
            console.log('[Resizer] Not in desktop layout mode');
            return;
        }
        
        // Don't add handle twice
        if (document.getElementById('column-resize-handle')) {
            console.log('[Resizer] Handle already exists');
            return;
        }
        
        // Create resize handle
        resizeHandle = document.createElement('div');
        resizeHandle.id = 'column-resize-handle';
        resizeHandle.title = 'Drag to resize video/chat columns';
        
        // Insert handle between left and right content
        contentWrap.insertBefore(resizeHandle, rightContent);
        
        // Load saved width or use default
        var savedWidth = localStorage.getItem('cytube_column_width');
        if (savedWidth) {
            leftContent.style.width = savedWidth;
            console.log('[Resizer] Loaded saved width:', savedWidth);
        } else {
            leftContent.style.width = '88%';
            console.log('[Resizer] Using default width: 88%');
        }
        
        // Mouse down on handle
        resizeHandle.addEventListener('mousedown', function(e) {
            isResizing = true;
            startX = e.clientX;
            startWidth = leftContent.offsetWidth;
            
            document.body.classList.add('col-resizing');
            resizeHandle.classList.add('resizing');
            
            e.preventDefault();
        });
        
        // Mouse move
        document.addEventListener('mousemove', function(e) {
            if (!isResizing) return;
            
            var deltaX = e.clientX - startX;
            var newWidth = startWidth + deltaX;
            var containerWidth = contentWrap.offsetWidth;
            var percentWidth = (newWidth / containerWidth) * 100;
            
            // Constrain between 50% and 95%
            if (percentWidth >= 50 && percentWidth <= 95) {
                leftContent.style.width = percentWidth + '%';
            }
        });
        
        // Mouse up
        document.addEventListener('mouseup', function() {
            if (isResizing) {
                isResizing = false;
                document.body.classList.remove('col-resizing');
                resizeHandle.classList.remove('resizing');
                
                // Save the width
                var containerWidth = contentWrap.offsetWidth;
                var leftWidth = leftContent.offsetWidth;
                var percentWidth = (leftWidth / containerWidth) * 100;
                var savedValue = percentWidth.toFixed(1) + '%';
                
                localStorage.setItem('cytube_column_width', savedValue);
                console.log('[Resizer] Saved width:', savedValue);
            }
        });
        
        console.log('[Resizer] ✓ Initialized successfully');
    }
    
    function removeResizer() {
        var handle = document.getElementById('column-resize-handle');
        if (handle) {
            handle.remove();
            console.log('[Resizer] Removed handle (mobile mode)');
        }
    }
    
    // Initialize after a delay
    setTimeout(function() {
        initResizer();
    }, 1500);
    
    // Handle window resize - reinit if switching between mobile/desktop
    var currentlyMobile = window.innerWidth <= 768;
    window.addEventListener('resize', function() {
        var nowMobile = window.innerWidth <= 768;
        
        if (currentlyMobile && !nowMobile) {
            // Switched to desktop
            console.log('[Resizer] Switched to desktop mode');
            setTimeout(initResizer, 500);
        } else if (!currentlyMobile && nowMobile) {
            // Switched to mobile
            console.log('[Resizer] Switched to mobile mode');
            removeResizer();
        }
        
        currentlyMobile = nowMobile;
    });
})();
