// pages/setting/setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [
      { name: '#FFFFFF', value: '白色'},
      { name: '#000000', value: '黑色'},
      { name: '#1E90FF', value: '蓝色', checked: 'true' },
      { name: '#FF0000', value: '红色' },
      { name: '#FFB6C1', value: '粉红' }
    ]
  },

  clearData: function () {
    wx.showModal({
      title: '提示',
      content: '确认清除缓存',
      success: function (res) {
        if (res.confirm) {
          wx.clearStorage(); //清除应用数据
          wx.showToast({
            title: '清除成功',
            icon: 'success',
            duration: 3000
          });
        }
      }
    })
  },

  radioChange: function (e) {
    console.log(e.detail.value);
    var frontColor = '#ffffff';
    if (e.detail.value == '#FFFFFF')
      frontColor = '#000000';
    wx.setNavigationBarColor({
      frontColor: frontColor,
      backgroundColor: e.detail.value,
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })
  }
})