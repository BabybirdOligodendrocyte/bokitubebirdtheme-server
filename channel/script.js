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

/* Sets the variable used for mobile chat sizing every 20 milliseconds */
setInterval(function () {document.documentElement.style.setProperty('--vh', `${window.innerHeight/100}px`);}, 20);

/* Positions the chat depending on media query */
function chatPosition(x) {
    if (x.matches) {
        $("#rightcontent").appendTo($("#leftcontent"));
        $("#channel-content").appendTo($("#leftcontent"));
        $("#footer").appendTo($("#leftcontent"));
        
        document.getElementById("chatline").onclick = function() {
            var counter = 0;
            var clickChatInterval = setInterval(() => {
                document.documentElement.scrollTop = 0;
                if (++counter === 10) {
                    window.clearInterval(clickChatInterval);
                }
            }, 50);
        }

        setInterval(function () {
            document.documentElement.style.setProperty('--vh', `${window.innerHeight/100}px`);
        }, 20);
    } else {
        $("#rightcontent").appendTo($("#content-wrap"));
        document.documentElement.style.setProperty('--vh', `${window.innerHeight/100}px`);
    }
}
  
var mediaQuery = window.matchMedia("(max-width: 768px)");
chatPosition(mediaQuery);
mediaQuery.addEventListener('change', chatPosition);

/* Add jump to current item button */
const jumpBtn = document.createElement("button");
jumpBtn.innerHTML = "Scroll to current item"
jumpBtn.setAttribute("id", "jump-btn");
jumpBtn.setAttribute("class", "btn");
jumpBtn.onclick = function() {
    window.scrollQueue();
}
const rightControls = document.getElementById("rightcontrols");
rightControls.insertBefore(jumpBtn, rightControls.children[1]);

//OLDER CODE: DON'T TOUCH
/* AFK on unfocus function */
var VOL_AFK = false;
var FOCUS_AFK = false;
setInterval(function() {
    if (VOL_AFK === false && FOCUS_AFK === false) {
        $("#userlist").find('span[class^=userlist]').each(function() {
            if ($(this).html() == CLIENT.name && $(this).css('font-style') == "italic") {
                socket.emit("chatMsg", {
                    msg: '/afk'
                });
                return;
            }
        });
    }
}, 500);

window.addEventListener("focus", () => {
    if (FOCUS_AFK && VOL_AFK) {
        socket.emit("chatMsg", {
            msg: '/afk'
        });
        FOCUS_AFK = !FOCUS_AFK;
        VOL_AFK = !VOL_AFK;
    }
});

window.addEventListener("blur", () => {
    if (!FOCUS_AFK && !VOL_AFK) {
        socket.emit("chatMsg", {
            msg: '/afk'
        });
        FOCUS_AFK = !FOCUS_AFK;
        VOL_AFK = !VOL_AFK;
    }
});

/* Adds favicon and externally hosted fonts from Google Fonts */
$(document).ready(function() {
    if (window.location.host == 'cytu.be') {
        if (typeof channelName !== 'undefined') $(".navbar-brand").html(channelName);
        if (typeof faviconUrl !== 'undefined') $('<link id="chanfavicon" href="' + faviconUrl + '" type="image/x-icon" rel="shortcut icon" />').appendTo("head");
    }

    $('<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Ubuntu">').appendTo("head");
    $('<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Quicksand">').appendTo("head");
});

/* Adds CSS preview button to built-in CSS editor */
$('<button class="btn btn-primary" id="cs-csspreview">Preview CSS</button>')
    .appendTo("#cs-csseditor")
    .on("mousedown", function() {
        document.getElementById("channeloptions").style.visibility = "hidden";
        document.getElementById("cs-csseditor").style.visibility = "hidden";
        document.getElementById("cs-csspreview").style.visibility = "visible";
    })
    .on("mouseout", function() {
        document.getElementById("channeloptions").style.visibility = "visible";
        document.getElementById("cs-csseditor").style.visibility = "visible";
    })
    .on("mouseup", function() {
        document.getElementById("channeloptions").style.visibility = "visible";
        document.getElementById("cs-csseditor").style.visibility = "visible";
    });

/* Add custom AFK button for manual AFK */
$('<button id="afk-btn" class="btn btn-default btn-sm">AFK</button>')
    .appendTo("#leftcontrols")
    .on("click", function() {
        socket.emit("chatMsg", {
            msg: '/afk'
        });
        VOL_AFK = !VOL_AFK;
    });

/* Add button to clear chat */
$('<button id="clear-btn" class="btn btn-default btn-sm">Clear</button>')
    .appendTo("#leftcontrols")
    .on("click", function() {
        socket.emit("chatMsg", {
            msg: '/clear'
        });
    });

/* ========== EMOTE PANEL SYSTEM ========== */

// Initialize favorites from localStorage
var emoteFavorites = JSON.parse(localStorage.getItem('emoteFavorites')) || [];

// Initialize emote panel position from localStorage
if (!localStorage.emotePanelTop) localStorage.emotePanelTop = 100;
if (!localStorage.emotePanelLeft) localStorage.emotePanelLeft = 100;

