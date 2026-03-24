import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { AskQuestionDto } from './dto/ask-question.dto';
import { RagService } from './rag.service';

@Controller('rag')
@UseGuards(JwtAuthGuard)
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ask')
  ask(
    @Body() askQuestionDto: AskQuestionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ragService.askQuestion(askQuestionDto.question, user.tenantId);
  }
}
