/*----- Importaciones y dependencias -----*/
import { createContext, useEffect } from 'react';
import React, { useState } from 'react';

export const AppContext = createContext();

/*----- Context Provider -----*/
export const AppContextProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [logged, setLogged] = useState(false);
    const [userData, setUserData] = useState({});
    const [commonHost, setCommonHost] = useState("https://blue22feather.pythonanywhere.com");
    //const [commonHost, setCommonHost] = useState(window.location.host);
    //const [commonHost, setCommonHost] = useState("http://localhost:5000");

    const [localCounter, setLocalCounter] = useState(0)

    useEffect(() => {
        if (localCounter) {
            if (localCounter > 100) {
                console.warn(`[app_context]:: Contador local supera 100, restableciendo...`);
                setLocalCounter(0);
            }
        }
    }, [localCounter, setLocalCounter]);

    return (
        <AppContext.Provider value={{ localCounter, userData, auth, isLoading, logged, setAuth, setIsLoading, setLogged, setUserData, commonHost, setCommonHost, setLocalCounter }}>
            {children}
        </AppContext.Provider>
    );
};