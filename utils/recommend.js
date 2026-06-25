/**
 * 选校推荐引擎 — 基于总分和偏好的三档推荐
 * 返回 {reach: [], match: [], safety: []}，每所学校含完整信息+推荐语
 */
const schoolData = require('./schoolData.js');

function getRecommendations(score, preferences) {
  const schools = schoolData.getAllSchools();
  const totalScore = (typeof score === 'number') ? score : (score.totalScore || 0);

  // 根据总分确定推荐梯队层级
  const tierMap = getTierMap(totalScore);

  // 三档候选池
  let reachPool = [];
  let matchPool = [];
  let safetyPool = [];

  for (const school of schools) {
    if (tierMap.reach.includes(school.tier)) reachPool.push(school);
    else if (tierMap.match.includes(school.tier)) matchPool.push(school);
    else if (tierMap.safety.includes(school.tier)) safetyPool.push(school);
  }

  // 偏好过滤
  const prefs = preferences || {};
  if (prefs.regions && prefs.regions.length > 0) {
    reachPool = filterByRegion(reachPool, prefs.regions);
    matchPool = filterByRegion(matchPool, prefs.regions);
    safetyPool = filterByRegion(safetyPool, prefs.regions);
  }
  if (prefs.size) {
    reachPool = filterBySize(reachPool, prefs.size);
    matchPool = filterBySize(matchPool, prefs.size);
    safetyPool = filterBySize(safetyPool, prefs.size);
  }
  if (prefs.schoolType) {
    reachPool = filterByType(reachPool, prefs.schoolType);
    matchPool = filterByType(matchPool, prefs.schoolType);
    safetyPool = filterByType(safetyPool, prefs.schoolType);
  }
  if (prefs.tuition) {
    reachPool = filterByTuition(reachPool, prefs.tuition);
    matchPool = filterByTuition(matchPool, prefs.tuition);
    safetyPool = filterByTuition(safetyPool, prefs.tuition);
  }

  // 按排名排序 + 取样
  reachPool.sort((a, b) => a.rank - b.rank);
  matchPool.sort((a, b) => a.rank - b.rank);
  safetyPool.sort((a, b) => a.rank - b.rank);

  // 如果偏好过滤后不够，从原池中补充（放松偏好约束）
  const minCount = 3;
  if (reachPool.length < minCount) {
    const allReach = schools.filter(s => tierMap.reach.includes(s.tier)).sort((a, b) => a.rank - b.rank);
    reachPool = mergeAndDedup(reachPool, allReach, minCount);
  }
  if (matchPool.length < minCount) {
    const allMatch = schools.filter(s => tierMap.match.includes(s.tier)).sort((a, b) => a.rank - b.rank);
    matchPool = mergeAndDedup(matchPool, allMatch, minCount);
  }
  if (safetyPool.length < minCount) {
    const allSafety = schools.filter(s => tierMap.safety.includes(s.tier)).sort((a, b) => a.rank - b.rank);
    safetyPool = mergeAndDedup(safetyPool, allSafety, minCount);
  }

  // 生成推荐语
  const reach = reachPool.slice(0, 5).map(s => ({ ...s, reason: genReachReason(s, totalScore) }));
  const match = matchPool.slice(0, 5).map(s => ({ ...s, reason: genMatchReason(s, totalScore) }));
  const safety = safetyPool.slice(0, 5).map(s => ({ ...s, reason: genSafetyReason(s, totalScore) }));

  return { reach, match, safety, totalScore };
}

