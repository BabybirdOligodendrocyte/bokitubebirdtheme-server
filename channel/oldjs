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
/* $("#videowrap-header").append($("<span> </span>"));
document.getElementById("videowrap-header").appendChild(clone); */

/* Remove padding on wrap */
const pagewrap = document.getElementById("wrap");
pagewrap.setAttribute("style", "padding-bottom: 0px;")

/* Add hint text for chatline and disables spellcheck */
const chatline = document.getElementById("chatline");
chatline.removeAttribute("placeholder");
chatline.setAttribute("placeholder", "Send a message");
chatline.setAttribute("spellcheck", "false");

/* Sets the variable used for mobile chat sizing every 20 milliseconds - there is probably a better implementation of this */
setInterval(function () {document.documentElement.style.setProperty('--vh', `${window.innerHeight/100}px`);}, 20);

/* Positions the chat depending on media query */
function chatPosition(x) {
    if (x.matches) { // If media query matches
        $("#rightcontent").appendTo($("#leftcontent"));
        $("#channel-content").appendTo($("#leftcontent"));
        $("#footer").appendTo($("#leftcontent"));
        
        /* When user clicks chatline on devices with width < 768px, scroll up continuously for 0.5 seconds */
        document.getElementById("chatline").onclick = function() {
            var counter = 0;
            var clickChatInterval = setInterval(() => {
                document.documentElement.scrollTop = 0;

                if (++counter === 10) {
                    window.clearInterval(clickChatInterval);
                }
            }, 50);
        }

        /* Sets the variable used for mobile chat sizing every 20 milliseconds - there is probably a better implementation of this */
        setInterval(function () {
            document.documentElement.style.setProperty('--vh', `${window.innerHeight/100}px`);
        }, 20);
    } else {
        $("#rightcontent").appendTo($("#content-wrap"));
        
        document.documentElement.style.setProperty('--vh', `${window.innerHeight/100}px`);
    }
}
  
var mediaQuery = window.matchMedia("(max-width: 768px)");
chatPosition(mediaQuery); // Call listener function at run time
mediaQuery.addEventListener('change', chatPosition); // Attach listener function on state changes

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
    /* Navbar title */
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

/* Initialize default values for floating emotes panel positioning for new users */
if (!localStorage.epFlTop || !localStorage.epFlLeft) {
    localStorage.epFlTop = 100;
    localStorage.epFlLeft = -15;
}

$('<div class="emotewrap" id="emotewrap" style="top: ' + localStorage.epFlTop + 'px; left: ' + localStorage.epFlLeft + 'px;">').appendTo($("#rightcontent"));

/* Initialize default values for emotes panel positioning for new users */
if (!localStorage.epposition) {
    localStorage.epposition = 1;
    emotespanel = $('<div id="emotespanel" class="ep__fixed" style="display:none" />').insertAfter('#userlist');
}

/* Set emotes panel to floating or fixed depending on last session */
if (localStorage.epposition == 0) {
    emotespanel = $('<div id="emotespanel" class="ep__floating" style="display:none" />').appendTo($("#emotewrap"));
} else {
    emotespanel = $('<div id="emotespanel" class="ep__fixed" style="display:none" />').insertAfter('#userlist');
}

/* Initialize default values for emotes panel state for new users */
if (!localStorage.epIsOpen) {
    localStorage.epIsOpen = 0;
}
if (localStorage.epIsOpen == 1) {
    toggleDiv(emotespanel);
}

function toggleDiv(div) {
    $(div).css('display') == "none" ? $(div).show() : $(div).hide();
}
function insertText(str) {
    $("#chatline").val($("#chatline").val() + str).focus(); // TODO: remove this utility function so that the chatline doesn't get focused on emote press on mobile
}

/* Initialize intersection observer to improve performance - see https://github.com/deafnv/bokitube-server/commit/1d81d089762a7cb421d252dba385cd706ede4960 */
let observer = new IntersectionObserver(observerCallback);
function observerCallback() {
    toggleDiv('#queue');
}

