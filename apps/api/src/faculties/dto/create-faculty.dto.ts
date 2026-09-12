import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase latin letters, numbers, and hyphens',
  })
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
