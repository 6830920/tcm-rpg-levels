// 光明中医RPG - 游戏逻辑

// 游戏状态
const gameState = {
    currentScreen: 'start', // start, create, game, battle, victory, defeat
    player: null,
    currentScene: null,
    currentBattle: null,
    dialogQueue: [],
    questProgress: {}
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
    scenes: {
        yinyang_valley: {
            id: 'yinyang_valley',
            name: '阴阳之谷',
            description: '一个神秘的山谷，这里充满了古老的中医智慧。据说阴阳长老住在这里。',
            npc: '阴阳长老',
            npcAvatar: '👴',
            bg: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
            dialogues: [
                { text: '年轻人，终于见到你了...', choices: [{ text: '请长老指点迷津', next: 1 }] },
                { text: '你要学习中医，首先要理解阴阳平衡。', choices: [{ text: '我准备好了，请教导', next: 2 }] },
                { text: '很好！让我看看你的资质。', choices: [{ text: '开始学习', next: 3 }] }
            ]
        },
        heaven_earth_plains: {
            id: 'heaven_earth_plains',
            name: '天地平原',
            description: '一片广阔的平原，日地平衡的规律在这里展露无遗。',
            npc: '天地行者',
            npcAvatar: '🧙‍♂️',
            bg: 'linear-gradient(135deg, rgba(240, 147, 251, 0.3) 0%, rgba(15, 52, 96, 0.3) 100%)',
            dialogues: [
                { text: '这里是天地平原，你可以观察日地平衡的规律。', choices: [{ text: '我想学习', next: 1 }] },
                { text: '观察天空的变化，感受大地的脉动...', choices: [{ text: '继续观察', next: 2 }] },
                { text: '你已经掌握了日地平衡的基本规律！', choices: [{ text: '谢谢你', next: 3 }] }
            ]
        },
        human_temple: {
            id: 'human_temple',
            name: '人体神殿',
            description: '一座宏伟的神殿，记录着人体运转的奥秘。',
            npc: '人体医师',
            npcAvatar: '👨‍⚕️',
            bg: 'linear-gradient(135deg, rgba(245, 87, 108, 0.3) 0%, rgba(244, 67, 54, 0.3) 100%)',
            dialogues: [
                { text: '欢迎来到人体神殿！这里记录着人体气学的知识。', choices: [{ text: '我想学习', next: 1 }] },
                { text: '人体有三气：元气、天气、地气。你想先学习哪一个？', choices: [
                    { text: '元气', next: 2 },
                    { text: '天气', next: 3 },
                    { text: '地气', next: 4 }
                ]},
                { text: '很好！选择一个方向，深入学习吧。', choices: [{ text: '开始学习', next: 5 }] }
            ]
        },
        dungeon_yin_yang: {
            id: 'dungeon_yin_yang',
            name: '阴阳洞穴',
            description: '一个古老的洞穴，据说阴阳失衡之兽躲藏在这里。',
            isDungeon: true,
            enemy: {
                id: 'yinyang_beast',
                name: '阴阳失衡之兽',
                avatar: '👾',
                level: 1,
                hp: 200,
                maxHp: 200,
                attack: 25,
                defense: 20,
                skills: [
                    { name: '阴阳失衡', damage: 35, desc: '造成大量伤害' },
                    { name: '黑暗能量', damage: 25, desc: '造成持续伤害' }
                ],
                rewards: {
                    exp: 500,
                    gold: 100,
                    items: ['阴阳玉佩']
                }
            },
            bg: 'radial-gradient(circle at center, rgba(20, 20, 40, 0.9) 0%, rgba(10, 10, 30, 0.9) 100%)'
        }
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
    },
    quests: [
        {
            id: 'main_quest',
            name: '击败阴阳失衡之兽',
            description: '在阴阳洞穴深处，有一只阴阳失衡之兽在作祟。击败它，恢复阴阳平衡！',
            stages: [
                { scene: 'yinyang_valley', task: '完成对话', completed: false },
                { scene: 'heaven_earth_plains', task: '学习日地平衡', completed: false },
                { scene: 'human_temple', task: '学习人体三气', completed: false },
                { scene: 'dungeon_yin_yang', task: '击败失衡之兽', completed: false }
            ]
        }
    ]
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM已加载，开始初始化游戏');
    // 先绑定所有事件
    bindEvents();
    // 再初始化游戏
    initGame();
});

