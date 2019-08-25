import React from 'react';
import { connect } from 'react-redux';
import { TelephonyState, CallStatus } from '../redux/telephony';

interface WorkingCallProps {
  telephony?: TelephonyState;
}

const WorkingCall: React.FC<WorkingCallProps> = (props) => {
  if (props.telephony!.callStatus === CallStatus.Accepted) {
    return (
      <div className="d-flex h-100 justify-content-center align-items-center text-center">
        <p>
          In call to: <br />
          <strong>{props.telephony!.number}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="d-flex h-100 justify-content-center align-items-center text-center">
      <p>
        Currently not in call. <br />
        Click at <strong>Make call</strong> tab!
      </p>
    </div>
  );
};

const mapStateToProps = ({ telephony }: any) => ({
  telephony,
});

export default connect(mapStateToProps)(WorkingCall);
