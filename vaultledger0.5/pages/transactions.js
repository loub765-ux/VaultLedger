// ====================== transactions.js ======================

import { 
    getUserTransactions, 
    addTransaction, 
    deleteTransaction 
} from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();

    // Modal controls
    const modal = document.getElementById('newTransactionModal');
    const openBtn = document.getElementById('openNewTransactionModalBtn');
    const closeBtn = document.getElementById('closeNewTransactionModal');
    const cancelBtn = document.getElementById('cancelNewTransaction');
    const form = document.getElementById('addTransactionForm');

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            form.reset();
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    // Form submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const transaction = {
                description: formData.get('description'),
                amount: formData.get('amount'),
                date: formData.get('date'),
                type: formData.get('type'),
                category: formData.get('category')
            };

            try {
                await addTransaction(transaction);
                closeModal();
                loadTransactions();
                alert('✅ Transação adicionada com sucesso!');
            } catch (error) {
                alert('❌ ' + error.message);
            }
        });
    }

    function loadTransactions() {
        const tbody = document.getElementById('transactionList');
        if (!tbody) return;

        const transactions = getUserTransactions();

        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-8 py-20 text-center">
                        <p class="text-gray-400 font-medium">Nenhuma transação encontrada.</p>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';

        transactions.forEach(tx => {
            const isExpense = tx.type === 'expense';
            const amountClass = isExpense ? 'text-red-600' : 'text-green-600';
            const amountSign = isExpense ? '-' : '+';

            html += `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="px-8 py-6">${new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                    <td class="px-8 py-6">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${isExpense ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
                            ${isExpense ? 'Despesa' : 'Receita'}
                        </span>
                    </td>
                    <td class="px-8 py-6">${tx.category}</td>
                    <td class="px-8 py-6 font-medium">${tx.description}</td>
                    <td class="px-8 py-6 text-right font-bold ${amountClass}">
                        ${amountSign} R$ ${parseFloat(tx.amount).toFixed(2).replace('.', ',')}
                    </td>
                    <td class="px-8 py-6 text-center">
                        <button onclick="deleteTx('${tx.id}')" class="text-red-500 hover:text-red-700 transition">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        lucide.createIcons();
    }

    window.deleteTx = function(id) {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            deleteTransaction(id);
            loadTransactions();
        }
    };
});