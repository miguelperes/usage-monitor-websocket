var CHART_FORMAT = { 
        labels: [],
        datasets: [
            {
                label: "CPU",
                // Options here
                fillColor: "rgba(10,107,242,0.2)",
                strokeColor: "rgba(10,200,242,1)",
                pointColor: "rgba(10,107,242,1)",
                pointStrokeColor: "rgba(10,200,242,1)",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: []

            },
            {
                label: "Memory",
                // Options here
                fillColor: "rgba(36,156,12,0.2)",
                strokeColor: "rgba(72,232,19,1)",
                pointColor: "rgba(36,156,12,1)",
                pointStrokeColor: "rgba(72,232,19,1)",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: []
            }
        ]

    };

// Chart Options
    Chart.defaults.global.scaleFontSize = 8;
    Chart.defaults.global.scaleFontStyle = "bold";

    Chart.defaults.global.pointDotRadius = 1;
    Chart.defaults.global.scaleOverride=true;
    Chart.defaults.global.scaleSteps=20;
    Chart.defaults.global.scaleStartValue=0;
    Chart.defaults.global.scaleStepWidth=5;
