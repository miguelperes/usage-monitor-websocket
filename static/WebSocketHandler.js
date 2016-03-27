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
    var id = JSON.parse(message.content);
    console.log('adding ' + id);
    
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
    var msg = JSON.parse(message.content);    
}

function printJSON(obj)
{
    console.log(JSON.stringify(obj, null, 2));
}

var CHART_FORMAT = { 
        labels: [],
        datasets: [
            {
                label: "CPU",
                // Options here
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: []

            },
            {
                label: "Memory",
                // Options here
                fillColor: "rgba(100,100,220,0.2)",
                strokeColor: "#000000",
                pointColor: "#3F0680",
                pointStrokeColor: "#000000",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: []
            }
        ]

    };

// Chart Options
Chart.defaults.global.scaleFontSize = 8;
Chart.defaults.global.scaleFontStyle = "bold";