import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { ApiResponse } from 'src/common/types/response.type';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './types/token.type';
import { MailService } from 'src/mail/mail.service';
import envConfig from 'src/config/environment/env.config';
import { ConfigType } from '@nestjs/config';

import * as dayjs from 'dayjs';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    @Inject(envConfig.KEY)
    private readonly envConfiguration: ConfigType<typeof envConfig>,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
      role: user.role,
      fullname: `${user.name} ${user.lastname}`,
    };

    const access_token = this.jwtService.sign(payload);

    delete user.password;

    return {
      statusCode: 200,
      message: 'Login successfully',
      data: {
        access_token,
        user,
      },
    };
  }

  async sendVerificationEmail(user: TokenPayload): Promise<ApiResponse> {
    const currentUser = await this.userService.findOneByEmail(user.email);

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const otp = String(this.generateOTP());
    const duration = this.envConfiguration.OTP.expiresIn;
    const expiresAt = dayjs().add(duration, 'minutes').toDate();

    await this.userService.saveVerifyOTP(currentUser.id, otp, expiresAt);

    await this.mailService.sendVerificationEmail(
      currentUser.name,
      currentUser.email,
      otp,
    );

    return {
      statusCode: 200,
      message: 'Verification email sent',
      data: null,
    };
  }

  async verifyEmail(user: TokenPayload, otp: string): Promise<ApiResponse> {
    const response = await this.userService.findOneById(user.sub);
    const currentUser = response.data as User;

    const currentOtp = currentUser.emailVerificationOTP;
    const expiresAt = currentUser.emailVerificationExpires;

    if (otp !== currentOtp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (dayjs().isAfter(expiresAt)) {
      throw new BadRequestException('OTP expired');
    }

    await this.userService.verifyEmail(currentUser);

    return {
      statusCode: 200,
      message: 'Email verified',
      data: null,
    };
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
  }
}
