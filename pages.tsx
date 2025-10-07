import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store/store';
import { loginSuccess } from './store/authSlice';
import { MOCK_EVENTS, MOCK_ANNOUNCEMENTS, MOCK_PRAYER_REQUESTS, MOCK_USERS, MOCK_DIARY_ENTRIES, MOCK_ENTITIES, MOCK_LORE, MOCK_RECADOS, MOCK_MEMBER_ENTITIES, MOCK_USER_CREDENTIALS } from './data';
import {
    listEvents,
    saveEvent,
    deleteEvent,
    listAnnouncements,
    createAnnouncement,
    listPrayerRequests,
    createPrayerRequest,
    listGalleryImages,
    createGalleryImage,
    authenticateUser,
    getUserByEmail,
    listDiaryEntries,
    saveDiaryEntry,
    deleteDiaryEntry,
    listRecados,
    createRecado,
    toggleRecadoRead,
    markRecadosAsRead,
    listMemberEntities,
    saveMemberEntity,
    deleteMemberEntity,
    listUsers,
    saveUser,
    deleteUser,
    listSpiritualEntities,
    saveSpiritualEntity,
    deleteSpiritualEntity,
    appendSpiritualEntityHistory,
    listLoreEntries
} from './supabase/dataService';
import { getSupabaseClient, isSupabaseConfigured } from './supabase/client';
import { CrownIcon, TridentIcon, MalandroHatIcon, SparkleIcon, CrossroadsIcon, BellIcon, CalendarIcon, UserIcon, CalendarGrid, EditIcon, TrashIcon, FileIcon, Spinner, BotMessageSquareIcon, XIcon, EventFormModal, PrivateMessageModal, ConfirmationModal, EntityFormModal, SpiritualEntityFormModal, DownloadIcon, HistoryIcon, DescriptionHistoryModal, UserFormModal } from './components';
import { EventType, DiaryEntry, ImageCategory, GalleryImage, Role, Event, User, MemberEntity, SpiritualEntity, PrayerRequest, Announcement, Recado, LoreEntry } from './types';

const PrayerRequestForm: React.FC<{ showTitle?: boolean; formIdSuffix?: string; onSubmitted?: (request: PrayerRequest) => void }> = ({ showTitle = false, formIdSuffix = 'form', onSubmitted }) => {
    const [nameInput, setNameInput] = useState('');
    const [prayerRequest, setPrayerRequest] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prayerRequest.trim()) {
            setSubmitMessage('Descreva seu pedido antes de enviar.');
            setSubmitStatus('error');
            setTimeout(() => {
                setSubmitMessage('');
                setSubmitStatus('idle');
            }, 3000);
            return;
        }
        setIsSubmitting(true);
        setSubmitMessage('');
        setSubmitStatus('idle');
        try {
            const initials = nameInput
                ? nameInput
                    .trim()
                    .split(/\s+/)
                    .map(part => part[0]?.toUpperCase())
                    .filter(Boolean)
                    .slice(0, 3)
                    .join('')
                : 'Anônimo';

            const created = await createPrayerRequest({
                initials,
                request: prayerRequest,
            });

            setSubmitMessage('Pedido enviado com sucesso!');
            setSubmitStatus('success');
            onSubmitted?.(created);
            setPrayerRequest('');
            setNameInput('');
        } catch (error) {
            console.error('[PrayerRequestForm] erro ao enviar pedido', error);
            setSubmitMessage('Não foi possível enviar o pedido. Tente novamente em instantes.');
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => {
                setSubmitMessage('');
                setSubmitStatus('idle');
            }, 3000);
        }
    };

    return (
        <div className="max-w-2xl mx-auto text-center">
            {showTitle && <h1 className="text-4xl font-bold text-center uppercase tracking-widest mb-4">Deixe seu Pedido</h1>}
            <p className="mb-8">Seu pedido será entregue ao congá com todo respeito e fé. Se autorizado, será incluído em nossas correntes de oração coletiva.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Nome Completo (Opcional)"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="w-full bg-[#1A1A1A] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none"
                />

                <div className="text-left p-4 bg-[#0B0B0B] border border-[#333] rounded-lg text-sm text-gray-400 space-y-2">
                    <p>Reserve um momento de silêncio, respire fundo e escreva com sinceridade o que deseja entregar ao congá.</p>
                    <p className="text-xs text-gray-500">Se quiser, anote palavras-chave em um papel antes de registrar o pedido completo aqui.</p>
                </div>

                <textarea placeholder="Pedido / Intenção" rows={5} value={prayerRequest} onChange={e => setPrayerRequest(e.target.value)} className="w-full bg-[#1A1A1A] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none"></textarea>
                <div className="flex items-center justify-center gap-2">
                    <input type="checkbox" id={`auth-${formIdSuffix}`} className="accent-[#D4AF37]" />
                    <label htmlFor={`auth-${formIdSuffix}`}>Autorizo oração no círculo coletivo</label>
                </div>
                <button type="submit" disabled={isSubmitting || !prayerRequest.trim()} className="w-full px-8 py-3 uppercase tracking-widest bg-[#C0161D] text-[#FFF8E1] font-bold hover:bg-opacity-80 transition-all duration-300 flex justify-center items-center disabled:bg-opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? <Spinner className="w-5 h-5" /> : 'Enviar ao Congá'}
                </button>
                {submitMessage && (
                    <p className={`${submitStatus === 'error' ? 'text-red-400' : 'text-green-400'} text-sm mt-2`}>
                        {submitMessage}
                    </p>
                )}
            </form>
        </div>
    );
};


// HOME PAGE
const Hero = () => (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B0B0B]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-[#0B0B0B]"></div>
        <div className="absolute inset-0 bg-radial-gradient(ellipse_at_center,rgba(11,11,11,0)_0%,#0B0B0B_80%)"></div>

        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 opacity-10">
            <CrownIcon className="w-32 h-32 md:w-64 md:h-64 text-[#D4AF37]" />
            <TridentIcon className="w-24 h-24 md:w-48 md:h-48 text-[#D4AF37] absolute top-1/2 left-1/2 -translate-x-1/2" />
        </div>

        <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 opacity-10">
            <MalandroHatIcon className="w-32 h-32 md:w-64 md:h-64 text-[#FFF8E1]" />
            <SparkleIcon className="w-8 h-8 md:w-16 md:h-16 text-[#D4AF37] absolute top-1/4 right-1/4 animate-pulse" />
        </div>

        <div className="relative z-10 text-center p-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-widest uppercase text-shadow-gold">
                Conselho Real
            </h1>
            <h2 className="text-2xl md:text-4xl tracking-wider uppercase text-shadow-gold">7 Encruzas & Brilhantina</h2>
            <p className="mt-6 text-lg md:text-xl text-[#FFF8E1] tracking-wider">
                Caridade com firmeza. Sete caminhos, um brilho.
            </p>
            <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
                <NavLink to="/sobre" className="px-8 py-3 uppercase tracking-widest bg-[#D4AF37] text-[#0B0B0B] font-bold hover:bg-opacity-80 transition-all duration-300">Conheça o Terreiro</NavLink>
                <NavLink to="/agenda" className="px-8 py-3 uppercase tracking-widest border border-[#C0161D] text-[#C0161D] font-bold hover:bg-[#C0161D] hover:text-[#FFF8E1] transition-all duration-300">Ver Agenda</NavLink>
                <NavLink to="/login" className="px-8 py-3 uppercase tracking-widest border border-[#FFF8E1] text-[#FFF8E1] font-bold hover:bg-[#FFF8E1] hover:text-[#0B0B0B] transition-all duration-300">Entrar</NavLink>
            </div>
        </div>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <section className={`py-20 px-6 container mx-auto ${className}`}>
        <h2 className="text-4xl font-bold text-center uppercase tracking-widest mb-12 relative pb-4 after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:w-24 after:h-px after:bg-[#D4AF37]">
            {title}
        </h2>
        {children}
    </section>
);


