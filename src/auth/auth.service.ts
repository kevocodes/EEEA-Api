import { Injectable, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { ApiResponse } from 'src/common/types/response.type';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './types/token.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginInfo: LoginDto): Promise<ApiResponse> {
    const user = await this.userService.findOneByEmail(loginInfo.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatchPassword = await bcrypt.compare(
      loginInfo.password,
      user.password,
    );

    if (!isMatchPassword)
      throw new UnauthorizedException('Invalid credentials');

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      statusCode: 200,
      message: 'Login successfully',
      data: {
        access_token,
      },
    };
  }
}
