import { Injectable, BadRequestException } from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service';
import { ExerciseService } from '../exercise/exercise.service';

export interface LearningPlan {
  studentId: string;
  recommendations: string[];
  focusChapters: string[];
  studyTime: number; // 建议学习时间（分钟）
  difficulty: number; // 建议难度等级
  nextGoals: string[];
}

/**
 * AI学习规划服务
 * 集成Deepseek API，根据学生表现生成个性化学习建议
 */
@Injectable()
export class AIPlannerService {
  private readonly deepseekApiKey: string;
  private readonly apiBaseUrl = 'https://api.deepseek.com/v1';

  constructor(
    private readonly logger: LoggerService,
    private readonly exerciseService: ExerciseService,
  ) {
    // 从环境变量获取API密钥
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY || '';
    if (!this.deepseekApiKey) {
      this.logger.warn(
        'DEEPSEEK_API_KEY not found in environment variables',
        'AIPlannerService',
      );
    }
  }

  /**
   * 为学生生成个性化学习计划
   */
  async generateLearningPlan(studentId: string): Promise<LearningPlan> {
    try {
      // 获取学生的学习统计数据
      const studentStats = await this.exerciseService.getStudentStats(studentId);
      const wrongQuestions = await this.exerciseService.getWrongQuestions(studentId, 10);

      // 分析学生的学习情况
      const analysisPrompt = this.buildAnalysisPrompt(studentStats, wrongQuestions);

      // 调用Deepseek API获取建议
      const aiResponse = await this.callDeepseekAPI(analysisPrompt);

      // 解析AI响应并生成学习计划
      const plan = this.parsePlanFromAIResponse(studentId, aiResponse, studentStats);

      this.logger.log(
        `Generated learning plan for student ${studentId}`,
        'AIPlannerService',
      );

      return plan;
    } catch (error) {
      this.logger.error(
        `Failed to generate learning plan for student ${studentId}: ${error.message}`,
        error.stack,
        'AIPlannerService',
      );

      // 如果AI服务失败，返回基于规则的基础建议
      return this.generateFallbackPlan(studentId);
    }
  }

  /**
   * 构建发送给AI的分析提示
   */
  private buildAnalysisPrompt(studentStats: any, wrongQuestions: any[]): string {
    const { totalAnswered, correctAnswered, accuracy, chapterStats } = studentStats;

    const prompt = `
你是一位专业的中学物理老师，请根据以下学生的学习数据，生成个性化的学习建议：

学生总体表现：
- 总答题数：${totalAnswered}
- 正确答题数：${correctAnswered}
- 正确率：${accuracy}%

各章节表现：
${chapterStats.map(chapter => 
  `- ${chapter.chapter}：${chapter.correct}/${chapter.total} (${chapter.accuracy}%)`
).join('\n')}

最近错题涉及的知识点：
${wrongQuestions.map((q, index) => 
  `${index + 1}. ${q.chapter} - ${q.tags?.join(', ') || '基础知识'}`
).join('\n')}

请提供以下建议（用JSON格式返回）：
{
  "recommendations": ["具体的学习建议1", "具体的学习建议2", "具体的学习建议3"],
  "focusChapters": ["需要重点复习的章节1", "需要重点复习的章节2"],
  "studyTime": 建议的每日学习时间（分钟），
  "difficulty": 建议的题目难度等级（1-3），
  "nextGoals": ["下一阶段的学习目标1", "下一阶段的学习目标2"]
}

请确保建议具体、可操作，符合中学生的学习特点。
`;

    return prompt;
  }

  /**
   * 调用Deepseek API
   */
  private async callDeepseekAPI(prompt: string): Promise<string> {
    if (!this.deepseekApiKey) {
      throw new Error('Deepseek API key not configured');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Deepseek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error(
        `Deepseek API call failed: ${error.message}`,
        error.stack,
        'AIPlannerService',
      );
      throw error;
    }
  }

