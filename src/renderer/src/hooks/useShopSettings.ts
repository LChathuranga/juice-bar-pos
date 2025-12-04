import { useState, useEffect } from 'react'
import { ShopSettings } from '../types'

export function useShopSettings() {
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    const loadSettings = async () => {
      try {
        setLoading(true)
        const data = await window.api.getShopSettings()
        if (mounted) {
          setSettings(data)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to load shop settings:', err)
          setError(err as Error)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadSettings()

    return () => {
      mounted = false
    }
  }, [])

  return { settings, loading, error }
}
