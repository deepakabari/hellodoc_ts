import { Region, Request } from '../db/models';

// generate the abbreviation of given state for confirmation number
export const getAbbreviationFromDb = async (
    name: string,
): Promise<string | undefined> => {
    try {
        const regionEntry = await Region.findOne({
            where: { name },
        });
        return regionEntry ? regionEntry?.abbreviation : undefined;
    } catch (error) {
        throw error;
    }
};