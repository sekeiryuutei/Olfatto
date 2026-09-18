import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../domain/ports/mail.port';

/**
 * Placeholder adapter: logs the reset link instead of sending an email.
 * Swap for a real provider (SMTP, SES, Resend...) by implementing
 * MailService and rebinding MAIL_SERVICE in auth.module.ts — nothing
 * in the domain/application layers needs to change (point 91).
 */
@Injectable()
export class ConsoleMailAdapter implements MailService {
  private readonly logger = new Logger('MailService');

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    this.logger.log(
      `[STUB] Password reset link for ${email}: ` +
        `https://olfatto.app/reset-password?token=${resetToken}`,
    );
  }
}
