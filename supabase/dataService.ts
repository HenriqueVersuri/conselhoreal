import {
    MOCK_EVENTS,
    MOCK_ANNOUNCEMENTS,
    MOCK_PRAYER_REQUESTS,
    MOCK_IMAGES,
    MOCK_USERS,
    MOCK_USER_CREDENTIALS,
    MOCK_DIARY_ENTRIES,
    MOCK_RECADOS,
    MOCK_MEMBER_ENTITIES,
    MOCK_ENTITIES,
    MOCK_LORE,
} from '../data';
import {
    type Event,
    EventType,
    type Announcement,
    type PrayerRequest,
    type GalleryImage,
    type User,
    Role,
    type DiaryEntry,
    type Recado,
    type MemberEntity,
    type SpiritualEntity,
    type LoreEntry,
} from '../types';
import { getSupabaseClient, isSupabaseConfigured } from './client';

const supabase = getSupabaseClient();

const normalizeDate = (value: string | Date | null | undefined): Date => {
    if (!value) return new Date();
    const dateValue = value instanceof Date ? value : new Date(value);
    return Number.isNaN(dateValue.getTime()) ? new Date() : dateValue;
};

const cloneEvent = (event: Event): Event => ({
    ...event,
    date: new Date(event.date),
});

const cloneAnnouncement = (announcement: Announcement): Announcement => ({ ...announcement });

const clonePrayerRequest = (request: PrayerRequest): PrayerRequest => ({
    ...request,
    timestamp: new Date(request.timestamp),
});

const cloneGalleryImage = (image: GalleryImage): GalleryImage => ({ ...image });

const cloneUser = (user: User): User => ({ ...user });

const cloneDiaryEntry = (entry: DiaryEntry): DiaryEntry => ({
    ...entry,
    createdAt: new Date(entry.createdAt),
    dueDate: entry.dueDate ? new Date(entry.dueDate) : undefined,
});

const cloneRecado = (recado: Recado): Recado => ({
    ...recado,
    date: new Date(recado.date),
});

const cloneMemberEntity = (entity: MemberEntity): MemberEntity => ({ ...entity });

const cloneSpiritualEntity = (entity: SpiritualEntity): SpiritualEntity => ({
    ...entity,
    descriptionHistory: entity.descriptionHistory?.map(history => ({
        ...history,
        timestamp: new Date(history.timestamp),
    })),
});

const cloneLoreEntry = (entry: LoreEntry): LoreEntry => ({ ...entry });

const mapEventRow = (row: any): Event => ({
    id: row.id,
    title: row.title,
    type: (row.type ?? EventType.GIRA) as EventType,
    date: normalizeDate(row.date),
    capacity: row.capacity ?? 0,
    attendees: row.attendees ?? 0,
});

const mapAnnouncementRow = (row: any): Announcement => ({
    id: row.id,
    title: row.title,
    content: row.content,
    date: row.date ?? new Date().toLocaleDateString('pt-BR'),
});

const mapPrayerRequestRow = (row: any): PrayerRequest => ({
    id: row.id,
    initials: row.initials ?? '',
    request: row.request ?? '',
    timestamp: normalizeDate(row.timestamp ?? row.created_at ?? new Date()),
});

const mapGalleryImageRow = (row: any): GalleryImage => ({
    id: row.id,
    src: row.src ?? '',
    alt: row.alt ?? '',
    caption: row.caption ?? '',
    category: row.category ?? 'Terreiro',
});

const mapUserRow = (row: any): User => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: (row.role ?? Role.MEMBRO) as Role,
    memberSince: row.member_since ?? undefined,
    allergies: row.allergies ?? undefined,
});

const mapDiaryEntryRow = (row: any): DiaryEntry => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    tags: Array.isArray(row.tags)
        ? row.tags
        : typeof row.tags === 'string'
            ? row.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
            : [],
    createdAt: normalizeDate(row.created_at ?? row.createdAt),
    dueDate: row.due_date ? normalizeDate(row.due_date) : undefined,
    attachment: row.attachment ?? undefined,
});

