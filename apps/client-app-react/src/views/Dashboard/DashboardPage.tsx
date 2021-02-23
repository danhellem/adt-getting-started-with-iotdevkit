import React from "react";
import { ApiService } from "../../services/ApiService";

interface Props {}

class DashboardPage extends React.Component<Props> {
 // constructor(props: Props) {
 //   super(props);
 // }

  componentDidMount() {
    this.listTwins();
  }

  private async listTwins() {
    const api = new ApiService();
    const twinResult = await api.queryTwins("SELECT * FROM digitaltwins WHERE IS_OF_MODEL('dtmi:com:hellem:dtsample:floor;1')")

    console.log(twinResult);
  }

  render() {
    return <div>Dashbaord</div>
  }
}

export default DashboardPage;
