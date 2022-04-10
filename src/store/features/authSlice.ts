import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProfileJoinUser } from '../../types/profil';

interface AuthState {
  user: ProfileJoinUser | null;
}

const initialState: AuthState = {
  user: null,
};

export const authSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    setAccessToken: (state: AuthState, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
  },
});

export const { setAccessToken } = authSlice.actions;

export default authSlice.reducer;
