<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Application\UseCases\Notifications\GetUserNotificationsUseCase;
use App\Application\UseCases\Notifications\MarkNotificationReadUseCase;
use App\Application\UseCases\Notifications\MarkAllNotificationsReadUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\AppNotification;

/**
 * @OA\Tag(
 *     name="Notifications Management",
 *     description="Endpoints for user notifications bell and unread status tracking"
 * )
 */
class NotificationController extends Controller
{
    public function __construct(
        private GetUserNotificationsUseCase $getUserNotifications,
        private MarkNotificationReadUseCase $markNotificationRead,
        private MarkAllNotificationsReadUseCase $markAllNotificationsRead
    ) {}

    /**
     * @OA\Get(
     *     path="/api/notifications/me",
     *     summary="List all notifications for the user",
     *     tags={"Notifications Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $perPage = min($request->integer('per_page', 15), 100);

        $notifications = $this->getUserNotifications->execute($userId, $perPage);
        return NotificationResource::collection($notifications)->response();
    }

    /**
     * @OA\Get(
     *     path="/api/notifications/unread-count",
     *     summary="Get count of unread notifications",
     *     tags={"Notifications Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $count = $this->getUserNotifications->getUnreadCount($userId);
        return response()->json(['unread_count' => $count]);
    }

    /**
     * @OA\Get(
     *     path="/api/notifications/latest",
     *     summary="Get latest unread notifications",
     *     tags={"Notifications Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function latest(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $limit = min($request->integer('limit', 5), 20);

        $notifications = $this->getUserNotifications->getLatestUnread($userId, $limit);
        return NotificationResource::collection($notifications)->response();
    }

    /**
     * @OA\Put(
     *     path="/api/notifications/{id}/read",
     *     summary="Mark a specific notification as read",
     *     tags={"Notifications Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function markRead(Request $request, int $id): JsonResponse
    {
        // Enforce user ownership
        $notification = AppNotification::findOrFail($id);
        if ($notification->target_user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized to update this notification.'], 403);
        }

        $this->markNotificationRead->execute($id);
        return response()->json(['message' => 'Notification marked as read successfully.']);
    }

    /**
     * @OA\Put(
     *     path="/api/notifications/read-all",
     *     summary="Mark all user notifications as read",
     *     tags={"Notifications Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $count = $this->markAllNotificationsRead->execute($userId);
        return response()->json(['message' => "{$count} notifications marked as read."]);
    }
}
