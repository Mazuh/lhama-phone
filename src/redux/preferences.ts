export type FlowroutePointOfPresence = (
  | 'us-east-nj'
  | 'us-west-or'
  | 'us-east-va'
  | 'us-west-sjc'
  | 'eu-west-ldn'
  | 'eu-west-ams'
);

export type PreferencesAction = (
  | { type: 'SET_SERVER', point: FlowroutePointOfPresence }
)

export function setServer(point: FlowroutePointOfPresence) {
  return { type: 'SET_SERVER', point };
  // return (dispatch: Dispatch<PreferencesAction>) => {
  //   dispatch({ type: 'SET_SERVER', point });
  // };
}

export interface PreferencesState {
  server: FlowroutePointOfPresence,
  // user: string,
  // host: string,
  // password: string,
}

const initialState: PreferencesState = {
  server: 'us-west-or',
  // user: 'anonymous',
  // host: 'nopassword',
  // password: 'wss.flowroute.com',
};

export default function (state = initialState, action: PreferencesAction): PreferencesState {
  switch (action.type) {
    case 'SET_SERVER':
      return { ...state, server: action.point };
    default:
      return state;
  }
}
