import axios from 'axios';

const apiService = {};

const endpoint = axios.create({
    baseURL: 'http://127.0.0.1:5000/api/',
    // headers: {'X-Custom-Header': 'foobar'}
});

apiService.getPost = async (slug) => {
    return endpoint.get('post/' + slug);
}
apiService.getAllPosts = async () => {
    return endpoint.get('posts/');
}

apiService.getPost = async (slug) => {
    return endpoint.get('post/' + slug);
}

apiService.savePost = async (oldSlug, data) => {
    const formData = new FormData();
    for (const field in data) {
        if (data.hasOwnProperty(field)) {
            formData.append(field,
                field === "tags" ? JSON.stringify(data[field]) : data[field]);
        }
    }
    const config = {
        headers: {
            'content-type': 'multipart/form-data'
        }
    }
    return endpoint.post('post/' + oldSlug, formData, config);
}

apiService.createPost = async (data) => {
    const formData = new FormData();
    for (const field in data) {
        if (data.hasOwnProperty(field)) {
            formData.append(field,
                field === "tags" ? JSON.stringify(data[field]) : data[field]);
        }
    }
    const config = {
        headers: {
            'content-type': 'multipart/form-data'
        }
    }
    return endpoint.post('post/', formData, config);
}

apiService.triggerJob = async (command) => {
    return endpoint.get('job?command=' + command);
}

// apiService.deletePost = async (slug, data) => {
//     return endpoint.get('post/' + slug);
// }

export default apiService;