'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useExpense } from '@/context/ExpenseContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './page.module.css';

function AddExpenseForm() {
    const router = useRouter();
    const { users, expenses, addExpense, updateExpense } = useExpense();
    const searchParams = useSearchParams();
    const editId = searchParams.get('editId');

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [payerId, setPayerId] = useState('');
    const [involvedIds, setInvolvedIds] = useState<string[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Effect to handle initialization
    useEffect(() => {
        if (users.length === 0) return;

        if (editId) {
            // Edit Mode: Wait for expenses to look up the ID
            if (!isDataLoaded && expenses.length > 0) {
                const existing = expenses.find(e => e.id === editId);
                if (existing) {
                    setDescription(existing.description);
                    setAmount(existing.amount.toString());
                    setPayerId(existing.payerId);
                    setInvolvedIds(existing.involvedUserIds);
                    setIsDataLoaded(true);
                }
            }
        } else {
            // Add Mode: Initialize defaults once
            if (!isDataLoaded) {
                setPayerId(users[0]?.id || '');
                setInvolvedIds(users.map(u => u.id));
                setIsDataLoaded(true);
            }
        }
    }, [editId, users, expenses, isDataLoaded]);

    // Extract unique descriptions for auto-complete
    const existingDescriptions = Array.from(new Set(expenses.map(e => e.description))).sort();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !payerId || involvedIds.length === 0) return;

        const expenseData = {
            description,
            amount: parseFloat(amount),
            payerId,
            involvedUserIds: involvedIds,
            date: new Date().toISOString(),
        };

        if (editId) {
            updateExpense(editId, expenseData);
        } else {
            addExpense(expenseData);
        }

        router.push('/');
    };

    const toggleUser = (userId: string) => {
        setInvolvedIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleAll = () => {
        if (involvedIds.length === users.length) {
            setInvolvedIds([]);
        } else {
            setInvolvedIds(users.map(u => u.id));
        }
    };

    if (users.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                <p className="subtitle">Please add members first.</p>
                <Button onClick={() => router.push('/users')}>Go to Members</Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className="title">{editId ? 'Edit Expense' : 'Add Expense'}</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    label="Description"
                    placeholder="Dinner, Taxi, etc."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    list="expense-suggestions"
                    autoComplete="off"
                />
                <datalist id="expense-suggestions">
                    {existingDescriptions.map((desc, idx) => (
                        <option key={idx} value={desc} />
                    ))}
                </datalist>

                <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                />

                <div className={styles.section}>
                    <label className={styles.label}>Paid By</label>
                    <div className={styles.userGrid}>
                        {users.map(user => (
                            <button
                                key={user.id}
                                type="button"
                                className={`${styles.userChip} ${payerId === user.id ? styles.active : ''}`}
                                onClick={() => setPayerId(user.id)}
                            >
                                {user.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.splitHeader}>
                        <label className={styles.label}>Split Amongst</label>
                        <button type="button" onClick={toggleAll} className={styles.textBtn}>
                            {involvedIds.length === users.length ? 'Select None' : 'Select All'}
                        </button>
                    </div>
                    <div className={styles.userGrid}>
                        {users.map(user => (
                            <button
                                key={user.id}
                                type="button"
                                className={`${styles.userChip} ${involvedIds.includes(user.id) ? styles.active : ''}`}
                                onClick={() => toggleUser(user.id)}
                            >
                                {user.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={!description || !amount || involvedIds.length === 0}>
                        {editId ? 'Update Expense' : 'Save Expense'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function AddExpensePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddExpenseForm />
        </Suspense>
    );
}
