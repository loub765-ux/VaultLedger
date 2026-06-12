/**
 * Layout Module
 * Handles sidebar and header injection.
 */

import { getCurrentUser } from './api.js';

const sidebarItems = [
    { name: 'Dashboard', icon: 'layout-dashboard', path: '/pages/dashboard.html' },
    { name: 'Transações', icon: 'arrow-left-right', path: '/pages/transactions.html' },
    { name: 'Metas', icon: 'target', path: '/pages/goals.html' },
    { name: 'Agenda', icon: 'calendar', path: '/pages/agenda.html' },
    { name: 'Categorias', icon: 'tag', path: '/pages/categories.html' },
    { name: 'Meu Perfil', icon: 'user', path: '/pages/profile.html' },
];

export function initLayout() {
    const user = getCurrentUser();
    
    // Auth Guard
    if (!user && !window.location.pathname.includes('login') && !window.location.pathname.includes('register') && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        window.location.href = '/pages/login.html';
        return;
    }

    const currentPath = window.location.pathname;
    const currentItem = sidebarItems.find(item => item.path === currentPath);
    
    // Breadcrumbs Logic
    const breadcrumbs = [
        { name: 'VaultLedger', path: '/pages/dashboard.html' }
    ];
    if (currentItem && currentItem.name !== 'Dashboard') {
        breadcrumbs.push({ name: currentItem.name, path: currentItem.path });
    }

    const sidebarHtml = `
        <div id="sidebarOverlay" class="fixed inset-0 bg-black/50 z-[45] hidden lg:hidden"></div>
        <aside id="sidebar" class="fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-border flex flex-col z-50 transition-transform duration-300 -translate-x-full lg:translate-x-0">
            <div class="p-8 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <i data-lucide="shield-check" class="w-5 h-5 text-gray-900"></i>
                    </div>
                    <span class="text-xl font-black tracking-tighter text-text-main uppercase">VaultLedger</span>
                </div>
                <button id="closeSidebar" class="lg:hidden text-text-muted hover:text-text-main">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <nav class="flex-1 px-4 space-y-1.5 overflow-y-auto">
                ${sidebarItems.map(item => `
                    <a href="${item.path}" class="sidebar-link ${currentPath === item.path ? 'active' : ''}">
                        <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                        <span>${item.name}</span>
                    </a>
                `).join('')}
            </nav>
            
            <div class="p-4 mt-auto border-t border-border">
                <div class="flex items-center gap-3 px-3 py-4 bg-gray-50 rounded-2xl mb-4 border border-border">
                    <div class="w-10 h-10 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-border">
                        <img src="${user?.avatar || 'https://picsum.photos/seed/user/100/100'}" alt="User" class="w-full h-full object-cover" referrerPolicy="no-referrer">
                    </div>
                    <div class="overflow-hidden">
                        <p class="text-[13px] font-bold text-text-main truncate">${user?.name || 'Visitante'}</p>
                        <p class="text-[10px] font-medium text-text-muted truncate uppercase tracking-widest">Premium</p>
                    </div>
                </div>
                <button id="logoutBtn" class="flex items-center gap-3 px-3 py-3 rounded-2xl text-danger hover:bg-red-50 w-full transition-all duration-200 text-sm font-bold">
                    <i data-lucide="log-out" class="w-4 h-4"></i>
                    <span>Encerrar Sessão</span>
                </button>
            </div>
        </aside>
    `;
    
    const headerHtml = `
        <header class="fixed top-0 right-0 left-0 lg:left-[240px] h-20 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 lg:px-12 z-40">
            <div class="flex items-center gap-4">
                <button id="openSidebar" class="lg:hidden p-2.5 text-text-muted hover:bg-gray-50 rounded-xl transition-colors">
                    <i data-lucide="menu" class="w-6 h-6"></i>
                </button>
                ${currentItem && currentItem.name !== 'Dashboard' ? `
                    <button id="backBtn" class="p-2.5 text-text-muted hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2 group">
                        <i data-lucide="chevron-left" class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform"></i>
                        <span class="text-sm font-bold hidden sm:inline">Voltar</span>
                    </button>
                ` : ''}
                <nav class="hidden md:flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-text-muted">
                    ${breadcrumbs.map((b, i) => `
                        ${i > 0 ? '<i data-lucide="chevron-right" class="w-3 h-3 text-gray-300"></i>' : ''}
                        <a href="${b.path}" class="transition-colors ${i === breadcrumbs.length - 1 ? 'text-primary-hover font-black' : 'hover:text-text-main'}">${b.name}</a>
                    `).join('')}
                </nav>
            </div>
            
            <div class="flex items-center gap-3">
                <div class="relative hidden md:block group">
                    <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary-hover transition-colors"></i>
                    <input type="text" id="globalSearch" placeholder="Pesquisar..." class="bg-gray-50 border border-border rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 lg:w-80 transition-all">
                </div>
                <button class="p-2.5 text-text-muted hover:bg-gray-100 rounded-2xl transition-all relative">
                    <i data-lucide="bell" class="w-5 h-5"></i>
                    <span class="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white"></span>
                </button>
                <div class="h-8 w-px bg-border mx-2 hidden lg:block"></div>
                <a href="/pages/profile.html" class="w-10 h-10 rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary transition-all">
                    <img src="${user?.avatar || 'https://picsum.photos/seed/user/100/100'}" alt="User" class="w-full h-full object-cover" referrerPolicy="no-referrer">
                </a>
            </div>
        </header>
    `;
    
    const toastContainer = `<div id="toastContainer" class="fixed bottom-6 right-6 z-[100] flex flex-col gap-3"></div>`;
    
    document.body.insertAdjacentHTML('afterbegin', sidebarHtml + headerHtml + toastContainer);
    
    // Mobile Sidebar Logic
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    
    const toggleSidebar = () => {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden');
    };
    
    openBtn?.addEventListener('click', toggleSidebar);
    closeBtn?.addEventListener('click', toggleSidebar);
    overlay?.addEventListener('click', toggleSidebar);
    
    // Back Button Logic
    document.getElementById('backBtn')?.addEventListener('click', () => {
        window.history.back();
    });
    
    // Page Title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle && currentItem) {
        pageTitle.textContent = currentItem.name;
    }
    
    // Adjust main content padding
    const main = document.querySelector('main');
    if (main) {
        main.classList.remove('ml-64', 'ml-[240px]');
        main.classList.add('lg:ml-[240px]', 'pt-20', 'px-4', 'lg:px-8');
    }
    
    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        const { logout } = await import('./api.js');
        logout();
    });

    // Global Action Button
    document.getElementById('globalActionBtn')?.addEventListener('click', () => {
        window.location.href = '/pages/transactions.html?action=new';
    });

    // Global Search
    const searchInput = document.querySelector('header input[type="text"]');
    if (searchInput) {
        const searchContainer = searchInput.parentElement;
        const resultsDropdown = document.createElement('div');
        resultsDropdown.className = 'absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border hidden z-[200] max-h-[400px] overflow-y-auto animate-in zoom-in duration-200';
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(resultsDropdown);

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                resultsDropdown.classList.add('hidden');
                return;
            }

            searchTimeout = setTimeout(async () => {
                const { globalSearch, formatCurrency, getUserProfile } = await import('./api.js');
                const profile = await getUserProfile();
                const currency = profile.currency || 'BRL';
                const results = await globalSearch(query);
                
                let html = '';
                const hasResults = results.transactions.length > 0 || results.goals.length > 0 || results.events.length > 0;

                if (!hasResults) {
                    html = '<div class="p-4 text-center text-text-muted text-sm italic">Nenhum resultado encontrado</div>';
                } else {
                    if (results.transactions.length > 0) {
                        html += `<div class="p-2 border-b border-border"><p class="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 mb-1">Transações</p>`;
                        html += results.transactions.map(t => `
                            <a href="/pages/transactions.html" class="block px-2 py-1.5 hover:bg-gray-50 rounded-lg text-sm text-text-main flex justify-between">
                                <span>${t.description}</span>
                                <span class="font-bold ${t.amount > 0 ? 'text-success' : ''}">${t.amount > 0 ? '+' : ''}${formatCurrency(t.amount, currency)}</span>
                            </a>
                        `).join('');
                        html += `</div>`;
                    }
                    if (results.goals.length > 0) {
                        html += `<div class="p-2 border-b border-border"><p class="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 mb-1">Metas</p>`;
                        html += results.goals.map(g => `
                            <a href="/pages/goals.html" class="block px-2 py-1.5 hover:bg-gray-50 rounded-lg text-sm text-text-main">
                                ${g.title}
                            </a>
                        `).join('');
                        html += `</div>`;
                    }
                    if (results.events.length > 0) {
                        html += `<div class="p-2"><p class="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 mb-1">Eventos</p>`;
                        html += results.events.map(e => `
                            <a href="/pages/agenda.html" class="block px-2 py-1.5 hover:bg-gray-50 rounded-lg text-sm text-text-main">
                                ${e.title} (${new Date(e.date).toLocaleDateString('pt-BR')})
                            </a>
                        `).join('');
                        html += `</div>`;
                    }
                }

                resultsDropdown.innerHTML = html;
                resultsDropdown.classList.remove('hidden');
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                resultsDropdown.classList.add('hidden');
            }
        });
    }
}

export function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const id = Date.now();
    const bg = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-text-main';
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';
    
    const toastHtml = `
        <div id="toast-${id}" class="flex items-center gap-3 ${bg} text-white px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-right duration-300">
            <i data-lucide="${icon}" class="w-5 h-5"></i>
            <span class="text-sm font-medium">${message}</span>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', toastHtml);
    window.lucide.createIcons();
    
    setTimeout(() => {
        const toast = document.getElementById(`toast-${id}`);
        if (toast) {
            toast.classList.add('animate-out', 'fade-out', 'slide-out-to-right');
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}
