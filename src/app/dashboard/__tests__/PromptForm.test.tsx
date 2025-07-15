// src/components/__tests__/PromptForm.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PromptForm from '../../components/PromptForm';
import '@testing-library/jest-dom'
import { mockFetchResponse } from './testUtils/mockFetch';

vi.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}))

describe('PromptForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders textarea, dropdowns, and button', () => {
    render(<PromptForm />)
    expect(screen.getByPlaceholderText(/enter your prompt/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /section/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /tone/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('shows an error if prompt is empty on submit', async () => {
    render(<PromptForm />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(await screen.findByText(/please enter a prompt/i)).toBeInTheDocument()
  })

  it('truncates prompt over character limit and shows error', async () => {
    render(<PromptForm />)
    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    fireEvent.change(textarea, { target: { value: 'a'.repeat(2000) } })
    expect(textarea).toHaveValue('a'.repeat(1000))
    expect(screen.getByText(/prompt exceeds/i)).toBeInTheDocument()
  })

  it('submits prompt and displays summary from API', async () => {
    const mockSummary = '✅ Key results achieved'
    mockFetchResponse({ result: { text: mockSummary } })

    render(<PromptForm />)
  fireEvent.change(screen.getByPlaceholderText(/enter your prompt/i), { 
    target: { value: 'Sprint wins' },
  })
  fireEvent.click(screen.getByRole('button', { name: /generate/i }))

  await waitFor(() => {
    expect(screen.getByText(/generated summary/i)).toBeInTheDocument()
    expect(screen.getByText(mockSummary)).toBeInTheDocument()
  })
  })

  it('shows an error if API returns an error', async () => {
    mockFetchResponse({ error: 'Bad Request' }, false)

    render(<PromptForm />)
    fireEvent.change(screen.getByPlaceholderText(/enter your prompt/i), {
      target: { value: 'Sprint update' },
    })

    fireEvent.click(screen.getByRole('button', { name: /generate/i }))

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('disables and re-enables the button while generating', async () => {
    mockFetchResponse({ result: { text: '✅ Summary' } })

    render(<PromptForm />)
    fireEvent.change(screen.getByPlaceholderText(/enter your prompt/i), {
      target: { value: 'Testing loading state' },
    })

    const button = screen.getByRole('button', { name: /generate/i })
    fireEvent.click(button)
    expect(button).toBeDisabled()

    await waitFor(() => expect(button).not.toBeDisabled())
  })

  it('matches snapshot', () => {
  const { container } = render(<PromptForm />)
  expect(container).toMatchSnapshot()
})

})
