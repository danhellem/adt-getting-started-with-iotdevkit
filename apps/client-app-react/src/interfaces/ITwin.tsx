import { IDisplay } from "../views/MyHouse/MyHouse"

export interface ITwinCore {
  name: string;
  model: string;
  temperature: number;
  humidity: number; 
  lastUpdated: Date;
}

export interface ITwinDisplay extends ITwinCore {
    display: IDisplay; 
}