const mapRecadoRow = (row: any): Recado => ({
    id: row.id,
    userId: row.user_id,
    from: row.from ?? 'Admin',
    message: row.message ?? '',
    date: normalizeDate(row.date ?? row.created_at),
    read: Boolean(row.read),
});

const mapMemberEntityRow = (row: any): MemberEntity => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    line: row.line,
    history: row.history,
    curiosities: row.curiosities,
});

const mapSpiritualEntityRow = (row: any): SpiritualEntity => ({
    id: row.id,
    name: row.name,
    line: row.line,
    description: row.description,
    descriptionHistory: (row.description_history ?? []).map((item: any) => ({
        timestamp: normalizeDate(item.timestamp ?? item.created_at),
        description: item.description,
    })),
});

const mapLoreRow = (row: any): LoreEntry => ({
    id: row.id,
    title: row.title,
    content: row.content,
    relatedEntities: Array.isArray(row.related_entities) ? row.related_entities : [],
});

const fallback = <T>(items: T[], cloner: (item: T) => T): T[] => items.map(cloner);

export const listEvents = async (): Promise<Event[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return fallback(MOCK_EVENTS, cloneEvent);
    }

    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

    if (error || !data) {
        console.error('[Supabase] Falha ao carregar eventos:', error);
        return fallback(MOCK_EVENTS, cloneEvent);
    }

    return data.map(mapEventRow);
};

export const saveEvent = async (
    payload: Omit<Event, 'attendees'> & { attendees?: number }
): Promise<Event> => {
    if (!isSupabaseConfigured() || !supabase) {
        const existingIndex = MOCK_EVENTS.findIndex(event => event.id === payload.id);
        if (existingIndex > -1) {
            const updated: Event = {
                ...payload,
                attendees: MOCK_EVENTS[existingIndex].attendees,
                date: new Date(payload.date),
            };
            MOCK_EVENTS[existingIndex] = updated;
            return cloneEvent(updated);
        }

        const newEvent: Event = {
            id: Date.now(),
            title: payload.title,
            type: payload.type,
            date: new Date(payload.date),
            capacity: payload.capacity,
            attendees: payload.attendees ?? 0,
        };
        MOCK_EVENTS.push(newEvent);
        return cloneEvent(newEvent);
    }

    const body = {
        title: payload.title,
        type: payload.type,
        date: payload.date instanceof Date ? payload.date.toISOString() : payload.date,
        capacity: payload.capacity,
        attendees: payload.attendees ?? 0,
    };

    if (payload.id) {
        const { data, error } = await supabase
            .from('events')
            .update(body)
            .eq('id', payload.id)
            .select()
            .single();

        if (error || !data) {
            throw error ?? new Error('Erro ao atualizar evento');
        }
        return mapEventRow(data);
    }

    const { data, error } = await supabase
        .from('events')
        .insert(body)
        .select()
        .single();

    if (error || !data) {
        throw error ?? new Error('Erro ao cadastrar evento');
    }

    return mapEventRow(data);
};

export const deleteEvent = async (eventId: number): Promise<void> => {
    if (!isSupabaseConfigured() || !supabase) {
        const index = MOCK_EVENTS.findIndex(event => event.id === eventId);
        if (index > -1) {
            MOCK_EVENTS.splice(index, 1);
        }
        return;
    }

    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) throw error;
};

export const listAnnouncements = async (): Promise<Announcement[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return fallback(MOCK_ANNOUNCEMENTS, cloneAnnouncement);
    }

    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !data) {
        console.error('[Supabase] Falha ao carregar avisos:', error);
        return fallback(MOCK_ANNOUNCEMENTS, cloneAnnouncement);
    }

    return data.map(mapAnnouncementRow);
};

