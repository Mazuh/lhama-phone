// @ts-ignore
import SIPClient from '../sip-client';
// end of ts ignoreds
import find from 'lodash.find';
import { Dispatch } from 'react';
import makeUUID from 'uuid/v4';
import { HistoryAction, CallDirection } from './history';
import { PreferencesState, PreferencesMode } from './preferences';

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
  Intending = 'intending',
  Accepted = 'accepted',
  Terminated = 'terminated',
  Failed = 'failed',
  Cancel = 'cancel',
}

export enum CallEvent {
  Intending = 'intending',
  Accepted = 'accepted',
  Terminated = 'terminated',
  Failed = 'failed',
  Cancel = 'cancel',
  InputMuted = 'muted',
  InputUnmuted = 'unmuted',
  OutputMuted = 'player-muted',
  OutputUnmuted = 'player-unmuted',
}

function parseCallEvent(sipJsSessionEventType: string): CallEvent|null {
  switch (sipJsSessionEventType) {
    case 'accepted':
      return CallEvent.Accepted;
    case 'terminated':
      return CallEvent.Terminated;
    case 'failed':
      return CallEvent.Failed;
    case 'cancel':
      return CallEvent.Failed;
    case 'muted':
      return CallEvent.InputMuted;
    case 'unmuted':
      return CallEvent.InputUnmuted;
    case 'player-muted':
      return CallEvent.OutputMuted;
    case 'player-unmuted':
      return CallEvent.OutputUnmuted;
    default:
      return null;
  }
}

type TelephonyAction = (
  | { type: 'SET_TELEPHONY_CLIENT'; client: SIPClient }
  | { type: 'CLEAR_TELEPHONY_CLIENT' }
  | { type: 'SET_USER_AGENT_STATUS'; status: UserAgentStatus }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Intending; number: string }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Accepted }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Terminated }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Failed }
  | { type: 'SET_CALL_STATUS'; status: CallStatus.Cancel }
  | { type: 'SET_AUDIO_OUTPUT_MUTED' }
  | { type: 'SET_AUDIO_OUTPUT_UNMUTED' }
  | { type: 'SET_AUDIO_INPUT_MUTED' }
  | { type: 'SET_AUDIO_INPUT_UNMUTED' }
);

export function initClient() {
  return (dispatch: Dispatch<TelephonyAction>, getState: Function) => {
    const state = getState();

    const { client: existingClient } = state.telephony as TelephonyState;
    if (existingClient) {
      existingClient!.stop({ eraseUserAgentCallbacks: true });
    }

    const {
      server,
      host,
      user,
      password,
      mode,
    } = state.preferences as PreferencesState;
    const createdClient = new SIPClient({
      pointOfPresence: mode === PreferencesMode.Flowroute && server,
      webSocket: mode !== PreferencesMode.Flowroute && server,
      callerId: user,
      callerDomain: host,
      displayName: 'Lhama Phone user',
      password,
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
    createdClient.run();
    dispatch({ type: 'SET_TELEPHONY_CLIENT', client: createdClient });
  };
}

export function clearClient() {
  return (dispatch: Dispatch<TelephonyAction>, getState: Function) => {
    const telephony = getState().telephony as TelephonyState;
    if (!telephony.client) {
      return;
    }

    telephony.client!.stop({ eraseUserAgentCallbacks: true });
    dispatch({ type: 'CLEAR_TELEPHONY_CLIENT' });
  }
}

export function doCall(params: { destiny: string }) {
  return (dispatch: Dispatch<TelephonyAction|HistoryAction>, getState: Function) => {
    const { client } = getState().telephony as TelephonyState;
    if (!client) {
      return;
    }

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

    client.call({
      to: did,
      onCallAction: (event: { type: string, payload?: any }) => {
        const parsedEvent = parseCallEvent(event.type);
        if (!parsedEvent) {
          console.warn('[Telephony actions] Ignored call event:', event.type);
          return;
        }

        const status = find(CallStatus, (it: any) => it === parsedEvent) as CallStatus|undefined;
        if (status && status !== CallStatus.Intending) {
          console.log('[Telephony actions] Call status event', event);
          dispatch({ type: 'SET_CALL_STATUS', status });
          return;
        }

        console.log('[Telephony actions] Call status event', event);
        switch (parsedEvent) {
          case CallEvent.InputMuted:
            dispatch({ type: 'SET_AUDIO_INPUT_MUTED' });
            break;
          case CallEvent.InputUnmuted:
            dispatch({ type: 'SET_AUDIO_INPUT_UNMUTED' });
            break;
          case CallEvent.OutputMuted:
            dispatch({ type: 'SET_AUDIO_OUTPUT_MUTED' });
            break;
          case CallEvent.OutputUnmuted:
            dispatch({ type: 'SET_AUDIO_OUTPUT_UNMUTED' });
            break;
          default:
            break;
        }
      },
    });
  };
}

function createClientThunk(useClient: (client: SIPClient) => void) {
  return (dispatch: never, getState: Function) => {
    const { client } = getState().telephony as TelephonyState;
    if (!client) {
      throw new Error('Tried to use unexisting client method.');
    }

    useClient(client!);
  }
}

export function hangup() {
  return createClientThunk((client) => {
    client.hangup();
  });
}

export function setInputMuted(isMuted: boolean) {
  return createClientThunk((client) => {
    client.setMicMuted(isMuted);
  });
}

export function setOutputMuted(isMuted: boolean) {
  return createClientThunk((client) => {
    client.setPlayerMuted(isMuted);
  });
}

export interface TelephonyState {
  client: SIPClient|null;
  userAgentStatus: UserAgentStatus;
  callStatus: CallStatus | null;
  number: string | null;
  isAudioOutputMuted: boolean;
  isAudioInputMuted: boolean;
}

const initialState: TelephonyState = {
  client: null,
  userAgentStatus: UserAgentStatus.Disconnected,
  callStatus: null,
  number: null,
  isAudioOutputMuted: false,
  isAudioInputMuted: false,
};

export default function (state = initialState, action: TelephonyAction): TelephonyState {
  switch (action.type) {
    case 'SET_TELEPHONY_CLIENT':
      return { ...state, client: action.client };
    case 'CLEAR_TELEPHONY_CLIENT':
      return { ...state, client: null };
    case 'SET_USER_AGENT_STATUS':
      return { ...state, userAgentStatus: action.status };
    case 'SET_CALL_STATUS':
      return action.status === CallStatus.Intending ? {
        ...state,
        callStatus: action.status,
        number: action.number,
        isAudioInputMuted: false,
        isAudioOutputMuted: false,
      } : {
        ...state,
        callStatus: action.status,
      };
    case 'SET_AUDIO_OUTPUT_MUTED':
      return { ...state, isAudioOutputMuted: true };
    case 'SET_AUDIO_OUTPUT_UNMUTED':
      return { ...state, isAudioOutputMuted: false };
    case 'SET_AUDIO_INPUT_MUTED':
      return { ...state, isAudioInputMuted: true };
    case 'SET_AUDIO_INPUT_UNMUTED':
      return { ...state, isAudioInputMuted: false };
    default:
      return state;
  }
}
