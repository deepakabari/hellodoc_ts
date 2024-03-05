import { Optional } from 'sequelize'

interface RegionAttributes {
    id: number;
    name: string
    abbreviation: string
}

type RegionCreationAttributes = Optional<RegionAttributes, 'id'>

export { RegionAttributes, RegionCreationAttributes }