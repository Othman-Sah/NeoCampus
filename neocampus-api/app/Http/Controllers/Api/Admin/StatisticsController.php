<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GetStatsRequest;
use App\Http\Resources\Admin\OverviewStatsResource;
use App\Http\Resources\Admin\AttendanceTrendResource;
use App\Http\Resources\Admin\GradeDistributionResource;
use App\Http\Resources\Admin\FinanceTrendResource;
use App\Http\Resources\Admin\UpcomingExamsResource;
use App\Http\Resources\Admin\RecentActivitiesResource;
use App\Application\UseCases\Admin\GetOverviewStatsUseCase;
use App\Application\UseCases\Admin\GetAttendanceStatsUseCase;
use App\Application\UseCases\Admin\GetGradeDistributionStatsUseCase;
use App\Application\UseCases\Admin\GetFinanceStatsUseCase;
use App\Application\UseCases\Admin\GetUpcomingExamsUseCase;
use App\Application\UseCases\Admin\GetRecentActivitiesUseCase;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

/**
 * @OA\Tag(
 *     name="Admin Statistics",
 *     description="Endpoints for retrieval of school statistics and trends for administrative dashboards"
 * )
 */
class StatisticsController extends Controller
{
    private GetOverviewStatsUseCase $overviewUseCase;
    private GetAttendanceStatsUseCase $attendanceUseCase;
    private GetGradeDistributionStatsUseCase $gradeDistributionUseCase;
    private GetFinanceStatsUseCase $financeUseCase;
    private GetUpcomingExamsUseCase $upcomingExamsUseCase;
    private GetRecentActivitiesUseCase $recentActivitiesUseCase;

    public function __construct(
        GetOverviewStatsUseCase $overviewUseCase,
        GetAttendanceStatsUseCase $attendanceUseCase,
        GetGradeDistributionStatsUseCase $gradeDistributionUseCase,
        GetFinanceStatsUseCase $financeUseCase,
        GetUpcomingExamsUseCase $upcomingExamsUseCase,
        GetRecentActivitiesUseCase $recentActivitiesUseCase
    ) {
        $this->overviewUseCase = $overviewUseCase;
        $this->attendanceUseCase = $attendanceUseCase;
        $this->gradeDistributionUseCase = $gradeDistributionUseCase;
        $this->financeUseCase = $financeUseCase;
        $this->upcomingExamsUseCase = $upcomingExamsUseCase;
        $this->recentActivitiesUseCase = $recentActivitiesUseCase;
    }

    /**
     * @OA\Get(
      *     path="/api/v1/admin/stats/overview",
      *     summary="Get general dashboard stats counts",
      *     tags={"Admin Statistics"},
      *     security={{"sanctum":{}}},
      *     @OA\Response(
      *         response=200,
      *         description="Success",
      *         @OA\JsonContent(ref="#/components/schemas/OverviewStats")
      *     )
      * )
     */
    public function overview(Request $request): OverviewStatsResource
    {
        $tenantId = Auth::user()->etablissement_id;
        $data = $this->overviewUseCase->execute($tenantId);
        return new OverviewStatsResource($data);
    }

    /**
     * @OA\Get(
      *     path="/api/v1/admin/stats/attendance",
      *     summary="Get student daily attendance trend rate",
      *     tags={"Admin Statistics"},
      *     security={{"sanctum":{}}},
      *     @OA\Parameter(name="period", in="query", required=false, @OA\Schema(type="string", enum={"week", "month"})),
      *     @OA\Response(
      *         response=200,
      *         description="Success",
      *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/AttendanceTrend"))
      *     )
      * )
     */
    public function attendance(GetStatsRequest $request): JsonResponse
    {
        $tenantId = Auth::user()->etablissement_id;
        $period = $request->query('period', 'month');
        $data = $this->attendanceUseCase->execute($tenantId, $period);
        return response()->json(['data' => AttendanceTrendResource::collection($data)]);
    }

    /**
     * @OA\Get(
      *     path="/api/v1/admin/stats/grades",
      *     summary="Get grade ranges distribution across subjects",
      *     tags={"Admin Statistics"},
      *     security={{"sanctum":{}}},
      *     @OA\Response(
      *         response=200,
      *         description="Success",
      *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/GradeDistribution"))
      *     )
      * )
     */
    public function grades(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->etablissement_id;
        $data = $this->gradeDistributionUseCase->execute($tenantId);
        return response()->json(['data' => GradeDistributionResource::collection($data)]);
    }

    /**
     * @OA\Get(
      *     path="/api/v1/admin/stats/finance",
      *     summary="Get monthly collected vs outstanding finance aggregates",
      *     tags={"Admin Statistics"},
      *     security={{"sanctum":{}}},
      *     @OA\Parameter(name="period", in="query", required=false, @OA\Schema(type="string", enum={"month"})),
      *     @OA\Response(
      *         response=200,
      *         description="Success",
      *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FinanceTrend"))
      *     )
      * )
     */
    public function finance(GetStatsRequest $request): JsonResponse
    {
        $tenantId = Auth::user()->etablissement_id;
        $period = $request->query('period', 'month');
        $data = $this->financeUseCase->execute($tenantId, $period);
        return response()->json(['data' => FinanceTrendResource::collection($data)]);
    }

    /**
     * @OA\Get(
      *     path="/api/v1/admin/stats/upcoming-exams",
      *     summary="Get upcoming scheduled exams list",
      *     tags={"Admin Statistics"},
      *     security={{"sanctum":{}}},
      *     @OA\Response(
      *         response=200,
      *         description="Success",
      *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/UpcomingExam"))
      *     )
      * )
     */
    public function upcomingExams(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->etablissement_id;
        $data = $this->upcomingExamsUseCase->execute($tenantId, 5);
        return response()->json(['data' => UpcomingExamsResource::collection($data)]);
    }

    /**
     * @OA\Get(
      *     path="/api/v1/admin/stats/recent-activities",
      *     summary="Get recent activities logs feed",
      *     tags={"Admin Statistics"},
      *     security={{"sanctum":{}}},
      *     @OA\Response(
      *         response=200,
      *         description="Success",
      *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/RecentActivity"))
      *     )
      * )
     */
    public function recentActivities(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->etablissement_id;
        $data = $this->recentActivitiesUseCase->execute($tenantId, 10);
        return response()->json(['data' => RecentActivitiesResource::collection($data)]);
    }
}
