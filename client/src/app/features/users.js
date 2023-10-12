import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  update: true,
  selectedUsers: [],
  selectedKeys: [],
};

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setUpdate: (state, action) => {
      state.update = action.payload;
    },
    setSelectedUsers: (state, action) => {
      state.selectedUsers = action.payload;
    },
    setSelectedKeys: (state, action) => {
      state.selectedKeys = action.payload;
    },
  },
});

export const {
  setUsers,
  setUpdate,
  setSelectedUsers,
  setSelectedKeys,
} = usersSlice.actions;
export default usersSlice.reducer;
