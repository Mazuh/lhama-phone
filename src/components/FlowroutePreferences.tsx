import React from 'react';
import makeUUID from 'uuid/v4';
import { AnyAction, Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import get from 'lodash.get';
import Form from 'react-bootstrap/Form';
import Dropdown, { DropdownProps } from 'react-bootstrap/Dropdown';
import { SelectCallback } from 'react-bootstrap/helpers';
import { FR_POINTS_OF_PRESENCE_DOMAINS } from '../sip-client';
import { PreferencesState, setServer, FlowroutePointOfPresence } from '../redux/preferences';

interface FlowroutePreferencesProps {
  preferences?: PreferencesState;
  setServer?: (server: FlowroutePointOfPresence) => void;
}

const FlowroutePreferences: React.FC<FlowroutePreferencesProps> = (props) => {
  const onPoPSelect: SelectCallback = (x, event) => {
    const target = event.target as HTMLButtonElement;
    const value = target.value;
    props.setServer!(value as FlowroutePointOfPresence);
  };

  return (
    <Form>
      <p>
        <strong>Flowroute</strong> exclusive preferences.
      </p>
      <label>
        <span>Point of presence:</span>
        <FlowroutePointOfPresenceDropdown onSelect={onPoPSelect}>
          {props.preferences!.server}
        </FlowroutePointOfPresenceDropdown>
      </label>
    </Form>
  );
};

const FlowroutePointOfPresenceDropdown: React.FC<DropdownProps> = (props) => {
  const { children, ...dropdownProps } = props;
  return (
    <Dropdown {...dropdownProps}>
      <Dropdown.Toggle id={makeUUID()}>
        {children}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {Object.keys(FR_POINTS_OF_PRESENCE_DOMAINS).map((pointName: string) => {
          const urls = get(FR_POINTS_OF_PRESENCE_DOMAINS, pointName, []) as Array<string>;
          const tooltip = urls.join('\n');
          return (
            <Dropdown.Item
              key={pointName}
              as="button"
              type="button"
              value={pointName}
              title={tooltip}
            >
              {pointName}
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>);
};

const mapStateToProps = ({ preferences }: any): any => {
  return { preferences };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return bindActionCreators({
    setServer,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FlowroutePreferences);
