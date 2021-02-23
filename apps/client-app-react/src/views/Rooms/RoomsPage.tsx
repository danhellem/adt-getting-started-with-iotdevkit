import React from "react";

interface Props {}

class RoomsPage extends React.Component<Props, IRoomsPage> {
  state: IRoomsPage = {
    message: "",
    adtUrl: "",
  };

  componentDidMount() {    
    
  } 
 
  render() {
    return (
      <div>
       Yo
      </div>
    );
  }
}

export default RoomsPage;

export interface IRoomsPage {
  message: string;
  adtUrl: string;
}
