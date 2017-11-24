var socket;
var CPUChart;
var RAMChart;
var dataLoopId;
var colors = [
    'rgb(45, 236, 199)',
    'rgb(237, 57, 225)',
    'rgb(24, 182, 221)',
    'rgb(167, 112, 150)',
    'rgb(72, 152, 161)',
    'rgb(60, 241, 140)',
    'rgb(151, 173, 9)',
    'rgb(226, 25, 142)',
    'rgb(115, 110, 48)',
    'rgb(88, 143, 19)'
];

var loadCPUChart = function () {
    var ctx = document.getElementById("cpu-chart").getContext('2d');
    return cpuChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
        },
        options: {
            responsive:true,
            title:{
                display:true,
                text:'Utilização de CPU'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        suggestedMax: 100
                    }
                }]
            }
        }
    });
};

var loadRAMChart = function () {
    var ctx = document.getElementById("ram-chart").getContext('2d');
    return ramChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
        },
        options: {
            responsive:true,
            title:{
                display:true,
                text:'Utilização de RAM'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        suggestedMax: 100
                    }
                }]
            }
        }
    });
};

var startCPU = function (CPU) {
    var dSet = {
        label: "CPU",
        data: [CPU],
        fill: false,
        backgroundColor: colors[1],
        borderColor: colors[1]
    };

    CPUChart.data.datasets.push(dSet);

    CPUChart.update();
};

var startRAM = function (RAM) {
    var dSet = {
        label: "RAM",
        data: [RAM],
        fill: false,
        backgroundColor: colors[0],
        borderColor: colors[0]
    };

    RAMChart.data.datasets.push(dSet);

    RAMChart.update();
};

var refreshCPU = function (CPU) {
    if (CPUChart.data.datasets.length == 0) {
        startCPU(CPU);
        return;
    }

    if (CPUChart.data.datasets[0].data.length >= 20) {
        CPUChart.data.datasets[0].data.shift();
    }
    CPUChart.data.datasets[0].data.push(CPU);

    CPUChart.update();
};

var refreshRAM = function (RAM) {
    if (RAMChart.data.datasets.length == 0) {
        startRAM(RAM);
        return;
    }

    if (RAMChart.data.datasets[0].data.length >= 20) {
        RAMChart.data.datasets[0].data.shift();
    }
    RAMChart.data.datasets[0].data.push(RAM);

    RAMChart.update();
};

window.onload = function () {
    CPUChart = loadCPUChart();
    RAMChart = loadRAMChart();

    var uri = "ws://" + document.location.host + "/status/";
	socket = new WebSocket(uri);
	socket.onopen = function (event) {
		console.log("opened connection to " + uri);
	};
	socket.onmessage = function (event) {
        var obj = JSON.parse(event.data);
        refreshCPU(obj.CPU);
        refreshRAM(obj.RAM);
        document.getElementById('players').innerText = obj.totalUsers;
    };
    
    dataLoopId = setInterval(function () {
        socket.send('');
    }, 1000);
};

