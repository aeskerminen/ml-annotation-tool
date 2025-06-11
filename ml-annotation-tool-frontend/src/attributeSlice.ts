import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface AttributeState {
    value: Array<string>
}

const initialState: AttributeState = {
    value: []
}

export const attributeSlice = createSlice({
    name: 'attributes',
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


export const { add, remove } = attributeSlice.actions

export default attributeSlice.reducer