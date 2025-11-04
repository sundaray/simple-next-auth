export interface CookieOptions {
  maxAge: number;
}

export interface AuthAdapter {
  setCookie(name: string, value: string, options: CookieOptions): Promise<void>;

  getCookie(name: string): Promise<string | undefined>;

  deleteCookie(name: string): Promise<void>;

  redirect(url: string, type?: string): void;
}
