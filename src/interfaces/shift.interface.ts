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
}

type ShiftCreationAttributes = Optional<ShiftAttributes, 'id'>;

export { ShiftAttributes, ShiftCreationAttributes };
