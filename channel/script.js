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

// Pagination settings
var emotesPerPage = 50;
var currentEmotePage = 0;
var currentEmoteList = [];

// Initialize emote panel position from localStorage
if (!localStorage.emotePanelTop) localStorage.emotePanelTop = '100';
if (!localStorage.emotePanelLeft) localStorage.emotePanelLeft = '100';

// Create the floating emote panel container
function createEmotePanel() {
    // Remove any existing panel first
    const existingPanel = document.getElementById('emote-panel');
    if (existingPanel) existingPanel.remove();
    
    const panel = document.createElement('div');
    panel.id = 'emote-panel';
    panel.className = 'emote-panel';
    panel.style.cssText = `
        position: fixed !important;
        z-index: 10000 !important;
        top: ${localStorage.emotePanelTop}px !important;
        left: ${localStorage.emotePanelLeft}px !important;
        display: none;
        width: 420px;
        max-width: 90vw;
        height: 500px;
        max-height: 80vh;
        flex-direction: column;
        background: rgba(30, 30, 35, 0.98);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        overflow: hidden;
    `;
    
    panel.innerHTML = `
        <div class="emote-panel-header" id="emote-panel-header" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: var(--primarycolor, #333); cursor: move; user-select: none;">
            <span style="font-weight: bold; color: white; font-size: 14px;">Emotes</span>
            <button onclick="closeEmotePanel()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 4px;" title="Close">&times;</button>
        </div>
        <div style="display: flex; background: rgba(0, 0, 0, 0.3); padding: 5px; gap: 5px;">
            <button class="emote-tab active" data-tab="all" onclick="switchEmoteTab('all')" style="flex: 1; padding: 8px 12px; background: var(--tertiarycolor, #555); border: none; color: white; cursor: pointer; border-radius: 6px; font-size: 13px;">All</button>
            <button class="emote-tab" data-tab="favorites" onclick="switchEmoteTab('favorites')" style="flex: 1; padding: 8px 12px; background: transparent; border: none; color: #aaa; cursor: pointer; border-radius: 6px; font-size: 13px;">★ Favorites</button>
        </div>
        <div style="padding: 8px 10px; background: rgba(0, 0, 0, 0.2);">
            <input type="text" id="emote-search" placeholder="Search emotes..." oninput="filterEmotes(this.value)" style="width: 100%; padding: 8px 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; font-size: 13px;">
        </div>
        <div class="emote-panel-body" id="emote-panel-body" style="flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-wrap: wrap; align-content: flex-start; gap: 5px;">
            <!-- Emotes will be populated here -->
        </div>
        <div class="emote-panel-pagination" id="emote-panel-pagination" style="display: flex; justify-content: center; align-items: center; gap: 10px; padding: 10px; background: rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <button onclick="prevEmotePage()" id="emote-prev-btn" style="padding: 6px 12px; background: var(--tertiarycolor, #555); border: none; color: white; border-radius: 4px; cursor: pointer;">◀ Prev</button>
            <span id="emote-page-info" style="color: #ccc; font-size: 13px;">Page 1 of 1</span>
            <button onclick="nextEmotePage()" id="emote-next-btn" style="padding: 6px 12px; background: var(--tertiarycolor, #555); border: none; color: white; border-radius: 4px; cursor: pointer;">Next ▶</button>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Make panel draggable
    makeDraggable(panel, document.getElementById('emote-panel-header'));
}

// Pagination functions
function updatePagination() {
    const totalPages = Math.ceil(currentEmoteList.length / emotesPerPage) || 1;
    const pageInfo = document.getElementById('emote-page-info');
    const prevBtn = document.getElementById('emote-prev-btn');
    const nextBtn = document.getElementById('emote-next-btn');
    
    if (pageInfo) pageInfo.textContent = `Page ${currentEmotePage + 1} of ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentEmotePage === 0;
    if (nextBtn) nextBtn.disabled = currentEmotePage >= totalPages - 1;
}

function prevEmotePage() {
    if (currentEmotePage > 0) {
        currentEmotePage--;
        renderCurrentEmotePage();
    }
}

