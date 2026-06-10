import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Building2, GraduationCap, LayoutGrid, ClipboardCheck, Users, HandCoins, UserRound, MessageCircle, Target, Heart, MapPin, Info } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    }, {
        title: 'Cursos',
        url: '/cursos',
        icon: GraduationCap,
    }, {
        title: 'Unidades',
        url: '/unidades',
        icon: Building2,
    }, {
        title: 'Inscrições',
        url: '/inscricoes',
        icon: ClipboardCheck,
    }, {
        title: 'Instituição',
        url: '#',
        icon: Heart,
        children: [
            {
                title: 'Missão, Visão e Valores',
                url: '/pilares',
                icon: Target,
            },
            {
                title: 'Nosso Impacto',
                url: '/impacto',
                icon: MapPin,
            },
            {
                title: 'Depoimentos',
                url: '/depoimentos',
                icon: MessageCircle,
            },
            {
                title: 'Nossa Jornada',
                url: '/jornada',
                icon: BookOpen,
            },
            {
                title: 'Sobre Nós',
                url: '/sobre-nos',
                icon: Info,
            },
            {
                title: 'Fale Conosco',
                url: '/fale-conosco',
                icon: MessageCircle,
            },
        ],
    }, {
        title: 'Administradores',
        url: '/administradores',
        icon: Users,
    }, {
        title: 'Usuários',
        url: '/usuarios',
        icon: UserRound,
    },{
    title: 'Doações',
    url: '/doacoes',
    icon: HandCoins,
    }
];

const footerNavItems: NavItem[] = [
    {
        title: 'Blog',
        url: 'https://movimentoprocrianca.org.br/v2/',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
