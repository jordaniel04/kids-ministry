import { Timestamp } from 'firebase/firestore';

export interface MinisterialData {
    totalTeachers: number;
    totalChildren: number;
    convertedChildren: number;
    memberChildren: number;
    nonRepentantChildren: number;
    baptizedChildren: number;
    consolidatedGraduates: number;
    sacramentsGraduates: number;
    discipleshipGraduates: number;
    isInactiveForPeriod?: boolean;
    updatedAt: Timestamp;
    reportPeriodId?: string | null;
}

export type NumericFields = Exclude<keyof MinisterialData, 'updatedAt' | 'reportPeriodId' | 'totalChildren' | 'isInactiveForPeriod'>;

export interface LocalItem {
    id?: string;
    name: string;
    leaderName: string;
    ministerialData: MinisterialData;
} 