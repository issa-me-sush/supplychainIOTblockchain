const mqtt = require('mqtt');

// MQTT broker connection settings
// MQTT broker connection settings
const options = {
  host: 'broker.hivemq.com',
  port: 1883,
};


// Simulated IoT devices
const devices = [
  { id: 'gps1', type: 'gps', topic: 'iotproject/gps/coordinates' },
  { id: 'temp1', type: 'temperature', topic: 'iotproject/temp/data' },
  { id: 'humidity1', type: 'humidity', topic: 'iotproject/humidity/data' },
];

// Connect to the MQTT broker
const client = mqtt.connect(options);

client.on('connect', () => {
  console.log('Connected to HiveMQ broker.');

  // Publish sensor data periodically
  setInterval(() => {
    devices.forEach((device) => {
      const payload = JSON.stringify(generateSensorData(device.type));
      client.publish(device.topic, payload, { qos: 1 }, (err) => {
        if (err) {
          console.error(`Error publishing data for ${device.id}: ${err}`);
        } else {
          console.log(`Published data for ${device.id}: ${payload}`);
        }
      });
    });
  }, 5000); // Publish every 5 seconds
});

function generateSensorData(type) {
  switch (type) {
    case 'gps':
      return {
        lat: getRandomInRange(-90, 90, 6),
        lon: getRandomInRange(-180, 180, 6),
      };
    case 'temperature':
      return {
        value: getRandomInRange(-50, 50, 2),
        unit: 'C',
      };
    case 'humidity':
      return {
        value: getRandomInRange(0, 100, 2),
        unit: '%',
      };
    default:
      return {};
  }
}

function getRandomInRange(min, max, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
}
