import { Module } from '@nestjs/common';
import { UsersCalendarService } from './users-calendar.service';
import { UsersCalendarController } from './users-calendar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCalendar } from './user-calendar.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([UserCalendar]), HttpModule],
  providers: [UsersCalendarService],
  controllers: [UsersCalendarController],
})
export class UsersCalendarModule {}
