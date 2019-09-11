import { combineReducers, applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { ProfileContent, storeProfileContent } from '../utils/profiles';
import telephony from './telephony';
import history from './history';
import preferences from './preferences';
import contacts from './contacts';

const reducers = combineReducers({
  telephony,
  history,
  preferences,
  contacts,
});

const store = createStore(reducers, applyMiddleware(thunk));

export const persistCurrentPreferences = () => {
  const {
    history,
    preferences,
    contacts,
  } = store.getState();
  storeProfileContent({
    history,
    preferences,
    contacts
  } as ProfileContent);
};

store.subscribe(persistCurrentPreferences);

export default store;

// @ts-ignore
window.store = store;
