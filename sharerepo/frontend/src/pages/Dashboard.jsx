import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { groupsAPI } from '../api';
import { Plus, Users, FolderPlus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await groupsAPI.list();
      setGroups(res.data);
    } catch (err) {
      toast.error('Failed to load groups.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      const res = await groupsAPI.create({ name: newGroupName });
      toast.success('Group created successfully!');
      setNewGroupName('');
      setShowModal(false);
      // Navigate straight to the new group's details
      navigate(`/group/${res.data.id}`);
    } catch (err) {
      toast.error('Failed to create group.');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">My Expense Groups</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Create Group
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#9CA3AF' }}>Loading your groups...</div>
      ) : groups.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '300px', background: '#121620', border: '1px dashed #242E42', borderRadius: '20px', padding: '40px'
        }}>
          <FolderPlus size={48} color="#6B7280" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, marginBottom: '8px' }}>No groups yet</h3>
          <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '24px', textAlign: 'center', maxWidth: '320px' }}>
            Get started by creating a new shared expense group for your flatmates or travel trip.
          </p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Create First Group
          </button>
        </div>
      ) : (
        <div className="grid-container">
          {groups.map(g => (
            <div key={g.id} className="card" onClick={() => navigate(`/group/${g.id}`)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} color="#10B981" />
                </div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '18px' }}>{g.name}</h3>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9CA3AF' }}>
                <span>Members active: {g.members_count}</span>
                <span>Created {new Date(g.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-close" onClick={() => setShowModal(false)}>
              <X size={20} />
            </div>
            <h2 className="modal-title">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label className="form-label">Group Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Flat 402 Utility, Europe Trip 2026"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
