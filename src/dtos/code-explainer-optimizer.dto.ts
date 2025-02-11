import { IsEnum, IsString, Length } from 'class-validator';
import { LlmModel } from 'src/enums/llm';

export class GenerateResponseDto {
  // @IsEnum(LlmModel, {
  //   message: `model must be one of: ${Object.values(LlmModel).join(', ')}`,
  // })
  // model: LlmModel;
  @IsString()
  @Length(10)
  message: string;
}
