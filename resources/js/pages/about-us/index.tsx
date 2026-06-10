import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sobre Nós', href: '/sobre-nos' },
];

interface AboutUsData {
    id?: number;
    content: string;
    active: boolean;
}

export default function AboutUsIndex({ about }: { about: AboutUsData | null }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        content: about?.content || '',
        active: about?.active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('sobre-nos.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sobre Nós" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                        Sobre Nós
                    </h1>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Conteúdo *</label>
                                <textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    rows={15}
                                    className="w-full rounded-lg border border-sidebar-border bg-transparent p-3 focus:ring-2 focus:ring-[#3043B8] outline-none text-sm leading-relaxed"
                                    placeholder="Escreva aqui o conteúdo da página Sobre Nós..."
                                />
                                {errors.content && <span className="text-xs text-red-500">{errors.content}</span>}
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
                                    Página ativa (visível no app)
                                </label>
                            </div>

                            {about?.id && (
                                <p className="text-xs text-neutral-400">
                                    Última atualização: {about.updated_at ? new Date(about.updated_at).toLocaleString('pt-BR') : '---'}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                style={{ backgroundColor: '#3043B8' }}
                                className="rounded-lg px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                                Salvar Conteúdo
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