export const createAnnouncement = async (
    payload: Omit<Announcement, 'id' | 'date'>
): Promise<Announcement> => {
    if (!isSupabaseConfigured() || !supabase) {
        const newAnnouncement: Announcement = {
            id: Date.now(),
            title: payload.title,
            content: payload.content,
            date: new Date().toLocaleDateString('pt-BR'),
        };
        MOCK_ANNOUNCEMENTS.unshift(newAnnouncement);
        return cloneAnnouncement(newAnnouncement);
    }

    const body = {
        title: payload.title,
        content: payload.content,
    };

    const { data, error } = await supabase
        .from('announcements')
        .insert(body)
        .select()
        .single();

    if (error || !data) {
        throw error ?? new Error('Erro ao publicar aviso geral');
    }

    return mapAnnouncementRow(data);
};

export const listPrayerRequests = async (): Promise<PrayerRequest[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return fallback(MOCK_PRAYER_REQUESTS, clonePrayerRequest);
    }

    const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !data) {
        console.error('[Supabase] Falha ao carregar pedidos de oração:', error);
        return fallback(MOCK_PRAYER_REQUESTS, clonePrayerRequest);
    }

    return data.map(mapPrayerRequestRow);
};

export const createPrayerRequest = async (
    payload: Omit<PrayerRequest, 'id' | 'timestamp'>
): Promise<PrayerRequest> => {
    if (!isSupabaseConfigured() || !supabase) {
        const newRequest: PrayerRequest = {
            id: Date.now(),
            initials: payload.initials,
            request: payload.request,
            timestamp: new Date(),
        };
        MOCK_PRAYER_REQUESTS.unshift(newRequest);
        return clonePrayerRequest(newRequest);
    }

    const body = {
        initials: payload.initials,
        request: payload.request,
    };

    const { data, error } = await supabase
        .from('prayer_requests')
        .insert(body)
        .select()
        .single();

    if (error || !data) {
        throw error ?? new Error('Erro ao enviar pedido de oração');
    }

    return mapPrayerRequestRow(data);
};

export const listGalleryImages = async (): Promise<GalleryImage[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return fallback(MOCK_IMAGES, cloneGalleryImage);
    }

    const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !data) {
        console.error('[Supabase] Falha ao carregar imagens da galeria:', error);
        return fallback(MOCK_IMAGES, cloneGalleryImage);
    }

    return data.map(mapGalleryImageRow);
};

export const createGalleryImage = async (
    payload: Omit<GalleryImage, 'id'>
): Promise<GalleryImage> => {
    if (!isSupabaseConfigured() || !supabase) {
        const newImage: GalleryImage = {
            id: Date.now(),
            ...payload,
        };
        MOCK_IMAGES.unshift(newImage);
        return cloneGalleryImage(newImage);
    }

    const body = {
        src: payload.src,
        alt: payload.alt,
        caption: payload.caption,
        category: payload.category,
    };

    const { data, error } = await supabase
        .from('gallery_images')
        .insert(body)
        .select()
        .single();

    if (error || !data) {
        throw error ?? new Error('Erro ao salvar imagem da galeria');
    }

    return mapGalleryImageRow(data);
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        const found = MOCK_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
        return found ? cloneUser(found) : null;
    }

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .maybeSingle();

    if (error) {
        console.error('[Supabase] Erro ao buscar usuário por email:', error);
        return null;
    }

    return data ? mapUserRow(data) : null;
};

export const listUsers = async (): Promise<User[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return fallback(MOCK_USERS, cloneUser);
    }

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });

    if (error || !data) {
        console.error('[Supabase] Falha ao carregar usuários:', error);
        return fallback(MOCK_USERS, cloneUser);
    }

    return data.map(mapUserRow);
};

const upsertMockCredential = (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase();
    const existingIndex = MOCK_USER_CREDENTIALS.findIndex(cred => cred.email.toLowerCase() === normalizedEmail);
    if (existingIndex > -1) {
        MOCK_USER_CREDENTIALS[existingIndex].password = password;
    } else {
        MOCK_USER_CREDENTIALS.push({ email, password });
    }
};

const removeMockCredential = (email: string) => {
    const normalizedEmail = email.toLowerCase();
    const existingIndex = MOCK_USER_CREDENTIALS.findIndex(cred => cred.email.toLowerCase() === normalizedEmail);
    if (existingIndex > -1) {
        MOCK_USER_CREDENTIALS.splice(existingIndex, 1);
    }
};