function getTierMap(score) {
  if (score >= 105) return { reach: ['T0'], match: ['T0', 'T1'], safety: ['T1', 'T2'] };
  if (score >= 95) return { reach: ['T0'], match: ['T1'], safety: ['T2'] };
  if (score >= 85) return { reach: ['T0', 'T1'], match: ['T2'], safety: ['T3'] };
  if (score >= 75) return { reach: ['T1'], match: ['T2'], safety: ['T3'] };
  if (score >= 65) return { reach: ['T2'], match: ['T3'], safety: ['T4'] };
  if (score >= 55) return { reach: ['T2', 'T3'], match: ['T3', 'T4'], safety: ['T4'] };
  if (score >= 45) return { reach: ['T3'], match: ['T4'], safety: ['T4', 'T5'] };
  if (score >= 35) return { reach: ['T3', 'T4'], match: ['T4'], safety: ['T5'] };
  return { reach: ['T4'], match: ['T4', 'T5'], safety: ['T5'] };
}

function filterByRegion(schools, regions) {
  return schools.filter(s => {
    const loc = s.location || '';
    for (const r of regions) {
      if (loc.includes(r)) return true;
    }
    return false;
  });
}

function filterBySize(schools, size) {
  if (!size || size === 'any' || size === '无偏好') return schools;
  return schools.filter(s => {
    if (size.includes('小型') || size === 'small') return s.size < 5000;
    if (size.includes('中型') || size === 'medium') return s.size >= 5000 && s.size < 20000;
    if (size.includes('大型') || size === 'large') return s.size >= 20000;
    return true;
  });
}

function filterByType(schools, type) {
  if (!type || type === 'any' || type === '无偏好') return schools;
  return schools.filter(s => (s.type || '').includes(type));
}

function filterByTuition(schools, budget) {
  if (!budget || budget === '无偏好') return schools;
  return schools.filter(s => {
    const t = s.tuition || 0;
    if (budget.includes('低成本') || budget === 'low') return t < 35000;
    if (budget.includes('中等') || budget === 'mid') return t >= 35000 && t < 55000;
    if (budget.includes('高成本') || budget === 'high') return t >= 55000;
    return true;
  });
}

function mergeAndDedup(current, full, targetCount) {
  const names = new Set(current.map(s => s.name));
  for (const s of full) {
    if (current.length >= targetCount) break;
    if (!names.has(s.name)) {
      current.push(s);
      names.add(s.name);
    }
  }
  return current;
}

function genReachReason(school, score) {
  const nameCN = school.nameCN || school.name;
  const tier = school.tier;
  const schoolKW = getSchoolKeywords(school);
  const majors = getSchoolMajors(school);
  let matchReason, full;

  if (score >= 95) {
    matchReason = '你的综合竞争力较强，可将该校作为冲刺目标。虽然录取竞争极为激烈，但你的亮点（学术或活动深度）可以弥补部分差距。建议在文书中突出你的独特视角和个人故事线。';
    full = nameCN + '是你的冲刺目标。虽然竞争激烈，但你的学术和活动背景已经具备了冲击的实力。建议在文书中重点展现你的独特视角。';
  } else if (score >= 75) {
    matchReason = '该校对你来说有一定距离，但冲刺的意义在于"跳一跳够得着"。你的软实力如果展示得当，加上独特的个人故事，完全有机会打动招生官。';
    full = nameCN + '对你来说是不小的挑战，但这正是"冲刺"的意义——你的软实力如果展示得当，完全有机会打动招生官。';
  } else {
    matchReason = '该校录取区间明显高于你的当前测评分数，属于高难度冲刺。建议全力以赴打磨文书和活动列表，用软实力和个人特色弥补硬指标的差距。';
    full = nameCN + '作为冲刺目标，建议你全力以赴打磨文书和活动列表，用软实力弥补硬指标的差距。';
  }

  return {
    difficulty: '极高竞争',
    keywords: schoolKW,
    matchReason,
    majors,
    full
  };
}

