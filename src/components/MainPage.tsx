import React from 'react';
import { Redirect } from 'react-router';
import { Tab, TabBar } from 'react-smart-tabs';
import Container from 'react-bootstrap/Container';
import { retrieveIsLoggedIn } from '../utils/login-session';
import PreferencesView from './PreferencesView';
import WorkingCall from './WorkingCall';
import WorkingCallTabHeader from './WorkingCallTabHeader';
import ContactsView from './ContactsView';
import UserAgentStatusIndicator from './UserAgentStatusIndicator';
import Dialer from './Dialer';
import HistoryView from './HistoryView';
import MaterialIcon from '@material/react-material-icon';

const MainPage: React.FunctionComponent = () => {
  if (!retrieveIsLoggedIn()) {
    return (
      <Redirect to="/" />
    );
  }

  return (
    <div>
      <div className="bg-dark text-white pb-2">
        <Container>
          <UserAgentStatusIndicator />
        </Container>
        <div className="d-flex justify-content-center">
          <Dialer />
        </div>
      </div>
      <TabBar>
        <Tab tabHeader={<MaterialIcon title="History" icon="history" />}>
          <div className="main-tab-panel">
            <Container>
              <HistoryView />
            </Container>
          </div>
        </Tab>
        <Tab tabHeader={<WorkingCallTabHeader />}>
          <Container className="main-tab-panel">
            <WorkingCall />
          </Container>
        </Tab>
        <Tab tabHeader={<MaterialIcon title="Contacts" icon="people" />}>
          <Container className="main-tab-panel">
            <ContactsView />
          </Container>
        </Tab>
        <Tab tabHeader={<MaterialIcon title="Preferences" icon="settings" />}>
          <Container className="main-tab-panel">
            <PreferencesView />
          </Container>
        </Tab>
      </TabBar>
    </div>
  );
}

export default MainPage;
