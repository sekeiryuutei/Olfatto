import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/users/domain/repositories/user.repository.port';
import { TOKEN_SERVICE, TokenService } from '../../domain/ports/token-service.port';
import { MAIL_SERVICE, MailService } from '../../domain/ports/mail.port';

@Injectable()
export class ForgotPasswordUseCase implements UseCase<string, void> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(MAIL_SERVICE) private readonly mailService: MailService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    // Never reveal whether the email exists — always resolve the same way.
    if (!user) return;

    const resetToken = this.tokenService.generatePasswordResetToken(user.id);
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
  }
}
