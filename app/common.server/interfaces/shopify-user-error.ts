export interface UserError<T = string> {
    field: string;
    message: string[];
    code: T,
}