import axios from 'axios';

const MAIN_URL = "https://blue22feather.pythonanywhere.com";
//const MAIN_URL = window.location.host;
//const MAIN_URL = "http://localhost:5000";

/*----- SOLICITUDES PUBLICAS -----*/

/**
 * Solicitud de inicio de sesion
 * @param {{username: string, password: string}} data 
 * @param {Function} callback 
 */
export async function request_login (data, callback) {
    console.log("solicitando inicio de sesion")
    const config = {timeout: 5000}
    try {
        const response = await axios.post(`${MAIN_URL}/system/sign_in`, data, config)
        if (response) {
            if (response.data.token && response.data.user) {
                callback(null, response.data);
            } else {
                callback(response, null)
            }
        } else {
            callback('noResponse', null)  
        }
    } catch (error) {
        if (error.response.headers['content-type'] === "text/html; charset=utf-8") {
            window.open().document.write(error.response.data);
            callback({ data: {error: 'INTERNAL_SERVER_ERROR'}}, null)
        } else {
            callback(error.response, null)
        }
    }
}

/**
 * Solicitud de registro de usuario
 * @param {{username: string, password: string, name: string, lastname: string, usertype: string}} UserData
 * @param {File} UserPicture provided by useDropzone
 * @param {Function} callback 
 */
export async function request_register (UserData, UserPicture, callback) {
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        timeout: 5000
    }
    const formData = new FormData();
    for (const key in UserData) {
        formData.append(key, UserData[key]);
    }
    if (UserPicture) {
        formData.append('file', UserPicture);
    }
    try {
        const response = await axios.post(`${MAIN_URL}/system/sign_up`, formData, config)
        if (response) {
            if (response.data.token && response.data.user) {
                callback(null, response.data);
            } else {
                callback(response, null)
            }
        } else {
            callback('noResponse', null)
        }
    } catch (error) {
        if (error.response.headers['content-type'] === "text/html; charset=utf-8") {
            window.open().document.write(error.response.data);
            callback({ data: {error: 'INTERNAL_SERVER_ERROR'}}, null)
        } else {
            callback(error.response, null)
        }
    }
}

/**
 * solicitud de foto de perfil publica, se usa solo en el login
 * @param {string} user_mail user email string, like "coso3000@gmail.com" 
 * @param {Function} callback 
 */
export async function request_userPic (user_mail, callback) {
    console.log("solicitando foto publica de usuario actual")
    const config = {timeout: 5000}
    try {
        const response = await axios.get(`${MAIN_URL}/system/public_pic/${user_mail}`, config)
        if (response) {
            if (response.data.url) {
                callback(null, response);
            } else {
                callback(response, null)
            }
        } else {
            callback('noResponse', null)  
        }
    } catch (error) {
        if (error.response.headers['content-type'] === "text/html; charset=utf-8") {
            window.open().document.write(error.response.data);
            callback({ data: {error: 'INTERNAL_SERVER_ERROR'}}, null)
        } else {
            callback(error.response, null)
        }
    }
}

/*----- SOLICITUDES PRIVADAS -----*/

/**
 * Solicitud de datos del usuario con sesion iniciada
 * @param {{token: string, user: string}} auth_content token and mail
 * @param {Function} callback 
 */
export async function request_userData (auth_content, callback) {
    console.log("solicitando datos de usuario");
    const config = {
        headers: {
            auth: JSON.stringify({
                sessionToken: auth_content.sessionToken,
                sessionUser: auth_content.sessionUser
            })
        },
        timeout: 5000
    }
    try {
        const response = await axios.get(`${MAIN_URL}/system/user_data/${auth_content.sessionUser}`, config);
        if (response) {
            if (response.data.sessionUserData) {
                callback(null, response.data.sessionUserData);
            } else {
                callback(response, null)
            }
        } else {
            callback('noResponse', null)  
        }
    } catch (error) {
        if (error.response.headers['content-type'] === "text/html; charset=utf-8") {
            window.open().document.write(error.response.data);
            callback({ data: {error: 'INTERNAL_SERVER_ERROR'}}, null)
        } else {
            callback(error.response, null)
        }
    }
}

/**
 * Solicitud de los datos del perfil visualizado
 * @param {*} auth_content 
 * @param {*} userURL 
 * @param {*} callback 
 */
