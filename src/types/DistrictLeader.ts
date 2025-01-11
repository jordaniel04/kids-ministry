import { Timestamp } from 'firebase/firestore';

export interface DistrictLeader {
    id: string;
    districtId: string;
    userId: string;
    role: 'primary' | 'secondary';
    startDate: Timestamp;
    endDate?: Timestamp;
    isActive: boolean;
}