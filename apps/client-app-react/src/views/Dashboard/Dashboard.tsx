import React from "react";
import { ApiService } from "../../services/ApiService";

interface Props {}



class Dashboard extends React.Component<Props> {
 // constructor(props: Props) {
 //   super(props);
 // }

  componentDidMount() {
    this.listTwins();
  }

  private async listTwins() {
    const api = new ApiService();
    const result = await api.getTwinById("DevKit-1");

    console.log(result);
  }

  render() {
    return <div className="content">Render</div>;
  }
}

export default Dashboard;
