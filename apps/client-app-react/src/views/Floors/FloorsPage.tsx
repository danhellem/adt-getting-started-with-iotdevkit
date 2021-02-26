import React from "react";
import { Row, Col, Container, Modal, FormGroup } from "react-bootstrap";
import Select, { ValueType } from "react-select";

import { ApiService } from "../../services/ApiService";
import { datetimeFormatter } from "../../utils/dateFormatters";
import { icons, colors } from "../../components/Data/icons";

import { Icon, IconButton } from "@material-ui/core";
import Card from "../../components/Card/Card";
import CardFooter from "../../components/Card/CardFooter";
import CardHeader from "../../components/Card/CardHeader";
import CardIcon from "../../components/Card/CardIcon";
import Button from "../../components/CustomButtons/Button.js";

import { DigitalTwinsUpdateResponse } from "@azure/digital-twins-core";

interface Props {}

class FloorsPage extends React.Component<Props, IFloorsPage> {
  state: IFloorsPage = {
    message: "",
    floors: [],
    rooms: [],
    showModal: false,
    twinId: "",
    modalName: "",
    modalColor: { value: "", label: "" },
    modalIcon: { value: "", label: "" },
    modalOrder: 0,
  };

  componentDidMount() {
    this.listFloors();
    this.listRooms();
  }

  public handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  public handleShowModal = (twin: ITwin) => {
    this.setState({
      twinId: twin.name,
      modalName: twin.display.name,
      modalColor: { value: twin.display.color, label: twin.display.color },
      modalIcon: { value: twin.display.icon, label: twin.display.icon },
      modalOrder: twin.display.order,
      showModal: true,
    });
  };

  public handleSaveClick = async () => {
    // this patch only works if the twin already has the properties defined
    // todo: need to figure out a better way to do this without getting errors if the twin does not have the display property
    const patch = [
      {
        op: "replace",
        path: `/Display/Name`,
        value: `${this.state.modalName}`,
      },
      {
        op: "replace",
        path: `/Display/Icon`,
        value: `${this.state.modalIcon.value}`,
      },
      {
        op: "replace",
        path: `/Display/Color`,
        value: `${this.state.modalColor.value}`,
      },
      { op: "replace", path: `/Display/Order`, value: this.state.modalOrder },
    ];

    // [
    //   {
    //     "op": "replace",
    //     "path": "/Display/Order",
    //     "value": { "Name": "Garage", "Icon": "info_outline", "Color": "info", "Order": 1 }
    //   }
    // ]

    try {
      const api = new ApiService();
      const response: DigitalTwinsUpdateResponse = await api.updateTwin(
        this.state.twinId,
        patch
      );

      // check for successfull response
      if (response._response.status === 204) {
        // find the item in the array that has been updated and go update it in the list
        // re-bind it to the state.data so that cards are updated in real time without having to reload data from server
        const index: number = this.state.floors.findIndex(
          (e) => e.name === this.state.twinId
        );
        let newArray: ITwin[] = [...this.state.floors];
        newArray[index] = {
          ...newArray[index],
          display: {
            name: this.state.modalName,
            icon: this.state.modalIcon.value,
            color: this.state.modalColor.value,
            order: this.state.modalOrder,
          },
        };

        this.setState({
          showModal: false,
          twinId: "",
          modalName: "",
          modalColor: { value: "", label: "" },
          modalIcon: { value: "", label: "" },
          modalOrder: 0,
          floors: newArray,
        });
      }
    } catch (exc) {
      console.log(`error updating twin: ${exc}`);
    }
  };

  // refresh data by re-load twins
  private handleRefreshPage = () => {
    console.log("data refreshed");

    this.listFloors();
  };

  private handleInputChanges = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (
      e.currentTarget.type === "number" &&
      isNaN(parseInt(e.currentTarget.value))
    ) {
      this.setState(({
        [e.currentTarget.name]: e.currentTarget.value,
      } as unknown) as Pick<IFloorsPage, keyof IFloorsPage>);
    } else {
      this.setState(({
        [e.currentTarget.name]:
          e.currentTarget.type === "number"
            ? parseInt(e.currentTarget.value)
            : e.currentTarget.value,
      } as unknown) as Pick<IFloorsPage, keyof IFloorsPage>);
    }

