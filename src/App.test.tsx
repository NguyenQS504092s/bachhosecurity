import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(document.body).toBeInTheDocument()
  })

  it('shows loading or login screen by default', async () => {
    render(<App />)
    // App may show loading state first, then login screen
    // Check for either loading text or login form
    await waitFor(() => {
      const hasLoading = screen.queryByText(/Đang tải/i)
      const hasLoginForm = document.querySelector('form')
      expect(hasLoading || hasLoginForm).toBeTruthy()
    }, { timeout: 3000 })
  })
})
