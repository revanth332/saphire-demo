import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { LeadsView } from "./components/leads/LeadsView"
import CreateQuote from "./components/quotes/QuoteLayout"
import "./index.css"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard"
import PurchaseOrders from "./pages/PurchaseOrders"
import LeadDetail from "./pages/LeadDetail"
import Messages from "./pages/Messages"
import Notifications from "./pages/Notifications"
import Quotes from "./pages/Quotes"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import POGenerationScreen from "./components/purchaseOrder/CreatePurchaseOrder"

function App() {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<LeadsView />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="reports" element={<Reports />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="create-purchase-orders" element={<POGenerationScreen />} />
            <Route path="create-quote" element={<CreateQuote />} />
            <Route path="messages" element={<Messages />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </>
    </Router>
  )
}

export default App
