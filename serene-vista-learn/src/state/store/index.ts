// src/state/store.js
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from '@reduxjs/toolkit/query';

import authReducer from "../slices/authSlice.ts"; // Import your authSlice reducer
import vocabReducer from "../slices/vocabSlice.ts";
import userReducer from '../slices/userSlice.ts';



import { authApi } from "../api/auth.ts";  // Import the authApi
import { vocabApi } from "../api/vocabApi.ts";
import { userApi } from "../api/userApi.ts"; // Import the userApi




const store = configureStore({
  reducer: {
    // Combine reducers
    auth: authReducer, // For authentication state
    vocab: vocabReducer, 
    user: userReducer,


    [authApi.reducerPath]: authApi.reducer,
    [vocabApi.reducerPath]: vocabApi.reducer,
    [userApi.reducerPath]: userApi.reducer,

  

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware ,
    vocabApi.middleware,userApi.middleware
  ), // Add middleware for RTK Query
});


// Required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export default store;
