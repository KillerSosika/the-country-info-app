import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCalendar } from './user-calendar.entity';
import { AddHolidaysDto } from './dto/add-holidays.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties?: string[] | null;
  launchYear?: number | null;
  type: string;
}

@Injectable()
export class UsersCalendarService {
  private readonly logger = new Logger(UsersCalendarService.name);

  constructor(
    @InjectRepository(UserCalendar)
    private readonly calendarRepository: Repository<UserCalendar>,
    private readonly httpService: HttpService,
  ) {}

  private async fetchPublicHolidays(countryCode: string, year: number): Promise<PublicHoliday[]> {
    const holidaysUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
    try {
      const response = await firstValueFrom(this.httpService.get(holidaysUrl));
      if (!Array.isArray(response.data)) {
        throw new Error('Неверный формат ответа от PublicHolidays API');
      }
      return response.data;
    } catch (error) {
      this.logger.error(`Ошибка при получении праздников для ${countryCode} за ${year}:`, error);
      throw new HttpException('Не удалось получить данные праздников', HttpStatus.BAD_GATEWAY);
    }
  }

  private async fetchFlagUrl(countryCode: string): Promise<string> {
    const flagApiUrl = `https://restcountries.com/v3.1/alpha/${countryCode}`;
    try {
      const { data } = await firstValueFrom(this.httpService.get(flagApiUrl));
      if (data && data[0] && data[0].flags && data[0].flags.png) {
        return data[0].flags.png;
      }
      return null;
    } catch (error) {
      this.logger.error(`Ошибка при получении флага для страны ${countryCode}:`, error);
      return null;
    }
  }
  
  

  async addHolidaysToCalendar(userId: number, addHolidaysDto: AddHolidaysDto): Promise<any> {
    const { countryCode, year, holidays } = addHolidaysDto;
    try {
      const allHolidays: PublicHoliday[] = await this.fetchPublicHolidays(countryCode, year);

      const selectedHolidays = holidays && holidays.length > 0
        ? allHolidays.filter(holiday => holidays.includes(holiday.name))
        : allHolidays;

      if (selectedHolidays.length === 0) {
        throw new HttpException('Не найдены праздники по заданным критериям', HttpStatus.NOT_FOUND);
      }

      const flagUrl = await this.fetchFlagUrl(countryCode);

      const events = selectedHolidays.map(holiday =>
        this.calendarRepository.create({
          userId,
          countryCode,
          holidayName: holiday.name,
          date: holiday.date,
          flagUrl, 
        }),
      );

      await this.calendarRepository.save(events);

      return { message: 'Свята добавлены в календарь', count: events.length };
    } catch (error) {
      this.logger.error('Ошибка при добавлении праздников в календарь:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Не удалось добавить праздники в календарь', HttpStatus.BAD_REQUEST);
    }
  }

  async findUserCalendar(userId: number): Promise<UserCalendar[]> {
    try {
      return await this.calendarRepository.find({ where: { userId } });
    } catch (error) {
      this.logger.error(`Ошибка при получении календаря для пользователя ${userId}:`, error);
      throw new HttpException('Не удалось получить календарь', HttpStatus.BAD_REQUEST);
    }
  }
}
