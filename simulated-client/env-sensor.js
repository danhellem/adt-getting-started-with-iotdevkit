// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

const Protocol = require('azure-iot-device-mqtt').Mqtt;
// Uncomment one of these transports and then change it in fromConnectionString to test other transports
// const Protocol = require('azure-iot-device-amqp').AmqpWs;
// const Protocol = require('azure-iot-device-http').Http;
// const Protocol = require('azure-iot-device-amqp').Amqp;
// const Protocol = require('azure-iot-device-mqtt').MqttWs;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;


// building some stand temp and humidity ranges with a couple values outside of normal range
const temperatures = Array(5, 6, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23);
const humidities = Array(30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 70, 71);

const deviceConnectionString = "";
let sendInterval;

function disconnectHandler () {
  clearInterval(sendInterval);
  client.removeAllListeners();
  client.open().catch((err) => {
    console.error(err.message);
  });
}

// The AMQP and HTTP transports have the notion of completing, rejecting or abandoning the message.
// For example, this is only functional in AMQP and HTTP:
// client.complete(msg, printResultFor('completed'));
// If using MQTT calls to complete, reject, or abandon are no-ops.
// When completing a message, the service that sent the C2D message is notified that the message has been processed.
// When rejecting a message, the service that sent the C2D message is notified that the message won't be processed by the device. the method to use is client.reject(msg, callback).
// When abandoning the message, IoT Hub will immediately try to resend it. The method to use is client.abandon(msg, callback).
// MQTT is simpler: it accepts the message by default, and doesn't support rejecting or abandoning a message.
function messageHandler (msg) {
  console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
  client.complete(msg, printResultFor('completed'));
}

function generateMessage () {
  const deviceType = 'EnvSensor' //change this to GrindingSensor | FanningSensor | MouldingSensor
  const temperature = temperatures[Math.floor(Math.random() * temperatures.length)];
  const humidity = humidities[Math.floor(Math.random() * humidities.length)];
  const data = JSON.stringify({ DeviceType: deviceType, temperature: temperature, humidity: humidity });
  const message = new Message(data);
 
  message.properties.add('temperatureAlert', 'false');
  message.contentType = "application/json";
  message.contentEncoding = "utf-8";

  return message;
}

function errorCallback (err) {
  console.error(err.message);
}

function connectCallback () {
  console.log('Client connected');
  // Create a message and send it to the IoT Hub every two seconds
  sendInterval = setInterval(() => {
    const message = generateMessage();

    console.log('Sending message: ' + JSON.stringify(message));    
    client.sendEvent(message, printResultFor('send'));
  }, 2000);
}

// fromConnectionString must specify a transport constructor, coming from any transport package.
let client = Client.fromConnectionString(deviceConnectionString, Protocol);

client.on('connect', connectCallback);
client.on('error', errorCallback);
client.on('disconnect', disconnectHandler);
client.on('message', messageHandler);

client.open()
.catch(err => {
  console.error('Could not connect: ' + err.message);
});

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}