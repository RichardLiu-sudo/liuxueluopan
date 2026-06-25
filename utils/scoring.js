/**
 * 留学罗盘 — 110分制四维评分引擎
 * 维度：认知天花板(40) + 专业好奇心(30) + 社群贡献力(25) + 个人特质(15)
 */

/**
 * 计算四维总分
 * @param {Object} data - 聚合后的用户数据 { step1, step2, step3, step4 }
 * @returns {{ cognitive:number, curiosity:number, impact:number, character:number, totalScore:number, level:string }}
 */
function calcTotalScore(data) {
  const cognitive = calcCognitive(data.step1 || {});
  const curiosity = calcCuriosity(data.step2 || {});
  const impact = calcImpact(data.step3 || {});
  const character = calcCharacter(data.step4 || {});

  const totalScore = cognitive + curiosity + impact + character;

  let level = 'C';
  if (totalScore >= 95) level = 'S';
  else if (totalScore >= 75) level = 'A';
  else if (totalScore >= 50) level = 'B';

  return { cognitive, curiosity, impact, character, totalScore, level };
}

/* ==================== 维度1：认知天花板与学术潜能 (40分) ==================== */
function calcCognitive(d) {
  const gpaScore = calcGpaScore(d.gpaRange || '');
  const curriculumScore = calcCurriculumScore(d.curriculum || '');
  const testScore = calcTestScore(d.satActRange || '');
  const competitionScore = calcCompetitionScore(d.competition || '');
  const rigorScore = calcRigorScore(d.courseRigor || '');

  // 空值/跳过 → 给该项30%基础分
  const scores = [
    { val: gpaScore, max: 12, base: 3.6 },
    { val: curriculumScore, max: 10, base: 3 },
    { val: testScore, max: 10, base: 3 },
    { val: competitionScore, max: 5, base: 1.5 },
    { val: rigorScore, max: 3, base: 0.9 }
  ];

  let total = 0;
  for (const s of scores) {
    total += (s.val >= 0) ? s.val : s.base;
  }

  return Math.min(40, Math.round(total));
}

function calcGpaScore(range) {
  const map = {
    '4.0': 12, '3.8-4.0': 10, '3.5-3.8': 7, '3.0-3.5': 5,
    '2.5-3.0': 3, '低于2.5': 1, '不确定': -1
  };
  return map[range] !== undefined ? map[range] : -1;
}

function calcCurriculumScore(curriculum) {
  const map = {
    'AP体系': 10, 'IB体系': 10, 'A-Level': 8,
    '高考/普高': 5, '其他国际课程': 6, '不确定': -1
  };
  return map[curriculum] !== undefined ? map[curriculum] : -1;
}

function calcTestScore(range) {
  const map = {
    '1550+/35+': 10, '1450-1540/32-34': 8, '1350-1440/28-31': 6,
    '1250-1340/23-27': 4, '低于1250': 2, '未参加': -1
  };
  return map[range] !== undefined ? map[range] : -1;
}

function calcCompetitionScore(competition) {
  const map = {
    '国际级奖项': 5, '国家级奖项': 4, '省级/地区级': 3,
    '校内奖项': 2, '无竞赛经历': 0
  };
  return map[competition] !== undefined ? map[competition] : -1;
}

function calcRigorScore(rigor) {
  const map = {
    '选了学校最难的课': 3, '中等偏上难度': 2,
    '按部就班': 1, '偏简单': 0
  };
  return map[rigor] !== undefined ? map[rigor] : -1;
}

/* ==================== 维度2：专业专注度与学术好奇心 (30分) ==================== */
function calcCuriosity(d) {
  const majorScore = calcMajorScore(d.majors || []);
  const researchScore = calcResearchScore(d.research || '');
  const exploreScore = calcExploreScore(d.exploration || []);
  const recScore = calcProfRecScore(d.profRec || '');
  const depthScore = calcDepthScore(d.deepNarrative || '');

  const scores = [
    { val: majorScore, max: 5, base: 1.5 },
    { val: researchScore, max: 10, base: 3 },
    { val: exploreScore, max: 8, base: 2.4 },
    { val: recScore, max: 5, base: 1.5 },
    { val: depthScore, max: 2, base: 0.6 }
  ];

  let total = 0;
  for (const s of scores) {
    total += (s.val >= 0) ? s.val : s.base;
  }
  return Math.min(30, Math.round(total));
}

function calcMajorScore(majors) {
  if (!majors || majors.length === 0) return -1;
  // 有明确专业方向（非"未确定"）且方向数量集中 = 高分
  const defined = majors.filter(m => m !== '未确定');
  if (defined.length === 0) return 1;
  if (defined.length === 1) return 5;
  if (defined.length === 2) return 4;
  return 3;
}

function calcResearchScore(research) {
  const map = {
    '有高质量科研经历': 10, '参加过知名夏校': 8,
    '校内科研项目': 6, '线上课程/小项目': 4, '暂无': -1
  };
  return map[research] !== undefined ? map[research] : -1;
}

