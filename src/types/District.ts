import { Timestamp } from 'firebase/firestore';

export interface District {
    id: string;
    areaNumber: number;
    districtNumber: number;
    location: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
} 