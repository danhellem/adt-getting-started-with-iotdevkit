using IoTHubTrigger = Microsoft.Azure.WebJobs.EventHubTriggerAttribute;

using Azure;
using Azure.Core.Pipeline;
using Azure.DigitalTwins.Core;
using Azure.Identity;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.EventGrid;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Net.Http;
using System.Linq;

namespace AdtDevKitFunctions
{
    public class ProcessHubToDTEvents
    {
        private static HttpClient _httpClient = new HttpClient();
        private static string _adtServiceUrl = Environment.GetEnvironmentVariable("ADT_SERVICE_URL");

        [FunctionName("ProcessHubToDTEvents")]
        public async void Run([EventGridTrigger] EventGridEvent message, ILogger log)
        {
            DigitalTwinsClient client;
            DefaultAzureCredential credentials;

            log.LogInformation(message.Data.ToString());

            if (_adtServiceUrl == null) log.LogError("Application setting \"ADT_SERVICE_URL\" not set");

            try
            {
                //Authenticate with Digital Twins
                credentials = new DefaultAzureCredential();
                client = new DigitalTwinsClient(new Uri(_adtServiceUrl), credentials, new DigitalTwinsClientOptions { Transport = new HttpClientTransport(_httpClient) });

                log.LogInformation($"ADT service client connection created.");

                if (message != null && message.Data != null)
                {
                    JObject deviceMessage = (JObject)JsonConvert.DeserializeObject(message.Data.ToString());

                    string deviceId = (string)deviceMessage["systemProperties"]["iothub-connection-device-id"];
                    string body = deviceMessage["body"].ToString();

                    // body is base64 encoded, need to decode
                    byte[] data = System.Convert.FromBase64String(body);
                    string decodedBody = System.Text.ASCIIEncoding.ASCII.GetString(data);

                    log.LogInformation($"decodedBody: {decodedBody}");

                    JObject sensorData = (JObject)JsonConvert.DeserializeObject(decodedBody);

                    // get values
                    JToken temeratureData = sensorData["temperature"];
                    JToken humidityData = sensorData["humidity"];
                    JToken messageId = sensorData["messageId"];

                    double temperature = -99;
                    double humidity = -99;

                    // convert & round
                    if (temeratureData != null) { temperature = Math.Round(temeratureData.Value<double>() * 9 / 5 + 32, 2); }
                    if (humidityData != null) { humidity = Math.Round(humidityData.Value<double>(), 2); }

                    // do some logging
                    log.LogInformation($"Device Id: {deviceId};");

                    if (temperature != -99) { log.LogInformation($"Temperature: {temperature}"); }
                    if (humidity != -99) { log.LogInformation($"Humidity: {humidity}"); }

                    var updateTwinData = new JsonPatchDocument();

                    // update twin data when variables are not null
                    if (temperature != -99) updateTwinData.AppendAdd("/Temperature", temperature);
                    if (humidity != -99) updateTwinData.AppendAdd("/Humidity", humidity);

                    // get room
                    Pageable<IncomingRelationship> incomingRelationship = client.GetIncomingRelationships(deviceId);
                    string sourceId = incomingRelationship.First<IncomingRelationship>().SourceId;

                    log.LogInformation($"Room Twin Id: {sourceId};");

                    // update twin 
                    if (!(temperature == -99 && humidity == -99))
                    {
                        log.LogInformation($"Executed update!");
                        log.LogInformation($" ");

                        // update device
                        await client.UpdateDigitalTwinAsync(deviceId, updateTwinData);

                        // update room
                        if (!string.IsNullOrEmpty(sourceId)) { await client.UpdateDigitalTwinAsync(sourceId, updateTwinData); }
                    }
                }
            }
            catch (Exception ex)
            {
                log.LogError($"Exception: {ex.Message}");
            }
            finally
            {
                client = null;
                credentials = null;
            }
        }
    }
}