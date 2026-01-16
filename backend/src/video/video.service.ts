import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwt } from 'twilio';

@Injectable()
export class VideoService {
  constructor(private configService: ConfigService) {}

  generateToken(identity: string, roomName: string): string {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const apiKey = this.configService.get<string>('TWILIO_API_KEY');
    const apiSecret = this.configService.get<string>('TWILIO_API_SECRET');

    if (!accountSid || !apiKey || !apiSecret) {
      throw new Error('Twilio credentials not configured');
    }

    const videoGrant = new jwt.AccessToken.VideoGrant({
      room: roomName,
    });

    const token = new jwt.AccessToken(accountSid, apiKey, apiSecret, {
      identity,
    });

    token.addGrant(videoGrant);

    return token.toJwt();
  }
}