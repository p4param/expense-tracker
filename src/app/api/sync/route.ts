import { NextResponse } from 'next/server';
import { getGroup, saveGroup } from '@/lib/json-db';

// GET: Retrieve group data OR search by email
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const email = searchParams.get('email');

    if (email) {
        const { findGroupsByEmail } = await import('@/lib/json-db');
        const groups = await findGroupsByEmail(email);
        return NextResponse.json(groups);
    }

    if (!groupId) {
        return NextResponse.json({ error: 'Group ID required' }, { status: 400 });
    }

    const group = await getGroup(groupId);
    if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
}

// POST: Sync group data
export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get('groupId');
        const body = await request.json();

        if (!groupId) {
            return NextResponse.json({ error: 'Group ID required' }, { status: 400 });
        }

        const existing = await getGroup(groupId);
        if (!existing) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // Save users and expenses, preserving the group name
        await saveGroup(groupId, {
            name: existing.name,
            users: body.users,
            expenses: body.expenses
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
