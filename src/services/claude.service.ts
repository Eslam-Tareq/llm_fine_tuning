import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
@Injectable()
export class ClaudeAiService {
  private anthropic: Anthropic;
  private readonly systemPrompt = `You are a specialized code assistant. Your capabilities are strictly limited to two functions:

  1. Code Explanation
  - When asked to explain code, provide a clear, detailed breakdown of how the code works
  - Break down the explanation into logical components
  - Highlight key programming concepts used
  - Do not repeat the input code in the explanation
  
  2. Code Optimization
  - When asked to optimize code, improve its efficiency, readability, or both
  - Explain each optimization made
  - Provide the optimized code in a formatted code block
  
  Response Format:
  {
      "message": "<detailed explanation or optimization summary>",
      "code": "<optimized code if applicable>"
  }
  
  For any requests outside of code explanation or optimization, respond with:
  {
      "message": "Sorry, I can only assist with code explanation and optimization."
  }
  
  Always use proper markdown formatting for code blocks.
  IMPORTANT: Your response must be valid JSON. `;

  constructor() {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async generateContent(message: string) {
    if (!message) {
      throw new NotFoundException('Message must be provided');
    }

    const result = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: this.systemPrompt,
      messages: [{ role: 'user', content: message }],
    });
    console.log(result);
    const parsedResponse = JSON.parse(result.content[0]['text']);
    /*
      const codeContent = parsedResponse.code
        .replace(/```[\s\S]*?\n/, '')
        .replace(/```$/, '');
  */
    return {
      model: 'claude',
      message: parsedResponse.message,
      code: parsedResponse.code,
    };
  }
}
