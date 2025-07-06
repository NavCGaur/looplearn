import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedUserId: null,
  selectedUserIds: [], // New array for bulk selection
  isAssignModalOpen: false,
  isAssignedWordsModalOpen: false,  
  isBulkAssignModalOpen: false, // New modal state
  bulkAssignResults: null, // Store bulk assignment results
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
    },

    // New bulk selection actions
    toggleUserSelection: (state, action) => {
      const userId = action.payload;
      const index = state.selectedUserIds.indexOf(userId);
      
      if (index > -1) {
        // Remove if already selected
        state.selectedUserIds.splice(index, 1);
      } else {
        // Add if not selected
        state.selectedUserIds.push(userId);
      }
    },
    
    selectAllUsers: (state, action) => {
      state.selectedUserIds = action.payload; // Array of all user IDs
    },
    
    clearAllSelections: (state) => {
      state.selectedUserIds = [];
    },
    
    // Bulk assignment modal actions
    openBulkAssignModal: (state) => {
      state.isBulkAssignModalOpen = true;
    },
    
    closeBulkAssignModal: (state) => {
      state.isBulkAssignModalOpen = false;
    },
    
    // Bulk assignment results
    setBulkAssignResults: (state, action) => {
      state.bulkAssignResults = action.payload;
    },
    
    clearBulkAssignResults: (state) => {
      state.bulkAssignResults = null;
    }
  }
});

export const {
  selectUser,
  openAssignModal,
  closeAssignModal,
  openAssignedWordsModal,
  closeAssignedWordsModal,
  toggleUserSelection,
  selectAllUsers,
  clearAllSelections,
  openBulkAssignModal,
  closeBulkAssignModal,
  setBulkAssignResults,
  clearBulkAssignResults,
} = userSlice.actions;

export default userSlice.reducer;