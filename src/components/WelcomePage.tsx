import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { withRouter, RouteComponentProps } from 'react-router';

interface Props extends RouteComponentProps {}

const WelcomePage: React.FunctionComponent<Props> = (props) => {
  return (
    <Container>
      <header>
        <h1>
          Hi, <small>llama person.</small>
        </h1>
      </header>
      <div>
        <p>
          This is a demo softphone.
        </p>
        <p>
          Made with <span role="img" aria-label="love">❤️</span> by Mazuh.
        </p>
        <Button variant="primary" onClick={() => props.history.push('/home')}
          >Go ahead!
        </Button>
      </div>
    </Container>
  );
}

export default withRouter(WelcomePage);
