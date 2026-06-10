import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Testimonial {
    id: number;
    name: string;
    role: string | null;
    text: string;
    avatar: string | null;
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

interface TestimonialForm {
    name: string;
    role: string;
    text: string;
    avatar: string;
    active: boolean;
    sort_order: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Depoimentos', href: '/depoimentos' },
];

export default function TestimonialIndex({ testimonials }: { testimonials: PaginatedData<Testimonial> }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<TestimonialForm>({
            name: '',
            role: '',
            text: '',
            avatar: '',
            active: true,
            sort_order: 0,
        });

    const openModal = (testimonial: Testimonial | null = null) => {
        if (testimonial) {
            setEditingTestimonial(testimonial);
            setData({
                name: testimonial.name,
                role: testimonial.role || '',
                text: testimonial.text,
                avatar: testimonial.avatar || '',
                active: testimonial.active,
                sort_order: testimonial.sort_order,
            });
        } else {
            setEditingTestimonial(null);
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
        if (editingTestimonial) {
            put(route('depoimentos.update', editingTestimonial.id), { onSuccess: closeModal });
        } else {
            post(route('depoimentos.store'), { onSuccess: closeModal });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja excluir este depoimento?')) {
            router.delete(route('depoimentos.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Depoimentos" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                        Gerenciar Depoimentos
                    </h1>
                    <button
                        onClick={() => openModal()}
                        style={{ backgroundColor: '#3043B8' }}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        <Plus size={18} />
                        Novo Depoimento
                    </button>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-neutral-50 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Nome</th>
                                    <th className="px-6 py-4 font-medium">Papel</th>
                                    <th className="px-6 py-4 font-medium">Depoimento</th>
                                    <th className="px-6 py-4 font-medium text-center">Ordem</th>
                                    <th className="px-6 py-4 font-medium text-center">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {testimonials.data.length > 0 ? (
                                    testimonials.data.map((testimonial) => (
                                        <tr
                                            key={testimonial.id}
                                            className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                                        >
                                            <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">
                                                {testimonial.avatar && (
                                                    <span className="mr-2">{testimonial.avatar}</span>
                                                )}
                                                {testimonial.name}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                                {testimonial.role || '—'}
                                            </td>
                                            <td className="max-w-xs truncate px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                                {testimonial.text}
                                            </td>
                                            <td className="px-6 py-4 text-center text-neutral-600 dark:text-neutral-400">
                                                {testimonial.sort_order}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                        testimonial.active
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {testimonial.active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openModal(testimonial)}
                                                        className="p-1 text-neutral-500 hover:text-[#3043B8]"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(testimonial.id)}
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
                                            Nenhum depoimento cadastrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-sidebar-border/70 px-6 py-4">
                        <div className="text-sm text-neutral-500">
                            Mostrando {testimonials.from || 0} até {testimonials.to || 0} de {testimonials.total} resultados
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-lg rounded-xl border border-sidebar-border bg-white p-6 shadow-xl dark:bg-neutral-900">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                {editingTestimonial ? 'Editar Depoimento' : 'Novo Depoimento'}
                            </h2>
                            <button onClick={closeModal} className="p-1 text-neutral-400 hover:text-neutral-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nome *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                    placeholder="Ex: Ana Paula Santos"
                                />
                                {errors.name && (
                                    <span className="text-xs text-red-500">{errors.name}</span>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Papel / Cargo</label>
                                <input
                                    type="text"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                    placeholder="Ex: Mãe do Lucas, 10 anos"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Depoimento *</label>
                                <textarea
                                    value={data.text}
                                    onChange={(e) => setData('text', e.target.value)}
                                    rows={4}
                                    className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none resize-none"
                                    placeholder="Texto do depoimento..."
                                />
                                {errors.text && (
                                    <span className="text-xs text-red-500">{errors.text}</span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Avatar (emoji)</label>
                                    <input
                                        type="text"
                                        value={data.avatar}
                                        onChange={(e) => setData('avatar', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                        placeholder="Ex: 👩🏽"
                                        maxLength={10}
                                    />
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

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={data.active}
                                    onChange={(e) => setData('active', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-[#3043B8] focus:ring-[#3043B8]"
                                />
                                <label htmlFor="active" className="text-sm font-medium">
                                    Depoimento ativo (visível no app)
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
                                    {editingTestimonial ? 'Salvar Alterações' : 'Criar Depoimento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
