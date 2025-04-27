import { createSlice } from "@reduxjs/toolkit";

const formSlice = createSlice({
    name: "Form",

    initialState: {
        data: [],
        position: {
            x: window.innerWidth/2,
            y: 50
        }
    },

    reducers: {

        storeFormData: (state, action) => {
            const formData = JSON.parse(action.payload);
            const index = state.data.findIndex(item => item.objectID === formData.objectID);
        
            if (index !== -1) {
                state.data[index] = { ...state.data[index], ...formData };
            } else {
                state.data.push(formData);
            }
        },        

        removeFormData: (state, action) => {
            state.data = state.data.filter(item => item.objectID !== action.payload);
        },

        clearFormData: (state) => {
            state.data = [];
        },

        setFormPosition: (state, action) => {
            state.position = action.payload;
        }
    }
});

const formReducer = formSlice.reducer;
export const { storeFormData, clearFormData, removeFormData, setFormPosition } = formSlice.actions;

export default formReducer;
