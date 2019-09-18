//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    text: []
  },

  //加载页面
  onLoad: function () {
    var data = wx.getStorageSync('pageData') || []
    console.log(data);
    this.setData({
      text: data
    })
    console.log(this.data.text)
  }
})
