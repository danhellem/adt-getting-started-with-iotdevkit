# Simulated device

The ```env-sensor.js``` file can be used to simulate a physical device to send telemetry to IoT Hub. This can be used in place of the physical [IoT DevKit AZ3166](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-arduino-iot-devkit-az3166-get-started). To run the file Node.js is required along with an Azure IoT Hub instance.

## Getting started

### Step 1
If you have not done so already, create an IoT Hub instance in Azure and register a device. [Follow the instructions here](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-arduino-iot-devkit-az3166-get-started#quickstart-send-telemetry-from-devkit-to-an-iot-hub). Once you have registered your device in IoT Hub, copy the connection string, go into the ```env.sensor.js``` file and past it into line 20. Save your changes.

```javascript 
const deviceConnectionString = "<device connection string from iot-hub>";
```

### Step 2

Run ```npm install``` from the command line. Make sure you are in the ```simulated-client``` folder. This will install all the dependent npm packages.

### Step 3
Finally, run the the file. The usual way to run a Node.js program is to run the node globally available command (once you install Node.js) and pass the name of the file you want to execute.

Call it by typing:

```
node env-sensor.js
```

While running the command, make sure you are in the same directory which contains the env-sensor.js file.

## Things you should know

This file mimics the IoT DevKit device and sends both humidity and temperature telemetry data
<br><br>
The telemetry data is random and the allowed values are in contained in arrays (line 17 and line 18) that you can ajust as needed
<br><br>
The ```env-sensor.js``` file is designed to simulate only one device at a time