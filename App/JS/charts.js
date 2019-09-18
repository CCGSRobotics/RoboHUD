require("charts.js") //https://www.chartjs.org/

function addChart(canvas_id) {
    // returns the line Chart object

    //you can pass a canvas element through or it will create a new one
    let ctx;
    if (canvas_id === undefined) {
        ctx = document.createElement("canvas");
        document.body.appendChild(ctx);
    } else {
        ctx = document.getElementById(canvas_id).getContext('2d');
    }

    return new Chart(ctx, {
        "type": "line",
        "data": {
            "labels": [],
            "datasets": []
        },
        "options": {}
    });
}

function addDataset(chart, title, colour) {
    //adds a dataset to the chart datasets array
    chart.data.datasets.push({
        "label": title,
        "data": [],
        "fill": false,
        "borderColor": colour,
        "lineTension": 0.1
    })
    chart.update();
}

function addData(chart, dataset, y, x) {
    // adds a datapoint to the chart, if x isnt defined then will just use current time
    if (x === undefined) {
        var today = new Date();
        x = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    }

    //dont want to add the label twice for 1 datapoint
    if (chart.data.datasets[dataset].data.length === chart.data.labels.length) {
        chart.data.labels.push(x);
    }

    chart.data.datasets[dataset].data.push(y);


    chart.update();
}

function removeDataAfter(chart, after, animation) {
    // removes old data
    if (chart.data.labels.length > after) {

        chart.data.labels.shift();

        chart.data.datasets.forEach((dataset) => {
            dataset.data.shift();
        });

        //if the data is being updated less than every second then probs set this to false
        if (animation) {
            chart.update();
        } else {
            chart.update(0);
        }
    }
}