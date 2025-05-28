export interface UserTypePayload {
  id: string;
  fullName: string;
  status: string;
}

export interface UserTypeInput {
  firstName: string;
  surname: string;
  email: string;
  password: string;
}
