export interface User {
    id: string;
    email: string;
    role: string;
    district?: string | null;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}