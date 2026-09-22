// Web server route to get data constant
const DATA_URL = "/data";

// Chart colors for different type of logs
const LOGS_BAR_CHART_BG_COLORS = [
  "rgba(135, 201, 255, 0.3)",
  "rgba(75, 141, 235, 0.3)",
  "rgba(214, 84, 19, 0.3)",
  "rgba(255, 25, 0, 0.3)",
  "rgba(205, 205, 0, 0.3)",
  "rgba(255, 255, 0, 0.3)",
  "rgba(0, 190, 0, 0.3)",
  "rgba(0, 230, 0, 0.3)"
];
const LOGS_BAR_CHART_BORDER_COLORS = [
  "rgb(135, 201, 255)",
  "rgb(75, 141, 235)",
  "rgb(214, 84, 19)",
  "rgb(255, 25, 0)",
  "rgb(205, 185, 0)",
  "rgb(255, 255, 0)",
  "rgb(0, 190, 0)",
  "rgb(0, 230, 0)"
];

// Active filter variable
let filter = "day";

// We wait the page to be entirely loaded before doing anything on it
document.addEventListener("DOMContentLoaded", () => {
  // Create and connect the websocket client. By default, the function io() without parameters search for the current URL with the default websocket port.
  const socket = io();

  // Listen to the "connect" event to know if the connection is established with the server
  socket.on("connect", () => {
    console.log("WS connection established");
  });

  // Listen to the "data" event, a custom event defined in the server side, to reload data and refresh the page
  socket.on("data", (data) => {
    loadData();
  });

  // Listen to the "disconnect" event, to know if the connection has been broken 
  socket.on("disconnect", () => {
    console.log("WS connection disconnected");
  });

  // We store the charts instance to destroy them at the refresh (we can also use an update, the 2 methods are good)
  let logsChart = null;
  let logsLineChart = null;

  // Setup all charts from an array of logs
  const setupLogsChart = (logs) => {
    if (logsChart != null) {
      logsChart.destroy();
    }

    const logsByType = logs.reduce((groups, v) => {
      let group = groups[v.type];
      if (!group) {
        group = [];
      }

      group.push(v);
      groups[v.type] = group;

      return groups;
    }, {});

    logsChart = new Chart(document.getElementById("bar-chart-logs"), {
      type: "bar",
      data: {
        labels: Object.keys(logsByType).sort(),
        datasets: [
          {
            label: "Rapport des actions",
            data: Object.values(logsByType).map(row => row.length),
            backgroundColor: LOGS_BAR_CHART_BG_COLORS,
            borderColor: LOGS_BAR_CHART_BORDER_COLORS,
            borderWidth: 1
          }
        ]
      }
    });

    let i = 0;
    const datasets = [];
    for (let name of Object.keys(logsByType).sort()) {
      datasets.push(setupLogTypeLineChart(i, name, logsByType[name], LOGS_BAR_CHART_BORDER_COLORS[i]));
      i++;
    }

    const lineChartCtx = document.getElementById("logs-line-chart");
    if (logsLineChart) {
      logsLineChart.destroy();
    }

    logsLineChart = new Chart(lineChartCtx, {
      type: "line",
      data: {
        labels: createChartLabels(filter),
        datasets
      }
    });
  };

  // We store line charts to destroy them at the refresh
  const lineCharts = [];

  // Function creating a line chart for a specific log type
  const setupLogTypeLineChart = (canvaId, logType, data, color) => {
    const existingChart = lineCharts[canvaId];
    if (existingChart) {
      existingChart.destroy();
    }

    const ctx = document.getElementById("log-line-chart-" + canvaId);
    const dataset = {
      label: logType,
      data: filterLogs(filter, data),
      borderColor: color,
      tension: 0.1
    };

    lineCharts[canvaId] = new Chart(ctx, {
      type: "line",
      data: {
        labels: createChartLabels(filter),
        datasets: [dataset]
      }
    });

    return dataset;
  };

  // Fetch data from the web server
  const loadData = async () => {
    const request = await fetch(DATA_URL);
    const requestData = await request.json();

    const logs = requestData["logs"];
    setupLogsChart(logs);

    const recentLogs = logs.slice(0, 10);

    const recentLogsBody = document.getElementById("last-actions");
    recentLogsBody.innerHTML = "";

    let id = 10;
    for (const recentLog of recentLogs) {
      const rowEl = document.createElement("tr");

      const idEl = document.createElement("td");
      idEl.innerText = id;
      const typeEl = document.createElement("td");
      typeEl.innerText = recentLog.type;
      const timeEl = document.createElement("td");
      timeEl.innerText = moment(recentLog.time).format("D/MM/YYYY à H:m:ss");

      rowEl.insertAdjacentElement("beforeend", idEl);
      rowEl.insertAdjacentElement("beforeend", typeEl);
      rowEl.insertAdjacentElement("beforeend", timeEl);

      recentLogsBody.insertAdjacentElement("beforeend", rowEl);
      id--;
    }
  };
  loadData();

  const filterSelect = document.getElementById("filter-select");
  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      filter = filterSelect.selectedOptions[0].id;
      loadData();
    });
  }
});
