import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BookCatalog } from '../../ui/pages/library/BookCatalog'
import { useBooks } from '../../application/useCases/library/useBooks'
import { useTranslation } from '../../application/useCases/useTranslation'
import { BrowserRouter } from 'react-router-dom'

// Mock hooks
jest.mock('../../application/useCases/library/useBooks')
jest.mock('../../application/useCases/useTranslation')

const mockUseBooks = useBooks as jest.Mock
const mockUseTranslation = useTranslation as jest.Mock

describe('BookCatalog Component', () => {
  const mockBooks = [
    {
      id: 1,
      titre: 'Le Petit Prince',
      auteur: 'Antoine de Saint-Exupéry',
      isbn: '9782070612758',
      genre: 'Conte',
      quantite_stock: 3,
      disponible: true,
    },
    {
      id: 2,
      titre: 'L\'Étranger',
      auteur: 'Albert Camus',
      isbn: '9782070360024',
      genre: 'Roman',
      quantite_stock: 0,
      disponible: false,
    }
  ]

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: (key: string) => key,
    })

    mockUseBooks.mockReturnValue({
      books: mockBooks,
      meta: { current_page: 1, last_page: 1, total: 2 },
      loading: false,
      createBook: jest.fn(),
      updateBook: jest.fn(),
      deleteBook: jest.fn(),
    })
  })

  it('renders books catalog list with covers, titles, and details', () => {
    render(
      <BrowserRouter>
        <BookCatalog />
      </BrowserRouter>
    )

    // Assert titles and authors are rendered
    expect(screen.getByText('Le Petit Prince')).toBeInTheDocument()
    expect(screen.getByText('Par Antoine de Saint-Exupéry')).toBeInTheDocument()
    expect(screen.getByText('L\'Étranger')).toBeInTheDocument()
    expect(screen.getByText('Par Albert Camus')).toBeInTheDocument()

    // Assert status badges
    expect(screen.getByText('disponible_label')).toBeInTheDocument()
    expect(screen.getByText('epuise_label')).toBeInTheDocument()
  })

  it('calls search update on query input change', () => {
    render(
      <BrowserRouter>
        <BookCatalog />
      </BrowserRouter>
    )

    const searchInput = screen.getByPlaceholderText('Rechercher par titre, auteur, isbn...')
    fireEvent.change(searchInput, { target: { value: 'Camus' } })

    // Input holds value and updates URL search params via react-router
    expect(searchInput).toHaveValue('Camus')
  })
})
