import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
  name: "connection",
  initialState: null,
  reducers: {
    addConnections: (state, action) => action.payload,
    removeConnections: () => null,
    moveConnectionToTop(state, action) {
      const chatId = action.payload;
      // Find the connection with this chatId
      const index = state.findIndex(conn => conn.chatId === chatId);
      if (index === -1) return state;
      
      // Remove the connection from its current position
      const [connection] = state.splice(index, 1);
      // Add it to the beginning of the array
      state.unshift(connection);
      
      return state;
    }
  }
})


export const {addConnections, removeConnections, moveConnectionToTop} = connectionSlice.actions;
export default connectionSlice.reducer;