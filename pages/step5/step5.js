const app = getApp();
const scoring = require('../../utils/scoring.js');
const recommend = require('../../utils/recommend.js');

Page({
  data: {
    step: 5, totalSteps: 5,
    regions: [],
    regionOptions: ['美国东北部', '美国西部', '美国南部', '美国中西部', '加拿大', '英国', '其他'],
    size: '',
    sizeIndex: -1,
    sizeOptions: ['小型（<5000人）', '中型（5000-20000人）', '大型（>20000人）', '无偏好'],
    schoolType: '',
    typeIndex: -1,
    typeOptions: ['公立大学', '私立大学', '文理学院', '无偏好'],
    tuition: '',
    tuitionIndex: -1,
    tuitionOptions: ['低成本（<$35000）', '中等（$35000-$55000）', '高成本（>$55000）', '无偏好']
  },

  onRegionToggle(e) {
    const { item } = e.currentTarget.dataset;
    let regions = [...this.data.regions];
    const idx = regions.indexOf(item);
    if (idx > -1) regions.splice(idx, 1);
    else regions.push(item);
    this.setData({ regions });
  },

  onSizeChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ sizeIndex: idx, size: this.data.sizeOptions[idx] });
  },

  onTypeChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ typeIndex: idx, schoolType: this.data.typeOptions[idx] });
  },

  onTuitionChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ tuitionIndex: idx, tuition: this.data.tuitionOptions[idx] });
  },

  submitAll() {
    const step1Data = app.globalData.step1Data || {};
    const step2Data = app.globalData.step2Data || {};
    const step3Data = app.globalData.step3Data || {};
    const step4Data = app.globalData.step4Data || {};

    const scores = scoring.calcTotalScore({
      step1: step1Data,
      step2: step2Data,
      step3: step3Data,
      step4: step4Data
    });

    const prefs = {
      regions: this.data.regions,
      size: this.data.size,
      schoolType: this.data.schoolType,
      tuition: this.data.tuition
    };

    const schoolResult = recommend.getRecommendations(scores, prefs);

    app.globalData.assessmentResult = {
      scores,
      schools: schoolResult,
      preferences: prefs,
      step1Data,
      step2Data,
      step3Data,
      step4Data
    };

    wx.navigateTo({ url: '/pages/report/report' });
  }
});
