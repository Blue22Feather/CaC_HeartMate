/*----- Importaciones y dependencias -----*/
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../scripts/app_context';
import { Routes, Route, Link } from 'react-router-dom';

import { request_userData, update_userData_Field } from '../scripts/server_com';

/*----- Recursos multimedia -----*/
import svg_icons from '../icons/svg-resources.xml';

/*----- Componentes externos -----*/
import { FeedPanel } from './app_screen_panels/feed_panel';
import { ExplorePanel } from './app_screen_panels/explore_panel';
import { ProfilePanel } from './app_screen_panels/profile_panel';
import { ChannelsPanel } from './app_screen_panels/channels_panel';
import { CollectionsPanel } from './app_screen_panels/collections_panel';
import { NotificationsPanel } from './app_screen_panels/notifications_panel';
import { ConfigPanel } from './app_screen_panels/config_panel';

/*----- Componentes locales -----*/
const LoadingScreen = () => {
    return (
        <div className='loading__wrapper'>
            <div className='heart-load'>
                <img src={process.env.PUBLIC_URL + '/assets/icons/logo_832.png'} alt="logotype" />
            </div>
        </div>
    )
}

const SideBar = ({ theme, setTheme }) => {
    const { setLogged, setAuth, setUserData, auth, userData, commonHost } = useContext(AppContext);
    const [ readedMSG, setReadedMSG ] = useState(true);
    const [ readedNotifications, setReadedNotifications ] = useState(true);
    const [ currentStatus, setCurrentStatus ] = useState('');
    const [ systemStatus, setSystemStatus ] = useState('')
    const [ statusMenuVisible, setStatusMenuVisible] = useState(false);
    const [ extendedBar, setExtendedBar ] = useState(false);

    let currentSpace = window.location.pathname;

    useEffect(() => {
        if (auth) {
            request_userData(auth, (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    if (result) {
                        const incoming_data = result;
                        incoming_data.mail = auth.sessionUser;
                        setUserData(incoming_data);
                        statusHandler(incoming_data.status, true)
                    } else {
                        console.log('ERR_PAGE::SERVER_INVALID_RESPONSE', result);
                    }
                }
            });
        } else {
            console.warn("aun no carga el auth");
        }
    }, [auth, setUserData]);

    function logout() {
        localStorage.removeItem('auth');
        setAuth(null)
        setLogged(false)
    }

    function statusHandler(new_status, firstLoad=false) {
        const translations = {
            online: "En linea",
            idle: "Ausente",
            dndisturb: "No molestar",
            invisible: "Invisible"
        }
        if (!firstLoad) {
            update_userData_Field(auth, 'status', new_status, (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(result)
                    setCurrentStatus(translations[new_status]);
                    setStatusMenuVisible(!statusMenuVisible);
                    setSystemStatus(new_status);
                }
            });
        } else {
            setCurrentStatus(translations[new_status]);
            setSystemStatus(new_status);
        }
    }

    function statusMenuHandler() {
        setStatusMenuVisible(!statusMenuVisible);
    }

    function toggleRead() {
        setReadedMSG(!readedMSG)
        setReadedNotifications(!readedNotifications)
    }

    return(
        <div className={`side-bar__wrapper ${extendedBar ? 'expanded' : ''}`}>
            <div className='side-bar__top'>
                <div className='logotype__wrapper'>
                    <div className='app-name__wrapper'>
                        <img  src={process.env.PUBLIC_URL + '/assets/icons/logo_512.png'} alt='AppLogo' />
                        <h2>HeartMate</h2>
                    </div>
                    <button onClick={()=> setExtendedBar(!extendedBar)} className='button toggle_hidden'>
                        <svg className='icon'>
                            <use xlinkHref={svg_icons+'#icon-expand'}></use>
                        </svg>
                    </button>
                </div>
                <nav className='side-bar__navigation'>
                    <Link to="/app/feed" className={`navigation__link ${currentSpace === '/app/feed' ? 'current' : ''}`} style={{color: '#409FFF'}}>
                        <svg className='icon'>
                            <use xlinkHref={svg_icons+'#icon-home'}></use>
                        </svg>
                        <p>Inicio</p>
                    </Link>
                    <Link to="/app/explore" className={`navigation__link ${currentSpace === '/app/explore' ? 'current' : ''}`} style={{color: '#43F081'}}>
                        <svg className='icon'>
                            <use xlinkHref={svg_icons+'#icon-compass'}></use>
                        </svg>
                        <p>Explorar</p>
                    </Link>
                    <Link to="/app/channels" className={`navigation__link ${currentSpace === '/app/channels' ? 'current' : ''} ${readedMSG ? '' : 'see_me'}`} style={{color: '#FF560D'}}>
                        <svg className='icon'>
                            <use xlinkHref={svg_icons+`${readedMSG ? '#icon-chat' : '#icon-chat--unread'}`}></use>
                        </svg>
                        <p>Canales</p>
                    </Link>
                    <Link to="/app/collections" className={`navigation__link ${currentSpace === '/app/collections' ? 'current' : ''}`} style={{color: '#00FFFF'}}>
                        <svg className='icon'>
                            <use xlinkHref={svg_icons+'#icon-archive'}></use>
                        </svg>
                        <p>Colecciones</p>
                    </Link>
                    <Link to="/app/notifications" className={`navigation__link ${currentSpace === '/app/notifications' ? 'current' : ''} ${readedNotifications ? '' : 'see_me'}`} style={{color: '#FFD700'}}>
                        <svg className='icon'>
                            <use xlinkHref={svg_icons+`${readedNotifications ? '#icon-notifications' : '#icon-notifications--unread'}`}></use>
                        </svg>
                        <p>Notificaciones</p>
                    </Link>
                    <Link to="/app/config" className={`navigation__link ${currentSpace === '/app/config' ? 'current' : ''}`} style={{color: '#A260FF'}}>
                        <svg className='icon'>
                            <use xlinkHref={svg_icons+'#icon-config'}></use>
                        </svg>
                        <p>Configuracion</p>
                    </Link>
                </nav>
            </div>
            <div className='side-bar__bottom'>
                <div className='session-card__wrapper'>
                    <div className='user-label__wrapper'>
                        <div className={`user-avatar sideBar-style ${systemStatus}`}>
                            {userData.profilePic_url ?
                                <img src={commonHost+userData.profilePic_url} alt="user_pic" /> :
                                <svg className='icon'>
                                    <use xlinkHref={svg_icons+'#icon-empty-user'}></use>
                                </svg>
                            }
                        </div>
                        <div className='user-names'>
                            <h3>{`${userData.name} ${userData.lastName}`}</h3>
                            <p>{userData.mail}</p>
                        </div>
                    </div>
                    <div className={`session-options__wrapper ${statusMenuVisible ? 'menu_visible' : ''}`}>
                        <div className='status-options__wrapper'>
                            <div onClick={statusMenuHandler} className={`button session-option toggler ${systemStatus}`}>
                                <svg className='icon'>
                                    <use xlinkHref={svg_icons+'#icon-status-circle'}></use>
                                </svg>
                                <p>{currentStatus}</p>
                                <svg className='icon toggle-icon'>
                                    <use xlinkHref={svg_icons+'#icon-arrow'}></use>
                                </svg>
                            </div>
                            <div className='status-options__content'>
                                <button className={`button session-option online ${systemStatus === 'online' ? 'hidden' : ''}`} onClick={() => statusHandler('online')}>
                                    <svg className='icon'>
                                        <use xlinkHref={svg_icons+'#icon-status-circle'}></use>
                                    </svg>
                                    <p>En linea</p>
                                </button>
                                <button className={`button session-option idle ${systemStatus === 'idle' ? 'hidden' : ''}`} onClick={() => statusHandler('idle')}>
                                    <svg className='icon'>
                                        <use xlinkHref={svg_icons+'#icon-status-circle'}></use>
                                    </svg>
                                    <p>Ausente</p>
                                </button>
                                <button className={`button session-option dndisturb ${systemStatus === 'dndisturb' ? 'hidden' : ''}`} onClick={() => statusHandler('dndisturb')}>
                                    <svg className='icon'>
                                        <use xlinkHref={svg_icons+'#icon-status-circle'}></use>
                                    </svg>
                                    <p>No molestar</p>
                                </button>
                                <button className={`button session-option invisible ${systemStatus === 'invisible' ? 'hidden' : ''}`} onClick={() => statusHandler('invisible')}>
                                    <svg className='icon'>
                                        <use xlinkHref={svg_icons+'#icon-status-circle'}></use>
                                    </svg>
                                    <p>Invisible</p>
                                </button>
                            </div>
                        </div>
                        <Link className='button session-option' to={`/app/profile/${userData.user_url}`}>
                            <svg className='icon'>
                                <use xlinkHref={svg_icons+'#icon-heart-paper'}></use>
                            </svg>
                            <p>Mi perfil</p>
                        </Link>
                        <button className='button session-option' onClick={logout}>
                            <svg className='icon'>
                                <use xlinkHref={svg_icons+'#icon-exit'}></use>
                            </svg>
                            <p>Cerrar sesion</p>
                        </button>
                        <div className='user-names'>
                            <h3>{`${userData.name} ${userData.lastName}`}</h3>
                            <p>{userData.mail}</p>
                        </div>
                    </div>
                </div>
                <div className={`theme-selector__wrapper ${theme ? 'light-switch' : 'dark-switch'}`}>
                    <button onClick={() => setTheme(true)} className={`button toggle_hidden ${theme ? 'current' : ''}`}>
                        <svg className='icon'>
                            <use xlinkHref={svg_icons+'#icon-day'}></use>
                        </svg>
                        <p>Claro</p>
                    </button>
                    <button onClick={() => setTheme(false)} className={`button toggle_hidden ${theme ? '' : 'current'}`}>
                        <svg className='icon'>
                            <use xlinkHref={svg_icons+'#icon-night'}></use>
                        </svg>
                        <p>Oscuro</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

/*----- Componente central -----*/
export const AppScreen = () => {
    const { isLoading, setIsLoading, auth } = useContext(AppContext);
    const [ lightTheme, setLightTheme ] = useState(false);

    useEffect(() => {
        /*console.log("iniciado componente app");*/
        setIsLoading(true);

        /*console.log("simulacion de carga de datos");
        console.log(auth);*/
        
        setTimeout(() => {
            /*console.log("deteniendo carga de datos...");*/
            setIsLoading(false);
            /*console.log(isLoading)*/;
        }, 2500);
    }, [setIsLoading, auth]);

    if (isLoading) {
        return(<LoadingScreen />)
    } else {
        return(
            <>
                <SideBar theme={lightTheme} setTheme={setLightTheme}/>
                <div className={`app__wrapper ${lightTheme ? 'light-mode': 'dark-mode'}`}>
                    <Routes>
                        <Route path="/feed" element={<FeedPanel />} />
                        <Route path="/explore" element={<ExplorePanel />} />
                        <Route path="/channels" element={<ChannelsPanel />} />
                        <Route path="/collections" element={<CollectionsPanel />} />
                        <Route path="/notifications" element={<NotificationsPanel />} />
                        <Route path="/config" element={<ConfigPanel />} />
                        <Route path="/profile/:username/*" element={<ProfilePanel />} />
                    </Routes>
                </div>
            </>
        );
    }
}