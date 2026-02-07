import { Route, Routes } from 'react-router-dom'
import './App.css'
import RequireAuth from './components/RequireAuth.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'
import VerifyEmail from './pages/auth/VerifyEmail.jsx'
import Overview from './pages/dashboard/Overview.jsx'
import Inflows from './pages/dashboard/Inflows.jsx'
import Outflows from './pages/dashboard/Outflows.jsx'
import Wallets from './pages/dashboard/Wallets.jsx'
import Budgets from './pages/dashboard/Budgets.jsx'
import Reports from './pages/dashboard/Reports.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="inflows" element={<Inflows />} />
        <Route path="outflows" element={<Outflows />} />
        <Route path="wallets" element={<Wallets />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
