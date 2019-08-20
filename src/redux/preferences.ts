export type FlowroutePointOfPresence = (
  | 'us-east-nj'
  | 'us-west-or'
  | 'us-east-va'
  | 'us-west-sjc'
  | 'eu-west-ldn'
  | 'eu-west-ams'
);

export type PreferencesAction = (
  | { type: 'SET_PREFERENCES_SERVER', point: FlowroutePointOfPresence }
  | { type: 'SET_AUTH_PREFERENCES', user: string, host: string, password: string }
)

export function setServer(point: FlowroutePointOfPresence): PreferencesAction {
  return { type: 'SET_PREFERENCES_SERVER', point };
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
  server: FlowroutePointOfPresence,
  user: string,
  host: string,
  password: string,
}

const initialState: PreferencesState = {
  server: 'us-west-or',
  user: 'anonymous',
  host: 'wss.flowroute.com',
  password: 'nopassword',
};

export default function (state = initialState, action: PreferencesAction): PreferencesState {
  switch (action.type) {
    case 'SET_PREFERENCES_SERVER':
      return { ...state, server: action.point };
    case 'SET_AUTH_PREFERENCES':
      return { ...state, user: action.user, host: action.host, password: action.password };
    default:
      return state;
  }
}
