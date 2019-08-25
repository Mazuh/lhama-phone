import React from 'react';
import { connect } from 'react-redux';
import { TelephonyState, CallStatus } from '../redux/telephony';

interface WorkingCallProps {
  telephony?: TelephonyState;
}

const WorkingCall: React.FC<WorkingCallProps> = (props) => {
  if (props.telephony!.callStatus === CallStatus.Accepted) {
    return (
      <div className="main-tab-panel">
        <p>
          In call to: <br />
          <strong>{props.telephony!.number}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="main-tab-panel">
      <p>
        Currently not in call.
      </p>
    </div>
  );
};

const mapStateToProps = ({ telephony }: any) => ({
  telephony,
});

export default connect(mapStateToProps)(WorkingCall);