function calcExploreScore(exploration) {
  if (!exploration || exploration.length === 0) return -1;
  if (exploration.includes('以上都没有')) return 0;
  const weights = {
    'independent_project': 3, 'reading': 2, 'paper': 3,
    'club': 1.5, 'contest': 2
  };
  let score = 0;
  for (const item of exploration) {
    score += (weights[item] || 0);
  }
  return Math.min(8, score);
}

function calcProfRecScore(rec) {
  const map = {
    '有强力专业推荐信': 5, '有普通推荐信': 3,
    '不确定推荐信质量': 2, '暂无': -1
  };
  return map[rec] !== undefined ? map[rec] : -1;
}

function calcDepthScore(narrative) {
  if (!narrative || narrative.trim().length === 0) return -1;
  const len = narrative.trim().length;
  if (len >= 80) return 2;
  if (len >= 40) return 1;
  return 0.5;
}

/* ==================== 维度3：社群贡献力与影响力 (25分) ==================== */
function calcImpact(d) {
  const activityScore = calcActivityTypeScore(d.activityTypes || []);
  const durationScore = calcDurationScore(d.duration || '');
  const influenceScore = calcInfluenceScore(d.influenceDesc || '');
  const leaderScore = calcLeaderScore(d.leaderRole || '');
  const counselorScore = calcCounselorScore(d.counselorRec || '');

  const scores = [
    { val: activityScore, max: 5, base: 1.5 },
    { val: durationScore, max: 8, base: 2.4 },
    { val: influenceScore, max: 5, base: 1.5 },
    { val: leaderScore, max: 5, base: 1.5 },
    { val: counselorScore, max: 2, base: 0.6 }
  ];

  let total = 0;
  for (const s of scores) {
    total += (s.val >= 0) ? s.val : s.base;
  }
  return Math.min(25, Math.round(total));
}

function calcActivityTypeScore(types) {
  if (!types || types.length === 0) return -1;
  // 最多选3个，类型多样性得分
  if (types.length >= 3) return 5;
  if (types.length === 2) return 3.5;
  return 2;
}

function calcDurationScore(duration) {
  const map = {
    '3年以上': 8, '2-3年': 6, '1-2年': 4,
    '不到1年': 2, '暂无': -1
  };
  return map[duration] !== undefined ? map[duration] : -1;
}

function calcInfluenceScore(desc) {
  if (!desc || desc.trim().length === 0) return -1;
  const len = desc.trim().length;
  if (len >= 100) return 5;
  if (len >= 60) return 3.5;
  if (len >= 20) return 2;
  return 1;
}

function calcLeaderScore(role) {
  const map = {
    '是核心领导者': 5, '是团队骨干': 3.5,
    '普通成员': 2, '未担任领导角色': 0
  };
  return map[role] !== undefined ? map[role] : -1;
}

function calcCounselorScore(rec) {
  const map = {
    '会有强力推荐': 2, '普通推荐': 1.5,
    '不确定': 0.5, '没有': -1
  };
  return map[rec] !== undefined ? map[rec] : -1;
}

/* ==================== 维度4：个人特质与抗挫折力 (15分) ==================== */
function calcCharacter(d) {
  const eventScore = calcEventScore(d.growthEvent || '');
  const tagScore = calcTagScore(d.selfTags || []);
  const langScore = calcLangScore(d.language || '');
  const interviewScore = calcInterviewScore(d.interviewConfidence || '');

  const scores = [
    { val: eventScore, max: 5, base: 1.5 },
    { val: tagScore, max: 3, base: 0.9 },
    { val: langScore, max: 5, base: 1.5 },
    { val: interviewScore, max: 2, base: 0.6 }
  ];

  let total = 0;
  for (const s of scores) {
    total += (s.val >= 0) ? s.val : s.base;
  }
  return Math.min(15, Math.round(total));
}

function calcEventScore(event) {
  if (!event || event.trim().length === 0) return -1;
  const len = event.trim().length;
  if (len >= 150) return 5;
  if (len >= 80) return 3.5;
  if (len >= 30) return 2;
  return 1;
}

function calcTagScore(tags) {
  if (!tags || tags.length === 0) return -1;
  return Math.min(3, tags.length);
}

function calcLangScore(lang) {
  const map = {
    '托福110+/雅思8.0+': 5, '托福100-109/雅思7.0-7.5': 4,
    '托福90-99/雅思6.5': 3, '托福80-89/雅思6.0': 2,
    '暂未参加': -1
  };
  return map[lang] !== undefined ? map[lang] : -1;
}

function calcInterviewScore(confidence) {
  const map = {
    '非常自信': 2, '比较从容': 1.5,
    '有点紧张': 1, '还没准备好': -1
  };
  return map[confidence] !== undefined ? map[confidence] : -1;
}

module.exports = { calcTotalScore };
