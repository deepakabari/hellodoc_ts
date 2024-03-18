import { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
    id: number;
    userName: string;
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    phoneNumber: string;
}

export { CustomJwtPayload };
