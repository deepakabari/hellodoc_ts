import { Optional } from 'sequelize';

interface ShiftAttributes {
    id: number;
    physicianId: number;
    shiftDate: Date;
    region: string;
    startTime?: string;
    endTime?: string;
    isRepeat?: boolean;
    weekDays?: string;
    repeatUpto?: number;
    isApproved?: boolean;
    isDeleted?: boolean;
    startDate?: string
    endDate?: string
    regions?: any
}

type ShiftCreationAttributes = Optional<ShiftAttributes, 'id'>;

export { ShiftAttributes, ShiftCreationAttributes };
