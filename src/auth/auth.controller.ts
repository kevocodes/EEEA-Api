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
import { ApiTags } from '@nestjs/swagger';

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
  @UseGuards(JwtAuthGuard)
  getProfile(@User() user: TokenPayload): Promise<ApiResponse> {
    return this.userService.findOneById(user.sub);
  }
}
