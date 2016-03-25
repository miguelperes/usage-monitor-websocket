function WebSocketHandler(serverAddress)
{
	this.ws = new WebSocket(serverAddress);

	this.initWebSocketCallbacks();
}

WebSocketHandler.prototype.initWebSocketCallbacks = function()
{
	this.ws.onerror = function (error) {
      console.log('WebSocket Error ' + error);
    };

    this.ws.onopen = function(e) {
        // console.log('Opened connection');
        // console.log(e);
        var request = { 'request': 'new-connection', 'client-type': 'web-client' }
        this.send( JSON.stringify(request) );

        var request = { 'request': 'retrieve-clients-data'}
        this.send( JSON.stringify(request) );
    }

    this.ws.onmessage = function(e) {
       //alert(e.data);
       console.log(e.data);
    };

    this.ws.onclose = function(e) {

    }
}