const authenticateWithMocks = (normalizedEmail: string, password: string): User => {
    const credential = MOCK_USER_CREDENTIALS.find(
        cred => cred.email.toLowerCase() === normalizedEmail && cred.password === password
    );

    if (!credential) {
        throw new Error('Credenciais inválidas.');
    }

    const user = MOCK_USERS.find(mockUser => mockUser.email.toLowerCase() === normalizedEmail);

    if (!user) {
        throw new Error('Perfil de usuário não encontrado.');
    }

    return cloneUser(user);
};

export const saveUser = async (
    payload: Omit<User, 'id'> & { id?: number; password?: string }
): Promise<User> => {
    if (!isSupabaseConfigured() || !supabase) {
        const { password, ...userWithoutPassword } = payload;
        const trimmedPassword = password?.trim();

        if (payload.id) {
            const index = MOCK_USERS.findIndex(user => user.id === payload.id);
            if (index > -1) {
                MOCK_USERS[index] = { ...MOCK_USERS[index], ...userWithoutPassword } as User;
                if (trimmedPassword) {
                    upsertMockCredential(payload.email, trimmedPassword);
                }
                return cloneUser(MOCK_USERS[index]);
            }
        }

        const emailExists = MOCK_USERS.some(
            user => user.email.toLowerCase() === payload.email.toLowerCase() && user.id !== payload.id
        );
        if (emailExists) {
            throw new Error('Já existe um usuário com este e-mail');
        }

        if (!trimmedPassword) {
            throw new Error('Informe uma senha para o novo usuário.');
        }

        const newUser: User = {
            id: payload.id ?? Date.now(),
            ...userWithoutPassword,
        };
        MOCK_USERS.push(newUser);
        upsertMockCredential(payload.email, trimmedPassword);
        return cloneUser(newUser);
    }

    const body = {
        name: payload.name,
        email: payload.email,
        role: payload.role,
        member_since: payload.memberSince ?? null,
        allergies: payload.allergies ?? null,
    };

    if (payload.id) {
        const { data, error } = await supabase
            .from('users')
            .update(body)
            .eq('id', payload.id)
            .select()
            .single();

        if (error || !data) {
            if (error?.code === '23505') {
                throw new Error('Já existe um usuário com este e-mail.');
            }
            throw error ?? new Error('Erro ao atualizar usuário');
        }

        return mapUserRow(data);
    }

    const { data, error } = await supabase
        .from('users')
        .insert(body)
        .select()
        .single();

    if (error || !data) {
        if (error?.code === '23505') {
            throw new Error('Já existe um usuário com este e-mail.');
        }
        throw error ?? new Error('Erro ao cadastrar usuário');
    }

    return mapUserRow(data);
};

export const deleteUser = async (userId: number): Promise<void> => {
    if (!isSupabaseConfigured() || !supabase) {
        const index = MOCK_USERS.findIndex(user => user.id === userId);
        if (index > -1) {
            removeMockCredential(MOCK_USERS[index].email);
            MOCK_USERS.splice(index, 1);
        }
        return;
    }

    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
};

export const authenticateUser = async (email: string, password: string): Promise<User> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured() || !supabase) {
        return authenticateWithMocks(normalizedEmail, password);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

    if (error || !data?.user) {
        console.warn('[Supabase] Falha ao autenticar via Supabase, utilizando credenciais locais como fallback.', error);
        return authenticateWithMocks(normalizedEmail, password);
    }

    const existingProfile = await getUserByEmail(normalizedEmail);
    if (existingProfile) {
        if (normalizedEmail === 'versurih@gmail.com' && existingProfile.role !== Role.ADM) {
            return saveUser({
                id: existingProfile.id,
                name: existingProfile.name,
                email: existingProfile.email,
                role: Role.ADM,
                memberSince: existingProfile.memberSince,
                allergies: existingProfile.allergies,
            });
        }
        return existingProfile;
    }

    const inferredName = data.user.user_metadata?.name
        ?? data.user.email?.split('@')[0]?.replace(/[._-]+/g, ' ')
        ?? 'Membro';

    const fallbackRole = normalizedEmail === 'versurih@gmail.com' ? Role.ADM : Role.MEMBRO;
    const inferredRole = (data.user.user_metadata?.role ?? fallbackRole) as Role;

    return saveUser({
        name: inferredName,
        email: data.user.email ?? normalizedEmail,
        role: inferredRole,
        memberSince: undefined,
        allergies: undefined,
    });
};

