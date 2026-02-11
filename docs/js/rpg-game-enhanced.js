// 光明中医RPG - 增强版游戏逻辑（支持JSON关卡加载）

// 游戏状态
const gameState = {
    currentScreen: 'start', // start, create, game, battle, victory, defeat, learning
    player: null,
    currentScene: null,
    currentLevel: null,
    currentSection: 0,
    currentBattle: null,
    dialogQueue: [],
    questProgress: {},
    loadedLevels: {} // 已加载的关卡数据
};

// 游戏数据
const gameData = {
    professions: {
        weiqi: {
            id: 'weiqi',
            name: '卫气守护者',
            icon: '🛡️',
            avatar: '👨‍🎓',
            desc: '防御职业，擅长保护身体、抵御外邪',
            stats: { hp: 120, mp: 40, attack: 20, defense: 50, speed: 25 },
            skills: [
                { id: 'shield_wall', name: '盾墙', icon: '🛡️', mp: 15, damage: 0, defense: 50, desc: '大幅提升防御' },
                { id: 'purify', name: '净化', icon: '✨', mp: 20, damage: 30, desc: '净化邪气，造成伤害' }
            ],
            startingEquipment: { weapon: '木盾', armor: '布衣' }
        },
        yingqi: {
            id: 'yingqi',
            name: '营气调理师',
            icon: '🩺',
            avatar: '👩‍🎓',
            desc: '辅助职业，擅长调理身体、营养输送',
            stats: { hp: 100, mp: 60, attack: 25, defense: 35, speed: 30 },
            skills: [
                { id: 'heal_wounds', name: '愈合伤口', icon: '💚', mp: 25, heal: 50, desc: '恢复50点生命值' },
                { id: 'nourish', name: '滋养', icon: '🌿', mp: 20, buff: 'attackUp', desc: '提升攻击力' }
            ],
            startingEquipment: { weapon: '药杵', armor: '长袍' }
        },
        yuanqi: {
            id: 'yuanqi',
            name: '元气修炼者',
            icon: '🔥',
            avatar: '🧔',
            desc: '战斗职业，擅长强力治疗、恢复元气',
            stats: { hp: 90, mp: 80, attack: 35, defense: 30, speed: 35 },
            skills: [
                { id: 'revitalize', name: '回春', icon: '🌸', mp: 35, heal: 80, desc: '恢复80点生命值' },
                { id: 'burning_strike', name: '燃烧一击', icon: '🔥', mp: 30, damage: 60, desc: '造成60点火焰伤害' }
            ],
            startingEquipment: { weapon: '拂尘', armor: '道袍' }
        }
    },
    avatars: {
        1: '👨‍🎓',
        2: '👩‍🎓',
        3: '👨‍🏫',
        4: '👩‍🏫',
        5: '🧔',
        6: '🧕'
    },
    items: {
        '阴阳玉佩': {
            id: 'yinyang_jade',
            name: '阴阳玉佩',
            icon: '🔮',
            desc: '平衡阴阳的法宝，防御力+30',
            type: 'accessory',
            stats: { defense: 30 }
        },
        '本草药包': {
            id: 'herb_pack',
            name: '本草药包',
            icon: '🌿',
            desc: '珍贵的草药，可用于治疗',
            type: 'consumable',
            effect: 'heal_100'
        }
    }
};

// ==================== 关卡加载系统 ====================

/**
 * 加载关卡数据
 * @param {string} levelId - 关卡ID，格式为 'chapter-01-level-01'
 * @returns {Promise<Object>} 关卡数据
 */
