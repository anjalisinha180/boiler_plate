import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import * as fs from 'node:fs';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { DebugInterceptor } from './shared/interceptors/debug.interceptor';

async function bootstrap(): Promise<void> {
  const httpsEnabled = process.env.HTTPS_ENABLED === 'true';
  const app = httpsEnabled
    ? await NestFactory.create(AppModule, {
        httpsOptions: {
          key: fs.readFileSync(
            process.env.SSL_KEY_PATH || '/certs/privateKey.key',
          ),
          cert: fs.readFileSync(process.env.SSL_CERT_PATH || '/certs/cert.pem'),
        },
      })
    : await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      originAgentCluster: false,
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  app.enableCors({ origin: corsOrigin, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(app.get(DebugInterceptor));

  app.setGlobalPrefix(apiPrefix);

  const swaggerEnabled = configService.get<boolean>('SWAGGER_ENABLED', true);
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(configService.get<string>('SWAGGER_TITLE', 'API Documentation'))
      .setDescription(
        configService.get<string>('SWAGGER_DESCRIPTION', 'API Documentation'),
      )
      .setVersion(configService.get<string>('SWAGGER_VERSION', '1.0.0'))
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'NextAuth JWT',
          description: 'Enter NextAuth JWT token',
          in: 'header',
        },
        'NextAuth-Bearer',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'x-nextauth-token',
          in: 'header',
          description: 'NextAuth JWT token via custom header',
        },
        'NextAuth-Header',
      )
      .addBasicAuth(
        {
          type: 'http',
          scheme: 'basic',
          name: 'Basic Auth',
          description: 'Enter username and password for authentication',
        },
        'Basic-auth',
      )
      .build();

    const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api/docs');
    const swaggerHost = process.env.SWAGGER_HOST ?? `http://localhost:${port}`;
    const swaggerUrl = `${swaggerHost}/api-json`;

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        showRequestHeaders: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        url: swaggerUrl,
        validatorUrl: null,
      },
      customSiteTitle: configService.get<string>(
        'SWAGGER_TITLE',
        'API Documentation',
      ),
      useGlobalPrefix: false,
    });
  }

  await app.listen(port);

  console.log(
    `Application running on: ${httpsEnabled ? 'https' : 'http'}://localhost:${port}/${apiPrefix}`,
  );
}

bootstrap().catch(err => {
  console.error('Error starting application:', err);
  process.exit(1);
});
