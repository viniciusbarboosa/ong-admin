import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    Banknote,
    Users,
    BookOpen,
    ClipboardList,
    TrendingUp,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Props {
    stats: {
        totalDonationsAmount: string;
        totalDonationsCount: number;
        pendingEnrollmentsCount: number;
        totalCoursesCount: number;
        totalUsersCount: number;
    };
    recentDonations: Array<{
        id: number;
        amount: number;
        user_name: string;
        created_at: string;
    }>;
    chart: {
        labels: string[];
        data: number[];
    };
}

export default function Dashboard({ stats, recentDonations, chart }: Props) {
    const chartData = chart.labels.map((label, index) => ({
        month: label,
        total: chart.data[index],
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Total em Doações"
                        value={`R$ ${stats.totalDonationsAmount}`}
                        icon={<Banknote className="h-5 w-5 text-emerald-600" />}
                        description={`${stats.totalDonationsCount} doações`}
                    />
                    <MetricCard
                        title="Inscrições Pendentes"
                        value={stats.pendingEnrollmentsCount}
                        icon={<ClipboardList className="h-5 w-5 text-amber-600" />}
                        description="Aguardando aprovação"
                    />
                    <MetricCard
                        title="Cursos Ativos"
                        value={stats.totalCoursesCount}
                        icon={<BookOpen className="h-5 w-5 text-blue-600" />}
                        description="Total cadastrados"
                    />
                    <MetricCard
                        title="Usuários"
                        value={stats.totalUsersCount}
                        icon={<Users className="h-5 w-5 text-purple-600" />}
                        description="Registrados"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* GráPH*/}
                    <div className="lg:col-span-2 border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-900">
                        <div className="mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-gray-500" />
                            <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                                Doações nos últimos 6 meses
                            </h3>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: any) => {
                                        const num = Number(value);
                                            return isNaN(num) ? 'R$ 0.00' : `R$ ${num.toFixed(2)}`;
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="total"
                                        fill="#10b981"
                                        name="Total doado"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Últimas doações */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-900">
                        <h3 className="mb-4 font-semibold text-gray-700 dark:text-gray-200">
                            Últimas doações
                        </h3>
                        <div className="space-y-3">
                            {recentDonations.length > 0 ? (
                                recentDonations.map((donation) => (
                                    <div
                                        key={donation.id}
                                        className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 dark:border-gray-700"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                {donation.user_name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {donation.created_at}
                                            </p>
                                        </div>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                            R$ {Number(donation.amount).toFixed(2)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">
                                    Nenhuma doação recente.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function MetricCard({
    title,
    value,
    icon,
    description,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
}) {
    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {title}
                </span>
                {icon}
            </div>
            <div className="mt-2">
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {value}
                </p>
                {description && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