    //this.validateForm();
  };

  private async listFloors() {
    const api = new ApiService();
    const twinResult = await api.queryTwins(
      "SELECT * FROM digitaltwins WHERE IS_OF_MODEL('dtmi:com:hellem:dtsample:floor;1')"
    );

    var twinData: ITwin[] = twinResult.map((x) => {
      let twin: ITwin = {
        name: x.$dtId,
        temperature: Math.round(x.temperature),
        humidity: Math.round(x.humidity),
        lastUpdated: x.$metadata.humidity.lastUpdateTime,
        warning: false,
        display: {
          name: x.$dtId,
          order: 0,
          icon: "content_copy",
          color: "primary",
        },
      };

      if (x.Display != null) {
        twin.display.color = x.display.color;
        twin.display.icon = x.display.icon;
        twin.display.order = x.display.order;
        twin.display.name = x.display.name;
      }

      return twin;
    });

    this.setState({ floors: twinData });
  }

  private async listRooms(floorId: string = "") {
    const api: ApiService = new ApiService();
    const query: string =
      floorId !== ""
        ? `SELECT Room FROM digitaltwins Floor JOIN Room RELATED Floor.rel_has_rooms WHERE Floor.$dtId = '${floorId}'`
        : `SELECT * FROM digitaltwins WHERE IS_OF_MODEL('dtmi:com:hellem:dtsample:room;1')`;

    const twinResult = await api.queryTwins(query);

    var twinData: ITwin[] = twinResult.map((x) => {
      let twin: ITwin = {
        name: x.$dtId,
        temperature: Math.round(x.temperature),
        humidity: Math.round(x.humidity),
        lastUpdated: x.$metadata.humidity.lastUpdateTime,
        warning: false,
        display: {
          name: x.$dtId,
          order: 0,
          icon: "content_copy",
          color: "primary",
        },
      };

      if (x.Display != null) {
        twin.display.color = x.display.color;
        twin.display.icon = x.display.icon;
        twin.display.order = x.display.order;
        twin.display.name = x.display.name;
      }

      return twin;
    });

    this.setState({ rooms: twinData });
  }

  render() {
    return (
      <div>
        <div className="content">
          <div>
            <Container fluid>
              <Row>
                <Col md={12} lg={9} sm={8}>
                  <div className="pull-right">
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
                {this.state.floors.map((x, key) => (
                  <Col md={4} lg={3} sm={8} key={key}>
                    <Card>
                      <CardHeader color={x.display.color} stats icon>
                        <CardIcon color={x.display.color}>
                          <Icon>{x.display.icon}</Icon>
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
                          {x.display.name}
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
                        <div>
                          <IconButton
                            onClick={(e: any) => this.handleShowModal(x)}
                            aria-label="edit twin"
                          >
                            <span className="material-icons">mode_edit</span>
                          </IconButton>
                        </div>
                      </CardFooter>
                    </Card>
                  </Col>
                ))}
              </Row>
              <br/>
              <h2>Rooms</h2>
              <br/>
              <Row>
                {this.state.rooms.map((x, key) => (
                  <Col md={4} lg={3} sm={8} key={key}>
                    <Card>
                      <CardHeader color={x.display.color} stats icon>
                        <CardIcon color={x.display.color}>
                          <Icon>{x.display.icon}</Icon>
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
                          {x.display.name}
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
                        <div>
                          <IconButton
                            onClick={(e: any) => this.handleShowModal(x)}
                            aria-label="edit twin"
                          >
                            <span className="material-icons">mode_edit</span>
                          </IconButton>
                        </div>
                      </CardFooter>
                    </Card>
                  </Col>
                ))}
              </Row>
            
              
            </Container>
          </div>
          <div>
            <Modal
              size="lg"
              show={this.state.showModal}
              onHide={() => this.handleCloseModal()}
              animation={false}
              backdrop="static"
            >
              <Modal.Header closeButton>
                <Modal.Title>{this.state.modalName}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Container fluid>
                  <Row>
                    <Col md={12} sm={12}>
                      <FormGroup>
                        <label htmlFor="modalName">Display Name</label>
                        <input
                          type="text"
                          name="modalName"
                          value={this.state.modalName}
                          onChange={(e) => this.handleInputChanges(e)}
                        />
                      </FormGroup>

                      <FormGroup>
                        <label htmlFor="modalColor">Color</label>
                        <Select
                          className="react-select primary"
                          classNamePrefix="react-select"
                          name="modalColor"
                          value={this.state.modalColor}
                          onChange={(value: any) =>
                            this.setState({ modalColor: value })
                          }
                          options={colors}
                          placeholder="primary"
                        />
                      </FormGroup>

                      <FormGroup>
                        <label htmlFor="modalIcon">Icon</label>
                        <Select
                          className="react-select primary"
                          classNamePrefix="react-select"
                          name="modalIcon"
                          value={this.state.modalIcon}
                          onChange={(value: any) =>
                            this.setState({ modalIcon: value })
                          }
                          options={icons}
                          placeholder="meeting_room"
                        />
                      </FormGroup>

                      <FormGroup>
                        <label htmlFor="basic-url">Order</label>
                        <input
                          type="number"
                          name="modalOrder"
                          value={this.state.modalOrder}
                          onChange={(e) => this.handleInputChanges(e)}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </Container>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  onClick={(e: React.FormEvent<HTMLButtonElement>) =>
                    this.handleCloseModal()
                  }
                >
                  Cancel
                </Button>
                &nbsp;&nbsp;
                <Button
                  color="primary"
                  onClick={(e: React.FormEvent<HTMLButtonElement>) =>
                    this.handleSaveClick()
                  }
                >
                  Save Changes
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
    );
  }
}

export default FloorsPage;

export interface IFloorsPage {
  message: string;
  floors: ITwin[];
  rooms: ITwin[];
  twinId: string;
  showModal: boolean;
  modalName: string;
  modalColor: ValueType<any, boolean>;
  modalIcon: ValueType<any, boolean>;
  modalOrder: number;
}
export interface IDisplay {
  name: string;
  order: number;
  icon: string;
  color: string;
}

export interface ITwin {
  name: string;
  temperature: number;
  humidity: number;
  warning: boolean;
  display: IDisplay;
  lastUpdated: Date;
}
