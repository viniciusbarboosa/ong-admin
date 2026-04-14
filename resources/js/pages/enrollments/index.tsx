import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, Link } from '@inertiajs/react';
import { Check, X, FileText, ExternalLink } from 'lucide-react';

interface CourseShift {
    shift: 'manha' | 'tarde' | 'noite';
    start_time: string | null;
    end_time: string | null;
}

interface Enrollment {
    id: number;
    status: 'pending' | 'accepted' | 'rejected';
    is_anonymous: boolean;
    full_name: string | null;
    cpf: string | null;
    phone: string | null;
    rg_front_path: string | null;
    rg_back_path: string | null;
    user: { name: string; email: string } | null;
    course: { title: string };
    unit: { name: string } | null;
    shift: CourseShift | null;
    created_at: string;
}

interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inscrições', href: '/inscricoes' },
];

const shiftLabels: Record<CourseShift['shift'], string> = {
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
};

export default function EnrollmentIndex({
    enrollments,
}: {
    enrollments: PaginatedData<Enrollment>;
}) {
    const statusTranslate = {
        pending: 'Pendente',
        accepted: 'Aprovado',
        rejected: 'Rejeitado',
    };

    const handleUpdateStatus = (id: number, newStatus: 'accepted' | 'rejected') => {
        const acao = newStatus === 'accepted' ? 'APROVAR' : 'REJEITAR';
        if (confirm(`Tem certeza que deseja ${acao} esta inscrição?`)) {
            router.patch(
                route('inscricoes.status', id),
                { status: newStatus },
                { preserveScroll: true }
            );
        }
    };

    const formatShift = (shift: CourseShift | null) => {
        if (!shift) return '—';
        const label = shiftLabels[shift.shift];
        if (shift.start_time && shift.end_time) {
            return `${label} · ${shift.start_time} – ${shift.end_time}`;
        }
        return label;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerenciar Inscrições" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                        Gerenciar Inscrições
                    </h1>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-neutral-50 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Aluno</th>
                                    <th className="px-6 py-4 font-medium">Curso</th>
                                    <th className="px-6 py-4 font-medium">Unidade / Turno</th>
                                    <th className="px-6 py-4 font-medium">Documentos</th>
                                    <th className="px-6 py-4 font-medium text-center">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {enrollments.data.length > 0 ? (
                                    enrollments.data.map((item) => {
                                        const displayName = item.is_anonymous
                                            ? (item.full_name || 'Anônimo')
                                            : (item.user?.name || item.full_name || '—');

                                        const displayContact = item.is_anonymous
                                            ? [item.cpf, item.phone].filter(Boolean).join(' · ')
                                            : item.user?.email || '';

                                        return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                        {displayName}
                                                        {item.is_anonymous && (
                                                            <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                                                                ANÔNIMO
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                        {displayContact}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-[#3043B8]">
                                                        {item.course.title}
                                                    </div>
                                                    <div className="text-[10px] text-neutral-400">
                                                        ID: #{item.id}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-neutral-800 dark:text-neutral-200">
                                                        {item.unit?.name || '—'}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                        {formatShift(item.shift)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        {item.rg_front_path ? (
                                                            <a
                                                                href={`/storage/${item.rg_front_path}`}
                                                                target="_blank"
                                                                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                                            >
                                                                <FileText size={14} /> Frente RG{' '}
                                                                <ExternalLink size={10} />
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-red-400">
                                                                Sem frente do RG
                                                            </span>
                                                        )}
                                                        {item.rg_back_path ? (
                                                            <a
                                                                href={`/storage/${item.rg_back_path}`}
                                                                target="_blank"
                                                                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                                            >
                                                                <FileText size={14} /> Verso RG{' '}
                                                                <ExternalLink size={10} />
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-red-400">
                                                                Sem verso do RG
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                            item.status === 'accepted'
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                : item.status === 'rejected'
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        }`}
                                                    >
                                                        {statusTranslate[item.status]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleUpdateStatus(item.id, 'accepted')
                                                            }
                                                            disabled={item.status === 'accepted'}
                                                            className={`group p-2 rounded-lg transition-all ${
                                                                item.status === 'accepted'
                                                                    ? 'opacity-20 cursor-not-allowed text-neutral-400'
                                                                    : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                            }`}
                                                            title="Aprovar Inscrição"
                                                        >
                                                            <Check
                                                                size={22}
                                                                className={
                                                                    item.status === 'accepted'
                                                                        ? ''
                                                                        : 'group-hover:scale-110'
                                                                }
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleUpdateStatus(item.id, 'rejected')
                                                            }
                                                            disabled={item.status === 'rejected'}
                                                            className={`group p-2 rounded-lg transition-all ${
                                                                item.status === 'rejected'
                                                                    ? 'opacity-20 cursor-not-allowed text-neutral-400'
                                                                    : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                            }`}
                                                            title="Rejeitar Inscrição"
                                                        >
                                                            <X
                                                                size={22}
                                                                className={
                                                                    item.status === 'rejected'
                                                                        ? ''
                                                                        : 'group-hover:scale-110'
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-neutral-500"
                                        >
                                            Nenhuma inscrição encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-sidebar-border/70 px-6 py-4 bg-neutral-50/50 dark:bg-neutral-800/20">
                        <div className="text-sm text-neutral-500">
                            Mostrando {enrollments.from || 0} até {enrollments.to || 0} de{' '}
                            {enrollments.total} alunos
                        </div>
                        <div className="flex gap-2">
                            {enrollments.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || ''}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label
                                            .replace('Previous', 'Anterior')
                                            .replace('Next', 'Próximo'),
                                    }}
                                    className={`rounded px-3 py-1 text-sm transition-colors ${
                                        link.active
                                            ? 'bg-[#3043B8] text-white font-medium'
                                            : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-sidebar-border/70 dark:bg-neutral-800 dark:text-neutral-400 dark:border-sidebar-border'
                                    } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
