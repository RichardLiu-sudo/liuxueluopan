const app = getApp();

Page({
  data: {
    step: 1,
    totalSteps: 5,
    gpaRange: '',
    gpaIndex: -1,
    curriculum: '',
    curriculumIndex: -1,
    satActRange: '',
    satActIndex: -1,
    competition: '',
    competitionIndex: -1,
    courseRigor: '',
    courseRigorIndex: -1,
    gpaOptions: ['4.0', '3.8-4.0', '3.5-3.8', '3.0-3.5', '2.5-3.0', '低于2.5', '不确定'],
    curriculumOptions: ['AP体系', 'IB体系', 'A-Level', '高考/普高', '其他国际课程', '不确定'],
    satActOptions: ['1550+/35+', '1450-1540/32-34', '1350-1440/28-31', '1250-1340/23-27', '低于1250', '未参加'],
    competitionOptions: ['国际级奖项', '国家级奖项', '省级/地区级', '校内奖项', '无竞赛经历'],
    rigorOptions: ['选了学校最难的课', '中等偏上难度', '按部就班', '偏简单']
  },

  onGpaChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ gpaIndex: idx, gpaRange: this.data.gpaOptions[idx] });
  },
  onCurriculumChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ curriculumIndex: idx, curriculum: this.data.curriculumOptions[idx] });
  },
  onSatActChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ satActIndex: idx, satActRange: this.data.satActOptions[idx] });
  },
  onCompetitionChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ competitionIndex: idx, competition: this.data.competitionOptions[idx] });
  },
  onRigorChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ courseRigorIndex: idx, courseRigor: this.data.rigorOptions[idx] });
  },

  submitStep() {
    if (!this.data.gpaRange) { wx.showToast({ title: '提示：请选择 GPA 区间', icon: 'none' }); return; }
    if (!this.data.curriculum) { wx.showToast({ title: '提示：请选择课程体系', icon: 'none' }); return; }
    if (!this.data.satActRange) { wx.showToast({ title: '提示：请选择 SAT/ACT 区间', icon: 'none' }); return; }
    if (!this.data.competition) { wx.showToast({ title: '提示：请选择学术竞赛', icon: 'none' }); return; }
    if (!this.data.courseRigor) { wx.showToast({ title: '提示：请选择课程难度', icon: 'none' }); return; }
    const data = {
      gpaRange: this.data.gpaRange,
      curriculum: this.data.curriculum,
      satActRange: this.data.satActRange,
      competition: this.data.competition,
      courseRigor: this.data.courseRigor
    };
    app.globalData.step1Data = data;
    wx.navigateTo({ url: '/pages/step2/step2' });
  }
});
