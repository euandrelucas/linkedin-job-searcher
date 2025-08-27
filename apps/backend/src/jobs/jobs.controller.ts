import { Controller, Get, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { SearchJobsDto } from './dto/search-jobs.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('search')
  async search(@Query() query: SearchJobsDto) {
    return this.jobsService.searchJobs(query);
  }
}
