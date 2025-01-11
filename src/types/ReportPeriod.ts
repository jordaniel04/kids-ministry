import type { Timestamp } from "firebase/firestore";

interface ReportPeriod {
    id: string;
    startDate: Timestamp;
    endDate: Timestamp;
    isActive: boolean;
    name: string; // ejemplo: "Marzo 2024"
    description?: string;
}