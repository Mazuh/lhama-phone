import React from 'react';
// @ts-ignore
import { Tab, TabBar } from 'react-smart-tabs';
// end of ts ignored
import Container from 'react-bootstrap/Container';
import Dialer from './Dialer';
import UserAgentStatusIndicator from './UserAgentStatusIndicator';
import Preferences from './Preferences';
import HistoryList from './HistoryList';

const MainPage: React.FunctionComponent = () => {
  return (
      <TabBar>
        <Tab text="Make call">
          <div className="bg-dark text-white mb-2 pb-2">
            <Container>
              <UserAgentStatusIndicator />
            </Container>
            <div className="d-flex justify-content-center">
              <Dialer />
            </div>
          </div>
          <Container>
            <strong>Logs:</strong>
            <HistoryList/>
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
