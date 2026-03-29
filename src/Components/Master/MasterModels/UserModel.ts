export interface User {
    userID: number;
    email: string;
    roleID: number;
    roleName?: string;
}

export interface AddNewUserRequest {
    Email: string;
    PasswordHash: string;
    RoleID: number;
}
