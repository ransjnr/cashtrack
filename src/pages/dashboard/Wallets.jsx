import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { getWallets, createWallet, updateWallet, deleteWallet } from '../../api/wallets.js'
import { useAuth } from '../../context/AuthContext.jsx'

const walletTypes = ['cash', 'bank', 'card', 'digital']

const formatCurrency = (value) => {
  const safeValue = Number.isFinite(value) ? value : 0
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 2,
    }).format(safeValue)
  } catch (error) {
    return `NGN ${safeValue.toFixed(2)}`
  }
}

export default function Wallets() {
  const { token } = useAuth()
  const [wallets, setWallets] = useState([])
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    type: 'bank',
    balance: '',
  })

  const loadWallets = async () => {
    if (!token) {
      setWallets([])
      return
    }
    setStatus('loading')
    setMessage('')
    try {
      const data = await getWallets()
      const list = Array.isArray(data) ? data : data?.data || []
      setWallets(list)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Unable to load wallets.')
    }
  }

  useEffect(() => {
    loadWallets()
  }, [token])

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleReset = () => {
    setForm({
      name: '',
      type: 'bank',
      balance: '',
    })
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!token) {
      setMessage('Add your token on the login page before adding wallets.')
      setStatus('error')
      return
    }
    if (!form.name.trim()) {
      setMessage('Enter a wallet name.')
      setStatus('error')
      return
    }
    if (!form.balance || Number(form.balance) < 0) {
      setMessage('Enter a valid balance.')
      setStatus('error')
      return
    }
    setIsSubmitting(true)
    setStatus('loading')
    setMessage('')
    try {
      const payload = {
        name: form.name,
        type: form.type,
        balance: String(form.balance),
      }
      
      if (editingId) {
        await updateWallet(editingId, payload)
      } else {
        await createWallet(payload)
      }
      
      handleReset()
      await loadWallets()
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Unable to save wallet.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (wallet) => {
    setForm({
      name: wallet.name,
      type: wallet.type,
      balance: wallet.balance,
    })
    setEditingId(wallet.id)
  }

  const handleDelete = async (id) => {
    if (!token || !window.confirm('Delete this wallet?')) return
    try {
      await deleteWallet(id)
      await loadWallets()
    } catch (error) {
      setMessage(error.message || 'Unable to delete wallet.')
      setStatus('error')
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Wallets"
        subtitle="Track cash and bank wallets with clear ownership."
        actions={
          <button className="btn primary" type="button" onClick={loadWallets}>
            Refresh
          </button>
        }
      />

      <section className="grid-two">
        <div className="panel">
          <div className="panel-header">
            <h3>Create wallet</h3>
            <span className="label">New wallet</span>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field full">
              Wallet name
              <input
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="e.g., Operations bank"
              />
            </label>
            <label className="field">
              Type
              <select
                value={form.type}
                onChange={handleChange('type')}
              >
                {walletTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Initial balance
              <input
                type="number"
                inputMode="decimal"
                value={form.balance}
                onChange={handleChange('balance')}
                placeholder="0"
              />
            </label>
            <div className="field full">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingId ? 'Update wallet' : 'Create wallet'}
                </button>
                {editingId && (
                  <button className="btn ghost" type="button" onClick={handleReset}>
                    Cancel
                  </button>
                )}
              </div>
              {status === 'error' ? (
                <p className="form-error">{message}</p>
              ) : null}
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Wallet list</h3>
            <span className="label">{wallets.length} active</span>
          </div>
          {wallets.length === 0 ? (
            <EmptyState
              title="No wallets yet"
              description="Create your first wallet to start tracking cash."
              action={<span className="badge accent">Ready to create</span>}
            />
          ) : (
            <div className="wallet-list">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="wallet-card">
                  <div>
                    <span className="label">{wallet.name}</span>
                    <p className="stat-value">{formatCurrency(wallet.balance)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className="badge neutral">{wallet.type}</span>
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => handleEdit(wallet)}
                      style={{ padding: '4px 8px', font: '0.75rem' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => handleDelete(wallet.id)}
                      style={{ padding: '4px 8px', font: '0.75rem', color: '#b91c1c' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {!token && (
        <section className="panel">
          <p className="muted">Add your bearer token to manage wallets.</p>
        </section>
      )}
    </div>
  )
}
