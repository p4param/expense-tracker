import { User, Expense, Transaction } from './types';

export function calculateDebts(users: User[], expenses: Expense[]): Transaction[] {
    const balances: Record<string, number> = {};

    // Initialize balances
    users.forEach(u => balances[u.id] = 0);

    // Calculate net balances
    expenses.forEach(expense => {
        const { payerId, amount, involvedUserIds } = expense;
        // Handle case where involved users might have been deleted, though we assume integrity
        const validInvolved = involvedUserIds.filter(id => balances.hasOwnProperty(id));
        if (validInvolved.length === 0) return;

        const splitAmount = amount / validInvolved.length;

        // Payer paid the full amount
        if (balances.hasOwnProperty(payerId)) {
            balances[payerId] += amount;
        }

        // Each involved user "consumes" the split amount
        validInvolved.forEach(userId => {
            balances[userId] -= splitAmount;
        });
    });

    // Separate into debtors and creditors
    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    Object.entries(balances).forEach(([id, amount]) => {
        // Round to 2 decimal places to avoid float errors
        const rounded = Math.round(amount * 100) / 100;
        if (rounded < -0.01) debtors.push({ id, amount: rounded });
        if (rounded > 0.01) creditors.push({ id, amount: rounded });
    });

    const transactions: Transaction[] = [];

    // Greedy matching
    // Sort by magnitude to optimize (optional, but good practice)
    debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
    creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The amount to settle is the minimum of what debtor owes and what creditor is owed
        const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        transactions.push({
            from: debtor.id,
            to: creditor.id,
            amount: Math.round(amount * 100) / 100,
        });

        // Update remaining amounts
        debtor.amount += amount;
        creditor.amount -= amount;

        // If fully settled, move to next
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return transactions;
}

export function generateUUID(): string {
    // browser crypto
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    // node crypto (if available globally in recent node versions)
    // @ts-ignore
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        // @ts-ignore
        return crypto.randomUUID();
    }

    // Fallback timestamp + random
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
