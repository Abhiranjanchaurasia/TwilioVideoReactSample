import { Controller, Get, Query } from '@nestjs/common';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('token')
  getToken(@Query('identity') identity: string, @Query('roomName') roomName: string): { token: string } {
    const token = this.videoService.generateToken(identity, roomName);
    return { token};
  }
}