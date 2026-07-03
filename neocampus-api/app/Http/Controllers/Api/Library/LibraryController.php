<?php

namespace App\Http\Controllers\Api\Library;

use App\Http\Controllers\Controller;
use App\Http\Requests\Library\CreateBookRequest;
use App\Http\Requests\Library\UpdateBookRequest;
use App\Http\Requests\Library\CreateLoanRequest;
use App\Http\Requests\Library\ReturnLoanRequest;
use App\Http\Resources\Library\BookResource;
use App\Http\Resources\Library\LoanResource;
use App\Http\Resources\Library\OverdueLoanResource;
use App\Application\DTOs\CreateBookDTO;
use App\Application\DTOs\UpdateBookDTO;
use App\Application\DTOs\CreateLoanDTO;
use App\Application\DTOs\ReturnLoanDTO;
use App\Application\UseCases\Library\ListBooksUseCase;
use App\Application\UseCases\Library\CreateBookUseCase;
use App\Application\UseCases\Library\UpdateBookUseCase;
use App\Application\UseCases\Library\DeleteBookUseCase;
use App\Application\UseCases\Library\CreateLoanUseCase;
use App\Application\UseCases\Library\ReturnLoanUseCase;
use App\Application\UseCases\Library\ListOverdueLoansUseCase;
use App\Models\Livre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Tag(
 *     name="Library Management",
 *     description="Endpoints for school library catalog, settings, loans, and metrics"
 * )
 */
class LibraryController extends Controller
{
    private ListBooksUseCase $listBooksUseCase;
    private CreateBookUseCase $createBookUseCase;
    private UpdateBookUseCase $updateBookUseCase;
    private DeleteBookUseCase $deleteBookUseCase;
    private CreateLoanUseCase $createLoanUseCase;
    private ReturnLoanUseCase $returnLoanUseCase;
    private ListOverdueLoansUseCase $listOverdueLoansUseCase;

