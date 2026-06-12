// --- CONFIGURAÇÃO DE TRANSIÇÃO PARA API REAL ---
const USE_REAL_API = false; // Altere para TRUE para usar o servidor real
const API_BASE_URL = 'https://sua-api.com/api'; // URL do seu servidor backend

/**
 * Função helper para requisições fetch unificadas
 */
async function request(endpoint, options = {}) {
    if (!USE_REAL_API) return null;

    const user = getCurrentUser();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (user && user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro ${response.status}: Falha na requisição`);
        }
        return await response.json();
    } catch (err) {
        console.error('API Error:', err);
        throw err;
    }
}

// Auth & Profile API (Frontend-Only Persistence via LocalStorage)
const sleep = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

function getStoredUsers() {
    const users = localStorage.getItem('vaultledger_registered_users');
    return users ? JSON.parse(users) : [];
}

function saveStoredUsers(users) {
    localStorage.setItem('vaultledger_registered_users', JSON.stringify(users));
}

export async function loginUser(email, password, rememberMe = false) {
    if (USE_REAL_API) {
        const data = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        localStorage.setItem('vaultledger_user', JSON.stringify(data.user));
        return { user: data.user };
    }

    await sleep();
    const users = getStoredUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) throw new Error('E-mail ou senha incorretos');
    
    const sessionUser = { ...user };
    delete sessionUser.password;
    
    localStorage.setItem('vaultledger_user', JSON.stringify(sessionUser));
    return { user: sessionUser };
}

export async function registerUser(name, email, password, confirmPassword) {
    if (USE_REAL_API) {
        return await request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
    }

    await sleep();
    const users = getStoredUsers();
    
    if (users.find(u => u.email === email)) {
        throw new Error('E-mail já cadastrado');
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        password, // In a real app, this would be hashed
        avatar: "https://picsum.photos/seed/" + Math.random() + "/200",
        phone: "",
        currency: "BRL", // Default currency
        created_at: new Date().toISOString()
    };

    users.push(newUser);
    saveStoredUsers(users);
    return newUser;
}

export async function logout() {
    if (USE_REAL_API) {
        await request('/auth/logout', { method: 'POST' }).catch(() => {});
    }
    localStorage.removeItem('vaultledger_user');
    window.location.href = '/pages/login.html';
}

export function getCurrentUser() {
    const userStr = localStorage.getItem('vaultledger_user');
    return userStr ? JSON.parse(userStr) : null;
}

export async function getUserProfile() {
    if (USE_REAL_API) return await request('/profile');

    await sleep(200);
    const sessionUser = getCurrentUser();
    if (!sessionUser) {
        window.location.href = '/pages/login.html';
        throw new Error('Não autenticado');
    }
    
    const users = getStoredUsers();
    const user = users.find(u => u.id === sessionUser.id);
    if (!user) throw new Error('Usuário não encontrado');
    
    const profile = { ...user };
    delete profile.password;
    return profile;
}

export async function updateUserProfile(profileData) {
    if (USE_REAL_API) {
        const updated = await request('/profile', {
            method: 'PATCH',
            body: JSON.stringify(profileData)
        });
        localStorage.setItem('vaultledger_user', JSON.stringify(updated));
        return updated;
    }

    await sleep(300);
    const sessionUser = getCurrentUser();
    if (!sessionUser) throw new Error('Não autenticado');

    const users = getStoredUsers();
    const index = users.findIndex(u => u.id === sessionUser.id);
    
    if (index !== -1) {
        users[index] = { ...users[index], ...profileData };
        saveStoredUsers(users);
        
        const updatedSession = { ...users[index] };
        delete updatedSession.password;
        localStorage.setItem('vaultledger_user', JSON.stringify(updatedSession));
        return updatedSession;
    }
    throw new Error('Falha ao atualizar perfil');
}

// --- MOCK API FOR VAULTLEDGER FEATURES (TRANSACTIONS, GOALS, ETC) ---

// Helper for local storage data
function getMockData(key, defaultData = []) {
    const user = getCurrentUser();
    if (!user) return defaultData;
    
    const userKey = `vaultledger_mock_${user.id}_${key}`;
    const data = localStorage.getItem(userKey);
    return data ? JSON.parse(data) : defaultData;
}

function saveMockData(key, data) {
    const user = getCurrentUser();
    if (!user) return;
    
    const userKey = `vaultledger_mock_${user.id}_${key}`;
    localStorage.setItem(userKey, JSON.stringify(data));
}

// Transactions Mock
export async function getTransactions(filters = {}) {
    if (USE_REAL_API) {
        const query = new URLSearchParams(filters).toString();
        return await request(`/transactions?${query}`);
    }

    await sleep();
    let data = getMockData('transactions', []);

    if (filters.search) {
        data = data.filter(t => t.description.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.category && !['All Categories', 'Todas', 'Todas as Categorias'].includes(filters.category)) {
        data = data.filter(t => t.category === filters.category);
    }
    if (filters.type && !['All Types', 'Todos', 'Todos os Tipos'].includes(filters.type)) {
        data = data.filter(t => t.type === filters.type);
    }

    return data;
}

export async function createTransaction(data) {
    if (USE_REAL_API) {
        return await request('/transactions', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    await sleep();
    const transactions = getMockData('transactions');
    const newTransaction = { ...data, id: Date.now() };
    transactions.unshift(newTransaction);
    saveMockData('transactions', transactions);
    return newTransaction;
}

export async function updateTransaction(id, data) {
    if (USE_REAL_API) {
        return await request(`/transactions/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    await sleep();
    const transactions = getMockData('transactions');
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...data };
        saveMockData('transactions', transactions);
        return transactions[index];
    }
    throw new Error('Transaction not found');
}

