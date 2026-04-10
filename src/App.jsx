import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import CreateService from './pages/CreateService.jsx'
import HomePage from './pages/HomePage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import ServicesPage from './pages/ServicesPage.jsx'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F5F2ED] font-sans text-[#2F4F6F] antialiased">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services/:serviceId" element={<ServiceDetail />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/create" element={<CreateService />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
