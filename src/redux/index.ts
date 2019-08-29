import { combineReducers, applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { ProfileContent, storeProfileContent } from '../utils/profiles';
import telephony from './telephony';
import history from './history';
import preferences from './preferences';

const reducers = combineReducers({
  telephony,
  history,
  preferences,
});

const store = createStore(reducers, applyMiddleware(thunk));

export const persistCurrentPreferences = () => {
  const {
    history,
    preferences,
  } = store.getState();
  storeProfileContent({
    history,
    preferences,
  } as ProfileContent);
};

store.subscribe(persistCurrentPreferences);

export default store;

// @ts-ignore
window.store = store;
