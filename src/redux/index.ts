import { combineReducers, applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import telephony from './telephony';
import history from './history';

const reducers = combineReducers({
  telephony,
  history,
});

const store = createStore(reducers, applyMiddleware(thunk));

export default store;

// @ts-ignore
window.store = store;
