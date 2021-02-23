import React from "react";
import { ApiService } from "../../services/ApiService";

interface Props {}

class DevicesPage extends React.Component<Props> {
 // constructor(props: Props) {
 //   super(props);
 // }

  componentDidMount() {
    this.listTwins();
  }

  private async listTwins() {
    const api = new ApiService();
    const twinResult = await api.getDigitalTwinById("DevKit-1");

    console.log(twinResult);

    const queryResult = await api.getAllTwins();

    console.log(queryResult);

  }

  render() {
    return <div className="content">Render</div>;
  }
}

export default DevicesPage;