async function loadLevelData(levelId) {
    // 检查是否已加载
    if (gameState.loadedLevels[levelId]) {
        return gameState.loadedLevels[levelId];
    }

    try {
        const response = await fetch(`../levels/${levelId.split('-')[1]}/${levelId.split('-')[3]}/${levelId}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const levelData = await response.json();
        gameState.loadedLevels[levelId] = levelData;
        return levelData;
    } catch (error) {
        console.error('加载关卡失败:', error);
        alert(`加载关卡失败: ${levelId}`);
        return null;
    }
}

/**
 * 加载并开始关卡
 * @param {string} levelId - 关卡ID
 */
async function startLevel(levelId) {
    const levelData = await loadLevelData(levelId);
    if (!levelData) return;

    // 检查前置条件
    if (levelData.prerequisites) {
        if (levelData.prerequisites.level && gameState.player.level < levelData.prerequisites.level) {
            alert(`需要达到 Lv.${levelData.prerequisites.level} 才能挑战此关卡！`);
            return;
        }
        if (levelData.prerequisites.completedLevels) {
            for (const reqLevel of levelData.prerequisites.completedLevels) {
                if (!gameState.player.completedLevels.includes(reqLevel)) {
                    alert(`需要先完成前置关卡！`);
                    return;
                }
            }
        }
    }

    gameState.currentLevel = levelData;
    gameState.currentSection = 0;

    // 显示关卡学习界面
    showLevelIntroduction(levelData);
}

/**
 * 显示关卡介绍
 */
function showLevelIntroduction(levelData) {
    showScreen('level-intro');

    document.getElementById('levelTitle').textContent = `${levelData.chapter} - ${levelData.title}`;
    document.getElementById('levelName').textContent = levelData.name;
    document.getElementById('levelDescription').textContent = levelData.description;
    document.getElementById('levelDifficulty').textContent = levelData.metadata.difficulty;
    document.getElementById('levelEstTime').textContent = levelData.metadata.estimatedTime + ' 分钟';

    // 显示NPC
    document.getElementById('levelNpcAvatar').textContent = levelData.npc.avatar;
    document.getElementById('levelNpcName').textContent = levelData.npc.name;
    document.getElementById('levelNpcIntro').textContent = levelData.npc.introduction;
}

/**
 * 开始学习关卡内容
 */
function startLearning() {
    if (!gameState.currentLevel) return;

    showSection(gameState.currentSection);
}

/**
 * 显示章节内容
 * @param {number} sectionIndex - 章节索引
 */
function showSection(sectionIndex) {
    const level = gameState.currentLevel;
    const section = level.learning.sections[sectionIndex];

    if (!section) {
        // 所有章节学完，进入测验
        startQuiz();
        return;
    }

    showScreen('learning');

    document.getElementById('learningTitle').textContent = level.learning.title;
    document.getElementById('sectionTitle').textContent = section.title;
    document.getElementById('sectionContent').textContent = section.content;

    // 显示重点
    const keyPointsEl = document.getElementById('keyPoints');
    keyPointsEl.innerHTML = section.keyPoints.map(point => `<li>${point}</li>`).join('');

    // 显示示例（如果有）
    const exampleEl = document.getElementById('exampleBox');
    if (section.example) {
        exampleEl.style.display = 'block';
        document.getElementById('exampleScenario').textContent = section.example.scenario;
        let exampleContent = '';
        if (section.example.balancePoint) {
            exampleContent += `<p><strong>平衡点：</strong>${section.example.balancePoint}</p>`;
        }
        if (section.example.range) {
            exampleContent += `<p><strong>范围：</strong>${section.example.range}</p>`;
        }
        if (section.example.yang) {
            exampleContent += `<p><strong>阳：</strong>${section.example.yang}</p>`;
        }
        if (section.example.yin) {
            exampleContent += `<p><strong>阴：</strong>${section.example.yin}</p>`;
        }
        document.getElementById('exampleContent').innerHTML = exampleContent;
    } else {
        exampleEl.style.display = 'none';
    }

    // 更新进度
    const progress = ((sectionIndex + 1) / level.learning.sections.length) * 100;
    document.getElementById('learningProgress').style.width = progress + '%';
    document.getElementById('learningProgressText').textContent = Math.round(progress) + '%';
}

/**
 * 下一章节
 */
function nextSection() {
    gameState.currentSection++;
    showSection(gameState.currentSection);
}

/**
 * 开始测验
 */
function startQuiz() {
    const level = gameState.currentLevel;
    showScreen('quiz');

    document.getElementById('quizTitle').textContent = level.quiz.title;
    displayQuestion(0);
}

/**
 * 显示问题
 * @param {number} questionIndex - 问题索引
 */
function displayQuestion(questionIndex) {
    const level = gameState.currentLevel;
    const quiz = level.quiz;
    const question = quiz.questions[questionIndex];

    if (!question) {
        // 测验完成
        showQuizResults();
        return;
    }

    document.getElementById('questionNumber').textContent = `第 ${questionIndex + 1} / ${quiz.questions.length} 题`;
    document.getElementById('questionText').textContent = question.question;

    // 显示选项
    const optionsEl = document.getElementById('questionOptions');
    optionsEl.innerHTML = '';

    if (question.type === 'single' || question.type === 'judge') {
        question.options.forEach((option, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = option;
            btn.onclick = () => selectAnswer(questionIndex, idx);
            optionsEl.appendChild(btn);
        });
    } else if (question.type === 'multi') {
        question.options.forEach((option, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = option;
            btn.onclick = () => toggleMultiAnswer(questionIndex, idx, btn);
            optionsEl.appendChild(btn);
        });
    }

    gameState.currentQuestion = questionIndex;
    gameState.selectedAnswers = [];
}

/**
 * 选择答案（单选）
 */
function selectAnswer(questionIndex, answerIdx) {
    const level = gameState.currentLevel;
    const question = level.quiz.questions[questionIndex];

    // 显示正确答案
    const options = document.querySelectorAll('.quiz-option');
    const correctIdx = question.answer.charCodeAt(0) - 65; // A=0, B=1, etc.

    options.forEach((btn, idx) => {
        if (idx === correctIdx) {
            btn.classList.add('correct');
        } else if (idx === answerIdx) {
            btn.classList.add('wrong');
        }
        btn.disabled = true;
    });

    // 显示解释
    document.getElementById('answerExplanation').textContent = question.explanation;
    document.getElementById('answerExplanation').style.display = 'block';

    // 记录分数
    gameState.quizScore = gameState.quizScore || 0;
    if (answerIdx === correctIdx) {
        gameState.quizScore++;
    }

    // 下一题按钮
    const nextBtn = document.getElementById('nextQuestionBtn');
    nextBtn.style.display = 'block';
    nextBtn.onclick = () => {
        document.getElementById('answerExplanation').style.display = 'none';
        nextBtn.style.display = 'none';
        displayQuestion(questionIndex + 1);
    };
}

/**
 * 切换多选答案
 */
function toggleMultiAnswer(questionIndex, answerIdx, btn) {
    btn.classList.toggle('selected');
}

/**
 * 显示测验结果
 */
function showQuizResults() {
    const level = gameState.currentLevel;
    const quiz = level.quiz;
    const total = quiz.questions.length;
    const score = gameState.quizScore || 0;
    const percent = Math.round((score / total) * 100);
    const passed = percent >= quiz.passingScore;

    showScreen('quiz-result');

    document.getElementById('quizScore').textContent = `${score} / ${total}`;
    document.getElementById('quizPercent').textContent = percent + '%';
    document.getElementById('quizResult').textContent = passed ? '通过！' : '未通过';
    document.getElementById('quizResult').className = passed ? 'result-pass' : 'result-fail';

    if (passed) {
        // 通过测验，进入应用练习
        setTimeout(() => startApplication(), 2000);
    } else {
        // 未通过，提示重新学习
        document.getElementById('retryQuizBtn').style.display = 'block';
        document.getElementById('retryQuizBtn').onclick = () => {
            gameState.quizScore = 0;
            startQuiz();
        };
    }
}

/**
 * 开始应用练习
 */
function startApplication() {
    const level = gameState.currentLevel;
    if (!level.application) {
        // 没有应用练习，直接进入战斗或完成关卡
        if (level.battle) {
            startBattle();
        } else {
            completeLevel();
        }
        return;
    }

    showScreen('application');
    document.getElementById('applicationTitle').textContent = level.application.title;
    document.getElementById('applicationDesc').textContent = level.application.description;

    displayApplicationCase(0);
}

/**
 * 显示应用案例
 */
function displayApplicationCase(caseIndex) {
    const level = gameState.currentLevel;
    const app = level.application;
    const caseData = app.cases[caseIndex];

    if (!caseData) {
        // 所有必要完成，进入战斗或完成关卡
        if (level.battle) {
            startBattle();
        } else {
            completeLevel();
        }
        return;
    }

    document.getElementById('caseScenario').textContent = caseData.scenario;

    // 显示选项
    const choicesEl = document.getElementById('caseChoices');
    choicesEl.innerHTML = '';

    caseData.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'app-choice';
        btn.textContent = choice;
        btn.onclick = () => selectAppAnswer(caseIndex, idx);
        choicesEl.appendChild(btn);
    });

    document.getElementById('caseExplanation').textContent = '';
}

/**
 * 选择应用答案
 */
function selectAppAnswer(caseIndex, answerIdx) {
    const level = gameState.currentLevel;
    const caseData = level.application.cases[caseIndex];

    // 显示正确答案
    const choices = document.querySelectorAll('.app-choice');
    const correctIdx = caseData.answer.charCodeAt(0) - 65;

    choices.forEach((btn, idx) => {
        if (idx === correctIdx) {
            btn.classList.add('correct');
        } else if (idx === answerIdx) {
            btn.classList.add('wrong');
        }
        btn.disabled = true;
    });

    // 显示解释
    document.getElementById('caseExplanation').textContent = caseData.explanation;

    // 下一题按钮
    const nextBtn = document.getElementById('nextCaseBtn');
    nextBtn.style.display = 'block';
    nextBtn.onclick = () => {
        nextBtn.style.display = 'none';
        displayApplicationCase(caseIndex + 1);
    };
}

/**
 * 完成关卡
 */
function completeLevel() {
    const level = gameState.currentLevel;
    const rewards = level.rewards;

    // 给予奖励
    gameState.player.exp += rewards.exp;
    gameState.player.gold += rewards.gold;

    // 添加物品
    if (rewards.items) {
        rewards.items.forEach(itemId => {
            gameState.player.inventory.push(gameData.items[itemId]);
        });
    }

    // 记录完成的关卡
    if (!gameState.player.completedLevels) {
        gameState.player.completedLevels = [];
    }
    gameState.player.completedLevels.push(level.id);

    // 保存
    saveGame();

    // 显示奖励界面
    showLevelComplete(rewards);
}

/**
 * 显示关卡完成界面
 */
function showLevelComplete(rewards) {
    showScreen('level-complete');

    document.getElementById('completeExp').textContent = '+' + rewards.exp;
    document.getElementById('completeGold').textContent = '+' + rewards.gold;

    const itemsEl = document.getElementById('completeItems');
    itemsEl.innerHTML = '';
    if (rewards.items) {
        rewards.items.forEach(itemId => {
            const item = gameData.items[itemId];
            if (item) {
                const itemEl = document.createElement('div');
                itemEl.className = 'reward-item';
                itemEl.innerHTML = `
                    <span class="reward-icon">${item.icon}</span>
                    <span class="reward-name">${item.name}</span>
                `;
                itemsEl.appendChild(itemEl);
            }
        });
    }
}

/**
 * 开始战斗（如果关卡有战斗）
 */
function startBattle() {
    const level = gameState.currentLevel;
    const battle = level.battle;
    const enemy = { ...battle.enemy };

    gameState.currentBattle = {
        enemy: enemy,
        skills: battle.skills,
        turn: 'player',
        battleLog: []
    };

    showScreen('battle');
    initBattleUI();
}

// ==================== 初始化和事件绑定 ====================

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    initGame();
});

function initGame() {
    const savedData = localStorage.getItem('tcm_rpg_save');

    if (savedData) {
        try {
            gameState.player = JSON.parse(savedData);
            showScreen('start');
        } catch (e) {
            console.error('存档解析失败:', e);
            showScreen('start');
        }
    } else {
        showScreen('start');
    }
}

function bindEvents() {
    // 启动界面
    document.getElementById('newGameBtn').addEventListener('click', () => showScreen('create'));
    document.getElementById('continueBtn').addEventListener('click', continueGame);
    document.getElementById('settingsBtn').addEventListener('click', showSettings);

    // 角色创建
    document.getElementById('backToStart').addEventListener('click', () => showScreen('start'));
    document.getElementById('startAdventureBtn').addEventListener('click', createCharacter);

    // 职业选择
    document.querySelectorAll('.profession-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.profession-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

    // 头像选择
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });

    // 关卡界面
    document.getElementById('startLearningBtn').addEventListener('click', startLearning);
    document.getElementById('nextSectionBtn').addEventListener('click', nextSection);

    // 完成关卡
    document.getElementById('backToMenuBtn').addEventListener('click', () => showScreen('start'));

    // 游戏界面按钮
    document.getElementById('menuBtn').addEventListener('click', toggleGameMenu);
    document.getElementById('inventoryBtn').addEventListener('click', showInventory);
    document.getElementById('skillsBtn').addEventListener('click', showSkills);

    // 战斗界面
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleBattleAction(e.target.dataset.action));
    });

    document.getElementById('continueAfterVictory').addEventListener('click', () => {
        showScreen('start');
    });

    document.getElementById('retryBattle').addEventListener('click', () => startBattle());
    document.getElementById('goToStudy').addEventListener('click', () => {
        showScreen('learning');
    });
}

// ==================== 屏幕显示 ====================

function showScreen(screenName) {
    gameState.currentScreen = screenName;

    // 隐藏所有屏幕
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => {
        s.style.display = 'none';
        s.classList.add('hidden');
    });

    // 屏幕ID映射
    const screenIdMap = {
        'start': 'startScreen',
        'create': 'characterCreateScreen',
        'game': 'gameScreen',
        'battle': 'battleScreen',
        'victory': 'victoryScreen',
        'defeat': 'defeatScreen',
        'level-intro': 'levelIntroScreen',
        'learning': 'learningScreen',
        'quiz': 'quizScreen',
        'quiz-result': 'quizResultScreen',
        'application': 'applicationScreen',
        'level-complete': 'levelCompleteScreen'
    };

    const targetScreenId = screenIdMap[screenName] || (screenName + 'Screen');
    const screen = document.getElementById(targetScreenId);

    if (screen) {
        screen.style.display = 'flex';
        screen.classList.remove('hidden');
    }

    if (screenName === 'game') {
        initGameScreen();
    }
}

// ==================== 角色创建 ====================

function createCharacter() {
    const name = document.getElementById('characterName').value || '中医学徒';
    const selectedProfessionCard = document.querySelector('.profession-card.selected');
    const selectedAvatarOption = document.querySelector('.avatar-option.selected');

    if (!selectedProfessionCard || !selectedAvatarOption) {
        alert('请选择职业和头像！');
        return;
    }

    const professionId = selectedProfessionCard.dataset.profession || 'weiqi';
    const avatarId = selectedAvatarOption.dataset.avatar || '1';

    const profession = gameData.professions[professionId];
    const avatar = gameData.avatars[avatarId];

    gameState.player = {
        id: 'player_' + Date.now(),
        name: name,
        profession: professionId,
        professionName: profession.name,
        professionIcon: profession.icon,
        avatar: avatar,
        level: 1,
        exp: 0,
        gold: 0,
        hp: profession.stats.hp,
        maxHp: profession.stats.hp,
        mp: profession.stats.mp,
        maxMp: profession.stats.mp,
        attack: profession.stats.attack,
        defense: profession.stats.defense,
        speed: profession.stats.speed,
        skills: profession.skills,
        equipment: profession.startingEquipment,
        inventory: [],
        completedLevels: [],
        currentScene: 'start'
    };

    gameState.player.inventory.push(gameData.items['本草药包']);

    saveGame();
    showLevelSelect();
}

function continueGame() {
    const savedData = localStorage.getItem('tcm_rpg_save');
    if (savedData) {
        gameState.player = JSON.parse(savedData);
        showLevelSelect();
    } else {
        alert('没有存档！');
    }
}

// ==================== 关卡选择 ====================

function showLevelSelect() {
    showScreen('level-select');
    loadLevelList();
}

async function loadLevelList() {
    const levelListEl = document.getElementById('levelList');
    levelListEl.innerHTML = '<p>加载关卡中...</p>';

    try {
        // 获取所有关卡文件
        const levels = [
            { id: 'chapter-01-level-01', name: '阴阳之谷', chapter: '第一章' },
            { id: 'chapter-01-level-02', name: '平衡试炼场', chapter: '第一章' },
            { id: 'chapter-01-level-03', name: '智慧殿堂', chapter: '第一章' },
            { id: 'chapter-02-level-01', name: '天地平原', chapter: '第二章' },
            { id: 'chapter-02-level-02', name: '自然观测站', chapter: '第二章' },
            { id: 'chapter-02-level-03', name: '天人合一', chapter: '第二章' },
            { id: 'chapter-03-level-01', name: '人体三气', chapter: '第三章' },
            { id: 'chapter-03-level-02', name: '元气之门', chapter: '第三章' },
            { id: 'chapter-03-level-03', name: '天气之源', chapter: '第三章' },
            { id: 'chapter-03-level-04', name: '地气之基', chapter: '第三章' },
            { id: 'chapter-03-level-05', name: '三气合流', chapter: '第三章' },
            { id: 'chapter-03-level-06', name: '气化实践', chapter: '第三章' },
            { id: 'chapter-03-level-07', name: '三气失衡', chapter: '第三章' },
            { id: 'chapter-03-level-08', name: '三气调和', chapter: '第三章' },
            { id: 'chapter-04-level-01', name: '运行基石', chapter: '第四章' },
            { id: 'chapter-04-level-02', name: '功能形体', chapter: '第四章' }
        ];

        levelListEl.innerHTML = levels.map(level => {
            const completed = gameState.player.completedLevels.includes(level.id);
            const statusClass = completed ? 'completed' : 'available';
            const statusText = completed ? '✓ 已完成' : '▶ 开始';

            return `
                <div class="level-item ${statusClass}" data-level="${level.id}">
                    <div class="level-info">
                        <span class="level-chapter">${level.chapter}</span>
                        <span class="level-name">${level.name}</span>
                    </div>
                    <button class="level-status-btn" onclick="startLevel('${level.id}')">${statusText}</button>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('加载关卡列表失败:', error);
        levelListEl.innerHTML = '<p>加载关卡失败，请刷新页面重试。</p>';
    }
}

// ==================== 战斗系统 ====================

function initBattleUI() {
    const battle = gameState.currentBattle;
    const player = gameState.player;
    const enemy = battle.enemy;

    document.getElementById('enemyAvatar').textContent = enemy.avatar;
    document.getElementById('enemyName').textContent = enemy.name;
    document.getElementById('enemyHPBar').style.width = '100%';
    document.getElementById('enemyHPText').textContent = `${enemy.hp}/${enemy.maxHp}`;

    document.getElementById('playerAvatarBattle').textContent = player.avatar;
    document.getElementById('playerNameBattle').textContent = player.name;
    document.getElementById('playerHPBar').style.width = '100%';
    document.getElementById('playerHPText').textContent = `${player.hp}/${player.maxHp}`;
}

function handleBattleAction(action) {
    const battle = gameState.currentBattle;
    const player = gameState.player;
    const enemy = battle.enemy;

    if (battle.turn !== 'player') return;

    switch (action) {
        case 'attack':
            const damage = Math.max(1, player.attack - enemy.defense + Math.floor(Math.random() * 10) - 5);
            enemy.hp -= damage;
            addBattleLog(`${player.name} 攻击了 ${enemy.name}，造成 ${damage} 点伤害！`, 'player');
            break;

        case 'skill':
            showSkillPanel();
            return;

        case 'heal':
            const healAmount = Math.floor(player.maxMp * 0.3);
            player.hp = Math.min(player.maxHp, player.hp + healAmount);
            player.mp -= 20;
            addBattleLog(`${player.name} 使用了治疗术，恢复了 ${healAmount} 点生命值！`, 'heal');
            break;

        case 'defend':
            const defenseBonus = Math.floor(player.defense * 0.5);
            player.defense += defenseBonus;
            addBattleLog(`${player.name} 进入防御状态，防御力 +${defenseBonus}`, 'player');
            break;
    }

    updateBattleUI();

    if (enemy.hp <= 0) {
        enemy.hp = 0;
        updateBattleUI();
        setTimeout(() => victory(), 1000);
    } else {
        battle.turn = 'enemy';
        setTimeout(() => enemyTurn(), 1000);
    }
}

function showSkillPanel() {
    const panel = document.getElementById('skillPanel');
    const skillList = document.getElementById('skillList');

    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        skillList.innerHTML = gameState.player.skills.map(skill => `
            <div class="skill-item" data-skill="${skill.id}">
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-info">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-desc">${skill.desc}</div>
                    <div class="skill-mp">MP: ${skill.mp}</div>
                </div>
            </div>
        `).join('');

        skillList.querySelectorAll('.skill-item').forEach(item => {
            item.addEventListener('click', () => {
                const skillId = item.dataset.skill;
                useSkill(skillId);
                panel.style.display = 'none';
            });
        });
    } else {
        panel.style.display = 'none';
    }
}

