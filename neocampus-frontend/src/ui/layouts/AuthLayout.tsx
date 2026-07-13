import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export const AuthLayout: React.FC = () => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full flex items-center justify-center"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default AuthLayout
