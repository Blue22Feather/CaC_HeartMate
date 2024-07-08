/*----- Importaciones y dependencias -----*/
import React, { useContext, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate, Routes, Route } from 'react-router-dom';

import { AppContextProvider } from './scripts/app_context';
import { AppContext } from './scripts/app_context';

/*----- Componentes -----*/
import { LandingScreen } from './components/landing_screen';
import { AuthScreen } from './components/auth_screen';
import { AppScreen } from './components/app_screen';

/*----- Componente principal -----*/
const MainBody = () => {
    const { auth } = useContext(AppContext);
    const navigate = useNavigate();
    let current_url = window.location.pathname
    
    useEffect(() => {
        if (!auth && current_url !== '/login' && current_url !== '/') {
            navigate('/login');
        } else if (auth && current_url === '/login') {
            navigate('/app/feed');
        }
    }, [auth, navigate]);

    return (
        <Routes>
            <Route path="/" element={<><LandingScreen /></>} />
            <Route path="/login" element={<><AuthScreen /></>} />
            <Route path="/app/*" element={<><AppScreen /></>} />
        </Routes>
    )
}

ReactDOM.createRoot(document.getElementById('app__mount')).render(
    <AppContextProvider>
        <BrowserRouter>
            <MainBody />
        </BrowserRouter>
    </AppContextProvider>
);