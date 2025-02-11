import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiAiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  private readonly systemPrompt = `You are a specialized code assistant.Your capabilities are strictly limited to two functions:
            1. Code Explanation
            2. code optimization
            - If the user asks for explanation, provide a clear and detailed breakdown.
            - If the user asks for optimization, improve the code and explain the changes.
            - Format the response as JSON: {"message": "<explanation>", "code": "<formatted code>"}.
            -Always respond with two parts: 1) A message explaining the optimization or explanation, and 2) The optimized or explained code in a formatted code block. Use Markdown for formatting and markdown also message.
            -in explanation don t return the user input code return only message
            - If the user asks for something outside of code explanation or optimization, respond with: {"message": "Sorry, I can only assist with code explanation and optimization."}.
            -be sure that json of response can be parsed without any problems
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
    this.genAI = new GoogleGenerativeAI(process.env.Gemini_Api);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateContent(message: string) {
    const chat = this.model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: this.systemPrompt }],
        },
        {
          role: 'model',
          parts: [
            {
              text: 'Understood. I will act as a specialized code assistant and provide responses in the specified JSON format.',
            },
          ],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const responseText = response.text();
    console.log(responseText);
    const parsedResponse = JSON.parse(this.sanitizeJsonString(responseText));

    return {
      model: 'gemini',
      message: parsedResponse.message,
      code: parsedResponse.code || null,
    };
  }
}
