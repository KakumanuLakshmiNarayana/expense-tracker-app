import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign, 
  CreditCard, 
  Banknote, 
  Users, 
  Clock, 
  HandHeart, 
  FileText, 
  Trash2, 
  Calendar, 
  X, 
  Target, 
  PiggyBank,
  Upload
} from 'lucide-react';

function PersonalExpenseTracker() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Main Bank', type: 'bank', openingBalance: 2000, currentBalance: 2500.50, isActive: true },
    { id: 2, name: 'Cash Wallet', type: 'cash', openingBalance: 200, currentBalance: 250, isActive: true },
    { id: 3, name: 'Credit Card', type: 'credit', openingBalance: 0, currentBalance: -120.75, isActive: true }
  ]);
  
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2025-08-04', type: 'expense', amount: 45.20, category: 'Food', account: 1, description: 'Weekly shopping' },
    { id: 2, date: '2025-08-04', type: 'income', amount: 2500, category: 'Salary', account: 1, description: 'August salary' },
    { id: 3, date: '2025-08-03', type: 'expense', amount: 15.50, category: 'Transport', account: 2, description: 'Gas' }
  ]);

  const [budgets, setBudgets] = useState([
    { id: 1, category: 'Food', amount: 400, spent: 45.20, period: 'monthly' },
    { id: 2, category: 'Transport', amount: 200, spent: 15.50, period: 'monthly' },
    { id: 3, category: 'Shopping', amount: 300, spent: 120.75, period: 'monthly' }
  ]);

  const [loans, setLoans] = useState([
    { id: 1, type: 'given', amount: 500, friendName: 'John Doe', dueDate: '2025-09-01', status: 'pending' },
    { id: 2, type: 'taken', amount: 200, friendName: 'Jane Smith', dueDate: '2025-08-15', status: 'pending' }
  ]);

  const [workplaces, setWorkplaces] = useState([
    { id: 1, name: 'Tech Corp', hourlyRate: 25, paymentNorm: 'biweekly' },
    { id: 2, name: 'Coffee Shop', hourlyRate: 15, paymentNorm: 'weekly' },
    { id: 3, name: 'Freelance', hourlyRate: 30, paymentNorm: 'monthly' }
  ]);

  const [workLogs, setWorkLogs] = useState([
    { id: 1, workplaceId: 1, workplace: 'Tech Corp', date: '2025-08-04', checkIn: '09:00', checkOut: '17:00', hours: 8, earnings: 200, paid: false },
    { id: 2, workplaceId: 2, workplace: 'Coffee Shop', date: '2025-08-03', checkIn: '10:00', checkOut: '16:00', hours: 6, earnings: 90, paid: false },
    { id: 3, workplaceId: 1, workplace: 'Tech Corp', date: '2025-08-02', checkIn: '09:00', checkOut: '17:00', hours: 8, earnings: 200, paid: false },
    { id: 4, workplaceId: 3, workplace: 'Freelance', date: '2025-08-01', checkIn: '14:00', checkOut: '18:00', hours: 4, earnings: 120, paid: false }
  ]);

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [showAddWork, setShowAddWork] = useState(false);
  const [showAddWorkplace, setShowAddWorkplace] = useState(false);
  const [showPaymentSourceModal, setShowPaymentSourceModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const [selectedWorkLogsForPayment, setSelectedWorkLogsForPayment] = useState([]);
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState('');

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense', amount: '', category: '', account: 1, description: ''
  });

  const [newAccount, setNewAccount] = useState({
    name: '', type: 'bank', openingBalance: ''
  });

  const [newBudget, setNewBudget] = useState({
    category: '', amount: '', period: 'monthly'
  });

  const [newLoan, setNewLoan] = useState({
    type: 'given', amount: '', friendName: '', dueDate: '', account: 1
  });

  const [newWork, setNewWork] = useState({
    workplaceId: '', date: '', checkIn: '', checkOut: ''
  });

  const [newWorkplace, setNewWorkplace] = useState({
    name: '', hourlyRate: '', paymentNorm: 'monthly'
  });

  // Helper functions
  const getTotalBalance = () => accounts.reduce((total, acc) => total + acc.currentBalance, 0);
  const getMonthlyIncome = () => transactions.filter(t => t.type === 'income').reduce((total, t) => total + t.amount, 0);
  const getMonthlyExpenses = () => transactions.filter(t => t.type === 'expense').reduce((total, t) => total + t.amount, 0);
  const getTotalReceivables = () => loans.filter(l => l.type === 'given' && l.status === 'pending').reduce((total, l) => total + l.amount, 0);
  const getTotalPayables = () => loans.filter(l => l.type === 'taken' && l.status === 'pending').reduce((total, l) => total + l.amount, 0);
  const getPendingWorkEarnings = () => workLogs.filter(w => !w.paid).reduce((total, w) => total + w.earnings, 0);

  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Salary', 'Other'];

  const getAccountIcon = (type) => {
    switch(type) {
      case 'bank': return <CreditCard className="w-6 h-6 text-white" />;
      case 'cash': return <Banknote className="w-6 h-6 text-white" />;
      case 'credit': return <CreditCard className="w-6 h-6 text-white" />;
      default: return <Wallet className="w-6 h-6 text-white" />;
    }
  };

  // Google Sheets sync functions
  const syncToGoogleSheets = async () => {
    setIsSyncing(true);
    setSyncMessage('Syncing to Google Sheets...');
    
    try {
      // Prepare data for CSV export
      const csvData = {
        accounts: 'Account Name,Type,Current Balance,Opening Balance\n' + 
          accounts.map(acc => acc.name + ',' + acc.type + ',' + acc.currentBalance + ',' + acc.openingBalance).join('\n'),
        transactions: 'Date,Type,Amount,Category,Description,Account\n' + 
          transactions.map(t => t.date + ',' + t.type + ',' + t.amount + ',' + t.category + ',' + (t.description || '') + ',' + 
            (accounts.find(a => a.id === t.account) ? accounts.find(a => a.id === t.account).name : '')).join('\n'),
        budgets: 'Category,Budget Amount,Spent,Period\n' + 
          budgets.map(b => b.category + ',' + b.amount + ',' + b.spent + ',' + b.period).join('\n'),
        loans: 'Type,Friend Name,Amount,Due Date,Status\n' + 
          loans.map(l => l.type + ',' + l.friendName + ',' + l.amount + ',' + l.dueDate + ',' + l.status).join('\n'),
        workLogs: 'Workplace,Date,Check In,Check Out,Hours,Earnings,Paid\n' + 
          workLogs.map(w => w.workplace + ',' + w.date + ',' + w.checkIn + ',' + w.checkOut + ',' + w.hours + ',' + w.earnings + ',' + (w.paid ? 'Yes' : 'No')).join('\n')
      };

      // Download CSV files
      Object.entries(csvData).forEach(([sheetName, data]) => {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = sheetName + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });

      setSyncMessage('✅ CSV files downloaded successfully!');
    } catch (error) {
      setSyncMessage('❌ Sync failed. Please try again.');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(''), 3000);
    }
  };

  // Add functions
  const addTransaction = () => {
    if (!newTransaction.amount || !newTransaction.category) return;
    const transaction = { 
      id: Date.now(), 
      ...newTransaction, 
      amount: parseFloat(newTransaction.amount), 
      date: new Date().toISOString().split('T')[0] 
    };
    setTransactions([transaction, ...transactions]);
    
    setAccounts(accounts.map(acc => {
      if (acc.id === parseInt(newTransaction.account)) {
        const change = newTransaction.type === 'income' ? parseFloat(newTransaction.amount) : -parseFloat(newTransaction.amount);
        return { ...acc, currentBalance: acc.currentBalance + change };
      }
      return acc;
    }));
    
    setNewTransaction({ type: 'expense', amount: '', category: '', account: 1, description: '' });
    setShowAddTransaction(false);
  };

  const addAccount = () => {
    if (!newAccount.name || !newAccount.openingBalance) return;
    const account = {
      id: Date.now(), 
      ...newAccount, 
      openingBalance: parseFloat(newAccount.openingBalance),
      currentBalance: parseFloat(newAccount.openingBalance), 
      isActive: true
    };
    setAccounts([...accounts, account]);
    setNewAccount({ name: '', type: 'bank', openingBalance: '' });
    setShowAddAccount(false);
  };

  const addBudget = () => {
    if (!newBudget.category || !newBudget.amount) return;
    const budget = { id: Date.now(), ...newBudget, amount: parseFloat(newBudget.amount), spent: 0 };
    setBudgets([...budgets, budget]);
    setNewBudget({ category: '', amount: '', period: 'monthly' });
    setShowAddBudget(false);
  };

  const addLoan = () => {
    if (!newLoan.amount || !newLoan.friendName || !newLoan.account) return;
    const loan = { id: Date.now(), ...newLoan, amount: parseFloat(newLoan.amount), status: 'pending' };
    setLoans([...loans, loan]);
    
    const transaction = {
      id: Date.now() + 1,
      date: new Date().toISOString().split('T')[0],
      type: newLoan.type === 'given' ? 'expense' : 'income',
      amount: parseFloat(newLoan.amount),
      category: newLoan.type === 'given' ? 'Loan Given' : 'Loan Taken',
      account: parseInt(newLoan.account),
      description: newLoan.type === 'given' ? 'Loan given to ' + newLoan.friendName : 'Loan taken from ' + newLoan.friendName
    };
    
    setTransactions([transaction, ...transactions]);
    
    setAccounts(accounts.map(acc => {
      if (acc.id === parseInt(newLoan.account)) {
        const change = newLoan.type === 'given' ? -parseFloat(newLoan.amount) : parseFloat(newLoan.amount);
        return { ...acc, currentBalance: acc.currentBalance + change };
      }
      return acc;
    }));
    
    setNewLoan({ type: 'given', amount: '', friendName: '', dueDate: '', account: 1 });
    setShowAddLoan(false);
  };

  const addWorkplace = () => {
    if (!newWorkplace.name || !newWorkplace.hourlyRate) return;
    const workplace = {
      id: Date.now(),
      ...newWorkplace,
      hourlyRate: parseFloat(newWorkplace.hourlyRate)
    };
    setWorkplaces([...workplaces, workplace]);
    setNewWorkplace({ name: '', hourlyRate: '', paymentNorm: 'monthly' });
    setShowAddWorkplace(false);
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date('2000-01-01T' + checkIn);
    const end = new Date('2000-01-01T' + checkOut);
    const diffMs = end - start;
    if (diffMs < 0) return 0;
    return diffMs / (1000 * 60 * 60);
  };

  const addWork = () => {
    if (!newWork.workplaceId || !newWork.date || !newWork.checkIn || !newWork.checkOut) return;
    
    const workplace = workplaces.find(w => w.id === parseInt(newWork.workplaceId));
    if (!workplace) return;
    
    const hours = calculateHours(newWork.checkIn, newWork.checkOut);
    const earnings = hours * workplace.hourlyRate;
    
    const work = { 
      id: Date.now(), 
      workplaceId: parseInt(newWork.workplaceId),
      workplace: workplace.name,
      date: newWork.date,
      checkIn: newWork.checkIn,
      checkOut: newWork.checkOut,
      hours: parseFloat(hours.toFixed(2)), 
      earnings: parseFloat(earnings.toFixed(2)),
      paid: false
    };
    setWorkLogs([...workLogs, work]);
    setNewWork({ workplaceId: '', date: '', checkIn: '', checkOut: '' });
    setShowAddWork(false);
  };

  const markWorkAsPaid = (workLogId) => {
    const workLog = workLogs.find(w => w.id === workLogId);
    if (!workLog || workLog.paid) return;

    setWorkLogs(workLogs.map(w => 
      w.id === workLogId ? { ...w, paid: true } : w
    ));

    const transaction = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      amount: workLog.earnings,
      category: 'Work Payment',
      account: 1, // Default to first account
      description: 'Payment from ' + workLog.workplace
    };

    setTransactions([transaction, ...transactions]);

    setAccounts(accounts.map(acc => 
      acc.id === 1 ? { ...acc, currentBalance: acc.currentBalance + workLog.earnings } : acc
    ));
  };

  // Date helper functions for work payment calculations
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getBiweeklyPeriod = (date) => {
    const d = new Date(date);
    const day = d.getDate();
    if (day <= 15) {
      return {
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth(), 15)
      };
    } else {
      return {
        start: new Date(d.getFullYear(), d.getMonth(), 16),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0)
      };
    }
  };

  const getMonthStart = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  };

  const formatDateRange = (start, end) => {
    return start.toLocaleDateString() + ' - ' + end.toLocaleDateString();
  };

  const getWorkplaceDues = () => {
    const dues = [];
    
    workplaces.forEach(workplace => {
      const unpaidLogs = workLogs.filter(log => 
        log.workplaceId === workplace.id && !log.paid
      );

      if (unpaidLogs.length === 0) return;

      const groupedLogs = {};

      unpaidLogs.forEach(log => {
        let periodKey;
        let periodLabel;

        switch(workplace.paymentNorm) {
          case 'weekly':
            const weekStart = getWeekStart(log.date);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            periodKey = weekStart.toISOString().split('T')[0];
            periodLabel = formatDateRange(weekStart, weekEnd);
            break;

          case 'biweekly':
            const biweekly = getBiweeklyPeriod(log.date);
            periodKey = biweekly.start.toISOString().split('T')[0];
            periodLabel = formatDateRange(biweekly.start, biweekly.end);
            break;

          case 'monthly':
            const monthStart = getMonthStart(log.date);
            const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
            periodKey = monthStart.toISOString().split('T')[0];
            periodLabel = formatDateRange(monthStart, monthEnd);
            break;

          default:
            periodKey = log.date;
            periodLabel = log.date;
        }

        if (!groupedLogs[periodKey]) {
          groupedLogs[periodKey] = {
            workplace: workplace.name,
            workplaceId: workplace.id,
            period: periodLabel,
            paymentNorm: workplace.paymentNorm,
            logs: [],
            totalHours: 0,
            totalEarnings: 0
          };
        }

        groupedLogs[periodKey].logs.push(log);
        groupedLogs[periodKey].totalHours += log.hours;
        groupedLogs[periodKey].totalEarnings += log.earnings;
      });

      dues.push(...Object.values(groupedLogs));
    });

    return dues;
  };

  const markWorkGroupAsPaid = (workGroup) => {
    setWorkLogs(workLogs.map(log => 
      workGroup.logs.find(selected => selected.id === log.id)
        ? { ...log, paid: true }
        : log
    ));

    const transaction = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      amount: workGroup.totalEarnings,
      category: 'Work Payment',
      account: 1,
      description: 'Payment from ' + workGroup.workplace
    };

    setTransactions([transaction, ...transactions]);

    setAccounts(accounts.map(acc => 
      acc.id === 1 
        ? { ...acc, currentBalance: acc.currentBalance + workGroup.totalEarnings }
        : acc
    ));
  };

  // Delete functions
  const deleteTransaction = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    setTransactions(transactions.filter(t => t.id !== transactionId));
    
    setAccounts(accounts.map(acc => {
      if (acc.id === transaction.account) {
        const change = transaction.type === 'income' ? -transaction.amount : transaction.amount;
        return { ...acc, currentBalance: acc.currentBalance + change };
      }
      return acc;
    }));
  };

  const deleteAccount = (accountId) => {
    setAccounts(accounts.filter(acc => acc.id !== accountId));
  };

  const deleteBudget = (budgetId) => {
    setBudgets(budgets.filter(budget => budget.id !== budgetId));
  };

  const deleteLoan = (loanId) => {
    setLoans(loans.filter(loan => loan.id !== loanId));
  };

  const deleteWorkplace = (workplaceId) => {
    setWorkplaces(workplaces.filter(workplace => workplace.id !== workplaceId));
    setWorkLogs(workLogs.filter(log => log.workplaceId !== workplaceId));
  };

  const deleteWorkLog = (workLogId) => {
    setWorkLogs(workLogs.filter(log => log.id !== workLogId));
  };

  const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Expense Tracker</h1>
                <p className="text-sm text-gray-500">Manage your finances</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {syncMessage && (
                <div className="text-sm text-gray-600 mr-2">{syncMessage}</div>
              )}
              <button 
                onClick={syncToGoogleSheets}
                disabled={isSyncing}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Sync to Sheets</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Dashboard', icon: BarChart3 },
              { id: 'transactions', label: 'Transactions', icon: DollarSign },
              { id: 'budgets', label: 'Budgets', icon: Target },
              { id: 'loans', label: 'Loans', icon: Users },
              { id: 'work', label: 'Work', icon: Clock }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Net Worth</p>
                    <p className="text-2xl font-bold text-gray-900">${getTotalBalance().toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Income</p>
                    <p className="text-2xl font-bold text-gray-900">${getMonthlyIncome().toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">${getMonthlyExpenses().toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Pending Work</p>
                    <p className="text-2xl font-bold text-gray-900">${getPendingWorkEarnings().toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accounts Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Account Balances</h3>
                  <button onClick={() => setShowAddAccount(true)} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    + Add Account
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {accounts.map(account => (
                    <div key={account.id} className="group flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          {getAccountIcon(account.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{account.name}</p>
                          <p className="text-sm text-gray-500">Opening: ${account.openingBalance.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${account.currentBalance.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(account.currentBalance - account.openingBalance) >= 0 ? '+' : ''}
                            ${(account.currentBalance - account.openingBalance).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteAccount(account.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  <button onClick={() => setShowAddTransaction(true)} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    + Add Transaction
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(transaction => (
                    <div key={transaction.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? 
                            <TrendingUp className="w-5 h-5 text-green-600" /> : 
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description || transaction.category}</p>
                          <p className="text-sm text-gray-500">{transaction.date} • {transaction.category}</p>
                        </div>
                      </div>
                      <p className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
                <p className="text-gray-500 mt-1">Track all your income and expenses</p>
              </div>
              <button onClick={() => setShowAddTransaction(true)} 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                + Add Transaction
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="space-y-3">
                  {transactions.map(transaction => (
                    <div key={transaction.id} className="group flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? 
                            <TrendingUp className="w-6 h-6 text-green-600" /> : 
                            <TrendingDown className="w-6 h-6 text-red-600" />
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{transaction.description || transaction.category}</p>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{transaction.date}</span>
                            </span>
                            <span>•</span>
                            <span>{transaction.category}</span>
                            <span>•</span>
                            <span>{accounts.find(a => a.id === transaction.account) ? accounts.find(a => a.id === transaction.account).name : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <p className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                        <button
                          onClick={() => deleteTransaction(transaction.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'budgets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Budgets</h2>
                <p className="text-gray-500 mt-1">Monitor your spending limits</p>
              </div>
              <button onClick={() => setShowAddBudget(true)} 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                + Add Budget
              </button>
            </div>
            <div className="grid gap-6">
              {budgets.map(budget => {
                const percentage = (budget.spent / budget.amount) * 100;
                return (
                  <div key={budget.id} className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{budget.category}</h3>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-semibold text-gray-600">${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}</span>
                        <button
                          onClick={() => deleteBudget(budget.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete budget"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div className={`h-3 rounded-full transition-all duration-300 ${
                        percentage > 100 ? 'bg-red-500' : 
                        percentage > 80 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                        style={{ width: Math.min(percentage, 100) + '%' }}></div>
                    </div>
                    <p className={`text-sm font-medium ${
                      percentage > 100 ? 'text-red-600' : 
                      percentage > 80 ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {percentage.toFixed(1)}% used
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'loans' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Loans</h2>
                <p className="text-gray-500 mt-1">Track money lent and borrowed</p>
              </div>
              <button onClick={() => setShowAddLoan(true)} 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                + Add Loan
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-700 text-sm font-medium">Receivables</p>
                    <p className="text-2xl font-bold text-green-800">${getTotalReceivables().toFixed(2)}</p>
                  </div>
                  <HandHeart className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-700 text-sm font-medium">Payables</p>
                    <p className="text-2xl font-bold text-red-800">${getTotalPayables().toFixed(2)}</p>
                  </div>
                  <FileText className="w-10 h-10 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h3>
              <div className="space-y-4">
                {loans.map(loan => (
                  <div key={loan.id} className="group flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        loan.type === 'given' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {loan.type === 'given' ? 
                          <HandHeart className="w-6 h-6 text-green-600" /> : 
                          <FileText className="w-6 h-6 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{loan.friendName}</p>
                        <p className="text-sm text-gray-500">Due: {loan.dueDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${loan.type === 'given' ? 'text-green-600' : 'text-red-600'}`}>
                          ${loan.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">{loan.type} • {loan.status}</p>
                      </div>
                      <button
                        onClick={() => deleteLoan(loan.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete loan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'work' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Work</h2>
                <p className="text-gray-500 mt-1">Track your work hours and earnings</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setShowAddWorkplace(true)} 
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                  + Add Workplace
                </button>
                <button onClick={() => setShowAddWork(true)} 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  + Log Work
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workplaces</h3>
              <div className="grid gap-4">
                {workplaces.map(workplace => (
                  <div key={workplace.id} className="group flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{workplace.name}</p>
                      <p className="text-sm text-gray-500">Payment: {workplace.paymentNorm}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <p className="text-lg font-bold text-blue-600">${workplace.hourlyRate}/hr</p>
                      <button
                        onClick={() => deleteWorkplace(workplace.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete workplace"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Payment Due by Period */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Due by Period</h3>
              <div className="space-y-4">
                {getWorkplaceDues().map((dueGroup, index) => (
                  <div key={index} className="p-5 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{dueGroup.workplace}</h4>
                        <p className="text-sm text-gray-600">{dueGroup.period} ({dueGroup.paymentNorm})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">${dueGroup.totalEarnings.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{dueGroup.totalHours.toFixed(1)} hours</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {dueGroup.logs.length} work session{dueGroup.logs.length > 1 ? 's' : ''}
                      </div>
                      <button
                        onClick={() => markWorkGroupAsPaid(dueGroup)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                      >
                        Mark as Paid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Work Logs</h3>
              <div className="space-y-4">
                {workLogs.map(workLog => (
                  <div key={workLog.id} className="group flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        workLog.paid ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        <Clock className={`w-6 h-6 ${workLog.paid ? 'text-green-600' : 'text-yellow-600'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{workLog.workplace}</p>
                        <p className="text-sm text-gray-500">
                          {workLog.date} • {workLog.checkIn} - {workLog.checkOut} • {workLog.hours}h
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">${workLog.earnings.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{workLog.paid ? 'Paid' : 'Pending'}</p>
                      </div>
                      {!workLog.paid && (
                        <button
                          onClick={() => markWorkAsPaid(workLog.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => deleteWorkLog(workLog.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete work log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal show={showAddTransaction} onClose={() => setShowAddTransaction(false)} title="Add Transaction">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                className={`px-4 py-2 rounded-lg font-medium ${newTransaction.type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
              >
                Expense
              </button>
              <button
                onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                className={`px-4 py-2 rounded-lg font-medium ${newTransaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
              >
                Income
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
            <select
              value={newTransaction.account}
              onChange={(e) => setNewTransaction({...newTransaction, account: parseInt(e.target.value)})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional description"
            />
          </div>
          <button
            onClick={addTransaction}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Add Transaction
          </button>
        </div>
      </Modal>

      <Modal show={showAddAccount} onClose={() => setShowAddAccount(false)} title="Add Account">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
            <input
              type="text"
              value={newAccount.name}
              onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Account name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
            <select
              value={newAccount.type}
              onChange={(e) => setNewAccount({...newAccount, type: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="bank">Bank Account</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit Card</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Opening Balance</label>
            <input
              type="number"
              value={newAccount.openingBalance}
              onChange={(e) => setNewAccount({...newAccount, openingBalance: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <button
            onClick={addAccount}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Add Account
          </button>
        </div>
      </Modal>

      <Modal show={showAddBudget} onClose={() => setShowAddBudget(false)} title="Add Budget">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={newBudget.category}
              onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget Amount</label>
            <input
              type="number"
              value={newBudget.amount}
              onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={newBudget.period}
              onChange={(e) => setNewBudget({...newBudget, period: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <button
            onClick={addBudget}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Add Budget
          </button>
        </div>
      </Modal>

      <Modal show={showAddLoan} onClose={() => setShowAddLoan(false)} title="Add Loan">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loan Type</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setNewLoan({...newLoan, type: 'given'})}
                className={`px-4 py-2 rounded-lg font-medium ${newLoan.type === 'given' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
              >
                Money Lent
              </button>
              <button
                onClick={() => setNewLoan({...newLoan, type: 'taken'})}
                className={`px-4 py-2 rounded-lg font-medium ${newLoan.type === 'taken' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
              >
                Money Borrowed
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              value={newLoan.amount}
              onChange={(e) => setNewLoan({...newLoan, amount: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Friend's Name</label>
            <input
              type="text"
              value={newLoan.friendName}
              onChange={(e) => setNewLoan({...newLoan, friendName: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Friend's name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              value={newLoan.dueDate}
              onChange={(e) => setNewLoan({...newLoan, dueDate: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
            <select
              value={newLoan.account}
              onChange={(e) => setNewLoan({...newLoan, account: parseInt(e.target.value)})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={addLoan}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Add Loan
          </button>
        </div>
      </Modal>

      <Modal show={showAddWorkplace} onClose={() => setShowAddWorkplace(false)} title="Add Workplace">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Workplace Name</label>
            <input
              type="text"
              value={newWorkplace.name}
              onChange={(e) => setNewWorkplace({...newWorkplace, name: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Workplace name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
            <input
              type="number"
              value={newWorkplace.hourlyRate}
              onChange={(e) => setNewWorkplace({...newWorkplace, hourlyRate: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Schedule</label>
            <select
              value={newWorkplace.paymentNorm}
              onChange={(e) => setNewWorkplace({...newWorkplace, paymentNorm: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button
            onClick={addWorkplace}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Add Workplace
          </button>
        </div>
      </Modal>

      <Modal show={showAddWork} onClose={() => setShowAddWork(false)} title="Log Work">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Workplace</label>
            <select
              value={newWork.workplaceId}
              onChange={(e) => setNewWork({...newWork, workplaceId: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select workplace</option>
              {workplaces.map(workplace => (
                <option key={workplace.id} value={workplace.id}>{workplace.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={newWork.date}
              onChange={(e) => setNewWork({...newWork, date: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check In</label>
              <input
                type="time"
                value={newWork.checkIn}
                onChange={(e) => setNewWork({...newWork, checkIn: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check Out</label>
              <input
                type="time"
                value={newWork.checkOut}
                onChange={(e) => setNewWork({...newWork, checkOut: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={addWork}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Log Work
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default PersonalExpenseTracker;
