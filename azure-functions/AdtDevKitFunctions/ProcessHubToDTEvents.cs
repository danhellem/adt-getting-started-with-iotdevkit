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
        private static bool _logMe = false;

        [FunctionName("ProcessHubToDTEvents")]
        public async void Run([EventGridTrigger] EventGridEvent message, ILogger log)
        {
            DigitalTwinsClient client;
            DefaultAzureCredential credentials;

            if (_logMe) log.LogInformation(message.Data.ToString());

            if (_adtServiceUrl == null && _logMe) log.LogError("Application setting \"ADT_SERVICE_URL\" not set");

            try
            {
                //Authenticate with Digital Twins
                credentials = new DefaultAzureCredential();
                client = new DigitalTwinsClient(new Uri(_adtServiceUrl), credentials, new DigitalTwinsClientOptions { Transport = new HttpClientTransport(_httpClient) });

                if (_logMe) log.LogInformation($"ADT service client connection created.");

                if (message != null && message.Data != null)
                {
                    JObject deviceMessage = (JObject)JsonConvert.DeserializeObject(message.Data.ToString());

                    string deviceId = (string)deviceMessage["systemProperties"]["iothub-connection-device-id"];
                    string body = deviceMessage["body"].ToString();

                    // not all devices encode the body, so we need to check and decode as needed
                    if (this.IsBase64Encoded(body)) {
                        byte[] data = System.Convert.FromBase64String(body);
                        string decodedBody = System.Text.ASCIIEncoding.ASCII.GetString(data);

                        if (_logMe) log.LogInformation($"decodedBody: {decodedBody}");

                        body = decodedBody;
                    }                    

                    JObject sensorData = (JObject)JsonConvert.DeserializeObject(body);

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
                    if (_logMe) log.LogInformation($"Device Id: {deviceId};");

                    if (temperature != -99 && _logMe) { log.LogInformation($"temperature: {temperature}"); }
                    if (humidity != -99 && _logMe) { log.LogInformation($"humidity: {humidity}"); }

                    var updateTwinData = new JsonPatchDocument();

                    // update twin data when variables are not null
                    if (temperature != -99) updateTwinData.AppendAdd("/temperature", temperature);
                    if (humidity != -99) updateTwinData.AppendAdd("/humidity", humidity);

                    // get room
                    Pageable<IncomingRelationship> incomingRelationship = client.GetIncomingRelationships(deviceId);
                    string sourceId = incomingRelationship.First<IncomingRelationship>().SourceId;

                    if (_logMe) log.LogInformation($"Room Twin Id: {sourceId};");

                    // update twin 
                    if (!(temperature == -99 && humidity == -99))
                    {
                        if (_logMe) log.LogInformation($"Executed update!");
                        if (_logMe) log.LogInformation($" ");

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

        private bool IsBase64Encoded(string base64String)
        {
            if (string.IsNullOrEmpty(base64String) || base64String.Length % 4 != 0 || base64String.Contains(" ") || base64String.Contains("\t") || base64String.Contains("\r") || base64String.Contains("\n"))
                return false;
            try
            {
                Convert.FromBase64String(base64String);
                return true;
            }
            catch (Exception)
            {
                // Handle the exception
            }

            return false;
        }
    }
}