function initGame() {
    console.log('初始化游戏...');
    console.log('检查存档...');

    // 检查是否有存档
    const savedData = localStorage.getItem('tcm_rpg_save');
    console.log('存档数据:', savedData ? '存在' : '不存在');

    if (savedData) {
        try {
            gameState.player = JSON.parse(savedData);
            console.log('加载存档成功，进入游戏界面');
            showScreen('game');
            loadScene(gameState.player.currentScene || 'yinyang_valley');
        } catch (e) {
            console.error('存档解析失败:', e);
            showScreen('start');
        }
    } else {
        console.log('无存档，显示启动界面');
        showScreen('start');
    }
}

// 绑定事件
function bindEvents() {
    console.log('绑定事件...');

    // 启动界面
    const newGameBtn = document.getElementById('newGameBtn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            console.log('点击新游戏按钮');
            showScreen('create');
        });
    } else {
        console.error('未找到newGameBtn元素');
    }

    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', continueGame);
    }

    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
    }

    // 角色创建
    document.getElementById('backToStart').addEventListener('click', () => showScreen('start'));
    document.getElementById('startAdventureBtn').addEventListener('click', createCharacter);

    // 职业选择
    const professionCards = document.querySelectorAll('.profession-card');
    console.log('找到职业卡片数量:', professionCards.length);
    professionCards.forEach((card, index) => {
        console.log('绑定职业卡片:', index, card.dataset.profession);
        card.addEventListener('click', () => {
            console.log('点击职业卡片:', card.dataset.profession);
            document.querySelectorAll('.profession-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            console.log('已选择职业:', card.dataset.profession);
        });
    });

    // 头像选择
    const avatarOptions = document.querySelectorAll('.avatar-option');
    console.log('找到头像选项数量:', avatarOptions.length);
    avatarOptions.forEach((opt, index) => {
        console.log('绑定头像选项:', index, opt.dataset.avatar);
        opt.addEventListener('click', () => {
            console.log('点击头像选项:', opt.dataset.avatar);
            document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            console.log('已选择头像:', opt.dataset.avatar);
        });
    });

    // 游戏界面
    document.getElementById('menuBtn').addEventListener('click', () => toggleGameMenu());
    document.getElementById('inventoryBtn').addEventListener('click', () => showInventory());
    document.getElementById('skillsBtn').addEventListener('click', () => showSkills());

    // 战斗界面
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleBattleAction(e.target.dataset.action));
    });

    document.getElementById('continueAfterVictory').addEventListener('click', () => {
        showScreen('game');
        loadScene(gameState.player.currentScene);
    });

    document.getElementById('retryBattle').addEventListener('click', () => startBattle());
    document.getElementById('goToStudy').addEventListener('click', () => {
        showScreen('game');
        loadScene('human_temple');
    });
}

// 显示屏幕
function showScreen(screenName) {
    console.log('切换到屏幕:', screenName);
    gameState.currentScreen = screenName;

    // 隐藏所有屏幕
    const screens = document.querySelectorAll('.screen');
    console.log('找到屏幕数量:', screens.length);
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
        'defeat': 'defeatScreen'
    };

    // 获取目标屏幕ID
    const targetScreenId = screenIdMap[screenName] || (screenName + 'Screen');
    console.log('目标屏幕ID:', targetScreenId);

    // 显示目标屏幕
    const screen = document.getElementById(targetScreenId);
    console.log('目标屏幕元素:', screen);
    if (screen) {
        screen.style.display = 'flex';
        screen.classList.remove('hidden');
        console.log('屏幕显示成功');
    } else {
        console.error('未找到屏幕:', targetScreenId);
    }

    // 初始化屏幕内容
    if (screenName === 'game') {
        initGameScreen();
    }
}

