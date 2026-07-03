import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { LoansManager } from '../../ui/pages/library/LoansManager'
import { useLoans } from '../../application/useCases/library/useLoans'
import { useOverdueLoans } from '../../application/useCases/library/useOverdueLoans'
import { useTranslation } from '../../application/useCases/useTranslation'
import { BrowserRouter } from 'react-router-dom'

// Mock hooks
jest.mock('../../application/useCases/library/useLoans')
jest.mock('../../application/useCases/library/useOverdueLoans')
jest.mock('../../application/useCases/useTranslation')

const mockUseLoans = useLoans as jest.Mock
const mockUseOverdueLoans = useOverdueLoans as jest.Mock
const mockUseTranslation = useTranslation as jest.Mock

describe('LoansManager Component', () => {
  const mockLoans = [
    {
      id: 1,
      book: {
        id: 1,
        titre: 'Le Petit Prince',
        auteur: 'Antoine de Saint-Exupéry',
        isbn: '9782070612758',
        genre: 'Conte',
        quantite_stock: 3,
        disponible: true,
      },
      adherent: {
        id: 10,
        full_name: 'Othman Sahraoui',
        type: 'Élève',
      },
      date_emprunt: '2026-06-20',
      date_retour_prevue: '2026-07-04',
      date_retour_effective: null,
      statut: 'en_cours',
    }
  ]

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: (key: string) => key,
    })

    mockUseLoans.mockReturnValue({
      loans: mockLoans,
      meta: { current_page: 1, last_page: 1, total: 1 },
      loading: false,
      createLoan: jest.fn(),
      returnLoan: jest.fn(),
      returning: false,
      searchMembers: jest.fn(),
    })

    mockUseOverdueLoans.mockReturnValue({
      loans: [],
      meta: { current_page: 1, last_page: 1, total: 0 },
      loading: false,
    })
  })

  it('renders loans with member info, book title, and status badge', () => {
    render(
      <BrowserRouter>
        <LoansManager />
      </BrowserRouter>
    )

    // Assert borrower name and type
    expect(screen.getByText('Othman Sahraoui')).toBeInTheDocument()
    expect(screen.getByText('Élève')).toBeInTheDocument()

    // Assert book title
    expect(screen.getByText('Le Petit Prince')).toBeInTheDocument()

    // Assert dates
    expect(screen.getByText('2026-06-20')).toBeInTheDocument()
    expect(screen.getByText('2026-07-04')).toBeInTheDocument()

    // Assert status badge
    expect(screen.getByText('status_en_cours')).toBeInTheDocument()
  })

  it('opens confirmation modal when clicking return button', () => {
    render(
      <BrowserRouter>
        <LoansManager />
      </BrowserRouter>
    )

    const returnBtn = screen.getByRole('button', { name: 'Rendre' })
    fireEvent.click(returnBtn)

    // Expect confirmation modal dialog text to be visible
    expect(screen.getByText('confirm_return_title')).toBeInTheDocument()
    expect(screen.getByText('confirm_return_desc')).toBeInTheDocument()
  })
})
