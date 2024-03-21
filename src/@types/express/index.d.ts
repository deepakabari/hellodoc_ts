export {};
declare global {
    namespace Express {
        interface Request {
            user: {
                id: number;
                userName: string;
                email: string;
                password: string;
                firstName: string;
                lastName?: string;
                phoneNumber: string;
            };
        }
    }
}
