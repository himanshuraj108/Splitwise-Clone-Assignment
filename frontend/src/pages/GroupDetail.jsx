import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupsAPI, expensesAPI, balancesAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { 
  ChevronLeft, 
  Settings, 
  Plus, 
  ChevronRight, 
  ArrowRight,
  Utensils, 
  Car, 
  Hotel, 
  Film, 
  ShoppingBag, 
  Lightbulb, 
  Activity, 
  DollarSign
} from 'lucide-react';
import AddExpenseModal from '../components/AddExpenseModal';
import SettleUpModal from '../components/SettleUpModal';

const CATEGORY_COLORS = {
  food: '#EE6C4D',         // orange-red
  transport: '#3D9BC1',    // blue
  accommodation: '#9B5DE5',// purple
  entertainment: '#F15BB5',// pink
  shopping: '#F4A261',     // sand orange
  utilities: '#00BBF9',    // light blue
  health: '#00F5D4',       // mint green
  other: '#888888'         // grey
};

const CATEGORY_ICONS = {
  food: <Utensils size={18} color="white" />,
  transport: <Car size={18} color="white" />,
  accommodation: <Hotel size={18} color="white" />,
  entertainment: <Film size={18} color="white" />,
  shopping: <ShoppingBag size={18} color="white" />,
  utilities: <Lightbulb size={18} color="white" />,
  health: <Activity size={18} color="white" />,
  other: <DollarSign size={18} color="white" />
};
const GROUP_COLORS = {
  trip: 'linear-gradient(160deg, #1a5276, #2980b9)',
  home: 'linear-gradient(160deg, #145a32, #27ae60)',
  couple: 'linear-gradient(160deg, #7b241c, #e74c3c)',
  other: 'linear-gradient(160deg, #4a235a, #8e44ad)',
};
const GROUP_ICONS = { trip: '✈️', home: '🏠', couple: '❤️', other: '👥' };

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [groupBalance, setGroupBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('expenses');
  const [showAdd, setShowAdd] = useState(false);
  const [settleTarget, setSettleTarget] = useState(null);

  const load = async () => {
    try {
      const [gRes, eRes, bRes] = await Promise.all([
        groupsAPI.get(id),
        expensesAPI.list({ group_id: id }),
        balancesAPI.group(id),
      ]);
      setGroup(gRes.data);
      setExpenses(eRes.data);
      setGroupBalance(bRes.data);
    } catch (e) { toast.error('Group not found'); navigate(-1); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await groupsAPI.removeMember(id, userId);
      toast.success('Member removed');
      load();
    } catch { toast.error('Failed to remove member'); }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Delete this group? All expenses will be lost.')) return;
    try {
      await groupsAPI.delete(id);
      toast.success('Group deleted');
      navigate('/groups');
    } catch { toast.error('Failed to delete group'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!group) return null;

  const headerBg = GROUP_COLORS[group.group_type] || GROUP_COLORS.other;
  const groupIcon = GROUP_ICONS[group.group_type] || '👥';
  const isAdmin = group.members?.find(m => m.user.id === user.id)?.role === 'admin';

  // Group expenses by month
  const grouped = {};
  expenses.forEach(exp => {
    const key = format(parseISO(exp.date), 'MMMM yyyy');
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(exp);
  });

  return (
    <div>
      {/* COLORED HEADER - exact Splitwise group detail */}
      <div style={{ background: headerBg, padding: '20px 24px 56px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 15 }}>
            <ChevronLeft size={20} />
          </button>
          {isAdmin && (
            <Settings
              size={20} color="white"
              style={{ cursor: 'pointer', opacity: 0.8 }}
              onClick={handleDeleteGroup}
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, flexShrink: 0,
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            {groupIcon}
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{group.name}</h1>
            {group.description && (
              <p style={{ fontSize: 14, opacity: 0.8 }}>{group.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* ACTION TABS */}
      <div style={{ background: 'white', padding: '12px 20px', display: 'flex', gap: 8, borderBottom: '1px solid #e9ecef', flexWrap: 'wrap' }}>
        <button
          className={`detail-tab ${tab === 'expenses' ? 'active-teal' : ''}`}
          onClick={() => setTab('expenses')}
        >
          Expenses
        </button>
        <button
          className={`detail-tab ${tab === 'balances' ? 'active-teal' : ''}`}
          onClick={() => setTab('balances')}
        >
          Balances
        </button>
        <button
          className={`detail-tab ${tab === 'members' ? 'active-teal' : ''}`}
          onClick={() => setTab('members')}
        >
          Members
        </button>
        <button
          id="add-group-expense-btn"
          className="btn btn-teal btn-sm"
          style={{ marginLeft: 'auto' }}
          onClick={() => setShowAdd(true)}
        >
          <Plus size={14} /> Add expense
        </button>
      </div>

      {/* TAB: EXPENSES */}
      {tab === 'expenses' && (
        <div style={{ background: 'white' }}>
          {expenses.length === 0 ? (
            <div className="empty-state">
              <DollarSign size={48} color="#ccc" style={{ marginBottom: 14, display: 'inline-block' }} />
              <h3>No expenses yet</h3>
              <p>Add the first expense to this group</p>
            </div>
          ) : (
            Object.entries(grouped).map(([month, items]) => (
              <div key={month}>
                <div className="month-header">{month}</div>
                {items.map(expense => {
                  const mySplit = expense.splits?.find(s => s.user.id === user.id);
                  const iPaid = expense.paid_by?.id === user.id;
                  const iOwe = !iPaid && mySplit;
                  const myOwed = iOwe ? Number(mySplit.amount_owed) : 0;
                  const theyOweAmt = iPaid
                    ? (expense.splits || []).filter(s => s.user.id !== user.id).reduce((sum, s) => sum + Number(s.amount_owed), 0)
                    : 0;

                  return (
                    <div key={expense.id} className="expense-item" onClick={() => navigate(`/expenses/${expense.id}`)}>
                      <div className="expense-date-col">
                        <div className="expense-date-month">{format(parseISO(expense.date), 'MMM')}</div>
                        <div className="expense-date-day">{format(parseISO(expense.date), 'd')}</div>
                      </div>
                      <div className="expense-category-icon" style={{ background: CATEGORY_COLORS[expense.category] || '#888888' }}>
                        {CATEGORY_ICONS[expense.category] || <DollarSign size={18} color="white" />}
                      </div>
                      <div className="expense-info">
                        <div className="expense-name">{expense.description}</div>
                        <div className="expense-sub">
                          {iPaid ? 'You paid' : `${expense.paid_by?.name} paid`} ₹{Number(expense.total_amount).toFixed(2)}
                        </div>
                      </div>
                      <div className="expense-amount-col">
                        {iOwe && (
                          <>
                            <div className="expense-you-borrowed">you borrowed</div>
                            <div className="expense-amount-orange">₹{myOwed.toFixed(2)}</div>
                          </>
                        )}
                        {iPaid && theyOweAmt > 0.01 && (
                          <>
                            <div className="expense-you-lent">you lent</div>
                            <div className="expense-amount-green">₹{theyOweAmt.toFixed(2)}</div>
                          </>
                        )}
                      </div>
                      <ChevronRight size={16} color="#dee2e6" />
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: BALANCES */}
      {tab === 'balances' && (
        <div style={{ background: 'white' }}>
          {/* Per-person balances */}
          {groupBalance?.balances?.length > 0 && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e9ecef' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#6c757d', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Group balances</h3>
              {groupBalance.balances.map(b => (
                <div key={b.user.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f3f5' }}>
                  <div className="avatar avatar-sm" style={{ background: b.user.avatar_color || '#1CC29F' }}>
                    {b.user.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
                    {b.user.id === user.id ? 'You' : b.user.name}
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 700,
                    color: b.net_balance > 0.01 ? '#1CC29F' : b.net_balance < -0.01 ? '#E87722' : '#6c757d'
                  }}>
                    {b.net_balance > 0.01 ? `gets back ₹${b.net_balance.toFixed(2)}`
                      : b.net_balance < -0.01 ? `owes ₹${Math.abs(b.net_balance).toFixed(2)}`
                        : 'settled up'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Simplified debts */}
          {groupBalance?.simplified_transactions?.length > 0 && (
            <div style={{ padding: '16px 20px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#6c757d', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Suggested settlements</h3>
              {groupBalance.simplified_transactions.map((txn, i) => {
                const isMe = txn.from_user.id === user.id;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f3f5' }}>
                    <div className="avatar avatar-sm" style={{ background: txn.from_user.avatar_color || '#E87722' }}>
                      {txn.from_user.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <ArrowRight size={16} color="#adb5bd" />
                    <div className="avatar avatar-sm" style={{ background: txn.to_user.avatar_color || '#1CC29F' }}>
                      {txn.to_user.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, fontSize: 14 }}>
                      <strong>{txn.from_user.id === user.id ? 'You' : txn.from_user.name}</strong>
                      {' → '}
                      <strong>{txn.to_user.id === user.id ? 'you' : txn.to_user.name}</strong>
                    </div>
                    <div style={{ fontWeight: 700, color: '#E87722', fontSize: 14 }}>₹{Number(txn.amount).toFixed(2)}</div>
                    {isMe && (
                      <button
                        className="btn btn-orange btn-sm"
                        onClick={() => setSettleTarget({ friend: txn.to_user, net: -txn.amount })}
                      >
                        Settle up
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {(!groupBalance?.simplified_transactions?.length) && (
            <div className="empty-state">
              <div className="icon">✅</div>
              <h3>All settled up!</h3>
              <p>No outstanding debts in this group</p>
            </div>
          )}
        </div>
      )}

      {/* TAB: MEMBERS */}
      {tab === 'members' && (
        <div style={{ background: 'white' }}>
          {group.members?.map(m => (
            <div key={m.user.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid #e9ecef' }}>
              <div className="avatar avatar-md" style={{ background: m.user.avatar_color || '#1CC29F' }}>
                {m.user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {m.user.id === user.id ? `${m.user.name} (you)` : m.user.name}
                </div>
                <div style={{ fontSize: 12, color: '#adb5bd', textTransform: 'capitalize' }}>{m.role}</div>
              </div>
              {isAdmin && m.user.id !== user.id && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveMember(m.user.id)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {isAdmin && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid #e9ecef' }}>
              <InviteMemberRow groupId={id} onSuccess={load} />
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <AddExpenseModal
          groupId={id}
          groupMembers={group.members?.map(m => m.user)}
          onClose={() => setShowAdd(false)}
          onSuccess={load}
        />
      )}
      {settleTarget && (
        <SettleUpModal
          friend={settleTarget.friend}
          netBalance={settleTarget.net}
          groupId={id}
          onClose={() => setSettleTarget(null)}
          onSuccess={load}
        />
      )}
    </div>
  );
}

function InviteMemberRow({ groupId, onSuccess }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await groupsAPI.invite(groupId, email);
      toast.success('Member invited!');
      setEmail('');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.email?.[0] || 'User not found');
    } finally { setLoading(false); }
  };
  return (
    <form onSubmit={handleInvite} style={{ display: 'flex', gap: 8 }}>
      <input
        id="invite-email-input"
        type="email"
        className="form-input"
        placeholder="Invite by email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{ flex: 1 }}
      />
      <button id="invite-submit" type="submit" className="btn btn-teal" disabled={loading}>
        {loading ? '...' : 'Invite'}
      </button>
    </form>
  );
}
