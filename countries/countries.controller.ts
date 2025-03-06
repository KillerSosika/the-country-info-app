import { Controller, Get, Param } from '@nestjs/common';
import { CountriesService } from './countries.service';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  async getAvailableCountries() {
    return this.countriesService.getAvailableCountries();
  }

  @Get(':code')
  async getCountryInfo(@Param('code') code: string) {
    return this.countriesService.getCountryInfo(code);
  }

  @Get(':code/flag')
  async getCountryFlag(@Param('code') code: string) {
    const info = await this.countriesService.getCountryInfo(code);
    return { flagUrl: info.flagUrl, country: info.country };
}

}
