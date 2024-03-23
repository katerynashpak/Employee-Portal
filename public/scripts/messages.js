const sendBtn = document.getElementById('send');
        const messages = document.getElementById('messages');
        const messageBox = document.getElementById('messageBox');

        let ws;

        function showMessage(message){
            if(typeof message !== 'string'){
                message = message.toString()
            }

            messages.textContent += `\n\n${message}`; //backticks, not single quotation marks
            messages.scrollTop = messages.scrollHeight;
            messageBox.value = '';
        }

        function init(){
            if(ws){
                ws.onerror = ws.onopen = ws.onclose = null;
                ws.close();
            }

            ws = new WebSocket('ws://localhost:7000');

            ws.onopen = () => {
                console.log('Connection opened!');
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                showMessage(message.content);
            };

            ws.onclose = function(){
                ws = null;
                // showMessage('Connection closed');
            };
        }

        sendBtn.onclick = function(){
            if(!ws || ws.readyState !== WebSocket.OPEN){
                showMessage("No WebSocket connection :(");
                return;
            }

            const newMessage = messageBox.value;
            const messageObject = { content: newMessage }; // Construct message object
            ws.send(JSON.stringify(messageObject)); // Send message as JSON string
            showMessage(newMessage); // Display message in the chat
        };

        init();
        console.log("state: ", ws.readyState);