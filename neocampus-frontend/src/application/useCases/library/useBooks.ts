import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { libraryApiService } from '@/infrastructure/api/libraryApiService'
import { Book } from '@/domain/entities/Book'

export const useBooks = (filters: { 
  q?: string; 
  genre?: string; 
  disponible?: boolean; 
  per_page?: number; 
  page?: number; 
} = {}) => {
  const queryClient = useQueryClient();

  const booksQuery = useQuery({
    queryKey: ['books', filters],
    queryFn: () => libraryApiService.getBooks(filters),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: (bookData: Omit<Book, 'id' | 'disponible'>) => 
      libraryApiService.createBook(bookData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Book> }) => 
      libraryApiService.updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => libraryApiService.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
    }
  });

  return {
    books: booksQuery.data?.data ?? [],
    meta: booksQuery.data?.meta ?? { current_page: 1, last_page: 1, total: 0 },
    loading: booksQuery.isLoading,
    isFetching: booksQuery.isFetching,
    error: booksQuery.error,
    refetch: booksQuery.refetch,
    createBook: createMutation.mutateAsync,
    creating: createMutation.isPending,
    updateBook: updateMutation.mutateAsync,
    updating: updateMutation.isPending,
    deleteBook: deleteMutation.mutateAsync,
    deleting: deleteMutation.isPending,
  };
};

export default useBooks;