function useSkill(skillId) {
    const skill = gameState.player.skills.find(s => s.id === skillId);
    const battle = gameState.currentBattle;
    const player = gameState.player;
    const enemy = battle.enemy;

    if (player.mp < skill.mp) {
        addBattleLog('MP不足！', 'player');
        return;
    }

    player.mp -= skill.mp;

    if (skill.damage) {
        enemy.hp -= skill.damage;
        addBattleLog(`${player.name} 使用了 ${skill.name}，对 ${enemy.name} 造成 ${skill.damage} 点伤害！`, 'player');
    }

    if (skill.heal) {
        player.hp = Math.min(player.maxHp, player.hp + skill.heal);
        addBattleLog(`${player.name} 使用了 ${skill.name}，恢复了 ${skill.heal} 点生命值！`, 'heal');
    }

    updateBattleUI();

    if (enemy.hp <= 0) {
        enemy.hp = 0;
        updateBattleUI();
        setTimeout(() => victory(), 1000);
    } else {
        battle.turn = 'enemy';
        setTimeout(() => enemyTurn(), 1000);
    }
}

function enemyTurn() {
    const battle = gameState.currentBattle;
    const player = gameState.player;
    const enemy = battle.enemy;

    const skill = battle.skills ? battle.skills[Math.floor(Math.random() * battle.skills.length)] : null;

    if (skill && Math.random() > 0.6) {
        const damage = skill.damage;
        player.hp -= damage;
        addBattleLog(`${enemy.name} 使用了 ${skill.name}，对 ${player.name} 造成 ${damage} 点伤害！`, 'damage');
    } else {
        const damage = Math.max(1, enemy.attack - player.defense + Math.floor(Math.random() * 10) - 5);
        player.hp -= damage;
        addBattleLog(`${enemy.name} 攻击了 ${player.name}，造成 ${damage} 点伤害！`, 'damage');
    }

    updateBattleUI();

    if (player.hp <= 0) {
        player.hp = 0;
        updateBattleUI();
        setTimeout(() => defeat(), 1000);
    } else {
        battle.turn = 'player';
    }
}

