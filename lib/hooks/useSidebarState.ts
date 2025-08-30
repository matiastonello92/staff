'use client'

import { useState, useEffect } from 'react'

export function useSidebarState() {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-open')
    if (stored !== null) {
      setIsOpen(JSON.parse(stored))
    }
  }, [])

  const toggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    localStorage.setItem('sidebar-open', JSON.stringify(newState))
  }

  return {
    isOpen,
    toggle,
    setIsOpen,
  }
}
