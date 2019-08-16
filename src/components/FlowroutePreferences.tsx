import React from 'react';
import makeUUID from 'uuid/v4';
import get from 'lodash.get';
import Form from 'react-bootstrap/Form';
import Dropdown, { DropdownProps } from 'react-bootstrap/Dropdown';
import { SelectCallback } from 'react-bootstrap/helpers';
import { FR_POINTS_OF_PRESENCE_DOMAINS } from '../sip-client';

const FlowroutePreferences: React.FunctionComponent = () => {
  const onPoPSelect: SelectCallback = (x, event) => {
    const target = event.target as HTMLButtonElement;
    const value = target.value;
    alert(value);
  };

  return (
    <Form>
      <span><strong>Flowroute</strong> exclusive preferences.</span>
      <FlowroutePointOfPresenceDropdown onSelect={onPoPSelect} />
    </Form>
  );
};

const FlowroutePointOfPresenceDropdown: React.FC<DropdownProps> = (props) => {
  return (
    <Dropdown {...props}>
      <Dropdown.Toggle id={makeUUID()}>
        Point of Presence
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {Object.keys(FR_POINTS_OF_PRESENCE_DOMAINS).map((pointName: string) => {
          const urls = get(FR_POINTS_OF_PRESENCE_DOMAINS, pointName) as Array<string>;
          const tooltip = urls.join('\n');
          return (
            <Dropdown.Item
              as="button"
              type="button"
              key={pointName}
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

export default FlowroutePreferences;
