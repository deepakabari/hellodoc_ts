import { Optional } from 'sequelize';

interface OrderDetailsAttributes {
    id: number;
    userId: number;
    vendorId: number;
    prescription: string;
    noOfRefill?: number;
}

type OrderDetailsCreationAttributes = Optional<OrderDetailsAttributes, 'id'>;

export { OrderDetailsAttributes, OrderDetailsCreationAttributes };
