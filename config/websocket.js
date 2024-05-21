const WebSocket = require('ws')

//const ws = new WebSocket('ws://localhost:7000/messages')

let messages = [] // Array to store messages during the session

function handleWebSocket(server){
    const wss = new WebSocket.Server({server})

    wss.on('connection', function connection(ws) {
        console.log('WebSocket connection established.')
    
        // Send existing messages to the newly connected client
        messages.forEach(message => {
            ws.send(JSON.stringify(message))
        })
    
        // Broadcast incoming messages to all connected clients
        ws.on('message', function incoming(data) {
            console.log('Received message:', data)
    
            // Parse the received JSON message
            const message = JSON.parse(data)
            messages.push(message) // Store the message content in memory
    
            // Broadcast the new message content to all clients
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message))
                }
            })
        })
    })
}

module.exports = { handleWebSocket }