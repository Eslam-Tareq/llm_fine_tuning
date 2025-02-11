import { Injectable, NotFoundException } from '@nestjs/common';
import { model } from 'mongoose';
import { OpenAI } from 'openai';
@Injectable()
export class DeepSeekAiService {
  private openai: OpenAI;
  private readonly systemPrompt = `You are an AI coding assistant that explains or optimizes code based on user requests. 
            - If the user asks for explanation, provide a clear and detailed breakdown.
            - If the user asks for optimization, improve the code and explain the changes.
            - Format the response as JSON: {"message": "<explanation>", "code": "<formatted code>"}.
            -Always respond with two parts: 1) A message explaining the optimization or explanation, and 2) The optimized or explained code in a formatted code block. Use Markdown for formatting and markdown also message.
            -in explanation don t return the user input code return only message
            - If the user asks for something outside of code explanation or optimization, respond with: {"message": "Sorry, I can only assist with code explanation and optimization."}.`;

  constructor() {
    this.openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',

      apiKey: process.env.DEEPSEEK_API_KEY,
    });
  }

  async generateContent(message: string) {
    const response = await this.openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: this.systemPrompt,
          /*`You are an AI coding assistant that explains or optimizes code based on user requests. 
            - If the user asks for explanation, provide a clear and detailed breakdown.
            - If the user asks for optimization, improve the code and explain the changes.
            - Format the response as JSON: {"message": "<explanation>", "code": "<formatted code>"}.
            -Always respond with two parts: 1) A message explaining the optimization or explanation, and 2) The optimized or explained code in a formatted code block. Use Markdown for formatting.
            -in explanation don t return the user input code return only message
            - If the user asks for something outside of code explanation or optimization, respond with: {"message": "Sorry, I can only assist with code explanation and optimization."}.`,
            */
        },
        {
          role: 'user',
          content: message, // Full message including user request + code
        },
      ],
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const parsedResponse = JSON.parse(
      response.choices[0]?.message?.content || '{}',
    );
    /*
      const codeContent = parsedResponse.code
        .replace(/```[\s\S]*?\n/, '')
        .replace(/```$/, '');
  */
    return {
      model: 'deepSeek',
      message: parsedResponse.message,
      code: parsedResponse.code ? parsedResponse.code : undefined,
    };
  }
}
