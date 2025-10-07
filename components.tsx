import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store/store';
import { logout } from './store/authSlice';
import { Role, type Event, type User, EventType, type MemberEntity, type SpiritualEntity } from './types';
import { MOCK_RECADOS } from './data';

// ICONS
export const CrownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4l3 12h14l3-12-6 6-4-6-4 6-6-6z" />
        <path d="M2 16h20" />
    </svg>
);
export const CrossroadsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 18l-6-6-6 6" />
        <path d="M6 18l6-6 6 6" />
        <path d="M12 12V6" />
        <path d="M12 12h-6" />
        <path d="M12 12h6" />
    </svg>
);
export const TridentIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
        <path d="M12 21V6" />
        <path d="M4 12H2" />
        <path d="M22 12h-2" />
        <path d="M12 12L8 8" />
        <path d="M12 12l4 4" />
        <path d="M12 12l-4 4" />
        <path d="M12 12l4-4" />
    </svg>
);
export const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
        <path d="M12 2l2.35 6.65L21 10l-6.65 2.35L12 19l-2.35-6.65L3 10l6.65-2.35L12 2z" />
    </svg>
);
export const MalandroHatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2z" />
        <path d="M12 17V8" />
        <path d="M20 8H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2z" />
    </svg>
);
export const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
);
export const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
export const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
);
export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
export const BotMessageSquareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6V2H2v12h4v4l4-4h4a2 2 0 0 0 2-2V8" />
        <path d="M17 9h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1Z" />
        <path d="M21 15v2a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h8" />
    </svg>
);
export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
export const BoldIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
);
export const ItalicIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
);
export const UnderlineIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>
);
export const ListIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);
export const ListOrderedIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
);
export const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
);


export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


