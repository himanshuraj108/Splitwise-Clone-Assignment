import { useState, useEffect } from 'react';
import { expensesAPI, friendsAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { X, Plus, Minus, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'food', label: 'Dining out', icon: '🍽️', color: '#fce4ec' },
  { value: 'transport', label: 'Transport', icon: '🚗', color: '#e3f2fd' },
  { value: 'accommodation', label: 'Lodging', icon: '🏨', color: '#e8f5e9' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#f3e5f5' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#fff3e0' },
  { value: 'utilities', label: 'Utilities', icon: '💡', color: '#e0f7fa' },
  { value: 'health', label: 'Health', icon: '💊', color: '#fce4ec' },
  { value: 'other', label: 'General', icon: '💰', color: '#f5f5f5' },
];

const SPLIT_TYPES = [
  { value: 'equal', label: 'Equally' },
  { value: 'unequal', label: 'Exact amounts' },
  { value: 'percentage', label: 'By percentages' },
  { value: 'shares', label: 'By shares' },
];

export default function AddExpenseModal({ groupId, groupMembers, defaultFriendId, onClose, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState('main'); // main | category | split
  const [form, setForm] = useState({
    description: '',
    total_amount: '',
    paid_by_id: user.id,
    split_type: 'equal',
    category: 'food',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    group_id: groupId || null,
  });
  const [participants, setParticipants] = useState([]);
  const [splitInputs, setSplitInputs] = useState({});
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (groupMembers) {
      setParticipants(groupMembers);
    } else {
      friendsAPI.list().then(res => {
        setFriends(res.data);
        const defaultPeople = [{ id: user.id, name: user.name, avatar_color: user.avatar_color }];
        if (defaultFriendId) {
          const fs = res.data.find(f => f.friend.id === defaultFriendId);
          if (fs) defaultPeople.push(fs.friend);
        }
        setParticipants(defaultPeople);
      });
    }
  }, []);

  useEffect(() => {
    const inputs = {};
    participants.forEach(p => {
      inputs[p.id] = splitInputs[p.id] || { amount: '', percentage: '', shares: '1' };
    });
    setSplitInputs(inputs);
  }, [participants]);

  const total = parseFloat(form.total_amount) || 0;
  const n = participants.length;

  const getPreview = (userId) => {
    if (!total || n === 0) return '0.00';
    if (form.split_type === 'equal') {
      const each = total / n;
      return each.toFixed(2);
    }
    if (form.split_type === 'unequal') return splitInputs[userId]?.amount || '0.00';
    if (form.split_type === 'percentage') {
      const pct = parseFloat(splitInputs[userId]?.percentage || 0);
      return ((total * pct) / 100).toFixed(2);
    }
    if (form.split_type === 'shares') {
      const totalShares = participants.reduce((sum, p) => sum + parseFloat(splitInputs[p.id]?.shares || 1), 0);
      const shares = parseFloat(splitInputs[userId]?.shares || 1);
      return totalShares > 0 ? ((total * shares) / totalShares).toFixed(2) : '0.00';
    }
    return '0.00';
  };

  const splitLabel = () => {
    if (form.split_type === 'equal' && total > 0 && n > 0) {
      return `Paid by you and split equally (₹${(total / n).toFixed(2)}/person)`;
    }
    const payer = participants.find(p => p.id === form.paid_by_id);
    const payerName = payer?.id === user.id ? 'you' : payer?.name || 'you';
    const type = SPLIT_TYPES.find(s => s.value === form.split_type)?.label || 'equally';
    return `Paid by ${payerName} and split ${type}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) { toast.error('Add a description'); return; }
    if (!total || total <= 0) { toast.error('Enter a valid amount'); return; }
    if (participants.length < 1) { toast.error('Add at least one participant'); return; }

    setLoading(true);
    try {
      const splits = participants.map(p => ({
        user_id: p.id,
        amount: form.split_type === 'unequal' ? parseFloat(splitInputs[p.id]?.amount || 0) : undefined,
        percentage: form.split_type === 'percentage' ? parseFloat(splitInputs[p.id]?.percentage || 0) : undefined,
        shares: form.split_type === 'shares' ? parseFloat(splitInputs[p.id]?.shares || 1) : undefined,
      }));

      await expensesAPI.create({ ...form, total_amount: total, splits });
      toast.success('Expense added!');
      onSuccess?.();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      const msg = typeof data === 'string' ? data
        : data?.non_field_errors?.[0] || Object.values(data || {})[0] || 'Failed to add expense';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally { setLoading(false); }
  };

  const toggleParticipant = (person) => {
    if (person.id === user.id) return;
    if (participants.find(p => p.id === person.id)) {
      setParticipants(prev => prev.filter(p => p.id !== person.id));
    } else {
      setParticipants(prev => [...prev, person]);
    }
  };

  const currentCategory = CATEGORIES.find(c => c.value === form.category) || CATEGORIES[7];
  const totalPct = participants.reduce((sum, p) => sum + parseFloat(splitInputs[p.id]?.percentage || 0), 0);
  const totalUnequal = participants.reduce((sum, p) => sum + parseFloat(splitInputs[p.id]?.amount || 0), 0);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        {/* TEAL HEADER - exact Splitwise */}
        <div className="modal-header-teal">
          <button onClick={onClose} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
          <h2 style={{ flex: 1, textAlign: 'center' }}>Add an expense</h2>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}
          >
            {loading ? '...' : 'Save'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* "With you and: [group/friend]" */}
          <div className="exp-modal-with">
            With <strong>you</strong> and:{' '}
            {groupId ? (
              <span style={{ fontWeight: 600 }}>🏘️ {groupMembers?.length || 0} others</span>
            ) : (
              <span>
                {friends.slice(0, 3).map((fs, i) => (
                  <span key={fs.friend.id}>
                    <span
                      onClick={() => toggleParticipant(fs.friend)}
                      style={{
                        cursor: 'pointer',
                        fontWeight: 600,
                        color: participants.find(p => p.id === fs.friend.id) ? '#1CC29F' : '#adb5bd',
                      }}
                    >
                      {fs.friend.name}
                    </span>
                    {i < Math.min(friends.length, 3) - 1 ? ', ' : ''}
                  </span>
                ))}
                {friends.length === 0 && <span style={{ color: '#adb5bd' }}>no friends yet</span>}
              </span>
            )}
          </div>

          {/* ICON + DESCRIPTION */}
          <div className="exp-modal-icon-row">
            <div
              className="exp-category-icon-lg"
              style={{ background: currentCategory.color, cursor: 'pointer' }}
              onClick={() => setStep(step === 'category' ? 'main' : 'category')}
              title="Change category"
            >
              {currentCategory.icon}
            </div>
            <input
              id="expense-description"
              type="text"
              className="exp-desc-input"
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              autoFocus
            />
          </div>

          {/* Category picker (inline) */}
          {step === 'category' && (
            <div style={{ padding: '12px 24px', display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => { setForm(p => ({ ...p, category: cat.value })); setStep('main'); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                    borderRadius: 20, border: '1px solid',
                    borderColor: form.category === cat.value ? '#1CC29F' : '#dee2e6',
                    background: form.category === cat.value ? '#e8f9f5' : 'white',
                    cursor: 'pointer', fontSize: 13
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* AMOUNT */}
          <div className="exp-amount-row">
            <div className="exp-currency">₹</div>
            <input
              id="expense-amount"
              type="number"
              className="exp-amount-input"
              placeholder="0.00"
              value={form.total_amount}
              onChange={e => setForm(p => ({ ...p, total_amount: e.target.value }))}
              min="0.01" step="0.01"
            />
          </div>

          {/* SPLIT LABEL - clickable like Splitwise */}
          <div
            className="exp-split-bar"
            style={{ cursor: 'pointer' }}
            onClick={() => setStep(step === 'split' ? 'main' : 'split')}
          >
            <div className="exp-split-chip">{splitLabel()}</div>
          </div>

          {/* SPLIT DETAIL (expanded) */}
          {step === 'split' && (
            <div style={{ padding: '12px 24px 0', background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
              {/* Paid by */}
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Paid by</label>
                <select
                  id="expense-paid-by"
                  className="form-input"
                  value={form.paid_by_id}
                  onChange={e => setForm(p => ({ ...p, paid_by_id: e.target.value }))}
                >
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>{p.id === user.id ? `You (${p.name})` : p.name}</option>
                  ))}
                </select>
              </div>

              {/* Split type */}
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Split</label>
                <div className="split-chips" style={{ flexWrap: 'wrap' }}>
                  {SPLIT_TYPES.map(st => (
                    <button
                      key={st.value}
                      type="button"
                      className={`split-chip ${form.split_type === st.value ? 'active' : ''}`}
                      onClick={() => setForm(p => ({ ...p, split_type: st.value }))}
                      id={`split-${st.value}`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Per-person inputs */}
              <div style={{ marginBottom: 12 }}>
                {form.split_type === 'percentage' && (
                  <div style={{ fontSize: 12, marginBottom: 8, color: Math.abs(totalPct - 100) < 0.5 ? '#1CC29F' : '#E87722' }}>
                    {totalPct.toFixed(1)}% of 100%
                  </div>
                )}
                {form.split_type === 'unequal' && total > 0 && (
                  <div style={{ fontSize: 12, marginBottom: 8, color: Math.abs(totalUnequal - total) < 0.02 ? '#1CC29F' : '#E87722' }}>
                    ₹{totalUnequal.toFixed(2)} of ₹{total.toFixed(2)}
                  </div>
                )}
                {participants.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div className="avatar avatar-xs" style={{ background: p.avatar_color || '#1CC29F' }}>
                      {p.name?.slice(0, 1).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, fontSize: 13 }}>{p.id === user.id ? 'You' : p.name}</div>

                    {form.split_type === 'equal' && (
                      <span style={{ fontWeight: 700, color: '#1CC29F', fontSize: 13 }}>₹{getPreview(p.id)}</span>
                    )}
                    {form.split_type === 'unequal' && (
                      <input type="number" className="form-input" style={{ width: 100 }}
                        placeholder="0.00" value={splitInputs[p.id]?.amount || ''}
                        onChange={e => setSplitInputs(prev => ({ ...prev, [p.id]: { ...prev[p.id], amount: e.target.value } }))}
                        min="0" step="0.01" />
                    )}
                    {form.split_type === 'percentage' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input type="number" className="form-input" style={{ width: 70 }}
                          placeholder="0" value={splitInputs[p.id]?.percentage || ''}
                          onChange={e => setSplitInputs(prev => ({ ...prev, [p.id]: { ...prev[p.id], percentage: e.target.value } }))}
                          min="0" max="100" step="0.1" />
                        <span style={{ fontSize: 12 }}>% = ₹{getPreview(p.id)}</span>
                      </div>
                    )}
                    {form.split_type === 'shares' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button type="button" onClick={() => setSplitInputs(prev => ({ ...prev, [p.id]: { ...prev[p.id], shares: Math.max(0.5, parseFloat(prev[p.id]?.shares || 1) - 0.5).toString() } }))}
                          style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #dee2e6', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={12} />
                        </button>
                        <input type="number" className="form-input" style={{ width: 60, textAlign: 'center' }}
                          value={splitInputs[p.id]?.shares || '1'}
                          onChange={e => setSplitInputs(prev => ({ ...prev, [p.id]: { ...prev[p.id], shares: e.target.value } }))}
                          min="0.5" step="0.5" />
                        <button type="button" onClick={() => setSplitInputs(prev => ({ ...prev, [p.id]: { ...prev[p.id], shares: (parseFloat(prev[p.id]?.shares || 1) + 0.5).toString() } }))}
                          style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #dee2e6', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={12} />
                        </button>
                        <span style={{ fontSize: 12, color: '#1CC29F' }}>= ₹{getPreview(p.id)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOTTOM META BAR - date, group, etc. — exact Splitwise */}
          <div className="exp-modal-bottom">
            <div className="exp-modal-meta">
              <Calendar size={16} />
              <input
                id="expense-date"
                type="date"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#6c757d', cursor: 'pointer', width: 110 }}
              />
            </div>

            {!groupId && friends.length > 0 && (
              <div className="exp-modal-meta">
                <Users size={16} />
                <select
                  style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#6c757d', cursor: 'pointer' }}
                  value=""
                  onChange={e => {
                    const friend = friends.find(f => f.friend.id === e.target.value)?.friend;
                    if (friend) toggleParticipant(friend);
                  }}
                >
                  <option value="">Add person...</option>
                  {friends.map(fs => (
                    <option key={fs.friend.id} value={fs.friend.id}>
                      {participants.find(p => p.id === fs.friend.id) ? '✓ ' : ''}{fs.friend.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
