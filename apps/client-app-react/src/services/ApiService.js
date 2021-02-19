import { DigitalTwinsClient } from "@azure/digital-twins-core";
import { DefaultHttpClient } from "@azure/core-http";
import { fetchAdtUrl } from "../utils/localCache";

class CustomHttpClient {
    constructor() {
      this.client = new DefaultHttpClient();
    }
  
    sendRequest(httpRequest) {
      const url = new URL(httpRequest.url);
      const baseUrl = new URL(window.location.origin);
      
      httpRequest.headers.set("x-adt-host", url.hostname);
        
      url.host = baseUrl.host;
      url.pathname = `/api/proxy${url.pathname}`;
      url.protocol = baseUrl.protocol;
      
      httpRequest.url = url.toString();
  
      return this.client.sendRequest(httpRequest);
    }
}

export class ApiService {
  constructor() {
    this.client = null;
  }

  async initialize() {
    const appAdtUrl = fetchAdtUrl();
    
    const nullTokenCredentials = {
      getToken: () => null
    };

    const httpClient = new CustomHttpClient();
    this.client = new DigitalTwinsClient(appAdtUrl, nullTokenCredentials, { httpClient });
  }

  getTwinById = async(twinId) => {
    await this.initialize();

    const response = await this.client.getDigitalTwin(twinId);  

    return response.body;
  }
  
}