export const MAIL_SERVICE = Symbol('MAIL_SERVICE');

export interface MailService {
  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
}
