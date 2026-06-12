// Banco de dados local para usuários
const USERS_KEY = 'vault_users';
const CURRENT_USER_KEY = 'vault_current_user';

// Função para registrar um novo usuário
export const registerUser = async (name, email, password) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    
    if (users.find(u => u.email === email)) {
        throw new Error('Este e-mail já está cadastrado.');
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        password, // Em um cenário real, as senhas devem ser criptografadas no backend
        created_at: new Date().toISOString(),
        avatar: `https://picsum.photos/seed/${Math.random()}/200`
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
};

// Função para realizar o login
export const loginUser = async (email, password) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        throw new Error('E-mail ou senha incorretos.');
    }

    // Salva a sessão do usuário logado (sem a senha por segurança)
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
};

// Retorna o usuário logado atualmente
export const getCurrentUser = () => {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
};

// Finaliza a sessão
export const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'login.html';
};

// Atualiza o perfil do usuário no "banco de dados"
export const updateUserProfile = async (data) => {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index === -1) throw new Error('Usuário não encontrado');
    users[index] = { ...users[index], ...data };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const { password: _, ...updatedSession } = users[index];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedSession));
    return updatedSession;
};