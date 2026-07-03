import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from '@/application/useCases/useTranslation'
import { useBooks } from '@/application/useCases/library/useBooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Book } from '@/domain/entities/Book'
import { 
  Plus, 
  Search, 
  BookOpen, 
  Sparkles, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Trash2,
  Bookmark
} from 'lucide-react'

// Zod Schema
const bookSchema = z.object({
  titre: z.string().min(1, 'Title is required'),
  auteur: z.string().min(1, 'Author is required'),
  isbn: z.string().min(10, 'ISBN must be 10 or 13 characters').max(13, 'ISBN must be 10 or 13 characters'),
  genre: z.string().optional().or(z.literal('')),
  quantite_stock: z.coerce.number().int().min(1, 'Stock must be at least 1')
})


export const BookCatalog: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  // Read URL query params
  const q = searchParams.get('q') || ''
  const genre = searchParams.get('genre') || ''
  const disponible = searchParams.get('disponible') === 'true'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const per_page = 9 // 9 books per page

  // Hooks
  const { 
    books, 
    meta, 
    loading, 
    createBook, 
    updateBook, 
    deleteBook 
  } = useBooks({ 
    q, 
    genre, 
    disponible, 
    page, 
    per_page 
  })

  // Local UI state
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null)

  // React Hook Form
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm<any>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      titre: '',
      auteur: '',
      isbn: '',
      genre: '',
      quantite_stock: 1
    }
  })

  // Trigger Toast Helper
  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text })
    setTimeout(() => setToastMsg(null), 4000)
  }

  // Update URL params helper
  const updateParams = (updates: Record<string, string | boolean | null>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '' || val === false) {
        newParams.delete(key)
      } else {
        newParams.set(key, String(val))
      }
    })
    // Reset to page 1 on filter changes
    if (!updates.hasOwnProperty('page')) {
      newParams.delete('page')
    }
    setSearchParams(newParams)
  }

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateParams({ q: e.target.value })
  }

  // Handle Add Book Button Click
  const handleAddClick = () => {
    setEditingBook(null)
    reset({
      titre: '',
      auteur: '',
      isbn: '',
      genre: '',
      quantite_stock: 1
    })
    setIsSheetOpen(true)
  }

  // Handle Edit Book Button Click
  const handleEditClick = (book: Book) => {
    setEditingBook(book)
    reset({
      titre: book.titre,
      auteur: book.auteur,
      isbn: book.isbn,
      genre: book.genre || '',
      quantite_stock: book.quantite_stock
    })
    setIsSheetOpen(true)
  }

  // Handle Delete Book Button Click
  const handleDeleteClick = (id: number) => {
    setDeletingBookId(id)
    setIsDeleteDialogOpen(true)
  }

  // Form Submit Action
  const onSubmit = async (values: any) => {
    try {
      if (editingBook) {
        await updateBook({ id: editingBook.id, data: values })
        triggerToast('success', t('toast_success_edit_book'))
      } else {
        await createBook(values)
        triggerToast('success', t('toast_success_add_book'))
      }
      setIsSheetOpen(false)
      reset()
    } catch (err: any) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Error saving book.'
      triggerToast('error', errorMsg)
    }
  }

  // Confirm delete book action
  const confirmDelete = async () => {
    if (!deletingBookId) return
    try {
      await deleteBook(deletingBookId)
      triggerToast('success', t('toast_success_delete_book'))
      setIsDeleteDialogOpen(false)
    } catch (err: any) {
      console.error(err)
      triggerToast('error', 'Cannot delete this book. It may be associated with an active loan.')
    }
  }

  // Helper for generating cover gradients based on book ID or Title
  const getGradientClass = (id: number) => {
    const colors = [
      'from-rose-450 to-pink-500 bg-gradient-to-tr',
      'from-teal-400 to-emerald-500 bg-gradient-to-tr',
      'from-blue-500 to-indigo-600 bg-gradient-to-tr',
      'from-purple-500 to-violet-600 bg-gradient-to-tr',
      'from-amber-400 to-orange-500 bg-gradient-to-tr',
    ]
    return colors[id % colors.length]
  }

  const listGenres = ['Romance', 'Science-Fiction', 'Fantastique', 'Thriller', 'Historique', 'Biographie', 'Poésie', 'Théâtre', 'Philosophie', 'Développement personnel']

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-5 right-5 z-[100] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border animate-bounce ${
          toastMsg.type === 'success' ? 'bg-black text-white border-neutral-850' : 'bg-red-500 text-white border-red-400'
        }`}>
          <Sparkles className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-tight">{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 hover:opacity-85">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-neo-accent" />
            {t('library_books')}
          </h1>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1">
            Browse, search and update your school document collections.
          </p>
        </div>
        <Button 
          onClick={handleAddClick}
          className="cursor-pointer bg-black text-white hover:bg-neutral-800 font-extrabold text-xs uppercase rounded-xl py-5 flex items-center gap-1.5 self-start md:self-auto border-none"
        >
          <Plus className="h-4 w-4" /> {t('add_book_title')}
        </Button>
      </div>

      {/* Filters & Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-[20px] border border-neutral-100 shadow-sm">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search by title, author, ISBN..."
            className="pl-9 rounded-xl bg-neutral-50 border-neutral-200 text-xs font-semibold py-4 focus-visible:ring-1 focus-visible:ring-black"
            value={q}
            onChange={handleSearchChange}
          />
        </div>

        {/* Genre filter */}
        <div className="col-span-1">
          <select
            className="w-full rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold p-2.5 h-10 focus:outline-none focus:ring-1 focus:ring-black"
            value={genre}
            onChange={(e) => updateParams({ genre: e.target.value })}
          >
            <option value="">{t('genre_all')}</option>
            {listGenres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Availability Toggle */}
        <div className="col-span-1 flex items-center justify-between px-2 bg-neutral-50 rounded-xl border border-neutral-200 h-10">
          <Label htmlFor="disponible-toggle" className="text-xs font-bold text-neutral-600 uppercase cursor-pointer">
            {t('disponible_only')}
          </Label>
          <Switch
            id="disponible-toggle"
            checked={disponible}
            onCheckedChange={(checked) => updateParams({ disponible: checked ? 'true' : null })}
          />
        </div>

      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-neutral-100 rounded-[24px] overflow-hidden p-4 space-y-4">
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="h-5 w-2/3 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <Skeleton className="h-4 w-1/4 rounded-lg" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 text-xs text-neutral-450 font-bold uppercase border-2 border-dashed border-neutral-100 rounded-3xl bg-white">
          No books match your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book: Book) => {
            const isAvail = book.disponible
            return (
              <div 
                key={book.id} 
                className="bg-white border border-neutral-100 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group relative p-4 flex flex-col justify-between h-[340px]"
              >
                
                {/* Book Card Actions Overlay (Visible on Hover) */}
                <div className="absolute top-6 right-6 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    onClick={() => handleEditClick(book)}
                    className="cursor-pointer w-8 h-8 rounded-lg bg-black text-white hover:bg-neutral-800 p-0 flex items-center justify-center border-none shadow-sm"
                    title={t('edit_book_title')}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(book.id)}
                    className="cursor-pointer w-8 h-8 rounded-lg bg-red-600 text-white hover:bg-red-750 p-0 flex items-center justify-center border-none shadow-sm"
                    title={t('delete_book_title')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Card Top: Visual Cover & Details */}
                <div className="space-y-4">
                  {/* Book Cover Placeholder */}
                  <div className={`h-36 rounded-2xl flex flex-col justify-between p-4 text-white relative shadow-inner overflow-hidden ${getGradientClass(book.id)}`}>
                    <Bookmark className="h-5 w-5 shrink-0 opacity-80" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full">
                        {book.genre || 'Littérature'}
                      </span>
                      <h4 className="text-xs font-black truncate max-w-full uppercase tracking-wider mt-1">{book.titre}</h4>
                    </div>
                  </div>

                  {/* Title and Author */}
                  <div>
                    <h3 className="text-sm font-black text-neutral-900 line-clamp-1 leading-snug uppercase">
                      {book.titre}
                    </h3>
                    <p className="text-[10px] text-neutral-450 font-bold uppercase mt-0.5">
                      By {book.auteur}
                    </p>
                  </div>
                </div>

                {/* Card Bottom: Metadata */}
                <div className="pt-3 border-t border-neutral-50 flex items-center justify-between">
                  <div className="text-[10px] text-neutral-400 font-extrabold uppercase">
                    ISBN: <span className="text-neutral-700 font-black">{book.isbn}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-450 font-bold">
                      {book.quantite_stock} copies
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isAvail ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {isAvail ? t('disponible_label') : t('epuise_label')}
                    </span>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            className="cursor-pointer bg-white text-black hover:bg-neutral-55 border border-neutral-200 w-8 h-8 rounded-lg p-0 flex items-center justify-center"
            disabled={page === 1}
            onClick={() => updateParams({ page: String(page - 1) })}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: meta.last_page }, (_, idx) => idx + 1).map((p) => (
            <Button
              key={p}
              className={`cursor-pointer w-8 h-8 rounded-lg text-xs font-bold p-0 ${
                page === p
                  ? 'bg-black text-white'
                  : 'bg-white text-neutral-800 hover:bg-neutral-50 border border-neutral-200'
              }`}
              onClick={() => updateParams({ page: String(p) })}
            >
              {p}
            </Button>
          ))}

          <Button
            className="cursor-pointer bg-white text-black hover:bg-neutral-55 border border-neutral-200 w-8 h-8 rounded-lg p-0 flex items-center justify-center"
            disabled={page === meta.last_page}
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Add / Edit Sheet Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-white text-neutral-900 border-l border-neutral-200 sm:max-w-md">
          <SheetHeader className="pb-6 border-b border-neutral-100">
            <SheetTitle className="text-base font-black uppercase tracking-wide">
              {editingBook ? t('edit_book_title') : t('add_book_title')}
            </SheetTitle>
            <SheetDescription className="text-xs text-neutral-400">
              {editingBook ? t('edit_book_desc') : t('add_book_desc')}
            </SheetDescription>
          </SheetHeader>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-6">
            
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="titre-input" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                {t('title_label')}
              </Label>
              <Input
                id="titre-input"
                className="rounded-xl border-neutral-250 text-xs font-semibold py-4"
                placeholder="Ex. The Little Prince"
                {...register('titre')}
              />
              {errors.titre && (
                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.titre.message as string}</p>
              )}
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <Label htmlFor="auteur-input" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                {t('author_label')}
              </Label>
              <Input
                id="auteur-input"
                className="rounded-xl border-neutral-250 text-xs font-semibold py-4"
                placeholder="Ex. Antoine de Saint-Exupery"
                {...register('auteur')}
              />
              {errors.auteur && (
                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.auteur.message as string}</p>
              )}
            </div>

            {/* ISBN */}
            <div className="space-y-1.5">
              <Label htmlFor="isbn-input" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                {t('isbn_label')}
              </Label>
              <Input
                id="isbn-input"
                className="rounded-xl border-neutral-250 text-xs font-semibold py-4"
                placeholder="Ex. 9782070612758"
                {...register('isbn')}
              />
              {errors.isbn && (
                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.isbn.message as string}</p>
              )}
            </div>

            {/* Genre */}
            <div className="space-y-1.5">
              <Label htmlFor="genre-select" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                {t('genre_label')}
              </Label>
              <select
                id="genre-select"
                className="w-full rounded-xl bg-white border border-neutral-250 text-xs font-semibold p-2.5 h-10 focus:outline-none focus:ring-1 focus:ring-black"
                {...register('genre')}
              >
                <option value="">Select a genre</option>
                {listGenres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Stock Quantity */}
            <div className="space-y-1.5">
              <Label htmlFor="stock-input" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                {t('stock_label')}
              </Label>
              <Input
                id="stock-input"
                type="number"
                className="rounded-xl border-neutral-250 text-xs font-semibold py-4"
                placeholder="1"
                {...register('quantite_stock')}
              />
              {errors.quantite_stock && (
                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.quantite_stock.message as string}</p>
              )}
            </div>

            <SheetFooter className="pt-6 border-t border-neutral-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer border border-neutral-200 rounded-xl text-xs font-bold uppercase py-4"
                onClick={() => setIsSheetOpen(false)}
              >
                {t('cancel_btn')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-bold uppercase py-4 border-none"
              >
                {isSubmitting ? 'Saving...' : t('save_btn')}
              </Button>
            </SheetFooter>

          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white text-neutral-900 rounded-[24px] border border-neutral-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wide">
              {t('delete_book_title')}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-450 font-semibold mt-2">
              {t('delete_book_desc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              className="cursor-pointer border border-neutral-200 rounded-xl text-xs font-bold uppercase"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t('cancel_btn')}
            </Button>
            <Button
              className="cursor-pointer bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-bold uppercase border-none"
              onClick={confirmDelete}
            >
              {t('delete_btn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default BookCatalog;
