// @ts-ignore
import SIPClient from '../sip-client';
// end of ts ignoreds
import { Dispatch } from 'react';
import makeUUID from 'uuid/v4';
import { HistoryAction, CallDirection } from './history';
import { PreferencesState } from './preferences';

export enum UserAgentStatus {
  Connecting = 1,
  Connected,
  Disconnected,
  Registered,
  Unregistered,
  RegistrationFailed,
  TransportError,
}

function parseUserAgentStatus(sipJsUAEventType: string): UserAgentStatus | null {
  switch (sipJsUAEventType) {
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
    case 'transportError':
        return UserAgentStatus.TransportError;
    default:
      return null;
  }
}

export enum CallStatus {
  Intending = 1,
  Accepted,
  Terminated,
  Failed,
  Cancel,
}

function parseCallStatus(sipJsSessionEventType: string): CallStatus | null {
  switch (sipJsSessionEventType) {
    case 'accepted':
      return CallStatus.Accepted;
    case 'terminated':
      return CallStatus.Terminated;
    case 'failed':
      return CallStatus.Failed;
    case 'cancel':
      return CallStatus.Failed;
    default:
      return null;
  }
}

type TelephonyAction = (
  | { type: 'SET_USER_AGENT_STATUS'; status: UserAgentStatus  }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Intending; number: string }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Accepted }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Terminated }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Failed }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Cancel }
);

export function makeClient() {
  return (dispatch: Dispatch<TelephonyAction>, getState: Function) => {
    const state = getState();
    const {
      server,
    } = state.preferences as PreferencesState;
    const client = new SIPClient({
      pointOfPresence: server,
      onUserAgentAction: (event: { type: string, payload?: any }) => {
        const status = parseUserAgentStatus(event.type);
        if (!status) {
          console.warn('[Telephony actions] Ignored user agent event:', event);
          return;
        }

        console.log('[Telephony actions] User agent event', event)
        dispatch({ type: 'SET_USER_AGENT_STATUS', status });
      },
    });

    return client;
  };
}

export function doCall(params: { client: SIPClient, destiny: string }) {
  return (dispatch: Dispatch<TelephonyAction|HistoryAction>) => {
    const did = params.destiny === '0' ? '13125867146' : params.destiny;
    dispatch({ type: 'SET_CALL_STATUS', status: CallStatus.Intending, number: did });
    dispatch({
      type: 'ADD_CALL_TO_HISTORY',
      log: {
        uuid: makeUUID(),
        startedAt: new Date(),
        direction: CallDirection.Outbound,
        number: did,
      },
    });

    params.client.call({
      to: did,
      onCallAction: (event: { type: string, payload?: any }) => {
        const status = parseCallStatus(event.type);
        switch (status) {
          case null:
          case CallStatus.Intending:
            console.warn('[Telephony actions] Ignored call event:', event.type);
            return;
          default:
            console.log('[Telephony actions] Call event', event);
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
  userAgentStatus: UserAgentStatus.Disconnected,
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
