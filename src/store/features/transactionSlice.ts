import { ICatetinTransaksi } from './../../types/transaksi';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TransactionState {
  selectedTransaction: number | null;
}

const initialState: TransactionState = {
  selectedTransaction: null,
};

export const authSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setSelectedTransaction: (state: TransactionState, action: PayloadAction<any>) => {
      state.selectedTransaction = action.payload;
    },
  },
});

export const { setSelectedTransaction } = authSlice.actions;

export default authSlice.reducer;
