import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description: string | null;
    workload: number | null;
}

//pagination generic
interface PaginatedData<T> {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    from: number;
    to: number;
    total: number;
}

interface CourseForm {
    [key: string]: any;
    title: string;
    description: string;
    workload: string | number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cursos', href: '/cursos' },
];

export default function CourseIndex({ courses }: { courses: PaginatedData<Course> }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm<CourseForm>({
        title: '',
        description: '',
        workload: '',
    });

    const openModal = (course: Course | null = null) => {
        if (course) {
            setEditingCourse(course);
            setData({
                title: course.title,
                description: course.description || '',
                workload: course.workload || '',
            });
        } else {
            setEditingCourse(null);
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
        if (editingCourse) {
            put(route('cursos.update', editingCourse.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('cursos.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja excluir este curso?')) {
            router.delete(route('cursos.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cursos" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Gerenciar Cursos</h1>
                    <button
                        onClick={() => openModal()}
                        style={{ backgroundColor: '#3043B8' }}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        <Plus size={18} />
                        Novo Curso
                    </button>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-neutral-50 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Título</th>
                                    <th className="px-6 py-4 font-medium">Carga Horária</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {courses.data.map((course) => (
                                    <tr key={course.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-neutral-900 dark:text-neutral-100">{course.title}</div>
                                            <div className="text-xs text-neutral-500">
                                                {course.description ? `${course.description.substring(0, 50)}...` : 'Sem descrição'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                            {course.workload}h
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openModal(course)} className="p-1 text-neutral-500 hover:text-[#3043B8]">
                                                    <Pencil size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(course.id)} className="p-1 text-neutral-500 hover:text-red-500">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação */}
                    <div className="flex items-center justify-between border-t border-sidebar-border/70 px-6 py-4">
                        <div className="text-sm text-neutral-500">
                            Mostrando {courses.from} até {courses.to} de {courses.total} resultados
                        </div>
                        <div className="flex gap-2">
                            {courses.links.map((link, index) => (
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-sidebar-border bg-white p-6 shadow-xl dark:bg-neutral-900">
                        <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                            {editingCourse ? 'Editar Curso' : 'Novo Curso'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Título</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                />
                                {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Descrição</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Carga Horária (h)</label>
                                <input
                                    type="number"
                                    value={data.workload}
                                    onChange={e => setData('workload', e.target.value)}
                                    className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                />
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
                                    {editingCourse ? 'Salvar Alterações' : 'Criar Curso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
