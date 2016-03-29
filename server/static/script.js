// var SERVER_ADRESS = "ws://localhost:8080/websocket"		//local
// var SERVER_ADRESS = "ws://192.168.0.100:8080/websocket"	//global
var SERVER_ADRESS = "ws://45.55.193.149:8080/websocket"	//amazon server
var webSocket;

window.onload = function()
{
    webSocket = new WebSocketHandler(SERVER_ADRESS);

    // var monitorsArea = document.getElementById('monitors-area');

    // if( !monitorsArea.hasChildNodes() )
    // {
    // 	webSocket.nobodyConnected();
    // }
}