import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { getReports, createReport, updateReport, deleteReport } from '../../api/reports.js'
import { useAuth } from '../../context/AuthContext.jsx'

const reportTypes = ['cash_flow', 'expense_breakdown', 'income_summary', 'wallet_balance', 'budget_variance']

export default function Reports() {
  const { token } = useAuth()
  const [reports, setReports] = useState([])
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    type: 'cash_flow',
    startDate: '',
    endDate: '',
  })

  const loadReports = async () => {
    if (!token) {
      setReports([])
      return
    }
    setStatus('loading')
    setMessage('')
    try {
      const data = await getReports()
      const list = Array.isArray(data) ? data : data?.data || []
      setReports(list)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Unable to load reports.')
    }
  }

  useEffect(() => {
    loadReports()
  }, [token])

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleReset = () => {
    setForm({
      title: '',
      type: 'cash_flow',
      startDate: '',
      endDate: '',
    })
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!token) {
      setMessage('Add your token on the login page before creating reports.')
      setStatus('error')
      return
    }
    if (!form.title.trim()) {
      setMessage('Enter a report title.')
      setStatus('error')
      return
    }
    setIsSubmitting(true)
    setStatus('loading')
    setMessage('')
    try {
      const payload = {
        title: form.title,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
      }
      
      if (editingId) {
        await updateReport(editingId, payload)
      } else {
        await createReport(payload)
      }
      
      handleReset()
      await loadReports()
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Unable to save report.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (report) => {
    setForm({
      title: report.title,
      type: report.type,
      startDate: report.startDate,
      endDate: report.endDate,
    })
    setEditingId(report.id)
  }

  const handleDelete = async (id) => {
    if (!token || !window.confirm('Delete this report?')) return
    try {
      await deleteReport(id)
      await loadReports()
    } catch (error) {
      setMessage(error.message || 'Unable to delete report.')
      setStatus('error')
    }
  }

  const handleExport = async (report) => {
    try {
      const data = JSON.stringify(report, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${report.title}-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setMessage('Unable to export report.')
      setStatus('error')
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Reports"
        subtitle="Export insights across inflows, outflows, and wallet balances."
        actions={
          <button className="btn primary" type="button" onClick={loadReports}>
            Refresh
          </button>
        }
      />

      <section className="grid-two">
        <div className="panel">
          <div className="panel-header">
            <h3>Generate report</h3>
            <span className="label">New report</span>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field full">
              Report title
              <input
                type="text"
                value={form.title}
                onChange={handleChange('title')}
                placeholder="e.g., January Cash Flow Summary"
              />
            </label>
            <label className="field">
              Report type
              <select
                value={form.type}
                onChange={handleChange('type')}
              >
                {reportTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Start date
              <input
                type="date"
                value={form.startDate}
                onChange={handleChange('startDate')}
              />
            </label>
            <label className="field">
              End date
              <input
                type="date"
                value={form.endDate}
                onChange={handleChange('endDate')}
              />
            </label>
            <div className="field full">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : editingId ? 'Update report' : 'Generate report'}
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
            <h3>Report status</h3>
            <span className="label">Generated</span>
          </div>
          <div className="summary-grid">
            <div>
              <span className="label">Total reports</span>
              <p className="stat-value">{reports.length}</p>
            </div>
            <div>
              <span className="label">Status</span>
              <p className="stat-value">{status === 'loading' ? 'Loading...' : 'Ready'}</p>
            </div>
          </div>
          {status === 'error' && message ? (
            <p className="form-error">{message}</p>
          ) : null}
          {!token ? (
            <p className="muted">
              Add your bearer token to generate reports.
            </p>
          ) : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Report history</h3>
          <span className="label">All generated</span>
        </div>
        {reports.length === 0 ? (
          <EmptyState
            title="No reports generated"
            description="Create your first report to export insights."
            action={<span className="badge accent">Ready to generate</span>}
          />
        ) : (
          <div className="table">
            <div className="table-row table-head">
              <span>Title</span>
              <span>Type</span>
              <span>Period</span>
              <span>Actions</span>
            </div>
            {reports.map((report, index) => (
              <div key={report.id || index} className="table-row">
                <span>{report.title}</span>
                <span className="badge neutral">{report.type.replace(/_/g, ' ')}</span>
                <span>
                  {report.startDate && report.endDate
                    ? `${report.startDate} to ${report.endDate}`
                    : '-'}
                </span>
                <span style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => handleExport(report)}
                    style={{ padding: '4px 8px', font: '0.75rem' }}
                  >
                    Export
                  </button>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => handleEdit(report)}
                    style={{ padding: '4px 8px', font: '0.75rem' }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => handleDelete(report.id)}
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