export async function request_ProfileData (auth_content, userURL, callback) {
    console.log("solicitando datos de perfil");
    const config = {
        headers: {
            auth: JSON.stringify({
                sessionToken: auth_content.sessionToken,
                sessionUser: auth_content.sessionUser
            })
        },
        timeout: 5000
    }
    try {
        const response = await axios.get(`${MAIN_URL}/system/user_profile/${userURL}`, config);
        if (response) {
            if (response.data.profileData) {
                callback(null, response.data.profileData);
            } else {
                callback(response, null)
            }
        } else {
            callback('noResponse', null)  
        }
    } catch (error) {
        if (error.response.headers['content-type'] === "text/html; charset=utf-8") {
            window.open().document.write(error.response.data);
            callback({ data: {error: 'INTERNAL_SERVER_ERROR'}}, null)
        } else {
            callback(error.response, null)
        }
    }
}

/**
 * Solicitud de los datos basicos de todos los usuarios, se usa en el panel de exploracion
 * @param {*} auth_content 
 * @param {*} callback 
 */
export async function request_all_userData (auth_content, callback) {
    console.log("solicitando datos de usuario");
    const config = {
        headers: {
            auth: JSON.stringify({
                sessionToken: auth_content.sessionToken,
                sessionUser: auth_content.sessionUser
            })
        },
        timeout: 5000
    }
    try {
        const response = await axios.get(`${MAIN_URL}/system/explore`, config);
        if (response) {
            console.log("peticion com:", response)
            if (response.data.allUsersInfo) {
                callback(null, response.data.allUsersInfo);
            } else {
                callback(response, null)
            }
        } else {
            callback('noResponse', null)  
        }
    } catch (error) {
        if (error.response.headers['content-type'] === "text/html; charset=utf-8") {
            window.open().document.write(error.response.data);
            callback({ data: {error: 'INTERNAL_SERVER_ERROR'}}, null)
        } else {
            callback(error.response, null)
        }
    }
}

/**
 * Solicitud de uno de los campos de datos de usuario
 * @param {*} auth_content 
 * @param {*} field 
 * @param {*} callback 
 */
export async function request_userData_Filed(auth_content, field, callback) {
    console.log(`solicitando ${field}`);
    const config = {
        headers: {
            auth: JSON.stringify({
                sessionToken: auth_content.sessionToken,
                sessionUser: auth_content.sessionUser
            })
        },
        timeout: 5000
    }
    try {
        const response = await axios.get(`${MAIN_URL}/system/user_data/${auth_content.sessionUser}/${field}`, config);
        if (response) {
            if (response.data[field]) {
                callback(null, response.data);
            } else {
                callback(response, null)
            }
        } else {
            callback('noResponse', null)  
        }
    } catch (error) {
        if (error.response.headers['content-type'] === "text/html; charset=utf-8") {
            window.open().document.write(error.response.data);
            callback({ data: {error: 'INTERNAL_SERVER_ERROR'}}, null)
        } else {
            callback(error.response, null)
        }
    }
}

/**
 * Solicitud para alterar uno de los campos de datos de usuario
 * @param {{token: string, user: string}} auth_content token and mail
 * @param {string} field 
 * @param {string} new_value 
 * @param {Function} callback 
 */
export async function update_userData_Field(auth_content, field, new_value, callback) {
    console.log(`escribiendo "${new_value}" en el campo ${field}`)
    const config = {
        headers: {
            auth: JSON.stringify({
                sessionToken: auth_content.sessionToken,
                sessionUser: auth_content.sessionUser
            })
        },
        timeout: 5000
    }
    try {
        const response = await axios.patch(`${MAIN_URL}/system/user_data/${auth_content.sessionUser}/${field}`, { [field]: new_value }, config);
        if (response) {
            if (response.data[field]) {
                callback(null, response.data);
            } else {
                callback(response, null)
            }
        } else {
            callback('noResponse', null)  
        }
    } catch (error) {
        if (error.response.headers['content-type'] === "text/html; charset=utf-8") {
            window.open().document.write(error.response.data);
            callback({ data: {error: 'INTERNAL_SERVER_ERROR'}}, null)
        } else {
            callback(error.response, null)
        }
    }
}

/**
 * solicitud de todos los post de un perfil especifico
 * @param {*} auth_content 
 * @param {*} user_to_search 
 * @param {*} callback 
 */
