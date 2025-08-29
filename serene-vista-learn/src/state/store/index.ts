// src/state/store.js
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from '@reduxjs/toolkit/query';

import authReducer from "../slices/authSlice.ts"; 
import vocabReducer from "../slices/vocabSlice.ts";
import userReducer from '../slices/userSlice.ts';
import scienceReducer from '../slices/scienceSlice.ts'; 



import { authApi } from "../api/auth.ts";  
import { vocabApi } from "../api/vocabApi.ts";
import { userApi } from "../api/userApi.ts"; 
import { scienceApi } from "../api/scienceApi.ts"; 
import { mathApi } from "../api/mathApi.ts";




const store = configureStore({
  reducer: {
    // Combine reducers
    auth: authReducer, 
    vocab: vocabReducer, 
    user: userReducer,
    science: scienceReducer,


    [authApi.reducerPath]: authApi.reducer,
    [vocabApi.reducerPath]: vocabApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [scienceApi.reducerPath]: scienceApi.reducer,
  [mathApi.reducerPath]: mathApi.reducer,
  

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware ,
    vocabApi.middleware,userApi.middleware,scienceApi.middleware
  ,mathApi.middleware
  ), 
});


// Required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export default store;
