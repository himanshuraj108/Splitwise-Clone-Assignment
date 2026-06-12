import { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { groupsAPI } from '../api';
import { SplitwiseLogoMark } from '../components/SplitwiseLogo';
import toast from 'react-hot-toast';

export default function CreateGroup() {
  const { type } = useParams(); // 'apartment' or 'trip'
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Retrieve fetchGroups from Layout context to clear onboarding status once created
  const { refreshGroups } = useOutletContext() || {};

  // Map URL type param to internal group type
  const initialType = type === 'apartment' ? 'home' : (type === 'trip' ? 'trip' : 'other');
  
  // Set default placeholder based on type
  const placeholderName = type === 'apartment' ? '123 Sesame Street' : 'e.g. Goa Trip 2026';

  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState(initialType);
  const [members, setMembers] = useState([
    { name: '', email: '' },
    { name: '', email: '' },
    { name: '', email: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [simplifyDebts, setSimplifyDebts] = useState(true);

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const addMemberRow = () => {
    setMembers([...members, { name: '', email: '' }]);
  };

  const removeMemberRow = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    setLoading(true);

    // Filter out empty member emails
    const emails = members
      .map(m => m.email.trim())
      .filter(email => email !== '');

    try {
      const res = await groupsAPI.create({
        name: groupName.trim(),
        group_type: groupType,
        description: '',
        member_emails: emails,
        simplify_debts: simplifyDebts
      });

      toast.success('Group created successfully! 🎉');
      
      // Refresh groups list in Layout to switch shell view
      if (refreshGroups) {
        await refreshGroups();
      }

      // Navigate to the new group details
      navigate(`/groups/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.name?.[0] || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="new-group-container">
      <div className="new-group-content fade-in">
        
        {/* Left Column: Logo & File Upload */}
        <div className="new-group-left">
          <div className="new-group-logo-box">
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt="Group Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
              />
            ) : (
              <SplitwiseLogoMark size={160} />
            )}
          </div>
          <div className="new-group-file-upload">
            <input 
              type="file" 
              id="avatar-file-input" 
              style={{ display: 'none' }} 
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setAvatarFile(file);
                  setAvatarPreview(URL.createObjectURL(file));
                }
              }}
            />
            <button 
              type="button"
              className="new-group-file-btn"
              onClick={() => document.getElementById('avatar-file-input').click()}
            >
              Choose File
            </button>
            {!avatarFile && (
              <span className="new-group-file-txt">No file chosen</span>
            )}
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="new-group-right">
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="new-group-section-lbl">START A NEW GROUP</div>
            <h1 className="new-group-title">My group shall be called...</h1>
            
            <input
              type="text"
              className="new-group-name-input"
              placeholder={placeholderName}
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              required
              autoFocus
            />

            {groupName.trim() !== '' && (
              <>
                {/* Members Section */}
                <div className="new-group-members-section">
                  <div className="members-section-title slide-down-item delay-1">GROUP MEMBERS</div>
                  <div className="members-tip slide-down-item delay-2">
                    Tip: Lots of people to add? Send your friends an <span className="members-link">invite link</span>.
                  </div>

                  <div className="members-list">
                    {/* Current User Row */}
                    <div className="member-row current-user-row slide-down-item delay-3">
                      <div className="avatar avatar-sm" style={{ background: user?.avatar_color || '#1CC29F', fontSize: 10, border: '1px solid #ddd' }}>
                        {initials}
                      </div>
                      <span className="current-user-info">
                        {user?.name} <span style={{ color: '#888' }}>({user?.email})</span>
                      </span>
                    </div>

                    {/* Additional Member Rows */}
                    {members.map((member, idx) => (
                      <div key={idx} className={`member-row input-row slide-down-item delay-${4 + idx}`}>
                        <input
                          type="text"
                          placeholder="Name"
                          value={member.name}
                          onChange={e => handleMemberChange(idx, 'name', e.target.value)}
                          className="member-input name-input"
                        />
                        <input
                          type="email"
                          placeholder="Email address (optional)"
                          value={member.email}
                          onChange={e => handleMemberChange(idx, 'email', e.target.value)}
                          className="member-input email-input"
                        />
                        <button
                          type="button"
                          onClick={() => removeMemberRow(idx)}
                          className="member-remove-btn"
                          title="Remove person"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addMemberRow}
                    className={`add-person-btn slide-down-item delay-${4 + members.length}`}
                  >
                    + Add a person
                  </button>
                </div>

                {/* Group Type */}
                <div className={`new-group-type-section slide-down-item delay-${5 + members.length}`}>
                  <div className="type-section-title">GROUP TYPE</div>
                  <select
                    value={groupType}
                    onChange={e => setGroupType(e.target.value)}
                    className="new-group-type-select"
                  >
                    <option value="home">Home</option>
                    <option value="trip">Trip</option>
                    <option value="couple">Couple</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Settle up day */}
                <div className={`settle-up-day-section slide-down-item delay-${6 + members.length}`}>
                  <div className="settle-up-title">SETTLE UP DAY: OFF</div>
                  <p className="settle-up-desc">
                    Currently, the settle up day can only be changed on the Splitwise app. Please use the app to update this setting.
                  </p>
                </div>

                <div className={`slide-down-item delay-${7 + members.length}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                  <button
                    type="button"
                    className="advanced-settings-link"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    style={{ background: 'none', border: 'none', padding: 0, outline: 'none', textAlign: 'left' }}
                  >
                    {showAdvanced ? 'Hide advanced settings «' : 'Advanced settings »'}
                  </button>

                  {showAdvanced && (
                    <div className="advanced-settings-panel slide-down-item" style={{ marginBottom: 20, animationDuration: '0.2s' }}>
                      <label className="advanced-settings-label" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={simplifyDebts} 
                          onChange={e => setSimplifyDebts(e.target.checked)} 
                          className="advanced-settings-checkbox"
                          style={{ marginTop: 4, cursor: 'pointer' }}
                        />
                        <div className="advanced-settings-info" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span className="advanced-settings-title" style={{ fontWeight: 600, fontSize: 13.5, color: '#333' }}>Simplify group debts</span>
                          <span className="advanced-settings-desc" style={{ fontSize: 11.5, color: '#777', maxWidth: 360, lineHeight: 1.4 }}>
                            Automatically combine debts to reduce the total number of repayments between group members.
                          </span>
                        </div>
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="new-group-save-btn"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
