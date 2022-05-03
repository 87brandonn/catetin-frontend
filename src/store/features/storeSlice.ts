import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StoreState {
  activeStore: number | undefined;
}

const initialState: StoreState = {
  activeStore: undefined,
};

export const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    setActiveStore: (state: StoreState, action: PayloadAction<any>) => {
      state.activeStore = action.payload;
    },
  },
});

export const { setActiveStore } = storeSlice.actions;

export default storeSlice.reducer;
