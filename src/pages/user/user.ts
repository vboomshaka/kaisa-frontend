
export interface UserProps {
    id: number;
    name: string;
    username: string;
    email: string;
    age?: number;
    gender?: string;
    role: string;
    permissions?: string[];
    loginTime?: Date;
}