'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExpense } from '@/context/ExpenseContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import styles from './page.module.css';

export default function UsersPage() {
    const router = useRouter();
    const { users, addUser, deleteUser } = useExpense();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            addUser(name, email);
            setName('');
            setEmail('');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className="title">Members</h1>

            <Card className={styles.addCard}>
                <form onSubmit={handleSubmit} className={styles.addForm}>
                    <Input
                        placeholder="Enter Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                    <Input
                        type="email"
                        placeholder="Email (Optional)"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <Button type="submit">Add Member</Button>
                </form>
            </Card>

            <div className={styles.list}>
                {users.length === 0 ? (
                    <p className={styles.empty}>No members added yet.</p>
                ) : (
                    users.map(user => (
                        <div key={user.id} className={styles.userItem}>
                            <div className={styles.userInfo}>
                                <div className={styles.avatar}>{user.name[0].toUpperCase()}</div>
                                <span>{user.name}</span>
                            </div>
                            <button
                                className={styles.deleteUserBtn}
                                onClick={() => {
                                    const success = deleteUser(user.id);
                                    if (!success) {
                                        alert('Cannot delete user involved in expenses.');
                                    }
                                }}
                                title="Delete User"
                            >
                                ×
                            </button>
                        </div>
                    ))
                )}
            </div>

            <Button className={styles.backBtn} variant="secondary" onClick={() => router.push('/')}>
                Back to TripSplit
            </Button>
        </div>
    );
}
