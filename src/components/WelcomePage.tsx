import React from 'react';
import { Dispatch, AnyAction, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { History } from 'history';
import { withRouter } from 'react-router';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import { retrieveProfileList, retrieveProfileContent } from '../utils/profiles';
import { setPreferencesName, setPreferences } from '../redux/preferences';
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
    setProfiles(retrievingProfiles);
  }, [setProfiles]);

  const selectProfileFn = (profile: string) => () => {
    const profileContent = retrieveProfileContent(profile);
    if (profileContent) {
      props.setPreferences!(profileContent.preferences);
      props.setCallHistory!(profileContent.history);
    } else {
      props.setPreferencesName!(profile);
    }

    props.history.push('/main');
  };

  return (
    <Container>
      <header>
        <h1>
          Hi, <small>llama person.</small>
        </h1>
      </header>
      <div>
        <p>
          This is a demo softphone.<br />
          Made with <span role="img" aria-label="love">❤️</span> by Mazuh.
        </p>
        <p>
          <strong>Profiles:</strong>
        </p>
        <ListGroup>
          {profiles.map((profile) => (
            <ListGroup.Item
              key={profile}
              className="d-flex align-items-center p-1"
              as="button"
              onClick={selectProfileFn(profile)}
            >
              <span>{profile}</span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </Container>
  );
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => bindActionCreators({
  setCallHistory,
  setPreferences,
  setPreferencesName,
}, dispatch);

export default connect(null, mapDispatchToProps)(withRouter(WelcomePage));
