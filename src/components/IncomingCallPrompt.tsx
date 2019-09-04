import React from 'react';
import { Dispatch, AnyAction, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { TelephonyState, acceptIncomingCall, rejectIncomingCall } from '../redux/telephony';
import IconButton from './dumb/IconButton';

interface IncomingCallPromptProps {
  telephony: TelephonyState,
  acceptIncomingCall: Function,
  rejectIncomingCall: Function,
}

const IncomingCallPrompt: React.FC<IncomingCallPromptProps> = (props) => {
  const { incomingCall } = props.telephony;
  if (!incomingCall) {
    return null;
  }

  const fullIdentity = `${incomingCall.callerId}@${incomingCall.callerDomain || '?'}`;
  const onAcceptClick = () => props.acceptIncomingCall();
  const onRejectClick = () => props.rejectIncomingCall();

  return (
    <section className="d-flex flex-column h-100 justify-content-center align-items-center text-center">
      <div className="p-3 bg-warning">
        <header className="mb-3" title={fullIdentity}>
          <span>Incoming call:</span>
          <br />
          <strong>{incomingCall.callerId || 'Unknown'}</strong>
          <br />
          {incomingCall.displayName && <em>{incomingCall.displayName}</em>}
        </header>
        <div>
          <IconButton icon="call" onClick={onAcceptClick} variant="success" />
          <IconButton icon="call_end" onClick={onRejectClick} variant="danger" className="ml-2" />
        </div>
      </div>
    </section>
  );
};

const mapStateToProps = ({ telephony }: any) => ({
  telephony,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => bindActionCreators({
  acceptIncomingCall,
  rejectIncomingCall,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(IncomingCallPrompt);
