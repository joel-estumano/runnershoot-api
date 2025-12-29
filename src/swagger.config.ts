import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

export const setupSwagger = (app: INestApplication): void => {
  const title = 'Runner Shoot';
  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription('API documentation')
    .setVersion('1.0')
    .setContact(title, 'https://www.joelestumano.com', 'joelestumano@gmail.com')
    .addCookieAuth('access_token') // Define the security scheme for cookie authentication Name of your cookie
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const theme = new SwaggerTheme();
  const options: SwaggerCustomOptions = {
    explorer: false,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
    swaggerOptions: {
      persistAuthorization: true,
      credentials: 'include', // This tells the Swagger UI to include cookies in cross-origin requests
    },
    customSiteTitle: title,
  };
  SwaggerModule.setup('swagger', app, document, options);
};
