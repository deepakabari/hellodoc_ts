interface Provider {
    id: number;
    firstName: string;
    lastName: string;
    photo: string;
    regions: object;
}

interface Group {
    [key: string]: Provider[];
}

export { Group };
