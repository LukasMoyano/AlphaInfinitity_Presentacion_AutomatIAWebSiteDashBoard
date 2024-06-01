import * as Paho from 'paho-mqtt';

const mqttConfig = {
    clientId: "covertura_123",
    brokerUrl: "broker.hivemq.com",
    port: 8080,
    username: "",
    password: "",
    topic: "cultivo/sector_uno/tomate",
    useSSL: false
};
<!---servicion por ValidityStat >


const client = new Paho.MQTT.Client(mqttConfig.brokerUrl, mqttConfig.port, mqttConfig.clientId);

function onConnectionLost(responseObject) {
    console.log('Conexión perdida: ' + responseObject.errorMessage);
}

function onMessageArrived(message) {
    const mqttData = JSON.parse(message.payloadString);

    document.getElementById('temperatura-gauge').textContent = mqttData.temperatura;
    document.getElementById('humedad-gauge').textContent = mqttData.humedad;
    document.getElementById('co2-gauge').textContent = mqttData.co2;
    document.getElementById('luminosidad-gauge').textContent = mqttData.luminosidad;
    document.getElementById('ph-gauge').textContent = mqttData.ph;

    const datosElement = document.getElementById('datos');
    datosElement.textContent =
        `Temperatura: ${mqttData.temperatura}°C, 
        Humedad: ${mqttData.humedad}%, 
        CO2: ${mqttData.co2}ppm, 
        Luminosidad: ${mqttData.luminosidad}lux, 
        pH: ${mqttData.ph}pH`;
}

function onConnect() {
    console.log('¡Conectado al broker MQTT!');
    client.subscribe(mqttConfig.topic);
}

client.connect({ onSuccess: onConnect, useSSL: mqttConfig.useSSL });