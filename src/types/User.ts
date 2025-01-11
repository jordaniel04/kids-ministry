export interface User {
    id: string;
    email: string;
    role: string;
    lastLogin?: string;
    createdAt?: Date;
    updatedAt?: Date;
    areaNumber?: number;
    districtNumber?: number;
    location?: string;
}