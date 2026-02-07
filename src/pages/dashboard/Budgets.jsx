import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../../api/budgets.js'
import { useAuth } from '../../context/AuthContext.jsx'

const budgetCategories = ['marketing', 'operations', 'utilities', 'inventory', 'staff', 'transport', 'contingency']

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

export default function Budgets() {
  const { token } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    category: 'marketing',
    limit: '',
    period: 'monthly',
  })

  const loadBudgets = async () => {
    if (!token) {
      setBudgets([])
      return
    }
    setStatus('loading')
    setMessage('')
    try {
      const data = await getBudgets()
      const list = Array.isArray(data) ? data : data?.data || []
      setBudgets(list)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Unable to load budgets.')
    }
  }

  useEffect(() => {
    loadBudgets()
  }, [token])

  const totalBudget = useMemo(
    () =>
      budgets.reduce((total, item) => total + Number(item.limit || 0), 0),
    [budgets],
  )

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleReset = () => {
    setForm({
      category: 'marketing',
      limit: '',
      period: 'monthly',
    })
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!token) {
      setMessage('Add your token on the login page before creating budgets.')
      setStatus('error')
      return
    }
    if (!form.limit || Number(form.limit) <= 0) {
      setMessage('Enter a budget limit greater than zero.')
      setStatus('error')
      return
    }
    setIsSubmitting(true)
    setStatus('loading')
    setMessage('')
    try {
      const payload = {
        category: form.category,
        limit: String(form.limit),
        period: form.period,
      }
      
      if (editingId) {
        await updateBudget(editingId, payload)
      } else {
        await createBudget(payload)
      }
      
      handleReset()
      await loadBudgets()
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Unable to save budget.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (budget) => {
    setForm({
      category: budget.category,
      limit: budget.limit,
      period: budget.period,
    })
    setEditingId(budget.id)
  }

  const handleDelete = async (id) => {
    if (!token || !window.confirm('Delete this budget?')) return
    try {
      await deleteBudget(id)
      await loadBudgets()
    } catch (error) {
      setMessage(error.message || 'Unable to delete budget.')
      setStatus('error')
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Budgets"
        subtitle="Allocate cash targets and monitor variance by team."
        actions={
          <button className="btn primary" type="button" onClick={loadBudgets}>
            Refresh
          </button>
        }
      />

      <section className="grid-two">
        <div className="panel">
          <div className="panel-header">
            <h3>New budget</h3>
            <span className="label">Create</span>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              Category
              <select
                value={form.category}
                onChange={handleChange('category')}
              >
                {budgetCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Period
              <select
                value={form.period}
                onChange={handleChange('period')}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </label>
            <label className="field full">
              Budget limit
              <input
                type="number"
                inputMode="decimal"
                value={form.limit}
                onChange={handleChange('limit')}
                placeholder="500000"
              />
            </label>
            <div className="field full">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingId ? 'Update budget' : 'Create budget'}
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
            <h3>Budget summary</h3>
            <span className="label">Total allocation</span>
          </div>
          <div className="summary-grid">
            <div>
              <span className="label">Allocated</span>
              <p className="stat-value">{formatCurrency(totalBudget)}</p>
            </div>
            <div>
              <span className="label">Budgets</span>
              <p className="stat-value">{budgets.length}</p>
            </div>
          </div>
          {status === 'loading' ? (
            <p className="muted">Loading budgets...</p>
          ) : null}
          {status === 'error' && message ? (
            <p className="form-error">{message}</p>
          ) : null}
          {!token ? (
            <p className="muted">
              Add your bearer token to manage budgets.
            </p>
          ) : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Budget tracker</h3>
          <span className="label">All budgets</span>
        </div>
        {budgets.length === 0 ? (
          <EmptyState
            title="No budgets created"
            description="Start a new budget to track spend against targets."
            action={<span className="badge accent">Ready to create</span>}
          />
        ) : (
          <div className="table">
            <div className="table-row table-head">
              <span>Category</span>
              <span>Period</span>
              <span className="align-right">Limit</span>
              <span>Actions</span>
            </div>
            {budgets.map((budget, index) => (
              <div key={budget.id || index} className="table-row">
                <span className="badge neutral">{budget.category}</span>
                <span>{budget.period}</span>
                <span className="align-right">
                  {formatCurrency(Number(budget.limit || 0))}
                </span>
                <span style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => handleEdit(budget)}
                    style={{ padding: '4px 8px', font: '0.75rem' }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => handleDelete(budget.id)}
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
