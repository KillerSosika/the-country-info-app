import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { UsersCalendarService } from './users-calendar.service';
import { AddHolidaysDto } from './dto/add-holidays.dto';

@Controller('users')
export class UsersCalendarController {
  constructor(private readonly usersCalendarService: UsersCalendarService) {}

  @Post(':userId/calendar/holidays')
  async addHolidays(
    @Param('userId') userId: number,
    @Body() addHolidaysDto: AddHolidaysDto,
  ) {
    return this.usersCalendarService.addHolidaysToCalendar(userId, addHolidaysDto);
  }

  @Get(':userId/calendar')
  async getUserCalendar(@Param('userId') userId: number) {
    return this.usersCalendarService.findUserCalendar(userId);
  }
}
