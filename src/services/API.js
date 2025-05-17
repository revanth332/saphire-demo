import axios from 'axios';

export const API_URL = "https://sap-order-to-cash-e2gddcbsf5chdac8.centralus-01.azurewebsites.net/api"
// export const API_URL = "https://sap-order-to-cash-e2gddcbsf5chdac8.centralus-01.azurewebsites.net/api"
// export const API_URL = `${window.origin}/api`;



export const API = {
    get: {
        getAllLeads: async () => {
            return await axios.get(`${API_URL}/getAllLeads`);
        },

        getQuotes: async () => {
            return await axios.get(`${API_URL}/getQuotes`);
        },

        getPurchaseOrders: async () => {
            return await axios.get(`${API_URL}/getPurchaseOrders`);
        },
    },

    post: {

        addShipments: async (data) => {
            return await axios.post(`${API_URL}/addShipments`, data);
        },

        chatCompletion: async (data) => {
            return await axios.post(`${API_URL}/chat`, data);
        },

        getLead: async (id) => {
            return await axios.post(`${API_URL}/getLead`, { InteractionId: id })
        },

        getEmailSummary: async (CustomerEmail, InteractionId) => {
            return await axios.post(`${API_URL}/getEmails`, { email: CustomerEmail, InteractionId });
        },

        sendQuotation: async (formData) => {
            return await axios.post(`${API_URL}/sendQuotation`, formData,
                {
                    headers: { "Content-Type": "multipart/form-data" }
                });
        },

        sendMeetingInvite: async (data) => {
            return await axios.post(`${API_URL}/sendMeetingInvite`, data);
        }
    },

    put: {
        updateLead: async (InteractionId) => {
            return await axios.put(`${API_URL}/changeStatus`, { InteractionId: InteractionId });
        }
    }
}