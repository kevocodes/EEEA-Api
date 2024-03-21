import {
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import * as bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { prismaExclude } from 'src/common/utils/exclude-arguments';
import { ApiResponse } from 'src/common/types/response.type';
import envConfig from 'src/config/environment/env.config';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

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

  async findAll(): Promise<ApiResponse> {
    const users = await this.prismaService.user.findMany({
      select: prismaExclude('User', ['password']),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Users found',
      data: users,
    };
  }

  async findOneById(id: string): Promise<ApiResponse> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete user.password;

    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: user,
    };
  }

  async updateOneById(
    id: string,
    userData: UpdateUserDto,
  ): Promise<ApiResponse> {
    // Check if user exists
    const { data: user } = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if new email is already in use
    if (userData.email && user.email !== userData.email) {
      const isEmailTaken = await this.prismaService.user.findUnique({
        where: {
          email: userData.email,
        },
      });

      if (isEmailTaken) {
        throw new ConflictException('This new email is already in use');
      }
    }

    const updatedUser = await this.prismaService.user.update({
      where: {
        id,
      },
      data: userData,
    });

    delete updatedUser.password;

    return {
      statusCode: HttpStatus.OK,
      message: 'User updated',
      data: updatedUser,
    };
  }

  async deleteOneById(id: string): Promise<ApiResponse> {
    // Check if user exists
    const { data: user } = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.user.delete({
      where: {
        id,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'User deleted',
      data: null,
    };
  }

  //--------------------------------
  //  Auxiliar service methods
  //--------------------------------
  async findOneByEmail(email: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
