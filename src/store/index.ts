import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import storeReducer from './features/storeSlice';
import transactionReducer from './features/transactionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transaction: transactionReducer,
    store : storeReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
