import { Optional } from 'sequelize';

interface ShiftAttributes {
    id: number;
    physicianId: number;
    shiftDate: Date;
    region: string;
    startTime?: string;
    endTime?: string;
    isRepeat?: boolean;
    repeatUpto?: number;
    sunday?: boolean;
    monday?: boolean;
    tuesday?: boolean;
    wednesday?: boolean;
    thursday?: boolean;
    friday?: boolean;
    saturday?: boolean;
    isApproved?: boolean;
    isDeleted?: boolean;
    startDate?: string;
    endDate?: string;
    regions?: any;
}

type ShiftCreationAttributes = Optional<ShiftAttributes, 'id'>;

export { ShiftAttributes, ShiftCreationAttributes };