// 继续游戏
function continueGame() {
    const savedData = localStorage.getItem('tcm_rpg_save');
    if (savedData) {
        gameState.player = JSON.parse(savedData);
        showScreen('game');
        loadScene(gameState.player.currentScene || 'yinyang_valley');
    } else {
        alert('没有存档！');
    }
}

// 创建角色
function createCharacter() {
    console.log('创建角色...');

    const name = document.getElementById('characterName').value || '中医学徒';
    console.log('角色名称:', name);

    // 获取选中的职业
    const selectedProfessionCard = document.querySelector('.profession-card.selected');
    if (!selectedProfessionCard) {
        console.error('未选择职业！');
        alert('请选择一个职业！');
        return;
    }
    const professionId = selectedProfessionCard.dataset.profession || 'weiqi';
    console.log('选择职业:', professionId);

    // 获取选中的头像
    const selectedAvatarOption = document.querySelector('.avatar-option.selected');
    if (!selectedAvatarOption) {
        console.error('未选择头像！');
        alert('请选择一个头像！');
        return;
    }
    const avatarId = selectedAvatarOption.dataset.avatar || '1';
    console.log('选择头像:', avatarId);

    const profession = gameData.professions[professionId];
    const avatar = gameData.avatars[avatarId];

    console.log('职业数据:', profession);
    console.log('头像:', avatar);

    // 创建玩家对象
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
        currentScene: 'yinyang_valley',
        questsCompleted: [],
        stats: {
            battlesWon: 0,
            totalDamage: 0,
            totalHealing: 0
        }
    };

    // 给予初始物品
    gameState.player.inventory.push(gameData.items['本草药包']);

    // 保存
    saveGame();

    // 进入游戏
    showScreen('game');
    loadScene('yinyang_valley');
}

// 初始化游戏界面
function initGameScreen() {
    updatePlayerStats();
    updateQuestHint();
}

// 加载场景
function loadScene(sceneId) {
    const scene = gameData.scenes[sceneId];
    if (!scene) {
        alert('场景不存在！');
        return;
    }

    gameState.player.currentScene = sceneId;
    saveGame();

    // 更新游戏场景背景
    document.getElementById('gameScene').style.background = scene.bg;

    // 如果是副本，开始战斗
    if (scene.isDungeon && scene.enemy) {
        startBattle();
    } else {
        // 显示NPC对话
        showNPCDialogue(scene.npc, scene.npcAvatar, scene.dialogues);
    }

    // 更新小地图
    updateMiniMap(sceneId);
}

// 显示NPC对话
function showNPCDialogue(npcName, npcAvatar, dialogues) {
    gameState.dialogQueue = [...dialogues];
    showNextDialogue();
}

// 显示下一条对话
function showNextDialogue() {
    if (gameState.dialogQueue.length === 0) {
        document.getElementById('npcDialog').style.display = 'none';
        return;
    }

    const dialogue = gameState.dialogQueue[0];
    const npcNameEl = document.getElementById('npcName');
    const dialogTextEl = document.getElementById('dialogText');
    const dialogChoicesEl = document.getElementById('dialogChoices');

    document.getElementById('npcAvatar').textContent = npcAvatar;
    npcNameEl.textContent = dialogue.text;
    dialogTextEl.textContent = '';
    dialogChoicesEl.innerHTML = '';

    // 延迟显示文本
    setTimeout(() => {
        dialogTextEl.textContent = dialogue.text;

        // 显示选项
        if (dialogue.choices && dialogue.choices.length > 0) {
            dialogChoicesEl.innerHTML = dialogue.choices.map((choice, index) =>
                `<button class="dialog-choice" data-index="${index}">${choice.text}</button>`
            ).join('');

            // 绑定选项事件 - 使用data-index属性获取正确的索引
            dialogChoicesEl.querySelectorAll('.dialog-choice').forEach(btn => {
                btn.addEventListener('click', () => {
                    const choiceIndex = parseInt(btn.dataset.index);
                    console.log('点击对话选项:', choiceIndex);
                    handleDialogueChoice(choiceIndex);
                });
            });
        }
    }, 500);

    document.getElementById('npcDialog').style.display = 'flex';
}

