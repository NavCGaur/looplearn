import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  words: []
};

const scienceSlice = createSlice({
  name: 'science',
  initialState,
  reducers: {
    setWords: (state, action) => {

      state.words = action.payload; // get only scienceulary array
    }
  }
});

export const { setWords } = scienceSlice.actions;
export default scienceSlice.reducer;
