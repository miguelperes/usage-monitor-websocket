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
        var request = { 'type': 'new-connection', 'client-type': 'web-client' }
        this.send( JSON.stringify(request) );
    }

    this.ws.onmessage = function(e) {
       self.processMessage(e.data);
    };

    this.ws.onclose = function(e) {}
}

WebSocketHandler.prototype.processMessage = function(message)
{
    var msg = JSON.parse(message);

    var msgType = msg['type'];
    console.log(msgType);

    switch(msgType)
    {
        case 'remove-hw-clients':
            this.removeMonitor(msg);
            break;

        case 'new-hwclient':
            this.addMonitor(msg);
            break;

        case 'boot-usage-data':
            this.initData(msg)
            break;

        case 'usage-update':
            this.updateData(msg);
            break;

        default:
            console.log('ERROR: Invalid message from server');
            console.log(msg);
    }
}

WebSocketHandler.prototype.initData = function(message)
{
    var content = JSON.parse(message.content)
    var list = content['client-list'];
    if(list.length > 0){
        for(var i = 0; i < list.length; i++)
        {
            obj = list[i]
            // monitorDiv = document.createElement('div');
            // monitorDiv.classList.add('monitor');
            // monitorDiv.id = 'monitor_' + obj['id'];
            var monitorDiv = createMonitorDiv( obj['id'] );
            document.getElementById('monitors-area').appendChild(monitorDiv);
        }
        
    }
    else {
        console.log('Nothing stored in the server.');
    }

}

WebSocketHandler.prototype.addMonitor = function(message)
{
    var id = JSON.parse(message.content);
    console.log('adding ' + id);
    var monitorDiv = createMonitorDiv( id );
    document.getElementById('monitors-area').appendChild(monitorDiv);
}

WebSocketHandler.prototype.removeMonitor = function(message)
{
    var id = JSON.parse(message.content);
    console.log('removing ' +id);

    var monitorToRemove = document.getElementById('monitor_' + id);
    document.getElementById('monitors-area').removeChild(monitorToRemove);
}

function createMonitorDiv(id)
{
    monitorDiv = document.createElement('div');
    monitorDiv.classList.add('monitor');
    monitorDiv.id = 'monitor_' + id;

    return monitorDiv;
}

WebSocketHandler.prototype.updateData = function(message)
{
    
}

// function isJSONEmpty(JSONObj)
// {
//     return Object.keys(JSONObj).length === 0 && JSON.stringify(JSONObj) === JSON.stringify({});
// }


















