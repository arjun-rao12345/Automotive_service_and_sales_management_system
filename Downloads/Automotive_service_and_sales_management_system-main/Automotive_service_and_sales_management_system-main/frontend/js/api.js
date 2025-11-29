// API utility functions for Automotive Service & Sales Management System

const API_BASE = 'http://localhost:5000/api';

// Generic API request function
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        
        // Handle non-JSON responses
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(text || `HTTP error! status: ${response.status}`);
        }

        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API request failed: ${endpoint}`, error);
        // Re-throw with more context
        if (error.message) {
            throw error;
        }
        throw new Error(`Network error: ${error.message || 'Failed to connect to server'}`);
    }
}

// Customer API functions
const customerAPI = {
    async getAll(page = 1, limit = 10) {
        return apiRequest(`/customers?page=${page}&limit=${limit}`);
    },

    async search(query) {
        return apiRequest(`/customers/search?q=${encodeURIComponent(query)}`);
    },

    async getById(id) {
        return apiRequest(`/customers/${id}`);
    },

    async create(customerData) {
        return apiRequest('/customers', {
            method: 'POST',
            body: JSON.stringify(customerData)
        });
    },

    async update(id, customerData) {
        return apiRequest(`/customers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(customerData)
        });
    },

    async delete(id) {
        return apiRequest(`/customers/${id}`, {
            method: 'DELETE'
        });
    }
};

// Vehicle API functions
const vehicleAPI = {
    async getAll(page = 1, limit = 10) {
        return apiRequest(`/vehicles?page=${page}&limit=${limit}`);
    },

    async search(query) {
        return apiRequest(`/vehicles/search?q=${encodeURIComponent(query)}`);
    },

    async getById(id) {
        return apiRequest(`/vehicles/${id}`);
    },

    async getByCustomerId(customerId) {
        return apiRequest(`/vehicles/by-customer/${customerId}`);
    },

    async create(vehicleData) {
        return apiRequest('/vehicles', {
            method: 'POST',
            body: JSON.stringify(vehicleData)
        });
    },

    async update(id, vehicleData) {
        return apiRequest(`/vehicles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(vehicleData)
        });
    },

    async delete(id) {
        return apiRequest(`/vehicles/${id}`, {
            method: 'DELETE'
        });
    },

    async getAllModels() {
        return apiRequest('/vehicles/models/all');
    },

    async createModel(modelData) {
        return apiRequest('/vehicles/models', {
            method: 'POST',
            body: JSON.stringify(modelData)
        });
    }
};

// Service API functions
const serviceAPI = {
    async getAll(page = 1, limit = 10, status = null) {
        let url = `/services?page=${page}&limit=${limit}`;
        if (status) {
            url += `&status=${encodeURIComponent(status)}`;
        }
        return apiRequest(url);
    },

    async getById(id) {
        return apiRequest(`/services/${id}`);
    },

    async create(serviceData) {
        return apiRequest('/services', {
            method: 'POST',
            body: JSON.stringify(serviceData)
        });
    },

    async update(id, serviceData) {
        return apiRequest(`/services/${id}`, {
            method: 'PUT',
            body: JSON.stringify(serviceData)
        });
    },

    async delete(id) {
        return apiRequest(`/services/${id}`, {
            method: 'DELETE'
        });
    },

    async createRecord(recordData) {
        return apiRequest('/services/records', {
            method: 'POST',
            body: JSON.stringify(recordData)
        });
    },

    async updateRecord(id, recordData) {
        return apiRequest(`/services/records/${id}`, {
            method: 'PUT',
            body: JSON.stringify(recordData)
        });
    }
};

// Employee API functions
const employeeAPI = {
    async getAll(page = 1, limit = 10) {
        return apiRequest(`/employees?page=${page}&limit=${limit}`);
    },

    async getById(id) {
        return apiRequest(`/employees/${id}`);
    },

    async create(employeeData) {
        return apiRequest('/employees', {
            method: 'POST',
            body: JSON.stringify(employeeData)
        });
    },

    async update(id, employeeData) {
        return apiRequest(`/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(employeeData)
        });
    },

    async delete(id) {
        return apiRequest(`/employees/${id}`, {
            method: 'DELETE'
        });
    }
};

