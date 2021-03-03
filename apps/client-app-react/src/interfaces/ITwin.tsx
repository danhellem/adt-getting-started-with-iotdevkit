import { IDisplay } from "../views/FloorsAndRooms/FloorsAndRoomsPage";

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
