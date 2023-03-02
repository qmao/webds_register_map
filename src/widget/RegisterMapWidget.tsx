import React from "react";

import { ReactWidget } from "@jupyterlab/apputils";

import RegisterMapComponent from "./RegisterMapComponent";

export class RegisterMapWidget extends ReactWidget {
  id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  render(): JSX.Element {
    return (
      <div id={this.id + "_component"}>
        <RegisterMapComponent />
      </div>
    );
  }
}

export default RegisterMapWidget;
