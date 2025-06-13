import { createSlice } from '@reduxjs/toolkit'
import type { Rectangle } from '../features/annotator/types/Rectangle'

export interface rectangleState {
    value: Array<Rectangle>
}

const initialState: rectangleState = {
    value: []
}

export const rectangleSlice = createSlice({
    name: 'rectangles',
    initialState,
    reducers: {
        add: (state, action) => {
            state.value.push(action.payload)
        },
        remove: (state, action) => {
            state.value = state.value.filter((a) => a !== action.payload)
        }
    }
})


export const { add, remove } = rectangleSlice.actions

export default rectangleSlice.reducer