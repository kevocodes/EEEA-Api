import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
@Module({
  imports: [AuthModule, ConfigModule, UsersModule, EventsModule],
})
export class AppModule {}
