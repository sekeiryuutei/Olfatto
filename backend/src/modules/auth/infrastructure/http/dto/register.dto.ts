import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Víctor Burbano' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @ApiProperty({ example: 'victor@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Str0ng!Passw0rd', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt's effective input limit
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and a number.',
  })
  password: string;
}
