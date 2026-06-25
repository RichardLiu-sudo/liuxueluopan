const app = getApp();

Page({
  data: {
    step: 3,
    totalSteps: 5,
    activityTypes: [],
    activityOptions: [
      { label: '公益/志愿者', value: 'volunteer', checked: false },
      { label: '学生会/社团领导', value: 'student_gov', checked: false },
      { label: '体育/校队', value: 'sports', checked: false },
      { label: '艺术/表演', value: 'arts', checked: false },
      { label: '辩论/模联', value: 'debate_mun', checked: false },
      { label: '社区服务', value: 'community', checked: false },
      { label: '兼职/创业', value: 'work', checked: false },
      { label: '其他', value: 'other', checked: false }
    ],
    duration: '',
    durationIndex: -1,
    durationOptions: ['3年以上', '2-3年', '1-2年', '不到1年', '暂无'],
    influenceDesc: '',
    leaderRole: '',
    leaderIndex: -1,
    leaderOptions: ['是核心领导者', '是团队骨干', '普通成员', '未担任领导角色'],
    counselorRec: '',
    counselorIndex: -1,
    counselorOptions: ['会有强力推荐', '普通推荐', '不确定', '没有']
  },

  onActivityToggle(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.activityOptions[index];
    const checked = this.data.activityOptions.filter(o => o.checked);
    if (!item.checked && checked.length >= 3) {
      wx.showToast({ title: '提示：最多选择3项', icon: 'none' });
      return;
    }
    const key = 'activityOptions[' + index + '].checked';
    this.setData({ [key]: !item.checked });
  },

  onDurationChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ durationIndex: idx, duration: this.data.durationOptions[idx] });
  },

  onLeaderChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ leaderIndex: idx, leaderRole: this.data.leaderOptions[idx] });
  },

  onCounselorChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ counselorIndex: idx, counselorRec: this.data.counselorOptions[idx] });
  },

  onInfluenceInput(e) {
    this.setData({ influenceDesc: e.detail.value });
  },

  submitStep() {
    const selectedActivities = this.data.activityOptions.filter(o => o.checked).map(o => o.value);

    if (selectedActivities.length === 0) {
      wx.showToast({ title: '提示：请选择活动类型', icon: 'none' });
      return;
    }
    if (!this.data.duration) {
      wx.showToast({ title: '提示：请选择持续年限', icon: 'none' });
      return;
    }
    if (!this.data.leaderRole) {
      wx.showToast({ title: '提示：请选择领导角色', icon: 'none' });
      return;
    }
    if (!this.data.counselorRec) {
      wx.showToast({ title: '提示：请选择推荐信情况', icon: 'none' });
      return;
    }

    const data = {
      activityTypes: selectedActivities,
      duration: this.data.duration,
      influenceDesc: this.data.influenceDesc,
      leaderRole: this.data.leaderRole,
      counselorRec: this.data.counselorRec
    };
    app.globalData.step3Data = data;
    wx.navigateTo({ url: '/pages/step4/step4' });
  }
});
