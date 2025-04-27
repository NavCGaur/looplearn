import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedUserId: null,
  isAssignModalOpen: false,
  isAssignedWordsModalOpen: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    selectUser: (state, action) => {
      state.selectedUserId = action.payload;
    },
    openAssignModal: (state, action) => {
      state.selectedUserId = action.payload;
      state.isAssignModalOpen = true;
    },
    closeAssignModal: (state) => {
      state.isAssignModalOpen = false;
    },
    openAssignedWordsModal: (state, action) => {
      state.selectedUserId = action.payload;
      state.isAssignedWordsModalOpen = true;
    },
    closeAssignedWordsModal: (state) => {
      state.isAssignedWordsModalOpen = false;
    }
  }
});

export const {
  selectUser,
  openAssignModal,
  closeAssignModal,
  openAssignedWordsModal,
  closeAssignedWordsModal
} = userSlice.actions;

export default userSlice.reducer;