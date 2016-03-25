var SERVER_ADRESS = "ws://localhost:8080/websocket"		//local
// var SERVER_ADRESS = "ws://192.168.0.100:8080/websocket"	//global

window.onload = function()
{
    connectToWS();
}
    
var webSocket;

function connectToWS() {
    webSocket = new WebSocketHandler(SERVER_ADRESS);

}

function sendMsg() {
    WebSocket.ws.send(document.getElementById('msg').value);
}