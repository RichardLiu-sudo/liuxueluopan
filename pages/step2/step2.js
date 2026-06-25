const app = getApp();

Page({
  data: {
    step: 2,
    totalSteps: 5,
    majors: [],
    majorOptions: [
      { label: '计算机/人工智能', value: 'cs_ai', checked: false },
      { label: '工程', value: 'engineering', checked: false },
      { label: '数学/统计', value: 'math_stat', checked: false },
      { label: '物理/化学', value: 'physics_chem', checked: false },
      { label: '生物/医学', value: 'bio_med', checked: false },
      { label: '经济/商科', value: 'econ_biz', checked: false },
      { label: '人文社科', value: 'humanities', checked: false },
      { label: '艺术/设计', value: 'art_design', checked: false },
      { label: '未确定', value: 'undecided', checked: false }
    ],
    research: '',
    researchIndex: -1,
    researchOptions: ['有高质量科研经历', '参加过知名夏校', '校内科研项目', '线上课程/小项目', '暂无'],
    exploration: [],
    exploreOptions: [
      { label: '做过独立项目/APP', value: 'independent_project', checked: false },
      { label: '读过专业领域书籍', value: 'reading', checked: false },
      { label: '写过相关论文/博客', value: 'paper', checked: false },
      { label: '参加过学术社团', value: 'club', checked: false },
      { label: '参与过学术竞赛', value: 'contest', checked: false },
      { label: '以上都没有', value: 'none', checked: false }
    ],
    profRec: '',
    profRecIndex: -1,
    recOptions: ['有强力专业推荐信', '有普通推荐信', '不确定推荐信质量', '暂无'],
    deepNarrative: ''
  },

  onMajorToggle(e) {
    const { index } = e.currentTarget.dataset;
    const key = 'majorOptions[' + index + '].checked';
    this.setData({ [key]: !this.data.majorOptions[index].checked });
  },

  onExploreToggle(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.exploreOptions[index];
    if (item.value === 'none') {
      // 选"以上都没有"时清除其他
      const newOptions = this.data.exploreOptions.map((o, i) => ({
        ...o, checked: i === index ? !o.checked : false
      }));
      this.setData({ exploreOptions: newOptions });
    } else {
      const key = 'exploreOptions[' + index + '].checked';
      // 取消"以上都没有"
      const noneIdx = this.data.exploreOptions.findIndex(o => o.value === 'none');
      this.setData({
        [key]: !this.data.exploreOptions[index].checked,
        ['exploreOptions[' + noneIdx + '].checked']: false
      });
    }
  },

  onResearchChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ researchIndex: idx, research: this.data.researchOptions[idx] });
  },

  onProfRecChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ profRecIndex: idx, profRec: this.data.recOptions[idx] });
  },

  onNarrativeInput(e) {
    this.setData({ deepNarrative: e.detail.value });
  },

  submitStep() {
    const selectedMajors = this.data.majorOptions.filter(o => o.checked).map(o => o.value);
    const selectedExplore = this.data.exploreOptions.filter(o => o.checked).map(o => o.value);

    if (selectedMajors.length === 0) {
      wx.showToast({ title: '提示：请选择意向专业方向', icon: 'none' });
      return;
    }
    if (!this.data.research) {
      wx.showToast({ title: '提示：请选择科研/夏校经历', icon: 'none' });
      return;
    }
    if (selectedExplore.length === 0) {
      wx.showToast({ title: '提示：请选择自主探索证明', icon: 'none' });
      return;
    }
    if (!this.data.profRec) {
      wx.showToast({ title: '提示：请选择推荐信情况', icon: 'none' });
      return;
    }

    const data = {
      majors: selectedMajors,
      research: this.data.research,
      exploration: selectedExplore,
      profRec: this.data.profRec,
      deepNarrative: this.data.deepNarrative
    };
    app.globalData.step2Data = data;
    wx.navigateTo({ url: '/pages/step3/step3' });
  }
});
