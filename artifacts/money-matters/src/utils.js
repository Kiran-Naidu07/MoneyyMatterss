export const TRANSACTIONS_KEY = 'moneyMattersTransactions';
export const PROFILE_KEY = 'moneyMattersProfile';
export const CATEGORIES = ['Food', 'Shopping', 'Bills', 'Salary', 'Travel', 'Entertainment', 'Healthcare', 'Education', 'Other'];
export const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const iso = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
export const demoTransactions = [
  { id: 'demo-salary', title: 'Monthly salary', category: 'Salary', amount: 68500, type: 'credit', date: iso(25), description: 'Monthly salary credit' },
  { id: 'demo-groceries', title: 'Fresh market groceries', category: 'Food', amount: 2840, type: 'debit', date: iso(18), description: 'Weekly groceries and produce' },
  { id: 'demo-electricity', title: 'Electricity bill', category: 'Bills', amount: 1765, type: 'debit', date: iso(14), description: 'Home electricity bill' },
  { id: 'demo-freelance', title: 'Design project', category: 'Other', amount: 14200, type: 'credit', date: iso(9), description: 'Freelance project payment' },
  { id: 'demo-commute', title: 'Monthly metro pass', category: 'Travel', amount: 1250, type: 'debit', date: iso(5), description: 'City commute' },
  { id: 'demo-dinner', title: 'Dinner with friends', category: 'Food', amount: 1680, type: 'debit', date: iso(2), description: 'Dinner at The Fig Tree' },
];
export const defaultProfile = {
  name: 'Kiran Kumar',
  username: 'kiran.kumar',
  email: 'user@example.com',
  phone: '+91 XXXXX XXXXX',
  location: 'India',
  dateOfBirth: '1990-01-25',
  presentAddress: 'New Delhi, India',
  permanentAddress: 'New Delhi, India',
  city: 'New Delhi',
  postalCode: '110001',
  country: 'India',
};
const isValidDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
};
const validTransaction = (item) => item && typeof item.id === 'string' && typeof item.title === 'string' && item.title.trim().length > 0 && typeof item.category === 'string' && item.category.length > 0 && Number.isFinite(Number(item.amount)) && Number(item.amount) > 0 && (item.type === 'credit' || item.type === 'debit') && isValidDate(item.date);
export function getTransactions() {
  try {
    const stored = localStorage.getItem(TRANSACTIONS_KEY);
    if (stored === null) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(demoTransactions));
      return demoTransactions;
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error('Transaction data was not a list');
    return parsed.filter(validTransaction).map((item) => ({ ...item, amount: Number(item.amount), description: typeof item.description === 'string' ? item.description : '' }));
  } catch {
    try { localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([])); } catch { /* storage may be unavailable */ }
    return [];
  }
}
export function saveTransactions(transactions) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}
export function addTransaction(transaction, current) {
  const next = [{ ...transaction, id: makeId() }, ...current];
  saveTransactions(next);
  return next;
}
export function updateTransaction(transaction, current) {
  const next = current.map((item) => item.id === transaction.id ? { ...transaction } : item);
  saveTransactions(next);
  return next;
}
export function deleteTransaction(id, current) {
  const next = current.filter((item) => item.id !== id);
  saveTransactions(next);
  return next;
}
export function getProfile() {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
      return defaultProfile;
    }
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid profile');
    return { ...defaultProfile, ...parsed };
  } catch {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile)); } catch { /* storage may be unavailable */ }
    return defaultProfile;
  }
}
export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
