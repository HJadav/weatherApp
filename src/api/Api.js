import axios from 'axios'

export const callAPI = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data?.data;
    } catch (error) {
        console.log('Error calling API:', error);
        return null;
    }
};
