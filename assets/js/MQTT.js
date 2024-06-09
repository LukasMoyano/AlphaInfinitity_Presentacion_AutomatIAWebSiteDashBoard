import * as Paho from 'paho-mqtt';
import * as echarts from 'echarts';

const mqttConfig = {
    clientId: "covertura_123",
    brokerUrl: "broker.hivemq.com",
    port: 8080,
    username: "",
    password: "",
    topic: "cultivo/sector_uno/tomate",
    useSSL: false
};

const client = new Paho.MQTT.Client(mqttConfig.brokerUrl, mqttConfig.port, mqttConfig.clientId);

client.onConnectionLost = function(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log('Conexión perdida: ' + responseObject.errorMessage);
    }
};

// Datos del gráfico
let dateData = [];
let temperatureData = [];

// Inicializar el gráfico de ECharts
var dom = document.getElementById('chart-container');
var myChart = echarts.init(dom, 'dark', {
    renderer: 'canvas',
    useDirtyRect: false
});

var option = {
    tooltip: {
        trigger: 'axis',
        position: function(pt) {
            return [pt[0], '10%'];
        }
    },
    title: {
        left: 'center',
        text: 'Temperatura en Tiempo Real'
    },
    toolbox: {
        feature: {
            dataZoom: {
                yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
        }
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dateData
    },
    yAxis: {
        type: 'value',
        boundaryGap: [0, '100%']
    },
    dataZoom: [{
            type: 'inside',
            start: 0,
            end: 10
        },
        {
            start: 0,
            end: 10
        }
    ],
    series: [{
        name: 'Temperatura',
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        itemStyle: {
            color: 'rgb(255, 70, 131)'
        },
        areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgb(255, 158, 68)'
                },
                {
                    offset: 1,
                    color: 'rgb(255, 70, 131)'
                }
            ])
        },
        data: temperatureData
    }]
};

myChart.setOption(option);

export function onMessageArrived(message) {
    const mqttData = JSON.parse(message.payloadString);

    // Extraer y procesar datos JSON
    const { temperatura, humedad, co2, luminosidad, ph } = mqttData;

    // Actualizar indicadores HTML
    document.getElementById("temperatura-gauge").textContent = temperatura;
    document.getElementById("humedad-gauge").textContent = humedad;
    document.getElementById("co2-gauge").textContent = co2;
    document.getElementById("luminosidad-gauge").textContent = luminosidad;
    document.getElementById("ph-gauge").textContent = ph;

    // Actualizar valores en la tabla
    document.getElementById("temperatura-valor").textContent = `${temperatura}°C`;
    document.getElementById("humedad-valor").textContent = `${humedad}%`;
    document.getElementById("co2-valor").textContent = `${co2} ppm`;
    document.getElementById("luminosidad-valor").textContent = `${luminosidad} lux`;
    document.getElementById("ph-valor").textContent = ph;

    // Actualizar datos del gráfico
    const now = new Date();
    const formattedDate = [now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()].join('/');
    dateData.push(formattedDate);
    temperatureData.push(temperatura);

    // Mantener los últimos 2000 puntos
    if (dateData.length > 2000) {
        dateData.shift();
        temperatureData.shift();
    }

    // Actualizar el gráfico
    myChart.setOption({
        xAxis: {
            data: dateData
        },
        series: [{
            data: temperatureData
        }]
    });
}

export function onConnect() {
    console.log("¡Conectado al broker MQTT!");
    client.subscribe(mqttConfig.topic);
}

client.connect({ onSuccess: onConnect, useSSL: mqttConfig.useSSL });