/* Custom emotes panel */
var autocompleteArr = [];
function emotesPanel() {
    emotespanel.removeClass('row');
    document.querySelector('#emotespanel').replaceChildren();

    len = CHANNEL.emotes.length;
    if (len < 1) {
        emotespanel.addClass('row');
        makeAlert("No emotes available", "Ask channel administrator. This panel will update every second until an emote is found.").appendTo(emotespanel);

        if (!document.querySelector('#content-wrap').contains(document.querySelector('#needpw')))
            $("#needpw").appendTo($("#content-wrap"));

        console.log('No emotes found, reloading in 1 second')
        setTimeout(function() {emotesPanel()}, 1000);
    } else {
        for (i in CHANNEL.emotes) {
            $('<img onclick="insertText(\'' + CHANNEL.emotes[i].name + ' \')" />')
                .attr({
                    'src': CHANNEL.emotes[i].image,
                    'title': CHANNEL.emotes[i].name
                })
                .appendTo(emotespanel);
            autocompleteArr.push({"name":CHANNEL.emotes[i].name, "image": CHANNEL.emotes[i].image});
        }
        autocompleteArr.sort((a, b) => a.name.localeCompare(b.name));
        // Disable autocomplete on mobile - legacy, enable if needed, although mobile has less vertical space as is
        if (!window.matchMedia("(max-width: 768px)").matches) {
            autocomplete(document.getElementById("chatline"), autocompleteArr);
        } else {
            // See line 212 for details
            observer.observe(document.querySelector('#rightpane-inner').children[5]);
        }
    }
}
emotesPanel();

/* Remove original emote button */
$("#emotelistbtn").remove();

