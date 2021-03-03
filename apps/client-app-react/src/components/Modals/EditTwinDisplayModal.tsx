import React from "react";

import { Modal, Button, Row, Col, FormGroup } from "react-bootstrap";
import { Container } from "react-grid-system";
import { ITwinDisplay } from "../../interfaces/ITwin";

export class EditTwinDisplayModal extends React.Component<IModalProps, {}> {
  static defaultProps: Partial<IModalProps> = {};

  state: IEditTwinDisplayModal = {
    action: "normal",
    message: "",
    name: "",
    icon: "",
    color: "",
    order: 0
  };  

  constructor(props: IModalProps) {
    super(props)

    console.log(props);
  }

  componentDidMount() {
    
  }

  

  private handleInputChanges = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (
      e.currentTarget.type === "number" &&
      isNaN(parseInt(e.currentTarget.value))
    ) {
      this.setState(({
        [e.currentTarget.name]: e.currentTarget.value,
      } as unknown) as Pick<IEditTwinDisplayModal, keyof IEditTwinDisplayModal>);
    } else {
      this.setState(({
        [e.currentTarget.name]:
          e.currentTarget.type === "number"
            ? parseInt(e.currentTarget.value)
            : e.currentTarget.value,
      } as unknown) as Pick<IEditTwinDisplayModal, keyof IEditTwinDisplayModal>);
    }

    //this.validateForm();
  };

  public handleSaveClick = async () => {
    console.log("save");
  };

  render() {
    return (
      <div>
        <Modal
          size="lg"
          show={this.props.open}
          onHide={() => this.props.setHideModal()}
          animation={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>{this.props.twin.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container fluid>
              <Row>
                <Col md={12} sm={12}>
                  <form>
                    <FormGroup>
                      <label htmlFor="basic-url">Display Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control form-control-lg"
                        value={this.state.name}
                        onChange={(e) => this.handleInputChanges(e)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label htmlFor="basic-url">Color</label>
                      <input
                        type="text"
                        name="color"
                        className="form-control form-control-lg"
                        value={this.props.twin.display.color}
                        onChange={(e) => this.handleInputChanges(e)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label htmlFor="basic-url">Icon</label>
                      <input
                        type="icon"
                        name="name"
                        className="form-control form-control-lg"
                        value={this.props.twin.display.icon}
                        onChange={(e) => this.handleInputChanges(e)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label htmlFor="basic-url">Order</label>
                      <input
                        type="number"
                        name="order"
                        className="form-control form-control-lg"
                        value={this.props.twin.display.order}
                        onChange={(e) => this.handleInputChanges(e)}
                      />
                    </FormGroup>
                  </form>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => this.props.setHideModal()}
              className="btn btn-fill btn-warning"
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => this.handleSaveClick()}
              className="btn btn-fill btn-primary"
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default EditTwinDisplayModal;

interface IModalProps {
  open: boolean;
  setHideModal: () => void;
  name: string;
  twin: ITwinDisplay;
}

interface IEditTwinDisplayModal {
  action: string;
  message: string;
  name: string;
  icon: string;
  color: string;
  order: number;
}