import { ICatetinTransaksi, ICatetinTransaksiWithDetail } from './../../types/transaksi';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TransactionState {
  selectedTransaction: number | null;
  editedTransaction: ICatetinTransaksiWithDetail | null;
}

const initialState: TransactionState = {
  selectedTransaction: null,
  editedTransaction: null,
};

export const authSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setSelectedTransaction: (state: TransactionState, action: PayloadAction<any>) => {
      state.selectedTransaction = action.payload;
    },
    setEditedTransaction: (state: TransactionState, action: PayloadAction<any>) => {
      state.editedTransaction = action.payload;
    },
  },
});

export const { setSelectedTransaction, setEditedTransaction } = authSlice.actions;

export default authSlice.reducer;
