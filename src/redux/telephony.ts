// @ts-ignore
import FlowrouteClient from 'jssip_client';
// end of ts ignoreds
import { Dispatch } from 'react';

export enum UserAgentStatus {
  Connecting = 1,
  Connected,
  Disconnected,
  Registered,
  Unregistered,
  RegistrationFailed,
  RegistrationExpiring,
}

function parseUserAgentStatus(jsSipUAEventType: string): UserAgentStatus | null {
  switch (jsSipUAEventType) {
    case 'connecting':
      return UserAgentStatus.Connecting;
    case 'connected':
      return UserAgentStatus.Connected;
    case 'disconnected':
          return UserAgentStatus.Disconnected;
    case 'registered':
        return UserAgentStatus.Registered;
    case 'unregistered':
        return UserAgentStatus.Unregistered;
    case 'registrationFailed':
        return UserAgentStatus.RegistrationFailed;
    case 'registrationExpiring':
        return UserAgentStatus.RegistrationExpiring;
    default:
      return null;
  }
}

export enum CallStatus {
  Intending = 1,
  Connecting,
  Confirmed,
  Ended,
  Failed,
}

function parseCallStatus(jsSipSessionEventType: string): CallStatus | null {
  switch (jsSipSessionEventType) {
    case 'connecting':
      return CallStatus.Connecting;
    case 'confirmed':
      return CallStatus.Confirmed;
    case 'ended':
      return CallStatus.Ended;
    case 'failed':
      return CallStatus.Failed;
    default:
      return null;
  }
}

type TelephonyAction = (
  | { type: 'SET_USER_AGENT_STATUS'; status: UserAgentStatus  }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Intending; number: string }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Connecting }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Confirmed }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Ended }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Failed }
);

export function makeClient() {
  return (dispatch: Dispatch<TelephonyAction>) => {
    return new FlowrouteClient({
      onUserAgentAction: (event: { type: string, payload?: any }) => {
        const status = parseUserAgentStatus(event.type);
        if (!status) {
          console.warn('Ignored UA event type:', event.type);
          return;
        }

        dispatch({ type: 'SET_USER_AGENT_STATUS', status });
      },
    });
  };
}

export function doCall(params: { client: FlowrouteClient, destiny: string }) {
  return (dispatch: Dispatch<TelephonyAction>) => {
    const did = params.destiny === '0' ? '13125867146' : params.destiny;
    dispatch({ type: 'SET_CALL_STATUS', status: CallStatus.Intending, number: did });

    params.client.call({
      to: did,
      onCallAction: (event: { type: string, payload?: any }) => {
        const status = parseCallStatus(event.type);
        switch (status) {
          case null:
          case CallStatus.Intending:
            console.warn('Ignored call event type', event.type);
            return;
          default:
            return dispatch({ type: 'SET_CALL_STATUS', status });
        }
      },
    });
  };
}

export interface TelephonyState {
  userAgentStatus: UserAgentStatus;
  callStatus: CallStatus | null;
  number: string | null;
}

const initialState: TelephonyState = {
  userAgentStatus: UserAgentStatus.Unregistered,
  callStatus: null,
  number: null,
};

export default function (state = initialState, action: TelephonyAction): TelephonyState {
  switch (action.type) {
    case 'SET_USER_AGENT_STATUS':
      return { ...state, userAgentStatus: action.status };
    case 'SET_CALL_STATUS':
      return { ...state, callStatus: action.status };
    default:
      return state;
  }
}
