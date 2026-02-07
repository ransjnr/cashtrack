import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { createOutflow, getOutflows, updateOutflow, deleteOutflow } from '../../api/outflows.js'
import { useAuth } from '../../context/AuthContext.jsx'

const outflowCategories = ['delivery', 'utilities', 'salary', 'inventory', 'marketing', 'transport', 'fuel', 'maintenance']

const todayInput = () => new Date().toISOString().slice(0, 10)

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

const toApiDate = (value) => {
  if (!value) return ''
  if (value.includes('/')) return value
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .replace(/\s/g, '/')
}

const formatDisplayDate = (value) => {
  if (!value) return '-'
  if (value.includes('/')) return value
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function Outflows() {
  const { token } = useAuth()
  const [outflows, setOutflows] = useState([])
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    amount: '',
    date: todayInput(),
    category: 'delivery',
    note: '',
  })

  const loadOutflows = async () => {
    if (!token) {
      setOutflows([])
      return
    }
    setStatus('loading')
    setMessage('')
    try {
      const data = await getOutflows()
      const list = Array.isArray(data) ? data : data?.data || []
      setOutflows(list)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Unable to load outflows.')
    }
  }

  useEffect(() => {
    loadOutflows()
  }, [token])

  const totalAmount = useMemo(
    () =>
      outflows.reduce((total, item) => total + Number(item.amount || 0), 0),
    [outflows],
  )

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleReset = () => {
    setForm({
      amount: '',
      date: todayInput(),
      category: 'delivery',
      note: '',
    })
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!token) {
      setMessage('Add your token on the login page before posting outflows.')
      setStatus('error')
      return
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setMessage('Enter an amount greater than zero.')
      setStatus('error')
      return
    }
    setIsSubmitting(true)
    setStatus('loading')
    setMessage('')
    try {
      const payload = {
        amount: String(form.amount),
        date: toApiDate(form.date),
        category: form.category,
        note: form.note,
      }
      
      if (editingId) {
        await updateOutflow(editingId, payload)
      } else {
        await createOutflow(payload)
      }
      
      handleReset()
      await loadOutflows()
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Unable to save outflow.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (outflow) => {
    setForm({
      amount: outflow.amount,
      date: outflow.date,
      category: outflow.category,
      note: outflow.note,
    })
    setEditingId(outflow.id)
  }

  const handleDelete = async (id) => {
    if (!token || !window.confirm('Delete this outflow?')) return
    try {
      await deleteOutflow(id)
      await loadOutflows()
    } catch (error) {
      setMessage(error.message || 'Unable to delete outflow.')
      setStatus('error')
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Outflows"
        subtitle="Plan vendor payments, salaries, and every cash exit."
        actions={
          <button className="btn primary" type="button" onClick={loadOutflows}>
            Refresh
          </button>
        }
      />

      <section className="grid-two">
        <div className="panel">
          <div className="panel-header">
            <h3>New outflow</h3>
            <span className="label">POST /outflows</span>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              Amount
              <input
                type="number"
                inputMode="decimal"
                value={form.amount}
                onChange={handleChange('amount')}
                placeholder="200000"
              />
            </label>
            <label className="field">
              Date
              <input
                type="date"
                value={form.date}
                onChange={handleChange('date')}
              />
            </label>
            <label className="field">
              Category
              <select
                value={form.category}
                onChange={handleChange('category')}
              >
                {outflowCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label className="field full">
              Note
              <textarea
                rows="3"
                value={form.note}
                onChange={handleChange('note')}
                placeholder="Describe the outflow"
              />
            </label>
            <div className="field full">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingId ? 'Update outflow' : 'Create outflow'}
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
            <h3>Outflow summary</h3>
            <span className="label">GET /outflows</span>
          </div>
          <div className="summary-grid">
            <div>
              <span className="label">Total outflows</span>
              <p className="stat-value">{formatCurrency(totalAmount)}</p>
            </div>
            <div>
              <span className="label">Entries</span>
              <p className="stat-value">{outflows.length}</p>
            </div>
          </div>
          {status === 'loading' ? (
            <p className="muted">Loading outflows...</p>
          ) : null}
          {status === 'error' && message ? (
            <p className="form-error">{message}</p>
          ) : null}
          {!token ? (
            <p className="muted">
              Add your bearer token to pull data from the API.
            </p>
          ) : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Recorded outflows</h3>
          <span className="label">Latest entries</span>
        </div>
        {outflows.length === 0 ? (
          <EmptyState
            title="No outflows yet"
            description="Start with your first payment to populate the ledger."
            action={<span className="badge accent">Ready to log</span>}
          />
        ) : (
          <div className="table">
            <div className="table-row table-head">
              <span>Date</span>
              <span>Category</span>
              <span>Note</span>
              <span className="align-right">Amount</span>
              <span>Actions</span>
            </div>
            {outflows.map((item, index) => (
              <div key={item.id || index} className="table-row">
                <span>{formatDisplayDate(item.date)}</span>
                <span className="badge neutral">{item.category || '-'}</span>
                <span>{item.note || '-'}</span>
                <span className="align-right">
                  {formatCurrency(Number(item.amount || 0))}
                </span>
                <span style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => handleEdit(item)}
                    style={{ padding: '4px 8px', font: '0.75rem' }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    style={{ padding: '4px 8px', font: '0.75rem', color: '#b91c1c' }}
                  >
                    Delete
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
