import React from 'react';
import Container from 'react-bootstrap/Container';
import Dialer from './Dialer';
import UserAgentStatusIndicator from './UserAgentStatusIndicator';
import HistoryList from './HistoryList';

const MakeCall: React.FunctionComponent = () => {
  return (
    <div>
      <div className="bg-dark text-white mb-2 pb-2">
        <Container>
          <UserAgentStatusIndicator />
        </Container>
        <div className="d-flex justify-content-center">
          <Dialer />
        </div>
      </div>
      <Container>
        <HistoryList/>
      </Container>
    </div>
  );
};

export default MakeCall;