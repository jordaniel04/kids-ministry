import { Timestamp } from 'firebase/firestore';

export type ParticipantRole =
    | 'Pastor'
    | 'Líder Distrital'
    | 'Equipo Distrital'
    | 'Líder Local'
    | 'Equipo Local';

export type GradeStatus = 'aprobado' | 'observado' | 'reprobado';

export interface EnrollmentAttempt {
    groupName: string;
    graduationDate: Timestamp;
    grade: number;
    gradeStatus: GradeStatus;
}

export function getGradeStatus(grade: number): GradeStatus {
    if (grade >= 14) return 'aprobado';
    if (grade >= 11) return 'observado';
    return 'reprobado';
}

export interface TrainingEnrollment {
    id: string;
    moduleId: string;
    groupName: string;
    graduationDate: Timestamp;
    participantName: string;
    participantRole: ParticipantRole;
    districtId: string;
    districtName: string;
    grade: number;
    passed: boolean;
    gradeStatus: GradeStatus;
    enrolledAt: Timestamp;
    updatedAt: Timestamp;
    attempts?: EnrollmentAttempt[];
    prerequisitePending?: boolean;
    isActive?: boolean;
    deactivatedAt?: Timestamp;
}
