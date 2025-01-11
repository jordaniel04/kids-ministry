export interface User {
    id: string;
    email: string;
    role: string;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    areaNumber?: number;
    districtNumber?: number;
    location?: string;
}