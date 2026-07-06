import { Timestamp } from 'firebase/firestore';

export type ModuleType = 'ruta' | 'certificacion';

export interface TrainingModule {
    id: string;
    name: string;
    order: number;
    moduleType: ModuleType;
    certificateTemplateUrl: string;
    isActive: boolean;
    createdAt: Timestamp;
}
