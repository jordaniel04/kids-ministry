import { Timestamp } from 'firebase/firestore';
import type { MinisterialData } from './MinisterialData';

export interface Church {
    id: string;
    name: string;
    leaderName: string;
    districtId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
    updatedBy: string;
    isActive: boolean;
    ministerialData: MinisterialData[];
} 