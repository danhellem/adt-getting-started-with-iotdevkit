import React from "react";
import { Container, Row, Col } from "react-grid-system";

import Card from "../../components/Card/Card";
import CardBody from "../../components/Card/CardBody";
import CardFooter from "../../components/Card/CardFooter";
import CardHeader from "../../components/Card/CardHeader";
import Button from "../../components/CustomButtons/Button.js";

import { fetch, store } from "../../utils/localCache";

interface Props {}

class SettingsPage extends React.Component<Props, ISettingsPage> {
  state: ISettingsPage = {
    message: "",
    adtUrl: "",
  };

  componentDidMount() {    
    var url = fetch("adtUrl");
    this.setState({adtUrl: url});
  }

  public handleSaveButtonClick = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();    
    store("adtUrl", this.state.adtUrl);   
  };

  public handleTestButtonClick = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();    
 
  };

  private handleInputChanges= (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();

		this.setState(({[e.currentTarget.name]:e.currentTarget.type === "number" ? parseInt(e.currentTarget.value) : e.currentTarget.value, } as unknown) as Pick<ISettingsPage, keyof ISettingsPage>);
	 }
 
  render() {
    return (
      <div>
        <Container>
          <Row>
            <Col md={12} lg={8} sm={12}>
              <Card>
                <CardHeader color="primary">
                  <h4
                    style={{
                      color: "#FFFFFF",
                      marginTop: "0px",
                      minHeight: "auto",
                      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                      marginBottom: "3px",
                      textDecoration: "none",
                      fontSize: "30px"
                    }}
                  >
                    Settings
                  </h4>
                  <p
                    style={{
                      color: "rgba(255,255,255,.62)",
                      margin: "0",
                      fontSize: "14px",
                      marginTop: "0",
                      marginBottom: "0",
                    }}
                  >
                    Complete your settings to connect to Azure Digital Twins
                    instance
                  </p>
                </CardHeader>
                <CardBody>
                  <div>
                  <input
													type="text"
													name="adtUrl"
													className="form-control form-control-lg"
													value={this.state.adtUrl}
                          placeholder="https://name-digitial-twin.api.eus2.digitaltwins.azure.net"
													onChange={(e) => this.handleInputChanges(e)}
												/>                    
                  </div>
                </CardBody>
                <CardFooter>
                <Button                  
                    color="primary"
                    onClick={(e: React.FormEvent<HTMLButtonElement>) => this.handleSaveButtonClick(e)} 
                  >
                  Save                
                </Button>
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default SettingsPage;

export interface ISettingsPage {
  message: string;
  adtUrl: string;
}
