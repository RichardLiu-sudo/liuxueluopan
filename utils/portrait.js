/**
 * 留学罗盘 — 27画像四维匹配引擎
 * 维度：A(学术天花板) / C(专业好奇心) / I(社群影响力) / P(人格特质)
 * 110分制 → 10分制缩放后匹配
 */

const MAX_SCORES = { A: 40, C: 30, I: 25, P: 15 };

// 27种画像 — 四维10分制区间 [min, max]
const SCORE_INTERVALS = {
  // ──── 全才型 ────
  HEXA: { name: '六边形战士', code: 'HEXA', tagline: '全面均衡，无短板的全能选手', group: '全才型',
    A: [9, 10], C: [9, 10], I: [9, 10], P: [9, 10],
    desc: '你的四维竞争力都处于顶尖水平，是招生官最喜欢的"全能型"申请者。无论是学术天花板、专业好奇心、社群影响力还是个人特质，你都展现出了极高的水准。这类画像在Top 20录取池中占比约8%。' },
  APEX: { name: '顶点攀登者', code: 'APEX', tagline: '学术极致，追求认知边界的开拓者', group: '全才型',
    A: [10, 10], C: [8, 10], I: [7, 9], P: [8, 10],
    desc: '你凭借极致的学术深度在人群中脱颖而出。你在自己选择的学术领域展现出罕见的专注与天赋，同时保持着对世界的好奇和对他人的影响力。招生官看到的是"已被证明的卓越"。' },
  POLS: { name: '北极星', code: 'POLS', tagline: '社群领袖，自带光芒的影响力中心', group: '全才型',
    A: [8, 10], C: [8, 10], I: [10, 10], P: [8, 10],
    desc: '你的影响力是最闪亮的标签。在学术不弱的前提下，你在社群中展现的领导力和改变力让招生官确信：你会成为校园中的积极力量。' },

  // ──── 学术研究型 ────
  ORCL: { name: '神谕者', code: 'ORCL', tagline: '深度钻研，在知识深处寻找答案的探索者', group: '学术研究型',
    A: [9, 10], C: [10, 10], I: [5, 7], P: [7, 9],
    desc: '你对学术的痴迷程度远超同龄人。在你选择的专业领域内，你不仅有扎实的基础，更有超越课纲的深度探索。这类画像在Top 20理工类院校中极受青睐。' },
  SAGE: { name: '贤者', code: 'SAGE', tagline: '博学深思，以智慧连接不同领域的通才', group: '学术研究型',
    A: [8, 10], C: [9, 10], I: [5, 7], P: [8, 10],
    desc: '你拥有跨越学科边界的好奇心，能将不同领域的知识融会贯通。你不仅仅是"学霸"，更是"思考者"。招生官会注意到你独特的思维方式和知识整合能力。' },
  VIRT: { name: '大师', code: 'VIRT', tagline: '技艺精湛，在专精领域达到卓越的匠人', group: '学术研究型',
    A: [8, 10], C: [8, 9], I: [4, 6], P: [7, 9],
    desc: '你在某个具体技能或领域达到的深度令人印象深刻。无论是编程、实验设计还是学术写作，你展现了"真正会做"的实力。这种可验证的能力是最有说服力的申请材料。' },

  // ──── 复合优势型 ────
  TITN: { name: '泰坦', code: 'TITN', tagline: '学术与体能并重，拥有钢铁意志的全面发展者', group: '复合优势型',
    A: [7, 9], C: [6, 8], I: [8, 9], P: [8, 9],
    desc: '你同时拥有扎实的学术成绩和出色的身体素质/运动成就。这种双重优势展现了卓越的时间管理能力和坚韧品格，是招生官非常欣赏的组合。' },
  MUSE: { name: '缪斯', code: 'MUSE', tagline: '学术与艺术交融，用创造力点亮世界的表达者', group: '复合优势型',
    A: [7, 9], C: [8, 10], I: [6, 9], P: [9, 10],
    desc: '你在学术之外展现出强大的艺术表达力或创造力。这种理性与感性的结合让你在申请池中具有天然的记忆点。招生官看到的是一个"有灵魂的学霸"。' },
  NEXA: { name: '联结者', code: 'NEXA', tagline: '跨界沟通，在不同文化/领域间搭建桥梁的翻译者', group: '复合优势型',
    A: [7, 9], C: [7, 9], I: [9, 10], P: [8, 10],
    desc: '你擅长在看似不相关的领域或人群中建立联结。多元文化背景、跨学科项目、或在不同社群之间的协调能力让你成为一个天然的"桥梁"。这类画像在国际化院校中备受欢迎。' },

  // ──── 专才型 ────
  SCOR: { name: '标化战神', code: 'SCOR', tagline: '考试王者，以硬核分数打开大门的实力派', group: '专才型',
    A: [8, 10], C: [2, 5], I: [2, 5], P: [4, 7],
    desc: '你的学术成绩和标准化考试分数是最大的王牌。虽然课外探索和社群影响力不算突出，但过硬的数字确实能为你打开很多大门。可以尝试在文书中呈现"分数之外的故事"。' },
  CLUB: { name: '社团之王', code: 'CLUB', tagline: '活动达人，以实践和领导力证明影响力的行动派', group: '专才型',
    A: [4, 7], C: [4, 7], I: [9, 10], P: [6, 8],
    desc: '你在课外的投入远超同龄人，社区服务、社团领导或体育表现在你的申请中占据核心位置。虽然学术不是最强项，但你展现出的行动力和组织力会让招生官看到你的独特价值。' },
  WILD: { name: '野火', code: 'WILD', tagline: '自由灵魂，不被框架束缚的独特存在', group: '专才型',
    A: [5, 8], C: [7, 10], I: [4, 7], P: [8, 10],
    desc: '你有一种难以被量化却真实存在的吸引力——可能来自独特的成长经历、非传统的学习路径、或令人难忘的个人故事。你的好奇心和个人特质比标准化指标更能打动招生官。' },
  CORE: { name: '中坚力量', code: 'CORE', tagline: '踏实稳健，以可靠和质量取胜的实干家', group: '专才型',
    A: [6, 8], C: [4, 7], I: [5, 7], P: [5, 7],
    desc: '你不追求极端，但在每个维度都做到了"还不错"。这种稳定性本身就是一种竞争力——招生官看到的是一个靠谱、不会让人失望的申请者。在中等竞争度的院校中，你是非常有竞争力的候选人。' },
  WAVE: { name: '奔涌者', code: 'WAVE', tagline: '能量充沛，以热情和行动感染他人的推动者', group: '专才型',
    A: [5, 7], C: [5, 8], I: [7, 9], P: [6, 9],
    desc: '你的热情和能量是最大的武器。虽然学术成绩不那么顶尖，但你充沛的行动力、感染他人的能力让你在任何团队中都成为不可忽视的存在。' },

  // ──── 文化传承型 ────
  ROOT: { name: '根脉守护者', code: 'ROOT', tagline: '文化传承者，以独特背景丰富校园多样性的桥梁', group: '文化传承型',
    A: [6, 8], C: [6, 8], I: [7, 9], P: [8, 10],
    desc: '你的文化背景或独特身份是你最珍贵的申请资产。你与自身文化/传统的深厚连接，为校园多样性带来了无可替代的视角。招生官非常珍视这种"真实性"。' },
  LUMI: { name: '启明者', code: 'LUMI', tagline: '第一代开拓者，以勇气照亮未知前路的先行者', group: '文化传承型',
    A: [6, 9], C: [5, 8], I: [6, 9], P: [9, 10],
    desc: '作为家庭中第一个踏上高等教育之路的人，你身上有一种特别的韧劲和自驱力。招生官会为你的勇气和担当所打动——你不仅在为自己申请，也在为后来者铺路。' },
  FRON: { name: '开拓者', code: 'FRON', tagline: '从零到一，在薄弱基础上构建卓越的逆袭者', group: '文化传承型',
    A: [5, 8], C: [7, 9], I: [6, 9], P: [9, 10],
    desc: '你的起点可能不如别人，但你展现出的成长曲线和突破精神是最动人的故事。招生官不只看你的"位置"，更看你的"斜率"——你的上升轨迹说明一切。' },

  // ──── 均衡发展型 ────
  STAR: { name: '晨星', code: 'STAR', tagline: '稳步上升，各个维度均衡发展的潜力股', group: '均衡发展型',
    A: [5, 7], C: [5, 7], I: [5, 7], P: [5, 7],
    desc: '你在四个维度上都处于中等偏上水平，没有明显的短板。这种均衡的画像在Top 50-100区间有很好的匹配度。接下来可以重点提升1-2个维度，打造自己的招牌优势。' },
  FLUX: { name: '流变者', code: 'FLUX', tagline: '不断演化，在不同方向探索自我的成长者', group: '均衡发展型',
    A: [4, 7], C: [5, 8], I: [5, 8], P: [6, 9],
    desc: '你的兴趣广泛且在不断变化中。虽然"不够专注"可能是一个顾虑，但你展现出的探索精神和适应力本身就是宝贵的品质。招生官会注意到你是一个"还在成长"而非"已经定型"的申请者。' },
  HOPE: { name: '希望之光', code: 'HOPE', tagline: '潜力巨大，虽然起步晚但势头强劲的追赶者', group: '均衡发展型',
    A: [3, 6], C: [4, 7], I: [4, 7], P: [6, 9],
    desc: '你的起点可能不算高，但你展现出的潜力、努力和积极态度令人印象深刻。在合理的院校层级中，你的上升势头和个人特质将是最有力的申请筹码。' },

  // ──── 个人魅力型 ────
  PHNX: { name: '凤凰', code: 'PHNX', tagline: '浴火重生，经历重大挑战后更加强大的幸存者', group: '个人魅力型',
    A: [4, 8], C: [5, 9], I: [5, 8], P: [10, 10],
    desc: '你的人生经历让你比同龄人更早地理解了"韧性"的意义。无论经历的是家庭变故、健康挑战还是其他困境，你从中学到的智慧和力量是你最珍贵的申请素材。招生官会被你的故事打动。' },
  ECHO: { name: '回声', code: 'ECHO', tagline: '深度内省，以思想和价值观引领他人的思想者', group: '个人魅力型',
    A: [5, 7], C: [6, 8], I: [4, 7], P: [9, 10],
    desc: '你不是那种用声音最大的人，但你的思考和洞察却能在他人心中留下持久的回响。你的自我认知深度、同理心和内省能力，在文书中会绽放出独特的光芒。' },
  TEMP: { name: '调温者', code: 'TEMP', tagline: '情绪稳定，在压力下保持冷静和理性的定海神针', group: '个人魅力型',
    A: [5, 8], C: [4, 7], I: [5, 7], P: [8, 9],
    desc: '你在压力下表现出的情绪稳定和理性令人印象深刻。这种品质在竞争激烈的大学环境中极为宝贵——招生官知道你不会在困难面前崩溃，反而会成为团队的"锚"。' },
  SOUL: { name: '燃灯者', code: 'SOUL', tagline: '以同理心和善意照亮他人、凝聚团队的精神支柱', group: '个人魅力型',
    A: [4, 6], C: [4, 7], I: [6, 9], P: [9, 10],
    desc: '你有一种天然的同理心和利他精神，让他人愿意信任和跟随你。虽然不是传统意义上的"领导者"，但你在团队中的凝聚作用和情感价值无可替代。这类画像在小班制文理学院中极受青睐。' },

  // ──── 成长潜力型 ────
  SEED: { name: '种子', code: 'SEED', tagline: '蓄势待发，虽然各项指标还在成长中但潜力可期', group: '成长潜力型',
    A: [2, 5], C: [2, 5], I: [2, 5], P: [2, 6],
    desc: '你目前各项指标还处于成长阶段，但这恰恰意味着最大的潜力空间。不必为当前的分数焦虑——找到1-2个真正热爱的方向深耕，你的申请故事才刚刚开始。' },
  SPRO: { name: '新芽', code: 'SPRO', tagline: '刚起步的探索者，正在发现自己的方向和热情所在', group: '成长潜力型',
    A: [1, 4], C: [1, 4], I: [1, 4], P: [3, 6],
    desc: '你还处于探索自我的阶段，这完全正常。申请大学的过程本身就是一次自我发现之旅。建议通过科研/夏校/志愿者等活动找到你真正感兴趣的方向，让热情引领你的申请。' }
};

