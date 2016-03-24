window.onload = function()
    {
        connectToWS();
    }
    
    var ws;
 
    function connectToWS() {
        ws = new WebSocket("ws://localhost:8080/websocket");
        // console.log(ws);

        ws.onopen = function(e) {
            // console.log('Opened connection');
            // console.log(e);
            var request = { 'request': 'retrieve-clients-data'}
            ws.send( JSON.stringify(request) );
        }
 
        ws.onmessage = function(e) {
           //alert(e.data);
           console.log(e.data);
        };
    }
 
    function sendMsg() {
        ws.send(document.getElementById('msg').value);
    }