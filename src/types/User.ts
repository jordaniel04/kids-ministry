import { Timestamp } from 'firebase/firestore';

export interface User {
    id: string;
    email: string;
    role: 'admin' | 'lider';
    lastLogin?: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}