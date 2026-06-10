import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Search, Building2, Globe, Mail, Phone, MapPin } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Fale Conosco', href: '/fale-conosco' },
];

interface ContactData {
    id?: number;
    email?: string | null;
    phone?: string | null;
    cnpj?: string | null;
    address?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    website?: string | null;
    active: boolean;
    updated_at?: string;
}

export default function ContactIndex({ contact }: { contact: ContactData | null }) {
    const [searchingCnpj, setSearchingCnpj] = useState(false);
    const [cnpjError, setCnpjError] = useState<string | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        email: contact?.email || '',
        phone: contact?.phone || '',
        cnpj: contact?.cnpj || '',
        address: contact?.address || '',
        neighborhood: contact?.neighborhood || '',
        city: contact?.city || '',
        state: contact?.state || '',
        zip_code: contact?.zip_code || '',
        website: contact?.website || '',
        active: contact?.active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('fale-conosco.update'));
    };

    const formatCnpj = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 14);
        return digits
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    };

    const searchCnpj = async () => {
        const rawCnpj = data.cnpj?.replace(/\D/g, '');
        if (!rawCnpj || rawCnpj.length !== 14) {
            setCnpjError('Digite um CNPJ válido com 14 dígitos');
            return;
        }

        setSearchingCnpj(true);
        setCnpjError(null);

        try {
            const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${rawCnpj}`);
            if (!res.ok) {
                setCnpjError('CNPJ não encontrado');
                return;
            }
            const json = await res.json();

            setData({
                ...data,
                cnpj: formatCnpj(rawCnpj),
                address: `${json.logradouro || ''}, ${json.numero || ''}`.trim().replace(/^,\s*/, ''),
                neighborhood: json.bairro || '',
                city: json.municipio || '',
                state: json.uf || '',
                zip_code: json.cep || '',
            });
        } catch {
            setCnpjError('Erro ao consultar CNPJ');
        } finally {
            setSearchingCnpj(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fale Conosco" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                        Fale Conosco
                    </h1>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium mb-1">
                                        <Mail size={14} /> E-mail
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2.5 text-sm focus:ring-2 focus:ring-[#3043B8] outline-none"
                                        placeholder="contato@exemplo.org"
                                    />
                                    {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium mb-1">
                                        <Phone size={14} /> Telefone
                                    </label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2.5 text-sm focus:ring-2 focus:ring-[#3043B8] outline-none"
                                        placeholder="(11) 99999-0000"
                                    />
                                    {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-medium mb-1">
                                        <Building2 size={14} /> CNPJ
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={data.cnpj}
                                            onChange={(e) => setData('cnpj', formatCnpj(e.target.value))}
                                            className="flex-1 rounded-lg border border-sidebar-border bg-transparent p-2.5 text-sm focus:ring-2 focus:ring-[#3043B8] outline-none"
                                            placeholder="00.000.000/0000-00"
                                            maxLength={18}
                                        />
                                        <button
                                            type="button"
                                            onClick={searchCnpj}
                                            disabled={searchingCnpj}
                                            style={{ backgroundColor: '#3043B8' }}
                                            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                        >
                                            <Search size={16} />
                                            {searchingCnpj ? 'Buscando...' : 'Buscar'}
                                        </button>
                                    </div>
                                    {cnpjError && <span className="text-xs text-red-500 mt-1 block">{cnpjError}</span>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-medium mb-1">
                                        <MapPin size={14} /> Endereço
                                    </label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2.5 text-sm focus:ring-2 focus:ring-[#3043B8] outline-none"
                                        placeholder="Rua das Flores, 123"
                                    />
                                    {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Bairro</label>
                                    <input
                                        type="text"
                                        value={data.neighborhood}
                                        onChange={(e) => setData('neighborhood', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2.5 text-sm focus:ring-2 focus:ring-[#3043B8] outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Cidade</label>
                                    <input
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2.5 text-sm focus:ring-2 focus:ring-[#3043B8] outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Estado</label>
                                    <input
                                        type="text"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value.toUpperCase())}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2.5 text-sm focus:ring-2 focus:ring-[#3043B8] outline-none"
                                        placeholder="SP"
                                        maxLength={2}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">CEP</label>
                                    <input
                                        type="text"
                                        value={data.zip_code}
                                        onChange={(e) => setData('zip_code', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2.5 text-sm focus:ring-2 focus:ring-[#3043B8] outline-none"
                                        placeholder="00000-000"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-medium mb-1">
                                        <Globe size={14} /> Site
                                    </label>
                                    <input
                                        type="text"
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2.5 text-sm focus:ring-2 focus:ring-[#3043B8] outline-none"
                                        placeholder="www.exemplo.org"
                                    />
                                    {errors.website && <span className="text-xs text-red-500">{errors.website}</span>}
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
                                    Seção ativa (visível no app)
                                </label>
                            </div>

                            {contact?.id && (
                                <p className="text-xs text-neutral-400">
                                    Última atualização: {new Date(contact.updated_at!).toLocaleString('pt-BR')}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                style={{ backgroundColor: '#3043B8' }}
                                className="rounded-lg px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                                Salvar Informações
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
