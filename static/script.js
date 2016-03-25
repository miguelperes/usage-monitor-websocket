window.onload = function()
{
    connectToWS();
}
    
// var ws;
var webSocket;

function connectToWS() {
    webSocket = new WebSocketHandler("ws://localhost:8080/websocket");
}




function sendMsg() {
    WebSocket.ws.send(document.getElementById('msg').value);
}