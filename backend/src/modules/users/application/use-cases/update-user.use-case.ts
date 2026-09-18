import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { User } from '../../domain/entities/user.entity';
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository.port';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';

export interface UpdateUserInput {
  userId: string;
  name?: string;
  avatarUrl?: string | null;
}

@Injectable()
export class UpdateUserUseCase implements UseCase<UpdateUserInput, User> {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<User> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new UserNotFoundException(input.userId);

    user.updateProfile({ name: input.name, avatarUrl: input.avatarUrl });

    return this.userRepository.save(user);
  }
}
