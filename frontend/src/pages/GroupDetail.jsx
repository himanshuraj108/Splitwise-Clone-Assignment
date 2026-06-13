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
        const res = await importsAPI.getImportReport(importLog.id);
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
          <div className="page-header">
            <div>
              <h1 className="page-title">{group.name}</h1>
              <p style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '4px' }}>
                Active Members: {members.length}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setShowSettleModal(true)}>
                <ArrowLeftRight size={18} /> Settle Up
              </button>
              <button className="btn btn-primary" onClick={() => setShowExpenseModal(true)}>
                <Plus size={18} /> Add Expense
              </button>
            </div>
          </div>

          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
              onClick={() => setActiveTab('expenses')}
            >
              Expenses Feed
            </div>
            <div 
              className={`tab ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              Members Timeline
            </div>
            <div 
              className={`tab ${activeTab === 'balances' ? 'active' : ''}`}
              onClick={() => setActiveTab('balances')}
            >
              Balances (Aisha/Rohan)
            </div>
            <div 
              className={`tab ${activeTab === 'csv' ? 'active' : ''}`}
              onClick={() => setActiveTab('csv')}
            >
              Import CSV (Meera)
            </div>
          </div>

          {/* TABS CONTENT */}

          {/* Tab 1: Expenses */}
          {activeTab === 'expenses' && (
            <div>
              <div className="grid-container" style={{ gridTemplateColumns: '1.8fr 1.2fr' }}>
                {/* Left: Expenses feed */}
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, marginBottom: '20px' }}>Active Expenses</h3>
                  {expenses.length === 0 ? (
                    <div style={{ color: '#6B7280' }}>No active expenses logged. Click 'Add Expense' to create one.</div>
                  ) : (
                    expenses.map(e => (
                      <div key={e.id} className="list-item" style={{ borderRadius: '12px', background: '#121620', border: '1px solid #242E42', marginBottom: '12px', padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                          <div className="user-avatar" style={{ backgroundColor: getUserAvatarColor(e.paid_by_detail?.username) }}>
                            {e.paid_by_detail?.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="list-item-title">{e.description}</div>
                            <div className="list-item-desc">
                              Paid by <strong>{e.paid_by_detail?.username}</strong> on {e.date}
                              {e.currency === 'USD' && ` • USD ${e.amount} (Rate: ${e.exchange_rate})`}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#F3F4F6' }}>
                              ₹{e.currency === 'USD' ? (e.amount * e.exchange_rate).toFixed(2) : e.amount}
                            </div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Split: {e.split_type}</div>
                          </div>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteExpense(e.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Right: Payments feed */}
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, marginBottom: '20px' }}>Settlements Log</h3>
                  {payments.length === 0 ? (
                    <div style={{ color: '#6B7280' }}>No payments logged yet.</div>
                  ) : (
                    payments.map(p => (
                      <div key={p.id} className="list-item" style={{ borderRadius: '12px', background: '#121620', border: '1px solid #242E42', marginBottom: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="user-avatar" style={{ backgroundColor: getUserAvatarColor(p.payer_detail?.username), width: '32px', height: '32px' }}>
                            {p.payer_detail?.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div style={{ fontSize: '13px' }}>
                            <strong>{p.payer_detail?.username}</strong> paid <strong>{p.payee_detail?.username}</strong>
                            <div style={{ color: '#6B7280', fontSize: '11px' }}>{p.date}</div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 'bold', color: '#10B981' }}>
                          ₹{p.amount}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Members */}
          {activeTab === 'members' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 600 }}>Group Members Timeline</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowMemberModal(true)}>
                  <Plus size={16} /> Add Member
                </button>
              </div>

              <div className="card" style={{ background: '#121620' }}>
                {members.map(m => (
                  <div key={m.id} className="list-item" style={{ borderBottom: '1px solid #242E42' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div className="user-avatar" style={{ backgroundColor: m.user_detail.avatar_color }}>
                        {m.user_detail.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="list-item-title" style={{ fontSize: '16px' }}>{m.user_detail.username}</div>
                        <div className="list-item-desc" style={{ color: '#9CA3AF' }}>{m.user_detail.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '32px', fontSize: '14px' }}>
                      <div>
                        <span style={{ color: '#6B7280' }}>Joined:</span> <strong>{m.joined_at}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#6B7280' }}>Left:</span> <strong>{m.left_at || 'Present'}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Balances */}
          {activeTab === 'balances' && (
            <div>
              <div className="grid-container" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
                {/* Left: Net Balances & Aisha's simplified debts */}
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, marginBottom: '20px' }}>Individual Net Balances</h3>
                  <div className="card" style={{ background: '#121620', marginBottom: '28px' }}>
                    {individualBalances.map(ib => (
                      <div key={ib.username} className="balance-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="user-avatar" style={{ backgroundColor: getUserAvatarColor(ib.username), width: '32px', height: '32px' }}>
                            {ib.username.substring(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600 }}>{ib.username}</span>
                        </div>
                        <span className={`balance-amount ${ib.balance >= 0 ? 'positive' : 'negative'}`}>
                          {ib.balance >= 0 ? `Gets back ₹${ib.balance.toFixed(2)}` : `Owes ₹${Math.abs(ib.balance).toFixed(2)}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, marginBottom: '20px' }}>Aisha's Simplified Payments</h3>
                  <div className="card" style={{ background: '#121620' }}>
                    {simplifiedDebts.length === 0 ? (
                      <div style={{ color: '#6B7280', textAlign: 'center', padding: '12px 0' }}>All settled up! No transactions needed.</div>
                    ) : (
                      simplifiedDebts.map((d, index) => (
                        <div key={index} className="simplified-debt-card">
                          <span style={{ fontWeight: 600 }}>{d.from}</span>
                          <span className="debt-arrow">
                            <ArrowRight size={16} />
                          </span>
                          <span>pays</span>
                          <span style={{ fontWeight: 600 }}>{d.to}</span>
                          <strong style={{ marginLeft: 'auto', color: '#8B5CF6', fontSize: '16px' }}>₹{d.amount.toFixed(2)}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right: Rohan's peer detail expandables */}
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, marginBottom: '20px' }}>Rohan's Detailed Audit Logs</h3>
                  {detailedBreakdowns.map(db => (
                    <div key={db.username} style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontFamily: 'Outfit', fontWeight: 600, color: '#10B981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="user-avatar" style={{ backgroundColor: getUserAvatarColor(db.username), width: '24px', height: '24px', fontSize: '10px' }}>
                          {db.username.substring(0, 2).toUpperCase()}
                        </div>
                        Breakdown for {db.username}
                      </h4>
                      {db.peers.map(peer => {
                        const key = `${db.username}-${peer.peer_name}`;
                        const isExpanded = !!expandedPeers[key];
                        return (
                          <div key={peer.peer_name} className="breakdown-peer">
                            <div className="breakdown-header" onClick={() => togglePeerBreakdown(db.username, peer.peer_name)}>
                              <span style={{ fontWeight: 600 }}>With {peer.peer_name}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontWeight: 'bold', color: peer.net_balance >= 0 ? '#10B981' : '#F97316' }}>
                                  {peer.net_balance >= 0 ? `+ ₹${peer.net_balance}` : `- ₹${Math.abs(peer.net_balance)}`}
                                </span>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="breakdown-body">
                                {peer.line_items.length === 0 ? (
                                  <div style={{ color: '#6B7280', fontSize: '13px' }}>No direct line items.</div>
                                ) : (
                                  peer.line_items.map((item, idx) => (
                                    <div key={idx} className="line-item-row">
                                      <span className="line-item-date">{item.date}</span>
                                      <span className="line-item-desc">{item.detail}</span>
                                      <span className="line-item-amt" style={{ color: item.type.includes('split_received') || item.type.includes('payment_made') ? '#10B981' : '#F97316' }}>
                                        ₹{item.amount_owed}
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
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: CSV Import */}
          {activeTab === 'csv' && (
            <div>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, marginBottom: '20px' }}>Import Spreadsheet</h3>
              
              <div className="grid-container" style={{ gridTemplateColumns: '1fr 2fr' }}>
                {/* CSV Upload Pane */}
                <div className="card" style={{ background: '#121620', height: 'fit-content' }}>
                  <form onSubmit={handleCSVUpload}>
                    <div style={{ border: '2px dashed #242E42', borderRadius: '12px', padding: '32px 20px', textAlign: 'center', marginBottom: '20px', background: '#090B0F' }}>
                      <Upload size={32} color="#6B7280" style={{ marginBottom: '12px' }} />
                      <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '16px' }}>Select the expenses spreadsheet CSV file</div>
                      <input 
                        type="file" 
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files[0])}
                        style={{ fontSize: '13px', color: '#9CA3AF', width: '100%' }}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                      disabled={uploading || !csvFile}
                    >
                      {uploading ? 'Processing CSV...' : 'Ingest Spreadsheet'}
                    </button>
                  </form>
                </div>

                {/* CSV Review & Report Center */}
                <div>
                  <div className="card" style={{ background: '#121620' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #242E42', paddingBottom: '16px' }}>
                      <h4 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 600 }}>Meera's Import Review Center</h4>
                      {importLog && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9CA3AF' }}>
                          <span>Status:</span>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: '99px', fontWeight: 'bold', fontSize: '11px',
                            background: importLog.status === 'PROCESSED' ? 'var(--primary-glow)' : 'var(--accent-orange-glow)',
                            color: importLog.status === 'PROCESSED' ? 'var(--primary)' : 'var(--accent-orange)'
                          }}>
                            {importLog.status === 'PROCESSED' ? 'Processed' : 'Needs Review'}
                          </span>
                        </div>
                      )}
                    </div>

                    {!importLog ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280' }}>
                        Upload a CSV file to generate the anomaly report and review pending duplicates or changes.
                      </div>
                    ) : (
                      <div>
                        {pendingAnomalies.length === 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
                            <CheckCircle size={40} color="#10B981" style={{ marginBottom: '12px' }} />
                            <h4 style={{ fontFamily: 'Outfit', fontWeight: 600, color: '#F3F4F6', marginBottom: '4px' }}>All anomalies resolved</h4>
                            <p style={{ color: '#9CA3AF', fontSize: '13px' }}>The spreadsheet has been fully imported into the database.</p>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', marginBottom: '20px' }}>
                              <AlertCircle size={20} color="#EF4444" />
                              <span style={{ fontSize: '13px', color: '#EF4444', fontWeight: 500 }}>
                                Found {pendingAnomalies.length} entries requiring Meera's review and approval before importing.
                              </span>
                            </div>

                            {pendingAnomalies.map(anomaly => (
                              <div key={anomaly.id} className={`anomaly-item ${anomaly.anomaly_type.toLowerCase()}`}>
                                <div className="anomaly-header">
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
                                      Row {anomaly.row_index}: {anomaly.raw_data.description}
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#9CA3AF' }}>{anomaly.description}</p>
                                  </div>
                                  <span className={`anomaly-badge ${
                                    anomaly.anomaly_type === 'DUPLICATE' ? 'duplicate' : 
                                    anomaly.anomaly_type === 'SETTLEMENT_DISGUISED_AS_EXPENSE' ? 'settlement' : 'danger'
                                  }`}>
                                    {anomaly.anomaly_type.replace(/_/g, ' ')}
                                  </span>
                                </div>

                                <div className="anomaly-body">
                                  <div className="anomaly-raw-card">
                                    <div className="anomaly-raw-field"><span className="anomaly-raw-label">Date:</span> {anomaly.raw_data.date}</div>
                                    <div className="anomaly-raw-field"><span className="anomaly-raw-label">Amount:</span> {anomaly.raw_data.amount}</div>
                                    <div className="anomaly-raw-field"><span className="anomaly-raw-label">Paid By:</span> {anomaly.raw_data.paid_by}</div>
                                  </div>
                                  
                                  {/* Custom resolution input fields based on anomaly type */}
                                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                                    {anomaly.anomaly_type === 'CURRENCY_MISMATCH' && (
                                      <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontSize: '11px' }}>Verify USD to INR Exchange Rate</label>
                                        <input 
                                          type="number" 
                                          step="0.1"
                                          className="form-control" 
                                          style={{ padding: '6px 12px', fontSize: '13px' }}
                                          value={anomalyResolutionData[anomaly.id]?.exchange_rate || '83.0'}
                                          onChange={(e) => setAnomalyResolutionData(prev => ({
                                            ...prev,
                                            [anomaly.id]: { ...prev[anomaly.id], exchange_rate: e.target.value }
                                          }))}
                                        />
                                      </div>
                                    )}
                                    {anomaly.anomaly_type === 'SETTLEMENT_DISGUISED_AS_EXPENSE' && (
                                      <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontSize: '11px' }}>Identify Payee (recipient)</label>
                                        <select 
                                          className="form-control" 
                                          style={{ padding: '6px 12px', fontSize: '13px' }}
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
                                  </div>
                                </div>

                                <div className="anomaly-actions">
                                  <button 
                                    className="btn btn-secondary btn-sm" 
                                    style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                    onClick={() => handleResolveAnomaly(anomaly.id, 'REJECT')}
                                  >
                                    <X size={14} /> Discard / Skip
                                  </button>
                                  <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleResolveAnomaly(anomaly.id, 'APPROVE')}
                                  >
                                    <Check size={14} /> Approve & Import
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
              </div>
            </div>
          )}

          {/* Add Expense Modal */}
          {showExpenseModal && (
            <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-close" onClick={() => setShowExpenseModal(false)}>
                  <X size={20} />
                </div>
                <h2 className="modal-title">Add Expense</h2>
                <form onSubmit={handleAddExpense}>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Electricity, Dinner trip" 
                      value={expDesc} 
                      onChange={(e) => setExpDesc(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Amount</label>
                      <input 
                        type="number" 
                        step="0.01"
                        className="form-control" 
                        placeholder="0.00" 
                        value={expAmt} 
                        onChange={(e) => setExpAmt(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ flex: 0.6 }}>
                      <label className="form-label">Currency</label>
                      <select className="form-control" value={expCurrency} onChange={(e) => setExpCurrency(e.target.value)}>
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>

                  {expCurrency === 'USD' && (
                    <div className="form-group">
                      <label className="form-label">USD to INR Exchange Rate</label>
                      <input 
                        type="number" 
                        step="0.01"
                        className="form-control" 
                        value={expRate} 
                        onChange={(e) => setExpRate(e.target.value)} 
                        required 
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Paid By</label>
                    <select className="form-control" value={expPayer} onChange={(e) => setExpPayer(e.target.value)} required>
                      <option value="">-- Select Payer --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.user}>{m.user_detail.username}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={expDate} 
                      onChange={(e) => setExpDate(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Split Type</label>
                    <select className="form-control" value={expSplitType} onChange={(e) => setExpSplitType(e.target.value)}>
                      <option value="EQUAL">Split Equally</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowExpenseModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Expense
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Member Modal */}
          {showMemberModal && (
            <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-close" onClick={() => setShowMemberModal(false)}>
                  <X size={20} />
                </div>
                <h2 className="modal-title">Invite Group Member</h2>
                <form onSubmit={handleAddMember}>
                  <div className="form-group">
                    <label className="form-label">User Email / Username</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. sam@example.com or sam" 
                      value={memEmail} 
                      onChange={(e) => setMemEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Joined Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={memJoined} 
                      onChange={(e) => setMemJoined(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Leave Date (Optional)</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={memLeft} 
                      onChange={(e) => setMemLeft(e.target.value)} 
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Settle Up Modal */}
          {showSettleModal && (
            <div className="modal-overlay" onClick={() => setShowSettleModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-close" onClick={() => setShowSettleModal(false)}>
                  <X size={20} />
                </div>
                <h2 className="modal-title">Record Settlement</h2>
                <form onSubmit={handleSettleUp}>
                  <div className="form-group">
                    <label className="form-label">Payer (Who Paid)</label>
                    <select className="form-control" value={settlePayer} onChange={(e) => setSettlePayer(e.target.value)} required>
                      <option value="">-- Choose payer --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.user}>{m.user_detail.username}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payee (Who Received)</label>
                    <select className="form-control" value={settlePayee} onChange={(e) => setSettlePayee(e.target.value)} required>
                      <option value="">-- Choose recipient --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.user}>{m.user_detail.username}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount (INR)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control" 
                      placeholder="0.00" 
                      value={settleAmt} 
                      onChange={(e) => setSettleAmt(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={settleDate} 
                      onChange={(e) => setSettleDate(e.target.value)} 
                      required 
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowSettleModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
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
