import React, { createContext, useReducer } from 'react';


//initial state
const initialState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null
};

//create context
const MainContext = createContext(initialState);

//reducer
const appReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                isAuthenticated: true,
                isLoading: false,
                user: action.payload.user,
                token: action.payload.token
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                isLoading: false,
                user: null,
                token: null
            };
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload
            };
        default:
            return state;
    }
};


//provider
const MainProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    return (
        <MainContext.Provider value={{ state, dispatch }}>
            {children}
        </MainContext.Provider>
    );
};


export { MainContext, MainProvider };