export const signOut = async (): Promise<void> => {
    if (!isSupabaseConfigured() || !supabase) {
        return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('[Supabase] Falha ao encerrar sessão:', error);
    }
};

export const listDiaryEntries = async (userId: number): Promise<DiaryEntry[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return fallback(
            MOCK_DIARY_ENTRIES.filter(entry => entry.userId === userId),
            cloneDiaryEntry
        );
    }

    const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error || !data) {
        console.error('[Supabase] Falha ao carregar diário:', error);
        return fallback(
            MOCK_DIARY_ENTRIES.filter(entry => entry.userId === userId),
            cloneDiaryEntry
        );
    }

    return data.map(mapDiaryEntryRow);
};

export const saveDiaryEntry = async (
    payload: Omit<DiaryEntry, 'id'> & { id?: number }
): Promise<DiaryEntry> => {
    if (!isSupabaseConfigured() || !supabase) {
        if (payload.id) {
            const index = MOCK_DIARY_ENTRIES.findIndex(entry => entry.id === payload.id);
            if (index > -1) {
                const updated: DiaryEntry = {
                    ...MOCK_DIARY_ENTRIES[index],
                    ...payload,
                    createdAt: new Date(MOCK_DIARY_ENTRIES[index].createdAt),
                    dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
                };
                MOCK_DIARY_ENTRIES[index] = updated;
                return cloneDiaryEntry(updated);
            }
        }

        const newEntry: DiaryEntry = {
            id: Date.now(),
            ...payload,
            createdAt: new Date(),
            dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
        };
        MOCK_DIARY_ENTRIES.unshift(newEntry);
        return cloneDiaryEntry(newEntry);
    }

    const body = {
        user_id: payload.userId,
        title: payload.title,
        content: payload.content,
        tags: payload.tags,
        due_date: payload.dueDate ? payload.dueDate.toISOString() : null,
        attachment: payload.attachment ?? null,
    };

    if (payload.id) {
        const { data, error } = await supabase
            .from('diary_entries')
            .update(body)
            .eq('id', payload.id)
            .select()
            .single();

        if (error || !data) {
            throw error ?? new Error('Erro ao atualizar anotação do diário');
        }

        return mapDiaryEntryRow(data);
    }

    const { data, error } = await supabase
        .from('diary_entries')
        .insert(body)
        .select()
        .single();

    if (error || !data) {
        throw error ?? new Error('Erro ao salvar anotação do diário');
    }

    return mapDiaryEntryRow(data);
};

export const deleteDiaryEntry = async (entryId: number): Promise<void> => {
    if (!isSupabaseConfigured() || !supabase) {
        const index = MOCK_DIARY_ENTRIES.findIndex(entry => entry.id === entryId);
        if (index > -1) {
            MOCK_DIARY_ENTRIES.splice(index, 1);
        }
        return;
    }

    const { error } = await supabase.from('diary_entries').delete().eq('id', entryId);
    if (error) throw error;
};

export const listRecados = async (userId?: number): Promise<Recado[]> => {
    const selectSource = () => {
        if (typeof userId === 'number') {
            return MOCK_RECADOS.filter(recado => recado.userId === userId);
        }
        return MOCK_RECADOS;
    };

    if (!isSupabaseConfigured() || !supabase) {
        return fallback(selectSource(), cloneRecado);
    }

    let query = supabase
        .from('recados')
        .select('*')
        .order('date', { ascending: false });

    if (typeof userId === 'number') {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error || !data) {
        console.error('[Supabase] Falha ao carregar recados:', error);
        return fallback(selectSource(), cloneRecado);
    }

    return data.map(mapRecadoRow);
};

