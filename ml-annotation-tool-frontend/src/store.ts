import { configureStore } from '@reduxjs/toolkit'
import attributeReducer from "./attributeSlice"

export const store = configureStore({
  reducer: {
    attributes: attributeReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch