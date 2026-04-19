import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Heart, DollarSign, Calendar, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface Donation {
    id: number;
    amount: string;
    payment_method: string;
    status: string;
    message: string | null;
    created_at: string;
    user: { name: string; email: string };
}

interface Props {
    donations: {
        data: Donation[];
        links: any[];
        from: number;
        to: number;
        total: number;
    };
    filters?: {
        status?: string;
    };
}

export default function DonationIndex({ donations, filters }: Props) {
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setStatusFilter(newStatus);

        router.get(
            '/doacoes',
            { status: newStatus || undefined },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Doações', href: '/doacoes' }]}>
            <Head title="Histórico de Doações" />

            <div className="p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                             Histórico de Doações
                        </h1>
                        <p className="text-sm text-neutral-500">Acompanhe todas as contribuições recebidas do App</p>
                    </div>

                    <div>
                        <select
                            value={statusFilter}
                            onChange={handleStatusChange}
                            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 py-2 px-3 text-sm focus:border-[#3043B8] focus:ring-1 focus:ring-[#3043B8] outline-none"
                        >
                            <option value="">Todos os status</option>
                            <option value="pending">Pendente</option>
                            <option value="completed">Concluída</option>
                        </select>
                    </div>
                </div>

                <div className="border overflow-hidden rounded-xl bg-white dark:bg-neutral-900">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 dark:bg-neutral-800 border-b">
                            <tr>
                                <th className="px-6 py-4">Doador</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4">Método</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70">
                            {donations.data.map((donation) => (
                                <tr key={donation.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{donation.user.name}</div>
                                        <div className="text-xs text-neutral-500">{donation.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-green-600 font-bold">
                                            <DollarSign size={14} /> {donation.amount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 uppercase text-xs font-medium">
                                        {donation.payment_method.replace('_', ' ')}
                                    </td>
                                    <td className="px-6 py-4 text-neutral-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} /> {new Date(donation.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            donation.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {donation.status === 'completed' ? 'Concluída' : 'Pendente'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {donations.data.length === 0 && (
                        <div className="p-10 text-center text-neutral-500">Nenhuma doação registrada ainda.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
