import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Unit {
    id: number;
    name: string;
    address: string | null;
    neighborhood: string | null;
    city: string | null;
    phone: string | null;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

interface UnitForm {
    name: string;
    address: string;
    neighborhood: string;
    city: string;
    phone: string;
    active: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Unidades', href: '/unidades' },
];

export default function UnitIndex({ units }: { units: PaginatedData<Unit> }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<UnitForm>({
            name: '',
            address: '',
            neighborhood: '',
            city: '',
            phone: '',
            active: true,
        });

    const openModal = (unit: Unit | null = null) => {
        if (unit) {
            setEditingUnit(unit);
            setData({
                name: unit.name,
                address: unit.address || '',
                neighborhood: unit.neighborhood || '',
                city: unit.city || '',
                phone: unit.phone || '',
                active: unit.active,
            });
        } else {
            setEditingUnit(null);
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
        if (editingUnit) {
            put(route('unidades.update', editingUnit.id), { onSuccess: closeModal });
        } else {
            post(route('unidades.store'), { onSuccess: closeModal });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja excluir esta unidade?')) {
            router.delete(route('unidades.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unidades" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                        Gerenciar Unidades
                    </h1>
                    <button
                        onClick={() => openModal()}
                        style={{ backgroundColor: '#3043B8' }}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        <Plus size={18} />
                        Nova Unidade
                    </button>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-neutral-50 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Nome</th>
                                    <th className="px-6 py-4 font-medium">Endereço</th>
                                    <th className="px-6 py-4 font-medium">Cidade</th>
                                    <th className="px-6 py-4 font-medium">Telefone</th>
                                    <th className="px-6 py-4 font-medium text-center">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {units.data.length > 0 ? (
                                    units.data.map((unit) => (
                                        <tr
                                            key={unit.id}
                                            className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                                        >
                                            <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">
                                                {unit.name}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                                {unit.address && unit.neighborhood
                                                    ? `${unit.address} · ${unit.neighborhood}`
                                                    : unit.address || unit.neighborhood || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                                {unit.city || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                                {unit.phone || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                        unit.active
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {unit.active ? 'Ativa' : 'Inativa'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openModal(unit)}
                                                        className="p-1 text-neutral-500 hover:text-[#3043B8]"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(unit.id)}
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
                                            Nenhuma unidade cadastrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-sidebar-border/70 px-6 py-4">
                        <div className="text-sm text-neutral-500">
                            Mostrando {units.from || 0} até {units.to || 0} de {units.total} resultados
                        </div>
                        <div className="flex gap-2">
                            {units.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || ''}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded px-3 py-1 text-sm ${
                                        link.active
                                            ? 'bg-[#3043B8] text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-lg rounded-xl border border-sidebar-border bg-white p-6 shadow-xl dark:bg-neutral-900">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
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
                                    placeholder="Ex: Unidade Centro"
                                />
                                {errors.name && (
                                    <span className="text-xs text-red-500">{errors.name}</span>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Endereço</label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                    placeholder="Ex: Rua das Flores, 123"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Bairro</label>
                                    <input
                                        type="text"
                                        value={data.neighborhood}
                                        onChange={(e) => setData('neighborhood', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                        placeholder="Ex: Centro"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cidade</label>
                                    <input
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                        placeholder="Ex: São Paulo"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Telefone</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                    placeholder="Ex: (11) 3333-4444"
                                />
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
                                    Unidade ativa (visível no app)
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
                                    {editingUnit ? 'Salvar Alterações' : 'Criar Unidade'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
