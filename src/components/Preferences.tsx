import React from 'react';
import { bindActionCreators, AnyAction, Dispatch } from 'redux';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/Form';
import { History } from 'history';
import { withRouter } from 'react-router';
import MaterialIcon from '@material/react-material-icon';
import Button from 'react-bootstrap/Button';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import ToggleButton from 'react-bootstrap/ToggleButton';
import FlowroutePreferences from './FlowroutePreferences';
import CustomPreferences from './CustomPreferences';
import {
  PreferencesState,
  PreferencesMode,
  DEFAULT_PROFILE_NAME,
  setPreferencesMode,
  setAuthorization,
} from '../redux/preferences';
import { handleForEventValue } from '../utils/form-control';
import { persistLogout } from '../utils/login-session';
import { purgePersistedProfile } from '../utils/profiles';

interface PreferencesProps {
  history: History;
  preferences?: PreferencesState;
  setAuthorization?: (user: string, host: string, password: string) => void,
  setPreferencesMode?: (mode: PreferencesMode) => void,
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

  const goToProfileSelection = () => {
    persistLogout();
    props.history.push('/');
  }

  const deleteProfile = () => {
    if (!window.confirm(`Permanently DELETE your "${props.preferences!.name}" profile?`)) {
      return;
    }

    purgePersistedProfile(props.preferences!.name);
    window.alert(`Purged "${props.preferences!.name}" profile.`);
    goToProfileSelection();
  }

  return (
    <div>
      <p>
        Preferences for <strong>{props.preferences!.name}</strong>.
        {props.preferences!.name === DEFAULT_PROFILE_NAME && (
          <React.Fragment>
            <br/>
            <em>Messing up with the default profile is not so cool. Create a new one for you!</em>
          </React.Fragment>
        )}
      </p>
      <span>
        Mode:
      </span>
      <ButtonToolbar>
        <ToggleButtonGroup
          type="radio"
          name="mode"
          value={props.preferences!.mode}
          onChange={props.setPreferencesMode}
        >
          <ToggleButton value={PreferencesMode.Flowroute} variant="outline-dark">
            Flowroute
          </ToggleButton>
          <ToggleButton value={PreferencesMode.Custom} variant="outline-dark">
            Custom
          </ToggleButton>
        </ToggleButtonGroup>
      </ButtonToolbar>
      {props.preferences!.mode === PreferencesMode.Flowroute && <FlowroutePreferences />}
      {props.preferences!.mode === PreferencesMode.Custom && <CustomPreferences />}
      <Form>
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
      </Form>
      <Button
        variant="warning"
        className="d-flex align-items-center ml-auto"
        title="Go back to profile selector"
        onClick={goToProfileSelection}
      >
        <MaterialIcon icon="exit_to_app" className="mr-1" />
        <span>Back to profile selection</span>
      </Button>
      {props.preferences!.name !== DEFAULT_PROFILE_NAME && (
        <Button
          variant="danger"
          className="d-flex align-items-center ml-auto mt-1"
          title="Permanently delete this profile"
          onClick={deleteProfile}
        >
          <MaterialIcon icon="delete_forever" className="mr-1" />
          <span>Delete</span>
        </Button>
      )}
    </div>
  );
};

const mapStateToProps = ({ preferences }: any): any => {
  return { preferences };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return bindActionCreators({
    setAuthorization,
    setPreferencesMode,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Preferences));
