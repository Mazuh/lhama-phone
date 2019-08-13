import React from 'react';
import Container from 'react-bootstrap/Container';
import Dialer from './Dialer';
import UserAgentStatusIndicator from './UserAgentStatusIndicator';

const HomePage: React.FunctionComponent = () => {
  return (
    <Container>
      <UserAgentStatusIndicator />
      <Dialer />    
    </Container>
  );
}

export default HomePage;
