// Importa Paho MQTT (asegúrate de instalarlo con 'npm install paho-mqtt')
import * as Paho from 'paho-mqtt';

// Configuración MQTT
const mqttConfig = {
  clientId: "covertura_123",
  brokerUrl: "broker.hivemq.com", // O "192.168.129.84" si es local
  port: 8080,
  username: "",
  password: "",
  topic: "cultivo/sector_uno/tomate",
  useSSL: false // Ajusta según tu configuración
};

// Crea el cliente MQTT
const client = new Paho.MQTT.Client(mqttConfig.brokerUrl, mqttConfig.port, mqttConfig.clientId);

// Función para manejar la conexión perdida
function onConnectionLost(responseObject) {
  console.log('Conexión perdida: ' + responseObject.errorMessage);
}

// Función para manejar la llegada de mensajes
function onMessageArrived(message) {
  // 1. Obtiene los datos del JSON
  const mqttData = JSON.parse(message.payloadString);

  // 2. Actualiza los medidores (usando DOM)
  const temperaturaElement = document.getElementById('temperatura-gauge');
  temperaturaElement.setAttribute('value', mqttData.temperatura);

  const humedadElement = document.getElementById('humedad-gauge');
  humedadElement.setAttribute('value', mqttData.humedad);

  // ... Actualiza los demás medidores de la misma manera

  // 3. Actualiza el contenido HTML para mostrar los valores
  const datosElement = document.getElementById('datos'); 
  datosElement.textContent = 
    `Temperatura: ${mqttData.temperatura}°C, 
     Humedad: ${mqttData.humedad}%, 
     CO2: ${mqttData.co2}ppm, 
     Luminosidad: ${mqttData.luminosidad}lux, 
     pH: ${mqttData.ph}pH`;
}

// Función para conectar al broker MQTT
function onConnect() {
  console.log('¡Conectado al broker MQTT!');
  client.subscribe(mqttConfig.topic);
}

// Conecta al broker MQTT
client.connect({ onSuccess: onConnect, useSSL: mqttConfig.useSSL });

// Exporta las funciones para usarlas en el HTML
export { onConnectionLost, onMessageArrived, onConnect };