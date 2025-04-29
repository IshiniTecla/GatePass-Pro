import axios from "axios";

const API_URL = "http://localhost:5000/api/feedback"; // Backend API URL

//Create Feedback (POST)
export const submitFeedback = async (feedback) => {
    try {
        const response = await axios.post(API_URL, feedback);
        return response.data;
    } catch (error) {
        console.error("Error submitting feedback:", error.response?.data || error.message);
        throw error;
    }
};

//Read All Feedback (GET)
export const getFeedbackList = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching feedback list:", error.response?.data || error.message);
        throw error;
    }
};

// ** Read Single Feedback by ID (GET) - Fix this function! **
export const getFeedbackById = async (id) => {  // ✅ Make sure the function name matches your imports
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching feedback by ID:", error.response?.data || error.message);
        throw error;
    }
};

//Update Feedback (PUT)
export const updateFeedback = async (id, updatedFeedback) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, updatedFeedback);
        return response.data;
    } catch (error) {
        console.error("Error updating feedback:", error.response?.data || error.message);
        throw error;
    }
};

// Delete Feedback (DELETE)
export const deleteFeedback = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting feedback:", error.response?.data || error.message);
        throw error;
    }
};

//Get Feedback Report (GET)
export const getFeedbackReport = async () => {
    try {
        const response = await axios.get(`${API_URL}/report`);
        return response.data;
    } catch (error) {
        console.error("Error generating feedback report:", error.response?.data || error.message);
        throw error;
    }
};
