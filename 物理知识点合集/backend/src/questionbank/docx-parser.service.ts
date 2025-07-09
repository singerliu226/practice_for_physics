import { Injectable } from '@nestjs/common';
import * as mammoth from 'mammoth';
import { LoggerService } from '../common/logger/logger.service';
import { CreateQuestionDto } from './questionbank.service';

/**
 * DOCX 文档解析服务
 * 从 Word 文档中提取题目内容和知识点信息
 */
@Injectable()
export class DocxParserService {
  constructor(private readonly logger: LoggerService) {}

  /**
   * 从 DOCX 文件解析题目
   */
  async parseQuestionsFromDocx(
    fileBuffer: Buffer,
    chapter: string,
    difficulty: number,
  ): Promise<CreateQuestionDto[]> {
    try {
      // 使用 mammoth 将 DOCX 转换为纯文本
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const text = result.value;

      this.logger.debug(`Extracted text length: ${text.length}`, 'DocxParserService');

      // 解析题目
      const questions = this.parseQuestionsFromText(text, chapter, difficulty);
      
      this.logger.log(
        `Parsed ${questions.length} questions from DOCX`,
        'DocxParserService',
      );

      return questions;
    } catch (error) {
      this.logger.error(
        `Failed to parse DOCX: ${error.message}`,
        error.stack,
        'DocxParserService',
      );
      throw error;
    }
  }

  /**
   * 从文本中解析题目
   * 适配常见的题目格式
   */
  private parseQuestionsFromText(
    text: string,
    chapter: string,
    difficulty: number,
  ): CreateQuestionDto[] {
    const questions: CreateQuestionDto[] = [];
    
    // 根据题目编号分割（如：1. 2. 3. 或者 1、2、3、）
    const questionBlocks = this.splitIntoQuestionBlocks(text);

    for (let i = 0; i < questionBlocks.length; i++) {
      const block = questionBlocks[i].trim();
      if (block.length < 10) continue; // 跳过太短的块

      try {
        const question = this.parseQuestionBlock(block, chapter, difficulty, i + 1);
        if (question) {
          questions.push(question);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to parse question block ${i + 1}: ${error.message}`,
          'DocxParserService',
        );
      }
    }

    return questions;
  }

  /**
   * 将文本分割为题目块
   */
  private splitIntoQuestionBlocks(text: string): string[] {
    // 匹配题目编号模式：数字+点/、，支持中英文
    const patterns = [
      /\n\s*(\d+)[\.．。]\s*/g,  // 1. 2. 3.
      /\n\s*(\d+)[、]\s*/g,      // 1、2、3、
      /\n\s*[（(](\d+)[）)]\s*/g, // (1) (2) (3)
    ];

    let bestSplit: string[] = [];
    let maxSplits = 0;

    // 尝试不同的分割模式，选择分割数量最多的
    for (const pattern of patterns) {
      const splits = text.split(pattern).filter(s => s.trim().length > 5);
      if (splits.length > maxSplits) {
        maxSplits = splits.length;
        bestSplit = splits;
      }
    }

    // 如果没有找到合适的分割，尝试按段落分割
    if (bestSplit.length <= 1) {
      bestSplit = text.split(/\n\s*\n/).filter(s => s.trim().length > 10);
    }

    return bestSplit;
  }

  /**
   * 解析单个题目块
   */
  private parseQuestionBlock(
    block: string,
    chapter: string,
    difficulty: number,
    questionNumber: number,
  ): CreateQuestionDto | null {
    const lines = block.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) return null;

    // 提取题目内容（第一行或前几行）
    let questionContent = '';
    let optionsStart = -1;
    let answerLine = '';
    let explanationLines: string[] = [];

    // 查找选项开始位置（A. B. C. D. 或 A、B、C、D、）
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (this.isOptionLine(line)) {
        optionsStart = i;
        break;
      }
    }

    // 构建题目内容
    if (optionsStart > 0) {
      questionContent = lines.slice(0, optionsStart).join('\n');
    } else {
      // 没有选项的题目，查找答案标识
      const answerIndex = lines.findIndex(line => 
        /^(答案|答|解答)[：:：\s]/i.test(line) || 
        /^(解|分析|解析)[：:：\s]/i.test(line)
      );
      
      if (answerIndex > 0) {
        questionContent = lines.slice(0, answerIndex).join('\n');
        answerLine = lines[answerIndex];
        explanationLines = lines.slice(answerIndex + 1);
      } else {
        questionContent = lines.join('\n');
      }
    }

    // 提取选项
    let options: string[] = [];
    if (optionsStart >= 0) {
      for (let i = optionsStart; i < lines.length; i++) {
        const line = lines[i];
        if (this.isOptionLine(line)) {
          options.push(line);
        } else if (/^(答案|答)[：:：\s]/i.test(line)) {
          answerLine = line;
          explanationLines = lines.slice(i + 1);
          break;
        }
      }
    }

    // 提取答案
    let answer = '';
    if (answerLine) {
      answer = answerLine.replace(/^(答案|答)[：:：\s]*/i, '').trim();
    }

    // 提取解析
    const explanation = explanationLines.join('\n').trim();

    // 生成标题
    const title = `${chapter} - 题目${questionNumber}`;

    // 推断知识点标签
    const tags = this.extractTags(questionContent, chapter);

    return {
      title,
      content: questionContent,
      options: options.length > 0 ? options : undefined,
      answer: answer || '待补充',
      explanation: explanation || undefined,
      chapter,
      section: this.inferSection(questionContent, chapter),
      difficulty,
      tags,
    };
  }

  /**
   * 判断是否为选项行
   */
  private isOptionLine(line: string): boolean {
    return /^[A-Da-d][\.．。、）)\s]/.test(line.trim());
  }

  /**
   * 从题目内容中提取知识点标签
   */
  private extractTags(content: string, chapter: string): string[] {
    const tags = [chapter];

    // 压强相关的知识点关键词
    const pressureKeywords = {
      '压强公式': ['p=F/S', 'F=pS', 'S=F/p', '压强公式'],
      '大气压强': ['大气压', '托里拆利', '水银柱', '标准大气压'],
      '液体压强': ['液体压强', 'ρgh', '连通器', '帕斯卡定律'],
      '压强应用': ['液压机', '注射器', '吸管', '高压锅'],
      '浮力': ['浮力', '阿基米德', 'F浮=ρ液gV排'],
      '单位换算': ['Pa', 'kPa', 'N/m²', '单位换算'],
    };

    // 根据内容匹配知识点
    for (const [tag, keywords] of Object.entries(pressureKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        tags.push(tag);
      }
    }

    // 根据题目类型添加标签
    if (content.includes('计算') || /\d+.*[×÷+\-=]/.test(content)) {
      tags.push('计算题');
    }
    if (content.includes('原理') || content.includes('原因')) {
      tags.push('原理题');
    }
    if (content.includes('应用') || content.includes('生活')) {
      tags.push('应用题');
    }

    return [...new Set(tags)]; // 去重
  }

  /**
   * 推断题目所属小节
   */
  private inferSection(content: string, chapter: string): string {
    if (chapter === '压强') {
      if (content.includes('大气') || content.includes('托里拆利')) {
        return '大气压强';
      }
      if (content.includes('液体') || content.includes('ρgh')) {
        return '液体压强';
      }
      if (content.includes('固体') || content.includes('F/S')) {
        return '固体压强';
      }
      if (content.includes('浮力') || content.includes('阿基米德')) {
        return '浮力';
      }
    }
    
    return undefined;
  }
} 