import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, CheckCircle2,
  CircleDollarSign, CreditCard, LayoutDashboard, LogOut, Menu, Pencil, Plus, Search, ShoppingBag,
  Trash2, UserRound, Wallet, X, TrendingDown, TrendingUp,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  addTransaction, CATEGORIES, deleteTransaction, getProfile, getTransactions, money,
  saveProfile, updateTransaction,
} from './utils';

function Toasts({ toasts }) {
  return <div className="toast-region" aria-live="polite">{toasts.map((toast) => <div className="toast" key={toast.id} role="status" data-testid={`status-toast-${toast.id}`}><CheckCircle2 size={17} />{toast.message}</div>)}</div>;
}

function App() {
  const [transactions, setTransactions] = useState(() => getTransactions());
  const [profile, setProfile] = useState(() => getProfile());
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  const notify = (message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, message }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3200);
  };
  const onAdd = (value) => {
    try { setTransactions(addTransaction(value, transactions)); setModal(null); notify('Transaction added. Your totals are up to date.'); }
    catch { notify('Could not save your transaction. Check browser storage settings.'); }
  };
  const onEdit = (value) => {
    try { setTransactions(updateTransaction(value, transactions)); setModal(null); notify('Transaction updated successfully.'); }
    catch { notify('Could not save your changes. Please try again.'); }
  };
  const onDelete = (id) => {
    try { setTransactions(deleteTransaction(id, transactions)); setModal(null); notify('Transaction deleted.'); }
    catch { notify('Could not delete this transaction. Please try again.'); }
  };
  const onProfileSave = (value) => {
    try { saveProfile(value); setProfile(value); notify('Your profile has been saved.'); return true; }
    catch { notify('Could not save your profile. Check browser storage settings.'); return false; }
  };

  if (loggedOut) return <><Welcome onContinue={() => setLoggedOut(false)} /><Toasts toasts={toasts} /></>;
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppFrame
          profile={profile} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
          onLogout={() => setModal({ type: 'logout' })}
          onAdd={() => setModal({ type: 'transaction' })}
          transactions={transactions} setModal={setModal} onProfileSave={onProfileSave}
        />
        <Toasts toasts={toasts} />
        {modal?.type === 'transaction' && <TransactionDialog initial={modal.transaction} onClose={() => setModal(null)} onSave={modal.transaction ? onEdit : onAdd} />}
        {modal?.type === 'delete' && <ConfirmDialog title="Delete Transaction?" message="Are you sure you want to delete this transaction? This action cannot be undone." confirmText="Delete" destructive onClose={() => setModal(null)} onConfirm={() => onDelete(modal.transaction.id)} />}
        {modal?.type === 'logout' && <ConfirmDialog title="Logout?" message="Are you sure you want to logout?" confirmText="Logout" onClose={() => setModal(null)} onConfirm={() => { setModal(null); setLoggedOut(true); }} />}
      </div>
    </BrowserRouter>
  );
}

