import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(document.body).toBeInTheDocument()
  })

  it('shows login screen by default', () => {
    const { container } = render(<App />)
    // Should show login screen when not logged in
    // Check for login form instead of button
    const loginForm = container.querySelector('form')
    expect(loginForm).toBeInTheDocument()
  })
})
