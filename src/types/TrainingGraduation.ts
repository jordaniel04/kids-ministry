import { Timestamp } from 'firebase/firestore';

export interface TrainingGraduation {
    id: string;
    moduleId: string;
    moduleName: string;
    graduationDate: Timestamp;
    description?: string;
    createdAt: Timestamp;
}
