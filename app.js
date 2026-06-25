App({
  onLaunch() {
    console.log('留学罗盘 - 本科选校测评 启动');
  },
  globalData: {
    userProfile: {
      gpa: '', curriculum: '', apCount: '', ibScore: '',
      sat: '', act: '', toefl: '', ielts: '',
      activityTypes: [], awardLevel: '', activityDuration: '', activityCount: '',
      hasUniqueStory: '', hasStrongRec: '',
      backgrounds: [],
      regions: [], size: '', schoolType: '', tuition: ''
    },
    assessmentResult: null,
    userInfo: null
  }
});
