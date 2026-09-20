/**
 * Arthur Games — shared English / 中文 mode
 * localStorage key: arthurGamesLang ("en" | "zh")
 *
 * Usage: <script src="arthur-i18n.js"></script> then ArthurI18n.boot()
 * Optional: data-i18n="key" on elements, or exact English leaf text in the maps below.
 */
(function (global) {
  'use strict';

  var STORAGE = 'arthurGamesLang';
  var FILE = (function () {
    try {
      var p = (location.pathname || '').split('/').pop() || '';
      return decodeURIComponent(p) || 'index.html';
    } catch (e) {
      return 'index.html';
    }
  })();

  /* Exact English UI string → Chinese (leaf text match) */
  var SHARED_ZH = {
    'Play': '开始',
    'Menu': '菜单',
    'Back': '返回',
    '← Back': '← 返回',
    'Resume': '继续',
    'Paused': '已暂停',
    'Pause': '暂停',
    'Shop': '商店',
    'Tutorial': '教程',
    'Endless': '无尽模式',
    '2 Player': '双人',
    '2 players': '双人',
    'Home': '主页',
    'Retry': '重试',
    'Try again': '再试一次',
    'Play again': '再玩一次',
    'Next level': '下一关',
    'Next trail': '下一条路线',
    'Next chamber': '下一室',
    'Next venue': '下一场地',
    'Next floor': '下一层',
    'Level clear!': '过关！',
    'Game over': '游戏结束',
    'Game over!': '游戏结束！',
    'New best score!': '新最高分！',
    'Owned': '已拥有',
    'Equipped': '已装备',
    'Locked': '未解锁',
    'Clear': '通关',
    'Deploy': '出战',
    'Score': '分数',
    'Best': '最高',
    'Lives': '生命',
    'Level': '关卡',
    'Wave': '波次',
    'Health': '生命值',
    'HP': '生命',
    'Cash': '金钱',
    'Coins': '金币',
    'Credits': '学分',
    'Keys': '钥匙',
    'Pos': '坐标',
    'Seed': '种子',
    'Mode': '模式',
    'Tick': '刻',
    'WALK': '行走',
    'FLY': '飞行',
    '· 20 TPS': '· 20刻/秒',
    'Loading game…': '正在加载游戏…',
    'Click or tap to play': '点击或轻触开始',
    'Click to enter': '点击进入',
    'Got it — play': '知道了 — 开始',
    'This game is 1-player only (hub 2-player setting ignored).': '本游戏仅支持单人（已忽略大厅双人设置）。',
    'lap ': '圈 ',
    'Endless · ': '无尽 · ',
    '中文': '中文',
    'EN': 'EN',
  };

  /* Tutorial overlay strings (all games) — looked up via ArthurI18n.t */
  var TUTORIAL_ZH = {
    'Learn to parkour — Tutorial': '跑酷教学 — 教程',
    'Arrow keys or WASD to move; Space to jump; Shift to sprint on the ground.':
      '方向键或 WASD 移动；空格跳跃；Shift 在地面冲刺。',
    'Campaign levels get harder — some ledges look solid but aren\'t.':
      '战役关卡会越来越难 — 有些平台看起来实心其实不是。',
    'After a fall, press R or Space to retry the stage.':
      '掉落后按 R 或空格重试本关。',
    'Shop and skins are on the main menu; Create builds your own obby.':
      '商店与外观在主菜单；「创建」可做自定义跑酷。',
    'Endless mode loops random campaign stages — chase a high clear count.':
      '无尽模式循环随机战役关 — 冲高通关数。',

    'Target Blaster — Tutorial': '标靶爆破 — 教程',
    'WASD moves your ship; mouse aims; hold click to shoot.':
      'WASD 移动飞船；鼠标瞄准；按住点击射击。',
    'The arena wraps at the edges — use that to escape swarms.':
      '场地边缘会环绕 — 用来躲开蜂群。',
    'Equipment Room: buy and equip weapons. Shop: skins, trails, death FX.':
      '装备室：购买并装备武器。商店：外观、拖尾、击败特效。',
    'Every 10 waves the arena seals — one juggernaut, no escape until it falls.':
      '每 10 波场地封闭 — 出现巨型敌人，打倒前无法逃离。',
    'Endless mode keeps waves coming forever — see how high your level climbs.':
      '无尽模式波次不停 — 看你能升到多高。',

    'Rage Car — Tutorial': '愤怒飞车 — 教程',
    'Arrow keys (↑↓) or A/D change lanes; on touch, tap top or bottom of the road.':
      '方向键（↑↓）或 A/D 换道；触屏点道路上/下半区。',
    'Dodge debris; near-misses build rage (faster run, wilder spawns).':
      '躲开残骸；擦肩而过会积攒怒气（更快、刷怪更猛）。',
    'Bank run coins in the shop; spend them on skins, trails, and road themes.':
      '在商店存入本局金币；用于外观、拖尾与路面主题。',
    'Endless mode never ends — one run until you crash; beat your best score.':
      '无尽模式不停 — 撞毁才结束；冲击最高分。',

    'Snack Catch — Tutorial': '零食接龙 — 教程',
    'Move the basket with mouse or arrow keys.': '用鼠标或方向键移动篮子。',
    'Catch snacks for points; avoid broccoli and bombs.': '接零食得分；躲开西兰花和炸弹。',
    'Stars and combo chains multiply your score.': '星星与连击会放大分数。',
    'Endless mode is survival — keep catching until you miss too much.':
      '无尽模式是生存 — 一直接到失误过多为止。',

    'Depth Strike — Tutorial': '深空突击 — 教程',
    'Spawn in the lobby — walk west through the door into the Weapon Shop.':
      '在大厅出生 — 向西走进门进入武器店。',
    'Stand at a gun display and press E to buy (Keys) or equip. You start with 30 Keys.':
      '站在枪械展示处按 E 购买（钥匙）或装备。开局 30 钥匙。',
    'Green pad = Arena, yellow = Endless. Earn more Keys from your score.':
      '绿垫 = 竞技场，黄垫 = 无尽。用分数赚更多钥匙。',
    'Loadout: 1 Primary, 2 Secondary, 3 Melee, 4 Utility in fights.':
      '出装：1 主武器、2 副武器、3 近战、4 道具。',
    'Default free loadout: Assault Rifle, Handgun, Fists, Grenade — like Rivals.':
      '默认免费出装：突击步枪、手枪、拳头、手雷 — 类似 Rivals。',

    'Island Royale — Tutorial': '岛屿大逃杀 — 教程',
    'Click Deploy, then click the game to capture the mouse.':
      '点击「出战」，再点击游戏锁定鼠标。',
    'WASD move, Space jump, LMB shoot. Pickaxe harvests trees for wood.':
      'WASD 移动，空格跳跃，左键射击。镐砍树得木头。',
    'Tab or scroll to swap weapons. E picks up loot chests (weapons, shield, medkit).':
      'Tab 或滚轮换武器。E 拾取宝箱（武器、护盾、医疗包）。',
    'B = build walls · C = wood/brick/metal · Z rotate · LMB place.':
      'B = 建墙 · C = 木/砖/金属 · Z 旋转 · 左键放置。',
    'Brown zone on the map = underground sewers — use gold manhole dots to enter. Loot and bots spawn down there too.':
      '地图棕色区 = 地下下水道 — 用金色井盖点进入。下面也有战利品和机器人。',
    'Eliminate enemy squads and survive the shrinking storm for Victory Royale.':
      '消灭敌方小队并在缩小风暴中存活，赢得大逃杀胜利。',
    '20+ Fortnite-style weapons: SCAR, Pump, Bolt Sniper, Rocket Launcher, Minigun, and more.':
      '20+ 类堡垒之夜武器：SCAR、泵动霰弹、栓狙、火箭筒、加特林等。',

    'Blockcraft — Tutorial': '方块世界 — 教程',
    'Click Play, then click the canvas to lock the mouse.':
      '点击「开始」，再点击画面锁定鼠标。',
    'WASD move, Space jump, Shift sneak, hold Alt to sprint. Press F to toggle fly.':
      'WASD 移动，空格跳跃，Shift 潜行，按住 Alt 冲刺。按 F 切换飞行。',
    'Left-click breaks blocks; right-click places the selected hotbar block.':
      '左键破坏方块；右键放置快捷栏中选中的方块。',
    'Keys 1–9 or scroll wheel change your hotbar slot.':
      '按键 1–9 或滚轮切换快捷栏。',
    'Explore plains, forest, desert, and snow biomes — dig into caves under the hills.':
      '探索平原、森林、沙漠与雪地 — 可挖进山下洞穴。',
    'Hotbar has redstone: dust, block, torch, repeater, comparator, observer, pistons, lever. E toggles levers/buttons.':
      '快捷栏有红石：红石粉、红石块、火把、中继器、比较器、侦测器、活塞、拉杆。E 切换拉杆/按钮。',
    'Chunks load around you. Fall into the void and you respawn at the surface.':
      '区块在你周围加载。掉进虚空会在地表重生。',
    'Redstone runs at 20 TPS with delays, QC, and piston moving states. Chunks stream as you walk.':
      '红石以 20 刻/秒运行，含延迟、准连接与活塞移动状态。边走边加载区块。',

    'Soundboard Brawler — Tutorial': '采样格斗 — 教程',
    'Click steps on the 16-step grid — kick, snare, hat, bass, synth.':
      '在 16 步网格上点击 — 底鼓、军鼓、踩镲、贝斯、合成器。',
    'Each venue loads a starter beat — preview it, tweak it, then Present to judges.':
      '每个场地有入门节拍 — 预览、调整，再交给评委。',
    'Three judges score 1–10 each — pass when your combined total hits the venue target.':
      '三位评委各打 1–10 分 — 总分达到场地目标即过关。',
    'Endless mode: judges never stop — thresholds rise each venue.':
      '无尽模式：评委不停 — 每场地门槛升高。',

    'The Typo Spellcaster — Tutorial': '错字法师 — 教程',
    'Type spell words and press Enter — FIRE, ICE, HEAL, and more unlock per floor.':
      '输入法术词并按回车 — FIRE、ICE、HEAL 等随楼层解锁。',
    'Green buffer = good prefix; typos like FIER backfire on you.':
      '绿色缓冲 = 正确前缀；打错如 FIER 会反噬。',
    'Esc clears the word buffer; finish the full word before Enter.':
      'Esc 清空输入；完整拼完单词再回车。',
    'Endless mode rolls new random enemy generations — tougher each time you clear a run.':
      '无尽模式刷新随机敌人世代 — 每通关一轮更难。',

    'Glitch Market — Tutorial': '故障市场 — 教程',
    'Click a ticker or press 1–5 to select Slime Gel, Dragon Scales, Crypto-Scrap, and more.':
      '点击股票或按 1–5 选择史莱姆胶、龙鳞、加密废料等。',
    'Buy ×1 / ×10 (or B) and Sell ×1 / all (or V) — news headlines spike or crash prices instantly.':
      '买 ×1 / ×10（或 B）与卖 ×1 / 全部（或 V） — 新闻标题会瞬间拉高或砸盘。',
    'Reinvest profits into trading mods: Inside Info shows 3 leaked headlines at the bottom of the terminal, HFT auto-trades your pick.':
      '把利润投入交易模组：内幕在终端底部显示 3 条泄露标题，高频自动交易你的标的。',
    'Deposit profits banks net worth above $1,000 into the Vault — trade 100 vault credits for 1 Arthur Coin at home.':
      '存入利润会把超过 $1,000 的净资产进金库 — 在主页用 100 金库学分换 1 亚瑟币。',
    'No time limit — chase net worth, deposit to Vault, then exchange at home for Arthur Coins.':
      '无时限 — 冲净资产、存入金库，再在主页兑换亚瑟币。',
  };

  var GAME_ZH = {
    'index.html': {
      'Arthur Games': '亚瑟游戏',
      'Vault': '金库',
      'Arthur Shop': '亚瑟商店',
      'Arthur Coins:': '亚瑟币：',
      'On the home screen': '主页精选',
      'Platformer': '平台跳跃',
      'Arcade': '街机',
      '3D FPS': '3D射击',
      '3D Battle Royale': '3D大逃杀',
      'Racing': '竞速',
      'Puzzle': '解谜',
      'Trading sim': '交易模拟',
      'Beat battle': '节拍对战',
      'Dungeon': '地牢',
      'Tower defense': '塔防',
      'Learn to parkour': '跑酷教学',
      'Target Blaster': '标靶爆破',
      'Depth Strike': '深空突击',
      'Island Royale': '岛屿大逃杀',
      'Blockcraft': '方块世界',
      '3D Sandbox': '3D沙盒',
      'Rage Car': '愤怒飞车',
      'Snack Catch': '零食接龙',
      'Glitch Market': '故障市场',
      'Soundboard Brawler': '采样格斗',
      'The Typo Spellcaster': '错字法师',
      'Bloons TD 6': '气球塔防6',
      'Your custom obby': '自定义跑酷',
      'Campaign, shop, editor, chase wall, UFO, tax, wave, and the rest — full experience.':
        '战役、商店、编辑器、追墙、UFO、税务、浪潮等 — 完整体验。',
      'WASD move, mouse aim, hold click to clear waves of targets.':
        'WASD移动，鼠标瞄准，按住点击清理目标波次。',
      'Rivals hub + walk-in weapon shop — buy every Rivals gun with Keys, then queue on pads.':
        '对决大厅 + 武器店 — 用钥匙买枪，站上平台排队开战。',
      'Fortnite-style island — loot 20+ weapons, health & shield, build walls, fight bot squads, survive the storm.':
        '类堡垒之夜岛屿 — 搜20+武器、生命与护盾，建墙，对抗机器人小队，躲风暴。',
      'Minecraft-style voxels — explore infinite chunks, dig and place blocks, fly, and build with a hotbar.':
        '类我的世界方块 — 探索无限区块，挖掘与放置，飞行，用快捷栏建造。',
      'Three-lane survival: dodge debris as speed and rage climb. A/D or arrows — tap lanes on touch.':
        '三车道生存：速度与怒气上升时躲避残骸。A/D或方向键 — 触屏点车道。',
      'Catch falling snacks in your basket — dodge broccoli and bombs. Combos, stars, and double-points power-ups!':
        '用篮子接住零食 — 躲开西兰花和炸弹。连击、星星与双倍分数道具！',
      'Five volatile commodity tickers on a fake desktop — news shocks prices in real time. Buy low, sell high, reinvest in Inside Info and HFT bots.':
        '假桌面上的五种波动商品 — 新闻实时冲击价格。低买高卖，再投入内幕与高频机器人。',
      'Paint a 16-step loop on kick, snare, hats, bass, and synth — preview it, then present to three judges who score your groove and unlock bigger venues.':
        '在底鼓、军鼓、踩镲、贝斯与合成器上画16步循环 — 预览后交给三位评委打分并解锁更大场地。',
      'Type words to cast — FIRE, ICE, HEAL. A typo like FIER backfires: hot mud, inventory blaze, heals on enemies. Enter to cast.':
        '打字施法 — FIRE、ICE、HEAL。打错如FIER会反噬：热泥、背包起火、治疗敌人。回车施放。',
      'Home hub, Skill Tree, Trophy Store — 22 monkeys, categorized buy bar, and 50+ maps from Meadow to #Ouch.':
        '主页枢纽、技能树、奖杯商店 — 22只猴子、分类购买栏，以及从草地到#Ouch的50+地图。',
      'Mood-board tiles: tone and craft we borrow from (not playable here). Your obby opens our parkour builder.':
        '灵感墙：借鉴的气质与工艺（此处不可玩）。自定义障碍会打开跑酷编辑器。',
    },
    'parkour.html': {
      'Learn to parkour': '跑酷教学',
      'Play campaign': '开始战役',
      'Endless mode': '无尽模式',
      'Level select': '选关',
      'Learn to parkour · Shop': '跑酷 · 商店',
      'Learn to parkour · Create': '跑酷 · 创建',
      'Custom level cleared!': '自定义关卡通关！',
      'Press R or Space to retry': '按 R 或空格重试',
      'Click or tap here to play': '点击或轻触此处开始',
    },
    'gun-game.html': {
      'Target Blaster': '标靶爆破',
      'Play · 1 player': '开始 · 单人',
      'Play · 2 players': '开始 · 双人',
      'Equipment Room': '装备室',
      'Noob · 5 lives': '新手 · 5命',
      'Story mode · 3 lives': '剧情 · 3命',
      'Masters only · 1 life': '大师 · 1命',
      'Skins': '外观',
      'Trails': '拖尾',
      'Map backgrounds': '地图背景',
      'Enemy look': '敌人外观',
      'Death FX': '击败特效',
      'Play again': '再玩一次',
    },
    'depth-strike.html': {
      'Depth Strike': '深空突击',
      'RIVALS · LOBBY': '对决 · 大厅',
      'Lobby': '大厅',
      'Arena': '竞技场',
      'Endless': '无尽',
      'HEALTH': '生命',
      'SLIDING': '滑铲',
      'Menu · M': '菜单 · M',
      'Reloading…': '换弹中…',
      'Match paused': '比赛已暂停',
      'Back to lobby': '返回大厅',
      'Run over': '本局结束',
      'Click to enter the lobby': '点击进入大厅',
      'Joining shared lobby…': '正在加入共享大厅…',
      'Your name': '你的名字',
    },
    'island-royale.html': {
      'Island Royale': '岛屿大逃杀',
      'Easy': '简单',
      'Normal': '普通',
      'Hard': '困难',
      'Choose your difficulty': '选择难度',
      'Wood': '木头',
      'Brick': '砖块',
      'Metal': '金属',
      'Difficulty': '难度',
      'Eliminations': '淘汰',
      'Alive': '存活',
      'Shield': '护盾',
      'Island Map': '岛屿地图',
      'BUILD WALL': '建造墙壁',
      'Victory Royale!': '大逃杀胜利！',
      'Eliminated': '已被淘汰',
      'IN THE STORM — GET TO THE SAFE ZONE': '风暴中 — 快进安全区',
      'Click here to play': '点击此处开始',
      'Chest nearby — walk up and press E': '附近有宝箱 — 走近按 E',
    },
    'minecraft.html': {
      'Blockcraft': '方块世界',
      'Play': '开始',
      'Tutorial': '教程',
      'Click to look around': '点击以环顾四周',
      'Infinite voxel world — walk, dig, and build. Chunks stream around you with biomes, caves, and trees.':
        '无限方块世界 — 行走、挖掘与建造。区块随你流动，含生物群系、洞穴与树木。',
      'WASD move · Space jump · Shift sneak · hold Alt sprint · F fly · E interact':
        'WASD移动 · 空格跳跃 · Shift潜行 · 按住Alt冲刺 · F飞行 · E互动',
      'WASD move · Space jump · Shift sneak · hold Alt sprint · F fly':
        'WASD移动 · 空格跳跃 · Shift潜行 · 按住Alt冲刺 · F飞行',
      'redstone_dust': '红石粉',
      'redstone_block': '红石块',
      'redstone_torch': '红石火把',
      'redstone_lamp': '红石灯',
      'redstone_lamp_on': '红石灯（亮）',
      'lever': '拉杆',
      'stone_button': '石头按钮',
      'repeater': '中继器',
      'comparator': '比较器',
      'observer': '侦测器',
      'piston': '活塞',
      'sticky_piston': '黏性活塞',
      'piston_head': '活塞头',
      'moving_piston': '移动中的活塞',
      'Click lock mouse · LMB break · RMB place · 1–9 / scroll hotbar':
        '点击锁定鼠标 · 左键破坏 · 右键放置 · 1–9 / 滚轮快捷栏',
      'Click the game to capture the mouse. Esc releases pointer lock.':
        '点击游戏以锁定鼠标。Esc 解除指针锁定。',
      'Pos': '坐标',
      'Seed': '种子',
      'Mode': '模式',
      'Tick': '刻',
      'WALK': '行走',
      'FLY': '飞行',
      '· 20 TPS': '· 20刻/秒',
      'grass': '草方块',
      'dirt': '泥土',
      'stone': '石头',
      'cobble': '圆石',
      'planks': '木板',
      'log': '原木',
      'leaves': '树叶',
      'sand': '沙子',
      'snow': '雪',
      'poplar_planks': '杨树木板',
      'poplar_log': '杨树原木',
      'poplar_leaves': '杨树树叶',
      'sulfur': '硫磺',
      'sulfur_ore': '硫磺矿',
      'water': '水',
      'bedrock': '基岩',
      'clay': '黏土',
      'gravel': '砾石',
    },
    'rage-car.html': {
      'Rage Car': '愤怒飞车',
      'Drive': '开车',
      'Skins': '外观',
      'Trails': '拖尾',
      'Backgrounds': '背景',
      'Debris': '残骸',
      'Rage': '怒气',
      'Wrecked': '撞毁了',
      'Again': '再来',
      'Tap or click to drive': '轻触或点击开车',
    },
    'snack-catch.html': {
      'Snack Catch': '零食接龙',
      'Combo': '连击',
      'Score': '分数',
      'Lives': '生命',
      'Best': '最高',
      'Play': '开始',
      'Menu': '菜单',
      'Play again': '再玩一次',
      'Game over!': '游戏结束！',
      'New best score!': '新最高分！',
      'Click or tap to play': '点击或轻触开始',
      'Your best score:': '你的最高分：',
      'No best score yet — go catch snacks!': '还没有最高分 — 去接零食吧！',
      'Move the basket and catch yummy snacks! Dodge broccoli and bombs. Chain catches for combo points — golden stars are worth a ton.':
        '移动篮子接住美味零食！躲开西兰花和炸弹。连续接住可连击得分 — 金色星星超值钱。',
      'A/D or ←/→ move · mouse follows · Esc back to menu':
        'A/D 或 ←/→ 移动 · 鼠标跟随 · Esc 返回菜单',
      'Catch 🍩 🍕 🍪 ⭐ · avoid 🥦 💣 · rainbow snack = double points!':
        '接住 🍩 🍕 🍪 ⭐ · 躲开 🥦 💣 · 彩虹零食 = 双倍分数！',
      ' — nice combos!': ' — 连击漂亮！',
      'You scored ': '你得了 ',
      ' points': ' 分',
      ' points!': ' 分！',
    },
    'glitch-market.html': {
      'Glitch Market': '故障市场',
      'Open terminal': '打开终端',
      'Net worth': '净资产',
      'Session P/L': '本局盈亏',
      'Vault': '金库',
      'Buy ×1': '买 ×1',
      'Buy ×10': '买 ×10',
      'Sell ×1': '卖 ×1',
      'Sell all': '全部卖出',
      'Deposit profits': '存入利润',
      'Reset run': '重置本局',
      'Trading mods': '交易模组',
      'WIRE': '接线',
      'Select a ticker · keys 1–5': '选择股票 · 按键1–5',
      'ACTIVE': '已启用',
    },
    'soundboard-brawler.html': {
      'Soundboard Brawler': '采样格斗',
      'Venue select': '选场地',
      'Choose a venue': '选择场地',
      'Venue': '场地',
      'Compose': '编排',
      'Preview': '预览',
      'Judges': '评委',
      'Your loop': '你的循环',
      'Preview loop': '预览循环',
      'Stop preview': '停止预览',
      'Load starter beat': '加载入门节拍',
      'Present to judges': '交给评委',
      'Clear pattern': '清空编曲',
      'Judges loved it!': '评委超爱！',
      'Tough crowd…': '观众很挑…',
      'Revise & retry': '修改再试',
      'Headliner': '压轴主场',
    },
    'typo-spellcaster.html': {
      'The Typo Spellcaster': '错字法师',
      'Floor select': '选层',
      'Choose a floor': '选择楼层',
      'Floor': '楼层',
      'Room': '房间',
      'Spell': '法术',
      'Floor clear!': '本层通关！',
      'Retry floor': '重试本层',
      'Arch-typo-mancer': '错字大法师',
      'Click to focus the grimoire': '点击聚焦魔导书',
    },
  };

  /* data-i18n keys for hub (index.html) */
  var KEYS = {
    en: {
      'hub.title': 'Arthur Games',
      'hub.tag': 'Saves and coins stay in your browser. Pick a game below — Back returns here without closing the tab. Each game has Play and Tutorial. Games with their own store also show Shop. Endless and 2 Player only appear where supported. Use Vault to trade earnings into Arthur Coins for the Arthur Shop.',
      'hub.coins': 'Arthur Coins:',
      'hub.vault': 'Vault',
      'hub.shop': 'Arthur Shop',
      'hub.profile': 'Profile',
      'hub.spotlights': 'On the home screen',
      'hub.spotLead': 'Mood-board tiles: tone and craft we borrow from (not playable here). Your obby opens our parkour builder.',
      'hub.back': '← Back',
      'hub.loading': 'Loading game…',
      'lang.btn': '中文',
    },
    zh: {
      'hub.title': '亚瑟游戏',
      'hub.tag': '存档与金币保存在浏览器里。选择下方游戏 —「返回」回到这里且不关标签页。每个游戏有「开始」和「教程」。自带商店的会显示「商店」。无尽与双人仅在支持时出现。用「金库」把收益换成亚瑟币，在「亚瑟商店」使用。',
      'hub.coins': '亚瑟币：',
      'hub.vault': '金库',
      'hub.shop': '亚瑟商店',
      'hub.profile': '个人资料',
      'hub.spotlights': '主页精选',
      'hub.spotLead': '灵感墙：借鉴的气质与工艺（此处不可玩）。自定义障碍会打开跑酷编辑器。',
      'hub.back': '← 返回',
      'hub.loading': '正在加载游戏…',
      'lang.btn': 'EN',
    },
  };

  function getLang() {
    try {
      var v = localStorage.getItem(STORAGE);
      if (v === 'zh' || v === 'en') return v;
    } catch (e) { /* ignore */ }
    return 'en';
  }

  function setLang(next) {
    var lang = next === 'zh' ? 'zh' : 'en';
    try { localStorage.setItem(STORAGE, lang); } catch (e) { /* ignore */ }
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    return lang;
  }

  function toggleLang() {
    var next = getLang() === 'zh' ? 'en' : 'zh';
    setLang(next);
    apply(document);
    updateToggleBtn();
    try {
      global.dispatchEvent(new CustomEvent('arthur-lang', { detail: { lang: next } }));
    } catch (e) { /* ignore */ }
    return next;
  }

  function t(en) {
    if (en == null) return en;
    if (getLang() !== 'zh') return String(en);
    var s = String(en);
    var map = buildMap();
    if (map[s] != null) return map[s];
    if (SHARED_ZH[s] != null) return SHARED_ZH[s];
    return s;
  }

  function buildMap() {
    if (getLang() !== 'zh') return {};
    var map = {};
    Object.keys(SHARED_ZH).forEach(function (k) { map[k] = SHARED_ZH[k]; });
    Object.keys(TUTORIAL_ZH).forEach(function (k) { map[k] = TUTORIAL_ZH[k]; });
    var g = GAME_ZH[FILE] || {};
    Object.keys(g).forEach(function (k) { map[k] = g[k]; });
    return map;
  }

  function reverseMap() {
    /* Chinese → English for switching back (from last applied cache) */
    return _revCache || {};
  }

  var _revCache = {};
  var _origAttr = 'data-arthur-i18n-orig';

  function trKey(key) {
    var lang = getLang();
    var pack = KEYS[lang] || KEYS.en;
    if (pack[key] != null) return pack[key];
    return (KEYS.en[key] != null) ? KEYS.en[key] : key;
  }

  function translateLeaf(el, map) {
    if (!el || el.nodeType !== 1) return;
    var tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT' || tag === 'CODE' || tag === 'PRE') return;
    if (el.getAttribute && el.getAttribute('data-i18n-skip') != null) return;

    /* Prefer data-i18n keys */
    var i18nKey = el.getAttribute && el.getAttribute('data-i18n');
    if (i18nKey && el.children.length === 0) {
      if (!el.getAttribute(_origAttr)) el.setAttribute(_origAttr, el.textContent);
      el.textContent = trKey(i18nKey);
      return;
    }

    if (el.children.length > 0) {
      Array.prototype.forEach.call(el.children, function (ch) { translateLeaf(ch, map); });
      return;
    }

    var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return;

    if (getLang() === 'en') {
      var orig = el.getAttribute(_origAttr);
      if (orig != null) el.textContent = orig;
      return;
    }

    if (map[text]) {
      if (!el.getAttribute(_origAttr)) el.setAttribute(_origAttr, el.textContent);
      el.textContent = map[text];
      _revCache[map[text]] = text;
    }
  }

  function apply(root) {
    root = root || document;
    _revCache = {};
    var map = buildMap();
    /* data-i18n first pass */
    Array.prototype.forEach.call(root.querySelectorAll('[data-i18n]'), function (el) {
      if (el.children.length > 0 && el.tagName !== 'OPTION') return;
      if (!el.getAttribute(_origAttr)) el.setAttribute(_origAttr, el.textContent);
      el.textContent = trKey(el.getAttribute('data-i18n'));
    });
    if (root.body) translateLeaf(root.body, map);
    else translateLeaf(root, map);
    updateToggleBtn();
    updateCardDataLabels();
  }

  function updateCardDataLabels() {
    if (FILE !== 'index.html' && FILE !== '') return;
    if (getLang() !== 'zh') return;
    var map = buildMap();
    Array.prototype.forEach.call(document.querySelectorAll('button.card[data-label]'), function (btn) {
      var en = btn.getAttribute('data-label');
      if (map[en]) btn.setAttribute('data-label-zh', map[en]);
    });
  }

  function updateToggleBtn() {
    var btn = document.getElementById('arthurLangBtn');
    if (btn) btn.textContent = getLang() === 'zh' ? 'EN' : '中文';
  }

  function injectToggle() {
    if (document.getElementById('arthurLangBtn')) return;
    /* Games with their own language button (e.g. Bloons) */
    if (document.getElementById('btnLang')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'arthurLangBtn';
    btn.setAttribute('aria-label', 'Language / 语言');
    btn.textContent = getLang() === 'zh' ? 'EN' : '中文';
    btn.style.cssText = [
      'position:fixed', 'top:12px', 'right:12px', 'left:auto', 'z-index:10025',
      'padding:8px 12px', 'border-radius:12px', 'border:2px solid rgba(255,255,255,0.35)',
      'background:rgba(20,24,36,0.88)', 'color:#fff', 'font:700 0.85rem system-ui,sans-serif',
      'cursor:pointer', 'box-shadow:0 4px 16px rgba(0,0,0,0.35)', 'backdrop-filter:blur(6px)',
      'min-width:52px', 'text-align:center',
    ].join(';');
    if (!document.getElementById('arthurLangStyles')) {
      var ls = document.createElement('style');
      ls.id = 'arthurLangStyles';
      ls.textContent =
        '#arthurLangBtn{position:fixed!important;top:12px!important;right:12px!important;left:auto!important;z-index:10025!important}' +
        '@media(max-width:520px){#arthurLangBtn{top:8px!important;right:8px!important}}';
      document.head.appendChild(ls);
    }
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleLang();
    });
    (document.body || document.documentElement).appendChild(btn);
  }

  var _obs = null;
  function watch() {
    if (_obs || !document.body) return;
    var t = 0;
    _obs = new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(function () {
        if (getLang() === 'zh') apply(document);
      }, 120);
    });
    _obs.observe(document.body, { childList: true, subtree: true });
  }

  function boot() {
    setLang(getLang());
    function go() {
      injectToggle();
      apply(document);
      watch();
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', go);
    } else {
      go();
    }
  }

  global.ArthurI18n = {
    STORAGE: STORAGE,
    getLang: getLang,
    setLang: setLang,
    toggle: toggleLang,
    tr: trKey,
    t: t,
    apply: apply,
    boot: boot,
    file: FILE,
  };

  /* Auto-boot unless data-arthur-i18n-manual on <html> */
  if (!document.documentElement.hasAttribute('data-arthur-i18n-manual')) {
    boot();
  }
})(window);
