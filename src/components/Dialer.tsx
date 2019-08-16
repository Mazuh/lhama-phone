import React from 'react';
// @ts-ignore
import SIPClient from '../sip-client';
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
  makeClient?(): SIPClient;
  doCall?(client: any): void;
};

const Dialer: React.FunctionComponent<DialerProps> = (props) => {
  const [telClient, setClient] = React.useState();
  const [state, setState] = React.useState({ number: '' });

  const isUserAgentReady = props.telephony!.userAgentStatus === UserAgentStatus.Registered;
  const hasCallInProgress = props.telephony!.callStatus
    && props.telephony!.callStatus !== CallStatus.Terminated
    && props.telephony!.callStatus !== CallStatus.Failed;
  const canDoCalls = isUserAgentReady && !hasCallInProgress;

  React.useEffect(() => {
    const newTelClient = props.makeClient!();
    if (!newTelClient) {
      return;
    }

    setClient(newTelClient);

    return () => newTelClient.stop();
  }, [props.makeClient]);

  const handleNumberInputChange = (event: React.FormEvent<FormControlProps>) => {
    const target = event.target as HTMLInputElement;
    setState({ number: target.value });
  }

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (!telClient || !state.number || !canDoCalls) {
      return;
    }

    props.doCall!({ client: telClient as SIPClient, destiny: state.number });
  };

  const hangup = () => {
    if (telClient === null) {
      return;
    }

    (telClient as SIPClient).hangup();
    setState({ number: '' });
  }

  return (
    <div>
      <Form onSubmit={onSubmit} inline>
        <Form.Group>
          <Form.Control
            type="search"
            value={state.number}
            onChange={handleNumberInputChange}
            placeholder="To call. E.g.: +13125867146"
            readOnly={hasCallInProgress as boolean}
          />
        </Form.Group>
        <Form.Group>
          {hasCallInProgress ? (
            <Button variant="danger" type="button" size="sm" onClick={hangup}>
              <MaterialIcon icon="call_end" />
            </Button>
          ) : (
            <Button variant="success" type="submit" size="sm" disabled={!canDoCalls} title="Make call">
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
