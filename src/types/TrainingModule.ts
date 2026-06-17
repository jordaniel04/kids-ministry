import { Timestamp } from 'firebase/firestore';

export interface CertificateTextConfig {
    nameX: number;
    nameY: number;
    dateX: number;
    dateY: number;
    fontSize: number;
    fontColor: string;
}

export interface TrainingModule {
    id: string;
    name: string;
    order: number;
    certificateImageUrl: string;
    certificateTextConfig: CertificateTextConfig;
    isActive: boolean;
    createdAt: Timestamp;
}