export async function request_userPosts (auth_content, user_to_search, callback) {
    const config = {
        headers: {
            auth: JSON.stringify({
                sessionToken: auth_content.sessionToken,
                sessionUser: auth_content.sessionUser
            })
        },
        timeout: 5000
    }
    try {
        const response = await axios.get(`${MAIN_URL}/system/publications/${user_to_search}`, config);
        if (response) {
            if (response.data.publications) {
                callback(null, response.data.publications);
            } else {
                callback(response, null)
            }
        } else {
            callback('noResponse', null)  
        }
    } catch (error) {
        if (error.response.headers['content-type'] === "text/html; charset=utf-8") {
            window.open().document.write(error.response.data);
            callback({ data: {error: 'INTERNAL_SERVER_ERROR'}}, null)
        } else {
            callback(error.response, null)
        }
    }
}

/**
 * solicitud de los compentarios de una publicacion especifica
 * @param {*} auth_content 
 * @param {*} user_to_search 
 * @param {*} post_id 
 * @param {*} callback 
 */
export async function request_publicationComments (auth_content, posting_url, post_id, callback) {
    const config = {
        headers: {
            auth: JSON.stringify({
                sessionToken: auth_content.sessionToken,
                sessionUser: auth_content.sessionUser
            })
        },
        timeout: 5000
    }

    try {
        const response = await axios.get(`${MAIN_URL}/system/publications/${posting_url}/${post_id}/comments`, config);
        if (response) {
            if (response.data.comments) {
                callback(null, response.data.comments);
            } else {
                callback(response, null)
            }
        } else {
            callback('noResponse', null)  
        }
    } catch (error) {
        if (error.response.headers['content-type'] === "text/html; charset=utf-8") {
            window.open().document.write(error.response.data);
            callback({ data: {error: 'INTERNAL_SERVER_ERROR'}}, null)
        } else {
            callback(error.response, null)
        }
    }
}

export async function request_set_vote (auth_content, vote_info, user_to_search, post_id, callback) {
    const config = {
        headers: {
            auth: JSON.stringify({
                sessionToken: auth_content.sessionToken,
                sessionUser: auth_content.sessionUser
            })
        },
        timeout: 5000
    }
    try {
        const response = await axios.post(`${MAIN_URL}/system/publications/${user_to_search}/${post_id}/${vote_info}`, null, config);
        if (response) {
            if (response.data.points) {
                callback(null, response.data.points);
            } else {
                callback(response, null)
            }
        } else {
            callback('noResponse', null)  
        }
    } catch (error) {
        console.error(error)
        /*
        if (error.response.headers['content-type'] === "text/html; charset=utf-8") {
            window.open().document.write(error.response.data);
            callback({ data: {error: 'INTERNAL_SERVER_ERROR'}}, null)
        } else {
            callback(error.response, null)
        }*/
    }
}

export async function create_newPost (auth_content, data, media, posting_url, callback) {
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            auth: JSON.stringify({
                sessionToken: auth_content.sessionToken,
                sessionUser: auth_content.sessionUser
            })
        },
        timeout: 5000
    }
    
    const formData = new FormData();
    for (const key in data) {formData.append(key, data[key]);}
    if (media) {media.forEach((image, index) => {formData.append(`image-${index}`, image);});}
    
    try {
        const response = await axios.post(`${MAIN_URL}/system/publications/${posting_url}`, formData, config)
        if (response) {
            if (response.data) {
                callback(null, response.data);
            } else {
                callback(response, null)
            }
        } else {
            callback('noResponse', null)
        }
    } catch (error) {
        if (error.response.headers['content-type'] === "text/html; charset=utf-8") {
            window.open().document.write(error.response.data);
            callback({ data: {error: 'INTERNAL_SERVER_ERROR'}}, null)
        } else {
            callback(error.response, null)
        }
    }
}

export async function create_newComment (auth_content, content, media, posting_url, posting_id, callback) {
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            auth: JSON.stringify({
                sessionToken: auth_content.sessionToken,
                sessionUser: auth_content.sessionUser
            })
        },
        timeout: 5000
    }

    const formData = new FormData();
    formData.append("content", content)
    if (media) {media.forEach((image, index) => {formData.append(`image-${index}`, image);});}

    try {
        const response = await axios.post(`${MAIN_URL}/system/publications/${posting_url}/${posting_id}/comments`, formData, config)
        if (response) {
            if (response.data) {
                callback(null, response.data);
            } else {
                callback(response, null)
            }
        } else {
            callback('noResponse', null)
        }
    } catch (error) {
        if (error.response.headers['content-type'] === "text/html; charset=utf-8") {
            window.open().document.write(error.response.data);
            callback({ data: {error: 'INTERNAL_SERVER_ERROR'}}, null)
        } else {
            callback(error.response, null)
        }
    }
}




