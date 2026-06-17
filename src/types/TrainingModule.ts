import { Timestamp } from 'firebase/firestore';

export interface CertificateTextConfig {
    nameX: number;
    nameY: number;
    dateX: number;
    dateY: number;
    fontSize: number;
    fontColor: string;
}

export type ModuleType = 'ruta' | 'certificacion';

export interface TrainingModule {
    id: string;
    name: string;
    order: number;
    moduleType: ModuleType;
    certificateImageUrl: string;
    certificateTextConfig: CertificateTextConfig;
    isActive: boolean;
    createdAt: Timestamp;
}
