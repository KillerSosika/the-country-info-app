import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CountriesService {
  constructor(private readonly httpService: HttpService) {}

  async getAvailableCountries(): Promise<any> {
    try {
      const url = 'https://date.nager.at/api/v3/AvailableCountries';
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Не вдалося отримати список країн',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getCountryInfo(countryCode: string): Promise<any> {
    try {
      // про країну 
      const infoUrl = `https://date.nager.at/api/v3/CountryInfo/${countryCode}`;
      const { data: countryInfo } = await firstValueFrom(this.httpService.get(infoUrl));
      
      
      const countryName = countryInfo.commonName || countryInfo.name || 'Unknown';

      const popUrl = 'https://countriesnow.space/api/v0.1/countries/population';
      const { data: popData } = await firstValueFrom(
        this.httpService.post(popUrl, { country: countryName }),
      );
      let population = null;
      if (popData && popData.data && popData.data.populationCounts) {
        const counts = popData.data.populationCounts;
        population = counts[counts.length - 1].value;
      }

      //  прапор 
      const flagUrl = 'https://countriesnow.space/api/v0.1/countries/flag/images';
      const { data: flagData } = await firstValueFrom(
        this.httpService.post(flagUrl, { country: countryName }),
      );
      let flagImageUrl = null;
      if (flagData && flagData.data && flagData.data.flag) {
        flagImageUrl = flagData.data.flag;
      }

      return {
        country: countryName,
        code: countryCode,
        region: countryInfo.region || null,
        population,
        flagUrl: flagImageUrl,
        borders: countryInfo.borders || [],
      };
    } catch (error) {
      throw new HttpException(
        'Не вдалося отримати інформацію про країну',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
