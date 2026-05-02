import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import ResourcesPage from './pages/ResourcesPage.jsx'
import HelplinesPage from './pages/HelplinesPage.jsx'

const pageVariants = {
  initial: { opacity: 0, y: 8, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(6px)' },
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.2, 0.9, 0.2, 1] }}
      className="min-h-[calc(100vh-72px)]"
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <main className="relative">
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-gradient-to-b from-sky-200/50 via-purple-200/35 to-transparent dark:from-sky-500/10 dark:via-purple-500/10" />
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/"
                element={
                  <AnimatedPage>
                    <LandingPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/chat"
                element={
                  <AnimatedPage>
                    <ChatPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/resources"
                element={
                  <AnimatedPage>
                    <ResourcesPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/helplines"
                element={
                  <AnimatedPage>
                    <HelplinesPage />
                  </AnimatedPage>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </BrowserRouter>
  )
}
