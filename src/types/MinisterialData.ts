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
    rescueClubChildren: number;
    discipleshipGraduates: number;
    connection911Children: number;
    updatedAt: Timestamp;
    reportPeriodId?: string | null;
}

export type NumericFields = Exclude<keyof MinisterialData, 'updatedAt' | 'reportPeriodId' | 'totalChildren'>;

export interface LocalItem {
    id?: string;
    name: string;
    leaderName: string;
    ministerialData: MinisterialData;
} 