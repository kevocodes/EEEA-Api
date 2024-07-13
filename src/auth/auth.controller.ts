import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiResponse } from 'src/common/types/response.type';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from './types/token.type';
import { User } from 'src/common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OtpDto } from './dto/otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginInfo: LoginDto): Promise<ApiResponse> {
    return await this.authService.login(loginInfo);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getProfile(@User() user: TokenPayload): Promise<ApiResponse> {
    return this.userService.findOneById(user.sub);
  }

  @Post('send-verification-email')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async sendVerificationEmail(
    @User() user: TokenPayload,
  ): Promise<ApiResponse> {
    return await this.authService.sendVerificationEmail(user);
  }

  @Post('verify-email')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async verifyEmail(
    @User() user: TokenPayload,
    @Body() otpInfo: OtpDto,
  ): Promise<ApiResponse> {
    return await this.authService.verifyEmail(user, otpInfo.otp);
  }
}
