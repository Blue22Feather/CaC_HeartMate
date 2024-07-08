/*----- Importaciones y dependencias -----*/
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../scripts/app_context';
import { request_login, request_register, request_userPic } from '../scripts/server_com';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

/*----- Recursos multimedia -----*/
import svg_icons from '../icons/svg-resources.xml'

/*----- Componentes internos -----*/
const LoginAvatar = ({userPicture, tempMode=false}) => {
    const { commonHost } = useContext(AppContext);
    
    if (userPicture) {
        if (tempMode) {
            return (
                <div className='user_avatar'>
                    <img src={userPicture} alt="user avatar"/>
                </div>
            )
        } else {
            return (
                <div className='user_avatar'>
                    <img src={commonHost+userPicture} alt="user avatar"/>
                </div>
            )
        }
    } else {
        return (
            <div className='user_avatar'>
                <svg className='icon background-icon'>
                    <use xlinkHref={svg_icons+'#icon-empty-user'}></use>
                </svg>
            </div>
        )
    }
}

/*----- Componente principal -----*/
export const AuthScreen = () => {
    const { setAuth, setLogged } = useContext(AppContext);
    const [ screenMode, setScreenMode ] = useState('login');
    const [ screenObjectsFade, setScreenObjectsFade ] = useState(true);
    const [ firstMOOD, setFirstMOOD ] = useState(true);
    const [ mainPSWD_hidden, setMainPSWD_hidden] = useState(true);
    const [ ensurePSWD_hidden, setEnsurePSWD_hidden] = useState(true);
    const [ userPic, setUserPic ] = useState("");
    const [ tempUserPic, setTempUserPic ] = useState("");
    const [ isDragging, setIsDragging ] = useState(false);

    /* Manejo de imagen */
    const acceptedFileTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const [ pictureFile, setPictureFile ] = useState(null)

    const onDrop = useCallback(Files => {
        const file = Files[Files.length - 1];

        if (validate_entry(file, "file_space")) {
            const fileURL = URL.createObjectURL(file);
            setTempUserPic(fileURL);
            setPictureFile(file);
        } else {
            console.log("validacion pasada, resultado erroneo")
        }
        setIsDragging(false)
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        onDragEnter: () => setIsDragging(true),
        onDragLeave: () => setIsDragging(false)
    });

    /* Verificacion de login local*/
    useEffect(() => {
        const local_auth = localStorage.getItem('auth');

        const handleAuthChange = () => {
            const newAuth = localStorage.getItem('auth');
            const newParsedAuth = JSON.parse(newAuth);
            setAuth(newParsedAuth);
            setLogged(true);
        };

        if (local_auth) {
            const parsedAuth = JSON.parse(local_auth);
            setAuth(parsedAuth); // Utilizar el token para autenticar al usuario automáticamente
            setLogged(true);
        }

        // Escuchar cambios en el almacenamiento local
        window.addEventListener('storage', handleAuthChange);

        return () => {
            // Limpiar el event listener al desmontar el componente
            window.removeEventListener('storage', handleAuthChange);
        };
    }, [setAuth, setLogged]);

    useEffect(()=> {
        if (!firstMOOD) {
            setTimeout(() => {
                const email_input = document.getElementById('i_email');
                validate_entry(email_input, "email_space", true);  
            }, 1000);
        }
    }, [screenMode, firstMOOD]);

    function handleKeyDown (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendData();
        }
    }

    function sendData() {
        if (screenMode === 'login') {
            const email_input = document.getElementById('i_email');
            const password_input = document.getElementById('i_password');

            if (validate_entry(email_input, "email_space") && validate_entry(password_input, "password_space")) {
                request_login({ user_mail: email_input.value, user_pswd: password_input.value }, (error, result) => {
                    if (error) {
                        if (error.data.error === "ERR_WRONG_PASSWORD") {
                            password_input.setCustomValidity('Contraseña invalida');
                            password_input.reportValidity();
                        } else if (error.data.error === "ERR_WRONG_USER") {
                            email_input.setCustomValidity('Usuario invalido');
                            email_input.reportValidity();
                            if (email_input.classList.contains('valid')) {
                                email_input.classList.remove('valid'); email_input.classList.add('invalid');
                            } else {email_input.classList.add('invalid');}

                        } else if (error.data.error === "INTERNAL_SERVER_ERROR") {
                            console.log("error en el servidor")
                        } else {
                            console.log(error);
                        }
                    } else {
                        if (result) {
                            const new_auth = {sessionToken: result.token, sessionUser: result.user}
                            localStorage.setItem('auth', JSON.stringify(new_auth));
                            setAuth(new_auth);
                            setLogged(true);
                        } else {
                            console.log('ERR_PAGE::SERVER_INVALID_RESPONSE', result);
                        }
                    }
                });
            }
        } else if (screenMode === 'sign') {
            const email_input = document.getElementById('i_email');
            const name_input = document.getElementById('i_name');
            const lastname_input = document.getElementById('i_lastname');
            const birthdate_input = document.getElementById('i_birthdate');
            const password_input = document.getElementById('i_password');
            const again_password_input = document.getElementById('i_password_again');

            if (validate_entry(email_input, "email_space") && validate_entry(name_input, "name_space") && 
            validate_entry(lastname_input, "name_space") && validate_entry(password_input, "password_space") && 
            validate_entry(birthdate_input, "birthdate_space") && validate_entry(again_password_input, "password-again_space")) {
                request_register({ user_mail: email_input.value, user_pswd: password_input.value, user_name: name_input.value, user_lastname: lastname_input.value, user_birthdate: birthdate_input.value }, pictureFile, (error, result) => {
                    if (error) {
                        console.log(error)
                    } else {
                        if (result) {
                            const new_auth = {sessionToken: result.token, sessionUser: result.user}
                            localStorage.setItem('auth', JSON.stringify(new_auth));
                            setAuth(new_auth);
                            setLogged(true);
                        } else {
                            console.log('ERR_PAGE::SERVER_INVALID_RESPONSE', result);
                        }
                    }
                })
            }
        } else {
            console.log('nothing to do...')
        }
    }

    function handleTabs (button) {
        if (firstMOOD) {setFirstMOOD(false)}
        if (button === 1) {
            if (screenMode !== 'forgot') {
                setTimeout(() => {
                    setScreenObjectsFade(true);
                }, 1000);
                setTimeout(() => {
                    setScreenMode('login');
                }, 50);
            } else {
                console.log('nada')
            }
        } else if (button === 2) {
            setScreenObjectsFade(false);
            if (screenMode !== 'forgot') {
                setTimeout(() => {
                    setScreenMode('sign')
                }, 50);
            } else {
                setTimeout(() => {
                    setScreenMode('login')
                }, 50);
            }
        } else {
            setScreenObjectsFade(false);
            setTimeout(() => {
                setScreenMode('forgot')
            }, 50);
        }
    }

    function validate_entry(element, typeString, mode_pic=false) {
        console.log(`validando ${typeString}...`);
        const validations = {
            name_space: /^[a-zA-ZñÑ\s]+$/,
        }
        
        if (typeString === "password_space") { /* Manejo de contraseña principal */
            if (element.value < 8) {
                element.setCustomValidity('La contraseña debe ser de al menos 8 digitos');
                element.reportValidity();
                
                if (element.classList.contains('valid')) {
                    element.classList.remove('valid'); element.classList.add('invalid');
                } else {element.classList.add('invalid');}

                return false;  
            } else {
                element.setCustomValidity('');
                element.reportValidity();

                if (element.classList.contains('invalid')) {
                    element.classList.remove('invalid'); element.classList.add('valid');
                } else {element.classList.add('valid');}
                
                return true;    
            }
        } else if (typeString === "password-again_space") { /* Manejo de repeticion de contraseña */
            const main_pswd_value = document.getElementById('i_password').value;
            if (element.value !== main_pswd_value) {
                element.setCustomValidity('Las contraseñas no coinciden');
                element.reportValidity();
                
                if (element.classList.contains('valid')) {
                    element.classList.remove('valid'); element.classList.add('invalid');
                } else {element.classList.add('invalid');}

                return false; 
            } else {
                element.setCustomValidity('');
                element.reportValidity();

                if (element.classList.contains('invalid')) {
                    element.classList.remove('invalid'); element.classList.add('valid');
                } else {element.classList.add('valid');}
                
                return true; 
            }
        } else if (typeString === "birthdate_space") { /* Manejo de edad */
            const today = new Date();
            const birthdate = new Date(element.value);
            const age = today.getFullYear() - birthdate.getFullYear();
            
            if (age > 18 || (age === 18 && today.getMonth() > birthdate.getMonth()) || (age === 18 && today.getMonth() === birthdate.getMonth() && today.getDate() >= birthdate.getDate())) {
                element.setCustomValidity('');
                element.reportValidity();

                if (element.classList.contains('invalid')) {
                    element.classList.remove('invalid'); element.classList.add('valid');
                } else {element.classList.add('valid');}

                return true;
            } else {
                element.setCustomValidity('Edad insuficiente o invalida');
                element.reportValidity();
                
                if (element.classList.contains('valid')) {
                    element.classList.remove('valid'); element.classList.add('invalid');
                } else {element.classList.add('invalid');}

                return false;
            }
        } else if (typeString === "email_space") { /* Manejo de email */
            if (element.value.match(/^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/)) {
                if (!mode_pic) {
                    element.setCustomValidity('');
                    element.reportValidity();

                    if (element.classList.contains('invalid')) {
                        element.classList.remove('invalid'); element.classList.add('valid');
                    } else {element.classList.add('valid');}

                    return true;
                } else {
                    request_userPic(element.value, (error, result) => {
                        if (error) {
                            setUserPic("");
                            if (error.data.error === "ERR_WRONG_USER" && screenMode === 'sign') {
                                element.setCustomValidity('');
                                element.reportValidity();
        
                                if (element.classList.contains('invalid')) {
                                    element.classList.remove('invalid'); element.classList.add('valid');
                                } else {element.classList.add('valid');}
        
                                return true;
                            } else {
                                console.log(error);
                            }
                        } else {
                            if (result.data) {
                                setUserPic(result.data.url)
                                if (screenMode === 'sign' && result.data.url) {
                                    element.setCustomValidity('Esta cuenta ya existe!');
                                    element.reportValidity();
            
                                    if (element.classList.contains('valid')) {
                                        element.classList.remove('valid'); element.classList.add('invalid');
                                    } else {element.classList.add('invalid');}
            
                                    return false
                                } else {
                                    element.setCustomValidity('');
                                    element.reportValidity();
            
                                    if (element.classList.contains('invalid')) {
                                        element.classList.remove('invalid'); element.classList.add('valid');
                                    } else {element.classList.add('valid');}
            
                                    return true;
                                }
                            } else {
                                console.log('ERR_PAGE::SERVER_INVALID_RESPONSE', result);
                            }
                        }
                    });
                }
            } else {
                element.setCustomValidity('Formato invalido');
                element.reportValidity();
                
                if (element.classList.contains('valid')) {
                    element.classList.remove('valid'); element.classList.add('invalid');
                } else {element.classList.add('invalid');}

                if (userPic) {setUserPic('')}

                return false;
            }
        } else if (typeString === "file_space") {
            if (!element) {
                return false;
            } else if (!acceptedFileTypes.includes(element.type)) {
                console.log('Archivo no válido (tipo MIME)');
                return false;
            } else if (element.size > maxSize) {
                console.log('Archivo excede tamaño máximo');
                return false;
            } else {
                return true;
            }
        } else { /* Manejo de casos regex */
            if (element.value.match(validations[typeString])) {
                element.setCustomValidity('');
                element.reportValidity();

                if (element.classList.contains('invalid')) {
                    element.classList.remove('invalid'); element.classList.add('valid');
                } else {element.classList.add('valid');}

                return true;
            } else {
                element.setCustomValidity('Formato invalido');
                element.reportValidity();
                
                if (element.classList.contains('valid')) {
                    element.classList.remove('valid'); element.classList.add('invalid');
                } else {element.classList.add('invalid');}

                return false;
            }
        }
    }

    function auto_validation(event, typeString) {
        validate_entry(event.target, typeString, true)
    }

    function toggle_visibility(typeString) {
        if (typeString === "main") {
            if (mainPSWD_hidden) {
                setMainPSWD_hidden(false)
            } else {
                setMainPSWD_hidden(true)
            }
        } else {
            if (ensurePSWD_hidden) {
                setEnsurePSWD_hidden(false)
            } else {
                setEnsurePSWD_hidden(true)
            }
        }
    }

    return (
        <div className='auth__wrapper'>
            <header className='header__wrapper'>
                <Link className='button link_like' to='/'>
                    <svg className='icon'>
                        <use xlinkHref={svg_icons+'#icon-arrow'}></use>
                    </svg>
                    <p>Regresar a la pagina de inicio</p>
                </Link>
                <div className='logotype'>
                    <svg className='icon'>
                        <use xlinkHref={svg_icons+'#icon-logotype'}></use>
                    </svg>
                </div>
            </header>
            <div className='auth-form__wrapper'>
                <div className='avatar__wrapper'>
                    {screenMode === 'sign' ?
                    <div {...getRootProps()} className={`user_avatar dropzone ${isDragging ? 'dragging' : ''}`}>
                        <input {...getInputProps()} />
                        <LoginAvatar userPicture={tempUserPic} tempMode={true}/>
                        <svg className='icon add-icon'>
                            <use xlinkHref={svg_icons+'#icon-add-plus'}></use>
                        </svg>
                    </div> :
                    <LoginAvatar userPicture={userPic}/>
                    }
                </div>
                <div className='row__wrapper tabber'>
                    <button onClick={() => handleTabs(1)} className={`${screenMode === 'login' || screenMode === 'forgot' ? 'current' : ''}`}>{`${screenMode === 'forgot' ? 'Restablecer' : 'Iniciar sesion'}`}</button>
                    <button onClick={() => handleTabs(2)} className={`${screenMode === 'sign' ? 'current' : ''}`}>{`${screenMode === 'forgot' ? 'Regresar' : 'Crear cuenta'}`}</button>
                </div>
                <div className='row__wrapper'>
                    <label htmlFor='i_email'>Email</label>
                    <input id='i_email' type="text" onBlur={(e) => auto_validation(e, 'email_space')} autoComplete='email'/>
                </div>
                <div className={`row__wrapper double ${screenMode !== 'sign' ? 'transition' : ''} ${screenMode !== 'sign' && screenObjectsFade ? 'hidden' : ''}`}>
                    <div className='row__wrapper'>
                        <label htmlFor='i_name'>Nombre</label>
                        <input id='i_name' type="text" onBlur={(e) => auto_validation(e, 'name_space')} autoComplete='given-name'/>
                    </div>
                    <div className='row__wrapper'>
                        <label htmlFor='i_lastname'>Apellido</label>
                        <input id='i_lastname' type="text" onBlur={(e) => auto_validation(e, 'name_space')} autoComplete='family-name'/>
                    </div>
                </div>
                <div className={`row__wrapper ${screenMode !== 'sign' ? 'transition' : ''} ${screenMode !== 'sign' && screenObjectsFade ? 'hidden' : ''}`}>
                    <label htmlFor='i_birthdate'>Fecha de nacimiento</label>
                    <input id='i_birthdate' type="date" onBlur={(e) => auto_validation(e, 'birthdate_space')} autoComplete='bday'/>
                </div>
                <div className={`row__wrapper ${screenMode !== 'sign' && screenMode !== 'login' ? 'transition' : ''} ${screenMode !== 'sign' && screenMode !== 'login' && screenObjectsFade ? 'hidden' : ''}`}>
                    <label htmlFor='i_password'>Contraseña</label>
                    <input className={`${mainPSWD_hidden ? 'hidden' : 'un_hidden'}`} id='i_password' onKeyDown={(e) => handleKeyDown(e)} type="text" onBlur={(e) => auto_validation(e, 'password_space')} autoComplete='current-password'/>
                    <button className='button toggle_hidden' onClick={()=> toggle_visibility('main')}>
                        <svg className='icon'>
                            <use xlinkHref={svg_icons+`${mainPSWD_hidden ? '#icon-eye-open' : '#icon-eye-close'}`}></use>
                        </svg>
                    </button>
                </div>
                <div className={`row__wrapper ${screenMode !== 'sign' ? 'transition' : ''} ${screenMode !== 'sign' && screenObjectsFade ? 'hidden' : ''}`}>
                    <label htmlFor='i_password_again'>Repetir contraseña</label>
                    <input className={`${ensurePSWD_hidden ? 'hidden' : 'un_hidden'}`} id='i_password_again' type="text" onBlur={(e) => auto_validation(e, 'password-again_space')} autoComplete='new-password'/>
                    <button className='button toggle_hidden' onClick={()=> toggle_visibility('second')}>
                        <svg className='icon'>
                            <use xlinkHref={svg_icons+`${ensurePSWD_hidden ? '#icon-eye-open' : '#icon-eye-close'}`}></use>
                        </svg>
                    </button>
                </div>
                <div className='row__wrapper submit'>
                    <button onClick={sendData} className='button submit'>Validar</button>
                    <button className={`button link_like ${screenMode !== 'login' ? 'transition' : ''}`} onClick={() => handleTabs(3)}>Olvidaste tu contraseña?</button>
                </div>
            </div>
        </div>
    )
};