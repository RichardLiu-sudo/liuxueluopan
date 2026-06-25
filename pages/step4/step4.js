const app = getApp();

Page({
  data: {
    step: 4,
    totalSteps: 5,
    growthEvent: '',
    selfTags: [],
    tagOptions: [
      { label: '好奇心强', value: 'curious', checked: false },
      { label: '坚韧', value: 'resilient', checked: false },
      { label: '有同理心', value: 'empathetic', checked: false },
      { label: '幽默', value: 'humorous', checked: false },
      { label: '内省', value: 'introspective', checked: false },
      { label: '创造力', value: 'creative', checked: false },
      { label: '领导力', value: 'leadership', checked: false },
      { label: '追求完美', value: 'perfectionist', checked: false },
      { label: '善于协作', value: 'collaborative', checked: false },
      { label: '独立思考', value: 'independent', checked: false }
    ],
    familyContext: '',
    familyIndex: -1,
    contextOptions: ['第一代大学生', '父母一方上过大学', '父母均有高等教育', '其他特殊家庭背景', '不涉及'],
    language: '',
    languageIndex: -1,
    languageOptions: ['托福110+/雅思8.0+', '托福100-109/雅思7.0-7.5', '托福90-99/雅思6.5', '托福80-89/雅思6.0', '暂未参加'],
    interviewConfidence: '',
    interviewIndex: -1,
    interviewOptions: ['非常自信', '比较从容', '有点紧张', '还没准备好']
  },

  onTagToggle(e) {
    const { index } = e.currentTarget.dataset;
    const key = 'tagOptions[' + index + '].checked';
    this.setData({ [key]: !this.data.tagOptions[index].checked });
  },

  onFamilyChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ familyIndex: idx, familyContext: this.data.contextOptions[idx] });
  },

  onLanguageChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ languageIndex: idx, language: this.data.languageOptions[idx] });
  },

  onInterviewChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ interviewIndex: idx, interviewConfidence: this.data.interviewOptions[idx] });
  },

  onEventInput(e) {
    this.setData({ growthEvent: e.detail.value });
  },

  submitStep() {
    const selectedTags = this.data.tagOptions.filter(o => o.checked).map(o => o.value);

    if (!this.data.familyContext) {
      wx.showToast({ title: '提示：请选择家庭背景', icon: 'none' });
      return;
    }
    if (!this.data.language) {
      wx.showToast({ title: '提示：请选择语言能力', icon: 'none' });
      return;
    }
    if (!this.data.interviewConfidence) {
      wx.showToast({ title: '提示：请选择面试信心', icon: 'none' });
      return;
    }

    const data = {
      growthEvent: this.data.growthEvent,
      selfTags: selectedTags,
      familyContext: this.data.familyContext,
      language: this.data.language,
      interviewConfidence: this.data.interviewConfidence
    };
    app.globalData.step4Data = data;
    wx.navigateTo({ url: '/pages/step5/step5' });
  }
});
