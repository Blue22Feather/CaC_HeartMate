/*----- Importaciones y dependencias -----*/
import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom'
import { AppContext } from '../../scripts/app_context';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

import { request_userPosts, request_ProfileData, create_newPost, request_publicationComments, request_set_vote, create_newComment } from '../../scripts/server_com';

/*----- Recursos multimedia -----*/
import svg_icons from '../../icons/svg-resources.xml';

/*----- Funciones Generales -----*/
function formatedDate(dateString){
    const raw_date = new Date(dateString);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const formated_date = `${raw_date.getDate().toString().padStart(2, '0')} de ${months[raw_date.getMonth()]} del ${raw_date.getFullYear()} • ${raw_date.getHours()}:${raw_date.getMinutes().toString().padStart(2, '0')}`;

    return formated_date
}

function files_validation (element, picturesList) {
    const acceptedFileTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (picturesList.length > 9) {
        console.log('maximo 9 archivos'); return false;
    } else {
        if (!element) {return false;} 
        else if (!acceptedFileTypes.includes(element.type)) {console.log('Archivo no válido (tipo MIME)'); return false;} 
        else if (element.size > maxSize) {console.log('Archivo excede tamaño máximo'); return false;}
        else {return true;}
    }
}

/*----- Componentes Auxiliares -----*/
const TagsHandler = ({input_tags, fullMode=false}) => {
    let local_elements = [];
    if (!fullMode) {
        input_tags.forEach((data, index) => {
            const localExisting_element = local_elements.find(element => element.key === index);
            if (!localExisting_element) {
                if (local_elements.length < 3 ) {
                    local_elements.push(
                        <div key={index} className='tagLabel'><p>#{data}</p></div>
                    )
                } else if (local_elements.length < 4 && input_tags.length >= 4) {
                    local_elements.push(
                        <div key={4} className='tagLabel'><p>{`+${input_tags.length - 3}`}</p></div>
                    )
                }
            }
        });
    } else {
        input_tags.forEach((data, index) => {
            const localExisting_element = local_elements.find(element => element.key === index);
            if (!localExisting_element) {
                local_elements.push(
                    <div key={index} className='tagLabel'><p>#{data}</p></div>
                )
            }
        });
    }

    return local_elements;
}

const PointsHandler = ({postsInfo_setter, input_points, input_id, input_userURL, authen_info }) => {
    function handle_votes (vote_type) {
        request_set_vote(authen_info, vote_type, input_userURL, input_id, (error, result) => {
            if (error) {
                console.log(error)
            } else {
                postsInfo_setter(prevDatos => {
                    if (Array.isArray(prevDatos)) {
                        const nuevosDatos = [...prevDatos];
                        const index = nuevosDatos.findIndex(objeto => objeto.id === input_id);
                        
                        if (index !== -1) {
                            const objeto = nuevosDatos[index];
                            const nuevoObjeto = {
                                ...objeto,
                                points: {
                                    total: result.total, // Puedes cambiar esto por result.total si es necesario
                                    current_user: result.current_user
                                }
                            };

                            nuevosDatos[index] = nuevoObjeto; // Reemplazar el objeto en la lista
                        }

                        return nuevosDatos;
                    } else if (typeof prevDatos === 'object' && !Array.isArray(prevDatos)) {
                        const nuevosDatos = {
                            ...prevDatos,
                            points: {
                                total: result.total,
                                current_user: result.current_user
                            }
                        }
                
                        return nuevosDatos;
                    } else {
                        return prevDatos;
                    }
                });
            }
        });
    }

    return (
        <>
            <button onClick={() => handle_votes("true")} className={`button iconed ${input_points.current_user === "true" ? 'voted' : ''}`}>
                <svg className='icon'>
                    <use xlinkHref={svg_icons+'#icon-pointer'}></use>
                </svg>
            </button>
            <p>{input_points.total}</p>
            <button onClick={() => handle_votes("false")} className={`button iconed down ${input_points.current_user === "false" ? 'voted' : ''}`}>
                <svg className='icon'>
                    <use xlinkHref={svg_icons+'#icon-pointer'}></use>
                </svg>
            </button>
        </>
    )
}

