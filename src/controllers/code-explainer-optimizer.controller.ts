import {
  Body,
  Controller,
  Injectable,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { OpenAI } from 'openai';
import { GenerateResponseDto } from 'src/dtos/code-explainer-optimizer.dto';
import { LlmModel } from 'src/enums/llm';
import { CodeOptimizerService } from 'src/services/code-explainer-optimizer.service';

@Controller('code-vision')
export class CodeOptimizerController {
  constructor(private codeOptimizerService: CodeOptimizerService) {}
  @Post()
  async optimizeCode(@Body() generateResponseDto: GenerateResponseDto) {
    try {
      const result = await this.codeOptimizerService.processUserMessage(
        generateResponseDto.model,
        generateResponseDto.message,
      );
      return { success: true, data: result };
    } catch (err) {
      console.error('Error optimizing code:', err);
      throw new InternalServerErrorException('failed to generate response');
    }
  }
}
