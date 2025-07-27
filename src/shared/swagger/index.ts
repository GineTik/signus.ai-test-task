import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';

export function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Ur.authentication service')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