function updateBattleUI() {
    const battle = gameState.currentBattle;
    const player = gameState.player;
    const enemy = battle.enemy;

    const playerHpPercent = (player.hp / player.maxHp) * 100;
    const enemyHpPercent = (enemy.hp / enemy.maxHp) * 100;

    document.getElementById('playerHPBar').style.width = playerHpPercent + '%';
    document.getElementById('playerHPText').textContent = `${player.hp}/${player.maxHp}`;
    document.getElementById('enemyHPBar').style.width = enemyHpPercent + '%';
    document.getElementById('enemyHPText').textContent = `${enemy.hp}/${enemy.maxHp}`;
}

function addBattleLog(text, type) {
    const log = document.getElementById('battleLog');
    const entry = document.createElement('div');
    entry.className = `battle-log-entry ${type}`;
    entry.textContent = text;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function victory() {
    const battle = gameState.currentBattle;
    const player = gameState.player;
    const enemy = battle.enemy;

    player.stats.battlesWon++;
    player.gold += 100;

    document.getElementById('victoryMessage').textContent = `你成功击败了 ${enemy.name}！获得 100 经验和 100 金币。`;

    showScreen('victory');
}

function defeat() {
    const player = gameState.player;
    const expGain = 100;

    player.exp += expGain;
    player.hp = Math.floor(player.maxHp * 0.5);

    document.getElementById('defeatExp').textContent = expGain;

    showScreen('defeat');
}

// ==================== 辅助函数 ====================

function initGameScreen() {
    updatePlayerStats();
}

function updatePlayerStats() {
    const player = gameState.player;
    document.getElementById('playerAvatar').textContent = player.avatar;
    document.getElementById('playerName').textContent = player.name;
    document.getElementById('playerTitle').textContent = `Lv.${player.level} ${player.professionName}`;
    document.getElementById('playerHP').textContent = player.hp;
    document.getElementById('playerMP').textContent = player.mp;
    document.getElementById('playerLevel').textContent = player.level;
    document.getElementById('playerExp').textContent = player.exp;
}

function saveGame() {
    localStorage.setItem('tcm_rpg_save', JSON.stringify(gameState.player));
}

function showSettings() {
    alert('设置功能开发中...');
}

function toggleGameMenu() {
    alert('游戏菜单功能开发中...');
}

function showInventory() {
    alert('背包功能开发中...\n当前物品：' + gameState.player.inventory.map(item => item.icon + ' ' + item.name).join('\n'));
}

function showSkills() {
    alert('技能列表：\n' + gameState.player.skills.map(skill => skill.icon + ' ' + skill.name + ' (MP:' + skill.mp + ')').join('\n'));
}