  /**
   * 解析AI响应并生成学习计划
   */
  private parsePlanFromAIResponse(
    studentId: string,
    aiResponse: string,
    studentStats: any,
  ): LearningPlan {
    try {
      // 尝试解析JSON响应
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          studentId,
          recommendations: parsed.recommendations || [],
          focusChapters: parsed.focusChapters || [],
          studyTime: parsed.studyTime || 30,
          difficulty: parsed.difficulty || 2,
          nextGoals: parsed.nextGoals || [],
        };
      }
    } catch (error) {
      this.logger.warn(
        `Failed to parse AI response as JSON: ${error.message}`,
        'AIPlannerService',
      );
    }

    // 如果解析失败，提取文本中的建议
    return this.extractPlanFromText(studentId, aiResponse, studentStats);
  }

  /**
   * 从文本中提取学习计划
   */
  private extractPlanFromText(
    studentId: string,
    text: string,
    studentStats: any,
  ): LearningPlan {
    const recommendations = [];
    const focusChapters = [];

    // 基于正确率给出建议
    if (studentStats.accuracy < 60) {
      recommendations.push('加强基础知识的理解和记忆');
      recommendations.push('多做简单题目，巩固基本概念');
    } else if (studentStats.accuracy < 80) {
      recommendations.push('在掌握基础的同时，适当提高题目难度');
      recommendations.push('重点关注错题分析和知识点梳理');
    } else {
      recommendations.push('保持当前学习状态，可以挑战更难的题目');
      recommendations.push('注重知识的综合运用和拓展');
    }

    // 找出正确率最低的章节作为重点
    const sortedChapters = studentStats.chapterStats
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 2);
    
    sortedChapters.forEach(chapter => {
      focusChapters.push(chapter.chapter);
    });

    return {
      studentId,
      recommendations,
      focusChapters,
      studyTime: 30, // 默认30分钟
      difficulty: studentStats.accuracy > 80 ? 3 : studentStats.accuracy > 60 ? 2 : 1,
      nextGoals: [
        '提高整体答题正确率',
        '掌握重点章节知识',
      ],
    };
  }

  /**
   * 生成备用学习计划（当AI服务不可用时）
   */
  private async generateFallbackPlan(studentId: string): Promise<LearningPlan> {
    try {
      const studentStats = await this.exerciseService.getStudentStats(studentId);
      
      return {
        studentId,
        recommendations: [
          '建议每天保持30分钟的物理练习时间',
          '重点复习错题，理解解题思路',
          '按章节系统地复习基础知识点',
        ],
        focusChapters: ['压强', '浮力'], // 默认重点章节
        studyTime: 30,
        difficulty: 2,
        nextGoals: [
          '提高答题正确率到80%以上',
          '掌握物理基本概念和公式',
        ],
      };
    } catch (error) {
      // 如果获取统计数据也失败，返回最基础的计划
      return {
        studentId,
        recommendations: [
          '从基础知识开始，逐步提高',
          '每天保持适量的练习',
        ],
        focusChapters: ['压强'],
        studyTime: 20,
        difficulty: 1,
        nextGoals: ['建立良好的学习习惯'],
      };
    }
  }

  /**
   * 获取学习提醒
   */
  async getStudyReminder(studentId: string): Promise<string[]> {
    try {
      const studentStats = await this.exerciseService.getStudentStats(studentId);
      const wrongCount = await this.exerciseService.getWrongQuestionStats(studentId);

      const reminders = [];

      // 根据最近活动给出提醒
      if (studentStats.recentActivity === 0) {
        reminders.push('您已经很久没有练习了，建议今天完成一些题目保持状态');
      } else if (studentStats.recentActivity < 5) {
        reminders.push('练习量偏少，建议增加每日练习时间');
      }

      // 根据错题数量给出提醒
      if (wrongCount.totalWrong > 10) {
        reminders.push('您有较多错题需要复习，建议先完成错题练习');
      } else if (wrongCount.totalWrong > 0) {
        reminders.push('记得复习错题，巩固薄弱知识点');
      }

      // 根据正确率给出提醒
      if (studentStats.accuracy < 70) {
        reminders.push('当前正确率偏低，建议放慢节奏，注重质量而非数量');
      }

      return reminders.length > 0 ? reminders : ['保持良好的学习状态，继续加油！'];
    } catch (error) {
      this.logger.error(
        `Failed to generate study reminder for student ${studentId}: ${error.message}`,
        error.stack,
        'AIPlannerService',
      );
      return ['记得每天坚持练习，学习需要持之以恒！'];
    }
  }
} 