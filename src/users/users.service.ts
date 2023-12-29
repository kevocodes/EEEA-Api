import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/users.dto';
import { ApiResponse } from 'src/common/models/response.model';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userData: CreateUserDto): Promise<ApiResponse> {
    const user = await this.prismaService.user.create({
      data: userData,
    });

    console.log(user);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created',
      data: userData,
    };
  }
}