const PublicationCommentsHandler = ({ input_postDataBasis, postsInfo_setter }) => {
    const { auth, commonHost } = useContext(AppContext);
    const inputCommentRef = useRef(null);

    const [ LocalData, setLocalData ] = useState(null);

    const [ localElements, setLocalElements ] = useState([]);
    const [ requesting, setRequesting ] = useState(false);

    /* Manejo de imagen */
    const [ pictureFiles, setPictureFiles ] = useState([]);
    const [ tempPictures, setTempPictures ] = useState([]);

    const onDrop = useCallback(Files => {
        Files.forEach((file, index) => {
            if (files_validation(file, pictureFiles)) {
                const fileURL = URL.createObjectURL(file);
                setTempPictures(prevLista => prevLista.concat(fileURL));
                setPictureFiles(prevLista => prevLista.concat(file));
            } else {
                console.log("validacion pasada, resultado erroneo")
            }  
        });
    }, []);

    const { getRootProps, getInputProps } = useDropzone({onDrop});

    useEffect(() => {
        if (input_postDataBasis.id && !requesting && !LocalData) {
            console.warn(`[PublicationCommentsHandler]:: Solicitando comentarios`);
            setRequesting(true);
            request_publicationComments(auth, input_postDataBasis.url, input_postDataBasis.id, (error, result) => {
                if (error) {
                    console.warn(error);
                } else {
                    setLocalData(result);
                    setRequesting(false);
                }
            });
        } else {
            console.warn(`[PublicationCommentsHandler]:: cargando entrada...`);
        }
    }, [input_postDataBasis]);

    useEffect(() => {
        if (LocalData) {
            if (localElements.find(element => element.key === 'null-banner')) {setLocalElements([])}

            LocalData.forEach((data, index) => {
                const localExisting_elementIndex = localElements.findIndex(element => element.key === `comment-${data.id}`);

                if (localExisting_elementIndex !== -1) {
                    setLocalElements(prevLista => {
                        const updatedElements = [...prevLista];
                        updatedElements[localExisting_elementIndex] = <CommentElement key={`comment-${data.id}`} input_commentData={data}/>;
                        return updatedElements;
                    });
                } else {
                    setLocalElements(prevLista => prevLista.concat(<CommentElement key={`comment-${data.id}`} input_commentData={data}/>));
                }
            });
        } else {
            setLocalElements([
                <div key={`null-banner`} className='empty-msg'>
                    <svg className='icon'>
                        <use xlinkHref={svg_icons+'#icon-bad-list'}></use>
                    </svg>
                    <h2>Se el primero en comentar!</h2>
                </div>
            ]);
        }
    }, [LocalData])

    const CommentElement = ({ input_commentData }) => {
        return (
            <div data-id={input_commentData.id} className='message__wrapper forum-style'>
                <div className='user-avatar msg-style'>
                    {input_commentData.author_pic ?
                    <img src={commonHost+input_commentData.author_pic} alt="user_pic" /> :
                    <svg className='icon'>
                        <use xlinkHref={svg_icons+'#icon-empty-user'}></use>
                    </svg>}
                </div>
                <div className='msg-metadata__wrapper'>
                    <h3>{input_commentData.author}</h3>
                    <p>{formatedDate(input_commentData.createdDate)}</p>
                </div>
                <div className='msg-content__wrapper'>
                    {input_commentData.content ? <section>{input_commentData.content}</section> : ''}
                    {input_commentData.media ? <section>{input_commentData.media}</section> : ''}
                </div>
            </div>
        );
    }

    function handleKeyDown (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            saveComment();
        } else if (event.key === 'Backspace' && inputCommentRef.current.innerText.length === 1) {
            inputCommentRef.current.innerText = null;
        }
    }

    function saveComment() {
        if ((inputCommentRef.current.innerText && inputCommentRef.current.innerText !== "\n") || pictureFiles.length > 0) {
            let local_media;
            if (pictureFiles.length > 0) {local_media = pictureFiles} else {local_media = null}

            let local_content;
            if (inputCommentRef.current.innerText === "\n") {local_content = null} else {local_content = inputCommentRef.current.innerText}

            create_newComment(auth, local_content, local_media, input_postDataBasis.url, input_postDataBasis.id, (error, result) => {
                if (error) {
                    console.log(error)
                } else {
                    console.log(result)
                    if (!LocalData) {setLocalData([])}
                    setLocalData(prevLista => prevLista.concat(result.newComment))
                    postsInfo_setter(prevDatos => {const nuevosDatos = {...prevDatos, n_comments: input_postDataBasis.n_comments + 1}; return nuevosDatos;});
                    inputCommentRef.current.innerText = null;
                    setPictureFiles([]);
                    setTempPictures([]);
                }
            });
        }
        else {
            console.error("contenidos vacios")
        }
    }

    return (
        <div className='publication__comments'>
            <div className='comments__wrapper'>
                {localElements}
            </div>
            <div className='message-entry__wrapper'>
                <div className='button iconed'>
                    <svg className='icon'>
                        <use xlinkHref={svg_icons+'#icon-clip'}></use>
                    </svg>
                </div>
                <div className='entry__wrapper'>
                    <div ref={inputCommentRef}  className='entry__content' role="textbox" onKeyDown={(e) => handleKeyDown(e)} contentEditable="true"></div>
                    <button className='button iconed'>
                        <svg className='icon'>
                            <use xlinkHref={svg_icons+'#icon-kiss'}></use>
                        </svg>
                    </button>
                </div>
                <button className='button iconed' onClick={saveComment}>
                    <svg className='icon'>
                        <use xlinkHref={svg_icons+'#icon-send'}></use>
                    </svg>
                </button>
            </div>
        </div>
    )
}

