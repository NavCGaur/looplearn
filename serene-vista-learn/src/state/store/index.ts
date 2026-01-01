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
import { questionsApi } from "../api/questionsApi.ts";
import { questionManagerApi } from "../api/questionManagerApi";




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
  [questionsApi.reducerPath]: questionsApi.reducer,
  [questionManagerApi.reducerPath]: questionManagerApi.reducer,
  

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware ,
    vocabApi.middleware,userApi.middleware,scienceApi.middleware
  ,mathApi.middleware
  ,questionsApi.middleware
  ,questionManagerApi.middleware
  ), 
});


// Required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export default store;
