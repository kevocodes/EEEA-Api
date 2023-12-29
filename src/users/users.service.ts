import {
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ApiResponse } from 'src/common/models/response.model';
import envConfig from 'src/config/environment/env.config';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(envConfig.KEY)
    private readonly config: ConfigType<typeof envConfig>,
    private readonly prismaService: PrismaService,
  ) {}

  async create(userData: CreateUserDto): Promise<ApiResponse> {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(
      userData.password,
      this.config.hash.rounds,
    );
    userData.password = hashedPassword;

    const user = await this.prismaService.user.create({
      data: userData,
    });

    delete user.password;

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created',
      data: user,
    };
  }
}
