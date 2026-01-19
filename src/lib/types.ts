export interface User {
    id: string;
    name: string;
    email?: string;
}

export interface Expense {
    id: string;
    payerId: string;
    amount: number;
    description: string;
    date: string;
    involvedUserIds: string[];
}

export interface Transaction {
    from: string;
    to: string;
    amount: number;
}

export interface Group {
    id: string;
    name: string;
    users: User[];
    expenses: Expense[];
}