// Inventory API functions
const inventoryAPI = {
    async getAll(page = 1, limit = 10) {
        return apiRequest(`/inventory/parts?page=${page}&limit=${limit}`);
    },

    async getById(id) {
        return apiRequest(`/inventory/parts/${id}`);
    },

    async getAllSuppliers() {
        return apiRequest(`/inventory/suppliers`);
    },

    async createSupplier(supplierData) {
        return apiRequest('/inventory/suppliers', {
            method: 'POST',
            body: JSON.stringify(supplierData)
        });
    },

    async create(partData) {
        return apiRequest('/inventory/parts', {
            method: 'POST',
            body: JSON.stringify(partData)
        });
    },

    async update(id, partData) {
        return apiRequest(`/inventory/parts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(partData)
        });
    },

    async delete(id) {
        return apiRequest(`/inventory/parts/${id}`, {
            method: 'DELETE'
        });
    },

    async updateInventory(id, inventoryData) {
        return apiRequest(`/inventory/inventory/${id}`, {
            method: 'PUT',
            body: JSON.stringify(inventoryData)
        });
    },

    async createInventory(inventoryData) {
        return apiRequest('/inventory/inventory', {
            method: 'POST',
            body: JSON.stringify(inventoryData)
        });
    },

    async getLowStock() {
        return apiRequest(`/inventory/low-stock`);
    }
};

// Invoice API functions
const invoiceAPI = {
    async getAll(page = 1, limit = 10, paymentPending = null) {
        let url = `/invoices?page=${page}&limit=${limit}`;
        if (paymentPending !== null && paymentPending !== '') {
            const isPending = paymentPending === 'true' || paymentPending === true;
            url += `&payment_pending=${isPending}`;
        }
        return apiRequest(url);
    },

    async getById(id) {
        return apiRequest(`/invoices/${id}`);
    },

    async create(invoiceData) {
        return apiRequest('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoiceData)
        });
    },

    async update(id, invoiceData) {
        return apiRequest(`/invoices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(invoiceData)
        });
    },

    async delete(id) {
        return apiRequest(`/invoices/${id}`, {
            method: 'DELETE'
        });
    },

    async createPayment(paymentData) {
        return apiRequest('/invoices/payments', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    },

    async getPayments(invoiceId) {
        return apiRequest(`/invoices/${invoiceId}/payments`);
    }
};

// Feedback API functions
const feedbackAPI = {
    async getAll(page = 1, limit = 10) {
        return apiRequest(`/feedback?page=${page}&limit=${limit}`);
    },

    async getById(id) {
        return apiRequest(`/feedback/${id}`);
    },

    async create(feedbackData) {
        return apiRequest('/feedback', {
            method: 'POST',
            body: JSON.stringify(feedbackData)
        });
    },

    async update(id, feedbackData) {
        return apiRequest(`/feedback/${id}`, {
            method: 'PUT',
            body: JSON.stringify(feedbackData)
        });
    },

    async delete(id) {
        return apiRequest(`/feedback/${id}`, {
            method: 'DELETE'
        });
    }
};

// Insurance API functions
const insuranceAPI = {
    async getAll(page = 1, limit = 10) {
        return apiRequest(`/insurance?page=${page}&limit=${limit}`);
    },

    async getById(id) {
        return apiRequest(`/insurance/${id}`);
    },

    async create(insuranceData) {
        return apiRequest('/insurance', {
            method: 'POST',
            body: JSON.stringify(insuranceData)
        });
    },

    async update(id, insuranceData) {
        return apiRequest(`/insurance/${id}`, {
            method: 'PUT',
            body: JSON.stringify(insuranceData)
        });
    },

    async delete(id) {
        return apiRequest(`/insurance/${id}`, {
            method: 'DELETE'
        });
    }
};

// Dashboard API functions
const dashboardAPI = {
    async getStats() {
        return apiRequest('/dashboard/stats');
    },

    async getComprehensiveStats() {
        return apiRequest('/dashboard/stats/comprehensive');
    },

    async getTodayStats() {
        return apiRequest('/dashboard/stats/today');
    },

    async getMonthlyStats() {
        return apiRequest('/dashboard/stats/monthly');
    },

    async getYearlyStats() {
        return apiRequest('/dashboard/stats/yearly');
    },

    async getActivity() {
        return apiRequest('/dashboard/activity');
    },

    async getServiceChart() {
        return apiRequest('/dashboard/charts/services');
    },

    async getRevenueChart() {
        return apiRequest('/dashboard/charts/revenue');
    }
};

// History API functions
const historyAPI = {
    async getAll(page = 1, limit = 50) {
        return apiRequest(`/history?page=${page}&limit=${limit}`);
    },

    async getByServiceId(serviceId) {
        return apiRequest(`/history/service/${serviceId}`);
    },

    async getByCustomerId(customerId) {
        return apiRequest(`/history/customer/${customerId}`);
    }
};

// Utility functions
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container') || document.body;
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.textContent = ' ×';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.marginLeft = '1rem';
    closeBtn.onclick = () => alert.remove();
    alert.appendChild(closeBtn);

    alertContainer.appendChild(alert);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showLoading(element) {
    element.innerHTML = '<div class="loading"></div>';
}

function hideLoading(element, content) {
    element.innerHTML = content;
}

// Export all APIs
window.API = {
    customer: customerAPI,
    vehicle: vehicleAPI,
    service: serviceAPI,
    employee: employeeAPI,
    inventory: inventoryAPI,
    invoice: invoiceAPI,
    feedback: feedbackAPI,
    insurance: insuranceAPI,
    dashboard: dashboardAPI,
    history: historyAPI,
    utils: {
        showAlert,
        formatCurrency,
        formatDate,
        formatDateTime,
        showLoading,
        hideLoading
    }
};
