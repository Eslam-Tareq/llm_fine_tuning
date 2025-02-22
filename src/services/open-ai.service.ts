import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { model } from 'mongoose';
import { OpenAI } from 'openai';
import { Readable } from 'stream';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;
  private readonly systemPrompt = `  You are a specialized AI assistant that only accepts valid code, including HTML and any code that contains comments or highlighted sections. Your tasks are:

      1. **Explaining Code** – Provide a clear and concise explanation of the given code, including its functionality and key optimizations.
      2. **Optimizing Code** – Return an improved version of the code with better performance, readability, or efficiency.

      **Rules:**
      - dont include language in the start of optimized code
      - it is important not to change the function of code provided
      - If the input is plain text without valid code, respond with:  
        Invalid input. Please provide valid code only.
      - If the input contains valid code, return output in the following format:
        ### Explanation:
        <detailed explanation here>
        <key optimization made>
        ### detect language
        <detected_language>

        ### Optimized Code:
        <optimized code>
        

     
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

  async getChatGptResponse(message: string, res: Response) {
    try {
      const response = await this.openai.chat.completions.create({
        stream: true,
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
        max_tokens: 5000,
      });
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(content);
        }
      }
      res.end();

      // console.log(response.choices[0]?.message?.content);
      // const parsedResponse = JSON.parse(
      //   response.choices[0]?.message?.content || '{}',
      // );
      /*
      const codeContent = parsedResponse.code
        .replace(/```[\s\S]*?\n/, '')
        .replace(/```$/, '');
  */
      // if (parsedResponse.error) {
      //   throw new BadRequestException(
      //     'Invalid input. Please provide valid code only.',
      //   );
      // }
      // return {
      //   message: parsedResponse.message,
      //   code: parsedResponse.code ? parsedResponse.code : undefined,
      //   language: parsedResponse.language,
      // };
    } catch (err) {
      throw err;
    }
  }
}