// Create the floating emote panel container
function createEmotePanel() {
    const panel = document.createElement('div');
    panel.id = 'emote-panel';
    panel.className = 'emote-panel';
    panel.style.top = localStorage.emotePanelTop + 'px';
    panel.style.left = localStorage.emotePanelLeft + 'px';
    panel.style.display = 'none';
    
    panel.innerHTML = `
        <div class="emote-panel-header" id="emote-panel-header">
            <span class="emote-panel-title">Emotes</span>
            <div class="emote-panel-controls">
                <button class="emote-panel-close" onclick="closeEmotePanel()" title="Close">&times;</button>
            </div>
        </div>
        <div class="emote-panel-tabs">
            <button class="emote-tab active" data-tab="all" onclick="switchEmoteTab('all')">All</button>
            <button class="emote-tab" data-tab="favorites" onclick="switchEmoteTab('favorites')">★ Favorites</button>
        </div>
        <div class="emote-panel-search">
            <input type="text" id="emote-search" placeholder="Search emotes..." oninput="filterEmotes(this.value)">
        </div>
        <div class="emote-panel-body" id="emote-panel-body">
            <!-- Emotes will be populated here -->
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Make panel draggable
    makeDraggable(panel, document.getElementById('emote-panel-header'));
}

// Switch between All and Favorites tabs
function switchEmoteTab(tab) {
    document.querySelectorAll('.emote-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.emote-tab[data-tab="${tab}"]`).classList.add('active');
    
    if (tab === 'all') {
        populateEmotePanel(CHANNEL.emotes);
    } else {
        const favoriteEmotes = CHANNEL.emotes.filter(e => emoteFavorites.includes(e.name));
        populateEmotePanel(favoriteEmotes, true);
    }
}

// Filter emotes by search term
function filterEmotes(searchTerm) {
    const activeTab = document.querySelector('.emote-tab.active').dataset.tab;
    let emotes = CHANNEL.emotes;
    
    if (activeTab === 'favorites') {
        emotes = CHANNEL.emotes.filter(e => emoteFavorites.includes(e.name));
    }
    
    if (searchTerm.trim()) {
        emotes = emotes.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    populateEmotePanel(emotes, activeTab === 'favorites');
}

// Populate the emote panel with emotes
function populateEmotePanel(emotes, isFavoritesTab = false) {
    const body = document.getElementById('emote-panel-body');
    body.innerHTML = '';
    
    if (emotes.length === 0) {
        body.innerHTML = `<div class="emote-panel-empty">${isFavoritesTab ? 'No favorite emotes yet. Click ★ on emotes to add them!' : 'No emotes found.'}</div>`;
        return;
    }
    
    emotes.forEach(emote => {
        const emoteItem = document.createElement('div');
        emoteItem.className = 'emote-item';
        
        const isFavorite = emoteFavorites.includes(emote.name);
        
        emoteItem.innerHTML = `
            <img src="${emote.image}" alt="${emote.name}" title="${emote.name}" onclick="insertEmote('${emote.name}')">
            <button class="emote-fav-btn ${isFavorite ? 'favorited' : ''}" onclick="toggleFavorite('${emote.name}', event)" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">★</button>
        `;
        
        body.appendChild(emoteItem);
    });
}

// Insert emote into chat
function insertEmote(emoteName) {
    $("#chatline").val($("#chatline").val() + emoteName + ' ').focus();
}

// Toggle favorite status
function toggleFavorite(emoteName, event) {
    event.stopPropagation();
    
    const index = emoteFavorites.indexOf(emoteName);
    if (index > -1) {
        emoteFavorites.splice(index, 1);
    } else {
        emoteFavorites.unshift(emoteName);
    }
    
    localStorage.setItem('emoteFavorites', JSON.stringify(emoteFavorites));
    
    // Update UI
    const btn = event.target;
    btn.classList.toggle('favorited');
    
    // If on favorites tab, refresh the view
    const activeTab = document.querySelector('.emote-tab.active').dataset.tab;
    if (activeTab === 'favorites') {
        switchEmoteTab('favorites');
    }
    
    // Update favorites dropdown if open
    updateFavoritesDropdown();
}

// Open emote panel
function openEmotePanel() {
    let panel = document.getElementById('emote-panel');
    if (!panel) {
        createEmotePanel();
        panel = document.getElementById('emote-panel');
    }
    
    // Reset search
    const searchInput = document.getElementById('emote-search');
    if (searchInput) searchInput.value = '';
    
    // Reset to All tab
    switchEmoteTab('all');
    
    panel.style.display = 'flex';
}

// Close emote panel
function closeEmotePanel() {
    const panel = document.getElementById('emote-panel');
    if (panel) {
        panel.style.display = 'none';
    }
}

// Toggle emote panel
function toggleEmotePanel() {
    const panel = document.getElementById('emote-panel');
    if (panel && panel.style.display !== 'none') {
        closeEmotePanel();
    } else {
        openEmotePanel();
    }
}

// Make element draggable
function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    handle.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        let newTop = element.offsetTop - pos2;
        let newLeft = element.offsetLeft - pos1;
        
        // Keep within viewport
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - 100));
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 100));
        
        element.style.top = newTop + "px";
        element.style.left = newLeft + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        
        // Save position
        localStorage.emotePanelTop = parseInt(element.style.top);
        localStorage.emotePanelLeft = parseInt(element.style.left);
    }
}

