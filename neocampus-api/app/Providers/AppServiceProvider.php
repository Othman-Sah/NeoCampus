<?php

namespace App\Providers;

use App\Domain\Ports\AuthPortInterface;
use App\Domain\Ports\StudentPortInterface;
use App\Infrastructure\Persistence\EloquentAuthRepository;
use App\Infrastructure\Persistence\EloquentStudentRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(AuthPortInterface::class, EloquentAuthRepository::class);
        $this->app->bind(StudentPortInterface::class, EloquentStudentRepository::class);
        $this->app->bind(\App\Domain\Ports\StatisticsRepositoryInterface::class, \App\Infrastructure\Persistence\EloquentStatisticsRepository::class);
        $this->app->bind(\App\Domain\Ports\ClassPortInterface::class, \App\Infrastructure\Persistence\EloquentClassRepository::class);
        $this->app->bind(\App\Domain\Ports\TeacherPortInterface::class, \App\Infrastructure\Persistence\EloquentTeacherRepository::class);
        $this->app->bind(\App\Domain\Ports\SalaryPortInterface::class, \App\Infrastructure\Persistence\EloquentSalaryRepository::class);
        $this->app->bind(\App\Domain\Ports\SeancePortInterface::class, \App\Infrastructure\Persistence\EloquentSeanceRepository::class);
        $this->app->bind(\App\Domain\Ports\PresencePortInterface::class, \App\Infrastructure\Persistence\EloquentPresenceRepository::class);
        $this->app->bind(\App\Domain\Ports\ExamenPortInterface::class, \App\Infrastructure\Persistence\EloquentExamenRepository::class);
        $this->app->bind(\App\Domain\Ports\GradePortInterface::class, \App\Infrastructure\Persistence\EloquentGradeRepository::class);
        $this->app->bind(\App\Domain\Ports\BulletinPortInterface::class, \App\Infrastructure\Persistence\EloquentBulletinRepository::class);
        $this->app->bind(\App\Domain\Ports\FinanceFeePortInterface::class, \App\Infrastructure\Persistence\EloquentFinanceFeeRepository::class);
        $this->app->bind(\App\Domain\Ports\FinancePaymentPortInterface::class, \App\Infrastructure\Persistence\EloquentFinancePaymentRepository::class);
        $this->app->bind(\App\Domain\Ports\FinanceSoldePortInterface::class, \App\Infrastructure\Persistence\EloquentFinanceSoldeRepository::class);
        $this->app->bind(\App\Domain\Ports\FinanceGroupeFraisPortInterface::class, \App\Infrastructure\Persistence\EloquentGroupeFraisRepository::class);
        $this->app->bind(\App\Domain\Ports\FinanceTypeFraisPortInterface::class, \App\Infrastructure\Persistence\EloquentTypeFraisRepository::class);
        $this->app->bind(\App\Domain\Ports\FinanceReportPortInterface::class, \App\Infrastructure\Persistence\EloquentFinanceReportRepository::class);
        $this->app->bind(\App\Domain\Ports\FinanceRecetteDepensePortInterface::class, \App\Infrastructure\Persistence\EloquentFinanceRecetteDepenseRepository::class);
        
        // Library Bindings
        $this->app->bind(\App\Domain\Ports\BookRepositoryInterface::class, \App\Infrastructure\Persistence\EloquentBookRepository::class);
        $this->app->bind(\App\Domain\Ports\LoanRepositoryInterface::class, \App\Infrastructure\Persistence\EloquentLoanRepository::class);
        $this->app->bind(\App\Domain\Ports\MemberRepositoryInterface::class, \App\Infrastructure\Persistence\EloquentMemberRepository::class);

        // Transport, Announcements & Notifications Bindings
        $this->app->bind(\App\Domain\Ports\TransportPortInterface::class, \App\Infrastructure\Persistence\EloquentTransportRepository::class);
        $this->app->bind(\App\Domain\Ports\AnnouncementPortInterface::class, \App\Infrastructure\Persistence\EloquentAnnouncementRepository::class);
        $this->app->bind(\App\Domain\Ports\NotificationPortInterface::class, \App\Infrastructure\Persistence\EloquentNotificationRepository::class);

        // Parent, Student and Course Material Portals
        $this->app->bind(\App\Domain\Ports\ParentPortalPortInterface::class, \App\Infrastructure\Persistence\EloquentParentPortalRepository::class);
        $this->app->bind(\App\Domain\Ports\StudentPortalPortInterface::class, \App\Infrastructure\Persistence\EloquentStudentPortalRepository::class);
        $this->app->bind(\App\Domain\Ports\CourseMaterialPortInterface::class, \App\Infrastructure\Persistence\EloquentCourseMaterialRepository::class);

        // Chatbot Binding
        $this->app->bind(\App\Domain\Ports\ChatbotPortInterface::class, \App\Infrastructure\External\LLMAdapter::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Frais::class, \App\Policies\FinancePolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Paiement::class, \App\Policies\FinancePolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Solde::class, \App\Policies\FinancePolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\GroupeFrais::class, \App\Policies\FinancePolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\TypeFrais::class, \App\Policies\FinancePolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\RecetteDepense::class, \App\Policies\FinancePolicy::class);

        // Library Policy
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Livre::class, \App\Policies\LibraryPolicy::class);

        // Bulletin Policy
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Bulletin::class, \App\Policies\BulletinPolicy::class);

        // Examen Policy
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Examen::class, \App\Policies\ExamenPolicy::class);
    }
}
