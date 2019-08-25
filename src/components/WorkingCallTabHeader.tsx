import React from 'react';
import { connect } from 'react-redux';
import MaterialIcon from '@material/react-material-icon';
import { TelephonyState, CallStatus } from '../redux/telephony';

interface WorkingCallTabHeaderProps {
  telephony?: TelephonyState;
}

const WorkingCallTabHeader: React.FC<WorkingCallTabHeaderProps> = (props) => {
  const icon = getCallIconName(props.telephony!.callStatus);
  const description = getCallDescription(props.telephony!.callStatus);
  return (
    <div className="d-flex text-align-center">
      <MaterialIcon icon={icon} className="size-18 mr-1" />
      <span>{description}</span>
    </div>
  );
};

const getCallIconName = (status: CallStatus|null): string => {
  switch (status) {
    case CallStatus.Intending:
    case CallStatus.Accepted:
      return 'phone';
    case CallStatus.Cancel:
    case CallStatus.Failed:
      return 'smartphone_erase';
    case CallStatus.Terminated:
    default:
      return 'smartphone';
  }
}

const getCallDescription = (status: CallStatus|null): string => {
  switch (status) {
    case CallStatus.Intending:
      return 'Calling';
    case CallStatus.Accepted:
      return 'In call';
    case CallStatus.Cancel:
    case CallStatus.Failed:
    case CallStatus.Terminated:
    default:
      return 'No call';
  }
};

const mapStateToProps = ({ telephony }: any) => ({
  telephony,
});

export default connect(mapStateToProps)(WorkingCallTabHeader);
