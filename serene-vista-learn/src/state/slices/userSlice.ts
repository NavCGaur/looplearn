import { createSlice } from '@reduxjs/toolkit';

// 🧾 Initial state: Grouped by functionality for better readability
const initialState = {
  // 🔘 Single user selection
  selectedUserId: null,

  // ✅ Bulk user selection
  selectedUserIds: [],

  // 📝 Modal states: Assign & Assigned Words
  isAssignModalOpen: false,
  isAssignedWordsModalOpen: false,

  // 📦 Bulk modals: Assign & Delete
  isBulkAssignModalOpen: false,
  isBulkDeleteModalOpen: false,

  // 🗑️ Delete modal: Single user
  isDeleteModalOpen: false,

  // 📊 Results storage
  bulkAssignResults: null,
  bulkDeleteResults: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 🔘 Single user selection
    selectUser: (state, action) => {
      state.selectedUserId = action.payload;
    },


    // 📝 Assign modal
    openAssignModal: (state, action) => {
      state.selectedUserId = action.payload;
      state.isAssignModalOpen = true;
    },

    closeAssignModal: (state) => {
      state.isAssignModalOpen = false;
    },


    // 📚 Assigned Words modal
    openAssignedWordsModal: (state, action) => {
      state.selectedUserId = action.payload;
      state.isAssignedWordsModalOpen = true;
    },

    closeAssignedWordsModal: (state) => {
      state.isAssignedWordsModalOpen = false;
    },


    // ✅ Bulk user selection
    toggleUserSelection: (state, action) => {
      const userId = action.payload;
      const index = state.selectedUserIds.indexOf(userId);

      if (index > -1) {
        state.selectedUserIds.splice(index, 1);
      } else {
        state.selectedUserIds.push(userId);
      }
    },

    selectAllUsers: (state, action) => {
      state.selectedUserIds = action.payload;
    },

    clearAllSelections: (state) => {
      state.selectedUserIds = [];
    },


    // 📦 Bulk assign modal
    openBulkAssignModal: (state) => {
      state.isBulkAssignModalOpen = true;
    },

    closeBulkAssignModal: (state) => {
      state.isBulkAssignModalOpen = false;
    },


    // 📊 Bulk assign results
    setBulkAssignResults: (state, action) => {
      state.bulkAssignResults = action.payload;
    },

    clearBulkAssignResults: (state) => {
      state.bulkAssignResults = null;
    },


    // 🧹 Bulk delete results
    setBulkDeleteResults: (state, action) => {
      state.bulkDeleteResults = action.payload;
    },

    clearBulkDeleteResults: (state) => {
      state.bulkDeleteResults = null;
    },


    // 🗑️ Single delete modal
    openDeleteModal: (state, action) => {
      state.selectedUserId = action.payload;
      state.isDeleteModalOpen = true;
    },

    closeDeleteModal: (state) => {
      state.isDeleteModalOpen = false;
      state.selectedUserId = null;
    },


    // 🗑️ Bulk delete modal
    openBulkDeleteModal: (state) => {
      state.isBulkDeleteModalOpen = true;
    },

    closeBulkDeleteModal: (state) => {
      state.isBulkDeleteModalOpen = false;
    },


    // 🔄 Global state reset
    resetUserState: (state) => {
      Object.assign(state, initialState);
    }
  }
});

// 📦 Exporting grouped actions for clarity

// 🔘 Single selection
export const {
  selectUser,

  // 📝 Assign modal
  openAssignModal,
  closeAssignModal,

  // 📚 Assigned words modal
  openAssignedWordsModal,
  closeAssignedWordsModal,

  // ✅ Bulk selection
  toggleUserSelection,
  selectAllUsers,
  clearAllSelections,

  // 📦 Bulk assign modal
  openBulkAssignModal,
  closeBulkAssignModal,

  // 📊 Bulk assign results
  setBulkAssignResults,
  clearBulkAssignResults,

  // 🧹 Bulk delete results
  setBulkDeleteResults,
  clearBulkDeleteResults,

  // 🗑️ Delete modal
  openDeleteModal,
  closeDeleteModal,

  // 🗑️ Bulk delete modal
  openBulkDeleteModal,
  closeBulkDeleteModal,

  // 🔄 Reset state
  resetUserState
} = userSlice.actions;

// 🧱 Slice reducer export
export default userSlice.reducer;