function genMatchReason(school, score) {
  const nameCN = school.nameCN || school.name;
  const schoolKW = getSchoolKeywords(school);
  const majors = getSchoolMajors(school);
  let matchReason, full;

  if (score >= 85) {
    matchReason = '你的学术成绩和活动经历完全符合该校对优秀申请者的预期，属于高度匹配。建议将其作为重点主申目标之一，提前联系招生办或访校。';
    full = nameCN + '与你的背景高度匹配。你的学术成绩和活动经历完全符合该校对优秀申请者的预期，录取概率较为可观。';
  } else if (score >= 65) {
    matchReason = '你的综合竞争力在该校录取池中处于中上水平，区间吻合度较高。建议作为申请重心之一，注意文书中展示与该校价值观的契合度。';
    full = nameCN + '是你合理的主申目标。你的综合竞争力在该校录取池中处于中上水平，建议将其作为申请重心之一。';
  } else {
    matchReason = '你的条件和该校录取标准有较好的契合度，属于合理匹配。建议深入了解该校的专业特色和文化，在Why School文书中展现你的真诚兴趣。';
    full = nameCN + '与你的条件较为匹配，该校的录取标准和你的背景有较好的契合度，录取希望较大。';
  }

  return {
    difficulty: '匹配区间',
    keywords: schoolKW,
    matchReason,
    majors,
    full
  };
}

function genSafetyReason(school, score) {
  const nameCN = school.nameCN || school.name;
  const schoolKW = getSchoolKeywords(school);
  const majors = getSchoolMajors(school);
  const matchReason = '你的学术背景超过了该校录取中位数水平，录取把握很高。可以作为申请清单中的安全着陆点，但不要轻视——保底校也需要认真准备的申请材料。';

  return {
    difficulty: '相对友好',
    keywords: schoolKW,
    matchReason,
    majors,
    full: nameCN + '是你的稳妥选择。你的学术背景超过了该校录取中位数水平，录取把握很高。可以将其作为你申请清单中的"安全着陆点"。'
  };
}

/**
 * 根据学校生成推荐关键词
 */
function getSchoolKeywords(school) {
  const name = (school.nameCN || school.name || '');
  const type = school.type || '';
  const tier = school.tier || '';

  // Tier-based keywords
  if (tier === 'T0') return '顶尖名校,研究型,全球声誉';
  if (tier === 'T1') return '精英教育,小班教学,校友网络强';

  // Type-based keywords
  if (type.includes('公立')) return '公立强校,性价比高,专业齐全';
  if (type.includes('文理')) return '本科教育强,师生比高,博雅教育';

  // Name-based keywords
  if (name.includes('纽约') || name.includes('NYU') || name.includes('波士顿')) return '城市资源强,实习机会多,国际化';
  if (name.includes('加州') || name.includes('UCLA') || name.includes('Berkeley')) return '科技创新,阳光气候,产业聚集';
  if (name.includes('理工') || name.includes('Tech') || name.includes('CMU')) return '工程强校,就业率高,CS方向突出';
  if (name.includes('商') || name.includes('沃顿') || name.includes('Ross')) return '商科强势,校友资源,金融方向';
  if (name.includes('文理') || name.includes('Amherst') || name.includes('Wellesley')) return '文理精英,小班教学,研究机会';

  return '综合实力强,校园氛围好,学术资源丰富';
}

/**
 * 根据学校推断适合的专业方向
 */
function getSchoolMajors(school) {
  const name = (school.nameCN || school.name || '');
  const type = school.type || '';

  if (name.includes('理工') || name.includes('Tech') || name.includes('CMU') || name.includes('MIT')) return '适合计算机/工程/数学方向';
  if (name.includes('商') || name.includes('沃顿') || name.includes('Ross') || name.includes('Stern')) return '适合商科/金融/经济方向';
  if (type.includes('文理')) return '适合人文社科/自然科学基础学科方向';
  if (name.includes('医学') || name.includes('Johns Hopkins') || name.includes('公共卫生')) return '适合生物/医学/公共卫生方向';
  if (name.includes('艺术') || name.includes('设计') || name.includes('RISD')) return '适合艺术/设计/建筑方向';

  return '适合多学科方向，建议结合兴趣选择';
}

module.exports = { getRecommendations };
