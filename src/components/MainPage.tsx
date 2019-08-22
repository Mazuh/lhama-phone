import React from 'react';
import { Tab, TabBar } from 'react-smart-tabs';
import Container from 'react-bootstrap/Container';
import MakeCall from './MakeCall';
import Preferences from './Preferences';

const MainPage: React.FunctionComponent = () => {
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
      </TabBar>
  );
}

export default MainPage;
