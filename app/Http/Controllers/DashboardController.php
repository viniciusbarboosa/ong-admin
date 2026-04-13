<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Donation;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalDonationsAmount = Donation::sum('amount');
        $totalDonationsCount = Donation::count();

        $pendingEnrollmentsCount = Enrollment::where('status', 'pending')->count();

        $totalCoursesCount = Course::count();
        $totalUsersCount = User::count();

        $recentDonations = Donation::with('user:id,name')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($d) => [
                'id'         => $d->id,
                'amount'     => (float) $d->amount, 
                'user_name'  => $d->is_anonymous ? 'Anônimo' : optional($d->user)->name ?? 'Usuário',
                'created_at' => $d->created_at->format('d/m/Y H:i'),
            ]);

        //graph
        $sixMonthsAgo = now()->subMonths(5)->startOfMonth();
        $donationsByMonth = Donation::select(
            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
            DB::raw('SUM(amount) as total')
        )
            ->where('created_at', '>=', $sixMonthsAgo)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        //Fill in months without donations with 0
        $chartLabels = [];
        $chartData = [];
        $current = $sixMonthsAgo->copy();
        for ($i = 0; $i < 6; $i++) {
            $label = $current->translatedFormat('M/Y');
            $key = $current->format('Y-m');
            $chartLabels[] = $label;
            $chartData[] = $donationsByMonth[$key]->total ?? 0;
            $current->addMonth();
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'totalDonationsAmount'   => number_format($totalDonationsAmount, 2, ',', '.'),
                'totalDonationsCount'    => $totalDonationsCount,
                'pendingEnrollmentsCount' => $pendingEnrollmentsCount,
                'totalCoursesCount'      => $totalCoursesCount,
                'totalUsersCount'        => $totalUsersCount,
            ],
            'recentDonations' => $recentDonations,
            'chart' => [
                'labels' => $chartLabels,
                'data'   => $chartData,
            ],
        ]);
    }
}
