

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: Boolean(localStorage.getItem("token")),
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user")), 
  loading: false

};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.loading = false;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));

    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.loading = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { setLoading, loginSuccess, logout, updateUserProfile } = authSlice.actions;

export default authSlice.reducer;