import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, Link } from '@inertiajs/react';
import { UserCheck, UserX, User as UserIcon, Search, Phone, CreditCard } from 'lucide-react';

interface AppUser {
    id: number;
    name: string;
    email: string;
    cpf: string | null;
    phone: string | null;
    active: boolean;
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
    { title: 'Usuários', href: '/usuarios' },
];

function formatCpf(cpf: string | null): string {
    if (!cpf) return '—';
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return cpf;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function UserIndex({ users, status }: { users: PaginatedData<AppUser>; status?: string }) {
    const [search, setSearch] = useState('');

    const handleToggleStatus = (user: AppUser) => {
        const acao = user.active ? 'DESATIVAR' : 'ATIVAR';
        if (confirm(`Tem certeza que deseja ${acao} o acesso de ${user.name}?`)) {
            router.patch(route('usuarios.status', user.id), {}, { preserveScroll: true });
        }
    };

    const filtered = search.trim()
        ? users.data.filter(
              (u) =>
                  u.name.toLowerCase().includes(search.toLowerCase()) ||
                  (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
                  (u.cpf && u.cpf.includes(search.replace(/\D/g, '')))
          )
        : users.data;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuários" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                {/* Header */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                            Usuários do App
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Pessoas cadastradas via inscrição no aplicativo mobile.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-2.5 text-neutral-400" size={16} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nome, e-mail ou CPF…"
                            className="w-full rounded-lg border border-sidebar-border/70 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#3043B8] dark:bg-neutral-800 dark:border-sidebar-border"
                        />
                    </div>
                </div>

                {/* Flash */}
                {status && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {status}
                    </div>
                )}

                {/* Table card */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-neutral-50 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">
                                        Usuário
                                    </th>
                                    <th className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">
                                        CPF
                                    </th>
                                    <th className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">
                                        Telefone
                                    </th>
                                    <th className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">
                                        Cadastro
                                    </th>
                                    <th className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100 text-center">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 font-medium text-right">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {filtered.length > 0 ? (
                                    filtered.map((user) => (
                                        <tr
                                            key={user.id}
                                            className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors ${
                                                !user.active ? 'opacity-60' : ''
                                            }`}
                                        >
                                            {/* Nome + e-mail */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                        <UserIcon size={16} className="text-neutral-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-xs text-neutral-500">
                                                            {user.email || '—'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* CPF */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                                    <CreditCard size={14} className="shrink-0 text-neutral-400" />
                                                    {formatCpf(user.cpf)}
                                                </div>
                                            </td>

                                            {/* Telefone */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                                    <Phone size={14} className="shrink-0 text-neutral-400" />
                                                    {user.phone || '—'}
                                                </div>
                                            </td>

                                            {/* Data */}
                                            <td className="px-6 py-4 text-neutral-500 text-xs">
                                                {formatDate(user.created_at)}
                                            </td>

                                            {/* Status badge */}
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                        user.active
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {user.active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>

                                            {/* Ações */}
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        user.active
                                                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                    }`}
                                                    title={user.active ? 'Desativar usuário' : 'Ativar usuário'}
                                                >
                                                    {user.active ? <UserX size={20} /> : <UserCheck size={20} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-neutral-500"
                                        >
                                            {search
                                                ? 'Nenhum usuário encontrado para esta busca.'
                                                : 'Nenhum usuário cadastrado ainda.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-sidebar-border/70 px-6 py-4 bg-neutral-50/50 dark:bg-neutral-800/20">
                        <div className="text-sm text-neutral-500">
                            Mostrando {users.from || 0} até {users.to || 0} de{' '}
                            {users.total} usuário{users.total !== 1 ? 's' : ''}
                        </div>
                        <div className="flex gap-2">
                            {users.links.map((link, index) => (
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
