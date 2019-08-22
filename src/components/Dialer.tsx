import React from 'react';
import isEqual from 'lodash.isequal';
import MaterialIcon from '@material/react-material-icon';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { FormControlProps } from 'react-bootstrap/FormControl';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch, AnyAction } from 'redux';
// @ts-ignore
import SIPClient from '../sip-client';
// end of ts ignoreds
import {
  TelephonyState,
  makeClient,
  doCall,
  UserAgentStatus,
  CallStatus,
} from '../redux/telephony';
import { PreferencesState } from '../redux/preferences';
import usePrevious from '../hooks/usePrevious';

interface DialerProps {
  telephony?: TelephonyState;
  preferences?: PreferencesState,
  makeClient?(): SIPClient;
  doCall?(client: any): void;
};

const Dialer: React.FunctionComponent<DialerProps> = (props) => {
  const [recoveredClient, setClient] = React.useState();
  const [state, setState] = React.useState({ number: '' });
  const previousPreferences = usePrevious(props.preferences);

  const isUserAgentReady = props.telephony!.userAgentStatus === UserAgentStatus.Registered;
  const hasCallInProgress = props.telephony!.callStatus
    && props.telephony!.callStatus !== CallStatus.Terminated
    && props.telephony!.callStatus !== CallStatus.Failed;
  const canDoCalls = isUserAgentReady && !hasCallInProgress;

  React.useEffect(() => {
    if (!recoveredClient) {
      console.log('[Dialer] Setting new created client, also running it.');
      const newClient = props.makeClient!();
      newClient.run();
      setClient(newClient);
      return;
    }

    if (isEqual(props.preferences, previousPreferences)) {
      return;
    }

    console.log('[Dialer] Preferences changes detected. Stopping current recovered client.');
    recoveredClient.stop();

    console.log('[Dialer] Creating an updated client.');
    const updatedClient = props.makeClient!();
    setClient(updatedClient);
    updatedClient.run();
  }, [recoveredClient, props.makeClient, props.preferences, previousPreferences]);

  React.useEffect(() => () => {
    if (!recoveredClient) {
      return;
    }

    console.log('[Dialer] Cleaning up: stopping recovered client.');
    recoveredClient.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNumberInputChange = (event: React.FormEvent<FormControlProps>) => {
    const target = event.target as HTMLInputElement;
    setState({ number: target.value });
  }

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (!recoveredClient || !state.number || !canDoCalls) {
      return;
    }

    props.doCall!({ client: recoveredClient as SIPClient, destiny: state.number });
  };

  const hangup = () => {
    if (recoveredClient === null) {
      return;
    }

    (recoveredClient as SIPClient).hangup();
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
            <Button
              variant="danger"
              type="button"
              size="sm"
              onClick={hangup}
            >
              <MaterialIcon icon="call_end" />
            </Button>
          ) : (
            <Button
              variant="success"
              type="submit"
              size="sm"
              disabled={!canDoCalls}
              title="Make call"
            >
              <MaterialIcon icon="call" />
            </Button>
          )}
        </Form.Group>
      </Form>
    </div>
  );
};

const mapStateToProps = ({ telephony, preferences }: any): any => {
  return { telephony, preferences };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return bindActionCreators({
    doCall,
    makeClient,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Dialer);
