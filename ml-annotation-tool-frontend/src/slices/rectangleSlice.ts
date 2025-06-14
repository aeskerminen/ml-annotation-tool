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
            // Validate that the payload matches Rectangle type
            const rectangle: Rectangle = action.payload;
            if (!rectangle.id || !rectangle.label) return;
            state.value.push(rectangle);
        },
        remove: (state, action) => {
            // Remove by ID instead of direct object comparison
            state.value = state.value.filter((rect) => rect.id !== action.payload);
        },
        update: (state, action) => {
            const { id, changes } = action.payload;
            const index = state.value.findIndex(rect => rect.id === id);
            if (index !== -1) {
                state.value[index] = { ...state.value[index], ...changes };
            }
        },
        updateLabel: (state, action) => {
            const { id, label } = action.payload;
            const rect = state.value.find(rect => rect.id === id);
            if (rect) {
                rect.label = label;
            }
        },
        clear: (state) => {
            state.value = [];
        }
    }
})


export const { add, remove, update, updateLabel, clear } = rectangleSlice.actions

export default rectangleSlice.reducer