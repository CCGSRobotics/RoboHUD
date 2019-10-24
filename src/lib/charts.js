require('charts.js');

/**
 * Creates a chart on the given canvas
 * @param {String} [id = null] The ID of the canvas
 * @return {Object} The created line chart
 */
function addChart(id = null) {
  let ctx;
  if (id === null) {
    ctx = document.createElement('canvas');
    document.body.appendChild(ctx);
  } else {
    ctx = document.getElementById(canvas_id).getContext('2d');
  }

  return new Chart(ctx, {
    'type': 'line',
    'data': {
      'labels': [],
      'datasets': [],
    },
    'options': {},
  });
}

/**
 * Adds a new dataset to the given chart
 * @param {Object} chart The chart object
 * @param {String} title The title of the data
 * @param {String} colour The colour of the data
 */
function addDataset(chart, title, colour) {
  chart.data.datasets.push({
    'label': title,
    'data': [],
    'fill': false,
    'borderColor': colour,
    'lineTension': 0.1,
  });
  chart.update();
}

/**
 * Adds a datapoint to the chart
 * @param {Object} chart The chart object
 * @param {String} dataset The name of the dataset
 * @param {Number} y The y value of the co-ordinate
 * @param {Number} [x = CURRENT_TIME] The x value of the co-ordinate
 */
function addData(chart, dataset, y, x) {
  if (x === undefined) {
    const today = new Date();
    x = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  }

  if (chart.data.datasets[dataset].data.length === chart.data.labels.length) {
    chart.data.labels.push(x);
  }

  chart.data.datasets[dataset].data.push(y);


  chart.update();
}

/**
 * Removes data after a given x value
 * @param {Object} chart The chart object
 * @param {*} after The index to remove after
 * @param {*} animation Whether or not to animate the chart
 */
function removeDataAfter(chart, after, animation) {
  if (chart.data.labels.length > after) {
    chart.data.labels.shift();

    chart.data.datasets.forEach((dataset) => {
      dataset.data.shift();
    });

    if (animation) {
      chart.update();
    } else {
      chart.update(0);
    }
  }
}

module.exports.addChart = addChart;
module.exports.addDataset = addDataset;
module.exports.addData = addData;
module.exports.removeDataAfter = removeDataAfter;
