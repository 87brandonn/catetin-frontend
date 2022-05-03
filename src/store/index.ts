import { AnyAction, combineReducers, configureStore, Reducer } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import storeReducer from './features/storeSlice';
import transactionReducer from './features/transactionSlice';

const combinedReducer = combineReducers({
  auth: authReducer,
  transaction: transactionReducer,
  store: storeReducer,
});

const rootReducer: Reducer = (state: RootState, action: AnyAction) => {
  if (action.type === 'auth/logout') {
    return combinedReducer(undefined, action);
  }
  return combinedReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
