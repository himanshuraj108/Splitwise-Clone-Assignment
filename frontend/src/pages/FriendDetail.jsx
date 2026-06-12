import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { expensesAPI, balancesAPI, paymentsAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { 
  ChevronLeft, 
  Settings, 
  ChevronRight,
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

export default function FriendDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [tab, setTab] = useState('expenses');

  const load = async () => {
    try {
      const [eRes, pRes, bRes] = await Promise.all([
        expensesAPI.list({ friend_id: id }),
        paymentsAPI.list({ friend_id: id }),
        balancesAPI.friend(id),
      ]);
      setExpenses(eRes.data);
      setPayments(pRes.data);
      setBalance(bRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const friend = balance?.friend;
  const net = balance?.net_balance || 0;
  const status = balance?.status;

  // Group expenses by month
  const allItems = [
    ...expenses.map(e => ({ ...e, _type: 'expense' })),
    ...payments.map(p => ({ ...p, _type: 'payment' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const grouped = {};
  allItems.forEach(item => {
    const key = format(parseISO(item.date), 'MMMM yyyy');
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  // Header background: like real Splitwise (crimson/red for couples, etc.)
  const headerBg = 'linear-gradient(160deg, #8B0000 0%, #C0392B 100%)';

  return (
    <div>
      {/* COLORED HEADER - exact Splitwise friend detail */}
      <div style={{
        background: headerBg,
        padding: '20px 24px 56px',
        color: 'white',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 15 }}
          >
            <ChevronLeft size={20} /> Back
          </button>
          <Settings size={20} color="white" style={{ cursor: 'pointer', opacity: 0.8 }} />
        </div>

        {/* Friend avatar - circular with color */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: friend?.avatar_color || '#1CC29F',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: 'white',
            border: '3px solid rgba(255,255,255,0.3)'
          }}>
            {friend?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>

          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{friend?.name}</h1>
            <div style={{ fontSize: 15, opacity: 0.9 }}>
              {status === 'owes_you' && (
                <span>{friend?.name} owes you <span style={{ color: '#7fffd4', fontWeight: 700 }}>₹{Math.abs(net).toFixed(2)}</span></span>
              )}
              {status === 'you_owe' && (
                <span>You owe {friend?.name} <span style={{ color: '#ffb3a3', fontWeight: 700 }}>₹{Math.abs(net).toFixed(2)}</span></span>
              )}
              {status === 'settled' && (
                <span style={{ opacity: 0.7 }}>All settled up</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ACTION TABS - Settle up | Balances | Totals */}
      <div style={{ background: 'white', padding: '12px 20px', display: 'flex', gap: 8, borderBottom: '1px solid #e9ecef', marginTop: -1 }}>
        <button
          id="settle-up-btn"
          className={`detail-tab ${tab === 'expenses' ? 'active-orange' : ''}`}
          onClick={() => { setShowSettle(true); }}
        >
          Settle up
        </button>
        <button
          className={`detail-tab ${tab === 'balances' ? 'active-teal' : ''}`}
          onClick={() => setTab('balances')}
        >
          Balances
        </button>
        <button
          className={`detail-tab ${tab === 'expenses' ? 'active-teal' : ''}`}
          onClick={() => setTab('expenses')}
        >
          Totals
        </button>
        <button
          id="add-friend-expense-btn"
          className="btn btn-teal btn-sm"
          style={{ marginLeft: 'auto' }}
          onClick={() => setShowAdd(true)}
        >
          + Add expense
        </button>
      </div>

      {/* EXPENSE LIST - grouped by month, exact Splitwise style */}
      <div style={{ background: 'white' }}>
        {allItems.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} color="#ccc" style={{ marginBottom: 14, display: 'inline-block' }} />
            <h3>No activity yet</h3>
            <p>Add an expense with {friend?.name} to get started</p>
          </div>
        ) : (
          Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <div className="month-header">{month}</div>
              {items.map(item => {
                if (item._type === 'payment') {
                  const iPayer = item.payer?.id === user.id;
                  return (
                    <div key={item.id} className="expense-item" style={{ cursor: 'default' }}>
                      <div className="expense-date-col">
                        <div className="expense-date-month">{format(parseISO(item.date), 'MMM')}</div>
                        <div className="expense-date-day">{format(parseISO(item.date), 'd')}</div>
                      </div>
                      <div className="expense-category-icon" style={{ background: '#e8f9f5' }}>
                        <DollarSign size={18} color="#1CC29F" />
                      </div>
                      <div className="expense-info">
                        <div className="expense-name">
                          {iPayer ? `You paid ${item.payee?.name}` : `${item.payer?.name} paid you`}
                        </div>
                        <div className="expense-sub">{item.note || 'Payment'}</div>
                      </div>
                      <div className="expense-amount-col">
                        <div style={{ fontSize: 11, color: iPayer ? '#E87722' : '#1CC29F' }}>
                          {iPayer ? 'you paid' : 'they paid'}
                        </div>
                        <div style={{ fontWeight: 700, color: iPayer ? '#E87722' : '#1CC29F', fontSize: 14 }}>
                          ₹{Number(item.amount).toFixed(2)}
                        </div>
                      </div>
                      <ChevronRight size={16} color="#dee2e6" />
                    </div>
                  );
                }

                // Expense item
                const mySplit = item.splits?.find(s => s.user.id === user.id);
                const iPaid = item.paid_by?.id === user.id;
                const iOwe = !iPaid && mySplit;
                const theyOwe = iPaid;
                const myOwed = iOwe ? Number(mySplit.amount_owed) : 0;
                const theyOweAmt = theyOwe
                  ? (item.splits || []).filter(s => s.user.id !== user.id).reduce((sum, s) => sum + Number(s.amount_owed), 0)
                  : 0;

                return (
                  <div
                    key={item.id}
                    className="expense-item"
                    onClick={() => navigate(`/expenses/${item.id}`)}
                  >
                    <div className="expense-date-col">
                      <div className="expense-date-month">{format(parseISO(item.date), 'MMM')}</div>
                      <div className="expense-date-day">{format(parseISO(item.date), 'd')}</div>
                    </div>
                    <div className="expense-category-icon" style={{ background: CATEGORY_COLORS[item.category] || '#888888' }}>
                      {CATEGORY_ICONS[item.category] || <DollarSign size={18} color="white" />}
                    </div>
                    <div className="expense-info">
                      <div className="expense-name">{item.description}</div>
                      <div className="expense-sub">
                        {iPaid ? 'You paid' : `${item.paid_by?.name} paid`} ₹{Number(item.total_amount).toFixed(2)}
                      </div>
                    </div>
                    <div className="expense-amount-col">
                      {iOwe && (
                        <>
                          <div className="expense-you-borrowed">you borrowed</div>
                          <div className="expense-amount-orange">₹{myOwed.toFixed(2)}</div>
                        </>
                      )}
                      {theyOwe && theyOweAmt > 0.01 && (
                        <>
                          <div className="expense-you-lent">you lent</div>
                          <div className="expense-amount-green">₹{theyOweAmt.toFixed(2)}</div>
                        </>
                      )}
                      {!iOwe && !theyOwe && <div className="expense-settled">-</div>}
                    </div>
                    <ChevronRight size={16} color="#dee2e6" />
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <AddExpenseModal
          defaultFriendId={id}
          onClose={() => setShowAdd(false)}
          onSuccess={load}
        />
      )}
      {showSettle && (
        <SettleUpModal
          friend={friend}
          netBalance={net}
          onClose={() => setShowSettle(false)}
          onSuccess={load}
        />
      )}
    </div>
  );
}
