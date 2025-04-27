import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  words: []
};

const vocabSlice = createSlice({
  name: 'vocab',
  initialState,
  reducers: {
    setWords: (state, action) => {

      state.words = action.payload; // get only vocabulary array
    }
  }
});

export const { setWords } = vocabSlice.actions;
export default vocabSlice.reducer;