function AppFrame({ profile, mobileOpen, setMobileOpen, onLogout, onAdd, transactions, setModal, onProfileSave }) {
  const location = useLocation();
  const navigate = useNavigate();
  const title = location.pathname === '/transactions' ? 'Transactions' : location.pathname === '/profile' ? 'Profile' : 'Accounts';
  const initials = (profile.name || 'K K').split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();
  useEffect(() => setMobileOpen(false), [location.pathname, setMobileOpen]);
  return <>
    <div className={`mobile-scrim ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} aria-hidden="true" />
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} aria-label="Main navigation">
      <NavLink to="/dashboard" className="brand" onClick={() => setMobileOpen(false)} data-testid="link-brand-dashboard"><span className="brand-mark"><CircleDollarSign size={21} /></span><span>Money Matters</span></NavLink>
      <nav className="nav-list">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} data-testid="link-dashboard"><LayoutDashboard size={18} />Dashboard</NavLink>
        <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} data-testid="link-transactions"><CreditCard size={18} />Transactions</NavLink>
      <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} data-testid="link-profile"><UserRound size={18} />Profile</NavLink>
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-link logout-link" onClick={onLogout} data-testid="button-logout"><LogOut size={18} />Log out</button>
        <div className="side-note"><strong>Little steps add up.</strong>Keep your money picture clear, one day at a time.</div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left"><button className="menu-button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen} data-testid="button-mobile-menu">{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button><span>{title}</span><span className="topbar-date"><CalendarDays size={15} />{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
        <div className="topbar-user"><span>{profile.name || 'Your account'}</span><span className="avatar" data-testid="text-user-avatar">{initials}</span></div>
      </header>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard transactions={transactions} profile={profile} onAdd={onAdd} setModal={setModal} onViewAll={() => navigate('/transactions')} />} />
          <Route path="/transactions" element={<TransactionsPage transactions={transactions} setModal={setModal} onAdd={onAdd} />} />
          <Route path="/profile" element={<ProfilePage profile={profile} onSave={onProfileSave} onAdd={onAdd} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </main>
  </>;
}

function PageHeading({ eyebrow, title, subtitle, action }) {
  return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{subtitle && <p className="page-subtitle">{subtitle}</p>}</div>{action}</div>;
}
function SummaryCard({ kind, label, value, foot, icon: Icon }) {
  return <article className={`summary-card ${kind}`} data-testid={`card-summary-${kind}`}><div className="summary-top"><span>{label}</span><span className="summary-icon"><Icon size={18} /></span></div><p className="summary-value" data-testid={`text-summary-${kind}`}>{value}</p><p className="summary-foot">{foot}</p></article>;
}
function aggregate(transactions) {
  const credit = transactions.filter((item) => item.type === 'credit').reduce((sum, item) => sum + item.amount, 0);
  const debit = transactions.filter((item) => item.type === 'debit').reduce((sum, item) => sum + item.amount, 0);
  return { credit, debit, balance: credit - debit };
}
const dateLabel = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
function Dashboard({ transactions, profile, onAdd, setModal, onViewAll }) {
  const totals = aggregate(transactions);
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);
  const thisWeek = transactions.filter((item) => new Date(`${item.date}T00:00:00`) >= weekStart);
  const weeklyCredit = thisWeek.filter((item) => item.type === 'credit').reduce((sum, item) => sum + item.amount, 0);
  const weeklyDebit = thisWeek.filter((item) => item.type === 'debit').reduce((sum, item) => sum + item.amount, 0);
  const chartData = useMemo(() => {
    const months = [];
    const current = new Date();
    for (let step = 5; step >= 0; step--) {
      const d = new Date(current.getFullYear(), current.getMonth() - step, 1);
      months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, month: d.toLocaleDateString('en-IN', { month: 'short' }), credit: 0, debit: 0 });
    }
    transactions.forEach((item) => {
      const found = months.find((month) => month.key === item.date.slice(0, 7));
      if (found) found[item.type] += item.amount;
    });
    return months;
  }, [transactions]);
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  return <>
    <PageHeading title="Accounts" action={<button className="button button-primary" onClick={onAdd} data-testid="button-add-transaction"><Plus size={17} />Add transaction</button>} />
    <div className="summary-grid">
      <SummaryCard kind="credit" label="Credit" value={money.format(totals.credit)} foot="Total money received" icon={TrendingUp} />
      <SummaryCard kind="debit" label="Debit" value={money.format(totals.debit)} foot="Total money spent" icon={TrendingDown} />
    </div>
    <div className="dashboard-grid">
      <section className="panel cash-flow-panel" aria-labelledby="activity-title">
        <div className="panel-header"><div><h2 className="panel-title" id="activity-title">Debit &amp; Credit Overview</h2><p className="panel-caption">{money.format(weeklyDebit)} Debited &amp; {money.format(weeklyCredit)} Credited in the past 7 days</p></div><div className="chart-legend"><span><i className="legend-dot" style={{ background: '#d2ad52' }} />Credit</span><span><i className="legend-dot" style={{ background: '#c78373' }} />Debit</span></div></div>
        {transactions.length ? <div className="chart-wrap" data-testid="chart-cash-flow"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }} barGap={5} barCategoryGap="35%">
          <CartesianGrid vertical={false} stroke="#39352b" strokeDasharray="3 4" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#aaa187', fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#aaa187', fontSize: 10 }} tickFormatter={(value) => value >= 1000 ? `₹${Math.round(value / 1000)}k` : `₹${value}`} width={48} />
          <Tooltip formatter={(value) => money.format(value)} contentStyle={{ border: '1px solid #51462d', borderRadius: 10, background: '#1b1a16', color: '#eee5d0', fontSize: 12, boxShadow: '0 8px 24px #0009' }} />
          <Legend content={() => null} /><Bar dataKey="credit" name="Credit" fill="#d2ad52" radius={[5, 5, 0, 0]} maxBarSize={22} /><Bar dataKey="debit" name="Debit" fill="#c78373" radius={[5, 5, 0, 0]} maxBarSize={22} />
        </BarChart></ResponsiveContainer></div> : <EmptyState title="Your chart is waiting" message="Add a transaction and your cash flow will take shape here." onAction={onAdd} />}
      </section>
      <section className="panel recent-panel" aria-labelledby="recent-title">
        <div className="panel-header"><div><h2 className="panel-title" id="recent-title">Last Transaction</h2></div>{transactions.length > 0 && <button className="see-all" onClick={onViewAll} data-testid="button-view-all">View all <ArrowRight size={13} style={{ verticalAlign: 'middle' }} /></button>}</div>
        {recent.length > 0 ? <div className="recent-list">{recent.map((transaction) => <RecentTransaction key={transaction.id} transaction={transaction} onEdit={() => setModal({ type: 'transaction', transaction })} onDelete={() => setModal({ type: 'delete', transaction })} />)}</div> : <EmptyState title="No transactions yet" message="Add your first transaction to start tracking your finances." onAction={onAdd} />}
      </section>
    </div>
  </>;
}
function RecentTransaction({ transaction, onEdit, onDelete }) {
  const incoming = transaction.type === 'credit';
  return <div className={`transaction-item ${transaction.type}`} data-testid={`row-recent-${transaction.id}`}><span className="transaction-icon">{incoming ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={16} />}</span><p className="transaction-name">{transaction.title}</p><span className="recent-category">{transaction.category}</span><span className="recent-date">{dateLabel(transaction.date)}</span><span className={`transaction-amount ${incoming ? 'amount-credit' : 'amount-debit'}`}>{incoming ? '+' : '−'}{money.format(transaction.amount)}</span><div className="actions"><button className="icon-button" aria-label={`Edit ${transaction.title}`} title="Edit transaction" onClick={onEdit}><Pencil size={15} /></button><button className="icon-button delete" aria-label={`Delete ${transaction.title}`} title="Delete transaction" onClick={onDelete}><Trash2 size={15} /></button></div></div>;
}
function EmptyState({ title, message, onAction }) {
  return <div className="empty-state"><span className="empty-icon"><Wallet size={23} /></span><h3>{title}</h3><p>{message}</p>{onAction && <button className="button button-primary" onClick={onAction} data-testid="button-empty-add"><Plus size={15} />Add transaction</button>}</div>;
}

function TransactionsPage({ transactions, setModal, onAdd }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const filtered = useMemo(() => transactions.filter((item) => {
    const needle = query.trim().toLowerCase();
    return (!needle || [item.title, item.category, item.description].some((text) => text.toLowerCase().includes(needle)))
      && (type === 'all' || item.type === type)
      && (category === 'all' || item.category === category);
  }).sort((a, b) => sort === 'oldest' ? a.date.localeCompare(b.date) : sort === 'highest' ? b.amount - a.amount : sort === 'lowest' ? a.amount - b.amount : b.date.localeCompare(a.date)), [transactions, query, type, category, sort]);
  return <>
    <PageHeading title="Transactions" action={<button className="button button-primary" onClick={onAdd} data-testid="button-add-transaction"><Plus size={17} />Add transaction</button>} />
    <div className="transaction-toolbar">
      <div className="filter-tabs" role="group" aria-label="Filter by transaction type">{['all', 'debit', 'credit'].map((option) => <button key={option} className={`filter-tab ${type === option ? 'selected' : ''}`} onClick={() => setType(option)} aria-pressed={type === option} data-testid={`button-filter-${option}`}>{option === 'all' ? 'All Transactions' : option[0].toUpperCase() + option.slice(1)}</button>)}</div>
      <details className="filter-options">
        <summary><Search size={15} />Search &amp; filters</summary>
        <div className="filters">
          <div className="search-wrap"><Search size={16} /><input className="control search-input" type="search" placeholder="Search name, category or note" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search transactions" data-testid="input-transaction-search" /></div>
          <select className="control select-control" aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} data-testid="select-category-filter"><option value="all">All categories</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
          <select className="control select-control" aria-label="Sort transactions" value={sort} onChange={(event) => setSort(event.target.value)} data-testid="select-transaction-sort"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="highest">Highest amount</option><option value="lowest">Lowest amount</option></select>
        </div>
      </details>
    </div>
    <section className="panel list-panel" aria-label="Transactions list">
      {filtered.length ? <div className="table-scroll"><table className="transaction-table"><thead><tr><th scope="col">Transaction Name</th><th scope="col">Category</th><th scope="col">Date</th><th scope="col">Amount</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead><tbody>
        {filtered.map((item) => <tr key={item.id} data-testid={`row-transaction-${item.id}`}><td><div className="table-title"><span className={`table-type-icon ${item.type}`}>{item.type === 'credit' ? <ArrowUpRight size={15} /> : <ArrowDownLeft size={15} />}</span><span className="table-transaction">{item.title}{item.description && <span className="transaction-meta">{item.description}</span>}</span></div></td><td><span className="category-pill">{item.category}</span></td><td>{dateLabel(item.date)}</td><td className={item.type === 'credit' ? 'amount-credit' : 'amount-debit'} style={{ fontWeight: 700 }}>{item.type === 'credit' ? '+' : '−'}{money.format(item.amount)}</td><td><div className="actions"><button className="icon-button" aria-label={`Edit ${item.title}`} title="Edit transaction" onClick={() => setModal({ type: 'transaction', transaction: item })} data-testid={`button-edit-${item.id}`}><Pencil size={15} /></button><button className="icon-button delete" aria-label={`Delete ${item.title}`} title="Delete transaction" onClick={() => setModal({ type: 'delete', transaction: item })} data-testid={`button-delete-${item.id}`}><Trash2 size={15} /></button></div></td></tr>)}
      </tbody></table></div> : <EmptyState title={transactions.length ? 'No matches just yet' : 'A clean slate'} message={transactions.length ? 'Try a different search or adjust your filters.' : 'When you add a transaction, it will find a home here.'} onAction={transactions.length ? undefined : onAdd} />}
      <div style={{ padding: '12px 20px', color: '#aaa187', fontSize: 11, borderTop: '1px solid #38342a' }} data-testid="text-transaction-count">{filtered.length} {filtered.length === 1 ? 'transaction' : 'transactions'}</div>
    </section>
  </>;
}

function ProfilePage({ profile, onSave, onAdd }) {
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  useEffect(() => { if (!editing) setDraft(profile); }, [profile, editing]);
  const initials = (profile.name || 'K K').split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();
  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!draft.name.trim()) nextErrors.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) nextErrors.email = 'Enter a valid email address.';
    if (!draft.username.trim()) nextErrors.username = 'Please enter a username.';
    if (!draft.dateOfBirth) nextErrors.dateOfBirth = 'Choose your date of birth.';
    if (!draft.presentAddress.trim()) nextErrors.presentAddress = 'Please enter your present address.';
    if (!draft.permanentAddress.trim()) nextErrors.permanentAddress = 'Please enter your permanent address.';
    if (!draft.city.trim()) nextErrors.city = 'Please enter your city.';
    if (!draft.postalCode.trim()) nextErrors.postalCode = 'Please enter your postal code.';
    if (!draft.country.trim()) nextErrors.country = 'Please enter your country.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (onSave(draft)) setEditing(false);
  };
  const update = (key, value) => setDraft((old) => ({ ...old, [key]: value }));
  return <>
    <PageHeading title="Profile" action={<button className="button button-primary" onClick={onAdd} data-testid="button-add-transaction"><Plus size={17} />Add transaction</button>} />
    <div className="profile-layout">
      <section className="panel profile-card"><div className="profile-avatar" data-testid="text-profile-initials">{initials}</div><h2 className="profile-name" data-testid="text-profile-name">{profile.name}</h2><p className="profile-email" data-testid="text-profile-email">{profile.email}</p><span className="profile-tag">Your personal finance space</span></section>
      <form className="panel profile-form" onSubmit={submit} noValidate>
        <div className="section-heading"><div><h2>Personal details</h2><p className="panel-caption">Only stored in your browser.</p></div>{!editing && <button type="button" className="button button-quiet" onClick={() => setEditing(true)} data-testid="button-edit-profile"><Pencil size={14} />Edit profile</button>}</div>
        <div className="form-grid">
          <Field label="Full name" name="name" value={draft.name} disabled={!editing} onChange={update} error={errors.name} testId="input-profile-name" />
          <Field label="User name" name="username" value={draft.username} disabled={!editing} onChange={update} error={errors.username} testId="input-profile-username" />
          <Field label="Email address" name="email" type="email" value={draft.email} disabled={!editing} onChange={update} error={errors.email} testId="input-profile-email" />
          <Field label="Password" name="password-preview" type="text" value="" placeholder="••••••••" disabled onChange={update} testId="input-profile-password" />
          <Field label="Date of birth" name="dateOfBirth" type={editing ? 'date' : 'text'} value={editing ? draft.dateOfBirth : new Date(`${draft.dateOfBirth}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} disabled={!editing} onChange={update} error={errors.dateOfBirth} testId="input-profile-date-of-birth" />
          <Field label="Present address" name="presentAddress" value={draft.presentAddress} disabled={!editing} onChange={update} error={errors.presentAddress} testId="input-profile-present-address" />
          <Field label="Permanent address" name="permanentAddress" value={draft.permanentAddress} disabled={!editing} onChange={update} error={errors.permanentAddress} testId="input-profile-permanent-address" />
          <Field label="City" name="city" value={draft.city} disabled={!editing} onChange={update} error={errors.city} testId="input-profile-city" />
          <Field label="Postal code" name="postalCode" value={draft.postalCode} disabled={!editing} onChange={update} error={errors.postalCode} testId="input-profile-postal-code" />
          <Field label="Country" name="country" value={draft.country} disabled={!editing} onChange={update} error={errors.country} testId="input-profile-country" />
        </div>
        {editing && <div className="profile-actions"><button type="button" className="button button-outline" onClick={() => { setDraft(profile); setErrors({}); setEditing(false); }} data-testid="button-cancel-profile">Cancel</button><button type="submit" className="button button-primary" data-testid="button-save-profile"><Check size={16} />Save changes</button></div>}
      </form>
    </div>
  </>;
}

