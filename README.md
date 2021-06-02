# Create your first an Azure Digital Twins app

Want to learn how to connect telemetry that comes from physical devices and create digital representations of them using Azure Digital Twins? In this repo we put together all the assets you need to create a simple solution using Azure Digitial twins with physicall IoT Devkit devices.

The repo contains:

- Azure Digital Twin models
- Import file to import a sample Azure Digital Twin graph
- Azure Function to connect IoT Hub messages to Azure Digital Twins
- Client react based web app to show the status of your house, floor, rooms, and sensors

## Scenerio

We are using a smart home as our example scenario. Our house has floors, rooms, and sensors. We want to track the temperature and humidity data at the rooma and floor level.

## Getting started

There are multiple pieces that you need to put into place. These include:

1. Create an Azure IoT Hub instance
2. Connect IoT DevKit devices to IoT Hub
3. Create an Azure Digital Twins instance
4. Import models into your Azure Digital Twins instance
5. Create a twins graph to represent your home
6. Publish Azure Function to route messages from IoT Hub into Azure Digital Twins
7. Run react-app 

### 1. Create an Azure IoT Hub instance

[Create an IoT hub using the Azure portal](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-create-through-portal)

### 2. Connect IoT DevKit AZ3166 to Azure IoT Hub

[Connect IoT DevKit AZ3166 to Azure IoT Hub](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-arduino-iot-devkit-az3166-get-started)

If you don't have any physical devices, you can simulate the sensor data using the `env-sensor.js` file. Detailed instructions can be found in the [simulated-client folder](./simulated-client).

### 3. Create an Azure Digital Twins instance

[Set up an Azure Digital Twins instance and authentication (portal)](https://docs.microsoft.com/en-us/azure/digital-twins/how-to-set-up-instance-portal)

### 4. Import models into your Azure Digital Twins instance