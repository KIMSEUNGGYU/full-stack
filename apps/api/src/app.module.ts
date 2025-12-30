import { Module } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   envFilePath: '.env',
    // }),
    // TODO: DB 연결이 필요할 때 주석 해제
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'mysql',
    //     host: configService.get('DB_HOST', 'localhost'),
    //     port: configService.get('DB_PORT', 3306),
    //     username: configService.get('DB_USERNAME', 'fullstack'),
    //     password: configService.get('DB_PASSWORD', 'fullstack123'),
    //     database: configService.get('DB_DATABASE', 'fullstack'),
    //     entities: [`${__dirname}/**/*.entity{.ts,.js}`],
    //     synchronize: configService.get('NODE_ENV') !== 'production',
    //   }),
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
