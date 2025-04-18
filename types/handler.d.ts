export interface SetType {
  headers: HTTPHeaders;
  status?: number | keyof StatusMap;
  redirect?: string;
  cookie?: Record<string, ElysiaCookie>;
}

export interface JWTType {
  verify: (jwt?: string, env?: string) => Promise<UserPayloadType | null>;
  sign: (payload: UserPayloadType, env?: string) => Promise<string>;
}
