import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserCalendar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  countryCode: string;

  @Column()
  holidayName: string;

  @Column()
  date: string; 
}
