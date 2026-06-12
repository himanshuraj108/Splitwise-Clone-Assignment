import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsAPI } from '../api';
import toast from 'react-hot-toast';
import { Plus, ChevronRight } from 'lucide-react';
import CreateGroupModal from '../components/CreateGroupModal';

const GROUP_TYPE_ICONS = {
  trip: { icon: '✈️', color: '#e3f2fd' },
  home: { icon: '🏠', color: '#e8f5e9' },
  couple: { icon: '❤️', color: '#fce4ec' },
  other: { icon: '👥', color: '#f3e5f5' },
};

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    try {
      const res = await groupsAPI.list();
      setGroups(res.data);
    } catch { console.error('Failed to load groups'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      {/* TOP BAR */}
      <div className="top-bar">
        <span className="top-bar-title">Groups</span>
        <div className="top-bar-actions">
          <button
            id="create-group-btn"
            className="btn btn-teal btn-sm"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={15} /> Start a new group
          </button>
        </div>
      </div>

      <div className="page-wrap">
        {groups.length === 0 ? (
          <div style={{ border: '1px solid #e9ecef', borderRadius: 12, background: 'white' }}>
            <div className="empty-state">
              <div className="icon">👥</div>
              <h3>No groups yet</h3>
              <p>Create a group for a trip, home, or anything else</p>
              <button className="btn btn-teal" style={{ marginTop: 16 }} onClick={() => setShowCreate(true)}>
                <Plus size={15} /> Start a new group
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {groups.map(group => {
              const typeInfo = GROUP_TYPE_ICONS[group.group_type] || GROUP_TYPE_ICONS.other;
              return (
                <div
                  key={group.id}
                  className="group-card"
                  onClick={() => navigate(`/groups/${group.id}`)}
                  id={`group-${group.id}`}
                >
                  <div className="group-card-icon" style={{ background: typeInfo.color }}>
                    {typeInfo.icon}
                  </div>
                  <div className="group-card-name">{group.name}</div>
                  <div className="group-card-meta">
                    {group.member_count || group.members?.length || 0} members
                  </div>
                  {/* Member avatars */}
                  <div style={{ display: 'flex', marginTop: 12, gap: -4 }}>
                    {(group.members || []).slice(0, 5).map((m, i) => (
                      <div
                        key={m.user.id}
                        className="avatar avatar-xs"
                        style={{
                          background: m.user.avatar_color || '#1CC29F',
                          marginLeft: i > 0 ? -8 : 0,
                          border: '2px solid white',
                          zIndex: 5 - i
                        }}
                      >
                        {m.user.name?.slice(0, 1).toUpperCase()}
                      </div>
                    ))}
                    {(group.members || []).length > 5 && (
                      <div
                        className="avatar avatar-xs"
                        style={{ background: '#dee2e6', color: '#6c757d', marginLeft: -8, border: '2px solid white', fontSize: 9 }}
                      >
                        +{group.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
}
