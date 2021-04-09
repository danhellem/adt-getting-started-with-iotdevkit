import { DigitalTwinsClient } from "@azure/digital-twins-core";
import { DefaultHttpClient } from "@azure/core-http";
import { fetch } from "../utils/localCache";

const getAllTwinsQuery = "SELECT * FROM digitaltwins";

const getTwinsFromQueryResponse = response => {
  const list = [ ...response ];
  const twins = [];
  for (let i = 0; i < list.length; i++) {
    const current = list[i];
    if (current.$dtId) {
      twins.push(current);
      continue;
    }

    for (const k of Object.keys(current)) {
      const v = current[k];
      if (typeof v === "object") {
        list.push(v);
      } else if (Array.isArray(v)) {
        v.forEach(x => list.push(x));
      }
    }
  }

  return twins;
};

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
    const appAdtUrl = fetch("adtUrl");
    
    const nullTokenCredentials = {
      getToken: () => null
    };

    const httpClient = new CustomHttpClient();
    this.client = new DigitalTwinsClient(appAdtUrl, nullTokenCredentials, { httpClient });
  }

  listModels = async() => {
    await this.initialize();

    const list = [];
    const models = this.client.listModels([], true);
    for await (const model of models) {
      list.push(model);
    }

    return list;
  }

  getDigitalTwinById = async(twinId) => {
    await this.initialize();

    const response = await this.client.getDigitalTwin(twinId);  

    return response.body;
  } 
  
  async getAllTwins() {
    return await this.queryTwins(getAllTwinsQuery);
  }

  async getCountByQuery(query) {
    const list = [];

    // there should be a better way to do a SELECT COUNT(), but having trouble getting 
    // it to work as the results look different than a regular query
    await this.queryTwinsPaged(query, items => items.forEach(x => list.push(x)));

    return list.length;  // for not just returning the length
  }  

  async queryTwins(query) {
    const list = [];
    await this.queryTwinsPaged(query, items => items.forEach(x => list.push(x)));

    return list;
  }

  async queryTwinsPaged(query, callback) {
    await this.initialize();   

    for await (const page of this.client.queryTwins(query).byPage()) {
      await callback(getTwinsFromQueryResponse(page.value));
    }
  }

  async updateTwin(twinId, patch) {
    await this.initialize();

    return await this.client.updateDigitalTwin(twinId, patch);
  }
}