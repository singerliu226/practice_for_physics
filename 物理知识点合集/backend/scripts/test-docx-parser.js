/**
 * 测试脚本：解析压强章节的 DOCX 题目文件
 * 运行方式：node scripts/test-docx-parser.js
 */

const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

// 压强题目文件路径
const pressureFiles = [
  '../practice/压强（简单）.docx',
  '../practice/压强（中等）.docx', 
  '../practice/压强（困难）.docx'
];

/**
 * 解析单个 DOCX 文件
 */
async function parseDocxFile(filePath, difficulty) {
  try {
    console.log(`\n📖 解析文件: ${filePath} (难度: ${difficulty})`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ 文件不存在: ${filePath}`);
      return [];
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(filePath);
    
    // 使用 mammoth 提取文本
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const text = result.value;
    
    console.log(`📄 提取文本长度: ${text.length} 字符`);
    
    // 显示前500字符预览
    console.log(`\n📝 文本预览:\n${text.substring(0, 500)}...\n`);
    
    // 简单的题目分割
    const questions = parseQuestionsFromText(text, difficulty);
    
    console.log(`✅ 解析出 ${questions.length} 道题目`);
    
    // 显示前2道题目的详情
    questions.slice(0, 2).forEach((q, index) => {
      console.log(`\n题目 ${index + 1}:`);
      console.log(`标题: ${q.title}`);
      console.log(`内容: ${q.content.substring(0, 100)}...`);
      console.log(`答案: ${q.answer}`);
      console.log(`标签: ${q.tags.join(', ')}`);
    });
    
    return questions;
    
  } catch (error) {
    console.error(`❌ 解析失败: ${error.message}`);
    return [];
  }
}

/**
 * 简化的题目解析函数
 */
function parseQuestionsFromText(text, difficulty) {
  const questions = [];
  
  // 尝试不同的分割模式
  const patterns = [
    /\n\s*(\d+)[\.．。]\s*/g,  // 1. 2. 3.
    /\n\s*(\d+)[、]\s*/g,      // 1、2、3、
    /\n\s*[（(](\d+)[）)]\s*/g, // (1) (2) (3)
  ];
  
  let bestSplit = [];
  let maxSplits = 0;
  
  for (const pattern of patterns) {
    const splits = text.split(pattern).filter(s => s.trim().length > 10);
    if (splits.length > maxSplits) {
      maxSplits = splits.length;
      bestSplit = splits;
    }
  }
  
  // 如果没有找到好的分割，按段落分割
  if (bestSplit.length <= 1) {
    bestSplit = text.split(/\n\s*\n/).filter(s => s.trim().length > 20);
  }
  
  console.log(`🔍 找到 ${bestSplit.length} 个题目块`);
  
  bestSplit.forEach((block, index) => {
    if (block.trim().length < 20) return;
    
    const lines = block.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) return;
    
    // 简单提取题目内容和答案
    let content = '';
    let answer = '';
    
    // 查找答案行
    const answerIndex = lines.findIndex(line => 
      /^(答案|答|解答)[：:：\s]/i.test(line)
    );
    
    if (answerIndex > 0) {
      content = lines.slice(0, answerIndex).join('\n');
      answer = lines[answerIndex].replace(/^(答案|答)[：:：\s]*/i, '').trim();
    } else {
      content = lines.join('\n');
      answer = '待补充';
    }
    
    // 推断知识点标签
    const tags = ['压强'];
    if (content.includes('大气压') || content.includes('托里拆利')) {
      tags.push('大气压强');
    }
    if (content.includes('液体') || content.includes('ρgh')) {
      tags.push('液体压强');
    }
    if (content.includes('F/S') || content.includes('p=F/S')) {
      tags.push('压强公式');
    }
    if (content.includes('浮力') || content.includes('阿基米德')) {
      tags.push('浮力');
    }
    
    questions.push({
      title: `压强 - 题目${index + 1}`,
      content: content,
      answer: answer,
      chapter: '压强',
      difficulty: difficulty,
      tags: tags
    });
  });
  
  return questions;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始解析压强章节题目...\n');
  
  const allQuestions = [];
  
  for (let i = 0; i < pressureFiles.length; i++) {
    const filePath = pressureFiles[i];
    const difficulty = i + 1; // 简单=1, 中等=2, 困难=3
    
    const questions = await parseDocxFile(filePath, difficulty);
    allQuestions.push(...questions);
  }
  
  console.log(`\n📊 总结:`);
  console.log(`总共解析出 ${allQuestions.length} 道题目`);
  
  // 按难度统计
  const countByDifficulty = allQuestions.reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  }, {});
  
  console.log('按难度分布:');
  Object.entries(countByDifficulty).forEach(([difficulty, count]) => {
    const level = ['', '简单', '中等', '困难'][difficulty];
    console.log(`  ${level}: ${count} 道题目`);
  });
  
  // 知识点统计
  const tagCounts = {};
  allQuestions.forEach(q => {
    q.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  console.log('\n知识点分布:');
  Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([tag, count]) => {
      console.log(`  ${tag}: ${count} 次`);
    });

  // 保存解析结果到 JSON 文件
  const outputPath = 'parsed-questions.json';
  fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2), 'utf8');
  console.log(`\n💾 解析结果已保存到: ${outputPath}`);
}

// 运行主函数
main().catch(console.error); 