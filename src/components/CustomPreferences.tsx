import React from 'react';
import { Dispatch, AnyAction, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/Form';
import { PreferencesState, setServer } from '../redux/preferences';
import { handleForEventValue } from '../utils/form-control';
import { isWebSocketURL } from '../utils/urls';

interface CustomPreferencesProps {
  preferences?: PreferencesState;
  setServer?: (server: string) => void;
}

const CustomPreferences: React.FC<CustomPreferencesProps> = (props) => {
  const [isSaving, setSaving] = React.useState(false);
  const [server, setServer] = React.useState(props.preferences!.server);
  const isValidServer = isWebSocketURL(server);

  React.useEffect(() => {
    if (server === props.preferences!.server || !isValidServer) {
      setSaving(false);
      return () => {};
    }

    setSaving(true);

    const updateStoreTimer = window.setTimeout(() => {
      props.setServer!(server);
      setSaving(false);
    }, 3000);

    return () => {
      window.clearTimeout(updateStoreTimer);
    };
  }, [server, props.preferences, props.setServer, setSaving, isValidServer]);

  return (
    <Form>
      <Form.Label>
          Server:
          {isSaving && <small> (Updating connection...) </small>}
          {isValidServer || <small className="text-danger"> (Invalid websocket URL) </small>}
          <Form.Control
            value={server}
            onChange={handleForEventValue(setServer)}
            placeholder="E.g.: wss://myserver.com:443"
          />
        </Form.Label>
    </Form>
  );
};

const mapStateToProps = ({ preferences }: any) => ({
  preferences,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => bindActionCreators({
  setServer,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CustomPreferences);
