const app = getApp();
const portrait = require('../../utils/portrait.js');

Page({
  data: {
    scores: { cognitive: 0, curiosity: 0, impact: 0, character: 0, totalScore: 0, level: 'C' },
    schools: { reach: [], match: [], safety: [] },
    portraitData: null,
    confidence: '',
    summary: { strengths: [], weaknesses: [] },
    suggestions: [],
    radarInterp: [],
    // 导航
    navActive: 'score',
    // 评分说明展开
    scoringExpanded: false,
    // 特殊背景选填
    showBgPicker: false,
    selectedBg: '',
    extraAdvantage: '',
    bgOptions: ['第一代大学生', '校友子女', '运动员招募', '特殊才能', '多元文化背景', '无']
  },

  onLoad() {
    const result = app.globalData.assessmentResult;
    if (!result) {
      wx.showToast({ title: '请先完成测评', icon: 'none' });
      setTimeout(() => wx.redirectTo({ url: '/pages/step1/step1' }), 1000);
      return;
    }

    const { scores, schools } = result;

    // 画像匹配
    const match = portrait.matchPortrait(scores);

    // 优劣势分析
    const summary = this.genSummary(scores);

    // 行动建议
    const suggestions = this.buildSuggestions(scores);

    // 雷达图解读
    const radarInterp = this.genRadarInterpretation(scores);

    this.setData({
      scores,
      schools,
      portraitData: match.portrait,
      confidence: match.confidence,
      summary,
      suggestions,
      radarInterp
    });

    // 延迟绘制雷达图
    setTimeout(() => this.drawRadar(scores), 500);
  },

  /* ==================== 优劣势分析 ==================== */
  genSummary(scores) {
    const dims = [
      { key: 'cognitive', name: '认知天花板', score: scores.cognitive, max: 40 },
      { key: 'curiosity', name: '专业好奇心', score: scores.curiosity, max: 30 },
      { key: 'impact', name: '社群贡献力', score: scores.impact, max: 25 },
      { key: 'character', name: '个人特质', score: scores.character, max: 15 }
    ];

    dims.sort((a, b) => (b.score / b.max) - (a.score / a.max));
    const strengths = dims.slice(0, 2).map(d => ({
      name: d.name,
      text: this.genStrengthText(d)
    }));
    const weaknesses = dims.slice(2).map(d => ({
      name: d.name,
      text: this.genWeaknessText(d)
    }));

    return { strengths, weaknesses };
  },

  genStrengthText(dim) {
    const map = {
      '认知天花板': '你的学术成绩和课程挑战度在申请池中具有明显竞争优势，这是你最大的底牌。',
      '专业好奇心': '你对专业领域的探索深度和广度远超同龄人，招生官会注意到你的学术热情。',
      '社群贡献力': '你在社群中展现的领导力和实际影响力令人印象深刻，这会让你的申请更有厚度。',
      '个人特质': '你的内省深度、同理心和面对逆境的韧性，会在文书和面试中自然流露。'
    };
    return map[dim.name] || '该维度表现突出，是申请中的加分项。';
  },

  genWeaknessText(dim) {
    const map = {
      '认知天花板': '学术成绩或课程挑战度还有提升空间，可以通过标化考试或高阶课程进一步证明你的学术潜力。',
      '专业好奇心': '专业方向的探索深度可以进一步加强，建议锁定1-2个兴趣方向做深度挖掘。',
      '社群贡献力': '社群影响力是可提升的维度，持续参与并争取领导角色会让你的课外活动更有分量。',
      '个人特质': '个人特质这块可以通过深度反思和文书打磨来展现——每个人都有独特的故事，关键是如何讲述。'
    };
    return map[dim.name] || '这部分有提升空间，可以通过后续努力加强。';
  },

  /* ==================== 行动建议 ==================== */
  buildSuggestions(scores) {
    const list = [];
    const ratios = {
      cognitive: scores.cognitive / 40,
      curiosity: scores.curiosity / 30,
      impact: scores.impact / 25,
      character: scores.character / 15
    };

    if (ratios.cognitive < 0.5) list.push({
      text: '学术是申请基石：考虑选修1-2门AP/IB高阶课程，或通过SAT/ACT高分来补充学术竞争力。'
    });
    if (ratios.curiosity < 0.5) list.push({
      text: '深度探索专业方向：建议参加1次线上科研或暑期项目，产出至少一个小作品（论文/项目/博客）。'
    });
    if (ratios.impact < 0.5) list.push({
      text: '打造社群影响力：锁定1个你最关心的社会议题，持续投入18个月以上，争取从参与者变成组织者。'
    });
    if (ratios.character < 0.5) list.push({
      text: '打磨个人故事：现在就开始写"人生故事清单"，梳理10个对你影响最大的经历。'
    });
    if (scores.totalScore >= 75) {
      list.push({ text: '冲刺Top 30需要"独特性"：在文书中展现一个只有你能讲的故事，而不是"我很努力"的通用叙事。' });
      list.push({ text: '提前联系目标学校的招生官或校友面试，展现你的真诚兴趣和主动精神。' });
    }
    if (scores.totalScore >= 50 && scores.totalScore < 75) {
      list.push({ text: '合理安排申请梯度：2-3所冲刺 + 4-5所匹配 + 2-3所保底，确保有安全着陆点。' });
      list.push({ text: '重点关注学校的"Why School"文书，展现你对该校的深度了解而非泛泛的"你很好"。' });
    }
    if (scores.totalScore < 50) {
      list.push({ text: '考虑Test-Optional院校和社区大学2+2转学路径，这两条路线的Top 50成功率不低。' });
      list.push({ text: '聚焦1-2个亮点深度打造，让招生官看到一个"有故事"的你，而非全面但平庸的申请者。' });
    }
    list.push({ text: '定期复盘申请进度，每完成一轮文书修改，请至少两位不同背景的人提供反馈。' });

    return list;
  },

  /* ==================== 雷达图解读 ==================== */
  genRadarInterpretation(scores) {
    const dims = [
      { key: 'cognitive', name: '认知天花板', score: scores.cognitive, max: 40, color: '#1B2A4A' },
      { key: 'curiosity', name: '专业好奇心', score: scores.curiosity, max: 30, color: '#3A5078' },
      { key: 'impact', name: '社群贡献力', score: scores.impact, max: 25, color: '#C9A96E' },
      { key: 'character', name: '个人特质', score: scores.character, max: 15, color: '#3A7D5A' }
    ];

    return dims.map(d => {
      const ratio = d.score / d.max;
      let level, levelClass, desc;
      if (ratio >= 0.75) { level = '突出'; levelClass = 'high'; desc = '该维度处于竞争池前25%，是你的核心竞争优势。'; }
      else if (ratio >= 0.5) { level = '中等'; levelClass = 'mid'; desc = '该维度处于中上水平，有基础的竞争力，进一步提升可转化为优势。'; }
      else if (ratio >= 0.3) { level = '偏低'; levelClass = 'low'; desc = '该维度还有提升空间，建议作为后续发力的重点方向之一。'; }
      else { level = '薄弱'; levelClass = 'weak'; desc = '该维度目前是你的短板，需要重点关注和投入。'; }
      return { ...d, ratio, level, levelClass, desc };
    });
  },

  /* ==================== 四维菱形雷达图 ==================== */
  drawRadar(scores) {
    const query = wx.createSelectorQuery();
    query.select('#radarCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getWindowInfo().pixelRatio;
      const width = res[0].width;
      const height = res[0].height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      const cx = width / 2;
      const cy = height / 2 - 20;
      const r = Math.min(width, height) * 0.32;
      const dims = ['cognitive', 'curiosity', 'impact', 'character'];
      const maxes = { cognitive: 40, curiosity: 30, impact: 25, character: 15 };
      const labels = ['认知天花板', '专业好奇心', '社群贡献力', '个人特质'];
      const colors = ['#1B2A4A', '#3A5078', '#C9A96E', '#3A7D5A'];
      const n = 4;
      const angleStep = (2 * Math.PI) / n;
      const startAngle = -Math.PI / 2; // 第一个维度在顶部

      // 背景网格 + 刻度标签
      for (let level = 1; level <= 5; level++) {
        const proportion = level / 5;
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const ang = startAngle + i * angleStep;
          const x = cx + r * proportion * Math.cos(ang);
          const y = cy + r * proportion * Math.sin(ang);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = '#E8E5DF';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 刻度标签（只在第一条线上标注）
        if (level === 1 || level === 5 || level === 3) {
          const labelX = cx + r * proportion;
          const labelY = cy + 4;
          ctx.fillStyle = '#C0C4CC';
          ctx.font = '18rpx sans-serif';
          ctx.textAlign = 'center';
          if (level === 5) ctx.fillText('5', labelX, labelY);
          else if (level === 3) ctx.fillText('3', labelX, labelY);
          else ctx.fillText('1', labelX, labelY);
        }
      }

      // 轴线
      for (let i = 0; i < n; i++) {
        const ang = startAngle + i * angleStep;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + r * Math.cos(ang), cy + r * Math.sin(ang));
        ctx.strokeStyle = '#E8E5DF';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // 数据区域
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const key = dims[i];
        const proportion = scores[key] / maxes[key];
        const ang = startAngle + i * angleStep;
        const x = cx + r * proportion * Math.cos(ang);
        const y = cy + r * proportion * Math.sin(ang);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(27, 42, 74, 0.12)';
      ctx.fill();
      ctx.strokeStyle = '#1B2A4A';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 数据点 + 分数
      for (let i = 0; i < n; i++) {
        const key = dims[i];
        const proportion = scores[key] / maxes[key];
        const ang = startAngle + i * angleStep;
        const x = cx + r * proportion * Math.cos(ang);
        const y = cy + r * proportion * Math.sin(ang);

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = colors[i];
        ctx.fill();

        // 分数标签
        const labelOffset = 16;
        const lx = x + labelOffset * Math.cos(ang);
        const ly = y + labelOffset * Math.sin(ang) + 5;
        ctx.fillStyle = colors[i];
        ctx.font = 'bold 22rpx sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(scores[key] + '/' + maxes[key], lx, ly);
      }

      // 维度名称（在轴端点外）
      for (let i = 0; i < n; i++) {
        const ang = startAngle + i * angleStep;
        const lx = cx + (r + 36) * Math.cos(ang);
        const ly = cy + (r + 36) * Math.sin(ang) + 6;
        ctx.fillStyle = '#1B2A4A';
        ctx.font = '24rpx sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], lx, ly);
      }
    });
  },

  /* ==================== 导航 ==================== */
  scrollToSection(e) {
    const { section } = e.currentTarget.dataset;
    this.setData({ navActive: section });
    const selector = '#section-' + section;
    wx.pageScrollTo({ selector, duration: 300 });
  },

  /* ==================== 评分说明 ==================== */
  toggleScoring() {
    this.setData({ scoringExpanded: !this.data.scoringExpanded });
  },

  /* ==================== 特殊背景 ==================== */
  openBgPicker() {
    this.setData({ showBgPicker: true });
  },
  closeBgPicker() {
    this.setData({ showBgPicker: false });
  },
  onBgChange(e) {
    const idx = e.detail.value;
    this.setData({ selectedBg: this.data.bgOptions[idx] });
  },
  saveBgLabel() {
    const bg = this.data.selectedBg;
    if (bg && bg !== '无') {
      this.setData({ extraAdvantage: bg, showBgPicker: false });
    } else {
      this.setData({ extraAdvantage: '', showBgPicker: false });
    }
  },

  /* ==================== 分享 ==================== */
  shareReport() {
    wx.showToast({ title: '长按截图保存报告', icon: 'none' });
  },

  /* ==================== 预约人工复核 ==================== */
  contactAdvisor() {
    wx.showModal({
      title: '预约人工复核',
      content: '选校还需要结合专业方向、预算、课程体系和申请时间线进一步判断。让顾问帮你做一次免费人工复核，确保选校策略准确。',
      confirmText: '联系顾问',
      cancelText: '稍后再说',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '顾问将尽快联系你', icon: 'none' });
        }
      }
    });
  }
});
