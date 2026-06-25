const scoring = require('../../utils/scoring.js');
const recommend = require('../../utils/recommend.js');
const app = getApp();

Page({
  data: {
    step: 5, totalSteps: 5,
    regions: [
      { name: '东北部', checked: false },
      { name: '西部/加州', checked: false },
      { name: '南部', checked: false },
      { name: '中西部', checked: false },
      { name: '不限', checked: true }
    ],
    sizeIndex: 0,
    sizes: ['不限', '< 5000人(小型)', '5000-15000人(中型)', '> 15000人(大型)'],
    typeIndex: 0,
    schoolTypes: ['不限', '综合性大学', '文理学院'],
    tuitionIndex: 0,
    tuitions: ['不限', '< 3万美元/年', '3-5万美元/年', '5-7万美元/年']
  },
  toggleRegion(e) {
    const idx = e.currentTarget.dataset.index;
    const key = `regions[${idx}].checked`;
    this.setData({ [key]: !this.data.regions[idx].checked });
  },
  onSizeChange(e) { this.setData({ sizeIndex: parseInt(e.detail.value) }); },
  onTypeChange(e) { this.setData({ typeIndex: parseInt(e.detail.value) }); },
  onTuitionChange(e) { this.setData({ tuitionIndex: parseInt(e.detail.value) }); },

  submitAll() {
    const p = app.globalData.userProfile;
    p.regions = this.data.regions.filter(r => r.checked).map(r => r.name);
    p.size = this.data.sizes[this.data.sizeIndex];
    p.schoolType = this.data.schoolTypes[this.data.typeIndex];
    p.tuition = this.data.tuitions[this.data.tuitionIndex];

    // Calculate score
    const result = scoring.calculateScore(p);

    // Build preferences
    const prefs = {
      regions: p.regions,
      size: p.size,
      schoolType: p.schoolType,
      tuition: p.tuition
    };

    // Get recommendations
    const recs = recommend.getRecommendations(result.totalScore, prefs);

    // Store result
    app.globalData.assessmentResult = {
      score: result,
      recommendations: recs,
      userProfile: p,
      timestamp: Date.now()
    };

    wx.navigateTo({ url: '/pages/report/report' });
  }
});
