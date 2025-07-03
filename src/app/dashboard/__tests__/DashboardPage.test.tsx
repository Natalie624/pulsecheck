// __tests__/DashboardPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

  // EDGE CASE TESTS

  //Empty prompt blocks generation
 it('shows a warning if prompt is empty', async () => {
    render(<DashboardPage />)

    fireEvent.click(screen.getByRole('button', { name: /generate/i }))

    expect(await screen.findByText(/please enter a prompt/i)).toBeInTheDocument()
  })

  // Tone selector has a default
  it('has a default tone selected', () => {
    render(<DashboardPage />)

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('friendly')
  })

  // Prevent rapid clicks (debounce mock)
  it('prevents multiple submissions with debounce', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    render(<DashboardPage />)

    fireEvent.change(screen.getByPlaceholderText(/enter your prompt/i), {
      target: { value: 'Test rapid clicks' },
    })

    const button = screen.getByRole('button', { name: /generate/i })
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledTimes(1) // Debounce effect
    })

    logSpy.mockRestore()
  })

  // Disabled button while loading
  it('disables button while generating', async () => {
    render(<DashboardPage />)

    fireEvent.change(screen.getByPlaceholderText(/enter your prompt/i), {
      target: { value: 'Loading test' },
    })

    const button = screen.getByRole('button', { name: /generate/i })
    fireEvent.click(button)

    // Expect disabled state
    expect(button).toBeDisabled()

    // Wait for it to become enabled again (simulate LLM response time)
    await waitFor(() => expect(button).not.toBeDisabled())
  })

  // Charater limit enforced
  it('prevents input over character limit', () => {
    render(<DashboardPage />)

    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    const longText = 'a'.repeat(2000)

    fireEvent.change(textarea, { target: { value: longText } })

    // TODO: Adjust limit to match your logic, e.g. 1000
    expect(textarea).toHaveValue(longText.slice(0, 1000)) 
  })

  // Snapshot test
  it('matches snapshot', () => {
    const { container } = render(<DashboardPage />)
    expect(container).toMatchSnapshot()
  })
  
})
