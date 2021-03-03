import React from "react";
import { Row, Col, Container } from "react-bootstrap";

import { ApiService } from "../../services/ApiService";
import { ITwinCore } from "../../interfaces/ITwin";
import { datetimeFormatter } from "../../utils/dateFormatters";

import Card from "../../components/Card/Card";
import CardHeader from "../../components/Card/CardHeader";
import { Icon, IconButton } from "@material-ui/core";
import CardFooter from "../../components/Card/CardFooter";
import CardIcon from "../../components/Card/CardIcon";

interface Props {}

class DevicesPage extends React.Component<Props, IDevicesPage> {
  state: IDevicesPage = {
    message: "",
    data: []    
  };

  componentDidMount() {
    this.listDevices();
  }

  // refresh data by re-load twins
  private handleRefreshPage = () => {
    console.log("data refreshed");

    this.listDevices();   
  };
  
  private async listDevices() {
    const api = new ApiService();
    const twinResult = await api.queryTwins(
      "SELECT * FROM digitaltwins WHERE IS_OF_MODEL('dtmi:com:hellem:dtsample:envsensor;1')"
    );

    console.log(twinResult);

    var twinData: ITwinCore[] = twinResult.map((x) => {
      let twin: ITwinCore = {
        name: x.$dtId,
        model: x.$metadata.$model,
        temperature: Math.round(x.temperature),
        humidity: Math.round(x.humidity),
        lastUpdated: x.$metadata.humidity.lastUpdateTime           
      };     

      return twin;
    });

    this.setState({ data: twinData });
  }

  render() {
    return (
      <div>
        <div className="content">
          <div>
            <Container fluid>            
              <Row>
                <Col md={1} lg={1} sm={2}>
                  <div>
                  <h2>Devices</h2>
                  </div>
                </Col>
                <Col md={1} lg={1} sm={2}> 
                  <div style={{alignItems: 'center', verticalAlign: 'middle', marginTop: '22px'}}>
                    <IconButton
                      onClick={(e: any) => this.handleRefreshPage()}
                      aria-label="refresh list"
                    >
                      <span className="material-icons">refresh</span>
                    </IconButton>
                  </div>
                </Col>
              </Row>
              <Row>
                {this.state.data.map((x, key) => (
                  <Col md={4} lg={3} sm={8} key={key}>
                    <Card>
                      <CardHeader color="success" stats icon>
                        <CardIcon color="success">
                          <Icon>thermostat</Icon>
                        </CardIcon>
                        <h1
                          style={{
                            color: "#999",
                            margin: "0",
                            fontSize: "24px",
                            marginTop: "0",
                            paddingTop: "10px",
                            marginBottom: "0",
                          }}
                        >
                          {x.name}
                        </h1>
                        <h3
                          style={{
                            color: "#3C4858",
                            marginTop: "0px",
                            minHeight: "auto",
                            fontWeight: "normal",
                            fontFamily:
                              "'Roboto', 'Helvetica', 'Arial', 'sans-serif'",
                            marginBottom: "3px",
                            textDecoration: "none",
                          }}
                        >
                          {x.temperature} °F
                          <br />
                          {x.humidity}% Humidity
                        </h3>
                      </CardHeader>
                      <CardFooter stats>
                        <div>
                          <span style={{ fontSize: 13 }}>
                            {datetimeFormatter(x.lastUpdated)}
                          </span>
                        </div>                        
                      </CardFooter>
                    </Card>
                  </Col>
                ))}
              </Row>
              
            
            </Container>
          </div>
         </div>
      </div>
    );
  }
}

export default DevicesPage;

export interface IDevicesPage {
  message: string;
  data: ITwinCore[];  
}