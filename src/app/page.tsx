'use client';

import { useRouter } from 'next/navigation';
import { useExpense } from '@/context/ExpenseContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import GroupSelector from '@/components/GroupSelector';
import styles from './dashboard.module.css'; // Renamed

export default function Home() {
  const router = useRouter();
  const {
    activeGroupId,
    groupName,
    users,
    expenses,
    transactions,
    deleteExpense,
    resetAll,
    leaveGroup
  } = useExpense();

  if (!activeGroupId) {
    return <GroupSelector />;
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to delete all expenses? Users will remain.')) {
      resetAll();
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="title">{groupName}</h1>
          <p className="subtitle" title="Share this code to invite others">ID: <strong>{activeGroupId}</strong></p>
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => router.push('/users')}>Members</Button>
          <Button onClick={() => router.push('/add')}>+ Expense</Button>
        </div>
      </header>

      {users.length === 0 ? (
        <Card className={styles.emptyState}>
          <h3>Welcome!</h3>
          <p>Start by adding some members to track expenses.</p>
          <Button onClick={() => router.push('/users')} fullWidth className={styles.mt}>Add Members</Button>
        </Card>
      ) : (
        <>
          <section>
            <h2 className={styles.sectionTitle}>Settlements</h2>
            {transactions.length === 0 ? (
              <Card className={styles.settledCard}>
                <p>All settled up! No one owes anything.</p>
              </Card>
            ) : (
              <div className={styles.debtList}>
                {transactions.map((t, idx) => {
                  const fromUser = users.find(u => u.id === t.from)?.name || 'Unknown';
                  const toUser = users.find(u => u.id === t.to)?.name || 'Unknown';
                  return (
                    <Card key={idx} className={styles.debtCard}>
                      <div className={styles.debtRow}>
                        <span className={styles.debtText}>
                          <strong>{fromUser}</strong> owes <strong>{toUser}</strong>
                        </span>
                        <span className={styles.debtAmount}>₹{t.amount.toFixed(2)}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Recent Expenses</h2>
            {expenses.length === 0 ? (
              <p className={styles.emptyText}>No expenses yet.</p>
            ) : (
              <div className={styles.expenseList}>
                {expenses.map(expense => {
                  const payer = users.find(u => u.id === expense.payerId)?.name || 'Unknown';
                  return (
                    <div
                      key={expense.id}
                      className={styles.expenseItem}
                      onClick={() => router.push(`/add?editId=${expense.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.expenseInfo}>
                        <span className={styles.expenseDesc}>{expense.description}</span>
                        <span className={styles.expenseMeta}>Paid by {payer} • {new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                      <div className={styles.expenseRight}>
                        <span className={styles.expenseAmount}>₹{expense.amount.toFixed(2)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteExpense(expense.id);
                          }}
                          className={styles.deleteBtn}
                          title="Delete Expense"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={handleReset} className={styles.resetBtn}>
              Reset All
            </button>
            <Button variant="secondary" onClick={leaveGroup}>
              Exit Group
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
