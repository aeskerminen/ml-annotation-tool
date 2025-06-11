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
        add: (state, attribute) => {
            state = [...state, attribute]

        },
        remove: (state, attribute) => {
            state = state.filter((a) => a !== attribute)
        }
    }
})


export const { add, remove } = attributeSlice.actions

export default attributeSlice.reducer