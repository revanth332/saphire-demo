export const mockLeads = [
  {
    id: "1",
    name: "John Doe",
    company: "Acme Corp",
    query: "Interested in pricing for Turbocharger X1",
    source: "Website Chatbot",
    time: "10 minutes ago",
    isNew: true,
  },
  {
    id: "2",
    name: "Sarah Miller",
    company: "Tech Solutions",
    query: "Looking for information about warranty options",
    source: "Website Chatbot",
    time: "45 minutes ago",
    isNew: true,
  },
  {
    id: "3",
    name: "Robert Chen",
    company: "Global Industries",
    query: "Need a quote for bulk order of Gasket Sets",
    source: "Website Chatbot",
    time: "2 hours ago",
    isNew: false,
  },
  {
    id: "4",
    name: "Emma Wilson",
    company: "Beta Inc",
    query: "Questions about product compatibility",
    source: "Website Chatbot",
    time: "3 hours ago",
    isNew: false,
  },
]

export const mockSalesData = {
  week: [
    { month: "Mon", revenue: 12000, target: 10000 },
    { month: "Tue", revenue: 14500, target: 10000 },
    { month: "Wed", revenue: 16800, target: 10000 },
    { month: "Thu", revenue: 15200, target: 10000 },
    { month: "Fri", revenue: 18900, target: 10000 },
    { month: "Sat", revenue: 9800, target: 8000 },
    { month: "Sun", revenue: 8500, target: 8000 },
  ],
  month: [
    { month: "Week 1", revenue: 28500, target: 25000 },
    { month: "Week 2", revenue: 32000, target: 25000 },
    { month: "Week 3", revenue: 34700, target: 25000 },
    { month: "Week 4", revenue: 33230, target: 25000 },
  ],
  quarter: [
    { month: "Jan", revenue: 95000, target: 90000 },
    { month: "Feb", revenue: 102000, target: 90000 },
    { month: "Mar", revenue: 108500, target: 90000 },
    { month: "Apr", revenue: 115000, target: 100000 },
    { month: "May", revenue: 128430, target: 100000 },
    { month: "Jun", revenue: 0, target: 100000 },
  ],
  year: [
    { month: "Jan", revenue: 95000, target: 90000 },
    { month: "Feb", revenue: 102000, target: 90000 },
    { month: "Mar", revenue: 108500, target: 90000 },
    { month: "Apr", revenue: 115000, target: 100000 },
    { month: "May", revenue: 128430, target: 100000 },
    { month: "Jun", revenue: 0, target: 100000 },
    { month: "Jul", revenue: 0, target: 110000 },
    { month: "Aug", revenue: 0, target: 110000 },
    { month: "Sep", revenue: 0, target: 110000 },
    { month: "Oct", revenue: 0, target: 120000 },
    { month: "Nov", revenue: 0, target: 120000 },
    { month: "Dec", revenue: 0, target: 120000 },
  ],
}

export const mockLeadSourceData = {
  week: [
    { source: "Website Chatbot", count: 24, color: "#3B82F6" },
    { source: "Email Campaign", count: 18, color: "#10B981" },
    { source: "Referral", count: 12, color: "#6366F1" },
    { source: "Trade Show", count: 8, color: "#F59E0B" },
    { source: "Social Media", count: 6, color: "#EC4899" },
  ],
  month: [
    { source: "Website Chatbot", count: 64, color: "#3B82F6" },
    { source: "Email Campaign", count: 42, color: "#10B981" },
    { source: "Referral", count: 28, color: "#6366F1" },
    { source: "Trade Show", count: 18, color: "#F59E0B" },
    { source: "Social Media", count: 14, color: "#EC4899" },
  ],
  quarter: [
    { source: "Website Chatbot", count: 180, color: "#3B82F6" },
    { source: "Email Campaign", count: 120, color: "#10B981" },
    { source: "Referral", count: 85, color: "#6366F1" },
    { source: "Trade Show", count: 65, color: "#F59E0B" },
    { source: "Social Media", count: 50, color: "#EC4899" },
  ],
  year: [
    { source: "Website Chatbot", count: 520, color: "#3B82F6" },
    { source: "Email Campaign", count: 380, color: "#10B981" },
    { source: "Referral", count: 250, color: "#6366F1" },
    { source: "Trade Show", count: 180, color: "#F59E0B" },
    { source: "Social Media", count: 150, color: "#EC4899" },
  ],
}

export const mockConversionData = {
  week: [
    { stage: "Lead", rate: 100 },
    { stage: "Qualified", rate: 68 },
    { stage: "Meeting", rate: 45 },
    { stage: "Proposal", rate: 32 },
    { stage: "Negotiation", rate: 24 },
    { stage: "Won", rate: 18 },
  ],
  month: [
    { stage: "Lead", rate: 100 },
    { stage: "Qualified", rate: 72 },
    { stage: "Meeting", rate: 48 },
    { stage: "Proposal", rate: 35 },
    { stage: "Negotiation", rate: 28 },
    { stage: "Won", rate: 22 },
  ],
  quarter: [
    { stage: "Lead", rate: 100 },
    { stage: "Qualified", rate: 75 },
    { stage: "Meeting", rate: 52 },
    { stage: "Proposal", rate: 38 },
    { stage: "Negotiation", rate: 30 },
    { stage: "Won", rate: 24 },
  ],
  year: [
    { stage: "Lead", rate: 100 },
    { stage: "Qualified", rate: 78 },
    { stage: "Meeting", rate: 55 },
    { stage: "Proposal", rate: 42 },
    { stage: "Negotiation", rate: 34 },
    { stage: "Won", rate: 28 },
  ],
}

