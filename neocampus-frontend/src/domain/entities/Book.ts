export interface Book {
  id: number;
  titre: string;
  auteur: string;
  isbn: string;
  genre?: string;
  quantite_stock: number;
  disponible: boolean;
}
