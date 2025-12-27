import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Login } from './Login'

describe('Login', () => {
  it('renders login form', () => {
    render(<Login onLogin={vi.fn()} />)

    // Check for form elements using the exact placeholder text
    const codeInput = screen.getByPlaceholderText(/Nhập mã số/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/)
    const submitButton = screen.getByRole('button', { name: /Đăng nhập/i })

    expect(codeInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()
  })

  it('calls onLogin when form submitted with valid credentials', async () => {
    const mockOnLogin = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(<Login onLogin={mockOnLogin} />)

    const codeInput = screen.getByPlaceholderText(/Nhập mã số/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/)
    const submitButton = screen.getByRole('button', { name: /Đăng nhập/i })

    await user.type(codeInput, '001')
    await user.type(passwordInput, '123')
    await user.click(submitButton)

    // Wait for the simulated network delay (800ms) + a bit extra
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('001', '123')
    }, { timeout: 2000 })
  })

  it('shows loading state during login', async () => {
    const mockOnLogin = vi.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 500))
    )
    const user = userEvent.setup()

    render(<Login onLogin={mockOnLogin} />)

    const codeInput = screen.getByPlaceholderText(/Nhập mã số/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/)
    const submitButton = screen.getByRole('button', { name: /Đăng nhập/i })

    await user.type(codeInput, '001')
    await user.type(passwordInput, '123')
    await user.click(submitButton)

    // Check for loading state (button should be disabled or show loading text)
    expect(submitButton).toBeDisabled()
  })
})
