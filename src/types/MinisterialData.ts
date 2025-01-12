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
    reportPeriodId?: string;
} 