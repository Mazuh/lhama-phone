// @ts-ignore
import SIPClient from '../sip-client';
// end of ts ignoreds
import find from 'lodash.find';
import { Dispatch } from 'redux';
import makeUUID from 'uuid/v4';
import { HistoryAction, CallDirection, CallOutcome } from './history';
import { PreferencesState, PreferencesMode } from './preferences';

export enum UserAgentStatus {
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Registered = 'registered',
  Unregistered = 'unregistered',
  RegistrationFailed = 'registrationFailed',
  TransportError = 'transportError',
}

export enum UserAgentEvent {
  IncomingCall = 'incomingCall',
  MissedCall = 'misisedCall',
  Message = 'message',
  MessageSent = 'messageSent',
}

function parseUserAgentStatus(sipJsUAEventType: string): UserAgentStatus|null {
  return find(UserAgentStatus, (it: UserAgentStatus) => it === sipJsUAEventType) || null;
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
  Bye = 'bye',
  Rejected = 'rejected',
  Terminated = 'terminated',
  Failed = 'failed',
  Cancel = 'cancel',
  InputMuted = 'muted',
  InputUnmuted = 'unmuted',
  OutputMuted = 'player-muted',
  OutputUnmuted = 'player-unmuted',
}

function parseCallEvent(sipJsSessionEventType: string): CallEvent|null {
  return find(CallEvent, (it: CallEvent) => it === sipJsSessionEventType) || null;
}

export const NO_CALL_STATUS_SET = [
  null,
  CallStatus.Failed,
  CallStatus.Cancel,
  CallStatus.Terminated,
]

interface Call {
  callerId: string;
  callerDomain?: string;
  displayName?: string;
}

interface IncomingCall extends Call {
  accept: () => void;
  reject: () => void;
}

type TelephonyAction = (
  | { type: 'SET_TELEPHONY_CLIENT'; client: SIPClient }
  | { type: 'CLEAR_TELEPHONY_CLIENT' }
  | { type: 'SET_USER_AGENT_STATUS'; status: UserAgentStatus }
  | { type: 'SET_INCOMING_CALL', incomingCall: IncomingCall }
  | { type: 'ACCEPT_INCOMING_CALL' }
  | { type: 'REJECT_INCOMING_CALL' }
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
  return (dispatch: Dispatch<TelephonyAction|HistoryAction>, getState: Function) => {
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
        if (status) {
          console.log('[Telephony actions] User status event', event);
          dispatch({ type: 'SET_USER_AGENT_STATUS', status });
          return;
        }

        switch (event.type) {
          case UserAgentEvent.IncomingCall:
            console.log('[Telephony actions] Incoming call', event);
            dispatch({
              type: 'SET_INCOMING_CALL',
              incomingCall: event.payload,
            });
            break;
          case UserAgentEvent.MissedCall:
            console.log('[Telephony actions] Missed call', event);
            dispatch({
              type: 'REJECT_INCOMING_CALL',
            });
            dispatch({
              type: 'ADD_CALL_TO_HISTORY',
              log: {
                uuid: makeUUID(),
                startedAt: new Date(),
                number: event.payload.callerId,
                direction: CallDirection.Inbound,
                outcome: CallOutcome.Missed,
              },
            });
            break;
          case UserAgentEvent.Message:
          case UserAgentEvent.MessageSent:
            break;
          default:
            console.warn('[Telephony actions] Ignored user agent event:', event);
            break;
        };
      },
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

        console.log('[Telephony actions] Call event', event);
        switch (parsedEvent) {
          case CallEvent.Bye:
            dispatch({ type: 'SET_CALL_STATUS', status: CallStatus.Terminated });
            break;
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

    dispatch({
      type: 'SET_CALL_STATUS',
      status: CallStatus.Intending,
      number: params.destiny,
    });
    dispatch({
      type: 'ADD_CALL_TO_HISTORY',
      log: {
        uuid: makeUUID(),
        startedAt: new Date(),
        number: params.destiny,
        direction: CallDirection.Outbound,
        outcome: CallOutcome.Completed,
      },
    });

    client.call({ to: params.destiny });
  };
}

type UseClientCb = (
  client: SIPClient,
  dispatch: Dispatch<TelephonyAction|HistoryAction>,
  telephony: TelephonyState,
) => void;
function createClientThunk(useClient: UseClientCb) {
  return (dispatch: Dispatch<TelephonyAction|HistoryAction>, getState: Function) => {
    const telephony = getState().telephony as TelephonyState;
    if (!telephony.client) {
      return;
    }

    useClient(telephony.client!, dispatch, telephony);
  }
}

export function acceptIncomingCall() {
  return createClientThunk((client, dispatch, telephony) => {
    const { incomingCall } = telephony;
    if (!incomingCall || client.activeCall) {
      return;
    }

    incomingCall.accept();
    dispatch({ type: 'ACCEPT_INCOMING_CALL' });
    dispatch({
      type: 'ADD_CALL_TO_HISTORY',
      log: {
        uuid: makeUUID(),
        startedAt: new Date(),
        number: incomingCall.callerId,
        direction: CallDirection.Inbound,
        outcome: CallOutcome.Completed,
      },
    });
  });
}

export function rejectIncomingCall() {
  return createClientThunk((client, dispatch, telephony) => {
    const { incomingCall } = telephony;
    if (!incomingCall) {
      return;
    }

    incomingCall.reject();
    dispatch({ type: 'REJECT_INCOMING_CALL' });
  });
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
  incomingCall: IncomingCall|null,
  number: string | null;
  isAudioOutputMuted: boolean;
  isAudioInputMuted: boolean;
}

const initialState: TelephonyState = {
  client: null,
  userAgentStatus: UserAgentStatus.Disconnected,
  incomingCall: null,
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
    case 'SET_INCOMING_CALL':
      return { ...state, incomingCall: action.incomingCall };
    case  'ACCEPT_INCOMING_CALL':
      return state.incomingCall ? {
        ...state,
        incomingCall: null,
        callStatus: CallStatus.Accepted,
        number: state.incomingCall.callerId,
      } : state;
    case 'REJECT_INCOMING_CALL':
      return { ...state, incomingCall: null };
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
