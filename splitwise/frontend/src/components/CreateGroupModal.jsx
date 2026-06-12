import { useState } from 'react';
import { groupsAPI } from '../api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const GROUP_TYPES = [
  { value: 'trip', label: '✈️ Trip' },
  { value: 'home', label: '🏠 Home' },
  { value: 'couple', label: '❤️ Couple' },
  { value: 'other', label: '👥 Other' },
];

export default function CreateGroupModal({ onClose, onSuccess, defaultType = 'other' }) {
  const [form, setForm] = useState({ name: '', description: '', group_type: defaultType, member_emails: [] });
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addEmail = () => {
    if (!emailInput.trim()) return;
    if (form.member_emails.includes(emailInput.trim())) { toast.error('Already added'); return; }
    setForm(p => ({ ...p, member_emails: [...p.member_emails, emailInput.trim()] }));
    setEmailInput('');
  };

  const removeEmail = (email) => {
    setForm(p => ({ ...p, member_emails: p.member_emails.filter(e => e !== email) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await groupsAPI.create(form);
      toast.success('Group created! 🎉');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.name?.[0] || 'Failed to create group');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* TEAL HEADER */}
        <div className="modal-header-teal">
          <button onClick={onClose} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
          <h2 style={{ flex: 1, textAlign: 'center' }}>Start a new group</h2>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}
          >
            {loading ? '...' : 'Create'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Group name */}
            <div className="form-group">
              <label className="form-label">Group name *</label>
              <input
                id="group-name-input"
                type="text"
                className="form-input"
                placeholder="e.g. Goa Trip 2026"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required autoFocus
              />
            </div>

            {/* Group type */}
            <div className="form-group">
              <label className="form-label">Type</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {GROUP_TYPES.map(gt => (
                  <button
                    key={gt.value}
                    type="button"
                    className={`split-chip ${form.group_type === gt.value ? 'active' : ''}`}
                    onClick={() => setForm(p => ({ ...p, group_type: gt.value }))}
                    id={`group-type-${gt.value}`}
                    style={{ fontSize: 14, padding: '8px 16px' }}
                  >
                    {gt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <input
                id="group-description-input"
                type="text"
                className="form-input"
                placeholder="What's this group for?"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            {/* Invite members */}
            <div className="form-group">
              <label className="form-label">Add members by email</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="group-invite-email"
                  type="email"
                  className="form-input"
                  placeholder="friend@example.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEmail(); } }}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-teal" onClick={addEmail}>Add</button>
              </div>

              {form.member_emails.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {form.member_emails.map(email => (
                    <div key={email} style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px',
                      background: '#f1f3f5', borderRadius: 20, fontSize: 13, border: '1px solid #dee2e6'
                    }}>
                      {email}
                      <button
                        type="button"
                        onClick={() => removeEmail(email)}
                        style={{ color: '#adb5bd', cursor: 'pointer', background: 'none', border: 'none', fontSize: 16, lineHeight: 1 }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
