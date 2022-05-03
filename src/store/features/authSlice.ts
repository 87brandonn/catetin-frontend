import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProfileJoinUser } from '../../types/profil';
import { ICatetinStore } from '../../types/store';

interface AuthState {
  profile: ProfileJoinUser | null;
  accessToken: string | null;
  store: ICatetinStore[] | null;
  loggedIn: boolean;
}

const initialState: AuthState = {
  profile: null,
  accessToken: null,
  store: null,
  loggedIn: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setProfile: (state: AuthState, action: PayloadAction<any>) => {
      state.profile = action.payload;
    },
    setStore: (state: AuthState, action: PayloadAction<any>) => {
      state.store = action.payload;
    },
    setAccessToken: (state: AuthState, action: PayloadAction<any>) => {
      state.accessToken = action.payload;
    },
    setLoggedIn: (state: AuthState, action: PayloadAction<any>) => {
      state.loggedIn = action.payload;
    },
    logout: (state: AuthState) => {
      (async () => {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
      })();
    },
  },
});

export const { setProfile, setStore, setAccessToken, setLoggedIn, logout } = authSlice.actions;

export default authSlice.reducer;
