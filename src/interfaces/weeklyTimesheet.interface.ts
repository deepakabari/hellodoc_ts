import { Optional } from 'sequelize';

interface WeeklyTimesheetAttributes {
    id: number;
    startDate: Date;
    endDate: Date;
    status?: number;
    physicianId: number;
    payRateId: number | null;
    adminId?: number;
    isFinalize?: boolean;
    adminNote?: string;
    bonusAmount?: number;
    totalAmount?: number;
}

type WeeklyTimesheetCreationAttributes = Optional<
    WeeklyTimesheetAttributes,
    'id'
>;

export { WeeklyTimesheetAttributes, WeeklyTimesheetCreationAttributes };
