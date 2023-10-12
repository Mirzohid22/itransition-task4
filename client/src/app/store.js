import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./features/admin";
import usersReducer from "./features/users";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    users: usersReducer,
  },
});