function nextEmotePage() {
    const totalPages = Math.ceil(currentEmoteList.length / emotesPerPage);
    if (currentEmotePage < totalPages - 1) {
        currentEmotePage++;
        renderCurrentEmotePage();
    }
}

function renderCurrentEmotePage() {
    const body = document.getElementById('emote-panel-body');
    if (!body) return;
    
    body.innerHTML = '';
    
    const start = currentEmotePage * emotesPerPage;
    const end = Math.min(start + emotesPerPage, currentEmoteList.length);
    const pageEmotes = currentEmoteList.slice(start, end);
    
    if (pageEmotes.length === 0) {
        const activeTab = document.querySelector('.emote-tab.active');
        const isFavoritesTab = activeTab && activeTab.dataset.tab === 'favorites';
        body.innerHTML = `<div style="width: 100%; text-align: center; color: #888; padding: 40px 20px; font-size: 14px;">${isFavoritesTab ? 'No favorite emotes yet. Click ★ on emotes to add them!' : 'No emotes found.'}</div>`;
    } else {
        pageEmotes.forEach(emote => {
            const emoteItem = document.createElement('div');
            emoteItem.style.cssText = 'position: relative; display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; cursor: pointer; transition: all 0.2s;';
            emoteItem.onmouseenter = function() { this.style.background = 'rgba(255, 255, 255, 0.15)'; this.style.transform = 'scale(1.05)'; };
            emoteItem.onmouseleave = function() { this.style.background = 'rgba(255, 255, 255, 0.05)'; this.style.transform = 'scale(1)'; };
            
            const isFavorite = emoteFavorites.includes(emote.name);
            
            const img = document.createElement('img');
            img.src = emote.image;
            img.alt = emote.name;
            img.title = emote.name;
            img.style.cssText = 'max-width: 50px; max-height: 50px; object-fit: contain;';
            img.onclick = function() { insertEmote(emote.name); };
            
            const favBtn = document.createElement('button');
            favBtn.className = isFavorite ? 'favorited' : '';
            favBtn.innerHTML = '★';
            favBtn.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
            favBtn.style.cssText = `position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; padding: 0; background: rgba(0, 0, 0, 0.7); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 50%; color: ${isFavorite ? '#FFD700' : '#666'}; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: ${isFavorite ? '1' : '0'}; transition: all 0.2s;`;
            favBtn.onclick = function(e) { toggleFavorite(emote.name, e, favBtn); };
            
            emoteItem.onmouseenter = function() { 
                this.style.background = 'rgba(255, 255, 255, 0.15)'; 
                this.style.transform = 'scale(1.05)';
                favBtn.style.opacity = '1';
            };
            emoteItem.onmouseleave = function() { 
                this.style.background = 'rgba(255, 255, 255, 0.05)'; 
                this.style.transform = 'scale(1)';
                if (!favBtn.classList.contains('favorited')) favBtn.style.opacity = '0';
            };
            
            emoteItem.appendChild(img);
            emoteItem.appendChild(favBtn);
            body.appendChild(emoteItem);
        });
    }
    
    updatePagination();
}

