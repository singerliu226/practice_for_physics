import { Injectable } from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service';
import * as mammoth from 'mammoth';
import { CreateQuestionDto } from './dto/create-question.dto';

interface ParsedQuestionMeta {
  title: string;
  content: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

@Injectable()
export class DocxParserService {
  constructor(private readonly logger: LoggerService) {}

  /**
   * 解析 .docx 文件中的题目
   * 暂时采用较为简单的解析规则：
   * 1. 使用 mammoth 将 docx 转为纯文本
   * 2. 题目以 "数字+点+空格" 作为开始，例如 "1. "
   * 3. 选项以 "A. ", "B. " 开头
   * 4. "答案:" 行记录正确答案，"解析:" 行记录解析
   * 5. 每道题以空行或下一道题编号作为边界
   *
   * 解析出的结果会生成 CreateQuestionDto 供批量写入数据库
   */
  async parseQuestionsFromDocx(
    fileBuffer: Buffer,
    chapter: string,
    difficulty: number,
  ): Promise<CreateQuestionDto[]> {
    const { value: rawText } = await mammoth.extractRawText({ buffer: fileBuffer });

    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length);

    const questions: ParsedQuestionMeta[] = [];
    let current: ParsedQuestionMeta | null = null;

    // 题号可以是 1. / 1． / 1、 等形式
    const startQuestionRegex = /^\d+[\.．、]\s*/;

    // 选项可以是 A. / A． / A、 等形式，允许最多到 H
    const optionRegex = /^[A-H][\.．、]/;

    for (const line of lines) {
      // 新题开始
      if (startQuestionRegex.test(line)) {
        if (current) questions.push(current);
        current = {
          title: line.replace(startQuestionRegex, '').trim(),
          content: '',
          options: [],
          answer: '',
        } as ParsedQuestionMeta;
        continue;
      }

      if (!current) continue; // 忽略未进入题目块的文本

      // 解析选项
      if (optionRegex.test(line)) {
        current.options = current.options || [];
        current.options.push(line);
        continue;
      }

      // 解析答案行，支持 "答案:", "答案：", "【答案】" 等格式
      if (/^\s*(答案|【?答案】?)\s*[:：]?/.test(line)) {
        current.answer = line
          .replace(/^\s*(答案|【?答案】?)\s*[:：]?/, '')
          .trim();
        continue;
      }

      // 解析解析
      if (line.startsWith('解析')) {
        current.explanation = line.replace(/解析[:：]/, '').trim();
        continue;
      }

      // 其他内容视为额外描述
      current.content += (current.content ? '\n' : '') + line;
    }

    if (current) questions.push(current);

    // 将解析结果映射为 CreateQuestionDto
    const result: CreateQuestionDto[] = questions.map((q) => ({
      title: q.title,
      content: q.content,
      options: q.options && q.options.length ? q.options : undefined,
      answer: q.answer,
      explanation: q.explanation,
      chapter,
      section: undefined,
      difficulty,
      tags: [],
    }));

    this.logger.debug(`解析到 ${result.length} 道题目`, 'DocxParserService');
    return result;
  }
}
