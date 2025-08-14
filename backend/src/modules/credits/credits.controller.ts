import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from '../user/user.service';

@ApiTags('credits')
@Controller('credits')
@UseGuards(JwtAuthGuard)
export class CreditsController {
  constructor(private userService: UserService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get user credit information' })
  @ApiResponse({
    status: 200,
    description: 'User credit information retrieved successfully',
  })
  async getUserCredits(
    @Param('userId') userId: string,
    @GetUser('id') currentUserId: string,
  ) {
    // Ensure user can only access their own credits
    if (userId !== currentUserId) {
      throw new Error('Unauthorized access to credit information');
    }

    const credits = await this.userService.getUserCredits(userId);

    // For now, return credits with daily_credits_used as 0
    // This can be enhanced later with proper daily usage tracking
    return {
      credits,
      daily_credits_used: 0,
    };
  }

  @Get(':userId/history')
  @ApiOperation({ summary: 'Get user credit transaction history' })
  @ApiResponse({
    status: 200,
    description: 'Credit transaction history retrieved successfully',
  })
  async getCreditHistory(
    @Param('userId') userId: string,
    @GetUser('id') currentUserId: string,
  ) {
    // Ensure user can only access their own credit history
    if (userId !== currentUserId) {
      throw new Error('Unauthorized access to credit history');
    }

    // For now, return empty array
    // This can be enhanced later with proper transaction tracking
    return [];
  }
}
