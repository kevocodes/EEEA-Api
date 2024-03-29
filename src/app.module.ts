import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ActivitiesModule } from './activities/activities.module';
import { InstallationsModule } from './installations/installations.module';
@Module({
  imports: [AuthModule, ConfigModule, UsersModule, EventsModule, ActivitiesModule, InstallationsModule],
})
export class AppModule {}
