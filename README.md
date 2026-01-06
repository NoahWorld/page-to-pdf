# OneClick Page to PDF

[English](#english) | [中文](#中文)

---

## English

A Chrome extension that exports the current webpage to PDF with one click — including long pages and content inside scrollable containers.

### ✨ Features

- **One-click export** - Save any webpage as PDF instantly
- **Auto-scroll support** - Automatically loads lazy-loaded content before exporting
- **Scrollable container fix** - Captures content inside scrollable divs that would normally be cut off
- **Customizable settings**:
  - Paper size (A4 / Letter)
  - Orientation (Portrait / Landscape)
  - Margins (Default / Small / None)
  - Background graphics (on/off)
  - File naming rules (Title / Domain-Title / Custom prefix)
- **Multi-language UI** - English, Spanish, Portuguese, Chinese (Simplified & Traditional), Arabic

### 🚀 Installation

#### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/NoahWorld/page-to-pdf.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top-right corner)

4. Click **Load unpacked** and select the extension folder

5. The extension icon will appear in your toolbar

### 📖 Usage

1. Navigate to the webpage you want to export
2. Click the extension icon in the toolbar
3. Adjust settings if needed:
   - Choose paper size and orientation
   - Enable/disable background graphics
   - Toggle auto-scroll for lazy-loading pages
   - Select file naming format
4. Click **Export current page to PDF**
5. The PDF will be downloaded automatically

### 🔧 How It Works

The extension uses Chrome DevTools Protocol (CDP) to:
- Attach a debugger to the active tab
- Apply print-friendly CSS fixes (removes scroll containers, ensures backgrounds print)
- Optionally auto-scroll the page to trigger lazy-loaded content
- Generate PDF using `Page.printToPDF` API
- Download the result as a file

### ⚠️ Limitations

- Chrome system pages (`chrome://...`) cannot be exported
- Some websites may block printing or require authentication
- Pages with highly dynamic or virtualized content may not fully render

### 🔒 Permissions

- **activeTab** - Access current tab only when you click the extension
- **debugger** - Required for CDP printing APIs (attached only during export)
- **downloads** - Save the generated PDF file
- **storage** - Store your preferences locally

### 📝 Privacy

This extension:
- ✅ Does NOT collect any personal data
- ✅ Does NOT send data to external servers
- ✅ Processes everything locally in your browser
- ✅ Only stores your settings (paper size, margins, etc.) locally

### 📄 License

MIT License - feel free to use and modify

### 🤝 Contributing

Issues and pull requests are welcome!

---

## 中文

一键将当前网页导出为 PDF 的 Chrome 扩展 —— 支持长页面和滚动容器内的内容。

### ✨ 功能特性

- **一键导出** - 快速将任何网页保存为 PDF
- **自动滚动支持** - 导出前自动加载懒加载内容
- **滚动容器修复** - 捕获滚动 div 内的内容，避免被截断
- **自定义设置**：
  - 纸张大小（A4 / Letter）
  - 方向（竖向 / 横向）
  - 页边距（默认 / 小 / 无）
  - 背景图形（开/关）
  - 文件命名规则（标题 / 域名-标题 / 自定义前缀）
- **多语言界面** - 英语、西班牙语、葡萄牙语、简体中文、繁体中文、阿拉伯语

### 🚀 安装方法

#### 从源码安装

1. 克隆此仓库：
   ```bash
   git clone https://github.com/NoahWorld/page-to-pdf.git
   ```

2. 打开 Chrome 浏览器，访问 `chrome://extensions/`

3. 开启右上角的**开发者模式**

4. 点击**加载已解压的扩展程序**，选择扩展文件夹

5. 扩展图标将出现在工具栏中

### 📖 使用说明

1. 打开要导出的网页
2. 点击工具栏中的扩展图标
3. 根据需要调整设置：
   - 选择纸张大小和方向
   - 启用/禁用背景图形
   - 为懒加载页面开启自动滚动
   - 选择文件命名格式
4. 点击**导出当前页面为 PDF**
5. PDF 将自动下载

### 🔧 工作原理

扩展使用 Chrome DevTools Protocol (CDP) 来：
- 附加调试器到当前标签页
- 应用打印友好的 CSS 修复（移除滚动容器，确保背景可打印）
- 可选地自动滚动页面以触发懒加载内容
- 使用 `Page.printToPDF` API 生成 PDF
- 将结果下载为文件

### ⚠️ 限制说明

- Chrome 系统页面（`chrome://...`）无法导出
- 某些网站可能阻止打印或需要身份验证
- 高度动态或虚拟化的内容可能无法完全渲染

### 🔒 权限说明

- **activeTab** - 仅在点击扩展时访问当前标签页
- **debugger** - CDP 打印 API 所需（仅在导出期间附加）
- **downloads** - 保存生成的 PDF 文件
- **storage** - 本地存储您的偏好设置

### 📝 隐私政策

本扩展：
- ✅ 不收集任何个人数据
- ✅ 不向外部服务器发送数据
- ✅ 所有处理均在浏览器本地完成
- ✅ 仅在本地存储您的设置（纸张大小、页边距等）

### 📄 许可证

MIT 许可证 - 可自由使用和修改

### 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Repository**: https://github.com/NoahWorld/page-to-pdf.git
