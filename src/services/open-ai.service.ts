import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { model } from 'mongoose';
import { OpenAI } from 'openai';
@Injectable()
export class OpenAiService {
  private openai: OpenAI;
  private readonly systemPrompt = `You are an AI coding assistant that processes only code input from users. Your task is to analyze the given code and respond with an explanation and an optimized version of the code.

- - Always assume the user input is **code only**.
- -note user can add some words to the code like explain it and son on accept it.  
- If the input is **not** code, respond with:  
  json
  {
    "message": "Invalid input. Please provide valid code only."
  }
- Provide a detailed explanation of how the code works and potential improvements.
- Optimize the code for readability, efficiency, and best practices.
- Format the response as a JSON object:
  json
  {
    "message": "<detailed explanation in Markdown>",
    "code": "<optimized code in a Markdown-formatted code block>"
  }
- you must ensure that the output must be valid JSON and must be parsed Correctly    
`;
  private sanitizeJsonString(str: string): string {
    // Remove any potential control characters
    str = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

    // Attempt to extract JSON if it's wrapped in other content
    const jsonMatch = str.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      str = jsonMatch[0];
    }

    // Escape special characters in strings
    str = str.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');

    return str;
  }

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OpenAI_Api,
    });
  }

  async getChatGptResponse(message: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
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
      if (
        parsedResponse.message ===
        'Invalid input. Please provide valid code only.'
      ) {
        throw new BadRequestException(
          'Invalid input. Please provide valid code only.',
        );
      }
      return {
        message: parsedResponse.message,
        code: parsedResponse.code ? parsedResponse.code : undefined,
      };
    } catch (err) {
      throw err;
    }
  }
}
