import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { QuestionBankService } from '../src/questionbank/questionbank.service';
import { DocxParserService } from '../src/questionbank/docx-parser.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CLI 脚本：批量导入位于 "物理知识点合集" 和 "practice" 目录下的 docx 题目
 * 使用：
 *   npx ts-node scripts/import-docx.ts
 */

// ---------------------- CLI 参数解析 ----------------------
interface CliOptions {
  collectionDir: string;
  practiceDir: string;
  chapterPattern: RegExp;
  dryRun: boolean;
}

function parseCli(): CliOptions {
  const cwd = process.cwd();
  // 默认目录
  let collectionDir = path.resolve(cwd, '物理知识点合集');
  let practiceDir = path.resolve(cwd, 'practice');
  let chapterPattern = /第[\d一二三四五六七八九十]+章\s+([^（【]+)[（【]?/;
  let dryRun = false;

  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--collection':
        if (argv[i + 1]) collectionDir = path.resolve(cwd, argv[++i]);
        break;
      case '--practice':
        if (argv[i + 1]) practiceDir = path.resolve(cwd, argv[++i]);
        break;
      case '--pattern':
        if (argv[i + 1]) {
          chapterPattern = new RegExp(argv[++i]);
        }
        break;
      case '--dry-run':
        dryRun = true;
        break;
      case '--help':
      case '-h':
        console.log(`\nUsage: npx ts-node scripts/import-docx.ts [options]\n
Options:
  --collection <dir>   知识点合集目录 (默认: 物理知识点合集)
  --practice  <dir>    practice 目录 (默认: practice)
  --pattern   <regex>  章节提取正则 (默认: 汉字章标题)
  --dry-run            只解析不写入数据库
  -h, --help           显示帮助\n`);
        process.exit(0);
      default:
        console.warn(`未知参数: ${arg}`);
    }
  }

  return { collectionDir, practiceDir, chapterPattern, dryRun };
}

const CLI_OPTS = parseCli();

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });

  const qbService = app.get(QuestionBankService);
  const docxParser = app.get(DocxParserService);

  const { collectionDir, practiceDir, chapterPattern, dryRun } = CLI_OPTS;

  const importFile = async (filePath: string, chapter: string, difficulty = 3) => {
    const buffer = fs.readFileSync(filePath);
    const questions = await docxParser.parseQuestionsFromDocx(buffer, chapter, difficulty);
    if (!questions.length) {
      console.warn(`⚠️  未在 ${path.basename(filePath)} 解析到题目`);
      return;
    }

    if (dryRun) {
      console.log(`💡 [dry-run] 将导入 ${questions.length} 题 -> 章节【${chapter}】 (${path.basename(filePath)})`);
    } else {
      await qbService.importFromDocx(buffer, chapter, difficulty);
      console.log(`✅ 导入 ${questions.length} 题 -> 章节【${chapter}】 (${path.basename(filePath)})`);
    }
  };

  // 处理知识点合集目录
  if (fs.existsSync(collectionDir)) {
    const files = fs.readdirSync(collectionDir).filter(f => f.toLowerCase().endsWith('.docx'));
    for (const file of files) {
      const match = file.match(chapterPattern);
      if (!match) continue;
      const chapter = match[1].trim();
      await importFile(path.join(collectionDir, file), chapter, 3);
    }
  }

  // 处理 practice 目录（仅压强示例）
  if (fs.existsSync(practiceDir)) {
    const files = fs.readdirSync(practiceDir).filter(f => f.toLowerCase().endsWith('.docx'));
    for (const file of files) {
      let difficulty = 3;
      if (file.includes('简单')) difficulty = 1;
      else if (file.includes('困难')) difficulty = 5;
      const chapter = '压强';
      await importFile(path.join(practiceDir, file), chapter, difficulty);
    }
  }

  await app.close();
  console.log(dryRun ? '📝 Dry run 完成' : '🎉 导入完成');
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
}); 