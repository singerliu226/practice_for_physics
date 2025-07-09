/**
 * 测试脚本：解析压强章节的 DOCX 题目文件
 */

const fs = require('fs');
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
  
  bestSplit.slice(0, 5).forEach((block, index) => {
    if (block.trim().length < 20) return;
    
    const lines = block.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) return;
    
    // 简单提取题目内容和答案
    let content = lines.slice(0, 3).join('\n'); // 前3行作为题目内容
    let answer = '待补充';
    
    // 查找答案行
    const answerLine = lines.find(line => 
      /^(答案|答|解答)[：:：\s]/i.test(line)
    );
    
    if (answerLine) {
      answer = answerLine.replace(/^(答案|答)[：:：\s]*/i, '').trim();
    }
    
    console.log(`\n题目 ${index + 1}:`);
    console.log(`内容: ${content.substring(0, 100)}...`);
    console.log(`答案: ${answer}`);
  });
  
  return bestSplit.length;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始解析压强章节题目...\n');
  
  for (let i = 0; i < pressureFiles.length; i++) {
    const filePath = pressureFiles[i];
    const difficulty = i + 1; // 简单=1, 中等=2, 困难=3
    
    await parseDocxFile(filePath, difficulty);
  }
}

// 运行主函数
main().catch(console.error);
