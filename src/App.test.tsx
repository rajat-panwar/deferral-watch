import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AppRoutes } from './App'
import { makeQueryClient } from './queryClient'
import * as api from './api/client'
import { resetApi } from './api/client'

function setup(path = '/') {
  return render(
    <QueryClientProvider client={makeQueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => resetApi())
afterEach(() => vi.restoreAllMocks())

describe('dashboard', () => {
  it('shows loading, then the table', async () => {
    setup()
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i)
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })

  it('has no obvious a11y violations', async () => {
    const { container } = setup()
    await screen.findByRole('table')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('search narrows results and empty state can be cleared', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByRole('table')
    await user.type(screen.getByLabelText('Search'), 'zzzz-no-match')
    expect(await screen.findByText('No defects match your filters')).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[0])
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })

  it('clicking a chart bar filters the table', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByRole('table')
    const bar = screen.getByRole('button', { name: /^Expired: \d+/ })
    await user.click(bar)
    expect(bar).toHaveAttribute('aria-pressed', 'true')
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    rows.forEach((r) => expect(r).toHaveTextContent(/Expired/))
  })

  it('shows an error and recovers on retry', async () => {
    resetApi({ fail: true })
    const user = userEvent.setup()
    setup()
    expect(await screen.findByRole('alert')).toHaveTextContent(/unreachable/i)
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })
})

describe('detail + actions', () => {
  it('assigns an engineer and updates status/timeline', async () => {
    const user = userEvent.setup()
    setup('/defects/DEF-1001')
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Assign engineer' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(await screen.findByText(/Assigned to A\. Okafor/)).toBeInTheDocument()
    expect(screen.getByText('Assigned to', { selector: 'dt' })).toBeInTheDocument()
  })

  it('rolls back and shows an error when the action fails', async () => {
    vi.spyOn(api, 'performAction').mockRejectedValue(new api.ApiError('Could not save change'))
    const user = userEvent.setup()
    setup('/defects/DEF-1001')
    await screen.findByRole('heading', { level: 1 })
    await user.click(screen.getByRole('button', { name: 'Request extension' }))
    await user.type(screen.getByLabelText('Reason'), 'Part on back-order')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save change')
    await waitFor(() => expect(screen.queryByText(/Extension requested/)).not.toBeInTheDocument())
  })

  it('shows an error for an unknown defect', async () => {
    setup('/defects/NOPE')
    expect(await screen.findByRole('alert')).toHaveTextContent(/not found/i)
  })
})
