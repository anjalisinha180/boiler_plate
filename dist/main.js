"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const compression_1 = __importDefault(require("compression"));
const fs = __importStar(require("node:fs"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const debug_interceptor_1 = require("./shared/interceptors/debug.interceptor");
async function bootstrap() {
    const httpsEnabled = process.env.HTTPS_ENABLED === 'true';
    const app = httpsEnabled
        ? await core_1.NestFactory.create(app_module_1.AppModule, {
            httpsOptions: {
                key: fs.readFileSync(process.env.SSL_KEY_PATH || '/certs/privateKey.key'),
                cert: fs.readFileSync(process.env.SSL_CERT_PATH || '/certs/cert.pem'),
            },
        })
        : await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3000);
    const apiPrefix = configService.get('API_PREFIX', 'api/v1');
    const corsOrigin = configService.get('CORS_ORIGIN', '*');
    app.use((0, helmet_1.default)({
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
    }));
    app.use((0, compression_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.enableCors({ origin: corsOrigin, credentials: true });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalInterceptors(app.get(debug_interceptor_1.DebugInterceptor));
    app.setGlobalPrefix(apiPrefix);
    const swaggerEnabled = configService.get('SWAGGER_ENABLED', true);
    if (swaggerEnabled) {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle(configService.get('SWAGGER_TITLE', 'API Documentation'))
            .setDescription(configService.get('SWAGGER_DESCRIPTION', 'API Documentation'))
            .setVersion(configService.get('SWAGGER_VERSION', '1.0.0'))
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        }, 'JWT-auth')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'NextAuth JWT',
            description: 'Enter NextAuth JWT token',
            in: 'header',
        }, 'NextAuth-Bearer')
            .addApiKey({
            type: 'apiKey',
            name: 'x-nextauth-token',
            in: 'header',
            description: 'NextAuth JWT token via custom header',
        }, 'NextAuth-Header')
            .addBasicAuth({
            type: 'http',
            scheme: 'basic',
            name: 'Basic Auth',
            description: 'Enter username and password for authentication',
        }, 'Basic-auth')
            .build();
        const swaggerPath = configService.get('SWAGGER_PATH', 'api/docs');
        const swaggerHost = process.env.SWAGGER_HOST ?? `http://localhost:${port}`;
        const swaggerUrl = `${swaggerHost}/api-json`;
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup(swaggerPath, app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                docExpansion: 'none',
                showRequestHeaders: true,
                supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
                url: swaggerUrl,
                validatorUrl: null,
            },
            customSiteTitle: configService.get('SWAGGER_TITLE', 'API Documentation'),
            useGlobalPrefix: false,
        });
    }
    await app.listen(port);
    console.log(`Application running on: ${httpsEnabled ? 'https' : 'http'}://localhost:${port}/${apiPrefix}`);
}
bootstrap().catch(err => {
    console.error('Error starting application:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map