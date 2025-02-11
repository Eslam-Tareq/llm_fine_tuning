import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { LlmModel } from 'src/enums/llm';
import { OpenAiService } from './open-ai.service';
import { ClaudeAiService } from './claude.service';
import { GeminiAiService } from './gemini.service';
import { DeepSeekAiService } from './deep-seek.service';

@Injectable()
export class CodeOptimizerService {
  private openai: OpenAI;

  constructor(
    private openAiService: OpenAiService,
    private claudeService: ClaudeAiService,
    private geminiService: GeminiAiService,
    private deepSeek: DeepSeekAiService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OpenAI_Api,
    });
  }

  async processUserMessage(/*model: LlmModel,*/ message: string) {
    // if (model === LlmModel.ChatGPT) {
    //   return await this.openAiService.getChatGptResponse(message);
    // } else if (model === LlmModel.Claude) {
    //   return await this.claudeService.generateContent(message);
    // } else if (model === LlmModel.gemini) {
    //   return await this.geminiService.generateContent(message);
    // } else if (model === LlmModel.DeepSeek) {
    //   return await this.deepSeek.generateContent(message);
    // }
    const result = await this.openAiService.getChatGptResponse(message);
    return result;
  }
}
