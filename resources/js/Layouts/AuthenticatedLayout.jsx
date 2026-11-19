import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const { t } = useTranslation();

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    useEffect(() => {
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'page_view', {
                page_path: window.location.pathname,
            });
        }

        const removeListener = router.on('finish', (event) => {
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'page_view', {
                    page_path: event.detail.page.url,
                });
            }
        });

        return () => removeListener();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link href={route('dashboard')} className="flex items-center gap-2">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-slate-900" />
                            </Link>

                            <div className="hidden sm:flex sm:space-x-6">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="text-sm font-medium transition-colors"
                                >
                                    {t('dashboard.title')}
                                </NavLink>
                                <NavLink
                                    href={route('clients.index')}
                                    active={route().current('clients.*')}
                                    className="text-sm font-medium transition-colors"
                                >
                                    Clientes
                                </NavLink>
                                <NavLink
                                    href={route('works.index')}
                                    active={route().current('works.*')}
                                    className="text-sm font-medium transition-colors"
                                >
                                    {t('dashboard.worksCatalogTitle')}
                                </NavLink>
                                <NavLink
                                    href={route('resources.index')}
                                    active={route().current('resources.*')}
                                    className="text-sm font-medium transition-colors"
                                >
                                    {t('dashboard.resourcesTitle')}
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ms-6">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-xl">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100/70 hover:bg-slate-100 rounded-xl transition"
                                            >
                                                {user?.name || 'Usuario'}
                                                <svg className="ms-2 h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Mi Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Cerrar Sesión
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-t border-slate-100 bg-white'}>
                    <div className="pt-2 pb-3 space-y-1 px-4">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            {t('dashboard.title')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('clients.index')} active={route().current('clients.*')}>
                            Clientes
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('works.index')} active={route().current('works.*')}>
                            {t('dashboard.worksCatalogTitle')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('resources.index')} active={route().current('resources.*')}>
                            {t('dashboard.resourcesTitle')}
                        </ResponsiveNavLink>
                    </div>

                    <div className="pt-4 pb-4 border-t border-slate-100 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{user?.name}</div>
                        <div className="text-xs text-slate-500 mb-3">{user?.email}</div>
                        <div className="space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Mi Perfil</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Cerrar Sesión</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white border-b border-slate-100">
                    <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="flex-grow">{children}</main>

            <footer className="pt-6 pb-20 sm:pb-8 text-center text-xs text-slate-400">
                <div className="flex items-center justify-center gap-1.5">
                    <span className="text-slate-400">Desarrollado por</span>
                    <a
                        href="https://www.perrovaca.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-600 hover:text-indigo-600 transition group"
                    >
                        <img
                            src="/images/logo_perrovaca.svg"
                            alt="perrovaca.com"
                            className="w-4 h-4 object-contain group-hover:scale-110 transition-transform"
                        />
                        <span>perrovaca.com</span>
                    </a>
                </div>
            </footer>
        </div>
    );
}