import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { groupsAPI, expensesAPI, paymentsAPI, balancesAPI, importsAPI } from '../api';
import { 
  Users, DollarSign, Calendar, FileText, ArrowRight, 
  Trash2, ChevronDown, ChevronUp, AlertCircle, CheckCircle, 
  Upload, X, Check, ArrowLeftRight, HelpCircle, Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const extractErrorMsg = (err, fallback) => {
  const data = err.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    if (data.non_field_errors && data.non_field_errors.length > 0) {
      return data.non_field_errors[0];
    }
    if (data.detail) {
      return data.detail;
    }
    for (const key in data) {
      const val = data[key];
      if (Array.isArray(val) && val.length > 0) {
        return `${key}: ${val[0]}`;
      }
      if (typeof val === 'string') {
        return `${key}: ${val}`;
      }
    }
  }
  return fallback;
};

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('expenses');
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  
  // Balances
  const [individualBalances, setIndividualBalances] = useState([]);
  const [simplifiedDebts, setSimplifiedDebts] = useState([]);
  const [detailedBreakdowns, setDetailedBreakdowns] = useState([]);
  const [expandedPeers, setExpandedPeers] = useState({}); // tracker for Rohan's list

  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);

  // New Expense Form State
  const [expDesc, setExpDesc] = useState('');
  const [expAmt, setExpAmt] = useState('');
  const [expCurrency, setExpCurrency] = useState('INR');
  const [expRate, setExpRate] = useState('1.0');
  const [expPayer, setExpPayer] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().substring(0, 10));
  const [expSplitType, setExpSplitType] = useState('EQUAL');

  // New Member Form State
  const [memEmail, setMemEmail] = useState('');
  const [memJoined, setMemJoined] = useState(new Date().toISOString().substring(0, 10));
  const [memLeft, setMemLeft] = useState('');

  // Settle Up Form State
  const [settlePayer, setSettlePayer] = useState('');
  const [settlePayee, setSettlePayee] = useState('');
  const [settleAmt, setSettleAmt] = useState('');
  const [settleDate, setSettleDate] = useState(new Date().toISOString().substring(0, 10));

  // CSV Import State
  const [csvFile, setCsvFile] = useState(null);
  const [importLog, setImportLog] = useState(null);
  const [pendingAnomalies, setPendingAnomalies] = useState([]);
  const [resolvedAnomalies, setResolvedAnomalies] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [anomalyResolutionData, setAnomalyResolutionData] = useState({});

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const gRes = await groupsAPI.get(groupId);
      setGroup(gRes.data);
      
      const mRes = await groupsAPI.listMemberships(groupId);
      setMembers(mRes.data);
      if (mRes.data.length > 0) {
        setExpPayer(mRes.data[0].user);
        setSettlePayer(mRes.data[0].user);
        if (mRes.data.length > 1) {
          setSettlePayee(mRes.data[1].user);
        }
      }

      // Load latest CSV import report if exists
      if (gRes.data.latest_import) {
        try {
          const rRes = await importsAPI.getImportReport(gRes.data.latest_import.id);
          setImportLog(rRes.data);
          setPendingAnomalies(rRes.data.pending_anomalies);
          setResolvedAnomalies(rRes.data.resolved_anomalies);
        } catch (err) {
          console.error("Failed to load latest import report", err);
        }
      }

      fetchExpenses();
      fetchPayments();
      fetchBalances();
    } catch (err) {
      toast.error('Failed to load group details.');
      navigate('/dashboard');
    }
  };

  const fetchExpenses = async () => {
    const res = await expensesAPI.list({ group: groupId });
    setExpenses(res.data);
  };

  const fetchPayments = async () => {
    const res = await paymentsAPI.list({ group: groupId });
    setPayments(res.data);
  };

  const fetchBalances = async () => {
    const res = await balancesAPI.groupBalances(groupId);
    setIndividualBalances(res.data.individual_balances);
    setSimplifiedDebts(res.data.simplified_debts);
    setDetailedBreakdowns(res.data.detailed_breakdowns);
  };

  // --- Handlers ---
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const data = {
        group: groupId,
        description: expDesc,
        amount: parseFloat(expAmt),
        currency: expCurrency,
        exchange_rate: parseFloat(expRate),
        paid_by: expPayer,
        date: expDate,
        split_type: expSplitType
      };
      await expensesAPI.create(data);
      toast.success('Expense added!');
      setShowExpenseModal(false);
      // Reset
      setExpDesc('');
      setExpAmt('');
      setExpCurrency('INR');
      setExpRate('1.0');
      fetchExpenses();
      fetchBalances();
    } catch (err) {
      toast.error(extractErrorMsg(err, 'Failed to add expense.'));
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const data = {
        email: memEmail,
        joined_at: memJoined,
        left_at: memLeft || null
      };
      await groupsAPI.addMembership(groupId, data);
      toast.success('Member added!');
      setShowMemberModal(false);
      setMemEmail('');
      setMemLeft('');
      fetchGroupDetails();
    } catch (err) {
      toast.error(extractErrorMsg(err, 'Failed to add member.'));
    }
  };

  const handleSettleUp = async (e) => {
    e.preventDefault();
    try {
      const data = {
        group: groupId,
        payer: settlePayer,
        payee: settlePayee,
        amount: parseFloat(settleAmt),
        currency: 'INR',
        exchange_rate: 1.0,
        date: settleDate
      };
      await paymentsAPI.create(data);
      toast.success('Settlement payment recorded!');
      setShowSettleModal(false);
      setSettleAmt('');
      fetchPayments();
      fetchBalances();
    } catch (err) {
      toast.error(extractErrorMsg(err, 'Failed to record payment.'));
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await expensesAPI.delete(id);
      toast.success('Expense deleted.');
      fetchExpenses();
      fetchBalances();
    } catch (err) {
      toast.error(extractErrorMsg(err, 'Failed to delete expense.'));
    }
  };

  // --- CSV Handlers ---
  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('group', groupId);

    try {
      const res = await importsAPI.uploadCSV(formData);
      toast.success('CSV uploaded successfully!');
      setImportLog(res.data);
      setPendingAnomalies(res.data.anomalies.filter(a => a.status === 'PENDING'));
      setResolvedAnomalies(res.data.anomalies.filter(a => a.status !== 'PENDING'));
      fetchExpenses();
      fetchBalances();
    } catch (err) {
      toast.error(extractErrorMsg(err, 'Failed to process CSV file.'));
    } finally {
      setUploading(false);
    }
  };

  const handleResolveAnomaly = async (anomalyId, action) => {
    const editInfo = anomalyResolutionData[anomalyId] || {};
    try {
      await importsAPI.resolveAnomaly(anomalyId, {
        action: action,
        edited_data: editInfo
      });
      toast.success(`Anomaly row ${action === 'APPROVE' ? 'approved & imported' : 'rejected'}`);
      
      // Refresh report
      if (importLog) {
        const res = await importsAPI.getImportReport(importLog.id || importLog.import_id);
        setImportLog(res.data);
        setPendingAnomalies(res.data.pending_anomalies);
        setResolvedAnomalies(res.data.resolved_anomalies);
      }
      
      fetchExpenses();
      fetchPayments();
      fetchBalances();
    } catch (err) {
      toast.error(extractErrorMsg(err, 'Failed to resolve anomaly.'));
    }
  };

  const togglePeerBreakdown = (username, peerName) => {
    const key = `${username}-${peerName}`;
    setExpandedPeers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper mapping names to custom styling colors
  const getUserAvatarColor = (name) => {
    const match = members.find(m => m.user_detail.username === name);
    return match ? match.user_detail.avatar_color : '#10B981';
  };

  return (
    <Layout>
      {group && (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-3xl font-extrabold text-textPrimary tracking-tight">{group.name}</h1>
              <p className="text-textMuted text-sm mt-1">
                Active Members: {members.length}
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                className="inline-flex items-center gap-2 bg-background hover:bg-border/40 text-textPrimary border border-border px-4 py-2.5 rounded-xl font-heading font-semibold text-sm transition-colors cursor-pointer" 
                onClick={() => setShowSettleModal(true)}
              >
                <ArrowLeftRight size={16} /> Settle Up
              </button>
              <button 
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-xl font-heading font-semibold text-sm transition-colors shadow-premium cursor-pointer" 
                onClick={() => setShowExpenseModal(true)}
              >
                <Plus size={16} /> Add Expense
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 border-b border-border/80 pb-px mb-8 overflow-x-auto">
            {[
              { id: 'expenses', label: 'Expenses Feed' },
              { id: 'members', label: 'Members Timeline' },
              { id: 'balances', label: 'Balances (Aisha/Rohan)' },
              { id: 'csv', label: 'Import CSV (Meera)' }
            ].map(tab => (
              <button
                key={tab.id}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-textMuted hover:text-textPrimary'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'expenses' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-150">
              {/* Left Column: Expenses Feed */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="font-heading text-lg font-bold text-textPrimary">Active Expenses</h3>
                {expenses.length === 0 ? (
                  <div className="text-textMuted py-12 text-center bg-surface border border-border rounded-2xl">
                    No active expenses logged. Click 'Add Expense' to create one.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses.map(e => (
                      <div key={e.id} className="bg-surface border border-border rounded-2xl p-5 shadow-premium flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div 
                            className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-heading font-bold text-sm shadow-sm flex-shrink-0" 
                            style={{ backgroundColor: getUserAvatarColor(e.paid_by_detail?.username) }}
                          >
                            {e.paid_by_detail?.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-heading font-bold text-textPrimary truncate">{e.description}</h4>
                            <p className="text-textMuted text-xs mt-0.5">
                              Paid by <span className="font-semibold text-textPrimary">{e.paid_by_detail?.username}</span> on {e.date}
                              {e.currency === 'USD' && ` • USD ${e.amount} (Rate: ${e.exchange_rate})`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <div className="font-heading font-extrabold text-base text-textPrimary">
                              ₹{e.currency === 'USD' ? (e.amount * e.exchange_rate).toFixed(2) : e.amount}
                            </div>
                            <span className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">Split: {e.split_type}</span>
                          </div>
                          <button 
                            className="p-2 text-textMuted hover:text-danger rounded-xl hover:bg-danger/5 transition-colors cursor-pointer" 
                            onClick={() => handleDeleteExpense(e.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Settlements Log */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="font-heading text-lg font-bold text-textPrimary">Settlements Log</h3>
                {payments.length === 0 ? (
                  <div className="text-textMuted py-12 text-center bg-surface border border-border rounded-2xl">
                    No payments logged yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map(p => (
                      <div key={p.id} className="bg-surface border border-border rounded-2xl p-4 shadow-premium flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div 
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-heading font-semibold text-xs flex-shrink-0" 
                            style={{ backgroundColor: getUserAvatarColor(p.payer_detail?.username) }}
                          >
                            {p.payer_detail?.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 text-sm text-textPrimary">
                            <span className="font-semibold">{p.payer_detail?.username}</span> paid <span className="font-semibold">{p.payee_detail?.username}</span>
                            <div className="text-textMuted text-[10px] mt-0.5">{p.date}</div>
                          </div>
                        </div>
                        <div className="font-heading font-bold text-success text-sm flex-shrink-0">
                          ₹{p.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-lg font-bold text-textPrimary">Group Members Timeline</h3>
                <button 
                  className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-xl font-heading font-semibold text-xs transition-colors shadow-premium cursor-pointer" 
                  onClick={() => setShowMemberModal(true)}
                >
                  <Plus size={14} /> Add Member
                </button>
              </div>

              <div className="bg-surface border border-border rounded-2xl shadow-premium overflow-hidden divide-y divide-border/60">
                {members.map(m => (
                  <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-background/40 transition-colors">
                    <div className="flex items-center gap-4">
                      <div 
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-heading font-bold text-sm shadow-sm flex-shrink-0" 
                        style={{ backgroundColor: m.user_detail.avatar_color }}
                      >
                        {m.user_detail.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-textPrimary text-base">{m.user_detail.username}</h4>
                        <p className="text-textMuted text-xs">{m.user_detail.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-xs text-textMuted">
                      <div>
                        <span className="font-semibold block text-[10px] text-textMuted uppercase tracking-wider mb-0.5">Joined</span>
                        <strong className="text-textPrimary text-sm font-medium">{m.joined_at}</strong>
                      </div>
                      <div>
                        <span className="font-semibold block text-[10px] text-textMuted uppercase tracking-wider mb-0.5">Left</span>
                        <strong className="text-textPrimary text-sm font-medium">{m.left_at || 'Present'}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'balances' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-150">
              {/* Left Column: Net Balances & Aisha's Simplified Payments */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h3 className="font-heading text-lg font-bold text-textPrimary mb-4">Individual Net Balances</h3>
                  <div className="bg-surface border border-border rounded-2xl p-5 shadow-premium space-y-3">
                    {individualBalances.map(ib => (
                      <div key={ib.username} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-heading font-semibold text-xs flex-shrink-0" 
                            style={{ backgroundColor: getUserAvatarColor(ib.username) }}
                          >
                            {ib.username.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-textPrimary text-sm">{ib.username}</span>
                        </div>
                        <span className={`text-sm font-bold ${ib.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                          {ib.balance >= 0 ? `Gets back ₹${ib.balance.toFixed(2)}` : `Owes ₹${Math.abs(ib.balance).toFixed(2)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-lg font-bold text-textPrimary mb-4">Aisha's Simplified Payments</h3>
                  <div className="bg-surface border border-border rounded-2xl p-5 shadow-premium space-y-3">
                    {simplifiedDebts.length === 0 ? (
                      <div className="text-textMuted py-4 text-center text-sm">All settled up! No transactions needed.</div>
                    ) : (
                      simplifiedDebts.map((d, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-sm text-textPrimary truncate">{d.from}</span>
                            <span className="text-accent flex-shrink-0">
                              <ArrowRight size={14} />
                            </span>
                            <span className="font-bold text-sm text-textPrimary truncate">{d.to}</span>
                          </div>
                          <strong className="ml-auto text-accent font-heading font-extrabold text-base">₹{d.amount.toFixed(2)}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Rohan's Detailed Audit Logs */}
              <div className="lg:col-span-7 space-y-6">
                <h3 className="font-heading text-lg font-bold text-textPrimary">Rohan's Detailed Audit Logs</h3>
                <div className="space-y-4">
                  {detailedBreakdowns.map(db => (
                    <div key={db.username} className="bg-surface border border-border rounded-2xl p-5 shadow-premium">
                      <h4 className="font-heading font-bold text-textPrimary mb-4 flex items-center gap-2">
                        <div 
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-white font-heading font-semibold text-[10px] flex-shrink-0" 
                          style={{ backgroundColor: getUserAvatarColor(db.username) }}
                        >
                          {db.username.substring(0, 2).toUpperCase()}
                        </div>
                        Breakdown for {db.username}
                      </h4>
                      <div className="space-y-3">
                        {db.peers.map(peer => {
                          const key = `${db.username}-${peer.peer_name}`;
                          const isExpanded = !!expandedPeers[key];
                          return (
                            <div key={peer.peer_name} className="border border-border/80 rounded-xl overflow-hidden">
                              <div 
                                className="flex justify-between items-center p-3.5 bg-background cursor-pointer hover:bg-border/10 transition-colors"
                                onClick={() => togglePeerBreakdown(db.username, peer.peer_name)}
                              >
                                <span className="font-semibold text-sm text-textPrimary">With {peer.peer_name}</span>
                                <div className="flex items-center gap-3">
                                  <span className={`text-sm font-bold ${peer.net_balance >= 0 ? 'text-success' : 'text-warning'}`}>
                                    {peer.net_balance >= 0 ? `+ ₹${peer.net_balance.toFixed(2)}` : `- ₹${Math.abs(peer.net_balance).toFixed(2)}`}
                                  </span>
                                  {isExpanded ? <ChevronUp size={16} className="text-textMuted" /> : <ChevronDown size={16} className="text-textMuted" />}
                                </div>
                              </div>
                              {isExpanded && (
                                <div className="p-3 bg-surface border-t border-border/40 divide-y divide-border/30">
                                  {peer.line_items.length === 0 ? (
                                    <div className="text-textMuted text-xs py-2 text-center">No direct line items.</div>
                                  ) : (
                                    peer.line_items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center py-2.5 text-xs">
                                        <span className="text-textMuted min-w-[70px]">{item.date}</span>
                                        <span className="font-medium text-textPrimary flex-1 px-4 truncate">{item.detail}</span>
                                        <span className={`font-bold ${item.type.includes('split_received') || item.type.includes('payment_made') ? 'text-success' : 'text-warning'}`}>
                                          ₹{item.amount_owed.toFixed(2)}
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'csv' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-150">
              {/* CSV Upload Pane */}
              <div className="lg:col-span-4 bg-surface border border-border rounded-2xl p-5 shadow-premium h-fit">
                <form onSubmit={handleCSVUpload} className="space-y-4">
                  <div className="border-2 border-dashed border-border hover:border-accent rounded-2xl p-6 text-center cursor-pointer transition-colors relative group">
                    <Upload size={32} className="text-textMuted mx-auto mb-3 group-hover:text-accent transition-colors" />
                    <div className="text-xs font-semibold text-textPrimary mb-1">Select spreadsheet CSV</div>
                    <div className="text-[10px] text-textMuted mb-4">Click or drag CSV file to ingest</div>
                    <input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {csvFile && (
                      <div className="text-xs text-accent font-semibold truncate bg-accent-light/50 p-2 rounded-lg border border-accent/20">
                        {csvFile.name}
                      </div>
                    )}
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 px-4 rounded-xl font-heading font-semibold text-sm transition-colors shadow-premium disabled:opacity-50 cursor-pointer"
                    disabled={uploading || !csvFile}
                  >
                    {uploading ? 'Processing CSV...' : 'Ingest Spreadsheet'}
                  </button>
                </form>
              </div>

              {/* CSV Review & Report Center */}
              <div className="lg:col-span-8 bg-surface border border-border rounded-3xl p-6 shadow-premium">
                <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                  <h4 className="font-heading text-lg font-bold text-textPrimary">Meera's Import Review Center</h4>
                  {importLog && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-textMuted">Status:</span>
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wide ${
                        importLog.status === 'PROCESSED' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {importLog.status === 'PROCESSED' ? 'Processed' : 'Needs Review'}
                      </span>
                    </div>
                  )}
                </div>

                {!importLog ? (
                  <div className="text-center py-12 text-textMuted text-sm">
                    Upload a CSV file to generate the anomaly report and review pending duplicates or changes.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingAnomalies.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-center">
                        <CheckCircle size={40} className="text-success mb-3" />
                        <h4 className="font-heading font-bold text-textPrimary text-base mb-1">All anomalies resolved</h4>
                        <p className="text-textMuted text-xs">The spreadsheet has been fully imported into the database.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex gap-2.5 items-center p-3 bg-danger/5 border border-danger/10 rounded-xl">
                          <AlertCircle size={18} className="text-danger flex-shrink-0" />
                          <span className="text-xs text-danger font-medium">
                            Found {pendingAnomalies.length} entries requiring Meera's review and approval before importing.
                          </span>
                        </div>

                        {pendingAnomalies.map(anomaly => (
                          <div key={anomaly.id} className="border border-border rounded-2xl overflow-hidden shadow-sm">
                            {/* Anomaly Header */}
                            <div className="bg-background p-4 border-b border-border/80 flex justify-between items-start gap-4">
                              <div>
                                <h5 className="font-heading font-bold text-textPrimary text-sm">
                                  Row {anomaly.row_index}: {anomaly.raw_data.description}
                                </h5>
                                <p className="text-textMuted text-xs mt-0.5">{anomaly.description}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                anomaly.anomaly_type === 'DUPLICATE' ? 'bg-warning/10 text-warning' :
                                anomaly.anomaly_type === 'SETTLEMENT_DISGUISED_AS_EXPENSE' ? 'bg-purple-100 text-purple-700' : 'bg-danger/10 text-danger'
                              }`}>
                                {anomaly.anomaly_type.replace(/_/g, ' ')}
                              </span>
                            </div>

                            {/* Anomaly Body */}
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-background border border-border/60 rounded-xl p-3 text-xs space-y-1.5">
                                <div className="text-textMuted font-semibold text-[10px] uppercase tracking-wider mb-1">Raw CSV Data</div>
                                <div className="flex justify-between"><span className="text-textMuted">Date:</span> <span className="font-medium text-textPrimary">{anomaly.raw_data.date}</span></div>
                                <div className="flex justify-between"><span className="text-textMuted">Amount:</span> <span className="font-medium text-textPrimary">{anomaly.raw_data.amount}</span></div>
                                <div className="flex justify-between"><span className="text-textMuted">Paid By:</span> <span className="font-medium text-textPrimary">{anomaly.raw_data.paid_by}</span></div>
                              </div>
                              
                              {/* Custom resolution fields */}
                              <div className="flex flex-col justify-center gap-3">
                                {anomaly.anomaly_type === 'CURRENCY_MISMATCH' && (
                                  <div>
                                    <label className="block text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Exchange Rate (USD/INR)</label>
                                    <input 
                                      type="number" 
                                      step="0.1"
                                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-textPrimary placeholder-textMuted/50 text-xs focus:outline-none focus:border-accent transition-colors" 
                                      value={anomalyResolutionData[anomaly.id]?.exchange_rate || '83.0'}
                                      onChange={(e) => setAnomalyResolutionData(prev => ({
                                        ...prev,
                                        [anomaly.id]: { ...prev[anomaly.id], exchange_rate: e.target.value }
                                      }))}
                                    />
                                  </div>
                                )}
                                {anomaly.anomaly_type === 'SETTLEMENT_DISGUISED_AS_EXPENSE' && (
                                  <div>
                                    <label className="block text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Identify Payee (recipient)</label>
                                    <select 
                                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-textPrimary text-xs focus:outline-none focus:border-accent transition-colors"
                                      value={anomalyResolutionData[anomaly.id]?.payee || ''}
                                      onChange={(e) => setAnomalyResolutionData(prev => ({
                                        ...prev,
                                        [anomaly.id]: { ...prev[anomaly.id], payee: e.target.value }
                                      }))}
                                    >
                                      <option value="">-- Choose member --</option>
                                      {members.map(m => (
                                        <option key={m.id} value={m.user_detail.username}>{m.user_detail.username}</option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                                {(anomaly.anomaly_type === 'MISSING_DATA' && !anomaly.raw_data.paid_by) && (
                                  <div>
                                    <label className="block text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Identify Payer (Who Paid)</label>
                                    <select 
                                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-textPrimary text-xs focus:outline-none focus:border-accent transition-colors"
                                      value={anomalyResolutionData[anomaly.id]?.paid_by || ''}
                                      onChange={(e) => setAnomalyResolutionData(prev => ({
                                        ...prev,
                                        [anomaly.id]: { ...prev[anomaly.id], paid_by: e.target.value }
                                      }))}
                                    >
                                      <option value="">-- Choose member --</option>
                                      {members.map(m => (
                                        <option key={m.id} value={m.user_detail.username}>{m.user_detail.username}</option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Anomaly Actions */}
                            <div className="bg-background p-3.5 border-t border-border/80 flex justify-end gap-3">
                              <button 
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-danger text-danger hover:bg-danger/5 font-semibold text-xs transition-colors cursor-pointer"
                                onClick={() => handleResolveAnomaly(anomaly.id, 'REJECT')}
                              >
                                <X size={12} /> Discard / Skip
                              </button>
                              <button 
                                className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                                onClick={() => handleResolveAnomaly(anomaly.id, 'APPROVE')}
                              >
                                <Check size={12} /> Approve & Import
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Add Expense Modal */}
          {showExpenseModal && (
            <div 
              className="fixed inset-0 bg-textPrimary/25 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" 
              onClick={() => setShowExpenseModal(false)}
            >
              <div 
                className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 shadow-premium relative animate-in fade-in zoom-in-95 duration-200" 
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  className="absolute top-4 right-4 text-textMuted hover:text-textPrimary cursor-pointer transition-colors" 
                  onClick={() => setShowExpenseModal(false)}
                >
                  <X size={18} />
                </button>
                <h2 className="font-heading text-xl font-bold text-textPrimary mb-2">Add Expense</h2>
                <p className="text-textMuted text-xs mb-6">Log a new group cost to be split equally.</p>
                
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Description</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary placeholder-textMuted/50 text-sm focus:outline-none focus:border-accent transition-colors" 
                      placeholder="e.g. Electricity, Dinner trip" 
                      value={expDesc} 
                      onChange={(e) => setExpDesc(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Amount</label>
                      <input 
                        type="number" 
                        step="0.01"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary placeholder-textMuted/50 text-sm focus:outline-none focus:border-accent transition-colors" 
                        placeholder="0.00" 
                        value={expAmt} 
                        onChange={(e) => setExpAmt(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="w-[120px]">
                      <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Currency</label>
                      <select 
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary text-sm focus:outline-none focus:border-accent transition-colors" 
                        value={expCurrency} 
                        onChange={(e) => setExpCurrency(e.target.value)}
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>

                  {expCurrency === 'USD' && (
                    <div>
                      <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">USD to INR Exchange Rate</label>
                      <input 
                        type="number" 
                        step="0.01"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary text-sm focus:outline-none focus:border-accent transition-colors" 
                        value={expRate} 
                        onChange={(e) => setExpRate(e.target.value)} 
                        required 
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Paid By</label>
                    <select 
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary text-sm focus:outline-none focus:border-accent transition-colors" 
                      value={expPayer} 
                      onChange={(e) => setExpPayer(e.target.value)} 
                      required
                    >
                      <option value="">-- Select Payer --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.user}>{m.user_detail.username}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Date</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary text-sm focus:outline-none focus:border-accent transition-colors" 
                      value={expDate} 
                      onChange={(e) => setExpDate(e.target.value)} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Split Type</label>
                    <select 
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary text-sm focus:outline-none focus:border-accent transition-colors" 
                      value={expSplitType} 
                      onChange={(e) => setExpSplitType(e.target.value)}
                    >
                      <option value="EQUAL">Split Equally</option>
                    </select>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <button 
                      type="button" 
                      className="bg-background hover:bg-border/40 text-textPrimary border border-border px-4 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer" 
                      onClick={() => setShowExpenseModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl font-heading font-semibold text-sm transition-colors shadow-premium cursor-pointer"
                    >
                      Save Expense
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Member Modal */}
          {showMemberModal && (
            <div 
              className="fixed inset-0 bg-textPrimary/25 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" 
              onClick={() => setShowMemberModal(false)}
            >
              <div 
                className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 shadow-premium relative animate-in fade-in zoom-in-95 duration-200" 
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  className="absolute top-4 right-4 text-textMuted hover:text-textPrimary cursor-pointer transition-colors" 
                  onClick={() => setShowMemberModal(false)}
                >
                  <X size={18} />
                </button>
                <h2 className="font-heading text-xl font-bold text-textPrimary mb-2">Invite Group Member</h2>
                <p className="text-textMuted text-xs mb-6">Add someone to the group for splitting future expenses.</p>
                
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">User Email / Username</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary placeholder-textMuted/50 text-sm focus:outline-none focus:border-accent transition-colors" 
                      placeholder="e.g. sam@example.com or sam" 
                      value={memEmail} 
                      onChange={(e) => setMemEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Joined Date</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary text-sm focus:outline-none focus:border-accent transition-colors" 
                      value={memJoined} 
                      onChange={(e) => setMemJoined(e.target.value)} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Leave Date (Optional)</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary text-sm focus:outline-none focus:border-accent transition-colors" 
                      value={memLeft} 
                      onChange={(e) => setMemLeft(e.target.value)} 
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <button 
                      type="button" 
                      className="bg-background hover:bg-border/40 text-textPrimary border border-border px-4 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer" 
                      onClick={() => setShowMemberModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl font-heading font-semibold text-sm transition-colors shadow-premium cursor-pointer"
                    >
                      Add Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Settle Up Modal */}
          {showSettleModal && (
            <div 
              className="fixed inset-0 bg-textPrimary/25 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" 
              onClick={() => setShowSettleModal(false)}
            >
              <div 
                className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 shadow-premium relative animate-in fade-in zoom-in-95 duration-200" 
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  className="absolute top-4 right-4 text-textMuted hover:text-textPrimary cursor-pointer transition-colors" 
                  onClick={() => setShowSettleModal(false)}
                >
                  <X size={18} />
                </button>
                <h2 className="font-heading text-xl font-bold text-textPrimary mb-2">Record Settlement</h2>
                <p className="text-textMuted text-xs mb-6">Log a payment between members to clear debts.</p>
                
                <form onSubmit={handleSettleUp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Payer (Who Paid)</label>
                    <select 
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary text-sm focus:outline-none focus:border-accent transition-colors" 
                      value={settlePayer} 
                      onChange={(e) => setSettlePayer(e.target.value)} 
                      required
                    >
                      <option value="">-- Choose payer --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.user}>{m.user_detail.username}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Payee (Who Received)</label>
                    <select 
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary text-sm focus:outline-none focus:border-accent transition-colors" 
                      value={settlePayee} 
                      onChange={(e) => setSettlePayee(e.target.value)} 
                      required
                    >
                      <option value="">-- Choose recipient --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.user}>{m.user_detail.username}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Amount (INR)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary placeholder-textMuted/50 text-sm focus:outline-none focus:border-accent transition-colors" 
                      placeholder="0.00" 
                      value={settleAmt} 
                      onChange={(e) => setSettleAmt(e.target.value)} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Date</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textPrimary text-sm focus:outline-none focus:border-accent transition-colors" 
                      value={settleDate} 
                      onChange={(e) => setSettleDate(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <button 
                      type="button" 
                      className="bg-background hover:bg-border/40 text-textPrimary border border-border px-4 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer" 
                      onClick={() => setShowSettleModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl font-heading font-semibold text-sm transition-colors shadow-premium cursor-pointer"
                    >
                      Record Settlement
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