// 处理对话选择
function handleDialogueChoice(choiceIndex) {
    const dialogue = gameState.dialogQueue[0];
    const choice = dialogue.choices[choiceIndex];

    // 移除当前对话
    gameState.dialogQueue.shift();

    // 记录任务进度
    if (gameState.player.currentScene === 'yinyang_valley' && choice.text.includes('开始学习')) {
        gameState.questProgress['yinyang_valley'] = true;
    }

    if (gameState.player.currentScene === 'heaven_earth_plains' && choice.text.includes('谢谢你')) {
        gameState.questProgress['heaven_earth_plains'] = true;
    }

    if (gameState.player.currentScene === 'human_temple' && choice.text.includes('开始学习')) {
        gameState.questProgress['human_temple'] = true;
    }

    // 检查是否所有前置任务完成
    if (gameState.questProgress['yinyang_valley'] && gameState.questProgress['heaven_earth_plains'] && gameState.questProgress['human_temple']) {
        // 解锁阴阳洞穴
        // 自动触发
        setTimeout(() => {
            showNPCMessage('你已完成所有学习任务，阴阳洞穴已经开放了！准备好去挑战失衡之兽了吗？', () => {
                loadScene('dungeon_yin_yang');
            });
        }, 2000);
        return;
    }

    // 下一条对话
    if (choice.next !== undefined) {
        // 显示NPC消息，提示去下一个场景
        const currentScene = gameData.scenes[gameState.player.currentScene];
        const nextSceneId = Object.keys(gameData.scenes)[Object.keys(gameData.scenes).indexOf(gameState.player.currentScene) + 1];

        if (nextSceneId) {
            const nextScene = gameData.scenes[nextSceneId];
            setTimeout(() => {
                showNPCMessage(`很好！现在前往${nextScene.name}继续学习吧。`, () => {
                    loadScene(nextSceneId);
                });
            }, 1000);
        } else {
            document.getElementById('npcDialog').style.display = 'none';
        }
    } else {
        document.getElementById('npcDialog').style.display = 'none';
    }
}

// 显示NPC消息
function showNPCMessage(text, callback) {
    const npcDialog = document.getElementById('npcDialog');
    document.getElementById('npcAvatar').textContent = '👴';
    document.getElementById('npcName').textContent = '老医师';
    document.getElementById('dialogText').textContent = text;
    document.getElementById('dialogChoices').innerHTML = '';

    npcDialog.style.display = 'flex';

    // 自动隐藏
    setTimeout(() => {
        npcDialog.style.display = 'none';
        if (callback) callback();
    }, 3000);
}

// 开始战斗
function startBattle() {
    const scene = gameData.scenes[gameState.player.currentScene];
    if (!scene.isDungeon || !scene.enemy) {
        alert('这里没有敌人！');
        return;
    }

    const enemy = { ...scene.enemy };
    gameState.currentBattle = {
        enemy: enemy,
        turn: 'player', // player, enemy
        playerAction: null,
        battleLog: []
    };

    showScreen('battle');
    initBattleUI();
}

