function WebSocketHandler(serverAddress)
{
	this.ws = new WebSocket(serverAddress); // WebSocket Object
    this.numberOfClients = 0;               // Number of clients using the python monitor app
    this.charts = {};

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
    console.log('BOOT: GATHERING ALL DATA FROM SERVER');
    var content = JSON.parse(message.content)
    var list = content['client-list']; // List of all clients and their status history

    if(list.length > 0){
        for(var i = 0; i < list.length; i++)
        {
            obj = list[i];

            var monitorDiv = createMonitorDiv( obj['id'] );
            document.getElementById('monitors-area').appendChild(monitorDiv);

            var chart = this.createChartAndAppend(obj, monitorDiv)

            chart.update();

            this.charts[ obj['id'] ] = chart;
        }        
    }
    else {
        console.log('Nothing stored in the server.');
    }
}

WebSocketHandler.prototype.addMonitor = function(message)
{
    console.log('ADDING A NEW MONITOR - ID: ' + id);
    var id = JSON.parse(message.content);
    
    var monitorDiv = createMonitorDiv(id);
    document.getElementById('monitors-area').appendChild(monitorDiv);

    var monitorCanvas = createMonitorCanvas(id)

    var clientStats = { id: id, history: [] };
    var chart = this.createChartAndAppend(clientStats, monitorDiv);

    this.charts[id] = chart;
}

WebSocketHandler.prototype.removeMonitor = function(message)
{
    var id = JSON.parse(message.content);
    console.log('REMOVING MONITOR - ID: ' +id);

    var monitorToRemove = document.getElementById('monitor_' + id);
    document.getElementById('monitors-area').removeChild(monitorToRemove);

    if(this.charts[id])
    {
        delete this.charts[id];
    }
}

function createMonitorDiv(id)
{
    monitorDiv = document.createElement('div');
    monitorDiv.classList.add('monitor');
    monitorDiv.id = 'monitor_' + id;

    return monitorDiv;
}

function createMonitorCanvas(id)
{
    var monitorCanvas = document.createElement('canvas');
    monitorCanvas.classList.add('monitor-canvas');
    monitorCanvas.id = 'canvas_' + id;
    return monitorCanvas;
}

WebSocketHandler.prototype.createChartAndAppend = function(clientStats, divToAppendTo)
{
    var data = this.initDataForChart(clientStats['history']);

    

    var monitorCanvas = createMonitorCanvas( clientStats['id'] )
    
    var cs = getComputedStyle(divToAppendTo);
    var divWidth = parseInt(cs.getPropertyValue('width'), 10);
    var divHeight = parseInt(cs.getPropertyValue('height'), 10);
    monitorCanvas.width = divWidth;
    monitorCanvas.height = divHeight;

    var ctx = monitorCanvas.getContext("2d");
    var newChart = new Chart(ctx).Line(data);
    
    divToAppendTo.appendChild(monitorCanvas);

    return newChart;
}

WebSocketHandler.prototype.initDataForChart = function(usageHistory)
{
    var data = JSON.parse(JSON.stringify(CHART_FORMAT));

    for(var i  = 0; i < usageHistory.length; i++)
    {
        var stats = usageHistory[i];

        data['labels'].push( stats['timestamp'] );
        data['datasets'][0]['data'].push( stats['cpu-usage'] );
        data['datasets'][1]['data'].push( stats['memory-usage'] );
    }

    return data;
}

WebSocketHandler.prototype.updateData = function(message)
{
    var monitorID   = message['id'];
    console.log('UPDATING MONITOR - ID: ' + monitorID);
    var memoryUsage = message['content']['memory-usage'];
    var cpuUsage    = message['content']['cpu-usage'];
    var timestamp   = message['content']['timestamp'];
    // var msg = JSON.parse(message.content);
    printJSON(message);

    console.log(monitorID + " | " + cpuUsage + " | " + memoryUsage + " | " + timestamp);

    var chart = this.charts[monitorID];

    if(chart)
    {
        chart.addData([cpuUsage, memoryUsage], timestamp);
    }
    else
    {
        location.reload();
    }
}

window.onresize = function(){ /*resizeCanvas()*/ }

function printJSON(obj)
{
    console.log(JSON.stringify(obj, null, 2));
}

function resizeCanvas()
{
    var monitorDivs = document.getElementsByClassName('monitor');

    for(var i = 0; i < monitorDivs.length; i++)
    {
        var monitor = monitorDivs[i];
        var cs = getComputedStyle(monitor);
        var divWidth = parseInt(cs.getPropertyValue('width'), 10);
        var divHeight = parseInt(cs.getPropertyValue('height'), 10);

        for(var j = 0; j < monitor.childNodes.length; j++)
        {
            var canvas = monitor.childNodes[j];
            canvas.style.width = divWidth;
            canvas.style.height = divHeight;
        }
    }
}