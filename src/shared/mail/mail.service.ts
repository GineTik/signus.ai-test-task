import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { DefaultMail } from './templates/default-mail';
import { render } from '@react-email/components';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendConfirmation(to: string, confirmationToken: string) {
    const html = await render(
      DefaultMail({
        title: 'Email confirmation',
        description:
          'Thank you for registering on our platform. To confirm your email, please follow the link below',
        confirmLink: confirmationToken,
      }),
    );
    await this.send(to, 'Email confirmation', html);
  }

  async sendPasswordRecovery(to: string, confirmLink: string) {
    const html = await render(
      DefaultMail({
        title: 'Password recovery',
        description: 'To recover your password, please follow the link below',
        confirmLink,
      }),
    );
    await this.send(to, 'Password recovery', html);
  }

  private async send(to: string, subject: string, html: string) {
    await this.mailer.sendMail({
      to,
      subject,
      html,
    });
  }
}
