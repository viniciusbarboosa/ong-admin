import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { UserPlus, UserCheck, UserX, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';

interface Admin {
    id: number;
    name: string;
    email: string;
    active: boolean;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administradores', href: '/administradores' },
];

export default function AdminIndex({ admins }: { admins: Admin[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admins.store'), {
            onSuccess: () => closeModal(),
        });
    };

    const handleToggleStatus = (admin: Admin) => {
        const acao = admin.active ? 'DESATIVAR' : 'ATIVAR';
        if (confirm(`Tem certeza que deseja ${acao} o acesso de ${admin.name}?`)) {
            router.patch(route('admins.status', admin.id), {}, { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerenciar Administradores" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Equipe Administrativa</h1>
                        <p className="text-sm text-neutral-500">Gerencie quem tem acesso ao painel de controle.</p>
                    </div>
                    <button
                        onClick={openModal}
                        style={{ backgroundColor: '#3043B8' }}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        <UserPlus size={18} />
                        Novo Administrador
                    </button>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-neutral-50 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">Nome do Administrador</th>
                                    <th className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">E-mail</th>
                                    <th className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100 text-center">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {admins.length > 0 ? (
                                    admins.map((admin) => (
                                        <tr key={admin.id} className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/30 ${!admin.active ? 'opacity-60' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                        <UserIcon size={16} className="text-neutral-500" />
                                                    </div>
                                                    <div className="font-medium text-neutral-900 dark:text-neutral-100">{admin.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                                {admin.email}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                    admin.active
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {admin.active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleToggleStatus(admin)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        admin.active
                                                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                        : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                    }`}
                                                    title={admin.active ? "Desativar Administrador" : "Ativar Administrador"}
                                                >
                                                    {admin.active ? <UserX size={20} /> : <UserCheck size={20} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-neutral-500">
                                            Nenhum administrador adicional cadastrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Cadastro */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-sidebar-border bg-white p-6 shadow-xl dark:bg-neutral-900">
                        <div className="mb-4 flex items-center gap-2 text-[#3043B8]">
                            <ShieldCheck size={24} />
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                Novo Administrador
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Nome Completo</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-2.5 text-neutral-400" size={18} />
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#3043B8]"
                                        placeholder="Ex: João Silva"
                                        required
                                    />
                                </div>
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">E-mail Corporativo</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-neutral-400" size={18} />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#3043B8]"
                                        placeholder="email@empresa.com"
                                        required
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-neutral-400" size={18} />
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#3043B8]"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Confirmar Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-neutral-400" size={18} />
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#3043B8]"
                                        required
                                    />
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    style={{ backgroundColor: '#3043B8' }}
                                    className="rounded-lg px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                >
                                    {processing ? 'Cadastrando...' : 'Cadastrar Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
