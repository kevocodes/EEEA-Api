import { Injectable, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { ApiResponse } from 'src/common/models/response.model';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async login(loginInfo: LoginDto): Promise<ApiResponse> {
    const { data: user } = await this.userService.findOneByEmail(
      loginInfo.email,
    );

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatchPassword = await bcrypt.compare(
      loginInfo.password,
      user.password,
    );

    if (!isMatchPassword)
      throw new UnauthorizedException('Invalid credentials');

    return {
      statusCode: 200,
      message: 'Login successfully',
      data: {
        user,
      },
    };
  }
}
