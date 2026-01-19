import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/json-db';
import { sendGroupCreatedEmail } from '@/lib/email';
import crypto from 'crypto';

// POST: Create a new group
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email } = body;

        if (!name) {
            return NextResponse.json({ error: 'Group name required' }, { status: 400 });
        }

        const data = await readData();
        const groupId = crypto.randomUUID().slice(0, 8);

        data.groups[groupId] = {
            name,
            users: [],
            expenses: []
        };

        await writeData(data);

        // Send email if provided
        if (email) {
            // We don't await this to avoid blocking the response
            sendGroupCreatedEmail(email, name, groupId).catch(console.error);
        }

        return NextResponse.json({ groupId, name });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
    }
}
