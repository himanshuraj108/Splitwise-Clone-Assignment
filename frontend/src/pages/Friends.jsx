import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendsAPI, balancesAPI } from '../api';
import toast from 'react-hot-toast';
import { Search, ChevronRight, UserMinus, AlignJustify } from 'lucide-react';

export default function Friends() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [summary, setSummary] = useState(null);

  const load = async () => {
    try {
      const [fRes, bRes] = await Promise.all([
        friendsAPI.list(),
        balancesAPI.user(),
      ]);
      setFriends(fRes.data);
      setSummary(bRes.data);
      const balMap = {};
      bRes.data.summary?.forEach(item => { balMap[item.friend.id] = item; });
      setBalances(balMap);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await friendsAPI.add(addEmail);
      toast.success('Friend added!');
      setAddEmail(''); setShowAdd(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.email?.[0] || err.response?.data?.detail || 'Could not find user with that email');
    } finally { setAdding(false); }
  };

  const handleRemove = async (e, friendId) => {
    e.stopPropagation();
    if (!window.confirm('Remove this friend?')) return;
    try {
      await friendsAPI.remove(friendId);
      toast.success('Friend removed');
      load();
    } catch { toast.error('Failed to remove'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const totalOwe = summary?.total_you_owe || 0;
  const totalOwed = summary?.total_owed_to_you || 0;

  return (
    <div>
      {/* TOP BAR - exact Splitwise */}
      <div className="top-bar">
        <Search size={20} color="#6c757d" style={{ cursor: 'pointer' }} />
        <span className="top-bar-title">Friends</span>
        <button
          id="add-friend-btn"
          className="btn btn-ghost"
          style={{ color: '#1CC29F', fontWeight: 600 }}
          onClick={() => setShowAdd(!showAdd)}
        >
          Add friends
        </button>
      </div>

      {/* Add friend input */}
      {showAdd && (
        <div style={{ padding: '12px 20px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
          <form onSubmit={handleAddFriend} style={{ display: 'flex', gap: 8 }}>
            <input
              id="friend-email-input"
              type="email"
              className="form-input"
              placeholder="Enter friend's email address"
              value={addEmail}
              onChange={e => setAddEmail(e.target.value)}
              required autoFocus
              style={{ flex: 1 }}
            />
            <button id="friend-add-submit" type="submit" className="btn btn-teal" disabled={adding}>
              {adding ? 'Adding...' : 'Add'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* TOTAL BALANCE CARD - exact Splitwise style */}
      {friends.length > 0 && (
        <div className="balance-card">
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
            🐘
          </div>
          <div className="balance-card-info">
            <div className="balance-card-title">Total balance</div>
            {totalOwe > 0.01 && (
              <div className="balance-card-line balance-card-owe">
                You owe ₹{totalOwe.toFixed(2)}
              </div>
            )}
            {totalOwed > 0.01 && (
              <div className="balance-card-line balance-card-owed">
                You are owed ₹{totalOwed.toFixed(2)}
              </div>
            )}
            {totalOwe <= 0.01 && totalOwed <= 0.01 && (
              <div style={{ fontSize: 13, color: '#6c757d' }}>All settled up!</div>
            )}
          </div>
          <div className="balance-card-icon">
            <AlignJustify size={16} />
          </div>
        </div>
      )}

      {/* FRIENDS LIST */}
      {friends.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No friends yet</h3>
          <p style={{ color: '#6c757d', marginBottom: 16 }}>Add friends to start splitting expenses</p>
          <button className="btn btn-teal" onClick={() => setShowAdd(true)}>Add friends</button>
        </div>
      ) : (
        <div style={{ background: 'white' }}>
          {friends.map((fs) => {
            const friend = fs.friend;
            const bal = balances[friend.id];
            const net = bal?.net_balance || 0;
            const status = bal?.status || 'settled';

            return (
              <div
                key={fs.id}
                className="friend-item"
                onClick={() => navigate(`/friends/${friend.id}`)}
              >
                <div
                  className="avatar avatar-md"
                  style={{ background: friend.avatar_color || '#1CC29F' }}
                >
                  {friend.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>

                <div className="friend-item-info">
                  <div className="friend-item-name">{friend.name}</div>
                </div>

                <div className="friend-item-right">
                  {status === 'owes_you' && (
                    <>
                      <div className="friend-owes-you">owes you</div>
                      <div style={{ fontWeight: 700, color: '#1CC29F', fontSize: 14 }}>₹{Math.abs(net).toFixed(2)}</div>
                    </>
                  )}
                  {status === 'you_owe' && (
                    <>
                      <div className="friend-you-owe">you owe</div>
                      <div style={{ fontWeight: 700, color: '#E87722', fontSize: 14 }}>₹{Math.abs(net).toFixed(2)}</div>
                    </>
                  )}
                  {status === 'settled' && (
                    <div className="friend-settled">settled up</div>
                  )}
                </div>

                <ChevronRight size={16} color="#dee2e6" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
