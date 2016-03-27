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

    // console.log('All data received:');
    // printJSON(list);

    if(list.length > 0){
        for(var i = 0; i < list.length; i++)
        {
            // Init divs
            obj = list[i];


            var monitorDiv = createMonitorDiv( obj['id'] );
            document.getElementById('monitors-area').appendChild(monitorDiv);

            var chart = this.createChartAndAppend(obj, monitorDiv)

            // var data = this.initDataForChart(obj['history']);


            // // Init Charts
            // var monitorCanvas = document.createElement('canvas');
            // monitorCanvas.classList.add('monitor-canvas')
            // monitorDiv.appendChild(monitorCanvas);

            // var ctx = monitorCanvas.getContext("2d");
            // var options = this.fillOptions();
            // var newChart = new Chart(ctx).Line(data, options);


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

WebSocketHandler.prototype.fillOptions= function()
{
    var options = {

    
    ///Boolean - Whether grid lines are shown across the chart
    // scaleShowGridLines : true,

    // //String - Colour of the grid lines
    // scaleGridLineColor : "rgba(0,0,0,.05)",

    // //Number - Width of the grid lines
    // scaleGridLineWidth : 1,

    // //Boolean - Whether to show horizontal lines (except X axis)
    // scaleShowHorizontalLines: true,

    // //Boolean - Whether to show vertical lines (except Y axis)
    // scaleShowVerticalLines: true,

    // //Boolean - Whether the line is curved between points
    // bezierCurve : true,

    // //Number - Tension of the bezier curve between points
    // bezierCurveTension : 0.4,

    // //Boolean - Whether to show a dot for each point
    // pointDot : true,

    // //Number - Radius of each point dot in pixels
    // pointDotRadius : 4,


    // //Number - Pixel width of point dot stroke
    // pointDotStrokeWidth : 1,

    // //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
    // pointHitDetectionRadius : 20,

    // //Boolean - Whether to show a stroke for datasets
    // datasetStroke : true,

    // //Number - Pixel width of dataset stroke
    // datasetStrokeWidth : 2,

    // //Boolean - Whether to fill the dataset with a colour
    // datasetFill : true,

    // //String - A legend template
    // legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

    };

    return options;
}

WebSocketHandler.prototype.createChartAndAppend = function(clientStats, divToAppendTo)
{
    var data = this.initDataForChart(clientStats['history']);

    var monitorCanvas = document.createElement('canvas');
    monitorCanvas.classList.add('monitor-canvas')

    var ctx = monitorCanvas.getContext("2d");
    var options = this.fillOptions();
    var newChart = new Chart(ctx).Line(data, options);
    
    divToAppendTo.appendChild(monitorCanvas);

    return newChart;
}

WebSocketHandler.prototype.initDataForChart = function(usageHistory)
{
    var data = JSON.parse(JSON.stringify(CHART_FORMAT));

    console.log('ALL USAGE FOR GIVEN USER');
    printJSON(usageHistory);

    for(var i  = 0; i < usageHistory.length; i++)
    {
        var stats = usageHistory[i];
        console.log('EACH INDIVIDUAL USAGE');
        printJSON(stats);

        data['labels'].push( stats['timestamp'] );
        data['datasets'][0]['data'].push( stats['cpu-usage'] );
        data['datasets'][1]['data'].push( stats['memory-usage'] );
    }

    console.log('CHART DATA!');
    printJSON(data);

    return data;
}


WebSocketHandler.prototype.updateData = function(message)
{
    
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