/* ========== FAVORITES QUICK ACCESS DROPDOWN ========== */

// Create favorites dropdown
function createFavoritesDropdown() {
    const dropdown = document.createElement('div');
    dropdown.id = 'favorites-dropdown';
    dropdown.className = 'favorites-dropdown';
    dropdown.style.display = 'none';
    
    document.body.appendChild(dropdown);
    
    return dropdown;
}

// Update favorites dropdown content
function updateFavoritesDropdown() {
    let dropdown = document.getElementById('favorites-dropdown');
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    
    if (emoteFavorites.length === 0) {
        dropdown.innerHTML = '<div class="favorites-empty">No favorites yet!</div>';
        return;
    }
    
    emoteFavorites.forEach(emoteName => {
        const emote = CHANNEL.emotes.find(e => e.name === emoteName);
        if (emote) {
            const img = document.createElement('img');
            img.src = emote.image;
            img.alt = emote.name;
            img.title = emote.name;
            img.onclick = function() {
                insertEmote(emote.name);
                closeFavoritesDropdown();
            };
            dropdown.appendChild(img);
        }
    });
}

// Show favorites dropdown
function showFavoritesDropdown() {
    let dropdown = document.getElementById('favorites-dropdown');
    if (!dropdown) {
        dropdown = createFavoritesDropdown();
    }
    
    updateFavoritesDropdown();
    
    // Position near the favorites button
    const btn = document.getElementById('favorites-btn');
    const rect = btn.getBoundingClientRect();
    
    dropdown.style.bottom = (window.innerHeight - rect.top + 5) + 'px';
    dropdown.style.left = rect.left + 'px';
    dropdown.style.display = 'flex';
}

