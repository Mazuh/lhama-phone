import React from 'react';
import isEqual from 'lodash.isequal';
import MaterialIcon from '@material/react-material-icon';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { FormControlProps } from 'react-bootstrap/FormControl';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch, AnyAction } from 'redux';
import {
  TelephonyState,
  initClient,
  clearClient,
  doCall,
  UserAgentStatus,
  CallStatus,
} from '../redux/telephony';
import { PreferencesState } from '../redux/preferences';
import usePrevious from '../hooks/usePrevious';

interface DialerProps {
  telephony?: TelephonyState;
  preferences?: PreferencesState,
  initClient?(): void;
  clearClient?(): void;
  doCall?(params: { destiny: string }): void;
};

const Dialer: React.FunctionComponent<DialerProps> = (props) => {
  const [state, setState] = React.useState({ number: '' });
  const previousPreferences = usePrevious(props.preferences);

  const isUserAgentReady = props.telephony!.userAgentStatus === UserAgentStatus.Registered;
  const hasCallInProgress = props.telephony!.callStatus
    && props.telephony!.callStatus !== CallStatus.Terminated
    && props.telephony!.callStatus !== CallStatus.Failed;
  const canDoCalls = isUserAgentReady && !hasCallInProgress;

  React.useEffect(() => {
    if (!props.telephony!.client) {
      console.log('[Dialer] Initializing new client');
      props.initClient!();
      return;
    }

    if (isEqual(props.preferences, previousPreferences)) {
      return;
    }

    console.log('[Dialer] Preferences changes detected. Initializing client again.');
    props.initClient!();
  }, [props.telephony, props.initClient, props.preferences, previousPreferences]);

  React.useEffect(() => () => {
    console.log('[Dialer] Cleaning up: stopping client.');
    props.clearClient!();
  }, [props.clearClient]);

  const handleNumberInputChange = (event: React.FormEvent<FormControlProps>) => {
    const target = event.target as HTMLInputElement;
    setState({ number: target.value });
  }

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (!props.telephony!.client || !state.number || !canDoCalls) {
      return;
    }

    props.doCall!({ destiny: state.number });
    setState({ number: '' });
  };

  const hangup = () => {
    props.telephony!.client!.hangup();
  }

  return (
    <div>
      <Form onSubmit={onSubmit} inline>
        <Form.Group>
          <Form.Control
            type="search"
            value={state.number}
            onChange={handleNumberInputChange}
            placeholder="Type to call..."
            title="Input an extension or phone number here"
            maxLength={50}
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
    initClient,
    clearClient,
    doCall,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Dialer);
