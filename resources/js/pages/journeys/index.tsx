import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Journey {
    id: number;
    year: string;
    title: string;
    description: string;
    active: boolean;
    sort_order: number;
}

interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Jornada', href: '/jornada' },
];

export default function JourneyIndex({ journeys }: { journeys: PaginatedData<Journey> }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJourney, setEditingJourney] = useState<Journey | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            year: '',
            title: '',
            description: '',
            active: true,
            sort_order: 0,
        });

    const openModal = (journey: Journey | null = null) => {
        if (journey) {
            setEditingJourney(journey);
            setData({
                year: journey.year,
                title: journey.title,
                description: journey.description,
                active: journey.active,
                sort_order: journey.sort_order,
            });
        } else {
            setEditingJourney(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        clearErrors();
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingJourney) {
            put(route('jornada.update', editingJourney.id), { onSuccess: closeModal });
        } else {
            post(route('jornada.store'), { onSuccess: closeModal });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja excluir este marco?')) {
            router.delete(route('jornada.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jornada" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                        Nossa Jornada
                    </h1>
                    <button
                        onClick={() => openModal()}
                        style={{ backgroundColor: '#3043B8' }}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        <Plus size={18} />
                        Novo Marco
                    </button>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-neutral-50 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium w-24">Ano</th>
                                    <th className="px-6 py-4 font-medium">Título</th>
                                    <th className="px-6 py-4 font-medium">Descrição</th>
                                    <th className="px-6 py-4 font-medium text-center">Ordem</th>
                                    <th className="px-6 py-4 font-medium text-center">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {journeys.data.length > 0 ? (
                                    journeys.data.map((journey) => (
                                        <tr key={journey.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                            <td className="px-6 py-4 font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100">{journey.year}</td>
                                            <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">{journey.title}</td>
                                            <td className="max-w-xs truncate px-6 py-4 text-neutral-600 dark:text-neutral-400">{journey.description}</td>
                                            <td className="px-6 py-4 text-center text-neutral-600 dark:text-neutral-400">{journey.sort_order}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                    journey.active
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {journey.active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openModal(journey)} className="p-1 text-neutral-500 hover:text-[#3043B8]"><Pencil size={18} /></button>
                                                    <button onClick={() => handleDelete(journey.id)} className="p-1 text-neutral-500 hover:text-red-500"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-neutral-500">Nenhum marco cadastrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between border-t border-sidebar-border/70 px-6 py-4">
                        <div className="text-sm text-neutral-500">Mostrando {journeys.from || 0} até {journeys.to || 0} de {journeys.total} resultados</div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-lg rounded-xl border border-sidebar-border bg-white p-6 shadow-xl dark:bg-neutral-900">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                {editingJourney ? 'Editar Marco' : 'Novo Marco'}
                            </h2>
                            <button onClick={closeModal} className="p-1 text-neutral-400 hover:text-neutral-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ano *</label>
                                    <input type="text" value={data.year} onChange={(e) => setData('year', e.target.value)} className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none" placeholder="Ex: 2020" maxLength={20} />
                                    {errors.year && <span className="text-xs text-red-500">{errors.year}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ordem</label>
                                    <input type="number" min={0} value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Título *</label>
                                <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none" placeholder="Ex: Fundação da ONG" />
                                {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Descrição *</label>
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none resize-none" placeholder="Descrição do marco..." />
                                {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="active" checked={data.active} onChange={(e) => setData('active', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#3043B8] focus:ring-[#3043B8]" />
                                <label htmlFor="active" className="text-sm font-medium">Marco ativo (visível no app)</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">Cancelar</button>
                                <button type="submit" disabled={processing} style={{ backgroundColor: '#3043B8' }} className="rounded-lg px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
                                    {editingJourney ? 'Salvar Alterações' : 'Criar Marco'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
