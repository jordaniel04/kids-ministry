import { Timestamp } from 'firebase/firestore';

export type GroupLevel = 'nacional' | 'distrital';

export interface TrainingGroup {
    id: string;
    moduleId: string;
    groupName: string;
    graduationDate: Timestamp;
    level: GroupLevel;
    districtId?: string;
    districtName?: string;
    createdAt: Timestamp;
}
