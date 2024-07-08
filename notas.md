                        &::before {
                            content: "";
                            display: block;
                            position: relative;
                            width: 10px;
                            height: 10px;
                            border: 2px solid #303336;
                            border-radius: 50%;

                        }

/**
* @param {object} filesObject provided by useDropzone
*/
export async function sendFilesToServer (filesObject, callback) {
    const formData = new FormData();
    filesObject.forEach(file => {
        formData.append('file', file);
    });

    try {
        const response = await axios.post(`${MAIN_URL}/system/upload`, formData, {headers: {'Content-Type': 'multipart/form-data'}});
        
        if (response) {
            if (response.data.url) {
                window.open(MAIN_URL+response.data.url, '_blank');
                callback(null, 'recibed_server_page')
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
};