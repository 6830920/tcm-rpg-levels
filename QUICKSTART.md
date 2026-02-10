# 快速开始指南

## 本地运行 Demo

### 方法一：Python（推荐）

```bash
# 进入项目目录
cd tcm-rpg-levels

# 启动本地服务器
python -m http.server 8000

# 在浏览器打开
http://localhost:8000/demo/
```

### 方法二：Node.js

```bash
# 全局安装 serve
npm install -g serve

# 进入项目目录
cd tcm-rpg-levels

# 启动服务器
serve

# 在浏览器打开
http://localhost:3000/demo/
```

### 方法三：PHP

```bash
# 进入项目目录
cd tcm-rpg-levels

# 启动 PHP 内置服务器
php -S localhost:8000

# 在浏览器打开
http://localhost:8000/demo/
```

## 游戏操作指南

### 1. 开始游戏

1. 打开 Demo 页面
2. 点击"开始新的旅程"
3. 选择职业（卫气守护者/营气调理师/元气修炼者）
4. 选择头像
5. 输入角色名称
6. 点击"开始冒险"

### 2. 选择关卡

- 进入关卡选择界面
- 查看所有可用关卡
- 点击"开始"进入关卡

### 3. 关卡流程

每个关卡包含以下步骤：

#### 步骤1：学习
- 阅读NPC讲解的知识点
- 查看重点提示
- 学习示例（如果有）
- 点击"继续"进入下一节

#### 步骤2：测验
- 回答测验问题
- 单选题：点击正确选项
- 判断题：选择A或B
- 必须达到及格分数才能继续

#### 步骤3：应用练习（如果有）
- 分析案例场景
- 选择正确的答案
- 查看解释

#### 步骤4：战斗（如果有）
- 使用"攻击"、"技能"、"治疗"、"防御"等选项
- 击败敌人完成关卡
- 获得经验和金币奖励

### 4. 存档功能

- 游戏进度自动保存到浏览器 localStorage
- 下次打开点击"继续游戏"即可恢复

## 关卡数据调用

### 在 JavaScript 中加载关卡

```javascript
// 方法1：fetch（推荐用于浏览器）
async function loadLevel(levelId) {
    const response = await fetch(`../levels/${levelId}.json`);
    const levelData = await response.json();
    return levelData;
}

// 使用示例
const level = await loadLevel('chapter-01-level-01');
console.log(level.title);  // 输出：阴阳平衡

// 方法2：ES6模块导入（适用于构建工具）
import levelData from '../levels/chapter-01/level-01.json';
```

### 关卡数据结构

```json
{
  "id": "chapter-01-level-01",
  "chapter": "第一章",
  "title": "阴阳平衡",
  "level": 1,
  "name": "阴阳之谷",
  "description": "学习阴阳的基本概念和属性",

  "npc": {
    "name": "阴阳长老",
    "avatar": "👴",
    "introduction": "欢迎来到阴阳之谷。"
  },

  "learning": {
    "title": "阴阳基本概念",
    "sections": [
      {
        "id": "1-1",
        "title": "什么是阴阳平衡",
        "content": "阴阳平衡是指...",
        "keyPoints": ["重点1", "重点2"],
        "example": { "scenario": "示例", "balancePoint": "25度" }
      }
    ]
  },

  "quiz": {
    "title": "阴阳概念测验",
    "questions": [
      {
        "id": "q1-1",
        "type": "single",
        "question": "问题内容",
        "options": ["A. 选项1", "B. 选项2"],
        "answer": "A",
        "explanation": "解释说明"
      }
    ],
    "passingScore": 80
  },

  "application": {
    "title": "应用练习",
    "description": "练习说明",
    "cases": [
      {
        "id": "app-1-1",
        "scenario": "案例场景",
        "choices": ["A. 选项1", "B. 选项2"],
        "answer": "A",
        "explanation": "解释"
      }
    ]
  },

  "battle": {
    "title": "战斗名称",
    "enemy": {
      "name": "敌人名称",
      "avatar": "🎭",
      "hp": 600,
      "attack": 60,
      "defense": 50
    },
    "skills": [
      { "name": "技能名", "damage": 50, "description": "描述" }
    ]
  },

  "rewards": {
    "exp": 250,
    "gold": 120,
    "items": ["物品名称"],
    "unlockNext": true
  },

  "prerequisites": {
    "level": 1,
    "completedLevels": []
  },

  "metadata": {
    "source": "《中医概念入门》第一章",
    "difficulty": "入门",
    "estimatedTime": 20,
    "tags": ["阴阳", "基本概念"]
  }
}
```

## 常见问题

### Q: 浏览器提示跨域错误怎么办？

A: 必须使用本地服务器运行，不能直接双击打开HTML文件。使用上述任一方法启动本地服务器。

### Q: 游戏存档在哪里？

A: 存档保存在浏览器 localStorage 中，清除浏览器数据会丢失存档。

### Q: 如何添加新关卡？

A: 参考 README.md 中的"自定义开发"章节。

### Q: 支持哪些浏览器？

A: 支持所有现代浏览器（Chrome、Firefox、Safari、Edge）。

## 下一步

- 阅读完整的 [README.md](README.md)
- 了解 [关卡设计原则](README.md#关卡设计原则)
- 查看 [自定义开发](README.md#自定义开发)
