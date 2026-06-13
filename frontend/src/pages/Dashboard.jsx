import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { groupsAPI, balancesAPI } from '../api';
import { Plus, Users, FolderPlus, X, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  
  const [stats, setStats] = useState({ net: 0, owed: 0, owes: 0 });
  const [balanceData, setBalanceData] = useState([]);
  const [groupBalancesMap, setGroupBalancesMap] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      const res = await groupsAPI.list();
      const fetchedGroups = res.data;
      setGroups(fetchedGroups);

      if (fetchedGroups.length > 0) {
        const balancePromises = fetchedGroups.map(async (g) => {
          try {
            const balRes = await balancesAPI.groupBalances(g.id);
            const myBal = balRes.data.individual_balances.find(
              (ib) => ib.username === user?.username
            );
            return {
              id: g.id,
              name: g.name,
              balance: myBal ? myBal.balance : 0,
            };
          } catch (err) {
            console.error(`Failed to fetch balances for group ${g.id}`, err);
            return { id: g.id, name: g.name, balance: 0 };
          }
        });

        const results = await Promise.all(balancePromises);
        
        let net = 0;
        let owed = 0;
        let owes = 0;
        const balancesMap = {};

        results.forEach((r) => {
          net += r.balance;
          balancesMap[r.id] = r.balance;
          if (r.balance > 0) {
            owed += r.balance;
          } else {
            owes += Math.abs(r.balance);
          }
        });

        setStats({ net, owed, owes });
        setBalanceData(results);
        setGroupBalancesMap(balancesMap);
      } else {
        setStats({ net: 0, owed: 0, owes: 0 });
        setBalanceData([]);
        setGroupBalancesMap({});
      }
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
      navigate(`/group/${res.data.id}`);
    } catch (err) {
      toast.error('Failed to create group.');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-textPrimary tracking-tight">Dashboard</h1>
          <p className="text-textMuted text-sm mt-1">Welcome back, {user?.username}. Here is your shared expenses summary.</p>
        </div>
        <button 
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-3 rounded-xl font-heading font-semibold text-sm transition-all shadow-premium" 
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> Create Group
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-textMuted font-medium">
          Loading your dashboard...
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 bg-surface border border-dashed border-border rounded-3xl p-8 shadow-premium text-center">
          <FolderPlus size={48} className="text-textMuted mb-4" />
          <h3 className="font-heading text-lg font-bold text-textPrimary mb-2">No groups yet</h3>
          <p className="text-textMuted text-sm mb-6 max-w-sm">
            Get started by creating a new shared expense group for your flatmates, utilities, or travel trips.
          </p>
          <button 
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl font-heading font-semibold text-sm transition-colors shadow-premium" 
            onClick={() => setShowModal(true)}
          >
            Create First Group
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-premium relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Total Net Balance</span>
                <span className={`p-2 rounded-xl ${stats.net >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  <TrendingUp size={16} />
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-textPrimary font-heading">
                {stats.net >= 0 ? `₹${stats.net.toFixed(2)}` : `-₹${Math.abs(stats.net).toFixed(2)}`}
              </h2>
              <p className="text-xs text-textMuted mt-2">
                {stats.net >= 0 ? 'Net positive balance' : 'Net negative balance'}
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 shadow-premium">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">You are owed</span>
                <span className="p-2 rounded-xl bg-success/10 text-success">
                  <ArrowUpRight size={16} />
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-success font-heading">
                ₹{stats.owed.toFixed(2)}
              </h2>
              <p className="text-xs text-textMuted mt-2">To be collected from peers</p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 shadow-premium">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">You owe</span>
                <span className="p-2 rounded-xl bg-danger/10 text-danger">
                  <ArrowDownRight size={16} />
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-danger font-heading">
                ₹{stats.owes.toFixed(2)}
              </h2>
              <p className="text-xs text-textMuted mt-2">To be settled with peers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-heading text-lg font-bold text-textPrimary">Your Active Groups</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groups.map((g) => {
                  const grpBalance = groupBalancesMap[g.id] || 0;
                  return (
                    <div 
                      key={g.id} 
                      className="bg-surface border border-border rounded-2xl p-5 shadow-premium shadow-card-hover cursor-pointer flex flex-col justify-between"
                      onClick={() => navigate(`/group/${g.id}`)}
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 bg-accent-light text-accent rounded-xl flex items-center justify-center">
                            <Users size={18} />
                          </div>
                          <h4 className="font-heading font-bold text-textPrimary leading-tight truncate">{g.name}</h4>
                        </div>
                      </div>

                      <div className="space-y-3 mt-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-textMuted">Members: {g.members_count}</span>
                          <span className="text-textMuted">Joined {new Date(g.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="border-t border-border/60 pt-3 flex justify-between items-center">
                          <span className="text-xs text-textMuted">Your Balance:</span>
                          <span className={`text-sm font-bold ${grpBalance > 0 ? 'text-success' : grpBalance < 0 ? 'text-danger' : 'text-textMuted'}`}>
                            {grpBalance > 0 ? `+₹${grpBalance.toFixed(2)}` : grpBalance < 0 ? `-₹${Math.abs(grpBalance).toFixed(2)}` : 'Settled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 bg-surface border border-border rounded-3xl p-6 shadow-premium h-fit">
              <h3 className="font-heading text-lg font-bold text-textPrimary mb-1">Group Balance Visualizer</h3>
              <p className="text-textMuted text-xs mb-6">Net balance comparison across all of your active groups.</p>
              
              <div className="w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={balanceData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" horizontal={false} />
                    <XAxis type="number" stroke="#71717A" fontSize={11} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#71717A" fontSize={11} tickLine={false} width={80} />
                    <Tooltip 
                      cursor={{ fill: '#F4F4F5' }}
                      contentStyle={{ 
                        background: '#FFFFFF', 
                        border: '1px solid #E4E4E7', 
                        borderRadius: '8px', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        fontSize: '12px',
                        color: '#09090B'
                      }}
                      formatter={(value) => [`₹${parseFloat(value).toFixed(2)}`, 'Net Balance']}
                    />
                    <Bar dataKey="balance" radius={[0, 4, 4, 0]}>
                      {balanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.balance >= 0 ? '#2563EB' : '#DC2626'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div 
          className="fixed inset-0 bg-textPrimary/20 backdrop-blur-xs z-50 flex items-center justify-center p-4" 
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 shadow-premium relative animate-in fade-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-textMuted hover:text-textPrimary cursor-pointer transition-colors" 
              onClick={() => setShowModal(false)}
            >
              <X size={18} />
            </button>
            <h2 className="font-heading text-xl font-bold text-textPrimary mb-2">Create New Group</h2>
            <p className="text-textMuted text-xs mb-6">Initialize a shared expenses room for bills, trips, or projects.</p>
            
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Group Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary placeholder-textMuted/50 text-sm focus:outline-none focus:border-accent transition-colors"
                  placeholder="e.g. Flat 402 Utility, Europe Trip 2026"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  className="bg-background hover:bg-border/40 text-textPrimary border border-border px-4 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl font-heading font-semibold text-sm transition-colors shadow-premium cursor-pointer"
                >
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
