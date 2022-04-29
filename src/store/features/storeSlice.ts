import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StoreState {
  activeStore: number | undefined;
}

const initialState: StoreState = {
  activeStore: undefined,
};

export const authSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    setActiveStore: (state: StoreState, action: PayloadAction<any>) => {
      state.activeStore = action.payload;
    },
  },
});

export const { setActiveStore } = authSlice.actions;

export default authSlice.reducer;
