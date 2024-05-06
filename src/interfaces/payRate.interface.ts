import { Optional } from 'sequelize';

interface PayRateAttributes {
    id: number;
    physicianId: number;
    nightShiftWeekend?: number;
    shift?: number;
    houseCallNightWeekend?: number;
    phoneConsult?: number;
    phoneConsultNightWeekend?: number;
    batchTesting?: number;
    houseCall?: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

type PayRateCreationAttributes = Optional<PayRateAttributes, 'id'>;

export { PayRateAttributes, PayRateCreationAttributes };
