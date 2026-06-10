import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Pillar {
    id: number;
    icon: string;
    title: string;
    text: string;
    background: string;
    border: string;
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

interface PillarForm {
    icon: string;
    title: string;
    text: string;
    background: string;
    border: string;
    active: boolean;
    sort_order: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pilares', href: '/pilares' },
];

const PRESET_COLORS = [
    { label: 'Azul', bg: '#EEF4FF', border: '#1565C0' },
    { label: 'Amarelo', bg: '#FFFBEB', border: '#F59E0B' },
    { label: 'Verde', bg: '#ECFDF5', border: '#10B981' },
    { label: 'Rosa', bg: '#FDF2F8', border: '#EC4899' },
    { label: 'Roxo', bg: '#F5F3FF', border: '#8B5CF6' },
    { label: 'Vermelho', bg: '#FEF2F2', border: '#EF4444' },
];

export default function PillarIndex({ pillars }: { pillars: PaginatedData<Pillar> }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPillar, setEditingPillar] = useState<Pillar | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<PillarForm>({
            icon: '🎯',
            title: '',
            text: '',
            background: '#EEF4FF',
            border: '#1565C0',
            active: true,
            sort_order: 0,
        });

    const openModal = (pillar: Pillar | null = null) => {
        if (pillar) {
            setEditingPillar(pillar);
            setData({
                icon: pillar.icon,
                title: pillar.title,
                text: pillar.text,
                background: pillar.background,
                border: pillar.border,
                active: pillar.active,
                sort_order: pillar.sort_order,
            });
        } else {
            setEditingPillar(null);
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
        if (editingPillar) {
            put(route('pilares.update', editingPillar.id), { onSuccess: closeModal });
        } else {
            post(route('pilares.store'), { onSuccess: closeModal });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja excluir este pilar?')) {
            router.delete(route('pilares.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pilares" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                        Gerenciar Pilares
                    </h1>
                    <button
                        onClick={() => openModal()}
                        style={{ backgroundColor: '#3043B8' }}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        <Plus size={18} />
                        Novo Pilar
                    </button>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-neutral-50 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium w-16">Ícone</th>
                                    <th className="px-6 py-4 font-medium">Título</th>
                                    <th className="px-6 py-4 font-medium">Texto</th>
                                    <th className="px-6 py-4 font-medium text-center">Ordem</th>
                                    <th className="px-6 py-4 font-medium text-center">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {pillars.data.length > 0 ? (
                                    pillars.data.map((pillar) => (
                                        <tr
                                            key={pillar.id}
                                            className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                                        >
                                            <td className="px-6 py-4 text-center text-2xl">
                                                {pillar.icon}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">
                                                {pillar.title}
                                            </td>
                                            <td className="max-w-xs truncate px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                                {pillar.text}
                                            </td>
                                            <td className="px-6 py-4 text-center text-neutral-600 dark:text-neutral-400">
                                                {pillar.sort_order}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                        pillar.active
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {pillar.active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openModal(pillar)}
                                                        className="p-1 text-neutral-500 hover:text-[#3043B8]"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(pillar.id)}
                                                        className="p-1 text-neutral-500 hover:text-red-500"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-neutral-500"
                                        >
                                            Nenhum pilar cadastrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-sidebar-border/70 px-6 py-4">
                        <div className="text-sm text-neutral-500">
                            Mostrando {pillars.from || 0} até {pillars.to || 0} de {pillars.total} resultados
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-lg rounded-xl border border-sidebar-border bg-white p-6 shadow-xl dark:bg-neutral-900">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                {editingPillar ? 'Editar Pilar' : 'Novo Pilar'}
                            </h2>
                            <button onClick={closeModal} className="p-1 text-neutral-400 hover:text-neutral-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ícone (emoji) *</label>
                                    <input
                                        type="text"
                                        value={data.icon}
                                        onChange={(e) => setData('icon', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                        placeholder="Ex: 🎯"
                                        maxLength={10}
                                    />
                                    {errors.icon && (
                                        <span className="text-xs text-red-500">{errors.icon}</span>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ordem</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', Number(e.target.value))}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Título *</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                    placeholder="Ex: Missão"
                                />
                                {errors.title && (
                                    <span className="text-xs text-red-500">{errors.title}</span>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Texto *</label>
                                <textarea
                                    value={data.text}
                                    onChange={(e) => setData('text', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none resize-none"
                                    placeholder="Descrição do pilar..."
                                />
                                {errors.text && (
                                    <span className="text-xs text-red-500">{errors.text}</span>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Cores</label>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_COLORS.map((preset) => (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => {
                                                setData('background', preset.bg);
                                                setData('border', preset.border);
                                            }}
                                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                                data.background === preset.bg && data.border === preset.border
                                                    ? 'ring-2 ring-[#3043B8] border-transparent'
                                                    : 'border-sidebar-border'
                                            }`}
                                            style={{ backgroundColor: preset.bg }}
                                        >
                                            <span
                                                className="inline-block w-3 h-3 rounded-full"
                                                style={{ backgroundColor: preset.border }}
                                            />
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-4 mt-2">
                                    <div className="flex-1">
                                        <label className="block text-xs text-neutral-500 mb-1">Fundo</label>
                                        <input
                                            type="text"
                                            value={data.background}
                                            onChange={(e) => setData('background', e.target.value)}
                                            className="w-full rounded-lg border border-sidebar-border bg-transparent p-1.5 text-xs focus:ring-2 focus:ring-[#3043B8] outline-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs text-neutral-500 mb-1">Borda</label>
                                        <input
                                            type="text"
                                            value={data.border}
                                            onChange={(e) => setData('border', e.target.value)}
                                            className="w-full rounded-lg border border-sidebar-border bg-transparent p-1.5 text-xs focus:ring-2 focus:ring-[#3043B8] outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={data.active}
                                    onChange={(e) => setData('active', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-[#3043B8] focus:ring-[#3043B8]"
                                />
                                <label htmlFor="active" className="text-sm font-medium">
                                    Pilar ativo (visível no app)
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    style={{ backgroundColor: '#3043B8' }}
                                    className="rounded-lg px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                >
                                    {editingPillar ? 'Salvar Alterações' : 'Criar Pilar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
