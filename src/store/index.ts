import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import transactionReducer from './features/transactionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transaction: transactionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