// Close favorites dropdown
function closeFavoritesDropdown() {
    const dropdown = document.getElementById('favorites-dropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

// Toggle favorites dropdown
function toggleFavoritesDropdown() {
    const dropdown = document.getElementById('favorites-dropdown');
    if (dropdown && dropdown.style.display !== 'none') {
        closeFavoritesDropdown();
    } else {
        showFavoritesDropdown();
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('favorites-dropdown');
    const favBtn = document.getElementById('favorites-btn');
    
    if (dropdown && dropdown.style.display !== 'none') {
        if (!dropdown.contains(e.target) && e.target !== favBtn && !favBtn.contains(e.target)) {
            closeFavoritesDropdown();
        }
    }
});

/* ========== BUTTON SETUP ========== */

/* Remove original emote button */
$("#emotelistbtn").remove();

/* Replace text with icons */
$("#newpollbtn").html(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#FFFFFF" viewBox="0 0 490.4 490.4"><path d="M17.2,251.55c-9.5,0-17.2,7.7-17.2,17.1v179.7c0,9.5,7.7,17.2,17.2,17.2h113c9.5,0,17.1-7.7,17.1-17.2v-179.7c0-9.5-7.7-17.1-17.1-17.1L17.2,251.55L17.2,251.55z M113,431.25H34.3v-145.4H113V431.25z"/><path d="M490.4,448.45v-283.7c0-9.5-7.7-17.2-17.2-17.2h-113c-9.5,0-17.2,7.7-17.2,17.2v283.6c0,9.5,7.7,17.2,17.2,17.2h113C482.7,465.55,490.4,457.85,490.4,448.45z M456.1,431.25h-78.7v-249.3h78.7L456.1,431.25L456.1,431.25z"/><path d="M301.7,465.55c9.5,0,17.1-7.7,17.1-17.2V42.05c0-9.5-7.7-17.2-17.1-17.2h-113c-9.5,0-17.2,7.7-17.2,17.2v406.3c0,9.5,7.7,17.2,17.2,17.2H301.7z M205.9,59.25h78.7v372h-78.7L205.9,59.25L205.9,59.25z"/></svg>`)
$('#newpollbtn').attr("title", "Create new poll")

/* Add emotes button (happy face) */
const emotesbtn = $('<button id="emotes-btn" class="btn btn-sm btn-default" title="Open emotes panel"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#FFFFFF" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.507 13.941c-1.512 1.195-3.174 1.931-5.506 1.931-2.334 0-3.996-.736-5.508-1.931l-.493.493c1.127 1.72 3.2 3.566 6.001 3.566 2.8 0 4.872-1.846 5.999-3.566l-.493-.493zm-9.007-5.941c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm7 0c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5z"/></svg></button>')
    .prependTo("#leftcontrols")
    .on("click", function() { 
        toggleEmotePanel(); 
    });

/* Add favorites button (star) next to emotes button */
const favoritesbtn = $('<button id="favorites-btn" class="btn btn-sm btn-default" title="Quick access to favorite emotes"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#FFD700" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>')
    .insertAfter("#emotes-btn")
    .on("click", function(e) {
        e.stopPropagation();
        toggleFavoritesDropdown();
    });

/* Add font tags button for text styling */
const fontTagsBtn = $('<button id="font-tags-btn" class="btn btn-sm btn-default" title="Text formatting tags (requires Chat Filters setup)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#FFFFFF" viewBox="0 0 24 24"><path d="M5 4v3h5.5v12h3V7H19V4z"/></svg></button>')
    .insertAfter("#favorites-btn")
    .on("click", function() {
        openFontTagsPanel();
    });

$("#favorites-btn").after($("#voteskip"));
$('#newpollbtn').prependTo($("#leftcontrols"));

/* ========== FONT TAGS PANEL (Server-Side Compatible) ========== */

function createFontTagsPanel() {
    const panel = document.createElement('div');
    panel.id = 'font-tags-panel';
    panel.className = 'font-tags-panel';
    panel.style.display = 'none';
    
    panel.innerHTML = `
        <div class="font-tags-header">
            <span>Text Formatting Tags</span>
            <button class="font-tags-close" onclick="closeFontTagsPanel()">&times;</button>
        </div>
        <div class="font-tags-info">
            <p>Click a tag to insert it. Use <code>[tag]text[/]</code> format.</p>
            <p class="font-tags-note">⚠️ <strong>Admin Setup Required:</strong> These tags only work if Chat Filters are configured. <a href="#" onclick="showFilterInstructions(); return false;">View setup instructions</a></p>
        </div>
        <div class="font-tags-section">
            <h4>Colors</h4>
            <div class="font-tags-grid">
                <button class="font-tag-btn" style="color: white; background: #333;" onclick="insertFontTag('[white]')">[white]</button>
                <button class="font-tag-btn" style="color: yellow;" onclick="insertFontTag('[yellow]')">[yellow]</button>
                <button class="font-tag-btn" style="color: orange;" onclick="insertFontTag('[orange]')">[orange]</button>
                <button class="font-tag-btn" style="color: pink;" onclick="insertFontTag('[pink]')">[pink]</button>
                <button class="font-tag-btn" style="color: red;" onclick="insertFontTag('[red]')">[red]</button>
                <button class="font-tag-btn" style="color: lime;" onclick="insertFontTag('[lime]')">[lime]</button>
                <button class="font-tag-btn" style="color: green;" onclick="insertFontTag('[green]')">[green]</button>
                <button class="font-tag-btn" style="color: aqua;" onclick="insertFontTag('[aqua]')">[aqua]</button>
                <button class="font-tag-btn" style="color: #5555ff;" onclick="insertFontTag('[blue]')">[blue]</button>
                <button class="font-tag-btn" style="color: violet;" onclick="insertFontTag('[violet]')">[violet]</button>
                <button class="font-tag-btn" style="color: brown;" onclick="insertFontTag('[brown]')">[brown]</button>
                <button class="font-tag-btn" style="color: silver;" onclick="insertFontTag('[silver]')">[silver]</button>
            </div>
        </div>
        <div class="font-tags-section">
            <h4>Styles</h4>
            <div class="font-tags-grid">
                <button class="font-tag-btn" style="font-weight: bold;" onclick="insertFontTag('[b]')">[b] Bold</button>
                <button class="font-tag-btn" style="font-style: italic;" onclick="insertFontTag('[i]')">[i] Italic</button>
                <button class="font-tag-btn" style="text-decoration: underline;" onclick="insertFontTag('[u]')">[u] Underline</button>
                <button class="font-tag-btn" style="text-decoration: line-through;" onclick="insertFontTag('[s]')">[s] Strike</button>
                <button class="font-tag-btn" onclick="insertFontTag('[sp]')">[sp] Spoiler</button>
                <button class="font-tag-btn" onclick="insertFontTag('[/]')">[/] Close Tag</button>
            </div>
        </div>
        <div class="font-tags-section">
            <h4>Example</h4>
            <code class="font-tags-example">[red]Hello [b]World[/][/]</code>
        </div>
    `;
    
    document.body.appendChild(panel);
}

function openFontTagsPanel() {
    let panel = document.getElementById('font-tags-panel');
    if (!panel) {
        createFontTagsPanel();
        panel = document.getElementById('font-tags-panel');
    }
    panel.style.display = 'flex';
}

function closeFontTagsPanel() {
    const panel = document.getElementById('font-tags-panel');
    if (panel) {
        panel.style.display = 'none';
    }
}

function insertFontTag(tag) {
    const chatline = document.getElementById('chatline');
    const start = chatline.selectionStart;
    const end = chatline.selectionEnd;
    const text = chatline.value;
    
    if (start !== end) {
        // Text is selected - wrap it with tags
        const selectedText = text.substring(start, end);
        const closeTag = '[/]';
        chatline.value = text.substring(0, start) + tag + selectedText + closeTag + text.substring(end);
    } else {
        // No selection - just insert the tag
        chatline.value = text.substring(0, start) + tag + text.substring(end);
    }
    
    chatline.focus();
}

function showFilterInstructions() {
    closeFontTagsPanel();
    
    const modal = document.createElement('div');
    modal.id = 'filter-instructions-modal';
    modal.className = 'filter-instructions-modal';
    modal.innerHTML = `
        <div class="filter-instructions-content">
            <div class="filter-instructions-header">
                <h2>Chat Filters Setup</h2>
                <button onclick="closeFilterInstructions()">&times;</button>
            </div>
            <div class="filter-instructions-body">
                <p>To enable text formatting visible to <strong>all users</strong>, a channel admin must set up Chat Filters:</p>
                <ol>
                    <li>Go to <strong>Channel Settings</strong> → <strong>Edit</strong> → <strong>Chat Filters</strong></li>
                    <li>Add the following filters (one at a time):</li>
                </ol>
                <div class="filter-list">
                    <table>
                        <tr><th>Name</th><th>Regex</th><th>Flags</th><th>Replacement</th></tr>
                        <tr><td>red</td><td>\\[red\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:red"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td>blue</td><td>\\[blue\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:#5555ff"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td>green</td><td>\\[green\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:green"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td>yellow</td><td>\\[yellow\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:yellow"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td>orange</td><td>\\[orange\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:orange"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td>pink</td><td>\\[pink\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:pink"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td>lime</td><td>\\[lime\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:lime"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td>aqua</td><td>\\[aqua\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:aqua"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td>violet</td><td>\\[violet\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:violet"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td>white</td><td>\\[white\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:white"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td>silver</td><td>\\[silver\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:silver"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td>brown</td><td>\\[brown\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span style="color:brown"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td>bold</td><td>\\[b\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;strong&gt;$1&lt;/strong&gt;</td></tr>
                        <tr><td>italic</td><td>\\[i\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;em&gt;$1&lt;/em&gt;</td></tr>
                        <tr><td>underline</td><td>\\[u\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;u&gt;$1&lt;/u&gt;</td></tr>
                        <tr><td>strike</td><td>\\[s\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;s&gt;$1&lt;/s&gt;</td></tr>
                        <tr><td>spoiler</td><td>\\[sp\\]([^\\[]+)\\[/\\]</td><td>g</td><td>&lt;span class="spoiler"&gt;$1&lt;/span&gt;</td></tr>
                    </table>
                </div>
                <p class="filter-note">After adding these filters, users can type <code>[red]Hello[/]</code> to display red text visible to everyone!</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function closeFilterInstructions() {
    const modal = document.getElementById('filter-instructions-modal');
    if (modal) {
        modal.remove();
    }
}

/* ========== AUTOCOMPLETE FOR EMOTES ========== */

var autocompleteArr = [];

function emotesPanel() {
    autocompleteArr = [];
    
    len = CHANNEL.emotes.length;
    if (len < 1) {
        console.log('No emotes found, reloading in 1 second')
        setTimeout(function() { emotesPanel() }, 1000);
    } else {
        for (i in CHANNEL.emotes) {
            autocompleteArr.push({"name": CHANNEL.emotes[i].name, "image": CHANNEL.emotes[i].image});
        }
        autocompleteArr.sort((a, b) => a.name.localeCompare(b.name));
        
        if (!window.matchMedia("(max-width: 768px)").matches) {
            autocomplete(document.getElementById("chatline"), autocompleteArr);
        }
    }
}
emotesPanel();

/* Autocomplete function for emotes */
function autocomplete(inp, arr) {
    var currentFocus;
    var currentInputVal = '';
    var matchedlength = 0;
    
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        closeAllLists();
        
        if (!val) { return false; }
        currentFocus = -1;

        a = document.createElement("DIV");
        a.setAttribute("id", "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        a.style.bottom = `${$('#rightcontent > form').outerHeight() + $('#leftcontrols').outerHeight()}px`
        this.parentNode.appendChild(a);
        $("#autocomplete-list").insertBefore(document.querySelectorAll('form')[1]);

        var matched = document.getElementById("chatline").value.match(/(?<!\S)\/\S*$/gim)?.toString();
        var matchedNoSlash = matched?.substring(1, matched.length);
        currentInputVal = document.getElementById("chatline").value;

        for (i = 0; i < arr.length; i++) {
            if (arr[i].name.substr(0, matched?.length)?.toUpperCase() == matched?.toUpperCase()) {
                matchedlength = matched.length;
                b = document.createElement("DIV");
                b.innerHTML = "<strong>" + arr[i].name.substr(0, matched?.length) + "</strong>";
                b.innerHTML += arr[i].name.substr(matched?.length);
                b.innerHTML += "<input type='hidden' value='" + arr[i].name + "'>";
                b.innerHTML += "<img id='autocomplete-image' src='" + arr[i].image + "'>";
                b.addEventListener("click", function(e) {
                    $("#chatline").val($("#chatline").val().substring(0, $("#chatline").val().length - $("#chatline").val().match(/(?<!\S)\/\S*$/gim).toString().length) + this.getElementsByTagName("input")[0].value);
                    closeAllLists();
                });
                a.appendChild(b);
            } else if (arr[i].name.substring(1, arr[i].name.length).indexOf(matchedNoSlash) > -1) {
                var indexInArr = arr[i].name.indexOf(matchedNoSlash);
                b = document.createElement("DIV");
                b.innerHTML = "<strong>/</strong>";
                b.innerHTML += arr[i].name.substring(1, indexInArr);
                b.innerHTML += "<strong>" + matchedNoSlash + "</strong>";
                b.innerHTML += arr[i].name.substring((indexInArr + matchedNoSlash?.length), arr[i].name.length);
                b.innerHTML += "<input type='hidden' value='" + arr[i].name + "'>";
                b.innerHTML += "<img id='autocomplete-image' src='" + arr[i].image + "'>";
                b.addEventListener("click", function(e) {
                    $("#chatline").val($("#chatline").val().substring(0, $("#chatline").val().length - $("#chatline").val().match(/(?<!\S)\/\S*$/gim).toString().length) + this.getElementsByTagName("input")[0].value);
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById("autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        
        if (e.keyCode == 40) {
            e.preventDefault();
            currentFocus++;
            addActive(x);
            document.querySelector('.autocomplete-active')?.scrollIntoViewIfNeeded(false);
            if (document.getElementsByClassName('autocomplete-active')[0]) {
                $("#chatline").val(currentInputVal.substring(0, (currentInputVal.length - currentInputVal.match(/(?<!\S)\/\S*$/gim).toString().length)) + document.getElementsByClassName('autocomplete-active')[0].querySelector('input').getAttribute('value'));
            }
        } else if (e.keyCode == 38) {
            e.preventDefault();
            currentFocus--;
            addActive(x);
            document.querySelector('.autocomplete-active')?.scrollIntoViewIfNeeded(false);
            if (document.getElementsByClassName('autocomplete-active')[0]) {
                $("#chatline").val(currentInputVal.substring(0, (currentInputVal.length - currentInputVal.match(/(?<!\S)\/\S*$/gim).toString().length)) + document.getElementsByClassName('autocomplete-active')[0].querySelector('input').getAttribute('value'));
            }
        } else if (e.keyCode == 13 || e.keyCode == 9) {
            closeAllLists();
        }
    });

    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus]?.classList.add("autocomplete-active");
    }

    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

/* ========== REPLY FEATURE ========== */

const LOAD_IN_DELAY = 10;

socket.on("chatMsg", (message) => {
    const messages = getAllMessages()
    const incomingMessageId = generateHash(message.username, message.msg, getTimeString(message.time))
    const element = messages.filter((item) => item.pseudoId == incomingMessageId)[0]?.element
    
    if (/\[r\](.+?)\[\/r\]/g.exec(message.msg)) {
        const replyId = message.msg.replace(/.*\[r\](.*?)\[\/r\].*/, '$1').replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&')
        const replyingTo = messages.filter((item) => item.pseudoId == replyId)
        const replyIdScroll = replyId.replace(/[<>"'&]/g, (match) => {
            switch (match) {
                case '<': return '&lt;'
                case '>': return '&gt;'
                case '"': return '&quot;'
                case "'": return '&#39;'
                case '&': return '&amp;'
                default: return match
            }
        })

        if (!replyingTo[0]?.message) {
            setTimeout(() => {
                $(element).children().last().html(processReplyMessage(message.msg))
            }, LOAD_IN_DELAY)
        } else {
            setTimeout(() => {
                if ($(element).find('.username').length != 0) {
                    $(element)
                        .find('span.timestamp')
                        .next()
                        .next()
                        .after(`<div onclick="scrollToReply('${replyIdScroll}')" class="reply"><span class="reply-header"></span><span class="reply-msg"></span></div>`)
                } else {
                    $(element).find('span.timestamp').after(`<div onclick="scrollToReply('${replyIdScroll}')" class="reply"><span class="reply-header"></span><span class="reply-msg"></span></div>`)
                }
                $(element).find('.reply-header').html(`Replying to ${replyingTo[0].username}:`)
                $(element).find('.reply-msg').html(replyingTo[0].message.replace(/\[r\](.+?)\[\/r\]/, '').trim())
                $(element).children().last().html(message.msg.replace(/\[r\](.+?)\[\/r\]/, '').trim())
            }, LOAD_IN_DELAY)
            
            setTimeout(() => $('#messagebuffer').animate({scrollTop: $('#messagebuffer').height() + 100000}, 'fast'), LOAD_IN_DELAY * 2)
        }
        $(element).find('.timestamp').after('<button onclick="replyToButton(event)" title="Reply" class="reply-button"><i class="reply-icon"></i></button>')
    } else if (message.username != '[server]') {
        $(element).find('.timestamp').after('<button onclick="replyToButton(event)" title="Reply" class="reply-button"><i class="reply-icon"></i></button>')
    }
})

function processReplyMessage(text) {
    let processedText = text
    if (/(?<!\S)\/\S*/gim.exec(text)) {
        processedText = text.replace(/(?<!\b)\/(\w+)/g, (match, emoteName) => {
            const emoteUrl = autocompleteArr.filter(emote => emote.name == `/${emoteName}`)[0] || "";
            return `<img class="channel-emote" src="${emoteUrl}" title="/${emoteName}">`
        })
    }
    return processedText.replace(/\[r\](.+?)\[\/r\]/, '').trim()
}

function scrollToReply(replyPseudoId) {
    const messages = getAllMessages()
    const reply = messages.filter((item) => item.pseudoId == replyPseudoId)
    $(reply[0].element)[0].scrollIntoView({ behavior: 'smooth' })
    $(reply[0].element).delay(200).animate({backgroundColor: '#696969'}, 300).animate({backgroundColor: 'transparent'}, 300)
}

function getTimeString(unix) {
    const dateObj = new Date(unix)
    const hours = dateObj.getHours()
    const minutes = dateObj.getMinutes()
    const seconds = dateObj.getSeconds()
    
    const timeString = '[' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2) + ']'
    return timeString
}

function sanitizeMessageForPseudoID(message1) { 
    return message1.match(/(?:.*?\[\/r\]\s+)(.+)/) 
        ? message1.match(/(?:.*?\[\/r\]\s+)(.+)/)[1].split(' ')[0].substring(0, 12)
        : message1.split(' ')[0].substring(0, 12)
}

function generateHash(username, message, timestamp) {
    const pseudoId = `${username.trim()}${message.replace(/\[r\](.+?)\[\/r\]/, '').trim()}${timestamp.trim()}`
    return md5(pseudoId).substring(0, 8)
}

function getAllMessages() {
    let messages = []
    $('div#messagebuffer').children().each((i, element) => {
        if (!$(element).attr('class')?.includes('chat-msg-') || $(element).attr('class')?.includes('server')) return
        const message = $(element).find('span:not(.timestamp)').length > 1 ? $(element).find('span:not(.timestamp)').last().html() : $(element).find('span:not(.timestamp)').html()
        const username = $(element).attr('class').split('-')[2].split(' ')[0]
        messages.push({
            pseudoId: generateHash(username, message, $(element).find('span.timestamp').text()),
            message,
            username,
            element
        })
    })
    return messages
}

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

function replyToButton(e) {
    const target = e.target
    let message = $(target).siblings().length > 1 ? $(target).siblings().last().html() : $(target).siblings().html()
    let username = target.parentNode.className?.split('-')[2]?.split(' ')[0]
    let pseudoId = generateHash(username, message, $(target).siblings('.timestamp').html())

    const chatlineVal = $('#chatline').val().replace(/(?:.*?\[\/r\]\s+)/, '')
    if (sanitizeMessageForPseudoID(message) != '')
        $('#chatline').val(`[r]${pseudoId.trim()}[/r] ${chatlineVal}`).focus()
}

$(document).ready(() => {
    const messages = getAllMessages()
    $('div#messagebuffer').children().each((i, element) => {
        if (!$(element).attr('class')?.includes('chat-msg-') || $(element).attr('class')?.includes('server')) return
        const message = $(element).find('span:not(.timestamp)').length > 1 ? $(element).find('span:not(.timestamp)').last().html() : $(element).find('span:not(.timestamp)').html()
        if (/\[r\](.+?)\[\/r\]/g.exec(message)) {
            const replyId = message.replace(/.*\[r\](.*?)\[\/r\].*/, '$1').replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&amp;/g, '&')
            const replyingTo = messages.filter((item) => item.pseudoId == replyId)
            const replyIdScroll = replyId.replace(/[<>"'&]/g, (match) => {
                switch (match) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '"': return '&quot;';
                    case "'": return '&#39;';
                    case '&': return '&amp;';
                    default: return match;
                }
            })

            if (!replyingTo[0]?.message) {
                $(element).children().last().html(processReplyMessage(message))
            } else {
                if ($(element).find('.username').length != 0) {
                    $(element)
                        .find('span.timestamp')
                        .next()
                        .after(`<div onclick="scrollToReply('${replyIdScroll}')" class="reply"><span class="reply-header"></span><span class="reply-msg"></span></div>`)
                } else {    
                    $(element).find('span.timestamp').after(`<div onclick="scrollToReply('${replyIdScroll}')" class="reply"><span class="reply-header"></span><span class="reply-msg"></span></div>`)
                }
                
                $(element).find('span.reply-header').html(`Replying to ${replyingTo[0].username}:`)
                $(element).find('span.reply-msg').html(replyingTo[0].message.replace(/\[r\](.+?)\[\/r\]/, '').trim())
                $(element).children().last().html(message.replace(/\[r\](.+?)\[\/r\]/, '').trim())
                
                setTimeout(() => $('#messagebuffer').animate({scrollTop: $('#messagebuffer').height() + 100000}, 'fast'), LOAD_IN_DELAY * 2)
            }
        }
        if ($(element).attr('class')?.includes('chat-msg-')) {
            $(element).find('.timestamp').after('<button onclick="replyToButton(event)" title="Reply" class="reply-button"><i class="reply-icon"></i></button>')
        }
    })
})

/* MD5 Hash Function */
function md5(inputString) {
    var hc="0123456789abcdef";
    function rh(n) {var j,s="";for(j=0;j<=3;j++) s+=hc.charAt((n>>(j*8+4))&0x0F)+hc.charAt((n>>(j*8))&0x0F);return s;}
    function ad(x,y) {var l=(x&0xFFFF)+(y&0xFFFF);var m=(x>>16)+(y>>16)+(l>>16);return (m<<16)|(l&0xFFFF);}
    function rl(n,c)            {return (n<<c)|(n>>>(32-c));}
    function cm(q,a,b,x,s,t)    {return ad(rl(ad(ad(a,q),ad(x,t)),s),b);}
    function ff(a,b,c,d,x,s,t)  {return cm((b&c)|((~b)&d),a,b,x,s,t);}
    function gg(a,b,c,d,x,s,t)  {return cm((b&d)|(c&(~d)),a,b,x,s,t);}
    function hh(a,b,c,d,x,s,t)  {return cm(b^c^d,a,b,x,s,t);}
    function ii(a,b,c,d,x,s,t)  {return cm(c^(b|(~d)),a,b,x,s,t);}
    function sb(x) {
        var i;var nblk=((x.length+8)>>6)+1;var blks=new Array(nblk*16);for(i=0;i<nblk*16;i++) blks[i]=0;
        for(i=0;i<x.length;i++) blks[i>>2]|=x.charCodeAt(i)<<((i%4)*8);
        blks[i>>2]|=0x80<<((i%4)*8);blks[nblk*16-2]=x.length*8;return blks;
    }
    var i,x=sb(""+inputString),a=1732584193,b=-271733879,c=-1732584194,d=271733878,olda,oldb,oldc,oldd;
    for(i=0;i<x.length;i+=16) {olda=a;oldb=b;oldc=c;oldd=d;
        a=ff(a,b,c,d,x[i+ 0], 7, -680876936);d=ff(d,a,b,c,x[i+ 1],12, -389564586);c=ff(c,d,a,b,x[i+ 2],17,  606105819);
        b=ff(b,c,d,a,x[i+ 3],22,-1044525330);a=ff(a,b,c,d,x[i+ 4], 7, -176418897);d=ff(d,a,b,c,x[i+ 5],12, 1200080426);
        c=ff(c,d,a,b,x[i+ 6],17,-1473231341);b=ff(b,c,d,a,x[i+ 7],22,  -45705983);a=ff(a,b,c,d,x[i+ 8], 7, 1770035416);
        d=ff(d,a,b,c,x[i+ 9],12,-1958414417);c=ff(c,d,a,b,x[i+10],17,     -42063);b=ff(b,c,d,a,x[i+11],22,-1990404162);
        a=ff(a,b,c,d,x[i+12], 7, 1804603682);d=ff(d,a,b,c,x[i+13],12,  -40341101);c=ff(c,d,a,b,x[i+14],17,-1502002290);
        b=ff(b,c,d,a,x[i+15],22, 1236535329);a=gg(a,b,c,d,x[i+ 1], 5, -165796510);d=gg(d,a,b,c,x[i+ 6], 9,-1069501632);
        c=gg(c,d,a,b,x[i+11],14,  643717713);b=gg(b,c,d,a,x[i+ 0],20, -373897302);a=gg(a,b,c,d,x[i+ 5], 5, -701558691);
        d=gg(d,a,b,c,x[i+10], 9,   38016083);c=gg(c,d,a,b,x[i+15],14, -660478335);b=gg(b,c,d,a,x[i+ 4],20, -405537848);
        a=gg(a,b,c,d,x[i+ 9], 5,  568446438);d=gg(d,a,b,c,x[i+14], 9,-1019803690);c=gg(c,d,a,b,x[i+ 3],14, -187363961);
        b=gg(b,c,d,a,x[i+ 8],20, 1163531501);a=gg(a,b,c,d,x[i+13], 5,-1444681467);d=gg(d,a,b,c,x[i+ 2], 9,  -51403784);
        c=gg(c,d,a,b,x[i+ 7],14, 1735328473);b=gg(b,c,d,a,x[i+12],20,-1926607734);a=hh(a,b,c,d,x[i+ 5], 4,    -378558);
        d=hh(d,a,b,c,x[i+ 8],11,-2022574463);c=hh(c,d,a,b,x[i+11],16, 1839030562);b=hh(b,c,d,a,x[i+14],23,  -35309556);
        a=hh(a,b,c,d,x[i+ 1], 4,-1530992060);d=hh(d,a,b,c,x[i+ 4],11, 1272893353);c=hh(c,d,a,b,x[i+ 7],16, -155497632);
        b=hh(b,c,d,a,x[i+10],23,-1094730640);a=hh(a,b,c,d,x[i+13], 4,  681279174);d=hh(d,a,b,c,x[i+ 0],11, -358537222);
        c=hh(c,d,a,b,x[i+ 3],16, -722521979);b=hh(b,c,d,a,x[i+ 6],23,   76029189);a=hh(a,b,c,d,x[i+ 9], 4, -640364487);
        d=hh(d,a,b,c,x[i+12],11, -421815835);c=hh(c,d,a,b,x[i+15],16,  530742520);b=hh(b,c,d,a,x[i+ 2],23, -995338651);
        a=ii(a,b,c,d,x[i+ 0], 6, -198630844);d=ii(d,a,b,c,x[i+ 7],10, 1126891415);c=ii(c,d,a,b,x[i+14],15,-1416354905);
        b=ii(b,c,d,a,x[i+ 5],21,  -57434055);a=ii(a,b,c,d,x[i+12], 6, 1700485571);d=ii(d,a,b,c,x[i+ 3],10,-1894986606);
        c=ii(c,d,a,b,x[i+10],15,   -1051523);b=ii(b,c,d,a,x[i+ 1],21,-2054922799);a=ii(a,b,c,d,x[i+ 8], 6, 1873313359);
        d=ii(d,a,b,c,x[i+15],10,  -30611744);c=ii(c,d,a,b,x[i+ 6],15,-1560198380);b=ii(b,c,d,a,x[i+13],21, 1309151649);
        a=ii(a,b,c,d,x[i+ 4], 6, -145523070);d=ii(d,a,b,c,x[i+11],10,-1120210379);c=ii(c,d,a,b,x[i+ 2],15,  718787259);
        b=ii(b,c,d,a,x[i+ 9],21, -343485551);a=ad(a,olda);b=ad(b,oldb);c=ad(c,oldc);d=ad(d,oldd);
    }
    return rh(a)+rh(b)+rh(c)+rh(d);
}
