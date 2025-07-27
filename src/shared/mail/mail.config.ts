import { ConfigService } from '@nestjs/config';

export const getMailerConfig = (configService: ConfigService) => ({
  transport: {
    host: configService.getOrThrow<string>('MAIL_HOST'),
    port: configService.getOrThrow<number>('MAIL_PORT'),
    secure: true,
    auth: {
      user: configService.getOrThrow<string>('MAIL_USER'),
      pass: configService.getOrThrow<string>('MAIL_PASSWORD'),
    },
  },
  defaults: {
    from: `"No Reply"  ${configService.getOrThrow<string>('MAIL_USER')}>`,
  },
});