function Field({ label, name, type = 'text', value, placeholder, disabled, onChange, error, testId }) {
  return <div className="field"><label htmlFor={name}>{label}</label><input id={name} type={type} value={value} placeholder={placeholder} disabled={disabled} onChange={(event) => onChange(name, event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} data-testid={testId} />{error && <span className="form-error" id={`${name}-error`}>{error}</span>}</div>;
}

function TransactionDialog({ initial, onClose, onSave }) {
  const [form, setForm] = useState(() => initial ? { ...initial, amount: String(initial.amount) } : { title: '', category: '', amount: '', type: 'debit', date: new Date().toISOString().slice(0, 10), description: '' });
  const [errors, setErrors] = useState({});
  useEffect(() => {
    const handle = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);
  const change = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = 'A transaction name is required.';
    if (!form.category) next.category = 'Choose a category.';
    if (!form.amount || !Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) next.amount = 'Enter an amount greater than zero.';
    if (!['credit', 'debit'].includes(form.type)) next.type = 'Choose credit or debit.';
    if (!form.date || !/^\d{4}-\d{2}-\d{2}$/.test(form.date)) next.date = 'Choose a valid date.';
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave({ ...form, title: form.title.trim(), amount: Number(form.amount), description: form.description.trim() });
  };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title" data-testid="dialog-transaction">
    <div className="modal-head"><div><h2 id="transaction-modal-title">{initial ? 'Edit transaction' : 'Add transaction'}</h2><p>A small detail today, a clearer picture tomorrow.</p></div><button className="modal-close" onClick={onClose} aria-label="Close dialog" data-testid="button-close-transaction-dialog"><X size={18} /></button></div>
    <form className="modal-form" onSubmit={submit} noValidate><div className="form-grid">
      <div className="field full"><label htmlFor="transaction-title">Transaction name</label><input id="transaction-title" autoFocus value={form.title} onChange={(event) => change('title', event.target.value)} placeholder="e.g. Weekly groceries" aria-invalid={Boolean(errors.title)} data-testid="input-transaction-title" />{errors.title && <span className="form-error">{errors.title}</span>}</div>
      <div className="field"><label htmlFor="transaction-type">Type</label><select id="transaction-type" value={form.type} onChange={(event) => change('type', event.target.value)} data-testid="select-transaction-type"><option value="credit">Credit — money in</option><option value="debit">Debit — money out</option></select>{errors.type && <span className="form-error">{errors.type}</span>}</div>
      <div className="field"><label htmlFor="transaction-category">Category</label><select id="transaction-category" value={form.category} onChange={(event) => change('category', event.target.value)} data-testid="select-transaction-category"><option value="">Choose a category</option>{CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select>{errors.category && <span className="form-error">{errors.category}</span>}</div>
      <div className="field"><label htmlFor="transaction-amount">Amount (₹)</label><input id="transaction-amount" type="number" min="0.01" step="0.01" inputMode="decimal" value={form.amount} onChange={(event) => change('amount', event.target.value)} placeholder="0.00" aria-invalid={Boolean(errors.amount)} data-testid="input-transaction-amount" />{errors.amount && <span className="form-error">{errors.amount}</span>}</div>
      <div className="field"><label htmlFor="transaction-date">Date</label><input id="transaction-date" type="date" value={form.date} onChange={(event) => change('date', event.target.value)} aria-invalid={Boolean(errors.date)} data-testid="input-transaction-date" />{errors.date && <span className="form-error">{errors.date}</span>}</div>
      <div className="field full"><label htmlFor="transaction-description">Description <span style={{ fontWeight: 400, color: '#aaa187' }}>(optional)</span></label><textarea id="transaction-description" value={form.description} onChange={(event) => change('description', event.target.value)} placeholder="Add a note to remember the details" data-testid="input-transaction-description" /></div>
    </div><div className="modal-footer"><button type="button" className="button button-outline" onClick={onClose} data-testid="button-cancel-transaction">Cancel</button><button className="button button-primary" type="submit" data-testid="button-save-transaction"><Check size={15} />{initial ? 'Save changes' : 'Add transaction'}</button></div></form>
  </section></div>;
}

function ConfirmDialog({ title, message, confirmText, destructive, onClose, onConfirm }) {
  useEffect(() => {
    const handle = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal small" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
    <div className="modal-head"><div><h2 id="confirm-title">{title}</h2></div><button className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>
    <div className="confirm-content"><p className="confirm-text" id="confirm-message">{message}</p><div className="confirm-footer"><button className="button button-outline" onClick={onClose} data-testid="button-cancel-confirm">Cancel</button><button className={`button ${destructive ? 'button-danger' : 'button-primary'}`} onClick={onConfirm} data-testid="button-confirm-action">{confirmText}</button></div></div>
  </section></div>;
}
function Welcome({ onContinue }) {
  return <main className="welcome-screen"><section className="welcome-card"><span className="welcome-logo"><CircleDollarSign size={32} /></span><p className="eyebrow">Money Matters</p><h1>Your money’s right where you left it.</h1><p>Your personal finance space is ready whenever you are. Your details stay on this device, just as you left them.</p><button className="button button-primary" onClick={onContinue} data-testid="button-continue-dashboard">Continue to dashboard <ArrowRight size={16} /></button></section></main>;
}

export default function RootApp() {
  return <App />;
}
