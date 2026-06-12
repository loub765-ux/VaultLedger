import { getTransactions, createTransaction, deleteTransaction, formatCurrency, getUserProfile } from './js/api.js';
import { showToast } from './js/layout.js';

let currentFilters = {
    search: '',
    startDate: '',
    endDate: ''
};

async function loadAndRenderTransactions() {
    const container = document.getElementById('transactionList');
    if (!container) return;

    const profile = await getUserProfile();
    const transactions = await getTransactions(currentFilters);
    
    if (!transactions) return;

    container.innerHTML = transactions.map(t => `
        <div class="flex items-center justify-between p-4 bg-white border border-border rounded-2xl hover:shadow-md transition-all group">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                    <i data-lucide="${t.amount > 0 ? 'arrow-up-right' : 'arrow-down-right'}" class="w-5 h-5 ${t.amount > 0 ? 'text-success' : 'text-danger'}"></i>
                </div>
                <div>
                    <p class="font-bold text-text-main">${t.description}</p>
                    <p class="text-xs text-text-muted">${new Date(t.date).toLocaleDateString('pt-BR')} • ${t.category || 'Geral'}</p>
                </div>
            </div>
            <div class="flex items-center gap-6">
                <span class="font-bold ${t.amount > 0 ? 'text-success' : 'text-text-main'}">
                    ${t.amount > 0 ? '+' : ''}${formatCurrency(t.amount, profile.currency)}
                </span>
                <button onclick="window.removeTransaction('${t.id}')" class="p-2 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `).join('') || '<p class="text-center text-text-muted py-8">Nenhuma transação encontrada.</p>';
    
    if (window.lucide) window.lucide.createIcons();
}

// Expor para o escopo global para o botão de deletar
window.removeTransaction = async (id) => {
    if (confirm('Deseja realmente excluir esta transação?')) {
        await deleteTransaction(id);
        showToast('Transação removida com sucesso');
        loadAndRenderTransactions();
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadAndRenderTransactions();

    // Busca em tempo real
    const searchInput = document.getElementById('transactionSearch');
    searchInput?.addEventListener('input', (e) => {
        currentFilters.search = e.target.value;
        loadAndRenderTransactions();
    });

    // Filtro de Data
    const dateFilter = document.getElementById('dateFilter');
    dateFilter?.addEventListener('change', (e) => {
        currentFilters.startDate = e.target.value; // Simplificado para data específica ou início
        loadAndRenderTransactions();
    });

    // Modal Control
    const openModalBtn = document.getElementById('openNewTransactionModalBtn');
    const newTransactionModal = document.getElementById('newTransactionModal');
    const closeNewTransactionModalBtn = document.getElementById('closeNewTransactionModal');
    const cancelNewTransactionBtn = document.getElementById('cancelNewTransaction');
    const form = document.getElementById('addTransactionForm');

    openModalBtn?.addEventListener('click', () => {
        // Força a remoção de classes que podem estar escondendo o modal
        newTransactionModal?.classList.remove('hidden');
        newTransactionModal?.classList.remove('invisible', 'opacity-0');
        newTransactionModal?.classList.add('flex');
    });

    const closeNewTransactionModal = () => {
        newTransactionModal?.classList.add('hidden');
        newTransactionModal?.classList.remove('flex');
        form.reset(); // Limpa o formulário ao fechar
    };

    closeNewTransactionModalBtn?.addEventListener('click', closeNewTransactionModal);
    cancelNewTransactionBtn?.addEventListener('click', closeNewTransactionModal);
    
    // Fechar modal ao clicar fora
    newTransactionModal?.addEventListener('click', (e) => {
        if (e.target === newTransactionModal) closeNewTransactionModal();
    });

    // Clear Filters
    document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
        currentFilters = { search: '', startDate: '', endDate: '' };
        if (searchInput) searchInput.value = '';
        if (dateFilter) dateFilter.value = '';
        loadAndRenderTransactions();
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const rawAmount = formData.get('amount');
        if (!rawAmount || !formData.get('description') || !formData.get('date')) {
            showToast('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }

        const amountValue = Math.abs(parseFloat(rawAmount));
        
        // Se o tipo for despesa, o valor deve ser negativo
        const type = formData.get('type');
        const newTransaction = {
            description: formData.get('description'),
            amount: type === 'expense' ? -amountValue : amountValue,
            date: formData.get('date'),
            category: formData.get('category') || 'Geral',
            type: type || (amountValue >= 0 ? 'income' : 'expense')
        };
        try {
            await createTransaction(newTransaction);
            showToast('Transação adicionada com sucesso!');
            closeNewTransactionModal(); // Fecha o modal após adicionar
            loadAndRenderTransactions();
        } catch (err) {
            showToast('Erro ao adicionar transação', 'error');
        }
    });
});