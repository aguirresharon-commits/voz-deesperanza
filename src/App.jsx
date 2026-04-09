import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import CreateService from './pages/CreateService.jsx'
import HomePage from './pages/HomePage.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import ServicesPage from './pages/ServicesPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F5F2ED] font-sans text-[#2F4F6F] antialiased">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services/:serviceId" element={<ServiceDetail />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/create" element={<CreateService />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
