declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface User {
  id: number;
  email: string;
  iat: number;
  exp: number;
}
