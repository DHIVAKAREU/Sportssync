import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('sportsync_token') || null;
const user = JSON.parse(localStorage.getItem('sportsync_user') || 'null');

const initialState = {
  token,
  user,
  isAuthenticated: !!token && !!user,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('sportsync_token', token);
      localStorage.setItem('sportsync_user', JSON.stringify(user));
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('sportsync_user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('sportsync_token');
      localStorage.removeItem('sportsync_user');
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, updateUserProfile, logout, setAuthError } = authSlice.actions;
export default authSlice.reducer;
