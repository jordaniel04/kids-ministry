import { Timestamp } from 'firebase/firestore';

export type ParticipantLevel = 'distrital' | 'local';

export type ParticipantRole =
    | 'Líder Distrital'
    | 'Equipo Distrital'
    | 'Líder Local'
    | 'Equipo Local';

export interface TrainingEnrollment {
    id: string;
    graduationId: string;
    moduleId: string;
    participantName: string;
    participantRole: ParticipantRole;
    level: ParticipantLevel;
    districtId: string;
    districtName: string;
    churchId?: string;
    churchName?: string;
    grade: number;
    passed: boolean;
    enrolledAt: Timestamp;
    updatedAt: Timestamp;
}
