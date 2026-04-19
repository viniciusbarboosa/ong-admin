import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';

interface CourseShift {
    id?: number;
    shift: 'manha' | 'tarde' | 'noite';
    description: string;
    start_time: string;
    end_time: string;
    days_of_week: string[];
    max_students: number;
}

interface Unit {
    id: number;
    name: string;
}

interface Course {
    id: number;
    title: string;
    description: string | null;
    workload: number | null;
    shifts: CourseShift[];
    units: Unit[];
}

interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

interface CourseForm {
    title: string;
    description: string;
    workload: string | number;
    shifts: CourseShift[];
    unit_ids: number[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cursos', href: '/cursos' },
];

const ALL_DAYS = [
    { key: 'seg', label: 'Seg' },
    { key: 'ter', label: 'Ter' },
    { key: 'qua', label: 'Qua' },
    { key: 'qui', label: 'Qui' },
    { key: 'sex', label: 'Sex' },
    { key: 'sab', label: 'Sáb' },
    { key: 'dom', label: 'Dom' },
];

const shiftLabels: Record<CourseShift['shift'], string> = {
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
};

const shiftDefaults: Record<CourseShift['shift'], { start_time: string; end_time: string }> = {
    manha: { start_time: '08:00', end_time: '11:30' },
    tarde: { start_time: '13:00', end_time: '16:30' },
    noite: { start_time: '18:30', end_time: '21:30' },
};

export default function CourseIndex({
    courses,
    allUnits,
    search: initialSearch = '',
}: {
    courses: PaginatedData<Course>;
    allUnits: Unit[];
    search?: string;
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [searchTerm, setSearchTerm] = useState(initialSearch);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<CourseForm>({
            title: '',
            description: '',
            workload: '',
            shifts: [],
            unit_ids: [],
        });

    const openModal = (course: Course | null = null) => {
        if (course) {
            setEditingCourse(course);
            setData({
                title: course.title,
                description: course.description || '',
                workload: course.workload || '',
                shifts: course.shifts.map((s) => ({
                    ...s,
                    description: s.description || '',
                    start_time: s.start_time || '',
                    end_time: s.end_time || '',
                    days_of_week: s.days_of_week ?? [],
                })),
                unit_ids: course.units.map((u) => u.id),
            });
        } else {
            setEditingCourse(null);
            reset();
            setData('shifts', []);
            setData('unit_ids', []);
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
            put(route('cursos.update', editingCourse.id), { onSuccess: closeModal });
        } else {
            post(route('cursos.store'), { onSuccess: closeModal });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja excluir este curso?')) {
            router.delete(route('cursos.destroy', id));
        }
    };

    const addShift = () => {
        setData('shifts', [
            ...data.shifts,
            {
                shift: 'manha',
                description: '',
                start_time: shiftDefaults.manha.start_time,
                end_time: shiftDefaults.manha.end_time,
                days_of_week: [],
                max_students: 10,
            },
        ]);
    };

    const updateShift = (index: number, field: keyof CourseShift, value: any) => {
        const newShifts = [...data.shifts];
        const updated = { ...newShifts[index], [field]: value };

        // Auto-preenche horários ao trocar o turno
        if (field === 'shift') {
            const def = shiftDefaults[value as CourseShift['shift']];
            if (!newShifts[index].start_time && !newShifts[index].end_time) {
                updated.start_time = def.start_time;
                updated.end_time = def.end_time;
            }
        }

        newShifts[index] = updated;
        setData('shifts', newShifts);
    };

    const toggleDay = (shiftIndex: number, day: string) => {
        const shift = data.shifts[shiftIndex];
        const current = shift.days_of_week ?? [];
        const next = current.includes(day)
            ? current.filter((d) => d !== day)
            : [...current, day];
        updateShift(shiftIndex, 'days_of_week', next);
    };

    const removeShift = (index: number) => {
        setData('shifts', data.shifts.filter((_, i) => i !== index));
    };

    const toggleUnit = (unitId: number) => {
        setData(
            'unit_ids',
            data.unit_ids.includes(unitId)
                ? data.unit_ids.filter((id) => id !== unitId)
                : [...data.unit_ids, unitId]
        );
    };

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get(
            route('cursos'),
            { search: searchTerm || undefined },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        router.get(route('cursos'), {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cursos" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                        Gerenciar Cursos
                    </h1>

                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSearch} className="flex items-stretch">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar cursos..."
                                    className="h-10 w-64 rounded-l-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:border-[#3043B8] focus:ring-1 focus:ring-[#3043B8] outline-none"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="flex h-10 w-10 items-center justify-center rounded-r-lg bg-[#3043B8] text-white hover:bg-[#2538a0] transition-colors"
                                aria-label="Buscar"
                            >
                                <Search size={18} />
                            </button>
                        </form>

                        <button
                            onClick={() => openModal()}
                            className="flex h-10 items-center gap-2 rounded-lg bg-[#3043B8] px-4 text-sm font-medium text-white hover:bg-[#2538a0] transition-colors"
                        >
                            <Plus size={18} />
                            Novo Curso
                        </button>
                    </div>

                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-neutral-50 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Título</th>
                                    <th className="px-6 py-4 font-medium">Carga Horária</th>
                                    <th className="px-6 py-4 font-medium">Turnos</th>
                                    <th className="px-6 py-4 font-medium">Unidades</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {courses.data.map((course) => (
                                    <tr
                                        key={course.id}
                                        className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                {course.title}
                                            </div>
                                            <div className="text-xs text-neutral-500">
                                                {course.description
                                                    ? `${course.description.substring(0, 50)}...`
                                                    : 'Sem descrição'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                            {course.workload ? `${course.workload}h` : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {course.shifts.map((shift) => (
                                                    <span
                                                        key={shift.id}
                                                        className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                        title={
                                                            shift.start_time && shift.end_time
                                                                ? `${shift.start_time} – ${shift.end_time}`
                                                                : ''
                                                        }
                                                    >
                                                        {shiftLabels[shift.shift]} ({shift.max_students} vagas)
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {course.units.length > 0 ? (
                                                    course.units.map((u) => (
                                                        <span
                                                            key={u.id}
                                                            className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                        >
                                                            {u.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-neutral-400">
                                                        Nenhuma unidade
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(course)}
                                                    className="p-1 text-neutral-500 hover:text-[#3043B8]"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(course.id)}
                                                    className="p-1 text-neutral-500 hover:text-red-500"
                                                >
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
                                    className={`rounded px-3 py-1 text-sm ${link.active
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
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-2xl rounded-xl border border-sidebar-border bg-white p-6 shadow-xl dark:bg-neutral-900 my-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                {editingCourse ? 'Editar Curso' : 'Novo Curso'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-1 text-neutral-400 hover:text-neutral-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Dados básicos */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Título *</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                    />
                                    {errors.title && (
                                        <span className="text-xs text-red-500">{errors.title}</span>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Descrição</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Carga Horária (h)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.workload}
                                        onChange={(e) => setData('workload', e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-transparent p-2 focus:ring-2 focus:ring-[#3043B8] outline-none"
                                    />
                                    {errors.workload && (
                                        <span className="text-xs text-red-500">{errors.workload}</span>
                                    )}
                                </div>
                            </div>

                            {/* Unidades */}
                            <div className="border-t border-sidebar-border/50 pt-4">
                                <h3 className="text-base font-medium mb-2">Unidades que oferecem este curso</h3>
                                {allUnits.length === 0 ? (
                                    <p className="text-sm text-neutral-500">
                                        Nenhuma unidade cadastrada ainda.{' '}
                                        <a href="/unidades" className="text-[#3043B8] underline">
                                            Cadastrar unidade
                                        </a>
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {allUnits.map((unit) => {
                                            const selected = data.unit_ids.includes(unit.id);
                                            return (
                                                <button
                                                    key={unit.id}
                                                    type="button"
                                                    onClick={() => toggleUnit(unit.id)}
                                                    className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${selected
                                                        ? 'border-[#3043B8] bg-[#3043B8] text-white'
                                                        : 'border-sidebar-border text-neutral-600 hover:border-[#3043B8] hover:text-[#3043B8]'
                                                        }`}
                                                >
                                                    {unit.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Turnos */}
                            <div className="border-t border-sidebar-border/50 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-base font-medium">Turnos e Vagas</h3>
                                    <button
                                        type="button"
                                        onClick={addShift}
                                        className="text-sm text-[#3043B8] hover:underline"
                                    >
                                        + Adicionar Turno
                                    </button>
                                </div>
                                {errors.shifts && (
                                    <span className="text-xs text-red-500">{errors.shifts}</span>
                                )}

                                <div className="space-y-3">
                                    {data.shifts.map((shift, index) => (
                                        <div
                                            key={index}
                                            className="rounded-lg border border-sidebar-border/30 bg-neutral-50 p-3 dark:bg-neutral-800/30"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                {/* Turno */}
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                                                        Turno
                                                    </label>
                                                    <select
                                                        value={shift.shift}
                                                        onChange={(e) =>
                                                            updateShift(index, 'shift', e.target.value)
                                                        }
                                                        className="w-full rounded-md border border-sidebar-border bg-transparent p-2 text-sm"
                                                    >
                                                        <option value="manha">Manhã</option>
                                                        <option value="tarde">Tarde</option>
                                                        <option value="noite">Noite</option>
                                                    </select>
                                                </div>
                                                {/* Horário início */}
                                                <div className="w-24">
                                                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                                                        Início
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={shift.start_time}
                                                        onChange={(e) =>
                                                            updateShift(index, 'start_time', e.target.value)
                                                        }
                                                        className="w-full rounded-md border border-sidebar-border bg-transparent p-2 text-sm"
                                                    />
                                                </div>
                                                {/* Horário fim */}
                                                <div className="w-24">
                                                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                                                        Fim
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={shift.end_time}
                                                        onChange={(e) =>
                                                            updateShift(index, 'end_time', e.target.value)
                                                        }
                                                        className="w-full rounded-md border border-sidebar-border bg-transparent p-2 text-sm"
                                                    />
                                                </div>
                                                {/* Vagas */}
                                                <div className="w-24">
                                                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                                                        Vagas
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={shift.max_students}
                                                        onChange={(e) =>
                                                            updateShift(
                                                                index,
                                                                'max_students',
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        className="w-full rounded-md border border-sidebar-border bg-transparent p-2 text-sm"
                                                    />
                                                </div>
                                                {/* Remover */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeShift(index)}
                                                    className="mt-4 p-1 text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            {/* Descrição adicional */}
                                            <div>
                                                <label className="block text-xs font-medium text-neutral-500 mb-1">
                                                    Informações adicionais (exibidas no app)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={shift.description}
                                                    onChange={(e) =>
                                                        updateShift(index, 'description', e.target.value)
                                                    }
                                                    placeholder="Ex: Aulas práticas e teóricas. Leve caderno e caneta."
                                                    className="w-full rounded-md border border-sidebar-border bg-transparent p-2 text-sm"
                                                />
                                            </div>
                                            {/* Dias da semana */}
                                            <div>
                                                <label className="block text-xs font-medium text-neutral-500 mb-1">
                                                    Dias da semana
                                                </label>
                                                <div className="flex flex-wrap gap-1">
                                                    {ALL_DAYS.map((d) => {
                                                        const selected = (shift.days_of_week ?? []).includes(d.key);
                                                        return (
                                                            <button
                                                                key={d.key}
                                                                type="button"
                                                                onClick={() => toggleDay(index, d.key)}
                                                                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${selected
                                                                    ? 'border-[#3043B8] bg-[#3043B8] text-white'
                                                                    : 'border-sidebar-border text-neutral-600 hover:border-[#3043B8] hover:text-[#3043B8]'
                                                                    }`}
                                                            >
                                                                {d.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {data.shifts.length === 0 && (
                                    <p className="text-sm text-neutral-500 mt-2">
                                        Nenhum turno adicionado. Clique em "Adicionar Turno".
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
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
