import { Timestamp } from 'firebase/firestore';

export interface DistrictLeader {
    id: string;
    districtId: string;
    userId: string;
    role: 'primary' | 'secondary';
    startDate: Timestamp;
    endDate?: Timestamp;
    isActive: boolean;
    previousLeaderName?: string;
    areaNumber?: number;
    districtNumber?: number;
    location?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    createdBy?: string;
    updatedBy?: string;
}