import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { expensesAPI, chatAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, Trash2, Edit3, Send } from 'lucide-react';

const CATEGORY_COLORS = {
  food: '#fce4ec', transport: '#e3f2fd', accommodation: '#e8f5e9',
  entertainment: '#f3e5f5', shopping: '#fff3e0', utilities: '#e0f7fa',
  health: '#fce4ec', other: '#f5f5f5'
};
const CATEGORY_ICONS = {
  food: '🍽️', transport: '🚗', accommodation: '🏨',
  entertainment: '🎬', shopping: '🛍️', utilities: '💡',
  health: '💊', other: '💰'
};

export default function ExpenseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expense, setExpense] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);
  const pollRef = useRef(null);

  const loadMessages = async () => {
    try {
      const res = await chatAPI.messages(id);
      setMessages(res.data);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) { console.error(e); }
  };

  const load = async () => {
    try {
      const res = await expensesAPI.get(id);
      setExpense(res.data);
      await loadMessages();
    } catch {
      toast.error('Expense not found');
      navigate(-1);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await chatAPI.send(id, newMessage.trim());
      setNewMessage('');
      await loadMessages();
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expensesAPI.delete(id);
      toast.success('Expense deleted');
      navigate(-1);
    } catch { toast.error('Failed to delete expense'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!expense) return null;

  const canDelete = expense.created_by?.id === user.id || expense.paid_by?.id === user.id;
  const catIcon = CATEGORY_ICONS[expense.category] || '💰';
  const catColor = CATEGORY_COLORS[expense.category] || '#f5f5f5';

  // Spending by category chart (last 3 months mock based on amount)
  const months = ['May', 'June', 'July'];
  const expDate = parseISO(expense.date);
  const expMonth = format(expDate, 'MMMM');
  const maxAmt = Number(expense.total_amount);

  return (
    <div>
      {/* TOP BAR - teal, exact Splitwise "Details" header */}
      <div style={{
        background: '#1CC29F',
        padding: '0 20px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'white',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <button onClick={() => navigate(-1)} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={20} /> Back
        </button>
        <span style={{ fontWeight: 700, fontSize: 17 }}>Details</span>
        <div style={{ display: 'flex', gap: 12 }}>
          {canDelete && (
            <button onClick={handleDelete} title="Delete" style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Trash2 size={18} />
            </button>
          )}
          <Edit3 size={18} style={{ opacity: 0.5 }} />
        </div>
      </div>

      <div style={{ background: 'white', maxWidth: 680, margin: '0 auto' }}>
        {/* EXPENSE HEADER - like Splitwise details screen */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e9ecef' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 56, height: 56, background: catColor, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
              {catIcon}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{expense.description}</h1>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#212529', marginBottom: 8 }}>
                ₹{Number(expense.total_amount).toFixed(2)}
              </div>
              {expense.group && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f3f5', borderRadius: 20, padding: '4px 12px', fontSize: 13, color: '#6c757d', marginBottom: 8 }}>
                  👥 {expense.group?.name}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 13, color: '#6c757d', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div>{format(parseISO(expense.date), 'MMMM d, yyyy')}</div>
            <div>Added by {expense.created_by?.id === user.id ? 'you' : expense.created_by?.name} on {format(parseISO(expense.created_at), 'MMMM d, yyyy')}</div>
          </div>
        </div>

        {/* SPLITS - "You paid $X" tree style, exact Splitwise */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e9ecef' }}>
          {/* Payer row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div className="avatar avatar-md" style={{ background: expense.paid_by?.avatar_color || '#1CC29F' }}>
              {expense.paid_by?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              {expense.paid_by?.id === user.id ? 'You' : expense.paid_by?.name} paid{' '}
              <strong>₹{Number(expense.total_amount).toFixed(2)}</strong>
            </div>
          </div>

          {/* Split lines (tree style) */}
          <div style={{ marginLeft: 28, borderLeft: '2px solid #e9ecef', paddingLeft: 20 }}>
            {expense.splits?.map(split => (
              <div key={split.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div className="avatar avatar-sm" style={{ background: split.user.avatar_color || '#6c757d' }}>
                  {split.user.name?.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, fontSize: 14 }}>
                  {split.user.id === user.id ? 'You' : split.user.name} owe{split.user.id !== user.id ? 's' : ''}{' '}
                  <strong>₹{Number(split.amount_owed).toFixed(2)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SPENDING BY CATEGORY - exact Splitwise chart */}
        <div style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
          <div style={{ padding: '10px 24px', background: '#f1f3f5', borderBottom: '1px solid #e9ecef', fontWeight: 700, fontSize: 13, color: '#495057', letterSpacing: 0.3 }}>
            Spending by category
          </div>
          <div className="spending-chart">
            <div className="spending-chart-title">{expense.group?.name || 'Personal'} :: {expense.category}</div>
            {['Previous month', format(parseISO(expense.date), 'MMMM'), 'Next month'].map((label, i) => {
              const amt = i === 1 ? Number(expense.total_amount) : 0;
              return (
                <div className="chart-row" key={label}>
                  <div className="chart-label" style={{ fontSize: 11 }}>{label === format(parseISO(expense.date), 'MMMM') ? label : label === 'Previous month' ? format(new Date(expDate.getFullYear(), expDate.getMonth() - 1, 1), 'MMM') : format(new Date(expDate.getFullYear(), expDate.getMonth() + 1, 1), 'MMM')}</div>
                  <div className="chart-bar-wrap">
                    <div className="chart-bar-inner" style={{ width: amt > 0 ? `${Math.min(100, (amt / maxAmt) * 100)}%` : '2px', background: amt > 0 ? '#d4edda' : 'transparent' }} />
                    {amt === 0 && <div style={{ position: 'absolute', left: 0, top: 0, width: 1, height: '100%', background: '#dee2e6' }} />}
                  </div>
                  <div className="chart-value">₹{amt.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COMMENTS/CHAT */}
        <div style={{ padding: '16px 24px 24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#6c757d', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Notes &amp; comments
          </h3>
          {expense.notes && (
            <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 14, color: '#6c757d', fontStyle: 'italic' }}>
              "{expense.notes}"
            </div>
          )}

          <div className="chat-wrap">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: '#adb5bd', fontSize: 13 }}>
                  No comments yet
                </div>
              ) : messages.map(msg => (
                <div key={msg.id} className={`chat-msg ${msg.user.id === user.id ? 'own' : ''}`}>
                  {msg.user.id !== user.id && (
                    <div className="avatar avatar-xs" style={{ background: msg.user.avatar_color || '#1CC29F', flexShrink: 0 }}>
                      {msg.user.name?.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    {msg.user.id !== user.id && (
                      <div style={{ fontSize: 11, color: '#adb5bd', marginBottom: 2 }}>{msg.user.name}</div>
                    )}
                    <div className={`chat-bubble ${msg.user.id === user.id ? 'chat-bubble-own' : 'chat-bubble-other'}`}>
                      {msg.content}
                    </div>
                    <div className="chat-time" style={{ textAlign: msg.user.id === user.id ? 'right' : 'left' }}>
                      {format(parseISO(msg.created_at), 'h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form className="chat-input-bar" onSubmit={handleSend}>
              <input
                id="chat-input"
                className="chat-text-input"
                placeholder="Add a comment..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <button
                id="chat-send-btn"
                type="submit"
                className="chat-send-btn"
                disabled={sending || !newMessage.trim()}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
