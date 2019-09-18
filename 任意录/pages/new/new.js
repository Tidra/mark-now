// pages/new/new.js
Page({
  //取消回到首页
  hideModalEvent: function () {
    wx.switchTab({
      url: '../home/home'
    })
  },

  //添加页
  add: function (e) {
    var id = e.currentTarget.dataset.index
    console.log(id);
    this.hideModalEvent();
    wx.navigateTo({
      url: "../edit/edit?id=" + id + "&yn=n"
    })
  }
})