export const HomePage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState<string | null>(null);

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(true);
    const [announcementsError, setAnnouncementsError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const loadEvents = async () => {
            setEventsLoading(true);
            try {
                const data = await listEvents();
                if (!active) return;
                setEvents(data);
                setEventsError(null);
            } catch (error) {
                console.error('[HomePage] Erro ao carregar eventos', error);
                if (active) {
                    setEventsError('Não foi possível carregar a agenda no momento.');
                }
            } finally {
                if (active) {
                    setEventsLoading(false);
                }
            }
        };

        loadEvents();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        const loadAnnouncements = async () => {
            setAnnouncementsLoading(true);
            try {
                const data = await listAnnouncements();
                if (!active) return;
                setAnnouncements(data);
                setAnnouncementsError(null);
            } catch (error) {
                console.error('[HomePage] Erro ao carregar avisos', error);
                if (active) {
                    setAnnouncementsError('Não foi possível carregar os avisos agora.');
                }
            } finally {
                if (active) {
                    setAnnouncementsLoading(false);
                }
            }
        };

        loadAnnouncements();
        return () => {
            active = false;
        };
    }, []);

    return (
        <div>
            <Hero />

            <Section title="Sobre o Projeto">
                <div className="grid md:grid-cols-2 gap-12 text-lg text-justify leading-relaxed">
                    <p>O Conselho Real é um Templo de Umbanda Sagrada que trabalha sob a regência de Exu Rei das Sete Encruzilhadas e Mestre Zé da Brilhantina. Nossa missão é a prática da caridade pura e desinteressada, oferecendo amparo espiritual, orientação e um porto seguro para todos que buscam evolução e auxílio.</p>
                    <p>Nossos pilares são a firmeza, o respeito e a disciplina. Acreditamos que através do estudo contínuo da doutrina, da dedicação dos médiuns e do amor incondicional das nossas entidades, podemos construir um caminho de luz, transformação e axé para todos os frequentadores da casa e para a comunidade ao nosso redor.</p>
                </div>
            </Section>

            <Section title="Agenda do Mês" className="bg-[#1A1A1A]/20">
                {eventsLoading ? (
                    <div className="text-center text-gray-400">Carregando agenda...</div>
                ) : eventsError ? (
                    <div className="text-center text-red-400">{eventsError}</div>
                ) : events.length === 0 ? (
                    <div className="text-center text-gray-400">Nenhum evento programado por enquanto. Volte em breve!</div>
                ) : (
                    <CalendarGrid events={events} />
                )}
            </Section>

            <Section title="Últimos Avisos">
                <div className="space-y-6 max-w-4xl mx-auto">
                    {announcementsLoading ? (
                        <div className="text-center text-gray-400">Carregando avisos...</div>
                    ) : announcementsError ? (
                        <div className="text-center text-red-400">{announcementsError}</div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center text-gray-400">Nenhum aviso publicado ainda.</div>
                    ) : (
                        announcements.map(ann => (
                            <div key={ann.id} className="bg-[#1A1A1A]/50 p-6 border-l-4 border-[#C0161D] flex items-start gap-4">
                                <BellIcon className="w-8 h-8 text-[#C0161D] flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-xl font-bold text-[#FFF8E1]">{ann.title}</h3>
                                    <p className="text-gray-300 mt-2">{ann.content}</p>
                                    <p className="text-xs text-gray-500 mt-4">{ann.date}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Section>

            <Section title="Deixe seu Pedido" className="bg-[#1A1A1A]/20">
                <PrayerRequestForm formIdSuffix="home" />
            </Section>
        </div>
    );
};

// AGENDA PAGE
export const AgendaPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<number | null>(null);

    useEffect(() => {
        let active = true;
        const loadEvents = async () => {
            setIsLoading(true);
            try {
                const data = await listEvents();
                if (!active) return;
                setEvents(data);
                setErrorMessage(null);
            } catch (error) {
                console.error('[AgendaPage] Erro ao carregar eventos', error);
                if (active) {
                    setErrorMessage('Não foi possível carregar os eventos agora.');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadEvents();
        return () => {
            active = false;
        };
    }, []);

    const handleParticipate = async (eventId: number) => {
        const event = events.find(evt => evt.id === eventId);
        if (!event) return;

        setConfirmingId(eventId);
        try {
            const updated = await saveEvent({
                id: event.id,
                title: event.title,
                type: event.type,
                date: event.date,
                capacity: event.capacity,
                attendees: event.attendees + 1,
            });
            setEvents(prev => prev.map(evt => (evt.id === updated.id ? updated : evt)));
        } catch (error) {
            console.error('[AgendaPage] Erro ao confirmar participação', error);
            setErrorMessage('Não foi possível confirmar presença. Tente novamente.');
        } finally {
            setConfirmingId(null);
        }
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-center uppercase tracking-widest mb-12">Agenda de Eventos</h1>
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-center uppercase tracking-widest mb-6">Calendário do Mês</h2>
                {isLoading ? (
                    <div className="text-center text-gray-400">Carregando agenda...</div>
                ) : errorMessage ? (
                    <div className="text-center text-red-400">{errorMessage}</div>
                ) : events.length === 0 ? (
                    <div className="text-center text-gray-400">Nenhum evento programado por enquanto.</div>
                ) : (
                    <CalendarGrid events={events} />
                )}
            </div>
            <h2 className="text-2xl font-bold text-center uppercase tracking-widest mb-6">Próximos Eventos</h2>
            {isLoading ? (
                <div className="text-center text-gray-400">Carregando lista de eventos...</div>
            ) : errorMessage ? (
                <div className="text-center text-red-400">{errorMessage}</div>
            ) : events.length === 0 ? (
                <div className="text-center text-gray-400">Nenhum evento listado.</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {events.map(event => (
                        <div key={event.id} className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333] flex flex-col">
                            <span className={`px-3 py-1 text-xs uppercase rounded-full self-start ${event.type === EventType.GIRA ? 'bg-[#C0161D]' : 'bg-[#D4AF37] text-black'}`}>{event.type}</span>
                            <h3 className="text-2xl mt-4">{event.title}</h3>
                            <p className="text-gray-400 mt-2">{event.date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <div className="mt-4 text-sm">
                                <p>Lotação: {event.attendees} / {event.capacity}</p>
                                <div className="w-full bg-gray-700 h-2 rounded-full mt-1">
                                    <div className="bg-[#D4AF37] h-2 rounded-full" style={{ width: `${Math.min(100, (event.attendees / Math.max(1, event.capacity)) * 100)}%` }}></div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleParticipate(event.id)}
                                disabled={confirmingId === event.id}
                                className="mt-auto pt-6 w-full text-center px-6 py-2 uppercase tracking-widest bg-[#D4AF37] text-[#0B0B0B] font-bold hover:bg-opacity-80 transition-all duration-300 flex justify-center items-center disabled:bg-opacity-50 disabled:cursor-not-allowed"
                            >
                                {confirmingId === event.id ? <Spinner className="w-5 h-5" /> : 'Participar'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// PEDIDOS PAGE
export const PedidosPage: React.FC = () => {
    const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const supabaseReady = isSupabaseConfigured();

    useEffect(() => {
        let active = true;

        const fetchRequests = async () => {
            try {
                setIsLoading(true);
                const data = await listPrayerRequests();
                if (active) {
                    setPrayerRequests(data);
                    setErrorMessage(null);
                }
            } catch (error) {
                console.error('[PedidosPage] erro ao carregar pedidos', error);
                if (active) {
                    setErrorMessage('Não foi possível carregar os pedidos no momento. Tente novamente mais tarde.');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        fetchRequests();

        return () => {
            active = false;
        };
    }, []);

    const handleRequestSubmitted = (request: PrayerRequest) => {
        setPrayerRequests(prev => [request, ...prev]);
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="mb-6">
                {!supabaseReady && (
                    <div className="mb-6 p-4 bg-[#1A1A1A]/60 border border-dashed border-[#D4AF37]/50 rounded-md text-sm text-gray-300">
                        <p>
                            Conecte as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> para enviar os pedidos diretamente ao Supabase.
                            Enquanto isso, estamos exibindo dados locais de demonstração.
                        </p>
                    </div>
                )}
                <PrayerRequestForm showTitle={true} formIdSuffix="pedidos" onSubmitted={handleRequestSubmitted} />
            </div>

            <h2 className="text-4xl font-bold text-center uppercase tracking-widest mb-12 relative pb-4 after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:w-24 after:h-px after:bg-[#D4AF37]">
                Mural de Pedidos e Agradecimentos
            </h2>

            {isLoading ? (
                <div className="text-center text-gray-400">Carregando pedidos...</div>
            ) : errorMessage ? (
                <div className="text-center text-red-400">{errorMessage}</div>
            ) : prayerRequests.length === 0 ? (
                <div className="text-center text-gray-400">Ainda não há pedidos registrados. Seja o primeiro a compartilhar uma intenção.</div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {prayerRequests.map(req => (
                        <div key={req.id} className="bg-[#1A1A1A] p-6 rounded-lg border-t-2 border-[#D4AF37]">
                            <p className="italic">"{req.request}"</p>
                            <p className="text-right mt-4 font-bold text-[#D4AF37]">- {req.initials}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// DOAÇÕES PAGE
export const DoacoesPage: React.FC = () => {
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleAmountSelect = (amount: number | 'other') => {
        if (amount === 'other') {
            setShowCustomInput(true);
            setSelectedAmount(null);
            setCustomAmount('');
        } else {
            setShowCustomInput(false);
            setSelectedAmount(amount);
            setCustomAmount('');
        }
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setCustomAmount(value);
            const parsedValue = parseFloat(value);
            if (!isNaN(parsedValue) && parsedValue > 0) {
                setSelectedAmount(parsedValue);
            } else {
                setSelectedAmount(null);
            }
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 text-center">
            <h1 className="text-4xl font-bold text-center uppercase tracking-widest mb-4">Faça sua Doação</h1>
            <p className="max-w-3xl mx-auto text-gray-300 mb-8">Sua contribuição é fundamental para a manutenção do nosso espaço sagrado e para a continuidade dos nossos trabalhos de caridade. Todo valor é bem-vindo. Axé!</p>

            <div className="max-w-3xl mx-auto mb-12 p-4 bg-[#1A1A1A]/50 border-l-4 border-[#D4AF37] text-left rounded-r-lg">
                <h3 className="font-bold text-lg text-[#D4AF37]">Como sua doação é utilizada?</h3>
                <p className="text-gray-300 mt-2 text-sm">
                    Os valores arrecadados são integralmente destinados à compra de materiais de uso comum (velas, ervas, bebidas rituais), à manutenção da infraestrutura do terreiro (água, luz, reformas) e ao suporte de nossas ações sociais e de caridade na comunidade.
                </p>
            </div>

            <div className="bg-[#1A1A1A] p-8 inline-flex flex-col items-center rounded-lg border border-[#333]">
                <h3 className="text-2xl mb-4">PIX</h3>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=chave-pix-aleatoria`} alt="QR Code PIX" className="w-48 h-48 bg-white p-2 rounded-md" />
                <p className="mt-4 text-sm bg-[#0B0B0B] p-2 rounded">chave-pix-aleatoria@email.com</p>

                <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {[10, 20, 50].map(amount => (
                        <button
                            key={amount}
                            onClick={() => handleAmountSelect(amount)}
                            className={`px-4 py-2 border transition-colors duration-300 ${selectedAmount === amount && !showCustomInput ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'}`}
                        >
                            R$ {amount}
                        </button>
                    ))}
                    <button
                        onClick={() => handleAmountSelect('other')}
                        className={`px-4 py-2 border transition-colors duration-300 ${showCustomInput ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'}`}
                    >
                        Outro
                    </button>
                </div>

                {showCustomInput && (
                    <div className="mt-4 w-full transition-all duration-300">
                        <input
                            type="text"
                            inputMode="decimal"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            placeholder="Digite o valor"
                            className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none text-center"
                            autoFocus
                        />
                    </div>
                )}

                {selectedAmount !== null && selectedAmount > 0 && (
                    <div className="mt-6 w-full p-3 bg-green-900/30 border border-green-700/50 rounded-lg text-center transition-opacity duration-500">
                        <p className="font-bold text-[#D4AF37]">Valor selecionado: R$ {selectedAmount.toFixed(2).replace('.', ',')}</p>
                        <p className="text-xs text-gray-400">Obrigado por sua contribuição!</p>
                    </div>
                )}
            </div>
        </div>
    );
};


// SOBRE PAGE
export const SobrePage: React.FC = () => (
    <>
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-center uppercase tracking-widest mb-12">Nossa Doutrina</h1>
            <div className="max-w-4xl mx-auto space-y-6 text-lg leading-relaxed text-justify">
                <p>A Umbanda é uma religião brasileira, que sintetiza vários elementos das religiões africanas, cristãs, indígenas e do espiritismo. Fundamenta-se na crença em um Deus único (Olorum/Zambi) e na manifestação de espíritos de luz (Caboclos, Pretos Velhos, Crianças, Exus, Pombagiras, etc.) que trabalham para a caridade e a evolução espiritual da humanidade.</p>
                <h3 className="text-2xl pt-6">Nossos Símbolos</h3>
                <p><strong className="text-[#D4AF37]">Coroa:</strong> Representa a realeza e a autoridade de Exu Rei, o líder espiritual de nossa casa.</p>
                <p><strong className="text-[#D4AF37]">Encruzilhada (X) com o 7:</strong> Simboliza os sete caminhos, as sete linhas da Umbanda, e o domínio de Exu sobre todos eles. É o ponto de convergência de forças e decisões.</p>
                <p><strong className="text-[#D4AF37]">Tridente:</strong> Ferramenta de Exu que representa seu poder de movimentar energias, quebrar demandas e equilibrar os pólos positivo, negativo e neutro.</p>
                <p><strong className="text-[#D4AF37]">Brilho/Estrela:</strong> Alude à Mestre Zé da Brilhantina, à sua luz, sua alegria, sua astúcia e sua capacidade de iluminar os caminhos mais escuros com sabedoria.</p>
            </div>
        </div>
    </>
);

// GALLERY PAGE
export const GalleryPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [filter, setFilter] = useState('Todos');
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    // Form state for new image
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [altText, setAltText] = useState('');
    const [caption, setCaption] = useState('');
    const [category, setCategory] = useState<ImageCategory>(ImageCategory.TERREIRO);
    const [uploadError, setUploadError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const supabaseReady = isSupabaseConfigured();
    const supabaseClient = getSupabaseClient();

    useEffect(() => {
        let active = true;
        const loadImages = async () => {
            setIsLoading(true);
            try {
                const data = await listGalleryImages();
                if (!active) return;
                setImages(data);
                setLoadError(null);
            } catch (error) {
                console.error('[GalleryPage] Erro ao carregar galeria', error);
                if (active) {
                    setLoadError('Não foi possível carregar a galeria agora.');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadImages();
        return () => {
            active = false;
        };
    }, []);

    const categories = ['Todos', ...Object.values(ImageCategory)];

    const filteredImages = useMemo(() => {
        if (filter === 'Todos') {
            return images;
        }
        return images.filter(image => image.category === filter);
    }, [filter, images]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setUploadError('O arquivo é muito grande. Limite de 2MB.');
                setImageFile(null);
                e.target.value = '';
                return;
            }
            setImageFile(file);
            setUploadError('');
        }
    };

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile || !altText || !caption) {
            setUploadError('Todos os campos são obrigatórios.');
            return;
        }
        setIsUploading(true);

        try {
            let publicUrl: string;

            if (!supabaseReady || !supabaseClient) {
                // Fallback em desenvolvimento: utiliza URL temporária local
                publicUrl = URL.createObjectURL(imageFile);
            } else {
                const fileExt = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg';
                const filePath = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

                const { error: uploadError } = await supabaseClient.storage
                    .from('gallery')
                    .upload(filePath, imageFile, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (uploadError) {
                    throw uploadError;
                }

                const { data: publicData } = supabaseClient.storage
                    .from('gallery')
                    .getPublicUrl(filePath);

                if (!publicData?.publicUrl) {
                    throw new Error('Não foi possível obter a URL pública do arquivo.');
                }

                publicUrl = publicData.publicUrl;
            }

            const created = await createGalleryImage({
                src: publicUrl,
                alt: altText,
                caption,
                category,
            });

            setImages(prevImages => [created, ...prevImages]);

            setImageFile(null);
            setAltText('');
            setCaption('');
            setCategory(ImageCategory.TERREIRO);
            setUploadError('');
            const fileInput = document.getElementById('image-upload-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (error) {
            console.error('[GalleryPage] Erro ao enviar imagem', error);
            setUploadError(
                supabaseReady
                    ? 'Não foi possível enviar a imagem. Verifique se o bucket "gallery" existe e tente novamente.'
                    : 'Supabase não configurado. Configure o backend para liberar o envio de imagens.'
            );
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-center uppercase tracking-widest mb-8">Galeria de Fotos</h1>
            <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">
                Explore os momentos, os símbolos e o espaço sagrado que compõem a jornada do Conselho Real.
            </p>

            {loadError && (
                <div className="mb-6 text-center text-red-400 text-sm">{loadError}</div>
            )}

            {!supabaseReady && (
                <div className="mb-8 bg-[#1A1A1A]/60 border border-dashed border-[#D4AF37]/40 text-sm text-gray-300 p-4 rounded-md">
                    <p>Configure o Supabase (URL e chave) e crie um bucket público chamado <code>gallery</code> para armazenar as imagens enviadas.</p>
                </div>
            )}

            {user?.role === Role.ADM && (
                <div className="mb-12 bg-[#1A1A1A] p-6 rounded-lg border border-[#333]">
                    <h2 className="text-2xl font-bold mb-4">Adicionar Nova Imagem</h2>
                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                        {uploadError && <p className="text-[#C0161D] text-sm">{uploadError}</p>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="image-upload-input" className="block text-sm uppercase tracking-wider mb-2">Arquivo de Imagem (max 2MB)</label>
                                <input
                                    type="file"
                                    id="image-upload-input"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#D4AF37] file:text-[#0B0B0B] hover:file:bg-opacity-80"
                                />
                            </div>
                            <div>
                                <label htmlFor="category-select" className="block text-sm uppercase tracking-wider mb-2">Categoria</label>
                                <select
                                    id="category-select"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as ImageCategory)}
                                    className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none"
                                >
                                    {Object.values(ImageCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="p-4 bg-[#0B0B0B] border border-dashed border-[#333] rounded-md text-sm text-gray-300">
                            <p className="font-semibold text-[#D4AF37] mb-2">Dicas para boas legendas:</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-400">
                                <li>Descreva quem aparece e o que está acontecendo.</li>
                                <li>Indique o contexto espiritual ou a gira registrada.</li>
                                <li>Escolha um texto alternativo objetivo para acessibilidade.</li>
                            </ul>
                        </div>
                        <div>
                            <label htmlFor="alt-text-input" className="block text-sm uppercase tracking-wider mb-2">Texto Alternativo (Alt)</label>
                            <input
                                type="text"
                                id="alt-text-input"
                                placeholder="Descrição para acessibilidade"
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                                className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="caption-input" className="block text-sm uppercase tracking-wider mb-2">Legenda</label>
                            <textarea
                                id="caption-input"
                                placeholder="Legenda para ser exibida na galeria"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                rows={3}
                                className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none"
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="px-6 py-2 uppercase tracking-widest bg-[#D4AF37] text-[#0B0B0B] font-bold disabled:bg-opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2" disabled={!imageFile || isUploading}>
                            {isUploading ? <><Spinner className="w-5 h-5" /> Enviando...</> : 'Enviar Imagem'}
                        </button>
                    </form>
                </div>
            )}

            <div className="flex flex-wrap justify-center gap-2 md:gap-4 my-8">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setFilter(category)}
                        className={`px-4 py-2 text-sm uppercase tracking-wider border rounded-full transition-colors duration-300 ${filter === category
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                            : 'border-gray-600 text-gray-300 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="text-center text-gray-400">Carregando galeria...</div>
            ) : filteredImages.length === 0 ? (
                <div className="text-center text-gray-400">Nenhuma imagem cadastrada ainda.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredImages.map(image => (
                        <div
                            key={image.id}
                            className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
                            onClick={() => setSelectedImage(image)}
                        >
                            <img src={image.src} alt={image.alt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <p className="text-white text-sm">{image.caption}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
                        <img src={selectedImage.src} alt={selectedImage.alt} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
                        <p className="text-center text-white mt-4 italic">{selectedImage.caption}</p>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-4 -right-4 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-xl"
                            aria-label="Fechar imagem"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


// LOGIN PAGE
export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const authenticatedUser = await authenticateUser(email, password);
            dispatch(loginSuccess(authenticatedUser));
            navigate('/membros/dashboard');
        } catch (authError) {
            console.error('[LoginPage] Falha na autenticação', authError);
            setError('Credenciais inválidas. Verifique seu e-mail e senha e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-20 flex justify-center">
            <div className="w-full max-w-md">
                <h1 className="text-4xl font-bold text-center uppercase tracking-widest mb-8">Área de Membros</h1>
                <form onSubmit={handleSubmit} className="bg-[#1A1A1A] p-8 rounded-lg space-y-6 border border-[#333]">
                    {error && <p className="text-[#C0161D] text-center">{error}</p>}
                    <div>
                        <label htmlFor="email" className="block text-sm uppercase tracking-wider mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm uppercase tracking-wider mb-2">Senha</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none"
                            required
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !email || !password}
                        className="w-full px-8 py-3 uppercase tracking-widest bg-[#D4AF37] text-[#0B0B0B] font-bold hover:bg-opacity-80 transition-all duration-300 flex justify-center items-center disabled:bg-opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Spinner className="w-5 h-5" /> : 'Entrar'}
                    </button>
                    <p className="text-xs text-center text-gray-500">Não é membro? O cadastro é realizado presencialmente no terreiro.</p>
                </form>
                <div className="mt-6 p-4 bg-[#0B0B0B] border border-[#333] rounded-lg text-sm text-center text-gray-400">
                    <h4 className="font-bold text-[#D4AF37] mb-2 uppercase tracking-wider">Acessos de Teste</h4>
                    <p>
                        <strong className="font-semibold text-gray-300">Admin:</strong> versurih@gmail.com<br />
                        <span className="text-xs text-gray-500">Senha: reidas7ebrilhantina</span>
                    </p>
                    <p className="mt-3">
                        <strong className="font-semibold text-gray-300">Membro:</strong> membro@conselhoreal.com<br />
                        <span className="text-xs text-gray-500">Senha: visitante123</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

// DREAM ANALYSIS MODAL
const DreamAnalysisModal: React.FC<{ entry: DiaryEntry | null; analysis: string; onClose: () => void; }> = ({ entry, analysis, onClose }) => {
    if (!entry) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative bg-[#1A1A1A] text-[#FFF8E1] w-full max-w-2xl p-8 rounded-lg border border-[#333] shadow-lg shadow-black/50" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold text-[#D4AF37]">Análise do Sonho: <span className="text-white">{entry.title}</span></h2>
                <div className="mt-4 p-4 bg-[#0B0B0B] rounded-md max-h-[60vh] overflow-y-auto space-y-4">
                    <div>
                        <h4 className="font-bold uppercase tracking-wider text-sm text-gray-400">Seu Relato</h4>
                        <p className="text-gray-300 whitespace-pre-wrap mt-1 italic">"{entry.content}"</p>
                    </div>
                    <div>
                        <h4 className="font-bold uppercase tracking-wider text-sm text-gray-400">Reflexões e Caminhos</h4>
                        <p className="text-gray-200 whitespace-pre-wrap mt-1">{analysis}</p>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">Lembre-se: esta é uma reflexão simbólica e não substitui a orientação de um guia espiritual.</p>
            </div>
        </div>
    );
};


// DASHBOARD PAGE
export const DashboardPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    if (!user) return null;

    const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => MOCK_DIARY_ENTRIES.filter(e => e.userId === user.id));
    const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

    const [entryTitle, setEntryTitle] = useState('');
    const [entryContent, setEntryContent] = useState('');
    const [entryTags, setEntryTags] = useState('');
    const [entryDueDate, setEntryDueDate] = useState('');
    const [entryAttachment, setEntryAttachment] = useState<File | null>(null);
    const [fileError, setFileError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);


    const [analyzingEntry, setAnalyzingEntry] = useState<DiaryEntry | null>(null);
    const [analysisResult, setAnalysisResult] = useState('');

    const [userRecados, setUserRecados] = useState(() =>
        MOCK_RECADOS.filter(r => r.userId === user.id).sort((a, b) => b.date.getTime() - a.date.getTime())
    );

    // Member Entities State
    const [memberEntities, setMemberEntities] = useState<MemberEntity[]>(() =>
        MOCK_MEMBER_ENTITIES.filter(e => e.userId === user.id)
    );
    const [editingEntity, setEditingEntity] = useState<MemberEntity | null>(null);
    const [entityName, setEntityName] = useState('');
    const [entityLine, setEntityLine] = useState('');
    const [entityHistory, setEntityHistory] = useState('');
    const [entityCuriosities, setEntityCuriosities] = useState('');
    const [isSavingEntity, setIsSavingEntity] = useState(false);

    useEffect(() => {
        // This simulates the user "reading" messages upon viewing their dashboard.
        // It mutates the central mock data source so the admin panel reflects the change.
        const unreadMessages = MOCK_RECADOS.filter(r => r.userId === user.id && !r.read);

        if (unreadMessages.length > 0) {
            unreadMessages.forEach(msg => msg.read = true);
            // Set a timeout to create a "read" effect that is visible to the user.
            const timer = setTimeout(() => {
                setUserRecados([...MOCK_RECADOS.filter(r => r.userId === user.id).sort((a, b) => b.date.getTime() - a.date.getTime())]);
            }, 1500); // Wait 1.5s before visually marking as read
            return () => clearTimeout(timer);
        }
    }, [user.id]);

    const generateDreamReflection = (entry: DiaryEntry) => {
        const lowerContent = `${entry.title} ${entry.content}`.toLowerCase();
        const insights: string[] = [];

        const keywordGroups = [
            { keywords: ['tridente', 'espada', 'lança'], message: 'Ferramentas de trabalho espirituais costumam apontar para proteção, firmeza e necessidade de decisões conscientes.' },
            { keywords: ['encruzilhada', 'cruzamento', 'estrada'], message: 'Encruzilhadas sinalizam escolhas e abertura de caminhos. Observe decisões recentes que pedem atenção.' },
            { keywords: ['luz', 'brilho', 'fogo', 'chama'], message: 'Elementos luminosos indicam limpeza e presença de guias trazendo clareza e direção.' },
            { keywords: ['água', 'mar', 'rio', 'chuva', 'cachoeira'], message: 'A presença de água pode traduzir emoções profundas e processos de purificação que merecem acolhimento.' },
            { keywords: ['sombras', 'noite', 'escuro'], message: 'Ambientes escuros convidam à introspecção e ao cuidado com pensamentos repetitivos ou desgastes energéticos.' },
        ];

        keywordGroups.forEach(({ keywords, message }) => {
            if (keywords.some(keyword => lowerContent.includes(keyword))) {
                insights.push(message);
            }
        });

        if (entry.tags?.length) {
            insights.push(`Tags registradas: ${entry.tags.map(tag => `“${tag}”`).join(', ')}. Reflita sobre como esses temas dialogam com trabalhos recentes na casa.`);
        }

        insights.push('Registre emoções, sensações corporais e qualquer entidade que tenha se aproximado em pensamento ao recordar o sonho.');
        insights.push('Compartilhe o relato com um dirigente ou guia de confiança quando sentir que precisa de orientação direta.');

        const headerParts: string[] = [];
        if (entry.createdAt instanceof Date && !Number.isNaN(entry.createdAt.getTime())) {
            headerParts.push(`Registro feito em ${entry.createdAt.toLocaleDateString('pt-BR')}.`);
        }
        if (entry.dueDate instanceof Date && !Number.isNaN(entry.dueDate.getTime())) {
            headerParts.push(`Acompanhamento previsto para ${entry.dueDate.toLocaleDateString('pt-BR')}.`);
        }

        const header = headerParts.join(' ');
        const body = insights.map(item => `• ${item}`).join('\n');

        return `${header}${header ? '\n\n' : ''}Alguns pontos para refletir:\n${body}`;
    };

    const handleAnalyzeDream = (entry: DiaryEntry) => {
        setAnalyzingEntry(entry);
        setAnalysisResult(generateDreamReflection(entry));
    };

    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const paymentStatus = ['Pago', 'Pendente', 'Pago', 'Pago', 'Isento', 'Pendente', 'Pendente', 'Pendente', 'Pendente', 'Pendente', 'Pendente', 'Pendente'];

    const resetForm = () => {
        setEditingEntry(null);
        setEntryTitle('');
        setEntryContent('');
        setEntryTags('');
        setEntryDueDate('');
        setEntryAttachment(null);
        setFileError('');
        const fileInput = document.getElementById('attachment-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setFileError('O arquivo não pode exceder 5MB.');
                setEntryAttachment(null);
                e.target.value = ''; // Clear the input
            } else {
                setFileError('');
                setEntryAttachment(file);
            }
        }
    };

    const handleSubmitDiary = (e: React.FormEvent) => {
        e.preventDefault();
        if (!entryTitle || !entryContent) return;
        setIsSaving(true);

        // Simulate API call
        setTimeout(() => {
            const newEntry: DiaryEntry = {
                id: editingEntry ? editingEntry.id : Date.now(),
                userId: user.id,
                title: entryTitle,
                content: entryContent,
                tags: entryTags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean),
                createdAt: editingEntry ? editingEntry.createdAt : new Date(),
                dueDate: entryDueDate ? new Date(`${entryDueDate}T00:00:00`) : undefined,
                attachment: entryAttachment ? { name: entryAttachment.name, size: entryAttachment.size } : (editingEntry?.attachment || undefined),
            };

            if (editingEntry) {
                setDiaryEntries(diaryEntries.map(entry => entry.id === editingEntry.id ? newEntry : entry));
            } else {
                setDiaryEntries([newEntry, ...diaryEntries]);
            }
            resetForm();
            setIsSaving(false);
        }, 1000);
    };

    const handleEditDiary = (entry: DiaryEntry) => {
        setEditingEntry(entry);
        setEntryTitle(entry.title);
        setEntryContent(entry.content);
        setEntryTags(entry.tags.join(', '));
        setEntryDueDate(entry.dueDate ? new Date(entry.dueDate).toISOString().split('T')[0] : '');
        setEntryAttachment(null);
        setFileError('');
    };

    const handleDeleteDiary = (id: number) => {
        setDeletingEntryId(id);
        setTimeout(() => {
            setDiaryEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
            setDeletingEntryId(null);
        }, 500); // Match animation duration
    };

    const getStatusClasses = (status: string) => {
        switch (status) {
            case 'Pago':
                return { bg: 'bg-green-500', text: 'text-green-400' };
            case 'Pendente':
                return { bg: 'bg-[#C0161D]', text: 'text-[#C0161D]' };
            case 'Isento':
                return { bg: 'bg-[#D4AF37]', text: 'text-[#D4AF37]' };
            default:
                return { bg: 'bg-gray-600', text: 'text-gray-400' };
        }
    };

    const resetEntityForm = () => {
        setEditingEntity(null);
        setEntityName('');
        setEntityLine('');
        setEntityHistory('');
        setEntityCuriosities('');
    };

    const handleEditEntity = (entity: MemberEntity) => {
        setEditingEntity(entity);
        setEntityName(entity.name);
        setEntityLine(entity.line);
        setEntityHistory(entity.history);
        setEntityCuriosities(entity.curiosities);
    };

    const handleDeleteEntity = (id: number) => {
        const index = MOCK_MEMBER_ENTITIES.findIndex(e => e.id === id);
        if (index > -1) {
            MOCK_MEMBER_ENTITIES.splice(index, 1);
        }
        setMemberEntities(memberEntities.filter(e => e.id !== id));
    };

    const handleSubmitEntity = (e: React.FormEvent) => {
        e.preventDefault();
        if (!entityName || !entityLine) return;
        setIsSavingEntity(true);

        setTimeout(() => {
            const entityData = {
                name: entityName,
                line: entityLine,
                history: entityHistory,
                curiosities: entityCuriosities,
            };

            if (editingEntity) {
                const updatedEntity = { ...editingEntity, ...entityData };
                const index = MOCK_MEMBER_ENTITIES.findIndex(e => e.id === editingEntity.id);
                if (index > -1) {
                    MOCK_MEMBER_ENTITIES[index] = updatedEntity;
                }
                setMemberEntities(memberEntities.map(e => e.id === editingEntity.id ? updatedEntity : e));
            } else {
                const newEntity: MemberEntity = {
                    id: Date.now(),
                    userId: user.id,
                    ...entityData
                };
                MOCK_MEMBER_ENTITIES.push(newEntity);
                setMemberEntities([...memberEntities, newEntity]);
            }
            resetEntityForm();
            setIsSavingEntity(false);
        }, 1000);
    };


    return (
        <>
            <DreamAnalysisModal
                entry={analyzingEntry}
                analysis={analysisResult}
                onClose={() => setAnalyzingEntry(null)}
            />
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-widest">Bem-vindo, {user.name.split(' ')[0]}!</h1>

                <div className="grid lg:grid-cols-3 gap-8 mt-12">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Mensalidades */}
                        <div>
                            <h2 className="text-2xl mb-4">Mensalidades {new Date().getFullYear()}</h2>
                            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333]">
                                <div className="grid grid-cols-6 md:grid-cols-12 gap-2 md:gap-4 text-center">
                                    {months.map((month, index) => {
                                        const status = paymentStatus[index];
                                        const { bg, text } = getStatusClasses(status);
                                        return (
                                            <div key={month} className="p-1 md:p-2 rounded-md bg-[#0B0B0B] flex flex-col justify-between h-20">
                                                <div className="text-[10px] md:text-xs text-gray-400 font-medium">{month}</div>
                                                <div className={`mt-1 w-full h-1.5 rounded-full ${bg}`}></div>
                                                <div className={`mt-auto text-center text-[9px] md:text-[10px] uppercase font-bold tracking-wider ${text}`}>{status}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button className="mt-6 w-full md:w-auto px-6 py-2 uppercase tracking-widest bg-[#D4AF37] text-[#0B0B0B] font-bold">Gerar PIX do Mês</button>
                            </div>
                        </div>

                        {/* Diário */}
                        <div>
                            <h2 className="text-2xl mb-4">Diário de Desenvolvimento</h2>
                            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333]">
                                <form onSubmit={handleSubmitDiary} className="space-y-4 mb-8">
                                    <h3 className="text-xl">{editingEntry ? 'Editando Anotação' : 'Nova Anotação'}</h3>
                                    <input type="text" placeholder="Título" value={entryTitle} onChange={e => setEntryTitle(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" required />
                                    <textarea placeholder="Conteúdo" rows={5} value={entryContent} onChange={e => setEntryContent(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" required></textarea>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input type="text" placeholder="Tags (Ex: sonho, estudo, proteção)" value={entryTags} onChange={e => setEntryTags(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" />
                                        <input type="date" value={entryDueDate} onChange={e => setEntryDueDate(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none text-gray-400" title="Data de Vencimento" />
                                    </div>
                                    <div>
                                        <label htmlFor="attachment-input" className="block text-sm text-gray-400 mb-2">Anexo (opcional, máx 5MB)</label>
                                        <input type="file" id="attachment-input" onChange={handleFileChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#D4AF37] file:text-[#0B0B0B] hover:file:bg-opacity-80" />
                                        {fileError && <p className="text-red-500 text-xs mt-1">{fileError}</p>}
                                        {editingEntry?.attachment && !entryAttachment && <p className="text-xs mt-2 text-gray-400">Anexo atual: {editingEntry.attachment.name}. Envie um novo arquivo para substituir.</p>}
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="submit" disabled={isSaving} className="px-6 py-2 uppercase tracking-widest bg-[#D4AF37] text-[#0B0B0B] font-bold flex justify-center items-center w-48 disabled:bg-opacity-50 disabled:cursor-not-allowed">
                                            {isSaving ? <Spinner className="w-5 h-5" /> : (editingEntry ? 'Salvar Alterações' : 'Adicionar Anotação')}
                                        </button>
                                        {editingEntry && <button type="button" onClick={resetForm} className="px-6 py-2 uppercase tracking-widest border border-gray-600 text-gray-400">Cancelar</button>}
                                    </div>
                                </form>

                                <div className="space-y-4">
                                    {diaryEntries.map(entry => {
                                        const isDeleting = entry.id === deletingEntryId;
                                        return (
                                            <div key={entry.id} className={`bg-[#0B0B0B] p-4 rounded-md border border-[#333] transition-all duration-300 hover:border-[#D4AF37] hover:shadow-lg hover:shadow-black/50 hover:-translate-y-1 ${isDeleting ? 'animate-fade-out-shrink' : 'animate-fade-in-down'}`}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-lg text-[#FFF8E1]">{entry.title}</h4>
                                                        <p className="text-xs text-gray-500 mb-2">{entry.createdAt.toLocaleDateString('pt-BR')}</p>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button onClick={() => handleEditDiary(entry)} className="text-gray-400 hover:text-[#D4AF37]"><EditIcon className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteDiary(entry.id)} className="text-gray-400 hover:text-[#C0161D]"><TrashIcon className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                                <p className="text-gray-300 whitespace-pre-wrap">{entry.content}</p>
                                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {entry.tags.map(tag => <span key={tag} className="px-3 py-1 text-xs bg-[#D4AF37]/20 text-[#D4AF37] rounded-full font-medium">#{tag}</span>)}
                                                        {entry.attachment && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-400 bg-[#1A1A1A] border border-[#333] px-3 py-1 rounded-full">
                                                                <FileIcon className="w-4 h-4" />
                                                                <span className="font-medium text-gray-300">{entry.attachment.name}</span>
                                                                <span className="text-xs text-gray-500">({(entry.attachment.size / 1024).toFixed(1)} KB)</span>
                                                            </div>
                                                        )}
                                                        {entry.dueDate && (() => {
                                                            const today = new Date();
                                                            today.setHours(0, 0, 0, 0);
                                                            const dueDate = new Date(entry.dueDate);
                                                            const isOverdue = dueDate < today;
                                                            return (
                                                                <div className={`flex items-center gap-1 text-xs border px-2 py-0.5 rounded-full ${isOverdue ? 'text-red-400 border-red-400/50 bg-red-900/20' : 'text-gray-400 border-[#333]'}`}>
                                                                    <CalendarIcon className="w-3 h-3" />
                                                                    <span>Vence: {dueDate.toLocaleDateString('pt-BR')}</span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                    {entry.tags.includes('sonho') && (
                                                        <button onClick={() => handleAnalyzeDream(entry)} className="text-sm flex items-center gap-2 bg-[#D4AF37] text-[#0B0B0B] px-4 py-2 rounded-md font-bold hover:bg-opacity-90 transition-colors animate-pulse-bright">
                                                            <SparkleIcon className="w-5 h-5" /> Analisar Sonho
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                        {/* Minhas Entidades */}
                        <div>
                            <h2 className="text-2xl mb-4">Minhas Entidades</h2>
                            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333]">
                                <form onSubmit={handleSubmitEntity} className="space-y-4 mb-8">
                                    <h3 className="text-xl">{editingEntity ? 'Editando Entidade' : 'Adicionar Nova Entidade'}</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input type="text" placeholder="Nome da Entidade" value={entityName} onChange={e => setEntityName(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" required />
                                        <input type="text" placeholder="Linha de Trabalho (Ex: Exu, Caboclo)" value={entityLine} onChange={e => setEntityLine(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" required />
                                    </div>
                                    <textarea placeholder="História" rows={4} value={entityHistory} onChange={e => setEntityHistory(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none"></textarea>
                                    <textarea placeholder="Curiosidades (o que gosta, cores, etc.)" rows={3} value={entityCuriosities} onChange={e => setEntityCuriosities(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none"></textarea>
                                    <div className="flex gap-4">
                                        <button type="submit" disabled={isSavingEntity} className="px-6 py-2 uppercase tracking-widest bg-[#D4AF37] text-[#0B0B0B] font-bold flex justify-center items-center w-48 disabled:bg-opacity-50 disabled:cursor-not-allowed">
                                            {isSavingEntity ? <Spinner className="w-5 h-5" /> : (editingEntity ? 'Salvar Alterações' : 'Adicionar Entidade')}
                                        </button>
                                        {editingEntity && <button type="button" onClick={resetEntityForm} className="px-6 py-2 uppercase tracking-widest border border-gray-600 text-gray-400">Cancelar</button>}
                                    </div>
                                </form>

                                <div className="space-y-4">
                                    {memberEntities.length > 0 ? memberEntities.map(entity => (
                                        <div key={entity.id} className="bg-[#0B0B0B] p-4 rounded-md border border-[#333]">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-lg text-[#FFF8E1]">{entity.name}</h4>
                                                    <p className="text-sm text-[#D4AF37] mb-2">{entity.line}</p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button onClick={() => handleEditEntity(entity)} className="text-gray-400 hover:text-[#D4AF37]"><EditIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteEntity(entity.id)} className="text-gray-400 hover:text-[#C0161D]"><TrashIcon className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 text-sm whitespace-pre-wrap"><strong className="text-gray-400">História:</strong> {entity.history}</p>
                                            <p className="text-gray-300 text-sm whitespace-pre-wrap mt-2"><strong className="text-gray-400">Curiosidades:</strong> {entity.curiosities}</p>
                                        </div>
                                    )) : <p className="text-center text-gray-500">Nenhuma entidade cadastrada.</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Perfil */}
                        <div>
                            <h2 className="text-2xl mb-4">Meu Perfil</h2>
                            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333]">
                                <UserIcon className="w-16 h-16 mx-auto text-[#D4AF37] mb-4" />
                                <p><strong>Nome:</strong> {user.name}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Membro desde:</strong> {user.memberSince || 'N/A'}</p>
                                <p><strong>Alergias:</strong> {user.allergies || 'Nenhuma informada'}</p>
                            </div>
                        </div>
                        {/* Recados */}
                        <div>
                            <h2 className="text-2xl mb-4">Recados</h2>
                            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333] space-y-2 max-h-60 overflow-y-auto">
                                {userRecados.length > 0 ? (
                                    userRecados.map(recado => (
                                        <div key={recado.id} className={`text-sm border-b border-[#333] p-2 last:border-b-0 transition-all duration-500 rounded-md ${recado.read ? 'bg-transparent opacity-70' : 'bg-[#D4AF37]/10'}`}>
                                            <p className={`${recado.read ? 'text-gray-300' : 'text-white font-semibold'}`}>
                                                <strong className="text-[#D4AF37]">[{recado.from}]</strong> {recado.message}
                                            </p>
                                            <p className="text-xs text-gray-500 text-right mt-1">{recado.date.toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">Nenhum recado novo.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// ADMIN DASHBOARD PAGE
export const AdminDashboardPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('membros');

    // To force re-render on mock data change
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [messagingUser, setMessagingUser] = useState<User | null>(null);
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [isSubmittingAnn, setIsSubmittingAnn] = useState(false);
    const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
    const [editingMemberEntity, setEditingMemberEntity] = useState<MemberEntity | null>(null);
    const [deletingMemberEntityId, setDeletingMemberEntityId] = useState<number | null>(null);
    const [isSpiritualEntityModalOpen, setIsSpiritualEntityModalOpen] = useState(false);
    const [editingSpiritualEntity, setEditingSpiritualEntity] = useState<SpiritualEntity | null>(null);
    const [deletingSpiritualEntityId, setDeletingSpiritualEntityId] = useState<number | null>(null);
    const [viewingHistoryEntity, setViewingHistoryEntity] = useState<SpiritualEntity | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userFormError, setUserFormError] = useState<string | null>(null);

    const filteredMembers = useMemo(() =>
        MOCK_USERS.filter(u => u.role === 'MEMBRO').filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm]);

    const sortedRecados = useMemo(() =>
        [...MOCK_RECADOS].sort((a, b) => b.date.getTime() - a.date.getTime())
        , [updateTrigger]);

    const sortedMemberEntities = useMemo(() =>
        [...MOCK_MEMBER_ENTITIES].sort((a, b) => a.userId - b.userId),
        [updateTrigger]);


    const getUserNameById = (userId: number): string => {
        const user = MOCK_USERS.find(u => u.id === userId);
        return user ? user.name : 'Desconhecido';
    };

    const handleAddNewSpiritualEntity = () => {
        setEditingSpiritualEntity(null);
        setIsSpiritualEntityModalOpen(true);
    };

    const handleAddNewUser = () => {
        setEditingUser(null);
        setUserFormError(null);
        setIsUserModalOpen(true);
    };

    const handleEditSpiritualEntity = (entity: SpiritualEntity) => {
        setEditingSpiritualEntity(entity);
        setIsSpiritualEntityModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setUserFormError(null);
        setIsUserModalOpen(true);
    };

    const handleDeleteSpiritualEntity = (entityId: number) => {
        setDeletingSpiritualEntityId(entityId);
    };

    const executeDeleteSpiritualEntity = () => {
        if (deletingSpiritualEntityId === null) return;

        const index = MOCK_ENTITIES.findIndex(e => e.id === deletingSpiritualEntityId);
        if (index > -1) {
            MOCK_ENTITIES.splice(index, 1);
            setUpdateTrigger(t => t + 1);
        }
        setDeletingSpiritualEntityId(null);
    };

    const handleSaveSpiritualEntity = (entityData: Omit<SpiritualEntity, 'id' | 'descriptionHistory'>) => {
        if (editingSpiritualEntity) {
            const index = MOCK_ENTITIES.findIndex(e => e.id === editingSpiritualEntity.id);
            if (index > -1) {
                MOCK_ENTITIES[index] = { ...MOCK_ENTITIES[index], ...entityData };
            }
        } else {
            const newEntity: SpiritualEntity = {
                id: Date.now(),
                ...entityData,
                descriptionHistory: [],
            };
            MOCK_ENTITIES.push(newEntity);
        }
        setUpdateTrigger(t => t + 1);
        setIsSpiritualEntityModalOpen(false);
        setEditingSpiritualEntity(null);
    };

    const handleSaveUser = (userData: Omit<User, 'id'> & { password?: string }) => {
        setUserFormError(null);
        const trimmedPassword = userData.password?.trim();
        const emailExists = MOCK_USERS.some(u => u.email.toLowerCase() === userData.email.toLowerCase() && (!editingUser || u.id !== editingUser.id));
        if (emailExists) {
            setUserFormError('Já existe um usuário com este e-mail.');
            return;
        }

        if (!editingUser && (!trimmedPassword || trimmedPassword.length < 6)) {
            setUserFormError('Defina uma senha com pelo menos 6 caracteres para o novo usuário.');
            return;
        }

        if (editingUser && trimmedPassword && trimmedPassword.length < 6) {
            setUserFormError('Ao atualizar a senha, utilize pelo menos 6 caracteres.');
            return;
        }

        const { password, ...userWithoutPassword } = userData;

        if (editingUser) {
            const index = MOCK_USERS.findIndex(u => u.id === editingUser.id);
            if (index > -1) {
                MOCK_USERS[index] = { ...MOCK_USERS[index], ...userWithoutPassword };
            }
        } else {
            const nextId = MOCK_USERS.length ? Math.max(...MOCK_USERS.map(u => u.id)) + 1 : 1;
            MOCK_USERS.push({ id: nextId, ...userWithoutPassword });
        }

        if (trimmedPassword) {
            const existingCredentialIndex = MOCK_USER_CREDENTIALS.findIndex(
                cred => cred.email.toLowerCase() === userData.email.toLowerCase()
            );
            if (existingCredentialIndex > -1) {
                MOCK_USER_CREDENTIALS[existingCredentialIndex].password = trimmedPassword;
            } else {
                MOCK_USER_CREDENTIALS.push({ email: userData.email, password: trimmedPassword });
            }
        }

        setUpdateTrigger(t => t + 1);
        setIsUserModalOpen(false);
        setEditingUser(null);
    };

    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        setIsEventModalOpen(true);
    };

    const handleAddNewEvent = () => {
        setEditingEvent(null);
        setIsEventModalOpen(true);
    };

    const handleDeleteEvent = (eventId: number) => {
        setDeletingEventId(eventId);
    };

    const executeDeleteEvent = () => {
        if (deletingEventId === null) return;

        const index = MOCK_EVENTS.findIndex(e => e.id === deletingEventId);
        if (index > -1) {
            MOCK_EVENTS.splice(index, 1);
            setUpdateTrigger(t => t + 1);
        }
        setDeletingEventId(null);
    };

    const handleSaveEvent = (eventData: Omit<Event, 'id' | 'attendees'>) => {
        if (editingEvent) {
            const index = MOCK_EVENTS.findIndex(e => e.id === editingEvent.id);
            if (index > -1) {
                MOCK_EVENTS[index] = { ...MOCK_EVENTS[index], ...eventData };
            }
        } else {
            const newEvent: Event = {
                id: Date.now(),
                ...eventData,
                attendees: 0,
            };
            MOCK_EVENTS.push(newEvent);
        }
        MOCK_EVENTS.sort((a, b) => a.date.getTime() - b.date.getTime());
        setUpdateTrigger(t => t + 1);
        setIsEventModalOpen(false);
        setEditingEvent(null);
    };

    const handleSendMessage = (message: string) => {
        if (!messagingUser) return;

        MOCK_RECADOS.push({
            id: Date.now(),
            userId: messagingUser.id,
            from: 'Admin',
            message,
            date: new Date(),
            read: false
        });
        alert(`Mensagem enviada para ${messagingUser.name}!`);
        setMessagingUser(null);
        setUpdateTrigger(t => t + 1);
    };

    const handleAnnouncementSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!announcementTitle || !announcementContent) return;
        setIsSubmittingAnn(true);
        await new Promise(res => setTimeout(res, 1000));

        MOCK_ANNOUNCEMENTS.unshift({
            id: Date.now(),
            title: announcementTitle,
            content: announcementContent,
            date: new Date().toLocaleDateString('pt-BR')
        });

        setAnnouncementTitle('');
        setAnnouncementContent('');
        setIsSubmittingAnn(false);
        alert('Aviso geral publicado com sucesso!');
        setUpdateTrigger(t => t + 1);
    };

    const handleToggleReadStatus = (recadoId: number) => {
        const recado = MOCK_RECADOS.find(r => r.id === recadoId);
        if (recado) {
            recado.read = !recado.read;
            setUpdateTrigger(t => t + 1);
        }
    };

    const handleEditMemberEntity = (entity: MemberEntity) => {
        setEditingMemberEntity(entity);
    };

    const handleSaveMemberEntity = (entityData: Omit<MemberEntity, 'id' | 'userId'>) => {
        if (!editingMemberEntity) return;

        const updatedEntity = { ...editingMemberEntity, ...entityData };
        const index = MOCK_MEMBER_ENTITIES.findIndex(e => e.id === editingMemberEntity.id);
        if (index > -1) {
            MOCK_MEMBER_ENTITIES[index] = updatedEntity;
        }

        setUpdateTrigger(t => t + 1);
        setEditingMemberEntity(null);
    };

    const handleDeleteMemberEntity = (entityId: number) => {
        setDeletingMemberEntityId(entityId);
    };

    const executeDeleteMemberEntity = () => {
        if (deletingMemberEntityId === null) return;

        const index = MOCK_MEMBER_ENTITIES.findIndex(e => e.id === deletingMemberEntityId);
        if (index > -1) {
            MOCK_MEMBER_ENTITIES.splice(index, 1);
            setUpdateTrigger(t => t + 1);
        }
        setDeletingMemberEntityId(null);
    };

    const handleExportCSV = () => {
        if (!filteredMembers.length) {
            alert("Nenhum membro para exportar.");
            return;
        }

        const headers = ['ID', 'Nome', 'Email', 'Membro Desde', 'Alergias'];

        const formatCSVCell = (value: any) => {
            const stringValue = String(value ?? '');
            if (/[",\n]/.test(stringValue)) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        const csvRows = [headers.join(',')];

        filteredMembers.forEach(user => {
            const row = [
                user.id,
                user.name,
                user.email,
                user.memberSince,
                user.allergies
            ].map(formatCSVCell).join(',');
            csvRows.push(row);
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        const today = new Date().toISOString().split('T')[0];
        link.setAttribute("download", `membros_conselho_real_${today}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'eventos':
                return (
                    <div>
                        <div className="text-right mb-4">
                            <button onClick={handleAddNewEvent} className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0B] font-bold uppercase tracking-wider text-sm">Adicionar Novo Evento</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead><tr className="border-b border-[#333]"><th className="p-2">Título</th><th className="p-2">Tipo</th><th className="p-2">Data</th><th className="p-2">Lotação</th><th className="p-2">Ações</th></tr></thead>
                                <tbody>
                                    {MOCK_EVENTS.map(event => (
                                        <tr key={event.id} className="border-b border-[#333] hover:bg-[#0B0B0B]">
                                            <td className="p-2">{event.title}</td>
                                            <td className="p-2">{event.type}</td>
                                            <td className="p-2">{event.date.toLocaleDateString('pt-BR')}</td>
                                            <td className="p-2">{event.attendees}/{event.capacity}</td>
                                            <td className="p-2 flex gap-4">
                                                <button onClick={() => handleEditEvent(event)} className="text-xs text-[#D4AF37] hover:underline">Editar</button>
                                                <button onClick={() => handleDeleteEvent(event.id)} className="text-xs text-red-500 hover:underline">Excluir</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'comunicacao':
                return (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Enviar Aviso Geral</h3>
                        <p className="text-sm text-gray-400 mb-4">Esta mensagem será exibida na seção "Últimos Avisos" da página inicial.</p>
                        <form onSubmit={handleAnnouncementSubmit} className="space-y-4 max-w-2xl">
                            <input type="text" placeholder="Título do Aviso" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" required />
                            <textarea placeholder="Conteúdo do Aviso" rows={5} value={announcementContent} onChange={e => setAnnouncementContent(e.target.value)} className="w-full bg-[#0B0B0B] p-3 border border-[#333] focus:border-[#D4AF37] focus:outline-none" required></textarea>
                            <button type="submit" disabled={isSubmittingAnn} className="px-6 py-2 uppercase tracking-widest bg-[#D4AF37] text-[#0B0B0B] font-bold flex justify-center items-center w-48 disabled:bg-opacity-50 disabled:cursor-not-allowed">
                                {isSubmittingAnn ? <Spinner className="w-5 h-5" /> : 'Publicar Aviso'}
                            </button>
                        </form>

                        <div className="mt-12">
                            <h3 className="text-xl font-bold mb-4">Histórico de Mensagens Privadas</h3>
                            <div className="overflow-x-auto max-h-96">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-[#333]">
                                            <th className="p-2">Destinatário</th>
                                            <th className="p-2">Mensagem</th>
                                            <th className="p-2">Status</th>
                                            <th className="p-2">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedRecados.map(recado => (
                                            <tr key={recado.id} className="border-b border-[#333] hover:bg-[#0B0B0B] text-sm">
                                                <td className="p-2 font-semibold text-[#D4AF37]">{getUserNameById(recado.userId)}</td>
                                                <td className="p-2 text-gray-300">{recado.message}</td>
                                                <td className="p-2">
                                                    <button
                                                        onClick={() => handleToggleReadStatus(recado.id)}
                                                        title={recado.read ? "Marcar como Não Lida" : "Marcar como Lida"}
                                                        className={`px-2 py-1 text-xs rounded-full transition-opacity hover:opacity-80 w-20 text-center ${recado.read ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}
                                                    >
                                                        {recado.read ? 'Lida' : 'Não Lida'}
                                                    </button>
                                                </td>
                                                <td className="p-2 text-gray-500">{recado.date.toLocaleString('pt-BR')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                );
            case 'entidades':
                return (
                    <div>
                        <div className="text-right mb-4">
                            <button onClick={handleAddNewSpiritualEntity} className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0B] font-bold uppercase tracking-wider text-sm">Adicionar Nova Entidade</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead><tr className="border-b border-[#333]"><th className="p-2">Nome</th><th className="p-2">Linha</th><th className="p-2 max-w-sm">Descrição</th><th className="p-2">Ações</th></tr></thead>
                                <tbody>
                                    {MOCK_ENTITIES.map(entity => (
                                        <tr key={entity.id} className="border-b border-[#333] hover:bg-[#0B0B0B]">
                                            <td className="p-2 font-bold">{entity.name}</td>
                                            <td className="p-2">{entity.line}</td>
                                            <td className="p-2 text-sm text-gray-400 max-w-sm truncate">{entity.description}</td>
                                            <td className="p-2">
                                                <div className="flex gap-4 items-center">
                                                    <button onClick={() => handleEditSpiritualEntity(entity)} className="text-xs text-[#D4AF37] hover:underline">Editar</button>
                                                    <button onClick={() => handleDeleteSpiritualEntity(entity.id)} className="text-xs text-red-500 hover:underline">Excluir</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'entidadesMembros':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[#333]">
                                    <th className="p-2">Membro</th>
                                    <th className="p-2">Nome da Entidade</th>
                                    <th className="p-2">Linha</th>
                                    <th className="p-2">História</th>
                                    <th className="p-2">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMemberEntities.map(entity => (
                                    <tr key={entity.id} className="border-b border-[#333] hover:bg-[#0B0B0B] text-sm">
                                        <td className="p-2 font-semibold text-[#D4AF37]">{getUserNameById(entity.userId)}</td>
                                        <td className="p-2 text-gray-300 font-bold">{entity.name}</td>
                                        <td className="p-2 text-gray-400">{entity.line}</td>
                                        <td className="p-2 text-gray-400 truncate max-w-xs">{entity.history}</td>
                                        <td className="p-2 flex gap-4">
                                            <button onClick={() => handleEditMemberEntity(entity)} className="text-xs text-[#D4AF37] hover:underline">Editar</button>
                                            <button onClick={() => handleDeleteMemberEntity(entity.id)} className="text-xs text-red-500 hover:underline">Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'historia':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead><tr className="border-b border-[#333]"><th className="p-2">Título</th><th className="p-2">Conteúdo</th><th className="p-2">Ações</th></tr></thead>
                            <tbody>{MOCK_LORE.map(l => (<tr key={l.id} className="border-b border-[#333] hover:bg-[#0B0B0B]"><td className="p-2 font-bold">{l.title}</td><td className="p-2 text-sm text-gray-400">{l.content}</td><td className="p-2"><button className="text-xs text-[#D4AF37] hover:underline">Editar</button></td></tr>))}</tbody>
                        </table>
                    </div>
                );
            case 'membros':
            default:
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead><tr className="border-b border-[#333]"><th className="p-2">Nome</th><th className="p-2">Email</th><th className="p-2">Status</th><th className="p-2">Ações</th></tr></thead>
                            <tbody>{filteredMembers.map(user => (<tr key={user.id} className="border-b border-[#333] hover:bg-[#0B0B0B]"><td className="p-2">{user.name}</td><td className="p-2">{user.email}</td><td className="p-2"><span className="px-2 py-1 text-xs bg-green-800 rounded-full">Ativo</span></td><td className="p-2 flex gap-4 items-center"><button onClick={() => handleEditUser(user)} className="text-xs text-[#D4AF37] hover:underline">Editar</button><button onClick={() => setMessagingUser(user)} className="text-xs text-blue-400 hover:underline">Mensagem</button></td></tr>))}</tbody>
                        </table>
                    </div>
                );
        }
    };

    return (
        <>
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-widest">Painel Administrativo</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                    <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333]"><h3 className="text-xl text-gray-400">Membros Ativos</h3><p className="text-4xl font-bold text-[#D4AF37]">{MOCK_USERS.filter(u => u.role === 'MEMBRO').length}</p></div>
                    <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333]"><h3 className="text-xl text-gray-400">Pedidos Pendentes</h3><p className="text-4xl font-bold text-[#D4AF37]">{MOCK_PRAYER_REQUESTS.length}</p></div>
                    <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333]"><h3 className="text-xl text-gray-400">Próximo Evento</h3><p className="text-4xl font-bold text-[#D4AF37]">{MOCK_EVENTS[0]?.title || 'N/A'}</p></div>
                    <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333]"><h3 className="text-xl text-gray-400">Doações (Mês)</h3><p className="text-4xl font-bold text-[#D4AF37]">R$ 1.250,00</p></div>
                </div>

                <div className="mt-12 bg-[#1A1A1A] p-6 rounded-lg border border-[#333]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        <div className="flex border-b border-[#333] flex-wrap">
                            <button onClick={() => setActiveTab('membros')} className={`px-4 py-2 uppercase text-sm tracking-wider ${activeTab === 'membros' ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'text-gray-400'}`}>Membros</button>
                            <button onClick={() => setActiveTab('eventos')} className={`px-4 py-2 uppercase text-sm tracking-wider ${activeTab === 'eventos' ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'text-gray-400'}`}>Agenda</button>
                            <button onClick={() => setActiveTab('comunicacao')} className={`px-4 py-2 uppercase text-sm tracking-wider ${activeTab === 'comunicacao' ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'text-gray-400'}`}>Comunicação</button>
                            <button onClick={() => setActiveTab('entidades')} className={`px-4 py-2 uppercase text-sm tracking-wider ${activeTab === 'entidades' ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'text-gray-400'}`}>Entidades</button>
                            <button onClick={() => setActiveTab('entidadesMembros')} className={`px-4 py-2 uppercase text-sm tracking-wider ${activeTab === 'entidadesMembros' ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'text-gray-400'}`}>Entidades (Membros)</button>
                            <button onClick={() => setActiveTab('historia')} className={`px-4 py-2 uppercase text-sm tracking-wider ${activeTab === 'historia' ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'text-gray-400'}`}>História/Doutrina</button>
                        </div>
                        {activeTab === 'membros' && (
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:justify-end">
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome ou email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-[#0B0B0B] p-2 border border-[#333] focus:border-[#D4AF37] focus:outline-none w-full md:max-w-xs"
                                    />
                                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-bold uppercase tracking-wider text-sm hover:bg-gray-500 transition-colors" title="Exportar lista de membros para CSV">
                                        <DownloadIcon className="w-4 h-4" />
                                        <span className="hidden sm:inline">Exportar</span>
                                    </button>
                                </div>
                                <button onClick={handleAddNewUser} className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0B] font-bold uppercase tracking-wider text-sm hover:bg-opacity-80 transition-colors">
                                    Cadastrar novo usuário
                                </button>
                            </div>
                        )}
                    </div>
                    {renderContent()}
                </div>
            </div>
            {isEventModalOpen && <EventFormModal event={editingEvent} onClose={() => setIsEventModalOpen(false)} onSave={handleSaveEvent} />}
            {messagingUser && <PrivateMessageModal user={messagingUser} onClose={() => setMessagingUser(null)} onSend={handleSendMessage} />}
            <ConfirmationModal
                isOpen={deletingEventId !== null}
                onClose={() => setDeletingEventId(null)}
                onConfirm={executeDeleteEvent}
                title="Confirmar Exclusão de Evento"
                message={
                    <>
                        <p>Você tem certeza que deseja excluir o evento <strong className="text-white">{MOCK_EVENTS.find(e => e.id === deletingEventId)?.title}</strong>?</p>
                        <p className="mt-2 text-sm text-yellow-400">Esta ação é irreversível e removerá o evento permanentemente da agenda.</p>
                    </>
                }
            />
            {editingMemberEntity && <EntityFormModal entity={editingMemberEntity} onClose={() => setEditingMemberEntity(null)} onSave={handleSaveMemberEntity} />}
            <ConfirmationModal
                isOpen={deletingMemberEntityId !== null}
                onClose={() => setDeletingMemberEntityId(null)}
                onConfirm={executeDeleteMemberEntity}
                title="Confirmar Exclusão de Entidade"
                message={
                    <>
                        <p>Você tem certeza que deseja excluir a entidade <strong className="text-white">{MOCK_MEMBER_ENTITIES.find(e => e.id === deletingMemberEntityId)?.name}</strong>?</p>
                        <p className="mt-2 text-sm text-yellow-400">Esta ação é irreversível.</p>
                    </>
                }
            />
            {isSpiritualEntityModalOpen && <SpiritualEntityFormModal entity={editingSpiritualEntity} onClose={() => setIsSpiritualEntityModalOpen(false)} onSave={handleSaveSpiritualEntity} />}
            <ConfirmationModal
                isOpen={deletingSpiritualEntityId !== null}
                onClose={() => setDeletingSpiritualEntityId(null)}
                onConfirm={executeDeleteSpiritualEntity}
                title="Confirmar Exclusão de Entidade Espiritual"
                message={
                    <>
                        <p>Você tem certeza que deseja excluir a entidade <strong className="text-white">{MOCK_ENTITIES.find(e => e.id === deletingSpiritualEntityId)?.name}</strong>?</p>
                        <p className="mt-2 text-sm text-yellow-400">Esta ação é irreversível.</p>
                    </>
                }
            />
            {isUserModalOpen && (
                <UserFormModal
                    user={editingUser}
                    onClose={() => {
                        setIsUserModalOpen(false);
                        setEditingUser(null);
                        setUserFormError(null);
                    }}
                    onSave={handleSaveUser}
                    errorMessage={userFormError ?? undefined}
                    onClearError={() => setUserFormError(null)}
                />
            )}
            <DescriptionHistoryModal entity={viewingHistoryEntity} onClose={() => setViewingHistoryEntity(null)} />
        </>
    );
};