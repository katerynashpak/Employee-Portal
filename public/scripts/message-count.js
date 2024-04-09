document.addEventListener("DOMContentLoaded", function(){

    const ws = require('./config/websocket')
    const WebSocket = require('ws')
    const wss = new WebSocket.Server({noServer: true})

    ws.handleWebSocket(wss)

    wss.on('connection', function connction(ws){
        ws.on('message', function incomming(data){
            const message = JSON.parse(data)
            if(message.type === "newMessage" && window.location.pathname !== "/messages"){
                updateMessageCount();
            }
        })
    })


    //updateMessageCount();

    function updateMessageCount(){ //using AJAX

        const xhr = new XMLHttpRequest() 
        xhr.open("GET", "/api/messages/unreadCount", true)
        xhr.onreadystatechange = function(){
            if(xhr.readyState === XMLHttpRequest.DONE){ //when request is completed
                if(xhr.status === 200){
                    const unreadCount = parseInt(xhr.responseText) //response as integer
                    document.getElementById("message-count").innerText = unreadCount; //update the count text
                } else {
                    console.error("Failed to fetch unread message count")
                }
            }
        }
        xhr.send() //send ajax request

    }

    document.getElementById("messages-link").addEventListener("click", function(){
        document.getElementById("message-count").innerText = ""
    })


})