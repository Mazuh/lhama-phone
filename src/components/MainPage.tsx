import React from 'react';
// @ts-ignore
import { Tab, TabBar } from 'react-smart-tabs';
// end of ts ignored
import Container from 'react-bootstrap/Container';
import Dialer from './Dialer';
import UserAgentStatusIndicator from './UserAgentStatusIndicator';
import Preferences from './Preferences';

const MainPage: React.FunctionComponent = () => {
  return (
      <TabBar>
        <Tab text="Make call">
          <Container>
            <UserAgentStatusIndicator />
            <Dialer />
          </Container>
        </Tab>
        <Tab text="Preferences">
          <Container>
            <Preferences />
          </Container>
        </Tab>
      </TabBar>
  );
}

export default MainPage;
