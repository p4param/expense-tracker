'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Expense, Transaction } from '@/lib/types';
import { calculateDebts, generateUUID } from '@/lib/utils';

interface ExpenseContextType {
    activeGroupId: string | null;
    groupName: string | null;
    users: User[];
    expenses: Expense[];
    transactions: Transaction[];
    createGroup: (name: string, email?: string) => Promise<string | null>;
    joinGroup: (id: string) => Promise<boolean>;
    leaveGroup: () => void;
    addUser: (name: string) => void;
    deleteUser: (id: string) => boolean;
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    updateExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
    deleteExpense: (id: string) => void;
    resetAll: () => void;
    getBalancer: (userId: string) => number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [groupName, setGroupName] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Load - Check for persisted Group ID
    useEffect(() => {
        const savedGroupId = localStorage.getItem('activeGroupId');
        if (savedGroupId) {
            fetchGroupData(savedGroupId).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const fetchGroupData = async (groupId: string) => {
        try {
            const res = await fetch(`/api/sync?groupId=${groupId}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setExpenses(data.expenses || []);
                setGroupName(data.name || 'Unknown Group');
                setActiveGroupId(groupId);
                return true;
            }
        } catch (error) {
            console.error("Failed to fetch group:", error);
        }
        return false;
    };

    const createGroup = async (name: string, email?: string) => {
        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });
            if (res.ok) {
                const data = await res.json();
                setActiveGroupId(data.groupId);
                setGroupName(data.name);
                setUsers([]);
                setExpenses([]);
                localStorage.setItem('activeGroupId', data.groupId);
                return data.groupId;
            }
        } catch (e) {
            console.error(e);
        }
        return null;
    };

    const joinGroup = async (id: string) => {
        const success = await fetchGroupData(id);
        if (success) {
            setActiveGroupId(id);
            localStorage.setItem('activeGroupId', id);
            return true;
        } else {
            localStorage.removeItem('activeGroupId');
            return false;
        }
    };

    const leaveGroup = () => {
        setActiveGroupId(null);
        setGroupName(null);
        setUsers([]);
        setExpenses([]);
        localStorage.removeItem('activeGroupId');
    };

    // Effect 1: Calculate debts whenever data changes (Runs on load AND updates)
    useEffect(() => {
        setTransactions(calculateDebts(users, expenses));
    }, [users, expenses]);

    // Effect 2: Auto-Sync (Skips first render to avoid overwriting initial fetch)
    const isFirstRender = React.useRef(true);
    useEffect(() => {
        if (!activeGroupId) return;
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const syncData = async () => {
            await fetch(`/api/sync?groupId=${activeGroupId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users, expenses }),
            });
        };

        syncData();
    }, [users, expenses, activeGroupId]);

    const addUser = (name: string, email?: string) => {
        const newUser: User = { id: generateUUID(), name: name.trim(), email: email?.trim() };
        setUsers(prev => [...prev, newUser]);
    };

    const deleteUser = (id: string) => {
        const isUsed = expenses.some(e => e.payerId === id || e.involvedUserIds.includes(id));
        if (isUsed) return false;
        setUsers(prev => prev.filter(u => u.id !== id));
        return true;
    };

    const addExpense = (expenseData: Omit<Expense, 'id'>) => {
        const newExpense: Expense = { ...expenseData, id: generateUUID() };
        setExpenses(prev => [newExpense, ...prev]);
    };

    const updateExpense = (id: string, updatedData: Omit<Expense, 'id'>) => {
        setExpenses(prev => prev.map(e => e.id === id ? { ...updatedData, id } : e));
    };

    const deleteExpense = (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const resetAll = () => {
        setExpenses([]);
    };

    const getBalancer = (userId: string) => 0;

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#888' }}>Loading...</div>;
    }

    return (
        <ExpenseContext.Provider value={{
            activeGroupId,
            groupName,
            users,
            expenses,
            transactions,
            createGroup,
            joinGroup,
            leaveGroup,
            addUser,
            deleteUser,
            addExpense,
            updateExpense,
            deleteExpense,
            resetAll,
            getBalancer
        }}>
            {children}
        </ExpenseContext.Provider>
    );
}

export function useExpense() {
    const context = useContext(ExpenseContext);
    if (context === undefined) {
        throw new Error('useExpense must be used within an ExpenseProvider');
    }
    return context;
}
