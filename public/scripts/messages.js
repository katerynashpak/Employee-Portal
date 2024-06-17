const sendBtn = document.getElementById('send')
const messages = document.getElementById('messages')
const messageBox = document.getElementById('messageBox')

let ws

//let userName = '<%= name %>'
let userColors = {}

function showMessage(message) {
    //console.log("Received message:", message)

    const sender = message.sender
    const content = message.content
    const textColor = getUserColor(sender)

    const messageClass = sender === userName ? 'message sender' : 'message receiver'

    messages.innerHTML += `<div class="${messageClass}"> ${sender}: ${content}</div>`
    //messages.textContent += `\n\n${sender}: ${content}`
    messages.scrollTop = messages.scrollHeight
    messageBox.value = ''
}

function getUserColor(sender) {
    if (!userColors[sender]) {
        const color = '#' + Math.floor(Math.random() * 16777215).toString(16)
        userColors[sender] = color
    }
    return userColors[sender]
}



function init() {

    if (ws) {
        ws.onerror = ws.onopen = ws.onclose = null
        ws.close()
    }

    ws = new WebSocket('ws://localhost:7000') //replace 'localhost' with actual ip adrs to send messages from multiple devices


    ws.onopen = () => {
        console.log('Connection opened!')
    }

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        showMessage(message)
        message.sender = req.user.name
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message))
            }
        })
    }

    ws.onclose = function () {
        ws = null
        // showMessage('Connection closed')
    }
}

sendBtn.onclick = function () {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        showMessage("No WebSocket connection :(")
        return
    }

    const newMessage = messageBox.value
    const messageObject = { content: newMessage, sender: userName } // Construct message object
    ws.send(JSON.stringify(messageObject)) // Send message as JSON string
    //showMessage(messageObject) // Display message in the chat
    console.log("User name:", userName)
}

init()
console.log("state: ", ws.readyState)
