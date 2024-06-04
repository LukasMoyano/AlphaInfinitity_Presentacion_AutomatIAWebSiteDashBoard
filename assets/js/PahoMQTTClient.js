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

const client = new Paho.MQTT.Client(mqttConfig.brokerUrl, mqttConfig.port, mqttConfig.clientId);

function onConnectionLost(responseObject) {
    console.log('Conexión perdida: ' + responseObject.errorMessage);
}

function onMessageArrived(message) {
    const mqttData = JSON.parse(message.payloadString);

    // Extraer y procesar datos JSON
    const temperatura = mqttData.temperatura;
    const humedad = mqttData.humedad;
    const co2 = mqttData.co2;
    const luminosidad = mqttData.luminosidad;
    const ph = mqttData.ph;

    // Actualizar indicadores HTML
    document.getElementById('temperatura-gauge').textContent = temperatura;
    document.getElementById('humedad-gauge').textContent = humedad;
    document.getElementById('co2-gauge').textContent = co2;
    document.getElementById('luminosidad-gauge').textContent = luminosidad;
    document.getElementById('ph-gauge').textContent = ph;

    // Mostrar datos en formato texto
    const datosElement = document.getElementById('datos');
    datosElement.textContent =
        `Temperatura: ${temperatura}°C, 
     Humedad: ${humedad}%, 
     CO2: ${co2}ppm, 
     Luminosidad: ${luminosidad}lux, 
     pH: ${ph}pH`;
}

function onConnect() {
    console.log('¡Conectado al broker MQTT!');
    client.subscribe(mqttConfig.topic);
}

client.connect({ onSuccess: onConnect, useSSL: mqttConfig.useSSL });

// Exportar funciones y datos para uso en HTML
export {
    client,
    mqttConfig,
    onMessageArrived
};