/* Replace text with icons */
$("#newpollbtn").html(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#FFFFFF" height="800px" width="800px" version="1.1" id="Capa_1" viewBox="0 0 490.4 490.4" xml:space="preserve"><path d="M17.2,251.55c-9.5,0-17.2,7.7-17.2,17.1v179.7c0,9.5,7.7,17.2,17.2,17.2h113c9.5,0,17.1-7.7,17.1-17.2v-179.7 c0-9.5-7.7-17.1-17.1-17.1L17.2,251.55L17.2,251.55z M113,431.25H34.3v-145.4H113V431.25z"/><path d="M490.4,448.45v-283.7c0-9.5-7.7-17.2-17.2-17.2h-113c-9.5,0-17.2,7.7-17.2,17.2v283.6c0,9.5,7.7,17.2,17.2,17.2h113 C482.7,465.55,490.4,457.85,490.4,448.45z M456.1,431.25h-78.7v-249.3h78.7L456.1,431.25L456.1,431.25z"/> <path d="M301.7,465.55c9.5,0,17.1-7.7,17.1-17.2V42.05c0-9.5-7.7-17.2-17.1-17.2h-113c-9.5,0-17.2,7.7-17.2,17.2v406.3 c0,9.5,7.7,17.2,17.2,17.2H301.7z M205.9,59.25h78.7v372h-78.7L205.9,59.25L205.9,59.25z"/></svg>`)
$('#newpollbtn').attr("title", "Create new poll")

/* Add custom emotes panel button and favorites system */
// Initialize favorites from localStorage
var emoteFavorites = JSON.parse(localStorage.getItem('emoteFavorites')) || [];

// Create modal overlay for emotes
function createEmoteModal() {
        const modal = document.createElement('div');
        modal.id = 'emote-modal';
        modal.className = 'emote-modal';
        modal.innerHTML = `
                <div class="emote-modal-content">
                            <div class="emote-modal-header">
                                            <h2>Emotes</h2>
                                                            <button class="emote-modal-close" onclick="closeEmoteModal()">&times;</button>
                                                                        </div>
                                                                                    <div class="emote-modal-body" id="emote-modal-body">
                                                                                                    <!-- Emotes will be populated here -->
                                                                                                                </div>
                                                                                                                        </div>
                                                                                                                            `;
        document.body.appendChild(modal);
}

function openEmoteModal() {
        let modal = document.getElementById('emote-modal');
        if (!modal) {
                    createEmoteModal();
                    modal = document.getElementById('emote-modal');
        }

        const modalBody = document.getElementById('emote-modal-body');
        modalBody.innerHTML = '';

        CHANNEL.emotes.forEach(emote => {
                    const emoteCard = document.createElement('div');
                    emoteCard.className = 'emote-card';
                    const isFavorite = emoteFavorites.includes(emote.name);
                    emoteCard.innerHTML = `
                                <div class="emote-card-content">
                                                <img src="${emote.image}" alt="${emote.name}" class="emote-card-image" onclick="insertText('${emote.name} ')">
                                                                <button class="emote-favorite-btn ${isFavorite ? 'favorited' : ''}" onclick="toggleEmoteFavorite('${emote.name}', event)" title="Add to favorites">★</button>
                                                                            </div>
                                                                                        <p class="emote-card-name">${emote.name}</p>
                                                                                                `;
                    modalBody.appendChild(emoteCard);
        });

        modal.style.display = 'flex';
}

function closeEmoteModal() {
        const modal = document.getElementById('emote-modal');
        if (modal) {
                    modal.style.display = 'none';
        }
}

function toggleEmoteFavorite(emoteName, event) {
        event.stopPropagation();
        const index = emoteFavorites.indexOf(emoteName);
        if (index > -1) {
                    emoteFavorites.splice(index, 1);
        } else {
                    emoteFavorites.unshift(emoteName);
        }
        localStorage.setItem('emoteFavorites', JSON.stringify(emoteFavorites));

        // Update star button
        const btn = event.target;
        btn.classList.toggle('favorited');

        // Refresh modal if open
        if (document.getElementById('emote-modal')?.style.display === 'flex') {
                    openEmoteModal();
        }
}

emotesbtn = $('<button id="emotes-btn" class="btn btn-sm btn-default" title="Display emotes panel"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#FFFFFF" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.507 13.941c-1.512 1.195-3.174 1.931-5.506 1.931-2.334 0-3.996-.736-5.508-1.931l-.493.493c1.127 1.72 3.2 3.566 6.001 3.566 2.8 0 4.872-1.846 5.999-3.566l-.493-.493zm-9.007-5.941c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm7 0c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5z"/></svg></button>')
    .prependTo("#leftcontrols")
    .on("click", function() { 
                openEmoteModal(); 
    });

// Add favorites button with star icon
const favoritesbtn = $('<button id="favorites-btn" class="btn btn-sm btn-default" title="Show favorite emotes"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#FFD700" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>')
    .insertAfter("#emotes-btn")
    .on("click", function() {
                emotespanel.removeClass('row');
                document.querySelector('#emotespanel').replaceChildren();

                if (emoteFavorites.length === 0) {
                                emotespanel.addClass('row');
                                makeAlert("No favorite emotes", "Click the star icon in the emote panel to add favorites.").appendTo(emotespanel);
                } else {
                                emoteFavorites.forEach(emoteName => {
                                                    const emote = CHANNEL.emotes.find(e => e.name === emoteName);
                                                    if (emote) {
                                                                            $('<img onclick="insertText(\'' + emote.name + ' \')" />')
                                                                                .attr({ 'src': emote.image, 'title': emote.name })
                                                                                .appendTo(emotespanel);
                                                    }
                                });
                }

                toggleDiv(emotespanel);
                localStorage.epIsOpen == 0 ? localStorage.epIsOpen = 1 : localStorage.epIsOpen = 0;
    });

$("#emotes-btn").after($("#voteskip"))

/* Switch emotes panel - fixed or floating */
$('<li><a onclick="switchEp()" style="cursor: pointer;">Switch EP</a></li>').appendTo(".navbar-nav")

function switchEp() {
    const panel = document.querySelector("#emotespanel");
    if(localStorage.epposition == 1) { 
        panel.setAttribute("class", "ep__floating");
        $("#emotespanel").appendTo($("#emotewrap"));
        localStorage.epposition = 0;
        document.querySelector('#emotewrap').style.top = '100px';
        document.querySelector('#emotewrap').style.left = '-15px';
        localStorage.epFlTop = 100;
        localStorage.epFlLeft = -15;
    } else {
        panel.setAttribute("class", "ep__fixed");
        $("#emotespanel").insertAfter('#userlist');
        localStorage.epposition = 1;
    }
}

$('#newpollbtn').prependTo($("#leftcontrols"));

/* Makes the custom emotes panel draggable */
dragElement(document.getElementById("emotewrap"));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
        localStorage.epFlTop = document.querySelector('#emotewrap').style.top.substring(0, document.querySelector('#emotewrap').style.top.length - 2);
        localStorage.epFlLeft = document.querySelector('#emotewrap').style.left.substring(0, document.querySelector('#emotewrap').style.left.length - 2);
    }
}