export const createRecado = async (
    payload: Omit<Recado, 'id' | 'date'>
): Promise<Recado> => {
    if (!isSupabaseConfigured() || !supabase) {
        const newRecado: Recado = {
            id: Date.now(),
            ...payload,
            date: new Date(),
        };
        MOCK_RECADOS.unshift(newRecado);
        return cloneRecado(newRecado);
    }

    const body = {
        user_id: payload.userId,
        from: payload.from,
        message: payload.message,
        read: payload.read,
    };

    const { data, error } = await supabase
        .from('recados')
        .insert(body)
        .select()
        .single();

    if (error || !data) {
        throw error ?? new Error('Erro ao enviar recado');
    }

    return mapRecadoRow(data);
};

export const toggleRecadoRead = async (recadoId: number, read: boolean): Promise<void> => {
    if (!isSupabaseConfigured() || !supabase) {
        const recado = MOCK_RECADOS.find(item => item.id === recadoId);
        if (recado) recado.read = read;
        return;
    }

    const { error } = await supabase
        .from('recados')
        .update({ read })
        .eq('id', recadoId);

    if (error) throw error;
};

export const markRecadosAsRead = async (userId: number): Promise<void> => {
    if (!isSupabaseConfigured() || !supabase) {
        MOCK_RECADOS.forEach(recado => {
            if (recado.userId === userId) {
                recado.read = true;
            }
        });
        return;
    }

    const { error } = await supabase
        .from('recados')
        .update({ read: true })
        .eq('user_id', userId);

    if (error) throw error;
};

export const listMemberEntities = async (userId?: number): Promise<MemberEntity[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        const source = typeof userId === 'number'
            ? MOCK_MEMBER_ENTITIES.filter(entity => entity.userId === userId)
            : MOCK_MEMBER_ENTITIES;
        return fallback(source, cloneMemberEntity);
    }

    let query = supabase.from('member_entities').select('*');
    if (typeof userId === 'number') {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data) {
        console.error('[Supabase] Falha ao carregar entidades de membros:', error);
        const source = typeof userId === 'number'
            ? MOCK_MEMBER_ENTITIES.filter(entity => entity.userId === userId)
            : MOCK_MEMBER_ENTITIES;
        return fallback(source, cloneMemberEntity);
    }

    return data.map(mapMemberEntityRow);
};

export const saveMemberEntity = async (
    payload: Omit<MemberEntity, 'id'> & { id?: number }
): Promise<MemberEntity> => {
    if (!isSupabaseConfigured() || !supabase) {
        if (payload.id) {
            const index = MOCK_MEMBER_ENTITIES.findIndex(entity => entity.id === payload.id);
            if (index > -1) {
                MOCK_MEMBER_ENTITIES[index] = { ...MOCK_MEMBER_ENTITIES[index], ...payload };
                return cloneMemberEntity(MOCK_MEMBER_ENTITIES[index]);
            }
        }

        const newEntity: MemberEntity = {
            id: payload.id ?? Date.now(),
            ...payload,
        };
        MOCK_MEMBER_ENTITIES.push(newEntity);
        return cloneMemberEntity(newEntity);
    }

    const body = {
        user_id: payload.userId,
        name: payload.name,
        line: payload.line,
        history: payload.history,
        curiosities: payload.curiosities,
    };

    if (payload.id) {
        const { data, error } = await supabase
            .from('member_entities')
            .update(body)
            .eq('id', payload.id)
            .select()
            .single();

        if (error || !data) {
            throw error ?? new Error('Erro ao atualizar entidade de membro');
        }

        return mapMemberEntityRow(data);
    }

    const { data, error } = await supabase
        .from('member_entities')
        .insert(body)
        .select()
        .single();

    if (error || !data) {
        throw error ?? new Error('Erro ao criar entidade de membro');
    }

    return mapMemberEntityRow(data);
};

export const deleteMemberEntity = async (entityId: number): Promise<void> => {
    if (!isSupabaseConfigured() || !supabase) {
        const index = MOCK_MEMBER_ENTITIES.findIndex(entity => entity.id === entityId);
        if (index > -1) {
            MOCK_MEMBER_ENTITIES.splice(index, 1);
        }
        return;
    }

    const { error } = await supabase.from('member_entities').delete().eq('id', entityId);
    if (error) throw error;
};

export const listSpiritualEntities = async (): Promise<SpiritualEntity[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return fallback(MOCK_ENTITIES, cloneSpiritualEntity);
    }

    const { data, error } = await supabase
        .from('spiritual_entities')
        .select('*')
        .order('name', { ascending: true });

    if (error || !data) {
        console.error('[Supabase] Falha ao carregar entidades espirituais:', error);
        return fallback(MOCK_ENTITIES, cloneSpiritualEntity);
    }

    return data.map(mapSpiritualEntityRow);
};

export const saveSpiritualEntity = async (
    payload: Omit<SpiritualEntity, 'id' | 'descriptionHistory'> & { id?: number }
): Promise<SpiritualEntity> => {
    if (!isSupabaseConfigured() || !supabase) {
        if (payload.id) {
            const index = MOCK_ENTITIES.findIndex(entity => entity.id === payload.id);
            if (index > -1) {
                MOCK_ENTITIES[index] = {
                    ...MOCK_ENTITIES[index],
                    ...payload,
                };
                return cloneSpiritualEntity(MOCK_ENTITIES[index]);
            }
        }

        const newEntity: SpiritualEntity = {
            id: payload.id ?? Date.now(),
            ...payload,
            descriptionHistory: [],
        };
        MOCK_ENTITIES.push(newEntity);
        return cloneSpiritualEntity(newEntity);
    }

    const body = {
        name: payload.name,
        line: payload.line,
        description: payload.description,
    };

    if (payload.id) {
        const { data, error } = await supabase
            .from('spiritual_entities')
            .update(body)
            .eq('id', payload.id)
            .select()
            .single();

        if (error || !data) {
            throw error ?? new Error('Erro ao atualizar entidade espiritual');
        }

        return mapSpiritualEntityRow(data);
    }

    const { data, error } = await supabase
        .from('spiritual_entities')
        .insert(body)
        .select()
        .single();

    if (error || !data) {
        throw error ?? new Error('Erro ao criar entidade espiritual');
    }

    return mapSpiritualEntityRow(data);
};

export const deleteSpiritualEntity = async (entityId: number): Promise<void> => {
    if (!isSupabaseConfigured() || !supabase) {
        const index = MOCK_ENTITIES.findIndex(entity => entity.id === entityId);
        if (index > -1) {
            MOCK_ENTITIES.splice(index, 1);
        }
        return;
    }

    const { error } = await supabase
        .from('spiritual_entities')
        .delete()
        .eq('id', entityId);

    if (error) throw error;
};

export const appendSpiritualEntityHistory = async (
    entityId: number,
    description: string
): Promise<void> => {
    if (!isSupabaseConfigured() || !supabase) {
        const entity = MOCK_ENTITIES.find(item => item.id === entityId);
        if (entity) {
            entity.descriptionHistory = [
                ...(entity.descriptionHistory ?? []),
                { timestamp: new Date(), description },
            ];
        }
        return;
    }

    const { error } = await supabase.rpc('append_spiritual_entity_history', {
        entity_id: entityId,
        description,
    });

    if (error) throw error;
};

export const listLoreEntries = async (): Promise<LoreEntry[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return fallback(MOCK_LORE, cloneLoreEntry);
    }

    const { data, error } = await supabase
        .from('lore_entries')
        .select('*')
        .order('title', { ascending: true });

    if (error || !data) {
        console.error('[Supabase] Falha ao carregar conteúdos históricos:', error);
        return fallback(MOCK_LORE, cloneLoreEntry);
    }

    return data.map(mapLoreRow);
};