// 初始化战斗界面
function initBattleUI() {
    const battle = gameState.currentBattle;
    const player = gameState.player;
    const enemy = battle.enemy;

    // 更新敌人信息
    document.getElementById('enemyAvatar').textContent = enemy.avatar;
    document.getElementById('enemyName').textContent = enemy.name;
    updateEnemyHP();

    // 更新玩家信息
    document.getElementById('playerAvatarBattle').textContent = player.avatar;
    document.getElementById('playerNameBattle').textContent = player.name;
    updatePlayerHP();
}

// 更新玩家HP
function updatePlayerHP() {
    const player = gameState.player;
    const hpPercent = (player.hp / player.maxHp) * 100;
    document.getElementById('playerHPBar').style.width = hpPercent + '%';
    document.getElementById('playerHPText').textContent = `${player.hp}/${player.maxHp}`;
}

// 更新敌人HP
function updateEnemyHP() {
    const enemy = gameState.currentBattle.enemy;
    const hpPercent = (enemy.hp / enemy.maxHp) * 100;
    document.getElementById('enemyHPBar').style.width = hpPercent + '%';
    document.getElementById('enemyHPText').textContent = `${enemy.hp}/${enemy.maxHp}`;
}

// 更新玩家状态栏
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

// 更新任务提示
function updateQuestHint() {
    const quest = gameData.quests[0];
    const completedStages = quest.stages.filter(s => gameState.questProgress[s.scene]).length;
    const progress = Math.round((completedStages / quest.stages.length) * 100);

    document.getElementById('questContent').textContent = quest.description;
    document.getElementById('questProgress').style.width = progress + '%';
    document.getElementById('questProgressText').textContent = progress + '%';
}

// 更新小地图
function updateMiniMap(sceneId) {
    const miniMap = document.getElementById('miniMap');
    const markers = miniMap.querySelectorAll('.map-marker');

    markers.forEach(marker => marker.remove());

    const scenes = Object.keys(gameData.scenes);
    scenes.forEach((s, index) => {
        const marker = document.createElement('div');
        marker.className = 'map-marker';
        if (s === sceneId) {
            marker.classList.add('current');
        }
        marker.style.top = (20 + index * 15) + '%';
        marker.style.left = (20 + index * 10) + '%';
        marker.textContent = '●';
        miniMap.appendChild(marker);
    });
}

// 处理战斗动作
function handleBattleAction(action) {
    const battle = gameState.currentBattle;
    const player = gameState.player;
    const enemy = battle.enemy;

    // 玩家回合
    if (battle.turn === 'player') {
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

        // 检查敌人是否死亡
        if (enemy.hp <= 0) {
            enemy.hp = 0;
            updateEnemyHP();
            setTimeout(() => {
                victory();
            }, 1000);
        } else {
            updateEnemyHP();
            battle.turn = 'enemy';
            setTimeout(() => {
                enemyTurn();
            }, 1000);
        }
    }

    updatePlayerHP();
}

// 显示技能面板
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

        // 绑定技能点击事件
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

// 使用技能
function useSkill(skillId) {
    const skill = gameState.player.skills.find(s => s.id === skillId);
    const battle = gameState.currentBattle;
    const player = gameState.player;
    const enemy = battle.enemy;

    // 检查MP
    if (player.mp < skill.mp) {
        addBattleLog('MP不足！', 'player');
        return;
    }

    player.mp -= skill.mp;

    if (skill.damage) {
        const damage = skill.damage;
        enemy.hp -= damage;
        addBattleLog(`${player.name} 使用了 ${skill.name}，对 ${enemy.name} 造成 ${damage} 点伤害！`, 'player');
    }

    if (skill.heal) {
        player.hp = Math.min(player.maxHp, player.hp + skill.heal);
        addBattleLog(`${player.name} 使用了 ${skill.name}，恢复了 ${skill.heal} 点生命值！`, 'heal');
    }

    if (skill.buff) {
        player.attack += 10;
        addBattleLog(`${player.name} 使用了 ${skill.name}，攻击力提升了！`, 'player');
    }

    updatePlayerHP();

    if (enemy.hp <= 0) {
        enemy.hp = 0;
        updateEnemyHP();
        setTimeout(() => {
            victory();
        }, 1000);
    } else {
        updateEnemyHP();
        battle.turn = 'enemy';
        setTimeout(() => {
            enemyTurn();
        }, 1000);
    }
}

