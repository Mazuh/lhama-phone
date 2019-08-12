import React from 'react';
// @ts-ignore
import FlowrouteClient from 'jssip_client';
// end of ts ignoreds
import MaterialIcon from '@material/react-material-icon';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
// import { RouteProps, withRouter } from 'react-router';
import { connect } from 'react-redux';
import { TelephonyState, makeClient, doCall, UserAgentStatus, CallStatus } from '../redux/telephony';
import { bindActionCreators, Dispatch, AnyAction } from 'redux';
import { FormControlProps } from 'react-bootstrap/FormControl';

interface DialerProps {
  telephony?: TelephonyState;
  makeClient?(): FlowrouteClient;
  doCall?(client: FlowrouteClient): void;
};

const Dialer: React.FunctionComponent<DialerProps> = (props) => {
  const [telClient, setClient] = React.useState(null);
  React.useEffect(() => {
    const newTelClient = props.makeClient!();
    if (!newTelClient) {
      return;
    }

    newTelClient.start();
    setClient(newTelClient);

    return () => newTelClient.stop();
  }, [props.makeClient]);

  const [state, setState] = React.useState({ number: '' });

  const handleNumberInputChange = (event: React.FormEvent<FormControlProps>) => {
    const target = event.target as HTMLInputElement;
    setState({ number: target.value });
  }

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (telClient === null) {
      return;
    }

    props.doCall!({ client: telClient as FlowrouteClient, destiny: state.number });
    setState({ number: '' });
  };

  const hangup = () => {
    if (telClient === null) {
      return;
    }

    (telClient as FlowrouteClient).hangup();
  }

  const isUserAgentReady = props.telephony!.userAgentStatus === UserAgentStatus.Registered;
  const hasCallInProgress = props.telephony!.callStatus
    && props.telephony!.callStatus !== CallStatus.Ended
    && props.telephony!.callStatus !== CallStatus.Failed
    && props.telephony!.callStatus !== CallStatus.Intending;
  const canDoCalls = isUserAgentReady && !hasCallInProgress;
  return (
    <div>
      <Form onSubmit={onSubmit} inline>
        <Form.Group>
          <Form.Control
            type="search"
            value={state.number}
            onChange={handleNumberInputChange}
            placeholder="E.g.: +13125867146"
            required
          />
        </Form.Group>
        <Form.Group>
          {hasCallInProgress ? (
            <Button variant="danger" type="button" size="sm" onClick={hangup}>
              <MaterialIcon icon="call_end" />
            </Button>
          ) : (
            <Button variant="success" type="submit" size="sm" disabled={!canDoCalls}>
              <MaterialIcon icon="call" />
            </Button>
          )}
        </Form.Group>
      </Form>
    </div>
  );
};

const mapStateToProps = ({ telephony }: any): any => {
  return {
    telephony,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return bindActionCreators({
    doCall,
    makeClient,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Dialer);
