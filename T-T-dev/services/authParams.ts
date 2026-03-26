export interface SignupParams {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  userid?: string;
  refreshToken?: string;
}
