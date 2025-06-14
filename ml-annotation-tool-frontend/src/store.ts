import { configureStore } from '@reduxjs/toolkit'
import attributeReducer from "./slices/attributeSlice"
import rectangleReducer from "./slices/rectangleSlice"

export const store = configureStore({
  reducer: {
    attributes: attributeReducer,
    rectangles: rectangleReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch