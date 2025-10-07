import { Role, EventType, ImageCategory, type User, type Event, type PrayerRequest, type Announcement, type DiaryEntry, type GalleryImage, type SpiritualEntity, type LoreEntry, type Recado, type MemberEntity, type UserCredential } from './types';

export const MOCK_USERS: User[] = [
    { id: 1, name: 'Henrique Versuri', email: 'versurih@gmail.com', role: Role.ADM },
    { id: 2, name: 'Membro Teste', email: 'membro@conselhoreal.com', role: Role.MEMBRO, memberSince: '2022-01-15', allergies: 'Amendoim' },
    { id: 3, name: 'Joana Silva', email: 'joana@email.com', role: Role.MEMBRO, memberSince: '2021-11-20' },
];

export const MOCK_USER_CREDENTIALS: UserCredential[] = [
    { email: 'versurih@gmail.com', password: 'reidas7ebrilhantina' },
    { email: 'membro@conselhoreal.com', password: 'visitante123' },
];

export const MOCK_EVENTS: Event[] = [
    { id: 1, title: 'Gira de Exu', type: EventType.GIRA, date: new Date(new Date().setDate(new Date().getDate() + 5)), capacity: 50, attendees: 45 },
    { id: 2, title: 'Atendimento com Malandros', type: EventType.ATENDIMENTO, date: new Date(new Date().setDate(new Date().getDate() + 12)), capacity: 30, attendees: 30 },
    { id: 3, title: 'Estudo de Doutrina', type: EventType.ESTUDO, date: new Date(new Date().setDate(new Date().getDate() + 19)), capacity: 25, attendees: 15 },
    { id: 4, title: 'Gira de Pombagira', type: EventType.GIRA, date: new Date(new Date().setDate(new Date().getDate() + 26)), capacity: 50, attendees: 20 },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: 1, title: 'Vestimenta para Giras de Exu', content: 'Lembramos a todos os médiuns e consulentes que a vestimenta para as giras de Exu é obrigatoriamente preta ou vermelha.', date: '01/07/2024' },
    { id: 2, title: 'Campanha do Agasalho', content: 'Estamos arrecadando agasalhos e cobertores para doação. As entregas podem ser feitas na secretaria.', date: '28/06/2024' },
];

export const MOCK_PRAYER_REQUESTS: PrayerRequest[] = [
    { id: 1, initials: 'J.S.', request: 'Peço por caminhos abertos no meu trabalho e proteção para minha família.', timestamp: new Date() },
    { id: 2, initials: 'M.A.P.', request: 'Agradeço pela saúde recuperada e peço que a luz continue a me guiar.', timestamp: new Date() },
    { id: 3, initials: 'C.L.', request: 'Forças para superar um momento difícil e clareza para tomar decisões importantes.', timestamp: new Date() },
];

export const MOCK_DIARY_ENTRIES: DiaryEntry[] = [
    { id: 1, userId: 2, title: "Sonho com o Tridente", content: "Sonhei que estava em uma encruzilhada e via um tridente brilhando em dourado. Senti uma forte presença e proteção.", tags: ["sonho", "proteção"], createdAt: new Date(new Date().setDate(new Date().getDate() - 2)), dueDate: new Date(new Date().setDate(new Date().getDate() - 1)), attachment: { name: "esboco_sonho.jpg", size: 1024 * 500 } },
    { id: 2, userId: 2, title: "Estudo sobre a Linha dos Malandros", content: "Li sobre a sabedoria e a astúcia de Zé Pelintra. Entendi melhor a importância da alegria e da ginga para quebrar demandas.", tags: ["estudo", "malandragem"], createdAt: new Date(new Date().setDate(new Date().getDate() - 1)), dueDate: new Date(new Date().setDate(new Date().getDate() + 5)) },
    { id: 3, userId: 1, title: "Observações da Gira", content: "A energia da corrente estava muito forte hoje. O trabalho de limpeza foi intenso e necessário.", tags: ["gira", "admin"], createdAt: new Date() },
];

export const MOCK_IMAGES: GalleryImage[] = [
    { id: 1, src: 'https://picsum.photos/seed/terreiro1/800/600', alt: 'Fachada do terreiro à noite', caption: 'Fachada do Conselho Real, iluminada para uma noite de trabalhos.', category: ImageCategory.TERREIRO },
    { id: 2, src: 'https://picsum.photos/seed/evento1/800/600', alt: 'Médiuns reunidos em uma gira', caption: 'Corrente mediúnica formada durante Gira de Caboclos.', category: ImageCategory.EVENTOS },
    { id: 3, src: 'https://picsum.photos/seed/simbolo1/800/600', alt: 'Ponto riscado de Exu Rei', caption: 'Ponto riscado de Exu Rei das Sete Encruzilhadas, firmado para proteção.', category: ImageCategory.SIMBOLOS },
    { id: 4, src: 'https://picsum.photos/seed/terreiro2/800/600', alt: 'Congá do terreiro', caption: 'Nosso congá, o altar sagrado onde depositamos nossa fé e pedidos.', category: ImageCategory.TERREIRO },
    { id: 5, src: 'https://picsum.photos/seed/evento2/800/600', alt: 'Atendimento com Preto Velho', caption: 'Momento de sabedoria e conselho durante atendimento de Preto Velho.', category: ImageCategory.EVENTOS },
    { id: 6, src: 'https://picsum.photos/seed/simbolo2/800/600', alt: 'Guia de Zé da Brilhantina', caption: 'Guia representativa da entidade Mestre Zé da Brilhantina.', category: ImageCategory.SIMBOLOS },
    { id: 7, src: 'https://picsum.photos/seed/evento3/800/600', alt: 'Festa de Cosme e Damião', caption: 'Distribuição de doces e alegria na celebração de Crianças.', category: ImageCategory.EVENTOS },
    { id: 8, src: 'https://picsum.photos/seed/terreiro3/800/600', alt: 'Jardim de ervas do terreiro', caption: 'Nosso jardim, onde cultivamos as ervas sagradas para banhos e defumações.', category: ImageCategory.TERREIRO },
];

export const MOCK_ENTITIES: SpiritualEntity[] = [
    { id: 1, name: 'Exu Rei das Sete Encruzilhadas', description: 'Rei da Lira e Senhor dos Sete Reinos, guardião dos caminhos e da comunicação entre os mundos. Trabalha com a ordem, a lei e a justiça.', line: 'Exu', descriptionHistory: [] },
    { id: 2, name: 'Mestre Zé da Brilhantina', description: 'Malandro de luz, que traz a alegria, a ginga e a sabedoria das ruas para quebrar demandas e abrir caminhos. Trabalha com a cura, a prosperidade e a proteção.', line: 'Malandragem', descriptionHistory: [] },
];

export const MOCK_LORE: LoreEntry[] = [
    { id: 1, title: 'A Fundação do Conselho Real', content: 'O Conselho Real foi fundado em uma noite de lua cheia, sob a orientação direta de Exu Rei, com a missão de ser um farol de caridade e firmeza na Umbanda.', relatedEntities: [1, 2] },
    { id: 2, title: 'A Importância da Firmeza', content: 'A firmeza é um dos pilares de nossa casa. É a disciplina do médium, a seriedade no trabalho e o respeito às entidades que garantem a segurança e a eficácia dos rituais.', relatedEntities: [] },
];

export const MOCK_RECADOS: Recado[] = [
    { id: 1, userId: 2, from: 'Admin', message: 'Lembrança da vestimenta para a Gira de Sábado.', date: new Date(), read: false },
    { id: 2, userId: 2, from: 'Admin', message: 'Sua presença é solicitada na reunião de cambones.', date: new Date(new Date().setDate(new Date().getDate() - 1)), read: true },
    { id: 3, userId: 3, from: 'Admin', message: 'Por favor, confirme sua presença no estudo de doutrina.', date: new Date(), read: false },
];

export const MOCK_MEMBER_ENTITIES: MemberEntity[] = [
    { id: 1, userId: 2, name: 'Tranca Ruas das Almas', line: 'Exu', history: 'Um dos chefes de falange da linha de Exus. Trabalha na vibração das Almas, é um guardião que atua no controle do instinto e da razão dos seres.', curiosities: 'Gosta de charutos fortes, uísque e sua capa preta com forro vermelho.' },
    { id: 2, userId: 2, name: 'Maria Padilha das 7 Encruzilhadas', line: 'Pombagira', history: 'Rainha da encruzilhada, uma entidade de grande força e sabedoria. Ajuda em questões de amor, prosperidade e quebra de feitiços.', curiosities: 'Sua cor é o vermelho e preto, aprecia rosas vermelhas e champanhe.' },
    { id: 3, userId: 3, name: 'Caboclo Pena Branca', line: 'Caboclos', history: 'Vem da linha de Oxalá, trazendo paz, cura e sabedoria. É um grande conhecedor das ervas e rituais de limpeza espiritual.', curiosities: 'Trabalha com ervas de cura, especialmente o alecrim e a arruda.' },
];