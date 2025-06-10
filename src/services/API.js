import axios from 'axios';

export const API_URL = "https://sap-order-to-cash-e2gddcbsf5chdac8.centralus-01.azurewebsites.net/api"
// export const API_URL = "https://sap-order-to-cash-e2gddcbsf5chdac8.centralus-01.azurewebsites.net/api"
// export const API_URL = `${window.origin}/api`;


const mockLeadsData = [
  {
    id: 1,
    InteractionId: 1,
    CustomerName: "Aarav Sharma",
    company: "TechNova Pvt Ltd",
    CustomerEmail: "aarav.sharma@technova.com",
    phone: "+91-9876543210",
    CreatedAt: new Date("2024-11-05T10:15:00Z")
  },
  {
    id: 2,
    InteractionId: 2,
    CustomerName: "Sneha Iyer",
    company: "InfiLogic Solutions",
    CustomerEmail: "sneha.iyer@infilogic.com",
    phone: "+91-9123456789",
    CreatedAt: new Date("2025-01-22T14:30:00Z")
  },
  {
    id: 3,
    InteractionId: 3,
    CustomerName: "Rohan Mehta",
    company: "CloudSphere Inc.",
    CustomerEmail: "rohan.mehta@cloudsphere.io",
    phone: "+91-9988776655",
    CreatedAt: new Date("2024-12-10T09:45:00Z")
  },
  {
    id: 4,
    InteractionId: 4,
    CustomerName: "Priya Verma",
    company: "NextGenAI Labs",
    CustomerEmail: "priya.verma@nextgenai.ai",
    phone: "+91-9001122334",
    CreatedAt: new Date("2025-03-01T12:00:00Z")
  },
  {
    id: 5,
    InteractionId: 5,
    CustomerName: "Karan Joshi",
    company: "DataCraft Analytics",
    CustomerEmail: "karan.joshi@datacraft.com",
    phone: "+91-9798989898",
    CreatedAt: new Date("2025-06-01T08:20:00Z")
  }
]

const mockPurchaseOrders = [
  {
    POId: "PO-1001",
    QuoteId: "QT-5001",
    CreatedAt: new Date("2025-05-01T10:30:00Z"),
    CustomerEmail: "aarav.sharma@technova.com",
    Status: "Draft"
  },
  {
    POId: "PO-1002",
    QuoteId: "QT-5002",
    CreatedAt: new Date("2025-05-05T15:20:00Z"),
    CustomerEmail: "sneha.iyer@infilogic.com",
    Status: "Sent"
  },
  {
    POId: "PO-1003",
    QuoteId: "QT-5003",
    CreatedAt: new Date("2025-05-10T09:45:00Z"),
    CustomerEmail: "rohan.mehta@cloudsphere.io",
    Status: "Accepted"
  },
  {
    POId: "PO-1004",
    QuoteId: "QT-5004",
    CreatedAt: new Date("2025-05-15T12:00:00Z"),
    CustomerEmail: "priya.verma@nextgenai.ai",
    Status: "Rejected"
  },
  {
    POId: "PO-1005",
    QuoteId: "QT-5005",
    CreatedAt: new Date("2025-06-01T08:20:00Z"),
    CustomerEmail: "karan.joshi@datacraft.com",
    Status: "Pending"
  }
];

const mockQuotesData = [
  {
    "QuoteId": "QTE-001",
    "CustomerName": "Acme Solutions Inc.",
    "FinalAmount": 1250.75,
    "ExpiryDate": "2024-12-31" 
  },
  {
    "QuoteId": "QTE-002",
    "CustomerName": "Global Innovations Ltd.",
    "FinalAmount": 98000.00,
    "ExpiryDate": "2024-07-15" 
  },
  {
    "QuoteId": "QTE-003",
    "CustomerName": "Sarah Chen",
    "FinalAmount": 549.99,
    "CreatedAt": "2024-06-01T10:30:00Z" 
  },
  {
    "QuoteId": "QTE-004",
    "CustomerName": "Matrix Holdings Corp.",
    "FinalAmount": 7500.50,
    "ExpiryDate": "2025-01-20"
  },
  {
    "QuoteId": "QTE-005",
    "CustomerName": "Zenith Systems",
    "FinalAmount": 25000.00,
    "ExpiryDate": "2024-09-30"
  },
  {
    "QuoteId": "QTE-006",
    "CustomerName": "David Lee",
    "FinalAmount": 189.99,
    "CreatedAt": "2024-06-10T14:00:00Z"
  },
  {
    "QuoteId": "QTE-007",
    "CustomerName": "Pioneer Technologies",
    "FinalAmount": 150000.00,
    "ExpiryDate": "2024-11-15"
  },
  {
    "QuoteId": "QTE-008",
    "CustomerName": "Emily Rodriguez",
    "FinalAmount": 3450.25,
    "ExpiryDate": "2025-03-10"
  },
  {
    "QuoteId": "QTE-009",
    "CustomerName": "Infinity Co.",
    "FinalAmount": 876.50,
    "CreatedAt": "2024-05-20T09:15:00Z"
  },
  {
    "QuoteId": "QTE-010",
    "CustomerName": "Oceanic Enterprises",
    "FinalAmount": 10000.00,
    "ExpiryDate": "2024-08-01"
  }
]

export const API = {
    get: {
        getAllLeads: async () => {
            // return await axios.get(`${API_URL}/getAllLeads`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ data: {data : mockLeadsData} });
                }, 1000);
            });
        },

        getQuotes: async () => {
            // return await axios.get(`${API_URL}/getQuotes`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ data: {data : mockQuotesData} });
                }, 1000);
            });
        },

        getPurchaseOrders: async () => {
            // return await axios.get(`${API_URL}/getPurchaseOrders`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ data: {data : mockPurchaseOrders} });
                }, 1000);
            });
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
            // return await axios.post(`${API_URL}/getLead`, { InteractionId: id })
            return new Promise((resolve) => {
                setTimeout(() => {
                    const lead = mockLeadsData.find(lead => lead.id === parseInt(id));
                    resolve({ data: { data: lead } });
                }, 1000);
            });
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