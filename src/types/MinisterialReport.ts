import { Timestamp } from 'firebase/firestore';
import type { Church } from './Church';

export interface MinisterialReport {
    id: string;
    districtId: string;
    userId: string;
    reportPeriod: string;
    reportDate: Timestamp;
    churches: Church[];
    status: 'draft' | 'submitted';
    previousReportId?: string;
    totalSummary: {
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
    };
}

export interface ReportPeriod {
    id: string;
    name: string;
    description?: string;
    startDate: Timestamp;
    endDate: Timestamp;
    isActive: boolean;
    allowEditing: boolean;
}