/**
 * 将110分制四维分数缩放到10分制
 */
function to10Scale(scores) {
  return {
    A: Math.round((scores.cognitive / MAX_SCORES.A) * 10),
    C: Math.round((scores.curiosity / MAX_SCORES.C) * 10),
    I: Math.round((scores.impact / MAX_SCORES.I) * 10),
    P: Math.round((scores.character / MAX_SCORES.P) * 10)
  };
}

/**
 * 计算用户与某画像的四维欧氏距离（越小越匹配）
 */
function calcDistance(user, portrait) {
  const dims = ['A', 'C', 'I', 'P'];
  let sum = 0;
  for (const dim of dims) {
    const range = portrait[dim];
    const mid = (range[0] + range[1]) / 2;
    const diff = user[dim] - mid;
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * 匹配最佳画像
 * @param {{cognitive, curiosity, impact, character}} scores - 110分制四维分数
 * @returns {{portrait, confidence}}
 */
function matchPortrait(scores) {
  const user = to10Scale(scores);
  const portraits = Object.keys(SCORE_INTERVALS);

  let bestPortrait = null;
  let bestDistance = Infinity;
  let inRange = [];

  for (const key of portraits) {
    const p = SCORE_INTERVALS[key];
    const dist = calcDistance(user, p);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestPortrait = { key, ...p };
    }
    // 同时检查是否在范围内
    const dims = ['A', 'C', 'I', 'P'];
    let allInRange = true;
    for (const dim of dims) {
      if (user[dim] < p[dim][0] || user[dim] > p[dim][1]) {
        allInRange = false;
        break;
      }
    }
    if (allInRange) inRange.push({ key, ...p });
  }

  // 如果存在严格匹配区间内的画像，优先取距离最近的
  if (inRange.length > 0) {
    inRange.sort((a, b) => {
      const da = calcDistance(user, a);
      const db = calcDistance(user, b);
      return da - db;
    });
    bestPortrait = inRange[0];
    bestPortrait = { key: bestPortrait.key, ...bestPortrait };
  }

  // 置信度：距离越小置信度越高
  const confidence = bestDistance < 0.5 ? '高' : bestDistance < 1.5 ? '中' : '一般';

  return {
    portrait: bestPortrait,
    confidence,
    scaledScores: user
  };
}

module.exports = { matchPortrait, SCORE_INTERVALS, to10Scale };
