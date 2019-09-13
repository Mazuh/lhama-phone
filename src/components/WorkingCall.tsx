import React from 'react';
import { AnyAction, bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import {
  NO_CALL_STATUS_SET,
  TelephonyState,
  setInputMuted,
  setOutputMuted,
  hangup,
} from '../redux/telephony';
import IconButton from './dumb/IconButton';
import IncomingCallPrompt from './IncomingCallPrompt';

interface WorkingCallProps {
  telephony: TelephonyState;
  setInputMuted: Function;
  setOutputMuted: Function;
  hangup: Function;
}

const WorkingCall: React.FC<WorkingCallProps> = (props) => {
  if (props.telephony.incomingCall) {
    return <IncomingCallPrompt />;
  }

  if (NO_CALL_STATUS_SET.includes(props.telephony.callStatus)) {
    return (
      <header className="mt-1">
        <strong className="d-block mb-1">Current call:</strong>
        <span className="d-block">Currently none.</span>
      </header>
    );
  }

  const onSpeakingClick = () => {
    const toggled = !props.telephony.isAudioInputMuted;
    props.setInputMuted(toggled);
  };

  const onHearingClick = () => {
    const toggled = !props.telephony.isAudioOutputMuted;
    props.setOutputMuted(toggled);
  }

  return (
    <div
      className="d-flex flex-column h-100 justify-content-center align-items-center text-center"
    >
      <header className="mb-3">
        <span>In call:</span>
        <br />
        <h4>{props.telephony.number || 'Unknown'}</h4>
      </header>
      <div className="d-flex">
        {props.telephony.isAudioInputMuted ? (
          <div className="ml-2 mr-2">
            <IconButton icon="mic_off" variant="dark" onClick={onSpeakingClick} />
            <span className="d-block">Muted</span>
          </div>
        ) : (
          <div className="ml-2 mr-2">
            <IconButton icon="mic" variant="outline-dark" onClick={onSpeakingClick} />
            <span className="d-block">Speaking</span>
          </div>
        )}
        {props.telephony.isAudioOutputMuted ? (
          <div className="ml-2 mr-2">
            <IconButton icon="volume_off" variant="dark" onClick={onHearingClick} />
            <span className="d-block">Deaf</span>
          </div>
        ) : (
          <div className="ml-2 mr-2">
            <IconButton icon="volume_up" variant="outline-dark" onClick={onHearingClick} />
            <span className="d-block">Hearing</span>
          </div>
        )}
        <div className="ml-2 mr-2">
          <IconButton icon="phone_hangup" variant="danger" onClick={() => props.hangup()} />
          <span className="d-block">Hangup</span>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = ({ telephony }: any) => ({
  telephony,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => bindActionCreators({
  setInputMuted,
  setOutputMuted,
  hangup,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WorkingCall);
