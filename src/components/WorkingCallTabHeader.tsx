import React from 'react';
import { connect } from 'react-redux';
import MaterialIcon from '@material/react-material-icon';
import { TelephonyState, CallStatus } from '../redux/telephony';

interface WorkingCallTabHeaderProps {
  telephony: TelephonyState;
}

const WorkingCallTabHeader: React.FC<WorkingCallTabHeaderProps> = (props) => {
  const hasIncomingCall = !!props.telephony.incomingCall;
  const icon = getCallIconName(props.telephony.callStatus, hasIncomingCall);
  const notDefaultIcon = icon !== 'smartphone';
  const description = getCallDescription(props.telephony.callStatus, hasIncomingCall);
  const colorClass = (hasIncomingCall && 'text-warning') || (notDefaultIcon && 'text-info') || '';
  return (
    <MaterialIcon icon={icon} title={description} className={colorClass} />
  );
};

const getCallIconName = (status: CallStatus|null, hasIncomingCall: boolean): string => {
  if (hasIncomingCall) {
    return 'phonelink_ring';
  }

  switch (status) {
    case CallStatus.Intending:
    case CallStatus.Accepted:
      return 'call';
    case CallStatus.Cancel:
    case CallStatus.Failed:
      return 'smartphone_erase';
    case CallStatus.Terminated:
    default:
      return 'smartphone';
  }
}

const getCallDescription = (status: CallStatus|null, hasIncomingCall: boolean): string => {
  if (hasIncomingCall) {
    return 'Incoming call';
  }

  switch (status) {
    case CallStatus.Intending:
      return 'Calling';
    case CallStatus.Accepted:
      return 'In call';
    case CallStatus.Cancel:
    case CallStatus.Failed:
    case CallStatus.Terminated:
    default:
      return 'Currently not in call';
  }
};

const mapStateToProps = ({ telephony }: any) => ({
  telephony,
});

export default connect(mapStateToProps)(WorkingCallTabHeader);