// 敌人回合
function enemyTurn() {
    const battle = gameState.currentBattle;
    const player = gameState.player;
    const enemy = battle.enemy;

    // 敌人随机选择技能或攻击
    const skill = enemy.skills ? enemy.skills[Math.floor(Math.random() * enemy.skills.length)] : null;

    if (skill && Math.random() > 0.6) {
        const damage = skill.damage;
        player.hp -= damage;
        addBattleLog(`${enemy.name} 使用了 ${skill.name}，对 ${player.name} 造成 ${damage} 点伤害！`, 'damage');
    } else {
        const damage = Math.max(1, enemy.attack - player.defense + Math.floor(Math.random() * 10) - 5);
        player.hp -= damage;
        addBattleLog(`${enemy.name} 攻击了 ${player.name}，造成 ${damage} 点伤害！`, 'damage');
    }

    updatePlayerHP();

    if (player.hp <= 0) {
        player.hp = 0;
        updatePlayerHP();
        setTimeout(() => {
            defeat();
        }, 1000);
    } else {
        battle.turn = 'player';
    }
}

// 添加战斗日志
function addBattleLog(text, type) {
    const log = document.getElementById('battleLog');
    const entry = document.createElement('div');
    entry.className = `battle-log-entry ${type}`;
    entry.textContent = text;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

// 胜利
function victory() {
    const battle = gameState.currentBattle;
    const player = gameState.player;
    const enemy = battle.enemy;

    // 记录战斗统计
    player.stats.battlesWon++;
    player.gold += enemy.rewards.gold;

    // 获得奖励
    enemy.rewards.items.forEach(itemId => {
        player.inventory.push(gameData.items[itemId]);
    });

    // 更新奖励显示
    document.getElementById('victoryMessage').textContent = `你成功击败了 ${enemy.name}！获得 ${enemy.rewards.exp} 经验和 ${enemy.rewards.gold} 金币。`;

    showScreen('victory');
}

// 失败
function defeat() {
    const player = gameState.player;
    const expGain = 100;

    player.exp += expGain;

    // 检查升级
    checkLevelUp();

    // 恢复部分HP
    player.hp = Math.floor(player.maxHp * 0.5);

    document.getElementById('defeatExp').textContent = expGain;

    showScreen('defeat');
    updatePlayerStats();
}

// 检查升级
function checkLevelUp() {
    const player = gameState.player;
    const expNeeded = player.level * 500;

    if (player.exp >= expNeeded) {
        player.level++;
        player.exp -= expNeeded;
        player.maxHp += 10;
        player.maxMp += 5;
        player.attack += 5;
        player.defense += 3;
        player.hp = player.maxHp;
        player.mp = player.maxMp;

        alert(`恭喜！升级到 Lv.${player.level}！`);
        saveGame();
    }
}

// 保存游戏
function saveGame() {
    localStorage.setItem('tcm_rpg_save', JSON.stringify(gameState.player));
}

// 显示设置（简单实现）
function showSettings() {
    alert('设置功能开发中...');
}

// 切换游戏菜单
function toggleGameMenu() {
    // TODO: 实现游戏菜单
    alert('游戏菜单功能开发中...');
}

// 显示背包
function showInventory() {
    alert('背包功能开发中...\n当前物品：' + gameState.player.inventory.map(item => item.icon + ' ' + item.name).join('\n'));
}

// 显示技能
function showSkills() {
    alert('技能列表：\n' + gameState.player.skills.map(skill => skill.icon + ' ' + skill.name + ' (MP:' + skill.mp + ')').join('\n'));
}