/*----- Componentes locales -----*/
const SidePublicationViewer = ({publicationInfo, setPublicationInfo, setter_visibility, profileURL}) => {
    const { commonHost, auth } = useContext(AppContext);

    useEffect(() => {
        console.warn("[SidePublicationViewer]::", publicationInfo !== null);
        if (publicationInfo) {setter_visibility(true);}
    }, [publicationInfo])

    function close_handler () {
        setter_visibility(false);
        setTimeout(() => {
            setPublicationInfo(null);
        }, 1000);
    }

    if (publicationInfo) {
        return (
            <div className={`publication-viewer__wrapper `}>
                <div className='publication__content'>
                    <PublicationCommentsHandler input_postDataBasis={{url: profileURL, id: publicationInfo.id, n_comments: publicationInfo.n_comments}} postsInfo_setter={setPublicationInfo} />
                    <div className='publication__contents'>
                        <div className='content__header'>
                            <div className='content__author'>
                                <div className='user-avatar publication-style'>
                                    {publicationInfo.author_pic ?
                                        <img src={commonHost+publicationInfo.author_pic} alt="user_pic" /> :
                                        <svg className='icon'>
                                            <use xlinkHref={svg_icons+'#icon-empty-user'}></use>
                                        </svg>
                                    }
                                </div>
                                <p className='author-label'>{publicationInfo.author}</p>
                            </div>
                            <div className='content__title'>
                                <h2>{publicationInfo.title}</h2>
                            </div>
                            <div className='content__tags'>
                                <TagsHandler input_tags={publicationInfo.tags} fullMode={true}/>
                            </div>
                        </div>
                        <hr className='separator full-horizontal'/>
                        <div className='content__text'>
                            {publicationInfo.content ?
                            publicationInfo.content.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            )): ''}
                        </div>
                        <div className='content__media'>
                            {publicationInfo.media ? 
                            publicationInfo.media.map((image, index) => (
                                <img src={commonHost+image} alt={`Publication media ${index}`}/>
                            )) : ''}
                        </div>
                        <div className='content__footer'>
                            <div className='points-section'>
                                <PointsHandler authen_info={auth} postsInfo_setter={setPublicationInfo} input_points={publicationInfo.points} input_id={publicationInfo.id} input_userURL={profileURL}/>
                            </div>
                        </div>
                    </div>
                    <div className='publication__header'>
                        <div className='publication_title'>
                            <h3>{publicationInfo.title}</h3>
                            <hr className='separator full-vertical' />
                            <p>{publicationInfo.createdDate}</p>
                        </div>
                        <div className='publication_options'>
                            <button className='button iconed' onClick={close_handler}>
                                <svg className='icon'>
                                    <use xlinkHref={svg_icons+'#icon-cross'}></use>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const PublicationsSection = ({ currentUserURL, setter_currentPost, getter_currentPost }) => {
    const [ galleryElements, setGalleryElements ] = useState([]);
    const [ listElements, setListElements ] = useState([]);
    const [ galleryMode, setGalleryMode ] = useState(true);
    const { commonHost, auth, userData, localCounter } = useContext(AppContext);
    const [ localLoading, setLocalLoading ] = useState(true);
    const [ modeCreator, setModeCreator ] = useState(false);
    const [ blockedCreator, setBlockedCreator ] = useState(false);
    const [ postsInfo, setPostsInfo ] = useState(null);

    const inputTagRef = useRef(null);
    const inputTitleRef = useRef(null);
    const inputContentRef = useRef(null);

    const [ currentTags, setCurrentTags ] = useState([]);

    const [ currentFilter, setCurrentFilter ] = useState('');

    /* Manejo de imagen */
    const [ pictureFiles, setPictureFiles ] = useState([]);
    const [ tempPictures, setTempPictures ] = useState([]);

    const onDrop = useCallback(Files => {
        Files.forEach((file, index) => {
            if (files_validation(file, pictureFiles)) {
                const fileURL = URL.createObjectURL(file);
                setTempPictures(prevLista => prevLista.concat(fileURL));
                setPictureFiles(prevLista => prevLista.concat(file));
            } else {
                console.log("validacion pasada, resultado erroneo")
            }  
        });
    }, []);

    const { getRootProps, getInputProps } = useDropzone({onDrop});

    useEffect(() => {
        if (!localLoading) {setLocalLoading(true)}
        if (auth) {
            request_userPosts(auth, currentUserURL, (error, result) => {
                if (error) {
                    if (error.data.error === "NULL_POSTS") {
                        setGalleryElements([
                            <div key={`null-banner`} className='empty-msg'>
                                <svg className='icon'>
                                    <use xlinkHref={svg_icons+'#icon-bad-list'}></use>
                                </svg>
                                <h2>No hay publicaciones en este perfil</h2>
                            </div>
                        ]);
                        setListElements([
                            <div key={`null-banner`} className='empty-msg'>
                                <svg className='icon'>
                                    <use xlinkHref={svg_icons+'#icon-bad-list'}></use>
                                </svg>
                                <h2>No hay publicaciones en este perfil</h2>
                            </div>
                        ]);
                        setLocalLoading(false);
                    } else {console.error(error);}
                } else {
                    setPostsInfo(result.reverse())
                }
            });
        } else {
            console.warn("[PublicationsSection]:: Aun no carga el auth...")
        }
    }, [auth, currentUserURL]);

    useEffect(() => {
        if (postsInfo && getter_currentPost) {
            const index = postsInfo.findIndex(objeto => objeto.id === getter_currentPost.id);
            if (postsInfo[index] !== getter_currentPost) {
                if (index !== -1) {
                    const nuevosDatos = postsInfo;
                    nuevosDatos[index] = getter_currentPost;
                    setPostsInfo(nuevosDatos);
                    cards_creator(nuevosDatos);
                } else {
                    console.error(`[PublicationsSection]:: postInfo no tiene un objeto que concuerde con currentPost`)
                }
            } else {
                console.warn(`[PublicationsSection]:: postsInfo == currentPost`)
            }
        } else {
            console.warn(`[PublicationsSection - LocalUpdater]:: aun no hay informacion de posts`);
        }
    }, [getter_currentPost, postsInfo]);

    useEffect(() => {cards_creator(postsInfo)}, [postsInfo]);

    useEffect(() => {
        if (userData.user_url) {
            if (userData.user_url === currentUserURL) {
                setBlockedCreator(false);
            } else {
                setBlockedCreator(true)
            }
        }
    }, [currentUserURL, userData])

    function cards_creator (entry_info_list) {
        if (entry_info_list) {
            console.warn("informacion actual de post:", entry_info_list);
            if (galleryElements.find(element => element.key === 'null-banner')) {setGalleryElements([])}
            if (listElements.find(element => element.key === 'null-banner')) {setListElements([])}

            entry_info_list.forEach((data, index) => {
                const galleryIndex = galleryElements.findIndex(element => element.key === `card-gallery-${data.id}`);
                const listIndex = listElements.findIndex(element => element.key === `card-list-${data.id}`);
    
                if (galleryIndex !== -1) {
                    setGalleryElements(prevLista => {
                        const updatedGalleryElements = [...prevLista];
                        updatedGalleryElements[galleryIndex] = <GalleryView key={`card-gallery-${data.id}`} input_post={data} input_host={commonHost}/>;
                        return updatedGalleryElements;
                    });
                } else {
                    setGalleryElements(prevLista => prevLista.concat(<GalleryView key={`card-gallery-${data.id}`} input_post={data} input_host={commonHost}/>));
                }
    
                if (listIndex !== -1) {
                    setListElements(prevLista => {
                        const updatedListElements = [...prevLista];
                        updatedListElements[listIndex] = <ListView key={`card-list-${data.id}`} input_post={data} input_host={commonHost}/>;
                        return updatedListElements;
                    });
                } else {
                    setListElements(prevLista => prevLista.concat(<ListView key={`card-list-${data.id}`} input_post={data} input_host={commonHost}/>));
                }
            });
            setLocalLoading(false);
        } else {
            console.error("no hay postInfo para generar las tarjetas");
        }
    }

    const ListView = ({ input_post, input_host }) => {
        return (
            <div onClick={() => setter_currentPost(input_post.id)} data-id={input_post.id} className='card__wrapper'>
                <div className='card__content'>
                    <div className='card__header'>
                        <div className='post_tags'>
                            <TagsHandler input_tags={input_post.tags}/>
                        </div>
                        <h3 className='post_title'>{input_post.title}</h3>
                    </div>
                    <div className='card__postBody'>
                        <div className='post_content'>
                            <div className='post_author'>
                                <p>{input_post.author}:</p>
                            </div>
                            <div className='post_content-text'>
                                <p>{input_post.content}</p>
                            </div>
                        </div>
                    </div>
                    <div className='card__footer'>
                        <div className='post_points'>
                            <PointsHandler postsInfo_setter={setPostsInfo} authen_info={auth} input_points={input_post.points} input_id={input_post.id} input_userURL={currentUserURL}/>
                        </div>
                        <div className='post_comments-number'>
                            <svg className='icon'>
                                <use xlinkHref={svg_icons+'#icon-comment'}></use>
                            </svg>
                            <p>{input_post.n_comments}</p>
                        </div>
                        <div className='post_date'><p>{formatedDate(input_post.createdDate)}</p></div>
                    </div>
                </div>
                {input_post.media ?
                    <div className='card__media'>
                        <img src={input_host+input_post.media[0]} alt="Publication main media"/>
                    </div> : ''
                }
            </div>
        )
    }

    const GalleryView = ({ input_post, input_host }) => {
        const [ LocalData, setLocalData ] = useState(null);

        useEffect(() => {
            if (input_post) {setLocalData(input_post)} else {console.error("[GalleryCard]:: input_post no tiene nada")}
        }, [input_post]);

        const PicturesHandler = ({input_images}) => {
            let local_elements = [];

            input_images.forEach((data, index) => {
                const localExisting_element = local_elements.find(element => element.key === index);
                if (!localExisting_element) {
                    if (local_elements.length < 4) {
                        if (input_images.length === 1) {
                            local_elements.push(
                                <div key={index} className='imageSection full-column full-row'>
                                    <img src={input_host+data} alt={`Publication media ${1}`}/>
                                </div>
                            )
                        } else if (input_images.length === 2) {
                            local_elements.push(
                                <div key={index} className='imageSection full-column'>
                                    <img src={input_host+data} alt={`Publication media ${index}`}/>
                                </div>
                            )
                        } else if (input_images.length === 3) {
                            if (index === 0) {
                                local_elements.push(
                                    <div key={index} className='imageSection full-column'>
                                        <img src={input_host+data} alt={`Publication media ${index}`}/>
                                    </div>
                                )  
                            } else {
                                local_elements.push(
                                    <div key={index} className='imageSection'>
                                        <img src={input_host+data} alt={`Publication media ${index}`}/>
                                    </div>
                                )    
                            }
                        } else {
                            local_elements.push(
                                <div key={index} className='imageSection'>
                                    <img src={input_host+data} alt={`Publication media ${index}`}/>
                                </div>
                            ) 
                        }
                    }
                }
            });
            return local_elements;
        }

        if (LocalData) {
            return (
                <div data-id={LocalData.id} className='card__wrapper'>
                    <div onClick={() => setter_currentPost(LocalData)} className='card__header'>
                        <section>
                            <div className='post_author'><p>{LocalData.author}</p></div>
                            <p className='post_date'>{formatedDate(LocalData.createdDate)}</p>
                        </section>
                        <h3 className='post_title'>{LocalData.title}</h3>
                    </div>
                    <div onClick={() => setter_currentPost(LocalData)} className='card__postBody'>
                        {LocalData.media ?
                            <div className='body-media'><PicturesHandler input_images={LocalData.media}/></div>:
                            <div className='post_content-text'>
                                {LocalData.content.map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        }
                        <div className='post_tags'>
                            <TagsHandler input_tags={LocalData.tags}/>
                        </div>
                    </div>
                    <div className='card__footer'>
                        <div className='post_comments-number'>
                            <svg className='icon'>
                                <use xlinkHref={svg_icons+'#icon-comment'}></use>
                            </svg>
                            <p>{LocalData.n_comments}</p>
                        </div>
                        <div className='post_points'>
                            <PointsHandler postsInfo_setter={setPostsInfo} authen_info={auth} input_points={LocalData.points} input_id={LocalData.id} input_userURL={currentUserURL}/>
                        </div>
                    </div>
                </div>
            );
        }
    }

    const TempMediaViewer = ({input_media}) => {
        let local_elements = [];

        function delete_temp_file (index_file) {
            const newLocal_elements = local_elements.filter((value, index, arr) => {return index !== index_file});
            local_elements = newLocal_elements;

            const newPicturesFiles = pictureFiles.filter((value, index, arr) => {return index !== index_file});
            setPictureFiles(newPicturesFiles)

            const newTempPictures = tempPictures.filter((value, index, arr) => {return index !== index_file});
            setTempPictures(newTempPictures);
        }

        input_media.forEach((data, index) => {
            local_elements.push(
                <div data-id={`button-for-media-${index}`} key={index} className='imagePreview'>
                    <button className='button iconed' onClick={() => delete_temp_file(index)}>
                        <svg className='icon'>
                            <use xlinkHref={svg_icons+'#icon-discard'}></use>
                        </svg>
                    </button>
                    <img src={data} alt={`Temporal media ${index}`}/>
                </div>
            );
        });
        return local_elements;
    }

    const PostHandler = () => {
        if (localLoading) {
            return <h2>Cargando...</h2>
        } else {
            if (galleryMode) {
                if (currentFilter) {
                    if (galleryElements.length > 0 && !galleryElements.find(element => element.key === 'null-banner')) {
                        const result = galleryElements.filter((tarjeta) => tarjeta.props.input_post.title.toLowerCase().includes(currentFilter.toLowerCase()))
                        if (result.length > 0) {return result}
                        else {return (
                            <div className='empty-msg'>
                                <svg className='icon'>
                                    <use xlinkHref={svg_icons+'#icon-binocular'}></use>
                                </svg>
                                <h2>No hay publicaciones que coincidan</h2>
                            </div>
                            )
                        }
                    } else {return (
                        <div className='empty-msg'>
                            <svg className='icon'>
                                <use xlinkHref={svg_icons+'#icon-binocular'}></use>
                            </svg>
                            <h2>No hay publicaciones aqui para buscar...</h2>
                        </div>
                        )
                    }

                } else {return galleryElements}
            } else {
                if (currentFilter) {
                    if (listElements.length > 0 && !listElements.find(element => element.key === 'null-banner')) {
                        const result = listElements.filter((tarjeta) => tarjeta.props.input_post.title.toLowerCase().includes(currentFilter.toLowerCase()))
                        if (result.length > 0) {return result}
                        else {return (
                            <div className='empty-msg'>
                                <svg className='icon'>
                                    <use xlinkHref={svg_icons+'#icon-binocular'}></use>
                                </svg>
                                <h2>No hay publicaciones que coincidan</h2>
                            </div>
                            )
                        }
                    } else {return (
                        <div className='empty-msg'>
                            <svg className='icon'>
                                <use xlinkHref={svg_icons+'#icon-binocular'}></use>
                            </svg>
                            <h2>No hay publicaciones aqui para buscar...</h2>
                        </div>
                        )
                    }
                } else {return listElements}
            }
        }
    }

    function handleKeyDown (event, mode="msg") {
        if (mode === "msg") {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                //const message = event.target.innerText;
                //console.log(message)
                save_newPost();
            } else if (event.key === 'Backspace' && event.target.innerText.length === 1) {
                event.target.innerText = null;
            }
        } else if (mode === "tag") {
            if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                const raw_tags = event.target.value.split(' ');
                raw_tags.forEach(tag => {
                    if (!currentTags.includes(tag) && currentTags.length < 9) {setCurrentTags(prevLista => prevLista.concat(tag));}
                    else if (!currentTags.length < 9) {console.warn("maximo 9 etiquetas!")}
                });
                event.target.value = '';
            } else if (event.key === 'Backspace' && !event.shiftKey) {
                setCurrentTags(prevLista => prevLista.slice(0, -1))
            }
        }
    };

    function save_newPost () {
        if (inputTitleRef.current.value) {
            if (currentTags.length > 0) {
                if ((inputContentRef.current.innerText && inputContentRef.current.innerText !== "\n") || pictureFiles.length > 0) {
                    let local_media;
                    if (pictureFiles.length > 0) {local_media = pictureFiles} else {local_media = null}

                    let local_content;
                    if (inputContentRef.current.innerText === "\n") {local_content = null} else {local_content = inputContentRef.current.innerText}

                    let local_tags = currentTags.join(",");

                    create_newPost(auth, {
                        title: inputTitleRef.current.value,
                        content: local_content,
                        tags: local_tags
                    }, local_media, userData.user_url, (error, result) => {
                        if (error) {
                            console.log(error)
                        } else {
                            inputContentRef.current.innerText = null;
                            inputTitleRef.current.value = null;
                            setCurrentTags([]);
                            setPictureFiles([]);
                            setTempPictures([]);
                            setModeCreator(false);
                        }
                    });
                }
                else {
                    console.error("contenidos vacios")
                }
            } else {
                console.error("etiquetas vacias")
            }

        } else {
            console.error("titulo vacio")
        }
    }

    return (
        <div className='publications__wrapper'>
            <div className='publications__content'>
                <div className='header'>
                    <div className={`post-interaction ${modeCreator && currentUserURL === userData.user_url ? 'create' : 'search'}`}>
                        <button className='button iconed' onClick={() => setModeCreator(false)}>
                            <svg className='icon'>
                                <use xlinkHref={`${svg_icons}` + `${modeCreator ? '#icon-cross' : '#icon-search'}`}></use>
                            </svg>
                        </button>
                        {modeCreator && currentUserURL === userData.user_url ?
                            <input ref={inputTitleRef} className='title_mod' type='text' maxLength={100} placeholder='titulo a crear' />:
                            <input onChange={(e) => setCurrentFilter(e.target.value)} className='title_mod' type='text' maxLength={100} placeholder='titulo a buscar' />
                        }
                        {modeCreator && currentUserURL === userData.user_url ?
                        <div className='post-content__wrapper'>
                            <div ref={inputContentRef} className='post-content__content' role="textbox" onKeyDown={(e) => handleKeyDown(e)} contentEditable="true"></div>
                        </div> : ''}
                        {modeCreator && currentUserURL === userData.user_url ?
                        <div className='add-media__wrapper'>
                            <div {...getRootProps()} className='dropzone'>
                                <svg className='icon'>
                                    <use xlinkHref={svg_icons+'#icon-add-photo'}></use>
                                </svg>
                                <input {...getInputProps()} />
                            </div>
                            <div className='add-media__contens'>
                                <TempMediaViewer input_media={tempPictures} />
                            </div>
                        </div>: ''}
                        {modeCreator && currentUserURL === userData.user_url ?
                        <div className='add-emogy__wrapper'>
                            <svg className='icon'>
                                <use xlinkHref={svg_icons+'#icon-kiss'}></use>
                            </svg>
                        </div>: ''}
                        {modeCreator && currentUserURL === userData.user_url ? <hr className='separator full-horizontal'/> : ''}
                        {modeCreator && currentUserURL === userData.user_url ?
                        <div onClick={() => inputTagRef.current.focus()} className='add-tags__wrapper'>
                            <svg className='icon'>
                                <use xlinkHref={svg_icons+'#icon-tag'}></use>
                            </svg>
                            <hr className='separator bullet'/>
                            <div className='add-tags'>
                                <TagsHandler input_tags={currentTags} fullMode={true}/>
                                <input ref={inputTagRef} type="text" onKeyDown={(e) => handleKeyDown(e, "tag")} />
                            </div>
                        </div>: ''}
                        <button disabled={blockedCreator} className='button interaction-option' onClick={modeCreator ? () => save_newPost() : () => setModeCreator(true)}>
                            <svg className='icon'>
                                <use xlinkHref={svg_icons+'#icon-edit'}></use>
                            </svg>
                            <p>Nueva publicacion</p>
                        </button>
                    </div>
                    <div className='posts-filter'>
                        <div className='button-dropdown'>
                            <div className='button-dropdown__toggler'>
                                {galleryMode ?
                                    <div>
                                        <svg className='icon'>
                                            <use xlinkHref={svg_icons+'#icon-gallery-view'}></use>
                                        </svg>
                                        <span>Vista de galeria</span>
                                        <svg className='icon arrow'>
                                            <use xlinkHref={svg_icons+'#icon-arrow'}></use>
                                        </svg>
                                    </div> :
                                    <div>
                                        <svg className='icon'>
                                            <use xlinkHref={svg_icons+'#icon-list-view'}></use>
                                        </svg>
                                        <span>Vista de Lista</span>
                                        <svg className='icon arrow'>
                                            <use xlinkHref={svg_icons+'#icon-arrow'}></use>
                                        </svg>
                                    </div>
                                }
                            </div>
                            <div className='button-dropdown__content'>
                                <button className='option' onClick={() => setGalleryMode(true)}>
                                    <svg className='icon'>
                                        <use xlinkHref={svg_icons+'#icon-gallery-view'}></use>
                                    </svg>
                                    <span>Vista de galeria</span>
                                </button>
                                <button className='option' onClick={() => setGalleryMode(false)}>
                                    <svg className='icon'>
                                        <use xlinkHref={svg_icons+'#icon-list-view'}></use>
                                    </svg>
                                    <span>Vista de Lista</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`publications ${galleryMode ? 'gallery' : 'list'}`}>
                    <PostHandler />
                </div>
            </div>
        </div>
    );
}