// Switch between All and Favorites tabs
function switchEmoteTab(tab) {
    document.querySelectorAll('.emote-tab').forEach(t => {
        t.classList.remove('active');
        t.style.background = 'transparent';
        t.style.color = '#aaa';
    });
    const activeTab = document.querySelector(`.emote-tab[data-tab="${tab}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.style.background = 'var(--tertiarycolor, #555)';
        activeTab.style.color = 'white';
    }
    
    currentEmotePage = 0;
    
    if (tab === 'all') {
        currentEmoteList = CHANNEL.emotes ? [...CHANNEL.emotes] : [];
    } else {
        currentEmoteList = CHANNEL.emotes ? CHANNEL.emotes.filter(e => emoteFavorites.includes(e.name)) : [];
    }
    
    renderCurrentEmotePage();
}

// Filter emotes by search term
function filterEmotes(searchTerm) {
    const activeTab = document.querySelector('.emote-tab.active');
    const tab = activeTab ? activeTab.dataset.tab : 'all';
    let emotes = CHANNEL.emotes ? [...CHANNEL.emotes] : [];
    
    if (tab === 'favorites') {
        emotes = emotes.filter(e => emoteFavorites.includes(e.name));
    }
    
    if (searchTerm && searchTerm.trim()) {
        emotes = emotes.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    currentEmotePage = 0;
    currentEmoteList = emotes;
    renderCurrentEmotePage();
}

// Insert emote into chat
function insertEmote(emoteName) {
    const chatline = document.getElementById('chatline');
    if (chatline) {
        chatline.value = chatline.value + emoteName + ' ';
        chatline.focus();
    }
}

// Toggle favorite status
function toggleFavorite(emoteName, event, btnElement) {
    event.stopPropagation();
    
    const index = emoteFavorites.indexOf(emoteName);
    if (index > -1) {
        emoteFavorites.splice(index, 1);
        if (btnElement) {
            btnElement.classList.remove('favorited');
            btnElement.style.color = '#666';
            btnElement.title = 'Add to favorites';
        }
    } else {
        emoteFavorites.unshift(emoteName);
        if (btnElement) {
            btnElement.classList.add('favorited');
            btnElement.style.color = '#FFD700';
            btnElement.title = 'Remove from favorites';
        }
    }
    
    localStorage.setItem('emoteFavorites', JSON.stringify(emoteFavorites));
    
    // If on favorites tab, refresh the view
    const activeTab = document.querySelector('.emote-tab.active');
    if (activeTab && activeTab.dataset.tab === 'favorites') {
        switchEmoteTab('favorites');
    }
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
    handle.ontouchstart = dragTouchStart;
    
    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function dragTouchStart(e) {
        const touch = e.touches[0];
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        document.ontouchend = closeDragElement;
        document.ontouchmove = elementTouchDrag;
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
    
    function elementTouchDrag(e) {
        const touch = e.touches[0];
        pos1 = pos3 - touch.clientX;
        pos2 = pos4 - touch.clientY;
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        
        let newTop = element.offsetTop - pos2;
        let newLeft = element.offsetLeft - pos1;
        
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - 100));
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 100));
        
        element.style.top = newTop + "px";
        element.style.left = newLeft + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;
        
        // Save position
        localStorage.emotePanelTop = parseInt(element.style.top);
        localStorage.emotePanelLeft = parseInt(element.style.left);
    }
}

/* ========== FAVORITES QUICK ACCESS DROPDOWN ========== */

// Show favorites dropdown
function showFavoritesDropdown() {
    // Remove any existing dropdown
    closeFavoritesDropdown();
    
    const dropdown = document.createElement('div');
    dropdown.id = 'favorites-dropdown';
    dropdown.style.cssText = `
        position: fixed !important;
        z-index: 10001 !important;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 10px;
        max-width: 320px;
        max-height: 200px;
        overflow-y: auto;
        background: rgba(30, 30, 35, 0.98);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;
    
    // Position near the favorites button
    const btn = document.getElementById('favorites-btn');
    if (btn) {
        const rect = btn.getBoundingClientRect();
        dropdown.style.bottom = (window.innerHeight - rect.top + 5) + 'px';
        dropdown.style.left = Math.max(10, rect.left) + 'px';
    }
    
    // Populate with favorites
    if (emoteFavorites.length === 0) {
        dropdown.innerHTML = '<div style="color: #888; font-size: 13px; padding: 10px; text-align: center; width: 100%;">No favorites yet!<br>Open emotes panel and click ★</div>';
    } else {
        emoteFavorites.forEach(emoteName => {
            const emote = CHANNEL.emotes ? CHANNEL.emotes.find(e => e.name === emoteName) : null;
            if (emote) {
                const img = document.createElement('img');
                img.src = emote.image;
                img.alt = emote.name;
                img.title = emote.name;
                img.style.cssText = 'width: 45px; height: 45px; object-fit: contain; cursor: pointer; padding: 4px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; transition: all 0.2s;';
                img.onmouseenter = function() { this.style.background = 'rgba(255, 255, 255, 0.15)'; this.style.transform = 'scale(1.1)'; };
                img.onmouseleave = function() { this.style.background = 'rgba(255, 255, 255, 0.05)'; this.style.transform = 'scale(1)'; };
                img.onclick = function() {
                    insertEmote(emote.name);
                    closeFavoritesDropdown();
                };
                dropdown.appendChild(img);
            }
        });
    }
    
    document.body.appendChild(dropdown);
}

// Close favorites dropdown
function closeFavoritesDropdown() {
    const dropdown = document.getElementById('favorites-dropdown');
    if (dropdown) {
        dropdown.remove();
    }
}

// Toggle favorites dropdown
function toggleFavoritesDropdown() {
    const dropdown = document.getElementById('favorites-dropdown');
    if (dropdown) {
        closeFavoritesDropdown();
    } else {
        showFavoritesDropdown();
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('favorites-dropdown');
    const favBtn = document.getElementById('favorites-btn');
    
    if (dropdown) {
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

/* ========== TEXT STYLING SYSTEM (Server-Side Compatible with Auto-Apply) ========== */

// Initialize persistent text style from localStorage
var textStyleSettings = JSON.parse(localStorage.getItem('textStyleSettings')) || {
    color: null,
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false
};

// Save settings to localStorage
function saveTextStyleSettings() {
    localStorage.setItem('textStyleSettings', JSON.stringify(textStyleSettings));
    updateStylePreview();
    updateFontTagsButtonIndicator();
}

// Update the T button to show if styles are active
function updateFontTagsButtonIndicator() {
    const btn = document.getElementById('font-tags-btn');
    if (!btn) return;
    
    const hasActiveStyle = textStyleSettings.color || textStyleSettings.bold || 
                          textStyleSettings.italic || textStyleSettings.underline || 
                          textStyleSettings.strikethrough;
    
    if (hasActiveStyle) {
        btn.style.borderColor = '#FFD700';
        btn.style.boxShadow = '0 0 8px rgba(255, 215, 0, 0.5)';
    } else {
        btn.style.borderColor = '';
        btn.style.boxShadow = '';
    }
}

// Build the tag wrapper based on current settings
function buildStyleTags(message) {
    if (!message.trim()) return message;
    
    let openTags = '';
    let closeTags = '';
    
    // Add color tag
    if (textStyleSettings.color) {
        openTags += `[${textStyleSettings.color}]`;
        closeTags = '[/]' + closeTags;
    }
    
    // Add style tags
    if (textStyleSettings.bold) {
        openTags += '[b]';
        closeTags = '[/]' + closeTags;
    }
    if (textStyleSettings.italic) {
        openTags += '[i]';
        closeTags = '[/]' + closeTags;
    }
    if (textStyleSettings.underline) {
        openTags += '[u]';
        closeTags = '[/]' + closeTags;
    }
    if (textStyleSettings.strikethrough) {
        openTags += '[s]';
        closeTags = '[/]' + closeTags;
    }
    
    if (openTags) {
        return openTags + message + closeTags;
    }
    return message;
}

// Intercept chat form submission to apply styles
function initTextStyleInterceptor() {
    const chatForm = document.getElementById('formline');
    if (!chatForm) return;
    
    chatForm.addEventListener('submit', function(e) {
        const chatline = document.getElementById('chatline');
        const message = chatline.value;
        
        // Don't apply styles to commands (starting with /)
        if (message.startsWith('/')) return;
        
        // Don't apply if message already has style tags
        if (message.match(/^\[(?:red|blue|green|yellow|orange|pink|lime|aqua|violet|white|silver|brown|b|i|u|s)\]/)) return;
        
        // Apply style tags
        const styledMessage = buildStyleTags(message);
        if (styledMessage !== message) {
            chatline.value = styledMessage;
        }
    }, true); // Use capture phase to run before CyTube's handler
}

// Create the text styling panel as a proper floating window
function createFontTagsPanel() {
    // Remove existing panel first
    const existingPanel = document.getElementById('font-tags-panel');
    if (existingPanel) existingPanel.remove();
    
    const panel = document.createElement('div');
    panel.id = 'font-tags-panel';
    panel.style.cssText = `
        position: fixed !important;
        z-index: 10000 !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 400px;
        max-width: 95vw;
        max-height: 85vh;
        display: none;
        flex-direction: column;
        background: rgba(30, 30, 35, 0.98);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
        overflow: hidden;
    `;
    
    const colors = [
        { name: 'white', css: 'color: white; background: #333;' },
        { name: 'yellow', css: 'color: yellow;' },
        { name: 'orange', css: 'color: orange;' },
        { name: 'pink', css: 'color: pink;' },
        { name: 'red', css: 'color: red;' },
        { name: 'lime', css: 'color: lime;' },
        { name: 'green', css: 'color: green;' },
        { name: 'aqua', css: 'color: aqua;' },
        { name: 'blue', css: 'color: #5555ff;' },
        { name: 'violet', css: 'color: violet;' },
        { name: 'brown', css: 'color: brown;' },
        { name: 'silver', css: 'color: silver;' }
    ];
    
    let colorButtons = colors.map(c => 
        `<button class="color-select-btn ${textStyleSettings.color === c.name ? 'active' : ''}" 
                style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; ${c.css} font-size: 12px; cursor: pointer; transition: all 0.2s; ${textStyleSettings.color === c.name ? 'background: rgba(255, 215, 0, 0.3) !important; border-color: #FFD700 !important; box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);' : ''}" 
                data-color="${c.name}" 
                onclick="selectTextColor('${c.name}')">${c.name}</button>`
    ).join('');
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: var(--primarycolor, #333); color: white; font-weight: bold;">
            <span>Text Style Settings</span>
            <button onclick="closeFontTagsPanel()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">&times;</button>
        </div>
        <div style="padding: 12px 15px; background: rgba(0, 0, 0, 0.3); font-size: 12px; color: #ccc;">
            <p style="margin: 0 0 8px 0;">Select your text style below. It will <strong>auto-apply</strong> to all your messages.</p>
            <p style="margin: 0; color: #ffcc00;">⚠️ <strong>Admin Setup Required:</strong> Styles only work if Chat Filters are configured. <a href="#" onclick="showFilterInstructions(); return false;" style="color: #5dadec; text-decoration: underline;">View setup instructions</a></p>
        </div>
        <div style="padding: 12px 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
            <h4 style="margin: 0 0 10px 0; color: #aaa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Text Color</h4>
            <div id="color-buttons" style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${colorButtons}
            </div>
        </div>
        <div style="padding: 12px 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
            <h4 style="margin: 0 0 10px 0; color: #aaa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Text Effects</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                <button class="effect-toggle-btn ${textStyleSettings.bold ? 'active' : ''}" 
                        style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; font-size: 12px; font-weight: bold; cursor: pointer; ${textStyleSettings.bold ? 'background: rgba(255, 215, 0, 0.3) !important; border-color: #FFD700 !important; box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);' : ''}" 
                        data-effect="bold" 
                        onclick="toggleTextEffect('bold')">Bold</button>
                <button class="effect-toggle-btn ${textStyleSettings.italic ? 'active' : ''}" 
                        style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; font-size: 12px; font-style: italic; cursor: pointer; ${textStyleSettings.italic ? 'background: rgba(255, 215, 0, 0.3) !important; border-color: #FFD700 !important; box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);' : ''}" 
                        data-effect="italic" 
                        onclick="toggleTextEffect('italic')">Italic</button>
                <button class="effect-toggle-btn ${textStyleSettings.underline ? 'active' : ''}" 
                        style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; font-size: 12px; text-decoration: underline; cursor: pointer; ${textStyleSettings.underline ? 'background: rgba(255, 215, 0, 0.3) !important; border-color: #FFD700 !important; box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);' : ''}" 
                        data-effect="underline" 
                        onclick="toggleTextEffect('underline')">Underline</button>
                <button class="effect-toggle-btn ${textStyleSettings.strikethrough ? 'active' : ''}" 
                        style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; font-size: 12px; text-decoration: line-through; cursor: pointer; ${textStyleSettings.strikethrough ? 'background: rgba(255, 215, 0, 0.3) !important; border-color: #FFD700 !important; box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);' : ''}" 
                        data-effect="strikethrough" 
                        onclick="toggleTextEffect('strikethrough')">Strike</button>
            </div>
        </div>
        <div style="padding: 12px 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
            <h4 style="margin: 0 0 10px 0; color: #aaa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Preview</h4>
            <div id="style-preview" style="padding: 15px; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; min-height: 50px; display: flex; align-items: center; justify-content: center; font-size: 14px;">Your message will look like this</div>
        </div>
        <div style="padding: 12px 15px;">
            <button onclick="resetTextStyle()" style="width: 100%; padding: 12px; background: rgba(255, 100, 100, 0.2); border: 1px solid rgba(255, 100, 100, 0.4); border-radius: 8px; color: #ff8888; font-size: 14px; cursor: pointer;">↺ Reset to Default (No Styling)</button>
        </div>
    `;
    
    document.body.appendChild(panel);
    updateStylePreview();
}

// Select a text color
function selectTextColor(color) {
    // If clicking the same color, deselect it
    if (textStyleSettings.color === color) {
        textStyleSettings.color = null;
    } else {
        textStyleSettings.color = color;
    }
    
    // Update button states
    document.querySelectorAll('.color-select-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.color === textStyleSettings.color) {
            btn.classList.add('active');
        }
    });
    
    saveTextStyleSettings();
}

// Toggle a text effect
function toggleTextEffect(effect) {
    textStyleSettings[effect] = !textStyleSettings[effect];
    
    // Update button state
    const btn = document.querySelector(`.effect-toggle-btn[data-effect="${effect}"]`);
    if (btn) {
        btn.classList.toggle('active', textStyleSettings[effect]);
    }
    
    saveTextStyleSettings();
}

// Reset all text styling to default
function resetTextStyle() {
    textStyleSettings = {
        color: null,
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false
    };
    
    // Update all button states
    document.querySelectorAll('.color-select-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.effect-toggle-btn').forEach(btn => btn.classList.remove('active'));
    
    saveTextStyleSettings();
}

// Update the preview box
function updateStylePreview() {
    const preview = document.getElementById('style-preview');
    if (!preview) return;
    
    let styles = [];
    
    if (textStyleSettings.color) {
        const colorMap = {
            'white': 'white', 'yellow': 'yellow', 'orange': 'orange', 'pink': 'pink',
            'red': 'red', 'lime': 'lime', 'green': 'green', 'aqua': 'aqua',
            'blue': '#5555ff', 'violet': 'violet', 'brown': 'brown', 'silver': 'silver'
        };
        styles.push(`color: ${colorMap[textStyleSettings.color] || 'inherit'}`);
    }
    
    if (textStyleSettings.bold) styles.push('font-weight: bold');
    if (textStyleSettings.italic) styles.push('font-style: italic');
    if (textStyleSettings.underline) styles.push('text-decoration: underline');
    if (textStyleSettings.strikethrough) {
        if (textStyleSettings.underline) {
            styles.pop(); // Remove underline
            styles.push('text-decoration: underline line-through');
        } else {
            styles.push('text-decoration: line-through');
        }
    }
    
    preview.style.cssText = styles.join('; ');
    
    // Show what tags will be applied
    const hasStyle = textStyleSettings.color || textStyleSettings.bold || 
                    textStyleSettings.italic || textStyleSettings.underline || 
                    textStyleSettings.strikethrough;
    
    if (hasStyle) {
        preview.textContent = 'Your message will look like this';
    } else {
        preview.textContent = 'No styling applied (default)';
        preview.style.cssText = 'color: #888; font-style: italic;';
    }
}

function openFontTagsPanel() {
    let panel = document.getElementById('font-tags-panel');
    if (!panel) {
        createFontTagsPanel();
        panel = document.getElementById('font-tags-panel');
    } else {
        // Refresh button states when reopening
        document.querySelectorAll('.color-select-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === textStyleSettings.color);
        });
        document.querySelectorAll('.effect-toggle-btn').forEach(btn => {
            btn.classList.toggle('active', textStyleSettings[btn.dataset.effect]);
        });
        updateStylePreview();
    }
    panel.style.display = 'flex';
}

function closeFontTagsPanel() {
    const panel = document.getElementById('font-tags-panel');
    if (panel) {
        panel.style.display = 'none';
    }
}

function showFilterInstructions() {
    closeFontTagsPanel();
    
    // Remove any existing modal
    const existingModal = document.getElementById('filter-instructions-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'filter-instructions-modal';
    modal.style.cssText = `
        position: fixed !important;
        z-index: 10002 !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: rgba(30, 30, 35, 0.98); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; max-width: 700px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: var(--primarycolor, #333);">
                <h2 style="margin: 0; color: white; font-size: 18px;">Chat Filters Setup (Admin Only)</h2>
                <button onclick="closeFilterInstructions()" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">&times;</button>
            </div>
            <div style="padding: 20px; overflow-y: auto; color: #ddd; font-size: 14px; line-height: 1.6;">
                <p style="margin: 0 0 15px 0;">To enable text formatting visible to <strong>all users</strong>, a channel admin must set up Chat Filters:</p>
                <ol style="margin: 0 0 20px 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Go to <strong>Channel Settings</strong> → <strong>Edit</strong> → <strong>Chat Filters</strong></li>
                    <li style="margin-bottom: 8px;">Add the following filters (one at a time):</li>
                </ol>
                <div style="overflow-x: auto; margin: 15px 0;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <tr><th style="padding: 8px 10px; text-align: left; border: 1px solid rgba(255, 255, 255, 0.2); background: var(--primarycolor, #333); color: white; font-weight: bold;">Name</th><th style="padding: 8px 10px; text-align: left; border: 1px solid rgba(255, 255, 255, 0.2); background: var(--primarycolor, #333); color: white; font-weight: bold;">Regex</th><th style="padding: 8px 10px; text-align: left; border: 1px solid rgba(255, 255, 255, 0.2); background: var(--primarycolor, #333); color: white; font-weight: bold;">Flags</th><th style="padding: 8px 10px; text-align: left; border: 1px solid rgba(255, 255, 255, 0.2); background: var(--primarycolor, #333); color: white; font-weight: bold;">Replacement</th></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">red</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[red\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;span style="color:red"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">blue</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[blue\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;span style="color:#5555ff"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">green</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[green\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;span style="color:green"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">yellow</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[yellow\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;span style="color:yellow"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">orange</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[orange\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;span style="color:orange"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">pink</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[pink\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;span style="color:pink"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">lime</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[lime\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;span style="color:lime"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">aqua</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[aqua\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;span style="color:aqua"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">violet</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[violet\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;span style="color:violet"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">white</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[white\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;span style="color:white"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">silver</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[silver\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;span style="color:silver"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">brown</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[brown\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;span style="color:brown"&gt;$1&lt;/span&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">bold</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[b\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;strong&gt;$1&lt;/strong&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">italic</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[i\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;em&gt;$1&lt;/em&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">underline</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[u\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;u&gt;$1&lt;/u&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">strike</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[s\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;s&gt;$1&lt;/s&gt;</td></tr>
                        <tr><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">spoiler</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">\\[sp\\]([^\\[]+)\\[/\\]</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">g</td><td style="padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.2); font-family: monospace; font-size: 11px;">&lt;span class="spoiler"&gt;$1&lt;/span&gt;</td></tr>
                    </table>
                </div>
                <p style="background: rgba(93, 173, 236, 0.1); border: 1px solid rgba(93, 173, 236, 0.3); border-radius: 6px; padding: 12px; margin-top: 15px;">After adding these filters, the text styling panel will work for all users!</p>
            </div>
        </div>
    `;
    
    // Close when clicking backdrop
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeFilterInstructions();
        }
    };
    
    document.body.appendChild(modal);
}

function closeFilterInstructions() {
    const modal = document.getElementById('filter-instructions-modal');
    if (modal) {
        modal.remove();
    }
}

// Initialize the text style interceptor when document is ready
$(document).ready(function() {
    initTextStyleInterceptor();
    updateFontTagsButtonIndicator();
});

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
