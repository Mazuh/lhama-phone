import React from 'react';
import { bindActionCreators, AnyAction, Dispatch } from 'redux';
import { connect } from 'react-redux'
import Form from 'react-bootstrap/Form';
import { FormControlProps } from 'react-bootstrap/FormControl';
import FlowroutePreferences from './FlowroutePreferences';
import { PreferencesState, setAuthorization } from '../redux/preferences';

interface PreferencesProps {
  preferences?: PreferencesState;
  setAuthorization?: Function,
}

const Preferences: React.FC<PreferencesProps> = (props) => {
  const [isSaving, setSaving] = React.useState(false);
  const [user, setUser] = React.useState(props.preferences!.user);
  const [host, setHost] = React.useState(props.preferences!.host);
  const [password, setPassword] = React.useState(props.preferences!.password);

  React.useEffect(() => {
    if (user === props.preferences!.user
        && host === props.preferences!.host
        && password === props.preferences!.password) {
      setSaving(false);
      return () => {};
    }

    setSaving(true);

    const updateStoreTimer = window.setTimeout(() => {
      props.setAuthorization!(user, host, password);
      setSaving(false);
    }, 3000);

    return () => {
      window.clearTimeout(updateStoreTimer);
    };
  }, [user, host, password, props.preferences, props.setAuthorization, setSaving]);

  return (
    <div>
      <FlowroutePreferences />
      <div>
        <p>
          URI: {isSaving && <small>(Updating connection...)</small>}
          <Form.Text>
            <span>
              sip:
              <em>{props.preferences!.user || '?'}</em>
              @
              <em>{props.preferences!.host || '?'}</em>
            </span>
          </Form.Text>
        </p>
        <Form.Label>
          User:
          <Form.Control
            value={user}
            onChange={handleForEventValue(setUser)}
            placeholder="E.g.: 1000"
          />
        </Form.Label>
        <Form.Label>
          Host:
          <Form.Control
            value={host}
            onChange={handleForEventValue(setHost)}
            placeholder="E.g.: mydomain.com"
          />
        </Form.Label>
        <Form.Label>
          Password:
          <Form.Control
            value={password}
            onChange={handleForEventValue(setPassword)}
            placeholder="E.g.: 1234"
          />
        </Form.Label>
      </div>
    </div>
  );
};

const handleForEventValue = (f: Function) => (
  (event: React.SyntheticEvent<FormControlProps>) => f((event.target as HTMLInputElement).value)
);

const mapStateToProps = ({ preferences }: any): any => {
  return { preferences };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return bindActionCreators({
    setAuthorization,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Preferences);
