import reduce from 'lodash.reduce';
import { combineReducers, applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import telephony from './telephony';
import history from './history';
import preferences from './preferences';

const reducers = combineReducers({
  telephony,
  history,
  preferences,
});

const loadPersistedState = () => {
  const serialized = localStorage.getItem('redux-state');
  if (!serialized) {
    return undefined;
  }

  const parsed = JSON.parse(serialized);
  const parsedWithDateTypes = reduce(parsed, (acc, data, key) => {
    if (key === 'history') {
      return {
        ...acc,
        [key]: {
          ...data,
          logs: data.logs.map((log: any) => ({ ...log, startedAt: new Date(log.startedAt) })),
        },
      };
    }

    return { ...acc, [key]: data };
  }, {});
  return parsedWithDateTypes;
};

const store = createStore(reducers, loadPersistedState(), applyMiddleware(thunk));

store.subscribe(() => {
  const {
    history,
  } = store.getState();
  const serialized = JSON.stringify({
    history,
  });

  localStorage.setItem('redux-state', serialized);
});

export default store;

// @ts-ignore
window.store = store;
