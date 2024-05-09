import { Optional } from 'sequelize';

interface TimesheetDetailAttributes {
    id: number;
    timesheetId: number;
    date: Date;
    onCallHours?: number;
    totalHours?: number;
    houseCall?: number;
    phoneConsult?: number;
    item?: string;
    amount?: number;
    bill?: string | null;
    isHoliday?: boolean;
    numberOfShifts?: number;
    nightShiftWeekend?: number;
    phoneConsultNightWeekend?: number;
    houseCallNightWeekend?: number;
    batchTesting?: number;
    totalAmount?: number;
    bonusAmount?: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

type TimesheetDetailCreationAttributes = Optional<
    TimesheetDetailAttributes,
    'id'
>;

export { TimesheetDetailAttributes, TimesheetDetailCreationAttributes };
