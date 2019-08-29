import React from 'react';
import { Redirect } from 'react-router';
import { Tab, TabBar } from 'react-smart-tabs';
import Container from 'react-bootstrap/Container';
import { retrieveIsLoggedIn } from '../utils/login-session';
import MakeCall from './MakeCall';
import Preferences from './Preferences';
import WorkingCall from './WorkingCall';
import WorkingCallTabHeader from './WorkingCallTabHeader';

const MainPage: React.FunctionComponent = () => {
  if (!retrieveIsLoggedIn()) {
    return (
      <Redirect to="/" />
    );
  }

  return (
    <TabBar>
      <Tab text="Make call">
        <MakeCall />
      </Tab>
      <Tab text="Preferences">
        <Container className="main-tab-panel">
          <Preferences />
        </Container>
      </Tab>
      <Tab tabHeader={<WorkingCallTabHeader />}>
        <Container className="main-tab-panel">
          <WorkingCall />
        </Container>
      </Tab>
    </TabBar>
  );
}

export default MainPage;
