import '../styles.css';

import React from 'react';

import RegisterViewerComponent from './RegisterViewerComponent';

export class RegisterViewerWidget extends React.Component {
  render(): JSX.Element {
    return (
      <div id="webds_sandbox_widget_content" className="jp-webds-widget">
        <div className="jp-webds-widget-outer-pseudo">
          <div className="jp-webds-widget-inner-pseudo">
            <RegisterViewerComponent />
          </div>
        </div>
      </div>
    );
  }
}

export default RegisterViewerWidget;
