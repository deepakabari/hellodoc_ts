export {};
declare global {
    namespace Express {
        interface Request {
            user: {
                accountType?: string;
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