export async function deleteTransaction(id) {
    if (USE_REAL_API) {
        return await request(`/transactions/${id}`, { method: 'DELETE' });
    }

    await sleep();
    const transactions = getMockData('transactions');
    const filtered = transactions.filter(t => t.id !== id);
    saveMockData('transactions', filtered);
    return { success: true };
}

// Goals Mock
export async function getGoals() {
    if (USE_REAL_API) return await request('/goals');

    await sleep();
    return getMockData('goals', []);
}

export async function createGoal(data) {
    if (USE_REAL_API) {
        return await request('/goals', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    await sleep();
    const goals = getMockData('goals');
    const newGoal = { ...data, id: Date.now() };
    goals.unshift(newGoal);
    saveMockData('goals', goals);
    return newGoal;
}

export async function updateGoal(id, data) {
    if (USE_REAL_API) {
        return await request(`/goals/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    await sleep();
    const goals = getMockData('goals');
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
        goals[index] = { ...goals[index], ...data };
        saveMockData('goals', goals);
        return goals[index];
    }
    throw new Error('Goal not found');
}

export async function deleteGoal(id) {
    if (USE_REAL_API) {
        return await request(`/goals/${id}`, { method: 'DELETE' });
    }

    await sleep();
    const goals = getMockData('goals');
    const filtered = goals.filter(g => g.id !== id);
    saveMockData('goals', filtered);
    return { success: true };
}

// Categories Mock
export async function getCategories() {
    if (USE_REAL_API) return await request('/categories');

    await sleep();
    return getMockData('categories', []);
}

export async function createCategory(data) {
    if (USE_REAL_API) {
        return await request('/categories', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    await sleep();
    const categories = getMockData('categories');
    const newCategory = { ...data, id: Date.now() };
    categories.push(newCategory);
    saveMockData('categories', categories);
    return newCategory;
}

export async function updateCategory(id, data) {
    if (USE_REAL_API) {
        return await request(`/categories/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    await sleep();
    const categories = getMockData('categories');
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
        categories[index] = { ...categories[index], ...data };
        saveMockData('categories', categories);
        return categories[index];
    }
    throw new Error('Category not found');
}

export async function deleteCategory(id) {
    if (USE_REAL_API) {
        return await request(`/categories/${id}`, { method: 'DELETE' });
    }

    await sleep();
    const categories = getMockData('categories');
    const filtered = categories.filter(c => c.id !== id);
    saveMockData('categories', filtered);
    return { success: true };
}

// Events Mock (Agenda)
export async function getEvents() {
    if (USE_REAL_API) return await request('/events');

    await sleep();
    return getMockData('events', []);
}

export async function createEvent(data) {
    if (USE_REAL_API) {
        return await request('/events', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    await sleep();
    const events = getMockData('events');
    const newEvent = { ...data, id: Date.now() };
    events.push(newEvent);
    saveMockData('events', events);
    return newEvent;
}

export async function updateEvent(id, data) {
    if (USE_REAL_API) {
        return await request(`/events/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    await sleep();
    const events = getMockData('events');
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
        events[index] = { ...events[index], ...data };
        saveMockData('events', events);
        return events[index];
    }
    throw new Error('Event not found');
}

export async function deleteEvent(id) {
    if (USE_REAL_API) {
        return await request(`/events/${id}`, { method: 'DELETE' });
    }

    await sleep();
    const events = getMockData('events');
    const filtered = events.filter(e => e.id !== id);
    saveMockData('events', filtered);
    return { success: true };
}

export async function deleteUserAccount() {
    if (USE_REAL_API) {
        await request('/auth/account', { method: 'DELETE' });
    }
    
    await sleep();
    const sessionUser = getCurrentUser();
    if (sessionUser) {
        const users = getStoredUsers();
        const filtered = users.filter(u => u.id !== sessionUser.id);
        saveStoredUsers(filtered);
        localStorage.removeItem('vaultledger_user');
    }
    return { success: true };
}

// Currency Formatting Helper
export function formatCurrency(amount, currencyCode = 'BRL') {
    const locales = {
        'BRL': 'pt-BR',
        'USD': 'en-US',
        'EUR': 'de-DE'
    };
    const locale = locales[currencyCode] || 'pt-BR';
    
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode
    }).format(amount);
}

// Global Search
export async function globalSearch(query) {
    await sleep(200);
    const transactions = await getTransactions({ search: query });
    const goals = (await getGoals()).filter(g => g.title.toLowerCase().includes(query.toLowerCase()));
    
    return {
        transactions,
        goals,
        events: []
    };
}
