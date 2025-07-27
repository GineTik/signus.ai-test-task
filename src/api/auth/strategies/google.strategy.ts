import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { GOOGLE_PROVIDER, GOOGLE_REDIRECT_URL } from '../auth.constants';
import { LoginByGoogleDto } from '../dto/login-by-google.dto';
import { GoogleProfileDto } from '../dto/google-profile.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  GOOGLE_PROVIDER,
) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: GOOGLE_REDIRECT_URL,
      scope: ['email', 'profile'],
      accessType: 'offline',
      prompt: 'consent',
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfileDto,
  ): LoginByGoogleDto {
    const { emails, photos } = profile;
    return {
      email: emails?.[0]?.value,
      isVerified: emails?.[0]?.verified,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      picture: photos?.[0]?.value,
      accessToken,
      refreshToken,
    };
  }
}
