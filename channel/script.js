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
    animation: null
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
            position: relative !important;
            background: #1e1e24 !important;
            border: 2px solid #555 !important;
            border-radius: 12px !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.9) !important;
            margin: 20px !important;
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
    var ox = 0, oy = 0, sx = 0, sy = 0;
    handle.onmousedown = function(e) {
        e.preventDefault();
        sx = e.clientX; sy = e.clientY;
        document.onmouseup = function() { document.onmouseup = null; document.onmousemove = null; };
        document.onmousemove = function(e) {
            ox = sx - e.clientX; oy = sy - e.clientY; sx = e.clientX; sy = e.clientY;
            el.style.top = (el.offsetTop - oy) + 'px';
            el.style.left = (el.offsetLeft - ox) + 'px';
            el.style.transform = 'none';
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

// TEXT STYLE POPUP
function createTextStylePopup() {
    if (document.getElementById('textstyle-popup-overlay')) return;
    var o = document.createElement('div');
    o.id = 'textstyle-popup-overlay';
    o.onclick = function(e) { if (e.target === o) closeTextStylePopup(); };
    
    // Basic colors
    var colors = ['white','yellow','orange','pink','red','lime','green','aqua','blue','violet','brown','silver'];
    var cbtns = colors.map(function(c) {
        var act = textStyleSettings.color === c ? ' active' : '';
        var st = 'color:' + (c === 'blue' ? '#55f' : c) + ';' + (c === 'white' ? 'background:#333;' : '');
        return '<button class="textstyle-btn color-btn' + act + '" data-color="' + c + '" style="' + st + '" onclick="selectStyleColor(\'' + c + '\')">' + c + '</button>';
    }).join('');
    
    // Gradients
    var gradients = [
        {name: 'rainbow', label: 'Rainbow', style: 'background:linear-gradient(90deg,#ff0000,#ff7700,#ffff00,#00ff00,#0077ff,#8b00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;'},
        {name: 'fire', label: 'Fire', style: 'background:linear-gradient(90deg,#ff0000,#ff5500,#ffaa00,#ffcc00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;'},
        {name: 'ocean', label: 'Ocean', style: 'background:linear-gradient(90deg,#00ffff,#0088ff,#0044aa,#002255);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;'},
        {name: 'sunset', label: 'Sunset', style: 'background:linear-gradient(90deg,#ff6b6b,#ffa500,#ffdb58,#ff6b9d);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;'},
        {name: 'neon', label: 'Neon', style: 'background:linear-gradient(90deg,#ff00ff,#00ffff,#ff00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;'},
        {name: 'forest', label: 'Forest', style: 'background:linear-gradient(90deg,#228b22,#32cd32,#90ee90,#006400);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;'},
        {name: 'gold', label: 'Gold', style: 'background:linear-gradient(90deg,#ffd700,#ffec8b,#daa520,#b8860b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;'},
        {name: 'ice', label: 'Ice', style: 'background:linear-gradient(90deg,#e0ffff,#87ceeb,#add8e6,#b0e0e6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;'}
    ];
    var gbtns = gradients.map(function(g) {
        var act = textStyleSettings.gradient === g.name ? ' active' : '';
        return '<button class="textstyle-btn gradient-btn' + act + '" data-gradient="' + g.name + '" style="' + g.style + 'font-weight:bold;" onclick="selectStyleGradient(\'' + g.name + '\')">' + g.label + '</button>';
    }).join('');
    
    // Glow effects
    var glows = [
        {name: 'glow-white', label: '✦ White', style: 'text-shadow:0 0 10px #fff,0 0 20px #fff,0 0 30px #fff;color:#fff;'},
        {name: 'glow-red', label: '✦ Red', style: 'text-shadow:0 0 10px #f00,0 0 20px #f00,0 0 30px #f00;color:#ff6666;'},
        {name: 'glow-blue', label: '✦ Blue', style: 'text-shadow:0 0 10px #00f,0 0 20px #00f,0 0 30px #0ff;color:#66f;'},
        {name: 'glow-green', label: '✦ Green', style: 'text-shadow:0 0 10px #0f0,0 0 20px #0f0,0 0 30px #0f0;color:#6f6;'},
        {name: 'glow-gold', label: '✦ Gold', style: 'text-shadow:0 0 10px #ffd700,0 0 20px #ffa500,0 0 30px #ff8c00;color:#ffd700;'},
        {name: 'glow-pink', label: '✦ Pink', style: 'text-shadow:0 0 10px #ff69b4,0 0 20px #ff1493,0 0 30px #ff69b4;color:#ff69b4;'},
        {name: 'glow-rainbow', label: '✦ Rainbow', style: 'text-shadow:0 0 5px #f00,0 0 10px #ff0,0 0 15px #0f0,0 0 20px #0ff,0 0 25px #00f,0 0 30px #f0f;color:#fff;'}
    ];
    var glowbtns = glows.map(function(g) {
        var act = textStyleSettings.glow === g.name ? ' active' : '';
        return '<button class="textstyle-btn glow-btn' + act + '" data-glow="' + g.name + '" style="' + g.style + '" onclick="selectStyleGlow(\'' + g.name + '\')">' + g.label + '</button>';
    }).join('');
    
    // Animations
    var animations = [
        {name: 'shake', label: '〰️ Shake'},
        {name: 'pulse', label: '💗 Pulse'},
        {name: 'bounce', label: '⬆️ Bounce'},
        {name: 'wave', label: '🌊 Wave'},
        {name: 'flicker', label: '⚡ Flicker'},
        {name: 'spin', label: '🔄 Spin'}
    ];
    var animbtns = animations.map(function(a) {
        var act = textStyleSettings.animation === a.name ? ' active' : '';
        return '<button class="textstyle-btn anim-btn' + act + '" data-anim="' + a.name + '" onclick="selectStyleAnimation(\'' + a.name + '\')">' + a.label + '</button>';
    }).join('');
    
    var p = document.createElement('div');
    p.id = 'textstyle-popup';
    p.innerHTML = '<div class="popup-header"><span>✨ Text Style Settings</span><button class="popup-close" onclick="closeTextStylePopup()">×</button></div>' +
        '<div class="textstyle-info"><p style="margin:0 0 8px">Select styles below. They <strong>auto-apply</strong> to all messages.</p><p style="margin:0;color:#fc0">⚠️ Admin must set up <a href="#" onclick="showFilterPopup();return false;">Chat Filters</a> first.</p></div>' +
        '<div class="textstyle-popup-scroll">' +
        '<div class="textstyle-section"><h4>Solid Colors</h4><div class="textstyle-grid">' + cbtns + '</div></div>' +
        '<div class="textstyle-section"><h4>🌈 Gradients</h4><div class="textstyle-grid">' + gbtns + '</div></div>' +
        '<div class="textstyle-section"><h4>✨ Glow Effects</h4><div class="textstyle-grid">' + glowbtns + '</div></div>' +
        '<div class="textstyle-section"><h4>🎬 Animations</h4><div class="textstyle-grid">' + animbtns + '</div></div>' +
        '<div class="textstyle-section"><h4>Text Effects</h4><div class="textstyle-grid">' +
        '<button class="textstyle-btn effect-btn' + (textStyleSettings.bold ? ' active' : '') + '" data-effect="bold" style="font-weight:bold" onclick="toggleStyleEffect(\'bold\')">Bold</button>' +
        '<button class="textstyle-btn effect-btn' + (textStyleSettings.italic ? ' active' : '') + '" data-effect="italic" style="font-style:italic" onclick="toggleStyleEffect(\'italic\')">Italic</button>' +
        '<button class="textstyle-btn effect-btn' + (textStyleSettings.underline ? ' active' : '') + '" data-effect="underline" style="text-decoration:underline" onclick="toggleStyleEffect(\'underline\')">Underline</button>' +
        '<button class="textstyle-btn effect-btn' + (textStyleSettings.strikethrough ? ' active' : '') + '" data-effect="strikethrough" style="text-decoration:line-through" onclick="toggleStyleEffect(\'strikethrough\')">Strike</button>' +
        '</div></div>' +
        '<div class="textstyle-section"><h4>Preview</h4><div id="textstyle-preview">Your message will look like this</div></div>' +
        '</div>' +
        '<div class="textstyle-section" style="border-top:1px solid #333;"><button id="textstyle-reset" onclick="resetTextStyle()">↺ Reset to Default</button></div>';
    o.appendChild(p);
    document.body.appendChild(o);
    updateStylePreview();
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
    // Clear gradient if selecting solid color
    if (textStyleSettings.color === c) {
        textStyleSettings.color = null;
    } else {
        textStyleSettings.color = c;
        textStyleSettings.gradient = null; // Can't have both
    }
    saveStyleSettings();
    refreshStyleBtns();
    updateStylePreview();
}

function selectStyleGradient(g) {
    if (textStyleSettings.gradient === g) {
        textStyleSettings.gradient = null;
    } else {
        textStyleSettings.gradient = g;
        textStyleSettings.color = null; // Can't have both
    }
    saveStyleSettings();
    refreshStyleBtns();
    updateStylePreview();
}

function selectStyleGlow(g) {
    textStyleSettings.glow = (textStyleSettings.glow === g) ? null : g;
    saveStyleSettings();
    refreshStyleBtns();
    updateStylePreview();
}

function selectStyleAnimation(a) {
    textStyleSettings.animation = (textStyleSettings.animation === a) ? null : a;
    saveStyleSettings();
    refreshStyleBtns();
    updateStylePreview();
}

function toggleStyleEffect(eff) {
    textStyleSettings[eff] = !textStyleSettings[eff];
    saveStyleSettings();
    refreshStyleBtns();
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
        animation: null
    };
    saveStyleSettings();
    refreshStyleBtns();
    updateStylePreview();
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
    
    // Color or gradient
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
    }
    
    // Glow
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
                   textStyleSettings.glow || textStyleSettings.animation;
    
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
                   textStyleSettings.glow || textStyleSettings.animation;
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
    
    // Glow effect
    if (textStyleSettings.glow) { 
        open += '[' + textStyleSettings.glow + ']'; 
        close = '[/]' + close; 
    }
    
    // Animation
    if (textStyleSettings.animation) { 
        open += '[' + textStyleSettings.animation + ']'; 
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
    if (msg.match(/^\[(?:red|blue|green|yellow|orange|pink|lime|aqua|violet|white|silver|brown|b|i|u|s|rainbow|fire|ocean|sunset|neon|forest|gold|ice|glow-\w+|shake|pulse|bounce|wave|flicker|spin)\]/)) return;
    
    // Check if any style is active
    var hasStyle = textStyleSettings.color || textStyleSettings.gradient || textStyleSettings.bold || 
                   textStyleSettings.italic || textStyleSettings.underline || textStyleSettings.strikethrough ||
                   textStyleSettings.glow || textStyleSettings.animation;
    if (!hasStyle) return;
    
    // Skip if message contains any emotes (emotes won't render if wrapped in tags)
    if (typeof CHANNEL !== 'undefined' && CHANNEL.emotes && CHANNEL.emotes.length > 0) {
        for (var i = 0; i < CHANNEL.emotes.length; i++) {
            var emoteName = CHANNEL.emotes[i].name;
            if (msg.indexOf(emoteName) !== -1) {
                console.log('[TextStyle] Emote detected: "' + emoteName + '" in message: "' + msg + '" - skipping styling');
                return; // Don't apply styling - let emote render normally
            }
        }
    }
    
    console.log('[TextStyle] No emotes found, applying styling to: "' + msg + '"');
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
    updateFontBtnIndicator();
});

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

socket.on('chatMsg', function(data) {
    formatChatMsg(data, $("#messagebuffer > div").last());
});
