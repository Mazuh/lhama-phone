import { combineReducers, applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import telephony from './telephony';

const reducers = combineReducers({
  telephony,
});

const store = createStore(reducers, applyMiddleware(thunk));

export default store;

// @ts-ignore
window.store = store;
