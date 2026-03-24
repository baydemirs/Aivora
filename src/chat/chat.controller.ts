import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.chatService.sendMessage(sendMessageDto, user.tenantId);
  }

  @Get()
  listConversations(@CurrentUser() user: AuthenticatedUser) {
    return this.chatService.listConversations(user.tenantId);
  }

  @Get(':id')
  getConversation(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.chatService.getConversation(id, user.tenantId);
  }
}
