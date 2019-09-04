export enum CallDirection {
  Inbound = 1,
  Outbound,
}

export enum CallOutcome {
  Completed = 1,
  Missed,
}

export type CallLog = {
  uuid: string;
  startedAt: Date;
  direction: CallDirection;
  number: string;
  outcome: CallOutcome;
}

export type HistoryAction = (
  | { type: 'SET_HISTORY', history: HistoryState }
  | { type: 'ADD_CALL_TO_HISTORY', log: CallLog }
  | { type: 'CLEAR_CALL_HISTORY' }
)

export function setCallHistory(history: HistoryState): HistoryAction {
  return { type: 'SET_HISTORY', history };
}

export function clearCallHistory(): HistoryAction {
  return { type: 'CLEAR_CALL_HISTORY' };
}

export interface HistoryState {
  logs: Array<CallLog>,
}

const initialState: HistoryState = {
  logs: [],
}

export default function (state = initialState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'SET_HISTORY':
      return { ...state, ...action.history };
    case 'ADD_CALL_TO_HISTORY':
      return { ...state, logs: [ action.log, ...state.logs ] };
    case 'CLEAR_CALL_HISTORY':
      return { ...state, logs: initialState.logs };
    default:
      return state;
  }
}
