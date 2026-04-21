import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Movimento Pró Criança">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#3043B8]">
                <header className="w-full px-6 py-4 text-right">
                    <nav className="flex items-center justify-end gap-4 text-sm">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-md bg-white/20 px-4 py-1.5 text-white hover:bg-white/30"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-md bg-white/20 px-4 py-1.5 text-white hover:bg-white/30"
                                >
                                    Entrar
                                </Link>
                        {/*        <Link
                                    href={route('register')}
                                    className="rounded-md bg-white/20 px-4 py-1.5 text-white hover:bg-white/30"
                                >
                                    Cadastrar
                                </Link>*/}
                            </>
                        )}
                    </nav>
                </header>

                <main className="flex flex-1 items-center justify-center p-6">
                    <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl lg:flex-row">

                        <div className="flex-1 p-8 lg:p-12">
                            <h1 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
                                Movimento Pró Criança
                            </h1>
                            <p className="mb-6 text-gray-600">
                                Uma organização sem fins lucrativos fundada em 1993 pela Arquidiocese de Olinda e Recife
                                que atua na educação complementar, oferecendo às crianças, adolescentes e jovens
                                reforço escolar, com apoio pedagógico, psicossocial, além de outras oportunidades
                                educativas em diversas áreas, dentre elas: Artes, Esportes e Qualificação
                                Profissional/Empregabilidade, no município de Recife e Região Metropolitana,
                                com apoio psicossocial extensivo aos pais e/ou responsáveis.
                            </p>
                            <div className="mb-8">
                                <span className="inline-block rounded-full bg-[#3043B8]/10 px-5 py-2 text-xl font-semibold text-[#3043B8]">
                                    +50 mil crianças atendidas
                                </span>
                            </div>
                            <a
                                href="https://movimentoprocrianca.org.br/v2/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block rounded-lg bg-[#4395FF] px-8 py-3 font-medium text-white transition hover:bg-[#2a7ad9]"
                            >
                                Acessar o Blog
                            </a>
                        </div>

                        <div className="flex flex-1 items-center justify-center bg-[#eef2ff] p-8 lg:p-12">
                            <img
                                src="/ong/logoprocrianca.png"
                                alt="Logo Movimento Pró Criança"
                                className="max-h-64 w-auto object-contain"
                            />
                        </div>
                    </div>
                </main>

                <footer className="py-4 text-center text-sm text-white/70">
                    © {new Date().getFullYear()} Movimento Pró Criança
                </footer>
            </div>
        </>
    );
}
