import { Module } from '@nestjs/common';
import { EnvModule } from './environment/env.module';

@Module({
  imports: [EnvModule],
})
export class ConfigModule {}