    public function __construct(
        ListBooksUseCase $listBooksUseCase,
        CreateBookUseCase $createBookUseCase,
        UpdateBookUseCase $updateBookUseCase,
        DeleteBookUseCase $deleteBookUseCase,
        CreateLoanUseCase $createLoanUseCase,
        ReturnLoanUseCase $returnLoanUseCase,
        ListOverdueLoansUseCase $listOverdueLoansUseCase
    ) {
        $this->listBooksUseCase = $listBooksUseCase;
        $this->createBookUseCase = $createBookUseCase;
        $this->updateBookUseCase = $updateBookUseCase;
        $this->deleteBookUseCase = $deleteBookUseCase;
        $this->createLoanUseCase = $createLoanUseCase;
        $this->returnLoanUseCase = $returnLoanUseCase;
        $this->listOverdueLoansUseCase = $listOverdueLoansUseCase;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/library/books",
     *     summary="List and search books in the library catalog",
     *     tags={"Library Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="q", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="genre", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="disponible", in="query", required=false, @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Book")),
     *             @OA\Property(property="links", type="object"),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Livre::class);

        $perPage = min($request->integer('per_page', 15), 100);
        $filters = $request->only(['q', 'genre', 'disponible']);

        $books = $this->listBooksUseCase->execute($perPage, $filters);

        return BookResource::collection($books)->response();
    }

    /**
     * @OA\Post(
     *     path="/api/v1/library/books",
     *     summary="Add a new book to the catalog",
     *     tags={"Library Management"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"titre","auteur","isbn"},
     *             @OA\Property(property="titre", type="string"),
     *             @OA\Property(property="auteur", type="string"),
     *             @OA\Property(property="isbn", type="string"),
     *             @OA\Property(property="genre", type="string", nullable=true),
     *             @OA\Property(property="quantite_stock", type="integer", default=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Created",
     *         @OA\JsonContent(ref="#/components/schemas/Book")
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(CreateBookRequest $request): JsonResponse
    {
        Gate::authorize('create', Livre::class);

        $dto = CreateBookDTO::fromArray($request->validated());
        $tenantId = $request->user()->etablissement_id;

        $book = $this->createBookUseCase->execute($dto, $tenantId);

        return (new BookResource($book))->response()->setStatusCode(201);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/library/books/{id}",
     *     summary="Update an existing book details",
     *     tags={"Library Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="titre", type="string"),
     *             @OA\Property(property="auteur", type="string"),
     *             @OA\Property(property="isbn", type="string"),
     *             @OA\Property(property="genre", type="string", nullable=true),
     *             @OA\Property(property="quantite_stock", type="integer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Updated",
     *         @OA\JsonContent(ref="#/components/schemas/Book")
     *     ),
     *     @OA\Response(response=404, description="Book not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(UpdateBookRequest $request, int $id): JsonResponse
    {
        Gate::authorize('update', Livre::class);

        // Explicit check for tenant ownership before use case to protect endpoint
        $book = Livre::findOrFail($id); // Will trigger 404 naturally since global scope runs

        $dto = UpdateBookDTO::fromArray($request->validated());
        $updatedBook = $this->updateBookUseCase->execute($id, $dto);

        return (new BookResource($updatedBook))->response();
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/library/books/{id}",
     *     summary="Soft delete a book from the catalog",
     *     tags={"Library Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Deleted",
     *         @OA\JsonContent(@OA\Property(property="message", type="string"))
     *     ),
     *     @OA\Response(response=404, description="Book not found")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        Gate::authorize('delete', Livre::class);

        $book = Livre::findOrFail($id); // Triggers 404 inside tenant scope

        $deleted = $this->deleteBookUseCase->execute($id);

        return response()->json([
            'message' => 'Livre supprimé avec succès.'
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/library/loans",
     *     summary="Record a new book loan to a member",
     *     tags={"Library Management"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"livre_id","adherent_id"},
     *             @OA\Property(property="livre_id", type="integer"),
     *             @OA\Property(property="adherent_id", type="integer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Loan Created",
     *         @OA\JsonContent(ref="#/components/schemas/Loan")
     *     ),
     *     @OA\Response(response=422, description="Validation error or stock limit exceeded")
     * )
     */
    public function storeLoan(CreateLoanRequest $request): JsonResponse
    {
        Gate::authorize('create', Livre::class);

        $dto = CreateLoanDTO::fromArray($request->validated());
        $tenantId = $request->user()->etablissement_id;

        $loan = $this->createLoanUseCase->execute($dto, $tenantId);

        return (new LoanResource($loan))->response()->setStatusCode(201);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/library/loans/{id}/return",
     *     summary="Process book return, incrementing stock and updating status",
     *     tags={"Library Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Returned successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Loan")
     *     ),
     *     @OA\Response(response=404, description="Loan not found or does not belong to tenant")
     * )
     */
    public function returnBook(ReturnLoanRequest $request, int $id): JsonResponse
    {
        Gate::authorize('update', Livre::class);

        $dto = ReturnLoanDTO::fromArray($request->validated());
        $tenantId = $request->user()->etablissement_id;

        $loan = $this->returnLoanUseCase->execute($dto, $tenantId);

        return (new LoanResource($loan))->response();
    }

    /**
     * @OA\Get(
     *     path="/api/v1/library/overdue",
     *     summary="List all overdue loans",
     *     tags={"Library Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Loan")),
     *             @OA\Property(property="links", type="object"),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
    public function overdue(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Livre::class);

        $perPage = min($request->integer('per_page', 15), 100);
        $tenantId = $request->user()->etablissement_id;

        $loans = $this->listOverdueLoansUseCase->execute($perPage, $tenantId);

        return OverdueLoanResource::collection($loans)->response();
    }

    /**
     * @OA\Get(
     *     path="/api/v1/library/stats",
     *     summary="Get library dashboard stats (total books, active loans, overdue loans)",
     *     tags={"Library Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="total_books", type="integer"),
     *             @OA\Property(property="active_loans", type="integer"),
     *             @OA\Property(property="overdue_loans", type="integer")
     *         )
     *     )
     * )
     */
    public function stats(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Livre::class);

        $tenantId = $request->user()->etablissement_id;

        // Single optimized query using subqueries for aggregates. Yields 0 loops and 1 DB query!
        $stats = DB::selectOne("
            SELECT 
              (SELECT COALESCE(SUM(quantite_stock), 0) FROM livres WHERE etablissement_id = ? AND deleted_at IS NULL) as total_books,
              (SELECT COUNT(*) FROM emprunts WHERE etablissement_id = ? AND statut IN ('en_cours', 'en_retard') AND date_retour_effective IS NULL AND deleted_at IS NULL) as active_loans,
              (SELECT COUNT(*) FROM emprunts WHERE etablissement_id = ? AND statut = 'en_retard' AND deleted_at IS NULL) as overdue_loans
        ", [$tenantId, $tenantId, $tenantId]);

        return response()->json([
            'total_books' => (int) ($stats->total_books ?? 0),
            'active_loans' => (int) ($stats->active_loans ?? 0),
            'overdue_loans' => (int) ($stats->overdue_loans ?? 0),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/library/loans",
     *     summary="List and search loans",
     *     tags={"Library Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="statut", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="q", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="date_debut", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="date_fin", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(type="object")
     *     )
     * )
     */
    public function loans(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Livre::class);

        $perPage = min($request->integer('per_page', 15), 100);
        $filters = $request->only(['statut', 'q', 'date_debut', 'date_fin']);

        $loanRepository = app(\App\Domain\Ports\LoanRepositoryInterface::class);
        $loans = $loanRepository->paginate($perPage, $filters);

        return LoanResource::collection($loans)->response();
    }

    /**
     * @OA\Get(
     *     path="/api/v1/library/members",
     *     summary="Search library members",
     *     tags={"Library Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="q", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(type="array", @OA\Items(type="object"))
     *     )
     * )
     */
    public function members(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Livre::class);
        $q = $request->query('q', '');
        $tenantId = $request->user()->etablissement_id;

        $members = \App\Models\Adherent::with('userModel')
            ->where('etablissement_id', $tenantId)
            ->whereHas('userModel', function ($sub) use ($q) {
                $sub->where('nom', 'like', "%{$q}%")
                    ->orWhere('prenom', 'like', "%{$q}%");
            })
            ->limit(20)
            ->get();

        return response()->json([
            'data' => $members->map(function ($m) {
                $fullName = trim(($m->userModel->prenom ?? '') . ' ' . ($m->userModel->nom ?? ''));
                return [
                    'id' => $m->id,
                    'full_name' => $fullName,
                    'type' => $m->userModel->role === 'eleve' ? 'Élève' : 'Enseignant'
                ];
            })
        ]);
    }
}