const InformationSection = () => {
    return(
        <div className='publications__wrapper'>INFORMATION</div>
    );
}

const GallerySection = () => {
    return(
        <div className='publications__wrapper'>GALLERY</div>
    );
}

const CollectionsSection = () => {
    return(
        <div className='publications__wrapper'>COLLECTIONS</div>
    ); 
}

/*----- Componente central -----*/
export const ProfilePanel = () => {
    const { username } = useParams();
    const { auth, userData, commonHost } = useContext(AppContext);
    const [ tabberLoc, setTabberLoc ] = useState('one');
    const current_url = useLocation();
    const [ currentPost, setCurrentPost] = useState(null);
    const [ visiblePostViewer, setVisiblePostViewer ] = useState(false);
    const [ profileData, setProfileData ] = useState({});
    const [ base_url, setBase_url ] = useState('');
    const [ blockedInteraction, setBlockedInteraction ] = useState(false);

    const [ modeProfilePicUpdate, setModeProfilePicUpdate] = useState(false);
    const [ modeBannerPicUpdate, setModeBannerPicUpdate ] = useState(false);
    const [visibleImageUpdater, setVisibleImageUpdater] = useState(false);

    useEffect(() => {
        if (auth) {
            if (profileData.user_url) {
                if (username === profileData.user_url) {
                    console.error(`${username} === ${profileData.user_url} --> ${username === profileData.user_url}`);
                } else {
                    if (username === userData.user_url) {
                        setProfileData(userData)
                    } else {
                        request_ProfileData(auth, username, (error, result) => {
                            if (error) {
                                console.log(error)
                            } else {
                                setProfileData(result)
                            }
                        });
                    }
                }
            } else {
                if (username === userData.user_url) {
                    setProfileData(userData)
                } else {
                    request_ProfileData(auth, username, (error, result) => {
                        if (error) {
                            console.log(error)
                        } else {
                            setProfileData(result)
                        }
                    });
                }
            }
        }
        if (username) {
            setBase_url(`/app/profile/${username}`);
        }
    }, [auth, username]);

    useEffect(() => {
        if (userData) {
            if (userData.user_url === username) {
                setBlockedInteraction(true);
            } else {
                setBlockedInteraction(false);
            }
        } else {
            console.warn("[Profile Panel]:: aun no carga el userData");
        }
    }, [username, userData]);

    useEffect(() => {
        if (base_url) {
            if (current_url.pathname === base_url || current_url.pathname === `${base_url}/`) {setTabberLoc('one')} 
            else if (current_url.pathname === `${base_url}/info`) {setTabberLoc('two')}
            else if (current_url.pathname === `${base_url}/gallery`) {setTabberLoc('three')}
            else if (current_url.pathname === `${base_url}/collections`) {setTabberLoc('four')}
        }
    }, [base_url, current_url.pathname]);

    /* TEMPORAL */
    useEffect(() => {
        if (modeBannerPicUpdate || modeProfilePicUpdate) {
            setVisibleImageUpdater(true);
        }
    }, [modeBannerPicUpdate, modeProfilePicUpdate])

    function side_publication_closer() {
        setVisiblePostViewer(false);
        setTimeout(() => {
            setCurrentPost(null);
        }, 1000);
    }

    function modePicUpdateCloser() {
        setVisibleImageUpdater(false);
        setTimeout(() => {
            if (modeProfilePicUpdate) {
                setModeProfilePicUpdate(false)
            } else {
                setModeBannerPicUpdate(false)
            }
        }, 1000);
    }

    return(
        <div className='screen__wrapper'>
            <div className='panel__wrapper profile-panel'>
                <div className='profile__content'>
                    <div className='profile-header__wrapper'>
                        <div className='header-bg-img__wrapper'>
                            {profileData.bg_url ?
                                <img src={profileData.bg_url} alt="custom-background" /> :
                                <img src={process.env.PUBLIC_URL + '/assets/imgs/loading_background.jpg'} alt="default-background" />
                            }
                            {userData.user_url === username ?
                            <button onClick={() => setModeBannerPicUpdate(true)} className='button iconed'>
                                <svg className='icon'>
                                    <use xlinkHref={svg_icons+'#icon-camera-add'}></use>
                                </svg>
                                <p>Cambiar imagen de portada</p>
                            </button> :""}
                        </div>
                        <div className='user-distintion__wrapper'>
                            <div className='user-avatar profile-style'>
                                {profileData.profilePic_url ?
                                    <img src={commonHost+profileData.profilePic_url} alt="user_pic" /> :
                                    <svg className='icon'>
                                        <use xlinkHref={svg_icons+'#icon-empty-user'}></use>
                                    </svg>
                                }
                                {userData.user_url === username ?
                                <button onClick={() => setModeProfilePicUpdate(true)} className='button iconed'>
                                    <svg className='icon'>
                                        <use xlinkHref={svg_icons+'#icon-camera-add'}></use>
                                    </svg>
                                </button> :
                                    ""
                                }
                            </div>
                            <div className='user-names'>
                                <h2>{`${profileData.name} ${profileData.lastName}`}</h2>
                                <p>HeartPoints: {profileData.heart_points}</p>
                            </div>
                            <div className='user-actions'>
                                <button className='button interaction-option' disabled={blockedInteraction}>
                                    <svg className='icon'>
                                        <use xlinkHref={svg_icons+'#icon-heart-add'}></use>
                                    </svg>
                                    <p>Añadir</p>
                                </button>
                                <button className='button interaction-option secundary' disabled={blockedInteraction}>
                                    <svg className='icon'>
                                        <use xlinkHref={svg_icons+'#icon-chat'}></use>
                                    </svg>
                                    <p>Mensaje</p>
                                </button>
                            </div>
                        </div>
                    </div>
                    <hr className='separator full-horizontal'/>
                    <div className='profile-navigation__wrapper'>
                        <div className={`profile-navigation__content ${tabberLoc}`}>
                            <Link to={`/app/profile/${username}/`} className={`button tabber ${tabberLoc === 'one' ? 'current' : ''}`}>
                                Historias
                            </Link>
                            <Link to={`/app/profile/${username}/info`} className={`button tabber ${tabberLoc === 'two' ? 'current' : ''}`}>
                                Informacion
                            </Link>
                            <Link to={`/app/profile/${username}/gallery`} className={`button tabber ${tabberLoc === 'three' ? 'current' : ''}`}>
                                Fotos
                            </Link>
                            <Link to={`/app/profile/${username}/collections`} className={`button tabber ${tabberLoc === 'four' ? 'current' : ''}`}>
                                Colecciones
                            </Link>
                        </div>
                    </div>
                    <Routes>
                        <Route path="/" element={<PublicationsSection currentUserURL={username} setter_currentPost={setCurrentPost} getter_currentPost={currentPost}/>} />
                        <Route path="/info" element={<InformationSection />} />
                        <Route path="/gallery" element={<GallerySection />} />
                        <Route path="/collections" element={<CollectionsSection />} />
                    </Routes>
                </div>
            </div>
            {tabberLoc === 'one' ? 
            <div className={`sub-screen__wrapper half-screen ${visiblePostViewer ? '' : 'hidden'}`}>
                <div className='exit-half-screen' onClick={() => side_publication_closer()}></div>
                <SidePublicationViewer publicationInfo={currentPost} setPublicationInfo={setCurrentPost} setter_visibility={setVisiblePostViewer} profileURL={username}/>
            </div> : ''}
            {modeProfilePicUpdate ? 
            <div className={`sub-screen__wrapper full-screen ${visibleImageUpdater ? '' : 'hidden'}`}>
                <div className='exit-full-screen' onClick={() => modePicUpdateCloser()}></div>
                <div>perfil</div>
            </div> : ''}
            {modeBannerPicUpdate ? 
            <div className={`sub-screen__wrapper full-screen ${visibleImageUpdater ? '' : 'hidden'}`}>
                <div className='exit-full-screen' onClick={() => modePicUpdateCloser()}></div>
                <div>banner</div>
            </div> : ''}
        </div>
    );
}