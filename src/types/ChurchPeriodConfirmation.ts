import type { Timestamp } from "firebase/firestore";

export interface ChurchPeriodConfirmation {
    churchId: string;
    periodId: string;
    districtId: string;
    confirmedAt: Timestamp;
    confirmedBy: string;
    isLocked: boolean;
}