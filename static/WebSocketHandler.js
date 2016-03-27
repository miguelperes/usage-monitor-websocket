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
    var list = content['client-list'];

    if(list.length > 0){
        for(var i = 0; i < list.length; i++)
        {
            // Init divs
            obj = list[i]
            var monitorDiv = createMonitorDiv( obj['id'] );
            document.getElementById('monitors-area').appendChild(monitorDiv);

            // Init Charts
            var monitorCanvas = document.createElement('canvas');
            monitorCanvas.classList.add('monitor-canvas')
            monitorDiv.appendChild(monitorCanvas);

            var ctx = monitorCanvas.getContext("2d");
            var data = this.fillData();
            // console.log(data);
            var options = this.fillOptions();
            var newChart = new Chart(ctx).Line(data, options);
            newChart.update();
            this.charts[ obj['id'] ] = newChart;
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

WebSocketHandler.prototype.fillData= function()
{
    var data = {
    labels: ["2016-03-27 00:38:53", "2016-03-27 00:38:53", "2016-03-27 00:38:53", "April", "May", "June", "July"],
    datasets: [
            {
                label: "My First dataset",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: [65, 59, 80, 81, 56, 55, 40]
            },
            {
                label: "My Second dataset",
                fillColor: "rgba(151,187,205,0.2)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(151,187,205,1)",
                data: [28, 48, 40, 19, 86, 27, 90]
            }
        ]
    };

    return data;
}

WebSocketHandler.prototype.fillOptions= function()
{
    var options = {

    scaleFontSize: 8,
    scaleFontStyle: "bold",
    ///Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : true,

    //String - Colour of the grid lines
    scaleGridLineColor : "rgba(0,0,0,.05)",

    //Number - Width of the grid lines
    scaleGridLineWidth : 1,

    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: true,

    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: true,

    //Boolean - Whether the line is curved between points
    bezierCurve : true,

    //Number - Tension of the bezier curve between points
    bezierCurveTension : 0.4,

    //Boolean - Whether to show a dot for each point
    pointDot : true,

    //Number - Radius of each point dot in pixels
    pointDotRadius : 4,


    //Number - Pixel width of point dot stroke
    pointDotStrokeWidth : 1,

    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
    pointHitDetectionRadius : 20,

    //Boolean - Whether to show a stroke for datasets
    datasetStroke : true,

    //Number - Pixel width of dataset stroke
    datasetStrokeWidth : 2,

    //Boolean - Whether to fill the dataset with a colour
    datasetFill : true,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

    };

    return options;
}


WebSocketHandler.prototype.updateData = function(message)
{
    
}

// function isJSONEmpty(JSONObj)
// {
//     return Object.keys(JSONObj).length === 0 && JSON.stringify(JSONObj) === JSON.stringify({});
// }


















