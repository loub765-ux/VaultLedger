// ====================== api.js ======================
let currentUser = null;

const DB_KEY_USERS = 'vaultledger_users';
const DB_KEY_TRANSACTIONS = 'vaultledger_transactions';

// ====================== UTILS ======================
function getUsers() {
    return JSON.parse(localStorage.getItem(DB_KEY_USERS)) || [];
}

function saveUsers(users) {
    localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));
}

function getTransactions() {
    return JSON.parse(localStorage.getItem(DB_KEY_TRANSACTIONS)) || [];
}

function saveTransactions(transactions) {
    localStorage.setItem(DB_KEY_TRANSACTIONS, JSON.stringify(transactions));
}

// ====================== AUTH ======================
export async function registerUser(name, email, password) {
    const users = getUsers();

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Este email já está cadastrado.');
    }

    const newUser = {
        id: Date.now().toString(36),
        name,
        email: email.toLowerCase(),
        password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    currentUser = { ...newUser };
    delete currentUser.password;
    localStorage.setItem('vaultledger_current_user', JSON.stringify(currentUser));

    return newUser;
}

export async function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
        throw new Error('Email ou senha incorretos.');
    }

    currentUser = { ...user };
    delete currentUser.password;
    localStorage.setItem('vaultledger_current_user', JSON.stringify(currentUser));

    return currentUser;
}

export function getCurrentUser() {
    if (currentUser) return currentUser;

    const saved = localStorage.getItem('vaultledger_current_user');
    if (saved) {
        currentUser = JSON.parse(saved);
    }
    return currentUser;
}

export function logout() {
    currentUser = null;
    localStorage.removeItem('vaultledger_current_user');
    window.location.href = 'login.html';
}

// ====================== TRANSACTIONS ======================
export function addTransaction(transaction) {
    const user = getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const transactions = getTransactions();
    
    const newTrans = {
        id: Date.now().toString(36),
        userId: user.id,
        description: transaction.description,
        amount: parseFloat(transaction.amount),
        date: transaction.date,
        type: transaction.type,
        category: transaction.category || 'Outros',
        createdAt: new Date().toISOString()
    };

    transactions.push(newTrans);
    saveTransactions(transactions);
    return newTrans;
}

export function getUserTransactions() {
    const user = getCurrentUser();
    if (!user) return [];
    
    return getTransactions()
        .filter(t => t.userId === user.id)
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
}

export function deleteTransaction(id) {
    let transactions = getTransactions();
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions(transactions);
}