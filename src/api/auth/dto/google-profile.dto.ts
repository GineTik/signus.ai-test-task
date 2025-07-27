export class GoogleProfileDto {
  emails: Email[];
  name: Name;
  photos: Photo[];
}

class Email {
  value: string;
  verified: boolean;
}

class Name {
  givenName: string;
  familyName: string;
}

class Photo {
  value: string;
}
