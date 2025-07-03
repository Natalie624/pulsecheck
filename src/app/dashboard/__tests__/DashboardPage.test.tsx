// __tests__/DashboardPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import DashboardPage from '../page'
import '@testing-library/jest-dom'

describe('DashboardPage', () => {
  it('renders all UI elements', () => {
    render(<DashboardPage />)

    expect(screen.getByPlaceholderText(/enter your prompt/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('updates prompt and tone state', () => {
    render(<DashboardPage />)

    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    const select = screen.getByRole('combobox')

    fireEvent.change(textarea, { target: { value: 'Weekly update draft' } })
    fireEvent.change(select, { target: { value: 'formal' } })

    expect(textarea).toHaveValue('Weekly update draft')
    expect(select).toHaveValue('formal')
  })

  it('logs output on click', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    render(<DashboardPage />)
    fireEvent.change(screen.getByPlaceholderText(/enter your prompt/i), {
      target: { value: 'My update' },
    })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))

    expect(logSpy).toHaveBeenCalledWith('Prompt:', 'My update')
    logSpy.mockRestore()
  })
})
