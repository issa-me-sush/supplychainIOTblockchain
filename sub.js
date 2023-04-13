const mqtt = require('mqtt');
require('dotenv').config();
const {SCPOLYGONADDR,SCPOLYGONABI}  = require('./constants.js')
const HDWalletProvider = require('@truffle/hdwallet-provider');
let Web3 = require("web3");

const provider = new HDWalletProvider(
    process.env.MNEMONIC,
    'https://polygon-mumbai.g.alchemy.com/v2/hpcs_PwNwdAGSR0pSH6tdgoMnSp1JEyW',
);
let web3 = new Web3(provider);
const contract = new web3.eth.Contract(
    // The ABI of the contract
   SCPOLYGONABI,
    // address of the deployed contract
    SCPOLYGONADDR
  );
// MQTT broker connection settings
const options = {
  host: 'broker.hivemq.com',
  port: 1883,
};

// Topics to subscribe to
const topics = ['iotproject/gps/coordinates', 'iotproject/temp/data', 'iotproject/humidity/data'];

// Connect to the MQTT broker
const client = mqtt.connect(options);

client.on('connect', () => {
  console.log('Connected to HiveMQ broker.');

  // Subscribe to topics
  topics.forEach((topic) => {
    client.subscribe(topic, { qos: 1 }, (err) => {
      if (err) {
        console.error(`Error subscribing to topic ${topic}: ${err}`);
      } else {
        console.log(`Subscribed to topic: ${topic}`);
      }
    });
  });
});



const ONE_MINUTE = 1 * 60 * 1000;
let gpsData, tempData, humidityData;

// Handle incoming messages
client.on('message', (topic, message) => {
  console.log(`Received message on topic ${topic}: ${message}`);

  const parsedMessage = JSON.parse(message.toString());

  if (topic === 'iotproject/gps/coordinates') {
    gpsData = parsedMessage;
  } else if (topic === 'iotproject/temp/data') {
    tempData = parsedMessage.value;
  } else if (topic === 'iotproject/humidity/data') {
    humidityData = parsedMessage.value;
  }
});

// Function to push data to the contract
async function pushData(gpsData, tempData, humidityData) {
    // Replace with your account's address
    const account = process.env.ACCOUNT_ADDRESS;
  
    try {
     // Round the GPS coordinates to 2 decimal places and multiply by 10^6
const latInt = Math.round(gpsData.lat * 1000000);
const lonInt = Math.round(gpsData.lon * 1000000);

// Round the temperature and humidity values to 2 decimal places and multiply by 100
const tempInt = Math.round(tempData * 100);
const humidityInt = Math.round(humidityData * 100);

// Convert integer values to strings and store in smart contract
await contract.methods.storeGPSData(latInt.toString(), lonInt.toString()).send({ from: account });
await contract.methods.storeTempData(tempInt.toString()).send({ from: account });
await contract.methods.storeHumidityData(humidityInt.toString()).send({ from: account });

  
console.log('\n#############################################################');
console.log('#                      SUCCESS                               #');
console.log('#############################################################\n');
console.log('Data pushed to the contract successfully.');
console.log('\n#############################################################\n');


    } catch (error) {
      console.error('Error pushing data to the contract:', error);
    }
  }
  
  // Push data to the contract every 5 minutes
  setInterval(() => {
    if (gpsData && tempData && humidityData) {
      pushData(gpsData, tempData, humidityData);
    }
  }, ONE_MINUTE);