export const mockPerformers = {
  week: [
    { id: "1", name: "Alex Johnson", avatar: "AJ", sales: 24500, leads: 12, conversion: 33, trend: 5 },
    { id: "2", name: "Maria Garcia", avatar: "MG", sales: 18700, leads: 9, conversion: 28, trend: 3 },
    { id: "3", name: "David Kim", avatar: "DK", sales: 16200, leads: 8, conversion: 25, trend: -2 },
    { id: "4", name: "Sarah Chen", avatar: "SC", sales: 14800, leads: 7, conversion: 29, trend: 4 },
    { id: "5", name: "James Wilson", avatar: "JW", sales: 12400, leads: 6, conversion: 22, trend: -1 },
  ],
  month: [
    { id: "1", name: "Alex Johnson", avatar: "AJ", sales: 68500, leads: 32, conversion: 34, trend: 7 },
    { id: "2", name: "Maria Garcia", avatar: "MG", sales: 54200, leads: 28, conversion: 29, trend: 5 },
    { id: "3", name: "David Kim", avatar: "DK", sales: 48700, leads: 25, conversion: 26, trend: -1 },
    { id: "4", name: "Sarah Chen", avatar: "SC", sales: 42300, leads: 22, conversion: 31, trend: 6 },
    { id: "5", name: "James Wilson", avatar: "JW", sales: 38900, leads: 20, conversion: 24, trend: 2 },
  ],
  quarter: [
    { id: "1", name: "Alex Johnson", avatar: "AJ", sales: 185000, leads: 85, conversion: 35, trend: 8 },
    { id: "2", name: "Maria Garcia", avatar: "MG", sales: 162000, leads: 78, conversion: 30, trend: 6 },
    { id: "3", name: "David Kim", avatar: "DK", sales: 148500, leads: 72, conversion: 27, trend: 3 },
    { id: "4", name: "Sarah Chen", avatar: "SC", sales: 136000, leads: 68, conversion: 32, trend: 7 },
    { id: "5", name: "James Wilson", avatar: "JW", sales: 124500, leads: 62, conversion: 25, trend: 4 },
  ],
  year: [
    { id: "1", name: "Alex Johnson", avatar: "AJ", sales: 685000, leads: 320, conversion: 36, trend: 9 },
    { id: "2", name: "Maria Garcia", avatar: "MG", sales: 612000, leads: 295, conversion: 31, trend: 7 },
    { id: "3", name: "David Kim", avatar: "DK", sales: 548000, leads: 275, conversion: 28, trend: 5 },
    { id: "4", name: "Sarah Chen", avatar: "SC", sales: 492000, leads: 260, conversion: 33, trend: 8 },
    { id: "5", name: "James Wilson", avatar: "JW", sales: 458000, leads: 240, conversion: 26, trend: 4 },
  ],
}

export const mockTasks = [
  {
    id: "1",
    title: "Follow up on Quote #12345",
    dueDate: "Today",
    priority: "high",
    completed: false,
  },
  {
    id: "2",
    title: "Payment Overdue: Order #67890",
    dueDate: "Today",
    priority: "high",
    completed: false,
  },
  {
    id: "3",
    title: "Review PO received from Beta Inc",
    dueDate: "Tomorrow",
    priority: "medium",
    completed: false,
  },
  {
    id: "4",
    title: "Send product catalog to Tech Solutions",
    dueDate: "This week",
    priority: "low",
    completed: false,
  },
  {
    id: "5",
    title: "Update customer details for Acme Corp",
    dueDate: "Yesterday",
    priority: "medium",
    completed: true,
  },
]

export const mockActivities = [
  {
    id: "1",
    type: "lead",
    description: "Agent created Lead for John Doe from Acme Corp",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "quote",
    description: "Quote #12345 sent to Tech Solutions",
    time: "45 minutes ago",
    read: false,
  },
  {
    id: "3",
    type: "order",
    description: "Agent received PO for Order #67890 from Beta Inc",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "4",
    type: "lead",
    description: "Agent created Lead for Emma Wilson from Beta Inc",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "quote",
    description: "Quote #12346 sent to Global Industries",
    time: "Yesterday",
    read: true,
  },
  {
    id: "6",
    type: "message",
    description: "New message from Sarah Miller at Tech Solutions",
    time: "Yesterday",
    read: true,
  },
  {
    id: "7",
    type: "order",
    description: "Order #67891 confirmed by XYZ Corporation",
    time: "2 days ago",
    read: true,
  },
]