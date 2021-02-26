// Default URL for triggering event grid function in the local environment.
// http://localhost:7071/runtime/webhooks/EventGrid?functionName={functionname}
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
using System.Reflection.Metadata.Ecma335;
using System.Threading.Tasks;
using System.Collections.Generic;
using AdtDevKitFunctions.Dto;

namespace AdtDevKitFunctions
{
    public class ProcessDTRoutedData
    {
        private static HttpClient _httpClient = new HttpClient();
        private static string _adtServiceUrl = Environment.GetEnvironmentVariable("ADT_SERVICE_URL");

        [FunctionName("ProcessDTRoutedData")]
        public async Task Run([EventGridTrigger] EventGridEvent eventGridEvent, ILogger log)
        {
            log.LogInformation("ProcessDTRoutedData (Start)...");

            DigitalTwinsClient client;
            DefaultAzureCredential credentials;

            //log.LogInformation($"Subject: {eventGridEvent.Subject}");
            //log.LogInformation($"Topic: {eventGridEvent.Topic}");
            //log.LogInformation($"Event Type: {eventGridEvent.EventType}");
            //log.LogInformation($"Data:");
            //log.LogInformation(eventGridEvent.Data.ToString());
            //log.LogInformation($"...");

            if (_adtServiceUrl == null)
            {
                log.LogError("Application setting \"ADT_SERVICE_URL\" not set");
                return;
            }

            try
            {
                //Authenticate with Digital Twins
                credentials = new DefaultAzureCredential();
                client = new DigitalTwinsClient(new Uri(_adtServiceUrl), credentials, new DigitalTwinsClientOptions { Transport = new HttpClientTransport(_httpClient) });

            }
            catch (Exception ex)
            {
                log.LogError($"Exception: {ex.Message}");

                client = null;
                credentials = null;

                return;
            }

            if (client != null)
            {
                if (eventGridEvent != null && eventGridEvent.Data != null)
                {
                    JObject message = (JObject)JsonConvert.DeserializeObject(eventGridEvent.Data.ToString());

                    string twinId = eventGridEvent.Subject.ToString();
                    log.LogInformation($"TwinId: {twinId}");

                    string modelId = message["data"]["modelId"].ToString();                                  
                    log.LogInformation($"ModelId: {modelId}");

                    string floorId = null;

                    if (modelId.Contains("dtmi:com:hellem:dtsample:room"))
                    {  
                        // rooms should always have one floor, go get the sourceId for the floor the room is related to
                        AsyncPageable<IncomingRelationship> floorList = client.GetIncomingRelationshipsAsync(twinId);
                        
                        // get the sourceId (parentId)
                        await foreach (IncomingRelationship floor in floorList)
                        {
                            floorId = floor.SourceId;                            
                        }

                        // if the parentId (SourceId) is null or empty, then something went wrong
                        if (string.IsNullOrEmpty(floorId))
                        {
                            log.LogError($"'SourceId' is missing from GetIncomingRelationships({twinId}) call. This should never happen.");
                            return;
                        }
                        
                        // get list of rooms for the floor
                        AsyncPageable<BasicDigitalTwin> queryResponse = client.QueryAsync<BasicDigitalTwin>($"SELECT Room FROM digitaltwins Floor JOIN Room RELATED Floor.rel_has_rooms WHERE Floor.$dtId = '{floorId}'");
                        List<Room> roomList = new List<Room>();
                                                
                        await foreach(BasicDigitalTwin twin in queryResponse)
                        {
                            JObject room = (JObject)JsonConvert.DeserializeObject(twin.Contents["Room"].ToString());

                            roomList.Add(new Room() { 
                                id = twin.Id, 
                                temperature = Convert.ToDouble(room["temperature"]), 
                                humidity = Convert.ToDouble(room["humidity"]) 
                            });                            
                        }

                        // if no rooms, then something went wrong and we should return out
                        if (roomList.Count < 1)
                        {
                            log.LogError($"'roomList' is empty for floor ({floorId}). This should never happen.");
                            return;
                        }                       

                        // get the averages from the list rooms
                        double avgTemperature = roomList.Average(x => x.temperature);
                        double avgHumidity = roomList.Average(x => x.humidity);

                        log.LogInformation($"Average Temperature: {avgTemperature.ToString()}, Average Humidity: {avgHumidity.ToString()}");

                        var updateTwinData = new JsonPatchDocument();

                        // update twin data for the floor
                        updateTwinData.AppendReplace("/temperature", Math.Round(avgTemperature, 2));
                        updateTwinData.AppendReplace("/humidity", Math.Round(avgHumidity, 2));

                        try
                        {
                            await client.UpdateDigitalTwinAsync(floorId, updateTwinData);

                            log.LogInformation("ProcessDTRoutedData (Done)...");
                            log.LogInformation(" ");
                        }
                        catch (Exception ex)
                        {
                            log.LogError($"Error: {ex.Message}");
                        }                        

                        return;
                    }
                }
            }
        }
    }       
}
