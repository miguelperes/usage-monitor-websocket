function WebSocketHandler(serverAddress)
{
	this.ws = new WebSocket(serverAddress); // WebSocket Object
    this.numberOfClients = 0;               // Number of clients using the python monitor app

	this.initWebSocketCallbacks();
}

WebSocketHandler.prototype.initWebSocketCallbacks = function()
{
    var self = this;

	this.ws.onerror = function (error) {
      console.log('WebSocket Error ' + error);
    };

    this.ws.onopen = function(e) {
        // console.log('Opened connection');
        // console.log(e);
        var request = { 'type': 'new-connection', 'client-type': 'web-client' }
        this.send( JSON.stringify(request) );

        // var request = { 'request': 'retrieve-clients-data'}
        // this.send( JSON.stringify(request) );
    }

    this.ws.onmessage = function(e) {
       //alert(e.data);
       // console.log(e.data);
       self.processMessage(e.data);
    };

    this.ws.onclose = function(e) {}
}

WebSocketHandler.prototype.processMessage = function(message)
{
    var msg = JSON.parse(message);
    var msgType = msg.type;
    // console.log(msgType);

    switch(msgType)
    {
        case 'update-hw-clients':
            console.log(msg.content);
            this.numberOfClients = msg.content;
            break;

        default:
            console.log('ERROR: Invalid message from server');
            console.log(msg);
    }

}


















