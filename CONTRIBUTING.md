# 贡献指南

感谢您对本项目的兴趣！我们欢迎所有形式的贡献，包括 bug 报告、功能请求、文档改进和代码提交。

## 如何贡献

### 报告 Bug

如果您发现了 bug，请：

1. 检查 [Issues](https://github.com/chenziai/doubao-watermark-remover/issues) 中是否已有相同的报告
2. 如果没有，请创建一个新的 Issue，包括以下信息：
   - 清晰的标题描述
   - 详细的 bug 描述
   - 复现步骤
   - 预期行为 vs 实际行为
   - 您的环境信息（浏览器、操作系统等）
   - 相关的日志或截图

### 提议新功能

1. 检查 [Issues](https://github.com/chenziai/doubao-watermark-remover/issues) 确保没有重复提议
2. 创建 Issue 说明：
   - 功能的用途和价值
   - 可能的实现方式
   - 示例场景

### 提交代码

#### 准备工作

1. Fork 本仓库
2. Clone 您的 fork 到本地
   ```bash
   git clone https://github.com/YOUR_USERNAME/doubao-watermark-remover.git
   cd doubao-watermark-remover
   ```

3. 添加 upstream 远程
   ```bash
   git remote add upstream https://github.com/chenziai/doubao-watermark-remover.git
   ```

#### 开发流程

1. 创建特性分支
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. 进行更改并提交
   ```bash
   git add .
   git commit -m "feat: 描述您的更改"
   ```

   请遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：
   - `feat:` 新功能
   - `fix:` bug 修复
   - `docs:` 文档更新
   - `style:` 代码风格更改（不影响功能）
   - `refactor:` 代码重构
   - `perf:` 性能优化
   - `test:` 测试相关
   - `chore:` 构建、依赖等维护工作

3. 保持您的分支与 upstream 同步
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. 推送到您的 fork
   ```bash
   git push origin feature/your-feature-name
   ```

5. 提交 Pull Request
   - 提供清晰的标题和描述
   - 关联相关的 Issue（如 `Closes #123`）
   - 描述您的更改是什么以及为什么

#### 代码风格

- 使用 ESLint 进行代码检查：`npm run lint`
- 使用 Prettier 格式化代码：`npm run format`
- 遵循 JavaScript 最佳实践
- 添加必要的注释和文档

#### 测试

- 为新功能添加相应的测试
- 运行测试确保通过：`npm test`
- 目标是保持 80% 以上的测试覆盖率

### 改进文档

- 修复文档中的拼写或语法错误
- 改进 README 中的说明
- 添加使用示例
- 改进 API 文档

## Pull Request 流程

1. 更新文档以反映任何更改
2. 更新版本号（如果适用）
3. 确保所有测试通过
4. 确保代码符合风格指南
5. 填写 PR 模板中的信息
6. 等待审查

## 代码审查

所有提交都需要经过代码审查。审查者会：
- 检查代码质量
- 验证功能实现
- 建议改进

请对审查意见保持开放态度。反复讨论是代码审查过程的一部分。

## 许可证

通过贡献，您同意您的贡献在 MIT 许可证下发布。

## 问题或建议？

- 通过 GitHub Issues 联系我们
- 或者在 Discussions 中讨论

感谢您的贡献！ ❤️
