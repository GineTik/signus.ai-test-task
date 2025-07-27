export class LoginByGoogleDto {
  accessToken: string;
  refreshToken: string;
  email: string;
  isVerified: boolean;
  picture: string;
  firstName: string;
  lastName: string;
}
