import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsDir = path.join(__dirname, '..', 'docs');
fs.mkdirSync(docsDir, { recursive: true });

const fontPath = 'C:/Windows/Fonts/simhei.ttf';
const outputPath = path.join(docsDir, '需求分析.pdf');

const doc = new PDFDocument({ size: 'A4', margin: 50 });
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

if (fs.existsSync(fontPath)) {
  doc.registerFont('SimHei', fontPath);
  doc.font('SimHei');
}

const addSection = (title, contentLines) => {
  doc.moveDown(1.2);
  doc.fontSize(14).text(title, { underline: true });
  doc.moveDown(0.4);
  doc.fontSize(12);
  contentLines.forEach((line) => doc.text(line, { lineGap: 4 }));
};

doc.fontSize(18).text('“Vue 在线课程学习平台”需求分析', { align: 'center' });
doc.moveDown();
doc
  .fontSize(12)
  .text(`编写日期：${new Date().toLocaleDateString('zh-CN')}`, { align: 'right' });
doc.moveDown();

addSection('项目名称', ['Vue 在线课程学习平台（基于 Vue 3 + Vite 实现）']);

addSection('项目简介', [
  '一个面向大学生与职场用户的在线课程学习平台，支持课程浏览、视频学习、互动答疑和学习进度跟踪。',
  '前端技术栈：Vue 3 + Vite；可扩展为 PWA 与移动端适配，后续接入真实接口或 BFF。'
]);

addSection('目标用户', [
  '• 学校/培训机构的在读学生，需要系统化学习路径与章节播放。',
  '• 职场转型/进阶用户，希望碎片时间快速上手新技能。',
  '• 讲师/助教，需要发布课程、管理章节与答疑。'
]);

addSection('核心功能模块（至少 3 个）', [
  '1）课程发现与搜索：课程分类浏览、关键词搜索、难度/时长/标签筛选、推荐位和榜单。',
  '2）课程详情与学习：章节目录、视频播放、课件/源码下载、弹幕/笔记、播放进度记忆。',
  '3）学习计划与进度：学习日历、今日待学提醒、学习时长统计、成就/证书展示。',
  '4）互动与评价：评论区、问答专区、讲师置顶答复、课程评分与反馈收集。',
  '5）账户与学习数据：登录注册（邮箱/手机号/三方）、个人资料、学习记录、收藏/稍后再看。',
  '6）讲师/管理员后台（可选迭代）：课程创建与上下架、章节管理、数据看板（活跃、完课率）。'
]);

addSection('非功能需求（简要）', [
  '• 兼容性：主流现代浏览器 + 移动端适配；优先采用响应式布局。',
  '• 性能：首页首屏加载 <2s，按需加载路由与组件，静态资源 CDN；视频播放平滑。',
  '• 安全：基础权限校验（游客、登录用户、讲师/管理员），接口需防止越权与恶意请求。',
  '• 运营：支持埋点统计 PV/UV、播放完成率，后续可接入 A/B 测试与推送。'
]);

addSection('里程碑（参考）', [
  'M1：完成信息架构与主路由、课程列表/详情页静态稿，接入 mock 数据。',
  'M2：实现视频播放、进度记忆、评论与评分、登录注册流程。',
  'M3：上线学习计划与统计模块，打通讲师后台的课程管理最小闭环。'
]);

doc.end();

stream.on('finish', () => console.log(`需求分析 PDF 已生成：${outputPath}`));
stream.on('error', (err) => {
  console.error('生成 PDF 失败：', err);
  process.exitCode = 1;
});