// HEADER
export const Header: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMenuOpen]);

    const unreadCount = useMemo(() => {
        if (!user) return 0;
        return MOCK_RECADOS.filter(recado => recado.userId === user.id && !recado.read).length;
    }, [user, location.pathname]);


    const handleLogout = () => {
        setIsMenuOpen(false);
        dispatch(logout());
        navigate('/');
    };

    const navLinkClasses = "transition-colors duration-300 hover:text-[#D4AF37] tracking-wider";

    const NavLinks: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
        const mobileClasses = "text-2xl py-4 text-center";
        const desktopClasses = "text-sm uppercase";
        return (
            <>
                <NavLink to="/agenda" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${navLinkClasses} ${isMobile ? mobileClasses : desktopClasses} ${isActive ? 'text-[#D4AF37]' : ''}`}>Agenda</NavLink>
                <NavLink to="/pedidos" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${navLinkClasses} ${isMobile ? mobileClasses : desktopClasses} ${isActive ? 'text-[#D4AF37]' : ''}`}>Pedidos</NavLink>
                <NavLink to="/galeria" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${navLinkClasses} ${isMobile ? mobileClasses : desktopClasses} ${isActive ? 'text-[#D4AF37]' : ''}`}>Galeria</NavLink>
                <NavLink to="/doacoes" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${navLinkClasses} ${isMobile ? mobileClasses : desktopClasses} ${isActive ? 'text-[#D4AF37]' : ''}`}>Doações</NavLink>
                <NavLink to="/sobre" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${navLinkClasses} ${isMobile ? mobileClasses : desktopClasses} ${isActive ? 'text-[#D4AF37]' : ''}`}>Doutrina</NavLink>
            </>
        )
    };

    return (
        <header className="bg-[#0B0B0B]/80 backdrop-blur-sm sticky top-0 z-50 border-b border-[#1A1A1A]">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <NavLink to="/" onClick={() => setIsMenuOpen(false)} className="text-xl md:text-2xl font-bold uppercase tracking-widest text-[#FFF8E1] z-50">
                    <span className="flex items-center gap-3">
                        <CrossroadsIcon className="w-6 h-6 text-[#D4AF37]" />
                        Conselho Real
                    </span>
                </NavLink>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-8">
                    <NavLinks />
                </div>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <NavLink
                                to="/membros/dashboard"
                                className="relative text-gray-400 hover:text-white transition-colors"
                                aria-label={`Você tem ${unreadCount} notificações não lidas`}
                            >
                                <BellIcon className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C0161D] text-xs font-bold text-white pointer-events-none">
                                        {unreadCount}
                                    </span>
                                )}
                            </NavLink>
                            {user.role === Role.ADM && <NavLink to="/adm/dashboard" className={`${navLinkClasses} text-sm uppercase hidden lg:block`}>Admin</NavLink>}
                            <NavLink to="/membros/dashboard" className="px-4 py-2 text-sm uppercase border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B0B0B] transition-colors duration-300 hidden sm:block">Área de Membros</NavLink>
                            <button onClick={handleLogout} className="px-4 py-2 text-sm uppercase bg-[#C0161D] text-[#FFF8E1] hover:bg-red-800 transition-colors duration-300 hidden sm:block">Sair</button>
                        </>
                    ) : (
                        <NavLink to="/login" className="px-4 py-2 text-sm uppercase border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B0B0B] transition-colors duration-300 hidden sm:block">Entrar</NavLink>
                    )}

                    {/* Mobile Menu Button */}
                    <div className="md:hidden z-50">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menu">
                            {isMenuOpen ? <XIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Panel */}
            <div className={`fixed inset-0 bg-[#0B0B0B] z-40 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
                <div className="flex flex-col items-center justify-center h-full pt-20">
                    <div className="flex flex-col items-center space-y-6">
                        <NavLinks isMobile={true} />
                    </div>
                    <div className="mt-12 w-full px-6 space-y-4 sm:hidden">
                        {user ? (
                            <>
                                <NavLink to="/membros/dashboard" onClick={() => setIsMenuOpen(false)} className="block w-full text-center px-4 py-3 text-lg uppercase border border-[#D4AF37] text-[#D4AF37]">Área de Membros</NavLink>
                                <button onClick={handleLogout} className="block w-full text-center px-4 py-3 text-lg uppercase bg-[#C0161D] text-[#FFF8E1]">Sair</button>
                            </>
                        ) : (
                            <NavLink to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center px-4 py-3 text-lg uppercase border border-[#D4AF37] text-[#D4AF37]">Entrar</NavLink>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

// FOOTER
export const Footer: React.FC = () => {
    return (
        <footer className="bg-[#0B0B0B] border-t border-[#1A1A1A] text-sm text-gray-400">
            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg text-[#FFF8E1] font-bold uppercase tracking-widest mb-4">Conselho Real</h3>
                        <p>Caridade com firmeza. Sete caminhos, um brilho.</p>
                    </div>
                    <div>
                        <h3 className="text-lg text-[#FFF8E1] font-bold uppercase tracking-widest mb-4">Links</h3>
                        <ul className="space-y-2">
                            <li><NavLink to="/lgpd" className="hover:text-[#D4AF37]">Política de Privacidade</NavLink></li>
                            <li><NavLink to="/termos" className="hover:text-[#D4AF37]">Termos de Uso</NavLink></li>
                            <li><NavLink to="/contato" className="hover:text-[#D4AF37]">Contato</NavLink></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg text-[#FFF8E1] font-bold uppercase tracking-widest mb-4">Contato</h3>
                        <p>Email: contato@conselhoreal.com</p>
                        <p>WhatsApp: +55 (11) 9XXXX-XXXX</p>
                    </div>
                </div>
                <div className="mt-8 border-t border-[#1A1A1A] pt-4 text-center">
                    <p>&copy; {new Date().getFullYear()} Conselho Real – 7 Encruzas & Brilhantina. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

// PROTECTED ROUTE
export const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: Role[] }> = ({ children, allowedRoles }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (!user) {
        return <div className="text-center p-12 text-[#C0161D]">Redirecionando para login...</div>;
    }

    if (!allowedRoles.includes(user.role)) {
        return <div className="text-center p-12 text-[#C0161D]">Acesso Negado. Você não tem permissão para ver esta página.</div>;
    }

    return <>{children}</>;
};

// EVENT MODAL
export const EventModal: React.FC<{ event: Event; onClose: () => void }> = ({ event, onClose }) => {
    const [isConfirming, setIsConfirming] = useState(false);

    const handleConfirm = async () => {
        setIsConfirming(true);
        // Simulate API call
        await new Promise(res => setTimeout(res, 1500));
        setIsConfirming(false);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative bg-[#1A1A1A] text-[#FFF8E1] w-full max-w-lg p-8 rounded-lg border border-[#333] shadow-lg shadow-black/50"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="event-modal-title"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <XIcon className="w-6 h-6" />
                </button>
                <span className={`px-3 py-1 text-xs uppercase rounded-full self-start ${event.type === 'Gira' ? 'bg-[#C0161D]' : 'bg-[#D4AF37] text-black'}`}>{event.type}</span>
                <h2 id="event-modal-title" className="text-3xl mt-4 font-bold">{event.title}</h2>
                <p className="text-gray-400 mt-2 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {event.date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div className="mt-6 text-sm">
                    <p className="flex justify-between items-center">
                        <span>Lotação: {event.attendees} / {event.capacity}</span>
                        <span>{Math.round((event.attendees / event.capacity) * 100)}%</span>
                    </p>
                    <div className="w-full bg-gray-700 h-2 rounded-full mt-1">
                        <div className="bg-[#D4AF37] h-2 rounded-full" style={{ width: `${(event.attendees / event.capacity) * 100}%` }}></div>
                    </div>
                </div>
                <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="mt-8 w-full text-center px-6 py-3 uppercase tracking-widest bg-[#D4AF37] text-[#0B0B0B] font-bold hover:bg-opacity-80 transition-all duration-300 flex justify-center items-center disabled:bg-opacity-50 disabled:cursor-not-allowed"
                >
                    {isConfirming ? <Spinner className="w-5 h-5" /> : 'Confirmar Presença'}
                </button>
            </div>
        </div>
    );
};


// CALENDAR GRID
interface CalendarGridProps {
    events: Event[];
}
export const CalendarGrid: React.FC<CalendarGridProps> = ({ events }) => {
    const [referenceDate, setReferenceDate] = useState(() => new Date());
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const today = new Date();
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);
    const blanks = useMemo(() => Array.from({ length: firstDay }, (_, i) => i), [firstDay]);

    const eventsByDay = useMemo(() => {
        const map = new Map<number, Event[]>();
        events.forEach(event => {
            const eventDate = new Date(event.date);
            if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
                const day = eventDate.getDate();
                map.set(day, [...(map.get(day) ?? []), event].sort((a, b) => {
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                }));
            }
        });
        return map;
    }, [events, month, year]);

    const eventStyles: Record<EventType, { badge: string; dot: string }> = {
        [EventType.GIRA]: {
            badge: 'border border-[#C0161D]/60 bg-[#C0161D]/15 text-[#FFEADA]',
            dot: 'bg-[#C0161D]',
        },
        [EventType.ATENDIMENTO]: {
            badge: 'border border-[#D4AF37]/60 bg-[#D4AF37]/10 text-[#FCEFC3]',
            dot: 'bg-[#D4AF37]',
        },
        [EventType.ESTUDO]: {
            badge: 'border border-blue-500/60 bg-blue-900/30 text-blue-100',
            dot: 'bg-blue-400',
        },
        [EventType.MUTIRAO]: {
            badge: 'border border-green-500/60 bg-green-900/30 text-green-100',
            dot: 'bg-green-400',
        },
    };

    const getEventStyle = (type: EventType) => eventStyles[type] ?? { badge: 'border border-gray-600 bg-gray-700/40 text-gray-200', dot: 'bg-gray-400' };

    const handleMonthChange = (delta: number) => {
        setReferenceDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const handleToday = () => {
        setReferenceDate(new Date());
    };

    const monthLabel = referenceDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const isCurrentMonth = referenceDate.getMonth() === today.getMonth() && referenceDate.getFullYear() === today.getFullYear();
    const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const legendItems: EventType[] = [EventType.GIRA, EventType.ATENDIMENTO, EventType.ESTUDO, EventType.MUTIRAO];

    return (
        <>
            <div className="max-w-4xl mx-auto bg-[#111]/70 p-4 sm:p-6 rounded-2xl border border-[#1A1A1A] shadow-lg shadow-black/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Agenda Sagrada</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={() => handleMonthChange(-1)}
                            className="px-2 sm:px-3 py-1 rounded-md border border-[#2A2A2A] text-xs sm:text-sm text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/60 transition"
                        >
                            ← Mês anterior
                        </button>
                        <button
                            type="button"
                            onClick={handleToday}
                            disabled={isCurrentMonth}
                            className={`px-2 sm:px-3 py-1 rounded-md border text-xs sm:text-sm transition ${isCurrentMonth ? 'border-[#2A2A2A] text-gray-600 cursor-not-allowed' : 'border-[#D4AF37]/60 text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}
                        >
                            Hoje
                        </button>
                        <button
                            type="button"
                            onClick={() => handleMonthChange(1)}
                            className="px-2 sm:px-3 py-1 rounded-md border border-[#2A2A2A] text-xs sm:text-sm text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/60 transition"
                        >
                            Próximo mês →
                        </button>
                    </div>
                </div>

                <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#FFF8E1] capitalize">{monthLabel}</h3>
                    <p className="text-xs sm:text-sm text-gray-400">Clique em um evento para ver detalhes e confirmar presença.</p>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {weekDayLabels.map(label => (
                        <div key={label} className="py-2">{label}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {blanks.map(b => (
                        <div
                            key={`blank-${b}`}
                            className="min-h-[4.25rem] sm:min-h-[5.25rem] rounded-xl border border-transparent bg-transparent"
                        ></div>
                    ))}
                    {days.map(day => {
                        const eventsForDay = eventsByDay.get(day) ?? [];
                        const isToday = day === today.getDate() && isCurrentMonth;
                        return (
                            <div
                                key={day}
                                className={`min-h-[4.25rem] sm:min-h-[5.25rem] p-1.5 sm:p-2 rounded-xl border ${isToday ? 'border-[#D4AF37] bg-[#D4AF37]/8' : 'border-[#1F1F1F] bg-black/20'} flex flex-col gap-1 transition hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5`}
                            >
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span className={isToday ? 'text-[#D4AF37] font-semibold' : ''}>{day}</span>
                                    {eventsForDay.length > 1 && (
                                        <span className="text-[10px] text-gray-500">{eventsForDay.length} eventos</span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    {eventsForDay.slice(0, 3).map(event => {
                                        const style = getEventStyle(event.type);
                                        return (
                                            <button
                                                key={event.id}
                                                type="button"
                                                onClick={() => setSelectedEvent(event)}
                                                className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg text-[10px] sm:text-[11px] text-left truncate ${style.badge} transition hover:scale-[1.02]`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                                                <span className="truncate">{event.title}</span>
                                            </button>
                                        );
                                    })}
                                    {eventsForDay.length > 3 && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedEvent(eventsForDay[0])}
                                            className="text-[10px] text-gray-400 text-left hover:text-[#D4AF37]"
                                        >
                                            +{eventsForDay.length - 3} eventos
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-5 border-t border-[#1F1F1F] pt-4">
                    <h4 className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">Legenda</h4>
                    <div className="flex flex-wrap gap-3">
                        {legendItems.map(type => {
                            const style = getEventStyle(type);
                            return (
                                <div key={type} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`}></span>
                                    <span className="text-[11px] uppercase tracking-wide text-gray-200">{type}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
        </>
    );
};

// EVENT FORM MODAL
export const EventFormModal: React.FC<{
    event: Omit<Event, 'id' | 'attendees'> | Event | null;
    onClose: () => void;
    onSave: (eventData: Omit<Event, 'id' | 'attendees'>) => void;
}> = ({ event, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<EventType>(EventType.GIRA);
    const [date, setDate] = useState('');
    const [capacity, setCapacity] = useState(50);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setType(event.type);
            setDate(new Date(event.date).toISOString().split('T')[0]);
            setCapacity(event.capacity);
        } else {
            setTitle('');
            setType(EventType.GIRA);
            setDate('');
            setCapacity(50);
        }
    }, [event]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await Promise.resolve(onSave({ title, type, date: new Date(`${date}T12:00:00`), capacity }));
        } catch (error) {
            console.error('[EventFormModal] Falha ao salvar evento', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative bg-[#1A1A1A] text-[#FFF8E1] w-full max-w-lg p-8 rounded-lg border border-[#333] shadow-lg shadow-black/50" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold mb-6">{event ? 'Editar Evento' : 'Adicionar Novo Evento'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="event-title" className="block text-sm uppercase tracking-wider mb-2">Título</label>
                        <input id="event-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="event-type" className="block text-sm uppercase tracking-wider mb-2">Tipo</label>
                            <select id="event-type" value={type} onChange={e => setType(e.target.value as EventType)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none">
                                {Object.values(EventType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="event-capacity" className="block text-sm uppercase tracking-wider mb-2">Lotação</label>
                            <input id="event-capacity" type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="event-date" className="block text-sm uppercase tracking-wider mb-2">Data</label>
                        <input id="event-date" type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none text-gray-400" required />
                    </div>
                    <div className="pt-4 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 uppercase tracking-widest border border-gray-600 text-gray-400">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 uppercase tracking-widest bg-[#D4AF37] text-[#0B0B0B] font-bold flex justify-center items-center w-32 disabled:bg-opacity-50 disabled:cursor-not-allowed">
                            {isSaving ? <Spinner className="w-5 h-5" /> : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// USER FORM MODAL
export const UserFormModal: React.FC<{
    user: User | null;
    onClose: () => void;
    onSave: (userData: Omit<User, 'id'>) => void;
    errorMessage?: string;
    onClearError?: () => void;
}> = ({ user, onClose, onSave, errorMessage, onClearError }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>(Role.MEMBRO);
    const [memberSince, setMemberSince] = useState('');
    const [allergies, setAllergies] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role);
            setMemberSince(user.memberSince ?? '');
            setAllergies(user.allergies ?? '');
        } else {
            setName('');
            setEmail('');
            setRole(Role.MEMBRO);
            setMemberSince('');
            setAllergies('');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await Promise.resolve(onSave({
                name,
                email,
                role,
                memberSince: memberSince || undefined,
                allergies: allergies || undefined,
            }));
        } catch (error) {
            console.error('[UserFormModal] Falha ao salvar usuário', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative bg-[#1A1A1A] text-[#FFF8E1] w-full max-w-2xl p-8 rounded-lg border border-[#333] shadow-lg shadow-black/50" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold mb-6">{user ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="user-name" className="block text-sm uppercase tracking-wider mb-2">Nome completo</label>
                            <input
                                id="user-name"
                                type="text"
                                value={name}
                                onChange={e => {
                                    onClearError?.();
                                    setName(e.target.value);
                                }}
                                className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="user-email" className="block text-sm uppercase tracking-wider mb-2">Email</label>
                            <input
                                id="user-email"
                                type="email"
                                value={email}
                                onChange={e => {
                                    onClearError?.();
                                    setEmail(e.target.value);
                                }}
                                className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="user-role" className="block text-sm uppercase tracking-wider mb-2">Perfil</label>
                            <select
                                id="user-role"
                                value={role}
                                onChange={e => {
                                    onClearError?.();
                                    setRole(e.target.value as Role);
                                }}
                                className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none"
                            >
                                <option value={Role.MEMBRO}>Membro</option>
                                <option value={Role.ADM}>Administrador</option>
                                <option value={Role.VISITANTE}>Visitante</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="user-memberSince" className="block text-sm uppercase tracking-wider mb-2">Membro desde</label>
                            <input
                                id="user-memberSince"
                                type="date"
                                value={memberSince}
                                onChange={e => {
                                    onClearError?.();
                                    setMemberSince(e.target.value);
                                }}
                                className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none text-gray-400"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="user-allergies" className="block text-sm uppercase tracking-wider mb-2">Alergias/Observações</label>
                        <textarea
                            id="user-allergies"
                            value={allergies}
                            onChange={e => {
                                onClearError?.();
                                setAllergies(e.target.value);
                            }}
                            rows={3}
                            className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none"
                            placeholder="Ex: lactose, amendoim..."
                        ></textarea>
                    </div>
                    {errorMessage && (
                        <p className="text-[#C0161D] text-sm bg-[#C0161D]/10 border border-[#C0161D]/40 p-3 rounded-md">{errorMessage}</p>
                    )}
                    <div className="pt-4 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 uppercase tracking-widest border border-gray-600 text-gray-400">Cancelar</button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2 uppercase tracking-widest bg-[#D4AF37] text-[#0B0B0B] font-bold flex justify-center items-center w-40 disabled:bg-opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Spinner className="w-5 h-5" /> : user ? 'Salvar Usuário' : 'Cadastrar Usuário'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ENTITY FORM MODAL
export const EntityFormModal: React.FC<{
    entity: MemberEntity | null;
    onClose: () => void;
    onSave: (entityData: Omit<MemberEntity, 'id' | 'userId'>) => void;
}> = ({ entity, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [line, setLine] = useState('');
    const [history, setHistory] = useState('');
    const [curiosities, setCuriosities] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (entity) {
            setName(entity.name);
            setLine(entity.line);
            setHistory(entity.history);
            setCuriosities(entity.curiosities);
        } else {
            setName('');
            setLine('');
            setHistory('');
            setCuriosities('');
        }
    }, [entity]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await Promise.resolve(onSave({ name, line, history, curiosities }));
        } catch (error) {
            console.error('[EntityFormModal] Falha ao salvar entidade de membro', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative bg-[#1A1A1A] text-[#FFF8E1] w-full max-w-2xl p-8 rounded-lg border border-[#333] shadow-lg shadow-black/50" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold mb-6">{entity ? 'Editar Entidade do Membro' : 'Adicionar Nova Entidade'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="entity-name" className="block text-sm uppercase tracking-wider mb-2">Nome</label>
                            <input id="entity-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" required />
                        </div>
                        <div>
                            <label htmlFor="entity-line" className="block text-sm uppercase tracking-wider mb-2">Linha</label>
                            <input id="entity-line" type="text" value={line} onChange={e => setLine(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="entity-history" className="block text-sm uppercase tracking-wider mb-2">História</label>
                        <textarea id="entity-history" value={history} onChange={e => setHistory(e.target.value)} rows={4} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" required />
                    </div>
                    <div>
                        <label htmlFor="entity-curiosities" className="block text-sm uppercase tracking-wider mb-2">Curiosidades</label>
                        <textarea id="entity-curiosities" value={curiosities} onChange={e => setCuriosities(e.target.value)} rows={3} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" required />
                    </div>
                    <div className="pt-4 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 uppercase tracking-widest border border-gray-600 text-gray-400">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 uppercase tracking-widest bg-[#D4AF37] text-[#0B0B0B] font-bold flex justify-center items-center w-32 disabled:bg-opacity-50 disabled:cursor-not-allowed">
                            {isSaving ? <Spinner className="w-5 h-5" /> : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// RICH TEXT EDITOR
const RichTextEditor: React.FC<{ value: string; onChange: (value: string) => void; }> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
        const newHtml = event.currentTarget.innerHTML;
        if (value !== newHtml) {
            onChange(newHtml);
        }
    };

    const handleCommand = (command: string) => {
        document.execCommand(command, false, undefined);
        editorRef.current?.focus();
        if (editorRef.current) {
            const newHtml = editorRef.current.innerHTML;
            if (value !== newHtml) {
                onChange(newHtml);
            }
        }
    };

    const ToolbarButton: React.FC<{ onClick: () => void; children: React.ReactNode; 'aria-label': string }> = ({ onClick, children, 'aria-label': ariaLabel }) => (
        <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={onClick}
            className="p-2 text-gray-300 hover:bg-[#333] hover:text-white rounded-md transition-colors"
            aria-label={ariaLabel}
        >
            {children}
        </button>
    );

    return (
        <div className="bg-[#0B0B0B] border border-[#333] focus-within:border-[#D4AF37] rounded-md overflow-hidden transition-colors">
            <div className="toolbar p-1 bg-[#1f1f1f] border-b border-[#333] flex items-center gap-1 flex-wrap">
                <ToolbarButton onClick={() => handleCommand('bold')} aria-label="Negrito"><BoldIcon className="w-4 h-4" /></ToolbarButton>
                <ToolbarButton onClick={() => handleCommand('italic')} aria-label="Itálico"><ItalicIcon className="w-4 h-4" /></ToolbarButton>
                <ToolbarButton onClick={() => handleCommand('underline')} aria-label="Sublinhado"><UnderlineIcon className="w-4 h-4" /></ToolbarButton>
                <div className="w-px h-5 bg-[#333] mx-1"></div>
                <ToolbarButton onClick={() => handleCommand('insertUnorderedList')} aria-label="Lista não ordenada"><ListIcon className="w-4 h-4" /></ToolbarButton>
                <ToolbarButton onClick={() => handleCommand('insertOrderedList')} aria-label="Lista ordenada"><ListOrderedIcon className="w-4 h-4" /></ToolbarButton>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="w-full p-3 min-h-[150px] focus:outline-none"
                dangerouslySetInnerHTML={{ __html: value }}
            />
        </div>
    );
};

// SPIRITUAL ENTITY FORM MODAL
export const SpiritualEntityFormModal: React.FC<{
    entity: SpiritualEntity | null;
    onClose: () => void;
    onSave: (entityData: Omit<SpiritualEntity, 'id' | 'descriptionHistory'>) => void;
}> = ({ entity, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [line, setLine] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (entity) {
            setName(entity.name);
            setLine(entity.line);
            setDescription(entity.description);
        } else {
            setName('');
            setLine('');
            setDescription('');
        }
    }, [entity]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await Promise.resolve(onSave({ name, line, description }));
        } catch (error) {
            console.error('[SpiritualEntityFormModal] Falha ao salvar entidade espiritual', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative bg-[#1A1A1A] text-[#FFF8E1] w-full max-w-2xl p-8 rounded-lg border border-[#333] shadow-lg shadow-black/50" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold mb-6">{entity ? 'Editar Entidade Espiritual' : 'Adicionar Nova Entidade Espiritual'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="spiritual-entity-name" className="block text-sm uppercase tracking-wider mb-2">Nome</label>
                            <input id="spiritual-entity-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" required />
                        </div>
                        <div>
                            <label htmlFor="spiritual-entity-line" className="block text-sm uppercase tracking-wider mb-2">Linha</label>
                            <input id="spiritual-entity-line" type="text" value={line} onChange={e => setLine(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm uppercase tracking-wider mb-2">Descrição</label>
                        <RichTextEditor value={description} onChange={setDescription} />
                    </div>
                    <div className="pt-4 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 uppercase tracking-widest border border-gray-600 text-gray-400">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 uppercase tracking-widest bg-[#D4AF37] text-[#0B0B0B] font-bold flex justify-center items-center w-32 disabled:bg-opacity-50 disabled:cursor-not-allowed">
                            {isSaving ? <Spinner className="w-5 h-5" /> : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// DESCRIPTION HISTORY MODAL
export const DescriptionHistoryModal: React.FC<{
    entity: SpiritualEntity | null;
    onClose: () => void;
}> = ({ entity, onClose }) => {
    if (!entity) return null;

    const sortedHistory = useMemo(() => {
        return [...(entity.descriptionHistory || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [entity.descriptionHistory]);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative bg-[#1A1A1A] text-[#FFF8E1] w-full max-w-3xl p-8 rounded-lg border border-[#333] shadow-lg shadow-black/50 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold mb-6 flex-shrink-0">Histórico de Alterações: <span className="text-[#D4AF37]">{entity.name}</span></h2>
                <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                    {sortedHistory.length > 0 ? (
                        sortedHistory.map((item, index) => (
                            <div key={index} className="border-b border-[#333] pb-4 last:border-b-0">
                                <p className="text-sm font-bold text-gray-400 mb-2">
                                    Alterado em: {new Date(item.timestamp).toLocaleString('pt-BR')}
                                </p>
                                <div
                                    className="prose-styles bg-[#0B0B0B] p-3 rounded-md border border-[#333]"
                                    dangerouslySetInnerHTML={{ __html: item.description }}
                                />
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-8">Nenhuma alteração registrada.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// PRIVATE MESSAGE MODAL
export const PrivateMessageModal: React.FC<{
    user: User | null;
    onClose: () => void;
    onSend: (message: string) => void;
}> = ({ user, onClose, onSend }) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    if (!user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        setIsSending(true);
        try {
            await Promise.resolve(onSend(message));
            setMessage('');
        } catch (error) {
            console.error('[PrivateMessageModal] Falha ao enviar mensagem', error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative bg-[#1A1A1A] text-[#FFF8E1] w-full max-w-lg p-8 rounded-lg border border-[#333] shadow-lg shadow-black/50" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold mb-6">Enviar Mensagem Privada</h2>
                <p className="mb-4">Para: <span className="font-bold text-[#D4AF37]">{user.name}</span></p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Digite sua mensagem aqui..."
                        rows={6}
                        className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none"
                        required
                    ></textarea>
                    <div className="pt-4 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 uppercase tracking-widest border border-gray-600 text-gray-400">Cancelar</button>
                        <button type="submit" disabled={isSending} className="px-6 py-2 uppercase tracking-widest bg-[#D4AF37] text-[#0B0B0B] font-bold flex justify-center items-center w-32 disabled:bg-opacity-50 disabled:cursor-not-allowed">
                            {isSending ? <Spinner className="w-5 h-5" /> : 'Enviar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// CONFIRMATION MODAL
export const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (isOpen) {
            setCountdown(5); // Reset countdown when modal opens
            const timer = setInterval(() => {
                setCountdown(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative bg-[#1A1A1A] text-[#FFF8E1] w-full max-w-lg p-8 rounded-lg border border-[#C0161D]/50 shadow-lg shadow-black/50" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-[#C0161D]">{title}</h2>
                <div className="mt-4 text-gray-300">{message}</div>
                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 uppercase tracking-widest border border-gray-600 text-gray-400">Cancelar</button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={countdown > 0}
                        className="px-6 py-2 uppercase tracking-widest bg-[#C0161D] text-white font-bold flex justify-center items-center w-48 disabled:bg-red-900/50 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                        {countdown > 0 ? `Aguarde (${countdown}s)` : 'Confirmar Exclusão'}
                    </button>
                </div>
            </div>
        </div>
    );
};