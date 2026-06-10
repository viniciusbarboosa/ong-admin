import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Impact {
    id: number;
    icon: string;
    metric: string;
    label: string;
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
    { title: 'Impacto', href: '/impacto' },
];

export default function ImpactIndex({ impacts }: { impacts: PaginatedData<Impact> }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImpact, setEditingImpact] = useState<Impact | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            icon: '📊',
            metric: '',
            label: '',
            active: true,
            sort_order: 0,
        });

    const openModal = (impact: Impact | null = null) => {
        if (impact) {
            setEditingImpact(impact);
            setData({
                icon: impact.icon,
                metric: impact.metric,
                label: impact.label,
                active: impact.active,
                sort_order: impact.sort_order,
            });
        } else {
            setEditingImpact(null);
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
        if (editingImpact) {
            put(route('impacto.update', editingImpact.id), { onSuccess: closeModal });
        } else {
            post(route('impacto.store'), { onSuccess: closeModal });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja excluir esta métrica?')) {
            router.delete(route('impacto.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Impacto" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                        Nosso Impacto
                    </h1>
                    <button
                        onClick={() => openModal()}
                        style={{ backgroundColor: '#3043B8' }}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        <Plus size={18} />
                        Nova Métrica
                    </button>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-neutral-50 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium w-16">Ícone</th>
                                    <th className="px-6 py-4 font-medium">Métrica</th>
                                    <th className="px-6 py-4 font-medium">Label</th>
                                    <th className="px-6 py-4 font-medium text-center">Ordem</th>
                                    <th className="px-6 py-4 font-medium text-center">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {impacts.data.length > 0 ? (
                                    impacts.data.map((impact) => (
                                        <tr key={impact.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                            <td className="px-6 py-4 text-center text-2xl">{impact.icon}</td>
                                            <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">{impact.metric}</td>
                                            <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{impact.label}</td>
                                            <td className="px-6 py-4 text-center text-neutral-600 dark:text-neutral-400">{impact.sort_order}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                    impact.active
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {impact.active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openModal(impact)} className="p-1 text-neutral-500 hover:text-[#3043B8]"><Pencil size={18} /></button>
                                                    <button onClick={() => handleDelete(impact.id)} className="p-1 text-neutral-500 hover:text-red-500"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-neutral-500">Nenhuma métrica cadastrada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between border-t border-sidebar-border/70 px-6 py-4">
                        <div className="text-sm text-neutral-500">Mostrando {impacts.from || 0} até {impacts.to || 0} de {impacts.total} resultados</div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-lg rounded-xl border border-sidebar-border bg-white p-6 shadow-xl dark:bg-neutral-900">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                {editingImpact ? 'Editar Métrica' : 'Nova Métrica'}
                            </h2>
                            <button onClick={closeModal} className="p-1 text-neutral-400 hover:text-neutral-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ícone *</label>
                                    <input type="text" value={data.icon} onChange={(e) => setData('icon', e.target.value)} className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none" placeholder="📊" maxLength={10} />
                                    {errors.icon && <span className="text-xs text-red-500">{errors.icon}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ordem</label>
                                    <input type="number" min={0} value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Métrica *</label>
                                <input type="text" value={data.metric} onChange={(e) => setData('metric', e.target.value)} className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none" placeholder="Ex: 5.000+" />
                                {errors.metric && <span className="text-xs text-red-500">{errors.metric}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Label *</label>
                                <input type="text" value={data.label} onChange={(e) => setData('label', e.target.value)} className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none" placeholder="Ex: crianças atendidas" />
                                {errors.label && <span className="text-xs text-red-500">{errors.label}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="active" checked={data.active} onChange={(e) => setData('active', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#3043B8] focus:ring-[#3043B8]" />
                                <label htmlFor="active" className="text-sm font-medium">Métrica ativa (visível no app)</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">Cancelar</button>
                                <button type="submit" disabled={processing} style={{ backgroundColor: '#3043B8' }} className="rounded-lg px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
                                    {editingImpact ? 'Salvar Alterações' : 'Criar Métrica'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
