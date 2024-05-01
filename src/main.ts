// Import necessary modules from NestJS and Express
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { urlencoded, json } from 'express';

// Asynchronous bootstrap function to initialize the application
async function bootstrap() {
  // Create an instance of the application using the AppModule
  const app = await NestFactory.create(AppModule);

  // Process environment variable to get a list of allowed CORS origins
  const whitelist = process.env.ALLOWED_CORS_ORIGINS.replace(/\s/g, '').split(
    ',',
  );

  // Apply JSON middleware to parse JSON requests with a maximum body limit
  app.use(json({ limit: '50mb' }));

  // Apply URL encoded middleware to parse URL encoded bodies with a maximum limit
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Enable CORS (Cross-Origin Resource Sharing) with custom validation
  app.enableCors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      // or from whitelisted origins
      if (
        !origin ||
        whitelist.indexOf(origin) !== -1 ||
        whitelist.indexOf('*') !== -1
      ) {
        callback(null, true);
      } else {
        // Block requests from non-whitelisted origins
        callback(new Error('Not allowed by CORS'));
      }
    },
  });

  // Listen on port 3000 and log the URL upon successful launch
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

// Start the application
bootstrap();
