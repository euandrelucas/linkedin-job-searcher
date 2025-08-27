import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 3600 * 1000,
      max: 100,
    }),
  ],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
