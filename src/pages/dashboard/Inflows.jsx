import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { createInflow, getInflows } from '../../api/inflows.js'
import { useAuth } from '../../context/AuthContext.jsx'

const paymentChannels = ['transfer', 'cash', 'pos', 'card']

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

export default function Inflows() {
  const { token } = useAuth()
  const [inflows, setInflows] = useState([])
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    amount: '',
    date: todayInput(),
    paymentchannel: 'transfer',
    note: '',
  })

  const loadInflows = async () => {
    if (!token) {
      setInflows([])
      return
    }
    setStatus('loading')
    setMessage('')
    try {
      const data = await getInflows()
      const list = Array.isArray(data) ? data : data?.data || []
      setInflows(list)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Unable to load inflows.')
    }
  }

  useEffect(() => {
    loadInflows()
  }, [token])

  const totalAmount = useMemo(
    () =>
      inflows.reduce((total, item) => total + Number(item.amount || 0), 0),
    [inflows],
  )

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!token) {
      setMessage('Add your token on the login page before posting inflows.')
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
      await createInflow({
        amount: String(form.amount),
        date: toApiDate(form.date),
        paymentchannel: form.paymentchannel,
        note: form.note,
      })
      setForm((current) => ({ ...current, amount: '', note: '' }))
      await loadInflows()
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Unable to create inflow.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Inflows"
        subtitle="Log every incoming payment and keep the cash journal precise."
        actions={
          <button className="btn primary" type="button" onClick={loadInflows}>
            Refresh
          </button>
        }
      />

      <section className="grid-two">
        <div className="panel">
          <div className="panel-header">
            <h3>New inflow</h3>
            <span className="label">POST /inflows</span>
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
              Payment channel
              <select
                value={form.paymentchannel}
                onChange={handleChange('paymentchannel')}
              >
                {paymentChannels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
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
                placeholder="Describe the inflow"
              />
            </label>
            <div className="field full">
              <button className="btn primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Create inflow'}
              </button>
              {status === 'error' ? (
                <p className="form-error">{message}</p>
              ) : null}
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Inflow summary</h3>
            <span className="label">GET /inflows</span>
          </div>
          <div className="summary-grid">
            <div>
              <span className="label">Total inflows</span>
              <p className="stat-value">{formatCurrency(totalAmount)}</p>
            </div>
            <div>
              <span className="label">Entries</span>
              <p className="stat-value">{inflows.length}</p>
            </div>
          </div>
          {status === 'loading' ? (
            <p className="muted">Loading inflows...</p>
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
          <h3>Recorded inflows</h3>
          <span className="label">Latest entries</span>
        </div>
        {inflows.length === 0 ? (
          <EmptyState
            title="No inflows yet"
            description="Start with your first payment to populate the ledger."
            action={<span className="badge accent">Ready to log</span>}
          />
        ) : (
          <div className="table">
            <div className="table-row table-head">
              <span>Date</span>
              <span>Channel</span>
              <span>Note</span>
              <span className="align-right">Amount</span>
            </div>
            {inflows.map((item, index) => (
              <div key={item.id || index} className="table-row">
                <span>{formatDisplayDate(item.date)}</span>
                <span className="badge neutral">{item.paymentchannel || '-'}</span>
                <span>{item.note || '-'}</span>
                <span className="align-right">
                  {formatCurrency(Number(item.amount || 0))}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
