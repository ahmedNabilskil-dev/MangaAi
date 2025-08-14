import { Module } from '@nestjs/common';
import { McpClientService } from './mcp-client';

@Module({
  providers: [McpClientService],
  exports: [McpClientService],
})
export class ServicesModule {}
