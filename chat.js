let nameColor = `hsla(${~~(360 * Math.random())},70%,70%,0.8)`;

let chat = document.getElementById('app-chat-msg');
let chatbox = document.getElementById('chat-textbox');
let typing = document.getElementById('chat-typing-indicator');
let connected_ul = document.getElementById('nav-chat-connected-list');

let nick;
let ws;
let typingUsers = [];
let serversListAvaible = [];

function chatMention(user) {
    chatbox.value += `@${user} `;
    chatbox.focus();
}

function connect(username) {
    nick = username;
    ws = new WebSocket(`ws://${document.location.hostname}:9898/`);
    document.getElementById('app-chat-header-name').innerHTML = `<b>${new URL(`ws://${document.location.hostname}:${document.location.port}`).host}</b>`;

    let userConnected = [];
    let serversListUser = [];

    function updateTyping() {
        switch (typingUsers.length) {
            case 0:
                typing.innerHTML = '<br>';
                break;

            case 1:
                typing.innerHTML = `<b>${typingUsers[0]}</b> is typing`;
                break;

            default:
                typing.innerHTML = `<b>${typingUsers.join(', ')}</b> are typing`;
                break;
        }
    }

    function updateServer(){

    }

    function updateConnected() {
        connected_ul.innerHTML = "";

        for (let i in userConnected) {
            connected_ul.innerHTML += `<li class="nav-chat-connected-user" onclick="chatMention('${userConnected[i]}')">${userConnected[i]}</li>`;
        }
    }

    ws.onopen = function() {
        chatbox.disabled = false;
        ws.send(JSON.stringify({
            type: "newConnection",
            name: nick,
            nameColor: nameColor
        }));
    };

    ws.addEventListener("open", () => {
        console.log("Connected to server");

        ws.onmessage = function(msg) {
            let json = JSON.parse(msg.data);
            switch (json.type) {
                case "newConnection":
                    chat.innerHTML += `<i>${json.name} is connected.</i><br>`;
                    userConnected = json.onlineUser;
                    serversListAvaible = json.serversListAvaible;
                    updateConnected();
                    break;

                case "connected":
                    chat.innerHTML += `<i>You're successfully connected as ${json.name}.</i><br>`;
                    userConnected = json.onlineUser;
                    updateConnected();
                    break;

                case "nameInvalid":
                    userConnected = json.onlineUser;
                    updateConnected();
                    while (userConnected.includes(nick)) {
                        nick = prompt('Username already taken, choose another one.', 'anon').trim();
                    }
                    ws.send(JSON.stringify({
                        type: "newConnection",
                        name: nick,
                        nameColor: nameColor
                    }))
                    break;

                case "typing":
                    if (json.name != nick) {
                        if (json.data) {
                            if (!typingUsers.includes(json.name)) {
                                typingUsers.push(json.name);
                                updateTyping()
                            }
                        } else {
                            if (typingUsers.includes(json.name)) {
                                typingUsers.splice(typingUsers.indexOf(json.name), 1);
                                updateTyping()
                            }
                        }
                    }
                    break;

                case "editNick":
                    userConnected = json.onlineUser;
                    chat.innerHTML += `<i>${json.oldName} change his name for ${json.newName}.</i><br>`;
                    updateConnected();
                    break;

                case "message":
                    chat.innerHTML += `<div class="msg"><b style="color: ${json.nameColor}; height: fit-content">${json.name} </b><span>${json.data}</span><br></div>`;
                    break;

                case "disconnecting":
                    chat.innerHTML += `<i>${json.name} is disconnected.</i><br>`;
                    userConnected = json.onlineUser;
                    updateConnected();
                    break;

                case "updateServers":
                    updateServer();
                    break;
                
                case "newServer":
                    serversListAvaible = json.serversListAvaible;
                    updateServer();
                    break;

                default:
                    break;
            }
        };

        ws.onclose = function(event) {
            userConnected = [];
            updateConnected();
            chatbox.disabled = true;
            chat.innerHTML += `<i>You've been disconnected</i><br>`;
            document.getElementById('app-chat-header-name').innerHTML = `Disconnected`;
        };
    })

    chatbox.addEventListener('keyup', function(event) {
        if (event.key == "Enter") {
            if (chatbox.value !== "") {
                ws.send(JSON.stringify({
                    type: "message",
                    name: nick,
                    msg: chatbox.value,
                    nameColor: nameColor
                }));
                chatbox.value = "";
            };
        }
        if (chatbox.value !== "" && chatbox.value != null) {
            isTyping = true;
        } else {
            isTyping = false;
        }
        ws.send(JSON.stringify({
            type: "typing",
            data: isTyping,
            name: nick
        }));
    });

    window.onbeforeunload = function() {
        ws.send(JSON.stringify({
            type: "disconnecting",
            name: nick
        }));
        ws.send(JSON.stringify({
            type: "typing",
            data: false,
            name: nick
        }));
        ws.close();
    }
}

function changeName(newUsername) {
    ws.send(JSON.stringify({
        type: "editNick",
        oldName: nick,
        newName: newUsername
    }));
    nick = newUsername;
}

function addServer(){
    serverName = window.prompt('Enter a server name', 'server');

    if (serverName == null || serverName == "") {
        alert("No server have been added");
    } else {
        serverName.trim().replace(/ /g, "");
        ws.send(JSON.stringify({
            type: "newServer",
            serverName: serverName,
        }))
        console.log(serversListAvaible);
    }
}