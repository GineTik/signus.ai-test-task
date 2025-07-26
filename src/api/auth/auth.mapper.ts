import { RegisterDto } from './dto/register.dto';
import bcrypt from 'bcrypt';

export async function mapRegisterDtoToUser(dto: RegisterDto) {
  return {
    email: dto.email,
    password: await bcrypt.hash(dto.password, 10),
    fullName: dto.fullName,
  };
}
