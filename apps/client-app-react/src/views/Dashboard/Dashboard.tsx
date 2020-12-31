import React from "react";

import * as coreHttp from "@azure/core-http";
import { DigitalTwinsClient } from "@azure/digital-twins-core"
import { DefaultAzureCredential } from "@azure/identity"



interface Props {}

class Dashboard extends React.Component<Props> {

    constructor(props: Props) {
	  super(props);
     }
     
     componentDidMount() {
        console.log("componentDidMount()");

        this.listTwins();
    }

    private listTwins() {
        const url = process.env.AZURE_URL;   
        console.log(url);
        //const url: string = "https://danhellem-digitial-twin.api.eus2.digitaltwins.azure.net"      

        //const credential = new DefaultAzureCredential();
        //const serviceClient = new DigitalTwinsClient(url, credential);      

        console.log(url);
    }
    
    render() {
        return (
            <div className="content">Render</div>
        )
    }
}

export default Dashboard;