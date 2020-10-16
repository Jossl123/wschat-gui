usernameSpan = document.getElementById('nav-panel-bottom-bar-username')

chatBtn = document.getElementById('nav-btn-panel-chat')
serversBtn = document.getElementById('nav-btn-panel-servers')
searchBtn = document.getElementById('nav-btn-panel-search')
settingsBtn = document.getElementById('nav-btn-panel-settings')

function askUsername(action) {

    username = window.prompt('Enter a username', 'anon').trim();

    if (username == null || username == "") {
        askUsername(action);
    } else {
        usernameSpan.innerHTML = username
    }

    switch (action) {
        case "connect":
            connect(username);
            break;

        case "changeName":
            changeName(username);
            break;

        default:
            break;
    }

}

function setPanelTab(tab) {
    document.getElementsByClassName('nav-icon-active')[0].classList.remove('nav-icon-active')
    document.getElementById(`nav-btn-panel-${tab}`).children[0].classList.add('nav-icon-active')

    document.getElementsByClassName('nav-panel-active')[0].classList.add('nav-panel-desactivate')
    document.getElementsByClassName('nav-panel-active')[0].classList.remove('nav-panel-active')
    document.getElementById(`nav-panel-${tab}`).classList.remove('nav-panel-desactivate')
    document.getElementById(`nav-panel-${tab}`).classList.add('nav-panel-active')
}

askUsername("connect")

usernameSpan.onclick = function() { askUsername("changeName") }

chatBtn.onclick = function() { setPanelTab('chat') }
serversBtn.onclick = function() { setPanelTab('servers') }
searchBtn.onclick = function() { setPanelTab('search') }
settingsBtn.onclick = function() { setPanelTab('settings') }