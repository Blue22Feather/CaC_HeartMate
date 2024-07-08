/*----- Importaciones y dependencias -----*/
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../scripts/app_context';
import { Link } from 'react-router-dom';

import { request_all_userData } from '../../scripts/server_com';

/*----- Recursos multimedia -----*/
import svg_icons from '../../icons/svg-resources.xml';

/*----- Componentes locales -----*/
const UserCard = ({input_userData, input_host}) => {
    if (input_userData) {
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        const raw_date = new Date(input_userData.birthdate)

        input_userData.birthdate = `${raw_date.getDate().toString().padStart(2, '0')} de ${months[raw_date.getMonth()]} del ${raw_date.getFullYear()}`;
    }
    return (
        <div data-id={input_userData.user_id} className='user-card__wrapper'>
            <div className='user-interaction-top__wrapper'>
                <button className='button left'>
                    <svg className='icon'>
                        <use xlinkHref={svg_icons+'#icon-heart-add'}></use>
                    </svg>
                </button>
                <button className='button right'>
                    <svg className='icon'>
                        <use xlinkHref={svg_icons+'#icon-heart-deny'}></use>
                    </svg>
                </button>
            </div>
            <div className='user-deco__wrapper'>
                <div className='user-background'>
                    {input_userData.bg_url ?
                        <img src={input_host + input_userData.bg_url} alt="custom-background" /> :
                        <img src={process.env.PUBLIC_URL + '/assets/imgs/loading_background.jpg'} alt="default-background" />
                    }
                </div>
                <Link to={`/app/profile/${input_userData.user_url}`} className='user-picture'>
                    {input_userData.profilePic_url ?
                        <img src={input_host + input_userData.profilePic_url} alt="custom-avatar" /> :
                        <svg className='icon'>
                            <use xlinkHref={svg_icons+'#icon-empty-user'}></use>
                        </svg>
                    }
                </Link>
            </div>
            <div className='user-info__wrapper'>
                <Link to={`/app/profile/${input_userData.user_url}`} className='button header_like'>{`${input_userData.name} ${input_userData.lastName}`}</Link>
                <p className='centered'>HeartPoints: {input_userData.heart_points}</p>
                {input_userData.phrase ? 
                    <p>{input_userData.phrase}</p> :
                    <p>Fecha de nacimiento: {input_userData.birthdate}</p>
                }
            </div>
            <div className='user-interaction__wrapper'>
                <Link to={`/app/profile/${input_userData.user_url}`} className='button interaction-option'>
                    <svg className='icon'>
                        <use xlinkHref={svg_icons+'#icon-heart-paper'}></use>
                    </svg>
                    <p>Perfil</p>
                </Link>
                <button className='button interaction-option secundary'>
                    <svg className='icon'>
                        <use xlinkHref={svg_icons+'#icon-chat'}></use>
                    </svg>
                    <p>Mensaje</p>
                </button>
            </div>
        </div>
    );
}

/*----- Componente central -----*/
export const ExplorePanel = () => {
    const { auth, userData, commonHost } = useContext(AppContext);
    const [ allUsers, setAllUsers ] = useState(null);

    useEffect(() => {
        if (auth) {
            if (!allUsers) {
                console.warn("allUsers vacio, solicitando...")
                request_all_userData(auth, (error, result) => {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log("resultado de la peticion:")
                        console.log(result)
                        setAllUsers(result)
                    }
                });
            }
        } else {
            console.warn("aun no carga el auth");
        }
    }, [auth, allUsers, setAllUsers]);

    const RenderCards = () => {
        const elements = [];
        if (allUsers) {
            allUsers.forEach((data, index) => {
                const ExistingElement = elements.find(element => element.key === `card-${data.user_id}`);
                if (data.user_id !== userData.user_id && !ExistingElement) {
                    elements.push(<UserCard key={`card-${data.user_id}`} input_userData={data} input_host={commonHost}/>)
                }
            });
        } else {
            elements.push(<h2>sin datos...</h2>)
        }
        
        return elements;
    }

    return(
        <div className='screen__wrapper'>
            <div className='explore__content'>
                <RenderCards />
            </div>
        </div>
    );
}