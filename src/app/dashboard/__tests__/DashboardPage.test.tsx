// __tests__/DashboardPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DashboardPage from '../page'
import '@testing-library/jest-dom'
import { mockFetchResponse } from './testUtils/mockFetch'


describe('UI behavior', () => {
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

// LLM INTEGRATION AND API TESTS

describe('LLM API integration', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders textarea and button', () => {
    render(<DashboardPage />)
    expect(screen.getByPlaceholderText(/enter your prompt/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('shows error if prompt is empty on submit', async () => {
    render(<DashboardPage />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(await screen.findByText(/please enter a prompt/i)).toBeInTheDocument()
  })

  // TODO: FIX THIS FAILIG TEST OR REWRITE
  it('shows error if prompt exceeds character limit', async () => {
    render(<DashboardPage />)

    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    fireEvent.change(textarea, { target: { value: 'a'.repeat(2000) } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))

   await expect(screen.findByText((text) =>
    text.includes('Prompt exceeds') && text.includes('1000-character limit')
  )).resolves.toBeInTheDocument()
  })

  it('submits prompt and displays summary from API', async () => {
    const mockSummary = 'Here is your summary.'
    mockFetchResponse({ result: { text: mockSummary } })

    render(<DashboardPage />)
    fireEvent.change(screen.getByPlaceholderText(/enter your prompt/i), { 
      target: { value: 'We finished Sprint 1.' },
    })

    fireEvent.click(screen.getByRole('button', { name: /generate/i }))

    await waitFor(() => {
      expect(screen.getByText(/generated summary/i)).toBeInTheDocument()
      expect(screen.getByText(mockSummary)).toBeInTheDocument()
    })
  })

  it('shows error if API returns error', async () => {
    mockFetchResponse({ error: 'Bad Request'}, false)

    render(<DashboardPage />)
    fireEvent.change(screen.getByPlaceholderText(/enter your prompt/i), {
      target: { value: 'Bad request test' },
    })

    fireEvent.click(screen.getByRole('button', { name: /generate/i }))

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
  })
  
})
