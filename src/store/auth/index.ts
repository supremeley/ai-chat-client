import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { AuthState, Userinfo } from './interface';

const initialState: AuthState = {
  userinfo: null,
  token: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserinfo: (state, action: PayloadAction<Userinfo | null>) => {
      state.userinfo = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    cleanUser: (state) => {
      state.userinfo = null;
      state.token = null;
    },
  },
});

export const { setUserinfo, setToken, cleanUser } = authSlice.actions;

export default authSlice.reducer;
