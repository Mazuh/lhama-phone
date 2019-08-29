import React from 'react';
import { Dispatch, AnyAction, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { History } from 'history';
import { withRouter, Redirect } from 'react-router';
import MaterialIcon from '@material/react-material-icon';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import { retrieveProfileList, retrieveProfileContent, storeProfileList } from '../utils/profiles';
import { persistLogin, retrieveIsLoggedIn } from '../utils/login-session';
import { persistCurrentPreferences } from '../redux';
import { setPreferencesName, setPreferences, DEFAULT_PROFILE_NAME } from '../redux/preferences';
import { setCallHistory } from '../redux/history';

interface WelcomePageProps {
  history: History;
  setCallHistory?: Function;
  setPreferences?: Function;
  setPreferencesName?: Function;
}

const WelcomePage: React.FunctionComponent<WelcomePageProps> = (props) => {
  const [profiles, setProfiles] = React.useState([] as Array<string>);
  React.useEffect(() => {
    const retrievingProfiles = retrieveProfileList();
    if (retrievingProfiles.length) {
      setProfiles(retrievingProfiles);
    } else {
      persistCurrentPreferences();
      storeProfileList([DEFAULT_PROFILE_NAME]);
      setProfiles([DEFAULT_PROFILE_NAME]);
    }

    const profilesUpdater = setInterval(() => {
      const updatedProfiles = retrieveProfileList();
      setProfiles(updatedProfiles);
    }, 5000);

    return () => {
      clearInterval(profilesUpdater);
    }
  }, []);

  const selectProfileFn = (profile: string) => () => {
    const profileContent = retrieveProfileContent(profile);
    if (profileContent) {
      props.setPreferences!(profileContent.preferences);
      props.setCallHistory!(profileContent.history);
    } else {
      props.setPreferencesName!(profile);
    }

    persistLogin();
    props.history.push('/main');
  };

  const onNewProfileSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const newProfileInput = form['new-profile'] as HTMLInputElement;
    const newProfileName = newProfileInput.value.trim();
    if (!newProfileName) {
      return;
    }

    const existingProfiles = profiles.map(it => it.toLocaleLowerCase());
    if (existingProfiles.includes(newProfileName.toLocaleLowerCase())) {
      return;
    }

    const updatedProfiles = [ ...profiles, newProfileName ];
    setProfiles(updatedProfiles);
    storeProfileList(updatedProfiles);
    selectProfileFn(newProfileName)();
  };

  if (retrieveIsLoggedIn()) {
    return (
      <Redirect to="/main" />
    );
  }

  return (
    <div>
      <header className="bg-dark text-white pb-1">
        <Container>
          <h1>
            Hi, <small>llama person.</small>
          </h1>
        </Container>
      </header>
      <Container>
        <div className="pt-2">
          <p>
            Softphone made with <span role="img" aria-label="love">❤️</span> by Mazuh.
          </p>
          <p>
            Select your <strong>profile</strong>:
          </p>
          <ListGroup className="profiles-list-group">
            {profiles.map((profile) => (
              <ListGroup.Item
                key={profile}
                className="d-flex align-items-center p-1 profiles-list-group__item"
                as="button"
                onClick={selectProfileFn(profile)}
              >
                <span>{profile}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </Container>
      <Form
        onSubmit={onNewProfileSubmit}
        className="mt-3 p-3 justify-content-center bg-secondary text-white fixed-bottom"
        inline
      >
        <Form.Group className="m-0">
          <Form.Control
            type="text"
            id="new-profile"
            placeholder="Create new profile"
            title="Name of the new profile to be created"
            required
          />
        </Form.Group>
        <Form.Group className="m-0">
          <Button
            variant="success"
            type="submit"
            size="sm"
            title="Add new profile"
          >
            <MaterialIcon icon="add" />
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => bindActionCreators({
  setCallHistory,
  setPreferences,
  setPreferencesName,
}, dispatch);

export default connect(null, mapDispatchToProps)(withRouter(WelcomePage));
