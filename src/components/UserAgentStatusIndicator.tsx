import React from 'react';
import { connect } from 'react-redux';
import findKey from 'lodash.findkey';
import MaterialIcon from '@material/react-material-icon';
import { UserAgentStatus } from '../redux/telephony';

interface UserAgentStatusIndicatorProps {
  userAgentStatus?: UserAgentStatus,
  preferencesName?: string,
}

const UserAgentStatusIndicator: React.FunctionComponent<UserAgentStatusIndicatorProps> = (props) => {
  return (
    <div className="d-flex justify-content-around mb-1 c-default">
      <span title="Current user agent status" className="d-flex align-items-center">
        <MaterialIcon icon={uaStatusToIconName(props.userAgentStatus!)} className="mr-1" />
        {uaStatusToMessage(props.userAgentStatus!)}
      </span>
      <span title="Your profile name" className="d-flex align-items-center">
        <MaterialIcon icon="person_outline" className="mr-1" />
        {props.preferencesName ? props.preferencesName : '?'}
      </span>
    </div>
  );
};

const uaStatusToIconName = (status: UserAgentStatus): string => {
  switch (status) {
    case UserAgentStatus.Connecting:
    case UserAgentStatus.Disconnected:
    case UserAgentStatus.TransportError:
      return 'wifi_off';
    case UserAgentStatus.Connected:
      return 'wifi';
    case UserAgentStatus.Registered:
      return 'network_wifi';
    case UserAgentStatus.Unregistered:
    case UserAgentStatus.RegistrationFailed:
      return 'wifi_lock';
    default:
      return 'signal_cellular_alt';
  }
}

const uaStatusToMessage = (status: UserAgentStatus): string => {
  switch (status) {
    case UserAgentStatus.Connecting:
    case UserAgentStatus.Disconnected:
    case UserAgentStatus.Connected:
    case UserAgentStatus.Registered:
    case UserAgentStatus.Unregistered:
      return findKey(UserAgentStatus, (it: UserAgentStatus) => it === status) as string;
    case UserAgentStatus.RegistrationFailed:
      return 'Registration failed';
    case UserAgentStatus.TransportError:
      return 'Connection error';
    default:
      return 'Unknown';
  }
}

const mapStateToProps = ({ telephony, preferences }: any): any => {
  return {
    userAgentStatus: telephony.userAgentStatus,
    preferencesName: preferences.name,
  };
};

export default connect(mapStateToProps)(UserAgentStatusIndicator);
