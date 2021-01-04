import React from "react";

import * as coreHttp from "@azure/core-http";
import { DigitalTwinsClient } from "@azure/digital-twins-core"
import { DefaultAzureCredential, DefaultAzureCredentialOptions } from "@azure/identity"



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
        const url: string = "https://<my dt instance>.api.eus2.digitaltwins.azure.net"  
    
        var credOpts: DefaultAzureCredentialOptions = { tenantId: "<app registration tenant id>", managedIdentityClientId: "<app registration client id>" }
           
        const credential = new DefaultAzureCredential(credOpts);
        const serviceClient = new DigitalTwinsClient(url, credential);      

        console.log(url);
    }
    
    render() {
        return (
            <div className="content">Render</div>
        )
    }
}

export default Dashboard;