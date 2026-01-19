'use client';

import { useState } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import styles from './GroupSelector.module.css';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function GroupSelector() {
    const { createGroup, joinGroup } = useExpense();
    const [mode, setMode] = useState<'create' | 'join' | 'find'>('create');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [groupId, setGroupId] = useState('');
    const [error, setError] = useState('');
    const [foundGroups, setFoundGroups] = useState<Array<{ id: string, name: string }>>([]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) return;

        const newGroupId = await createGroup(name, email);
        if (!newGroupId) {
            setError('Failed to create group. Please try again.');
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!groupId.trim()) return;

        const success = await joinGroup(groupId);
        if (!success) {
            setError('Group not found. Please check the ID.');
        }
    };

    const handleFind = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFoundGroups([]);
        if (!userEmail.trim()) return;

        try {
            const res = await fetch(`/api/sync?email=${encodeURIComponent(userEmail)}`);
            if (res.ok) {
                const groups = await res.json();
                if (groups.length === 0) {
                    setError('No groups found for this email.');
                } else {
                    setFoundGroups(groups);
                }
            }
        } catch (err) {
            setError('Failed to search groups.');
        }
    };

    return (
        <div className={styles.container}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 className="title">TripSplit</h1>
                <p className="subtitle">Collaborate with your group</p>
            </div>

            <Card className={styles.authCard}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${mode === 'create' ? styles.activeTab : ''}`}
                        onClick={() => setMode('create')}
                    >
                        Create
                    </button>
                    <button
                        className={`${styles.tab} ${mode === 'join' ? styles.activeTab : ''}`}
                        onClick={() => setMode('join')}
                    >
                        Join
                    </button>
                    <button
                        className={`${styles.tab} ${mode === 'find' ? styles.activeTab : ''}`}
                        onClick={() => setMode('find')}
                    >
                        My Groups
                    </button>
                </div>

                {mode === 'create' && (
                    <form onSubmit={handleCreate} className={styles.formStack}>
                        <Input
                            placeholder="Group Name (e.g. Goa Trip)"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                        <Input
                            type="email"
                            placeholder="Your Email (Optional)"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <Button type="submit" fullWidth>Create New Group</Button>
                    </form>
                )}

                {mode === 'join' && (
                    <form onSubmit={handleJoin} className={styles.formStack}>
                        <Input
                            placeholder="Enter Group ID"
                            value={groupId}
                            onChange={e => setGroupId(e.target.value)}
                            required
                        />
                        {error && <p className={styles.error}>{error}</p>}
                        <Button type="submit" fullWidth>Join Group</Button>
                    </form>
                )}

                {mode === 'find' && (
                    <div className={styles.formStack}>
                        <form onSubmit={handleFind} className={styles.formStack}>
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={userEmail}
                                onChange={e => setUserEmail(e.target.value)}
                                required
                            />
                            <Button type="submit" fullWidth>Find Groups</Button>
                        </form>

                        {error && <p className={styles.error}>{error}</p>}

                        {foundGroups.length > 0 && (
                            <div className={styles.groupList}>
                                <p className={styles.listTitle}>Select a group to join:</p>
                                {foundGroups.map(g => (
                                    <button
                                        key={g.id}
                                        className={styles.groupItem}
                                        onClick={() => joinGroup(g.id)}
                                    >
                                        <span className={styles.groupName}>{g.name}</span>
                                        <span className={styles.groupId}>ID: {g.id}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}
