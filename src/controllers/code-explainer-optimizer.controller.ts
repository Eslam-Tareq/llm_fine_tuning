import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Injectable,
  InternalServerErrorException,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { OpenAI } from 'openai';
import { GenerateResponseDto } from 'src/dtos/code-explainer-optimizer.dto';
import { LlmModel } from 'src/enums/llm';
import { CodeOptimizerService } from 'src/services/code-explainer-optimizer.service';

@Controller('code-vision')
export class CodeOptimizerController {
  constructor(private codeOptimizerService: CodeOptimizerService) {}
  @Post()
  async optimizeCode(
    @Body() generateResponseDto: GenerateResponseDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.codeOptimizerService.processUserMessage(
        /*  generateResponseDto.model,*/
        generateResponseDto.message,
        res,
      );
      return { success: true, data: result };
    } catch (err) {
      console.error('Error optimizing code:', err);
      if (err.message === 'Invalid input. Please provide valid code only.') {
        throw new BadRequestException(
          'Invalid input. Please provide valid code only.',
        );
      } else {
        throw new InternalServerErrorException('failed to generate response');
      }
    }
  }
}
