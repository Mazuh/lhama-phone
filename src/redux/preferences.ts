export const DEFAULT_PROFILE_NAME = 'Default';

export type FlowroutePointOfPresence = (
  | 'us-east-nj'
  | 'us-west-or'
  | 'us-east-va'
  | 'us-west-sjc'
  | 'eu-west-ldn'
  | 'eu-west-ams'
);

export enum PreferencesMode {
  Flowroute = 'flowroute',
  Custom = 'custom',
}

export type PreferencesAction = (
  | { type: 'SET_PREFERENCES', state: PreferencesState }
  | { type: 'SET_PREFERENCES_NAME', name: string }
  | { type: 'SET_PREFERENCES_MODE', mode: PreferencesMode }
  | { type: 'SET_PREFERENCES_SERVER', server: FlowroutePointOfPresence|string }
  | { type: 'SET_AUTH_PREFERENCES', user: string, host: string, password: string }
)

export function setPreferences(state: PreferencesState): PreferencesAction {
  return { type: 'SET_PREFERENCES', state };
}

export function setPreferencesName(name: string): PreferencesAction {
  return { type: 'SET_PREFERENCES_NAME', name };
}

export function setPreferencesMode(mode: PreferencesMode): PreferencesAction {
  return { type: 'SET_PREFERENCES_MODE', mode };
}

export function setServer(server: FlowroutePointOfPresence|string): PreferencesAction {
  return { type: 'SET_PREFERENCES_SERVER', server };
}

export function setAuthorization(user: string, host: string, password: string): PreferencesAction {
  return {
    type: 'SET_AUTH_PREFERENCES',
    user,
    host,
    password,
  };
}

export interface PreferencesState {
  name: string,
  mode: PreferencesMode,
  server: FlowroutePointOfPresence|string,
  user: string,
  host: string,
  password: string,
}

const initialState: PreferencesState = {
  name: DEFAULT_PROFILE_NAME,
  mode: PreferencesMode.Flowroute,
  server: 'us-west-or',
  user: 'anonymous',
  host: 'wss.flowroute.com',
  password: 'nopassword',
};

export default function (state = initialState, action: PreferencesAction): PreferencesState {
  switch (action.type) {
    case 'SET_PREFERENCES':
      return { ...state, ...action.state };
    case 'SET_PREFERENCES_NAME':
      return { ...state, name: action.name };
    case 'SET_PREFERENCES_SERVER':
      return { ...state, server: action.server };
    case 'SET_AUTH_PREFERENCES':
      return { ...state, user: action.user, host: action.host, password: action.password };
    case 'SET_PREFERENCES_MODE':
      return {
        ...state,
        mode: action.mode,
        server: action.mode === PreferencesMode.Flowroute ? 'us-west-or' : 'wss://myserver.com:443',
      };
    default:
      return state;
  }
}
