var charts = [];
var socketio = io.connect(location.origin + '/polls-admin');

// the server sends new results, so refresh all charts with them
socketio.on('update-charts', function(results) {
    for (var question in results) {
        for (var i = 0; i < charts.length; i++) {
            if (question == charts[i].canvas.id) {
                charts[i].data.datasets[0].data = results[question];
                charts[i].update();
                sum = results[question].reduce(function(a, b) { return a + b }, 0);
                document.getElementById('s' + (i + 1)).innerHTML = sum;
                break;
            }
        }                    
    }
});

// chart.js plugin to provide labels at the top of each bar
// from http://www.chartjs.org/samples/latest/advanced/data-labelling.html
Chart.plugins.register({
    afterDatasetsDraw: function(chart, easing) {
        var ctx = chart.ctx;
        chart.data.datasets.forEach(function (dataset, i) {
            var meta = chart.getDatasetMeta(i);
            if (!meta.hidden) {
                meta.data.forEach(function(element, index) {
                    if (dataset.data[index] > 0) {
                        // Draw the text in black, with the specified font
                        ctx.fillStyle = 'rgb(0, 0, 0)';

                        var fontSize = 16;
                        var fontStyle = 'normal';
                        var fontFamily = 'Helvetica Neue';
                        ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

                        // Just naively convert to string for now
                        var dataString = dataset.data[index].toString();

                        // Make sure alignment settings are correct
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        var padding = 5;
                        var position = element.tooltipPosition();
                        ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
                    }
                });
            }
        });
    }
});

// create a bar chart with the given id and bar labels
function makeChart(id, labels) {
    var ctx = document.getElementById(id).getContext("2d");
    var barChartData = {
        labels: labels,
        datasets: [
            {
                type: 'bar',
                data: new Array(labels.length).fill(0),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                    'rgba(255, 159, 64, 0.5)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ]
            }
        ]
    };
    return new Chart(ctx, {
        type: 'bar',
        data: barChartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        suggestedMax: 10
                    }
                }]
            },
            layout: {
                padding: {
                    top: 20
                }
            }
        }
    });
}

// create the four bar charts
window.onload = function() {
    charts.push(makeChart('q1', ['0-2 years', '2-4 years', '4+ years']));
    charts.push(makeChart('q2', ['Python 2', 'Python 3', 'Both', 'Neither']));
    charts.push(makeChart('q3', ['Django', 'Flask', 'Other']));
    charts.push(makeChart('q4', ['JavaScript', 'C/C++', 'Ruby', 'Go', 'Other']));
};