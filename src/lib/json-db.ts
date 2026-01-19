import fs from 'fs/promises';
import path from 'path';
import { User, Expense } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'store.json');

export interface GroupData {
    name: string;
    users: User[];
    expenses: Expense[];
}

interface AppData {
    groups: Record<string, GroupData>;
}

const DEFAULT_DATA: AppData = {
    groups: {}
};

export async function readData(): Promise<AppData> {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        if (!parsed.groups || typeof parsed.groups !== 'object') {
            return DEFAULT_DATA;
        }
        return parsed;
    } catch (error) {
        return DEFAULT_DATA;
    }
}

export async function writeData(data: AppData): Promise<void> {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error("Failed to write database:", error);
        throw error;
    }
}

export async function getGroup(groupId: string): Promise<GroupData | null> {
    const data = await readData();
    return data.groups[groupId] || null;
}

export async function saveGroup(groupId: string, groupData: GroupData): Promise<void> {
    const data = await readData();
    data.groups[groupId] = groupData;
    await writeData(data);
}

export async function findGroupsByEmail(email: string): Promise<Array<{ id: string, name: string }>> {
    const data = await readData();
    const results: Array<{ id: string, name: string }> = [];

    Object.entries(data.groups).forEach(([id, group]) => {
        // Check if any user in the group has this email
        const hasUser = group.users.some(u => u.email?.toLowerCase() === email.toLowerCase());
        if (hasUser) {
            results.push({ id, name: group.name });
        }
    });

    return results;
}
