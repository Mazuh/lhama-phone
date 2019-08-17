export enum CallDirection {
  Inbound = 1,
  Outbound,
}

export type CallLog = {
  uuid: string;
  startedAt: Date;
  direction: CallDirection;
  number: string;
}

export type HistoryAction = (
  | { type: 'ADD_CALL_TO_HISTORY', log: CallLog }
)

export interface HistoryState {
  logs: Array<CallLog>,
}

const initialState: HistoryState = {
  logs: [],
}

export default function (state = initialState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'ADD_CALL_TO_HISTORY':
      return { ...state, logs: [ ...state.logs, action.log ] };
    default:
      return state;
  }
}
