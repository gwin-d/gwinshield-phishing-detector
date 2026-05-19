import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ToastContainer from './components/Toast'
import Home from './pages/Home'
import History from './pages/History'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'

function App() {
  const location = useLocation()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"             element={<Home />}       />
            <Route path="/history"      element={<History />}    />
            <Route path="/about"        element={<About />}      />
            <Route path="/how-it-works" element={<HowItWorks />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  )
}

export default App