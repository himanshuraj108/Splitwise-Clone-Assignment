import { useState } from 'react';
import { paymentsAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { X, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function SettleUpModal({ friend, netBalance, groupId, onClose, onSuccess }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState(Math.abs(netBalance || 0).toFixed(2));
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  // net > 0: friend owes user → user is payee, net < 0: user owes friend → user is payer
  const userOwes = (netBalance || 0) < 0;
  const payer = userOwes ? user : friend;
  const payee = userOwes ? friend : user;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return; }
    setLoading(true);
    try {
      await paymentsAPI.create({
        payee_id: payee.id,
        amount: parseFloat(amount),
        group_id: groupId || null,
        note,
        date,
      });
      toast.success('Payment recorded! 🎉');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.amount?.[0] || 'Failed to record payment');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 380 }}>
        {/* TEAL HEADER - exact Splitwise */}
        <div className="modal-header-teal">
          <button onClick={() => navigate(-1)} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} onClick={onClose} />
          </button>
          <h2 style={{ flex: 1, textAlign: 'center' }}>Settle up</h2>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}
          >
            {loading ? '...' : 'Save'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* DIRECTION: avatar → arrow → avatar (exact Splitwise) */}
          <div className="settle-direction">
            <div style={{ textAlign: 'center' }}>
              <div
                className="avatar avatar-lg"
                style={{ background: payer.avatar_color || '#2c3e50', margin: '0 auto' }}
              >
                {payer.name?.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ fontSize: 13, color: '#6c757d', marginTop: 8 }}>
                {payer.id === user.id ? 'You' : payer.name}
              </div>
            </div>

            <div style={{ fontSize: 28, color: '#adb5bd', marginBottom: 20 }}>→</div>

            <div style={{ textAlign: 'center' }}>
              <div
                className="avatar avatar-lg"
                style={{ background: payee.avatar_color || '#e8b4a0', margin: '0 auto' }}
              >
                {payee.name?.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ fontSize: 13, color: '#6c757d', marginTop: 8 }}>
                {payee.id === user.id ? 'You' : payee.name}
              </div>
            </div>
          </div>

          {/* "You paid [Name]" text */}
          <p style={{ textAlign: 'center', fontSize: 15, color: '#6c757d', marginBottom: 16 }}>
            {payer.id === user.id ? 'You paid' : `${payer.name} paid`}{' '}
            {payee.id === user.id ? 'you' : payee.name}.
          </p>

          {/* AMOUNT ROW - exact Splitwise ₹ box + teal underline */}
          <div className="settle-amount-row">
            <div className="expense-currency-box" style={{ fontSize: 18, fontWeight: 700 }}>₹</div>
            <input
              id="settle-amount"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{
                border: 'none', borderBottom: '2px solid #1CC29F',
                fontSize: 32, fontWeight: 700, width: 160, textAlign: 'center',
                background: 'transparent', outline: 'none', color: '#212529'
              }}
              min="0.01" step="0.01" required
            />
          </div>

          {/* BOTTOM META */}
          <div className="expense-modal-bottom" style={{ marginTop: 8 }}>
            <div className="expense-modal-meta">
              <Calendar size={16} />
              <input
                id="settle-date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#6c757d', cursor: 'pointer' }}
              />
            </div>
            <div className="expense-modal-meta">
              <Users size={16} />
              <span>{groupId ? 'Group' : 'No group'}</span>
            </div>
          </div>

          {/* Note */}
          <div style={{ padding: '12px 24px 20px' }}>
            <input
              id="settle-note"
              type="text"
              className="form-input"
              placeholder="Add a note (e.g. GPay, cash)"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