/* Autocomplete function for emotes */
function autocomplete(inp, arr) {
    var currentFocus;
    var currentInputVal = '';
    var matchedlength = 0;
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;

        closeAllLists();
        
        if (!val) { return false;}
        currentFocus = -1;

        a = document.createElement("DIV");
        a.setAttribute("id", "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        a.style.bottom = `${$('#rightcontent > form').outerHeight() + $('#leftcontrols').outerHeight()}px`
        this.parentNode.appendChild(a);
        $("#autocomplete-list").insertBefore(document.querySelectorAll('form')[1]);

        // FIXME: Regex lookbehinds aren't supported on Safari, might have to find alternative
        // Regex searches for / character preceded by a space, matching all succeeding characters unless it is a whitespace.
        var matched = document.getElementById("chatline").value.match(/(?<!\S)\/\S*$/gim)?.toString();
        var matchedNoSlash = matched?.substring(1, matched.length);
        currentInputVal = document.getElementById("chatline").value;

        for (i = 0; i < arr.length; i++) {
            if (arr[i].name.substr(0, matched?.length)?.toUpperCase() == matched?.toUpperCase()) { // Handle direct match
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
            } else if (arr[i].name.substring(1, arr[i].name.length).indexOf(matchedNoSlash) > -1) { // Handle match in string
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

            document.querySelector('.autocomplete-active').scrollIntoViewIfNeeded(false);
            $("#chatline").val(currentInputVal.substring(0, (currentInputVal.length - currentInputVal.match(/(?<!\S)\/\S*$/gim).toString().length)) + document.getElementsByClassName('autocomplete-active')[0].querySelector('input').getAttribute('value'));
        } else if (e.keyCode == 38) {
            e.preventDefault();
            currentFocus--;
            addActive(x);

            document.querySelector('.autocomplete-active').scrollIntoViewIfNeeded(false);
            $("#chatline").val(currentInputVal.substring(0, (currentInputVal.length - currentInputVal.match(/(?<!\S)\/\S*$/gim).toString().length)) + document.getElementsByClassName('autocomplete-active')[0].querySelector('input').getAttribute('value'));
        } else if (e.keyCode == 13 || e.keyCode == 9) {
            // stoppropagation doesnt really work here to stop enter from sending message
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

/* Reply feature */
const LOAD_IN_DELAY = 10 //Delay to allow message to come in before modifying it
socket.on("chatMsg", (message) => {
    const messages = getAllMessages()
    const incomingMessageId = generateHash(message.username, message.msg, getTimeString(message.time))
    const element = messages.filter((item) => item.pseudoId == incomingMessageId)[0]?.element
    
    if (/\[r\](.+?)\[\/r\]/g.exec(message.msg)) {
        const replyId = message.msg.replace(/.*\[r\](.*?)\[\/r\].*/, '$1').replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&') //Bandaid fix for chat sanitizer
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

        if (!replyingTo[0]?.message) { //If chat is cleared and no message found, not working
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
        // insert reply button at reply messages
        $(element).find('.timestamp').after('<button onclick="replyToButton(event)" title="Reply" class="reply-button"><i class="reply-icon"></i></button>')
    } else if (message.username != '[server]') {
        // insert reply button at any incoming message
        $(element).find('.timestamp').after('<button onclick="replyToButton(event)" title="Reply" class="reply-button"><i class="reply-icon"></i></button>')
    }
})

function processReplyMessage(text) {
    let processedText = text
    if (/(?<!\S)\/\S*/gim.exec(text)) { //message contains emote
        processedText = text.replace(/(?<!\b)\/(\w+)/g, (match, emoteName) => {
            const emoteUrl = autocompleteArr.filter(emote => emote.name == `/${emoteName}`)[0] || ""; // get the replacement from the dictionary or use an empty string if not found
            return `<img class="channel-emote" src="${emoteUrl}" title="/${emoteName}">`
        })
    }
    return processedText.replace(/\[r\](.+?)\[\/r\]/, '').trim() //remove reply tags
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

/* document.addEventListener("contextmenu", (e) => {
    const target = e.target
    if (
        (target.className.includes('chat-msg-') || target.parentNode.className.includes('chat-msg-') || target.parentNode.parentNode.className.includes('chat-msg-')) 
        && !target.className.includes('server') && !target.className.includes('reply') && getSelectionText().length == 0
    ) {
        e.preventDefault()
        let message
        let username
        let pseudoId 
        if (target.tagName == 'SPAN' && !target.className.includes('timestamp')) {
            //Clicked on message text itself, retrieve message text here
            message = target.innerHTML //Message
            username = target.parentNode.className.split('-')[2].split(' ')[0] //Username
            pseudoId = generateHash(username, message, $(target).siblings('.timestamp').text()) //Message Pseudo ID
        } else if (target.className.includes('timestamp')) {
            //Clicked on timestamp
            message = $(target).siblings().length > 1 ? $(target).siblings().last().html() : $(target).siblings().html()
            username = target.parentNode.className.split('-')[2].split(' ')[0]
            pseudoId = generateHash(username, message, target.innerHTML) 
        } else {
            //Clicked on message text parent
            message = $(target).find('span:not(.timestamp)').length > 1 ? $(target).find('span:not(.timestamp)').last().html() : $(target).find('span:not(.timestamp)').html()
            username = target.className.split('-')[2].split(' ')[0]
            pseudoId = generateHash(username, message, $(target).find('span.timestamp').text())
        }

        const chatlineVal = $('#chatline').val().replace(/(?:.*?\[\/r\]\s+)/, '')
        if (sanitizeMessageForPseudoID(message) != '')
            $('#chatline').val(`[r]${pseudoId.trim()}[/r] ${chatlineVal}`).focus()
    }
}) */

function sanitizeMessageForPseudoID(message1) { 
    //This will generate generic <img for this portion of the id if the message begins with an emote
    //Could be fixed if the emote name is used, or a more robust id is used
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
    $('div#messagebuffer').children().each((i, element) => { //TODO: cycle through getAllMessages instead
        if (!$(element).attr('class')?.includes('chat-msg-') || $(element).attr('class')?.includes('server')) return
        const message = $(element).find('span:not(.timestamp)').length > 1 ? $(element).find('span:not(.timestamp)').last().html() : $(element).find('span:not(.timestamp)').html()
        if (/\[r\](.+?)\[\/r\]/g.exec(message)) {
            const replyId = message.replace(/.*\[r\](.*?)\[\/r\].*/, '$1').replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&amp;/g, '&') //Bandage fix for chat sanitizer
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

            if (!replyingTo[0]?.message) { //If chat is cleared and no message found, not working
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
        //add reply button to all chat messages
        if ($(element).attr('class')?.includes('chat-msg-')) {
            $(element).find('.timestamp').after('<button onclick="replyToButton(event)" title="Reply" class="reply-button"><i class="reply-icon"></i></button>')
        }
    })
})

//  Formatted version of a popular md5 implementation
//  Original copyright (c) Paul Johnston & Greg Holt.
//  The function itself is now 42 lines long.

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

/* ========== TEXT STYLES MANAGER ========== */
class TextStyleManager {
        constructor() {
                    this.defaultStyles = {
                                    fontFamily: 'Arial',
                                    textColor: '#FFFFFF',
                                    nameColor: '#FFD700',
                                    fontSize: 'normal',
                                    effects: {
                                                        bold: false,
                                                        italic: false,
                                                        underline: false,
                                                        strikethrough: false,
                                                        glow: false,
                                                        shadow: false
                                    },
                                    glowColor: '#00FF00',
                                    shadowColor: '#000000'
                    };

                    this.fontOptions = {
                                    'Arial': 'Arial, sans-serif',
                                    'Verdana': 'Verdana, sans-serif',
                                    'Times New Roman': '"Times New Roman", serif',
                                    'Georgia': 'Georgia, serif',
                                    'Courier New': '"Courier New", monospace',
                                    'Comic Sans': '"Comic Sans MS", cursive',
                                    'Impact': 'Impact, sans-serif',
                                    'Trebuchet MS': '"Trebuchet MS", sans-serif',
                                    'Ubuntu': 'Ubuntu, sans-serif',
                                    'Quicksand': 'Quicksand, sans-serif'
                    };

                    this.styles = this.loadStyles();
                    this.initializeUI();
        }

        loadStyles() {
                    const saved = localStorage.getItem('cytube_text_styles');
                    return saved ? { ...this.defaultStyles, ...JSON.parse(saved) } : { ...this.defaultStyles };
        }

        saveStyles() {
                    localStorage.setItem('cytube_text_styles', JSON.stringify(this.styles));
                    this.applyStylesToMessages();
        }

        initializeUI() {
                    const stylesPanelBtn = $('<button id="text-styles-btn" class="btn btn-sm btn-default" title="Text Styles">✨</button>')
                        .insertAfter("#emotes-btn")
                        .on("click", () => this.openStylesPanel());

                    this.createStylesModal();
        }

        createStylesModal() {
                    const modal = `
                                <div id="text-styles-modal" class="text-styles-modal">
                                                <div class="text-styles-modal-content">
                                                                    <div class="text-styles-modal-header">
                                                                                            <h2>Text Styles</h2>
                                                                                                                    <button class="text-styles-modal-close" onclick="textStyleManager.closeStylesPanel()">&times;</button>
                                                                                                                                        </div>
                                                                                                                                                            
                                                                                                                                                                                <div class="text-styles-modal-body">
                                                                                                                                                                                                        <div class="style-control-group">
                                                                                                                                                                                                                                    <label for="font-select">Font:</label>
                                                                                                                                                                                                                                                                <select id="font-select" class="style-input">
                                                                                                                                                                                                                                                                                                ${Object.keys(this.fontOptions).map(font => 
                                                                                                                                                                                                                                                                                                                                        `<option value="${font}" ${this.styles.fontFamily === font ? 'selected' : ''}>${font}</option>`
                                                                                                                                                                                                                                                                                                                                                                    ).join('')}
                                                                                                                                                                                                                                                                                                                                                                                                </select>
                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                                                                                                                                                                                                                                <div class="style-control-group">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <label for="text-color">Text Color:</label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div class="color-picker-group">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <input type="color" id="text-color" class="style-input color-input" value="${this.styles.textColor}">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <span id="text-color-preview" class="color-preview" style="background-color: ${this.styles.textColor}"></span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <div class="style-control-group">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <label for="name-color">Name Color:</label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <div class="color-picker-group">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <input type="color" id="name-color" class="style-input color-input" value="${this.styles.nameColor}">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <span id="name-color-preview" class="color-preview" style="background-color: ${this.styles.nameColor}"></span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div class="style-control-group">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <label for="font-size">Font Size:</label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <select id="font-size" class="style-input">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <option value="small" ${this.styles.fontSize === 'small' ? 'selected' : ''}>Small</option>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <option value="normal" ${this.styles.fontSize === 'normal' ? 'selected' : ''}>Normal</option>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <option value="large" ${this.styles.fontSize === 'large' ? 'selected' : ''}>Large</option>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </select>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <div class="style-control-group">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <label>Effects:</label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <div class="effects-grid">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <label class="effect-checkbox"><input type="checkbox" value="bold" ${this.styles.effects.bold ? 'checked' : ''} class="effect-input"><span>Bold</span></label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <label class="effect-checkbox"><input type="checkbox" value="italic" ${this.styles.effects.italic ? 'checked' : ''} class="effect-input"><span>Italic</span></label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <label class="effect-checkbox"><input type="checkbox" value="underline" ${this.styles.effects.underline ? 'checked' : ''} class="effect-input"><span>Underline</span></label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <label class="effect-checkbox"><input type="checkbox" value="strikethrough" ${this.styles.effects.strikethrough ? 'checked' : ''} class="effect-input"><span>Strikethrough</span></label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <label class="effect-checkbox"><input type="checkbox" value="glow" ${this.styles.effects.glow ? 'checked' : ''} class="effect-input"><span>Glow</span></label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <label class="effect-checkbox"><input type="checkbox" value="shadow" ${this.styles.effects.shadow ? 'checked' : ''} class="effect-input"><span>Shadow</span></label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <div class="style-control-group" id="glow-color-group" style="display: ${this.styles.effects.glow ? 'block' : 'none'};">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <label for="glow-color">Glow Color:</label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div class="color-picker-group">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <input type="color" id="glow-color" class="style-input color-input" value="${this.styles.glowColor}">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <span id="glow-color-preview" class="color-preview" style="background-color: ${this.styles.glowColor}"></span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <div class="style-control-group" id="shadow-color-group" style="display: ${this.styles.effects.shadow ? 'block' : 'none'};">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <label for="shadow-color">Shadow Color:</label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <div class="color-picker-group">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <input type="color" id="shadow-color" class="style-input color-input" value="${this.styles.shadowColor}">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <span id="shadow-color-preview" class="color-preview" style="background-color: ${this.styles.shadowColor}"></span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div class="style-preview-group">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <label>Preview:</label>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <div id="text-style-preview" class="text-style-preview">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                Your message preview
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <div class="style-modal-buttons">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <button id="save-styles-btn" class="btn btn-primary btn-sm">Save Styles</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <button id="reset-styles-btn" class="btn btn-default btn-sm">Reset to Default</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    `;

                    $('body').append(modal);
                    this.attachEventListeners();
        }

        attachEventListeners() {
                    const self = this;

                    $('#font-select').on('change', function() {
                                    self.styles.fontFamily = $(this).val();
                                    self.updatePreview();
                    });

                    $('#text-color').on('change', function() {
                                    self.styles.textColor = $(this).val();
                                    $('#text-color-preview').css('background-color', self.styles.textColor);
                                    self.updatePreview();
                    });

                    $('#name-color').on('change', function() {
                                    self.styles.nameColor = $(this).val();
                                    $('#name-color-preview').css('background-color', self.styles.nameColor);
                                    self.updatePreview();
                    });

                    $('#font-size').on('change', function() {
                                    self.styles.fontSize = $(this).val();
                                    self.updatePreview();
                    });

                    $('.effect-input').on('change', function() {
                                    const effect = $(this).val();
                                    self.styles.effects[effect] = $(this).is(':checked');

                                    if (effect === 'glow') {
                                                        $('#glow-color-group').toggle(self.styles.effects.glow);
                                    }
                                    if (effect === 'shadow') {
                                                        $('#shadow-color-group').toggle(self.styles.effects.shadow);
                                    }

                                    self.updatePreview();
                    });

                    $('#glow-color').on('change', function() {
                                    self.styles.glowColor = $(this).val();
                                    $('#glow-color-preview').css('background-color', self.styles.glowColor);
                                    self.updatePreview();
                    });

                    $('#shadow-color').on('change', function() {
                                    self.styles.shadowColor = $(this).val();
                                    $('#shadow-color-preview').css('background-color', self.styles.shadowColor);
                                    self.updatePreview();
                    });

                    $('#save-styles-btn').on('click', () => {
                                    self.saveStyles();
                                    self.closeStylesPanel();
                    });

                    $('#reset-styles-btn').on('click', () => {
                                    if (confirm('Reset all styles to default?')) {
                                                        self.styles = { ...self.defaultStyles };
                                                        self.saveStyles();
                                                        self.closeStylesPanel();
                                                        location.reload();
                                    }
                    });
        }

        updatePreview() {
                    const preview = $('#text-style-preview');
                    const css = this.generateCSS(this.styles, false);
                    preview.attr('style', css).text('Your message preview');
        }

        generateCSS(styles, isName = false) {
                    let css = '';
                    const fontFamily = this.fontOptions[styles.fontFamily] || 'Arial, sans-serif';
                    const color = isName ? styles.nameColor : styles.textColor;
                    const fontSize = styles.fontSize === 'small' ? '0.9em' : (styles.fontSize === 'large' ? '1.1em' : '1em');

                    css += `font-family: ${fontFamily}; color: ${color}; font-size: ${fontSize};`;

                    let textShadow = [];
                    if (styles.effects.glow) {
                                    textShadow.push(`0 0 10px ${styles.glowColor}`);
                    }
                    if (styles.effects.shadow) {
                                    textShadow.push(`2px 2px 4px ${styles.shadowColor}`);
                    }
                    if (textShadow.length) {
                                    css += `text-shadow: ${textShadow.join(', ')};`;
                    }

                    if (styles.effects.bold) css += 'font-weight: bold;';
                    if (styles.effects.italic) css += 'font-style: italic;';
                    if (styles.effects.underline) css += 'text-decoration-line: underline;';
                    if (styles.effects.strikethrough) css += 'text-decoration-line: line-through;';

                    return css;
        }

        applyStylesToMessages() {
                    const username = CLIENT.name;
                    $(`.chat-msg-${username}`).each((i, element) => {
                                    const $elem = $(element);
                                    const $username = $elem.find('span.username');
                                    const $message = $elem.find('span:not(.timestamp):not(.username)');

                                    if ($username.length) {
                                                        $username.attr('style', this.generateCSS(this.styles, true));
                                    }
                                    if ($message.length) {
                                                        $message.attr('style', this.generateCSS(this.styles, false));
                                    }
                    });
        }

        openStylesPanel() {
                    $('#text-styles-modal').css('display', 'flex');
        }

        closeStylesPanel() {
                    $('#text-styles-modal').css('display', 'none');
        }
}

let textStyleManager;
$(document).ready(function() {
        textStyleManager = new TextStyleManager();
});
