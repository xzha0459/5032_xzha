# SendGrid 邮件发送功能使用指南

## 概述

本项目已集成SendGrid邮件发送功能，支持发送各种类型的邮件，包括基础邮件、情绪管理策略邮件和带附件的邮件。

## 功能特性

- ✅ 基础邮件发送（文本和HTML格式）
- ✅ 情绪管理策略邮件模板
- ✅ 用户报告邮件模板
- ✅ 附件支持（PDF、Word文档、文本文件）
- ✅ 用户身份验证
- ✅ 错误处理和状态管理
- ✅ 响应式UI设计

## 文件结构

```
src/
├── firebase.js                    # Firebase配置和Functions初始化
├── composables/
│   └── useEmailSender.js         # 邮件发送composable
├── components/
│   └── EmailSender.vue           # 邮件发送组件
├── page/
│   ├── AdminPage.vue            # 管理员页面（已集成邮件功能）
│   └── EmailExamplesPage.vue    # 邮件发送示例页面
└── router/
    └── index.js                 # 路由配置
```

## 使用方法

### 1. 基础使用

```javascript
import { useEmailSender } from '@/composables/useEmailSender.js'

const { sendEmail, isLoading, error, success } = useEmailSender()

// 发送基础邮件
await sendEmail({
  to: 'user@example.com',
  subject: '邮件主题',
  text: '纯文本内容',
  html: '<p>HTML内容</p>' // 可选
})
```

### 2. 发送策略邮件

```javascript
import { useEmailSender } from '@/composables/useEmailSender.js'

const { sendStrategyEmail } = useEmailSender()

// 发送情绪管理策略邮件
await sendStrategyEmail('user@example.com', strategyData)
```

### 3. 发送带附件邮件

```javascript
import { useEmailSender } from '@/composables/useEmailSender.js'

const { sendEmail } = useEmailSender()

// 发送带附件邮件
await sendEmail({
  to: 'user@example.com',
  subject: '带附件的邮件',
  text: '邮件内容',
  attachmentBase64: 'base64编码的附件',
  attachmentName: 'document.pdf'
})
```

### 4. 在组件中使用

```vue
<template>
  <div>
    <EmailSender />
  </div>
</template>

<script>
import EmailSender from '@/components/EmailSender.vue'

export default {
  components: {
    EmailSender
  }
}
</script>
```

## API 参考

### useEmailSender Composable

#### 状态
- `isLoading: Ref<boolean>` - 发送状态
- `error: Ref<string | null>` - 错误信息
- `success: Ref<boolean>` - 成功状态

#### 方法
- `sendEmail(emailData)` - 发送基础邮件
- `sendStrategyEmail(to, strategy)` - 发送策略邮件
- `sendUserReportEmail(to, userData)` - 发送用户报告邮件
- `resetState()` - 重置状态

### EmailSender 组件

一个完整的邮件发送界面，包含：
- 邮件表单
- 附件上传
- 快速模板
- 状态显示

## 配置要求

### 1. Firebase Functions 配置

确保 `functions/.env` 文件包含：
```
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_SENDER=your_verified_sender@domain.com
```

### 2. SendGrid 设置

1. 注册SendGrid账户
2. 创建API密钥（以"SG."开头）
3. 验证发送者邮箱地址
4. 确保API密钥有"Mail Send"权限

### 3. Firebase Functions 部署

```bash
firebase deploy --only functions
```

## 使用示例

### 在AdminPage中使用

AdminPage已经集成了邮件发送功能：

1. **发送策略邮件**：点击策略行的"Email"按钮
2. **发送用户报告**：点击用户行的"Email"按钮
3. **通用邮件发送**：点击"Send Email"按钮打开邮件发送界面

### 访问示例页面

访问 `/email-examples` 页面查看完整的使用示例，包括：
- 基础邮件发送
- 策略邮件发送
- 带附件邮件发送

## 错误处理

系统会自动处理以下错误：
- 用户未登录
- 无效的邮箱地址
- SendGrid API错误
- 网络连接问题

错误信息会显示在UI中，方便用户了解问题所在。

## 安全考虑

- 所有邮件发送都需要用户身份验证
- API密钥存储在服务器端环境变量中
- 输入数据会进行清理和验证
- 附件大小和类型有限制

## 故障排除

### 常见问题

1. **"API key does not start with SG."**
   - 检查SendGrid API密钥格式
   - 确保密钥以"SG."开头

2. **邮件发送失败**
   - 检查SendGrid账户状态
   - 验证发送者邮箱
   - 检查API密钥权限

3. **附件上传失败**
   - 检查文件大小限制
   - 确保文件类型被支持
   - 验证base64编码

### 调试技巧

1. 查看浏览器控制台错误信息
2. 检查Firebase Functions日志
3. 验证环境变量是否正确加载
4. 测试SendGrid API连接

## 扩展功能

可以轻松扩展以下功能：
- 邮件模板管理
- 批量邮件发送
- 邮件发送历史
- 邮件统计和分析
- 更多附件类型支持

## 技术支持

如有问题，请检查：
1. Firebase Functions日志
2. SendGrid账户状态
3. 网络连接
4. 环境变量配置
