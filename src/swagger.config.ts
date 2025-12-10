import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

export const setupSwagger = (app: INestApplication): void => {
  const title = 'Runer Shoot';
  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription('API documentation')
    .setVersion('1.0')
    .setContact(title, 'https://www.joelestumano.com', 'joelestumano@gmail.com')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const theme = new SwaggerTheme();
  const options = {
    explorer: false,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: title,
  };
  SwaggerModule.setup('swagger', app, document, options);
};
