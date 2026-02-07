import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE = 'https://cashtrack-01.onrender.com/api/v1'
const STORAGE_KEY = 'cashtrack-storage-v1'
const CURRENCIES = ['USD', 'NGN', 'EUR', 'GBP', 'GHS', 'KES']

const DEFAULT_BALANCES = { cash: 0, bank: 0 }
const DEFAULT_PROFILE = { businessName: '', businessType: '', email: '' }

const getToday = () => new Date().toISOString().slice(0, 10)
const getNowTime = () => new Date().toTimeString().slice(0, 5)

const normalizeToken = (value) => value.replace(/^Bearer\s+/i, '').trim()

const formatMoney = (value, currency) => {
  const safeValue = Number.isFinite(value) ? value : 0
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(safeValue)
  } catch (error) {
    return `${safeValue.toFixed(2)} ${currency}`
  }
}

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatTime = (value) => value || ''

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const getSignedAmount = (transaction) =>
  transaction.type === 'income' ? transaction.amount : -transaction.amount

function App() {
  const [token, setToken] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [startingBalances, setStartingBalances] = useState(DEFAULT_BALANCES)
  const [balanceDraft, setBalanceDraft] = useState({
    cash: String(DEFAULT_BALANCES.cash),
    bank: String(DEFAULT_BALANCES.bank),
  })
  const [balanceStatus, setBalanceStatus] = useState('')

  const [transactions, setTransactions] = useState([])
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense',
    account: 'cash',
    amount: '',
    description: '',
    date: getToday(),
    time: getNowTime(),
  })
  const [transactionError, setTransactionError] = useState('')

  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState(DEFAULT_PROFILE)
  const [profileStatus, setProfileStatus] = useState({
    state: 'idle',
    message: '',
  })

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      if (parsed.token) setToken(parsed.token)
      if (parsed.currency) setCurrency(parsed.currency)
      if (parsed.startingBalances) {
        const cash = toNumber(parsed.startingBalances.cash)
        const bank = toNumber(parsed.startingBalances.bank)
        setStartingBalances({ cash, bank })
        setBalanceDraft({ cash: String(cash), bank: String(bank) })
      }
      if (Array.isArray(parsed.transactions)) {
        const cleaned = parsed.transactions.map((transaction) => ({
          ...transaction,
          amount: toNumber(transaction.amount),
        }))
        setTransactions(cleaned)
      }
      if (parsed.profile) {
        setProfile(parsed.profile)
        setProfileForm({
          businessName: parsed.profile.businessName || '',
          businessType: parsed.profile.businessType || '',
          email: parsed.profile.email || '',
        })
      }
    } catch (error) {
      console.error('Unable to read saved CashTrack data.', error)
    }
  }, [])

  useEffect(() => {
    const payload = {
      token,
      currency,
      startingBalances,
      transactions,
      profile,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [token, currency, startingBalances, transactions, profile])

  useEffect(() => {
    setBalanceDraft({
      cash: String(startingBalances.cash),
      bank: String(startingBalances.bank),
    })
  }, [startingBalances])

  useEffect(() => {
    if (!profile) return
    setProfileForm({
      businessName: profile.businessName || '',
      businessType: profile.businessType || '',
      email: profile.email || '',
    })
  }, [profile])

  const totals = useMemo(
    () =>
      transactions.reduce(
        (accumulator, transaction) => {
          const signed = getSignedAmount(transaction)
          if (transaction.account === 'cash') {
            accumulator.cashActivity += signed
          } else {
            accumulator.bankActivity += signed
          }
          if (transaction.type === 'income') {
            accumulator.income += transaction.amount
          } else {
            accumulator.expense += transaction.amount
          }
          return accumulator
        },
        { cashActivity: 0, bankActivity: 0, income: 0, expense: 0 },
      ),
    [transactions],
  )

  const cashBalance = startingBalances.cash + totals.cashActivity
  const bankBalance = startingBalances.bank + totals.bankActivity
  const totalBalance = cashBalance + bankBalance

  const today = getToday()
  const todaysTransactions = transactions.filter(
    (transaction) => transaction.date === today,
  )
  const todaysNet = todaysTransactions.reduce(
    (total, transaction) => total + getSignedAmount(transaction),
    0,
  )

  const totalAbsolute = Math.abs(cashBalance) + Math.abs(bankBalance)
  const cashShare = totalAbsolute
    ? Math.round((Math.abs(cashBalance) / totalAbsolute) * 100)
    : 0
  const bankShare = totalAbsolute ? 100 - cashShare : 0

  const sortedTransactions = useMemo(() => {
    const getTimestamp = (transaction) => {
      if (transaction.timestamp) return transaction.timestamp
      const timeValue = transaction.time || '00:00'
      const dateTime = new Date(`${transaction.date}T${timeValue}`)
      return Number.isNaN(dateTime.getTime()) ? 0 : dateTime.getTime()
    }
    return [...transactions].sort(
      (first, second) => getTimestamp(second) - getTimestamp(first),
    )
  }, [transactions])

  const handleTransactionChange = (field) => (event) => {
    setTransactionForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
    if (transactionError) {
      setTransactionError('')
    }
  }

  const handleAddTransaction = (event) => {
    event.preventDefault()
    if (!transactionForm.description.trim()) {
      setTransactionError('Please add a short description.')
      return
    }
    const amount = Number(transactionForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setTransactionError('Enter a valid amount greater than zero.')
      return
    }
    const date = transactionForm.date || getToday()
    const time = transactionForm.time || getNowTime()
    const timestamp = new Date(`${date}T${time}`).getTime()
    const newTransaction = {
      id: createId(),
      description: transactionForm.description.trim(),
      amount,
      type: transactionForm.type,
      account: transactionForm.account,
      date,
      time,
      timestamp: Number.isNaN(timestamp) ? Date.now() : timestamp,
    }
    setTransactions((current) => [newTransaction, ...current])
    setTransactionForm((current) => ({
      ...current,
      amount: '',
      description: '',
      date,
      time,
    }))
  }

  const removeTransaction = (transactionId) => {
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== transactionId),
    )
  }

  const handleBalanceSubmit = (event) => {
    event.preventDefault()
    const cash = Number(balanceDraft.cash)
    const bank = Number(balanceDraft.bank)
    if (!Number.isFinite(cash) || !Number.isFinite(bank)) {
      setBalanceStatus('Enter valid numbers for both balances.')
      return
    }
    setStartingBalances({ cash, bank })
    setBalanceStatus('Starting balances updated.')
  }

  const handleProfileChange = (field) => (event) => {
    setProfileForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleFetchProfile = async () => {
    if (!token.trim()) {
      setProfileStatus({
        state: 'error',
        message: 'Add a bearer token to fetch your profile.',
      })
      return
    }
    setProfileStatus({ state: 'loading', message: 'Fetching profile...' })
    try {
      const response = await fetch(`${API_BASE}/users/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${normalizeToken(token)}`,
        },
      })
      const text = await response.text()
      if (!response.ok) {
        throw new Error(text || 'Unable to fetch profile.')
      }
      if (text) {
        let data = null
        try {
          data = JSON.parse(text)
        } catch (error) {
          data = null
        }
        if (data) {
          setProfile(data)
          setProfileStatus({ state: 'success', message: 'Profile loaded.' })
        } else {
          setProfileStatus({
            state: 'success',
            message: 'Profile fetched. Response body could not be parsed.',
          })
        }
      } else {
        setProfileStatus({
          state: 'success',
          message: 'Profile fetched. No response body returned.',
        })
      }
    } catch (error) {
      setProfileStatus({
        state: 'error',
        message: error.message || 'Unable to fetch profile.',
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!token.trim()) {
      setProfileStatus({
        state: 'error',
        message: 'Add a bearer token to update your profile.',
      })
      return
    }
    if (!profileForm.businessName || !profileForm.email) {
      setProfileStatus({
        state: 'error',
        message: 'Business name and email are required.',
      })
      return
    }
    setProfileStatus({ state: 'loading', message: 'Saving profile...' })
    try {
      const response = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${normalizeToken(token)}`,
        },
        body: JSON.stringify({
          businessName: profileForm.businessName,
          businessType: profileForm.businessType,
          email: profileForm.email,
        }),
      })
      const text = await response.text()
      if (!response.ok) {
        throw new Error(text || 'Unable to update profile.')
      }
      let data = profileForm
      if (text) {
        try {
          data = JSON.parse(text)
        } catch (error) {
          data = profileForm
        }
      }
      setProfile(data || profileForm)
      setProfileStatus({ state: 'success', message: 'Profile updated.' })
    } catch (error) {
      setProfileStatus({
        state: 'error',
        message: error.message || 'Unable to update profile.',
      })
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">CashTrack</p>
          <h1 className="app-title">Cash and bank money, side by side.</h1>
          <p className="subtitle">
            Track cash on hand, bank balances, and every income or expense so
            you always know your true total.
          </p>
        </div>
        <div className="header-card">
          <span className="label">Total balance</span>
          <span
            className={`amount large ${
              totalBalance >= 0 ? 'positive' : 'negative'
            }`}
          >
            {formatMoney(totalBalance, currency)}
          </span>
          <span className="subtle">
            {transactions.length} transaction
            {transactions.length === 1 ? '' : 's'} recorded
          </span>
        </div>
      </header>

      <section className="overview-grid">
        <div className="card">
          <div className="card-header">
            <h3>Cash on hand</h3>
            <span className="badge cash">Cash</span>
          </div>
          <p className="amount">{formatMoney(cashBalance, currency)}</p>
          <p className="subtle">
            Starting {formatMoney(startingBalances.cash, currency)} • Activity{' '}
            {formatMoney(totals.cashActivity, currency)}
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Bank balance</h3>
            <span className="badge bank">Bank</span>
          </div>
          <p className="amount">{formatMoney(bankBalance, currency)}</p>
          <p className="subtle">
            Starting {formatMoney(startingBalances.bank, currency)} • Activity{' '}
            {formatMoney(totals.bankActivity, currency)}
          </p>
        </div>

        <div className="card highlight">
          <div className="card-header">
            <h3>Income vs expense</h3>
          </div>
          <div className="split">
            <div>
              <span className="label">Income</span>
              <p className="amount positive">
                {formatMoney(totals.income, currency)}
              </p>
            </div>
            <div>
              <span className="label">Expenses</span>
              <p className="amount negative">
                {formatMoney(totals.expense, currency)}
              </p>
            </div>
          </div>
          <p className="subtle">
            Net change {formatMoney(totals.income - totals.expense, currency)}
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Today&apos;s net</h3>
          </div>
          <p
            className={`amount ${
              todaysNet >= 0 ? 'positive' : 'negative'
            }`}
          >
            {formatMoney(todaysNet, currency)}
          </p>
          <p className="subtle">
            {todaysTransactions.length} transaction
            {todaysTransactions.length === 1 ? '' : 's'} today
          </p>
        </div>
      </section>

      <section className="section-grid">
        <div className="card">
          <h2>Balance setup</h2>
          <p className="subtle">
            Enter your starting cash and bank balances to keep totals accurate.
          </p>
          <form className="form-grid" onSubmit={handleBalanceSubmit}>
            <label className="field">
              Cash starting balance
              <input
                type="number"
                inputMode="decimal"
                value={balanceDraft.cash}
                onChange={(event) =>
                  setBalanceDraft((current) => ({
                    ...current,
                    cash: event.target.value,
                  }))
                }
              />
            </label>
            <label className="field">
              Bank starting balance
              <input
                type="number"
                inputMode="decimal"
                value={balanceDraft.bank}
                onChange={(event) =>
                  setBalanceDraft((current) => ({
                    ...current,
                    bank: event.target.value,
                  }))
                }
              />
            </label>
            <div className="field">
              <span>Currency</span>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
              >
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
            <div className="field action">
              <button className="primary" type="submit">
                Save balances
              </button>
              {balanceStatus ? (
                <span className="subtle">{balanceStatus}</span>
              ) : null}
            </div>
          </form>
        </div>

        <div className="card">
          <h2>Cash vs bank mix</h2>
          <p className="subtle">
            See how your money is split across cash and digital accounts.
          </p>
          <div className="distribution">
            <div className="distribution-bar">
              <span className="bar cash" style={{ width: `${cashShare}%` }} />
              <span className="bar bank" style={{ width: `${bankShare}%` }} />
            </div>
            <div className="distribution-labels">
              <div>
                <span className="label">Cash</span>
                <p className="amount">{formatMoney(cashBalance, currency)}</p>
              </div>
              <div>
                <span className="label">Bank</span>
                <p className="amount">{formatMoney(bankBalance, currency)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-grid">
        <div className="card">
          <h2>Add transaction</h2>
          <p className="subtle">
            Record income or expenses to keep balances up to date.
          </p>
          <form className="form-grid" onSubmit={handleAddTransaction}>
            <label className="field">
              Description
              <input
                type="text"
                placeholder="Groceries, client payment, rent"
                value={transactionForm.description}
                onChange={handleTransactionChange('description')}
              />
            </label>
            <label className="field">
              Amount
              <input
                type="number"
                inputMode="decimal"
                value={transactionForm.amount}
                onChange={handleTransactionChange('amount')}
              />
            </label>
            <label className="field">
              Type
              <select
                value={transactionForm.type}
                onChange={handleTransactionChange('type')}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>
            <label className="field">
              Account
              <select
                value={transactionForm.account}
                onChange={handleTransactionChange('account')}
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
              </select>
            </label>
            <label className="field">
              Date
              <input
                type="date"
                value={transactionForm.date}
                onChange={handleTransactionChange('date')}
              />
            </label>
            <label className="field">
              Time
              <input
                type="time"
                value={transactionForm.time}
                onChange={handleTransactionChange('time')}
              />
            </label>
            <div className="field action">
              <button className="primary" type="submit">
                Add transaction
              </button>
              {transactionError ? (
                <span className="error">{transactionError}</span>
              ) : null}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Recent transactions</h2>
            <span className="subtle">{transactions.length} total</span>
          </div>
          {sortedTransactions.length === 0 ? (
            <p className="empty-state">
              Transactions will show here once you add them.
            </p>
          ) : (
            <div className="transaction-list">
              {sortedTransactions.map((transaction) => {
                const signedAmount = getSignedAmount(transaction)
                return (
                  <div key={transaction.id} className="transaction-card">
                    <div>
                      <p className="transaction-title">
                        {transaction.description}
                      </p>
                      <div className="transaction-meta">
                        <span>
                          {formatDate(transaction.date)} •{' '}
                          {formatTime(transaction.time)}
                        </span>
                        <span className={`badge ${transaction.account}`}>
                          {transaction.account === 'cash' ? 'Cash' : 'Bank'}
                        </span>
                        <span className={`badge ${transaction.type}`}>
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </div>
                    </div>
                    <div className="transaction-actions">
                      <span
                        className={`amount ${
                          signedAmount >= 0 ? 'positive' : 'negative'
                        }`}
                      >
                        {formatMoney(signedAmount, currency)}
                      </span>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => removeTransaction(transaction.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="card profile-card">
        <div className="card-header">
          <div>
            <h2>Connect your CashTrack profile</h2>
            <p className="subtle">
              Use your bearer token to fetch or update your profile via the
              CashTrack API.
            </p>
          </div>
          <div className="profile-actions">
            <button type="button" className="secondary" onClick={handleFetchProfile}>
              Fetch profile
            </button>
            <button type="button" className="primary" onClick={handleSaveProfile}>
              Save profile
            </button>
          </div>
        </div>

        <div className="profile-grid">
          <label className="field full">
            Bearer token
            <input
              type="password"
              placeholder="Paste token (with or without 'Bearer ')"
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
          </label>
          <label className="field">
            Business name
            <input
              type="text"
              value={profileForm.businessName}
              onChange={handleProfileChange('businessName')}
            />
          </label>
          <label className="field">
            Business type
            <input
              type="text"
              value={profileForm.businessType}
              onChange={handleProfileChange('businessType')}
            />
          </label>
          <label className="field">
            Email
            <input
              type="email"
              value={profileForm.email}
              onChange={handleProfileChange('email')}
            />
          </label>
          <div className="field action full">
            {profileStatus.message ? (
              <span className={`status ${profileStatus.state}`}>
                {profileStatus.message}
              </span>
            ) : (
              <span className="subtle">
                Profile details are saved locally for convenience.
              </span>
            )}
          </div>
        </div>

        {profile ? (
          <div className="profile-summary">
            <div>
              <span className="label">Current profile</span>
              <p className="amount">{profile.businessName || '—'}</p>
              <p className="subtle">
                {profile.businessType || 'Business type not set'}
              </p>
            </div>
            <div>
              <span className="label">Email</span>
              <p className="amount">{profile.email || '—'}</p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default App
