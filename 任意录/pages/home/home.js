// pages/see/see.js
const AV = require('../../libs/av-weapp-min.js');
var util = require('../../utils/util.js'); 

Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    dateIf: false,
    text: '',
    time: '',
    Input: '',
    modalHidden: true,
    startTime:0,
    endTime:0
  },

  //日历时间显示按钮
  dateButton:function(){
    var time = util.formatTime(new Date());
    this.setData({
      date: time,
      dateIf: !this.data.dateIf
    })
  },

  //时间查询内容
  bindDateChange:function(e){
    console.log(e.detail.value);
    var that = this;
    var query = new AV.Query('DB');
    var date = new Date(e.detail.value + ' 00:00:00');
    var time1 = e.detail.value.substring(0, e.detail.value.length - 1);
    var time2 = e.detail.value.substring(e.detail.value.length - 1, e.detail.value.length);
    var time3 = parseInt(time2) + 1 + ' 00:00:00';
    var time = new Date(time1+time3);
    console.log(date,time);

    query.equalTo('user', AV.User.current().attributes.username);
    query.greaterThanOrEqualTo('createdAt',date);
    query.lessThanOrEqualTo('createdAt', time);
    query.descending('createdAt');
    query.find().then(function (results) {
      console.log(results);
      that.setData({
        text: results,
        dateIf: !that.data.dateIf
      })
    })
  },

  //查询显示按钮
  hideModalEvent: function(){
    this.setData({
      modalHidden: (this.data.modalHidden==true)?false:true
    })
  },

  //查询输入内容获取
  getInput: function(e){
    console.log(e.detail.value);
    this.setData({
      Input: e.detail.value
    })
  },

  //查询功能
  search: function (e) {
    console.log(e);
    var that = this;

    var query1 = new AV.Query('DB');
    query1.contains('title', that.data.Input);

    var query2 = new AV.Query('DB');
    query2.contains('content', that.data.Input);

    var query = AV.Query.or(query1, query2);
    if (e.currentTarget.dataset.index == null){
      query.exists('type');
    }else{
      var id = e.currentTarget.dataset.index;
      query.equalTo('type', id);
    }
    query.equalTo('user', AV.User.current().attributes.username);
    query.descending('createdAt');
    query.find().then(function (results) {
      console.log(results);
      that.setData({
        text: results
      });
    });
    that.hideModalEvent()
  },

  //按下时间获取
  bindTouchStart: function (e) {
    this.setData({
      startTime: e.timeStamp
      })
  },
  
  //松开时间获取
  bindTouchEnd: function (e) {
    this.setData({
      endTime: e.timeStamp
      })
  },

  //长按删除功能
  delet: function(e){
    wx.showModal({
      title: '提示',
      content: '是否删除该条信息',
      success: function (res) {
        if (res.confirm) {
          var id = e.currentTarget.dataset.index;
          var todo = AV.Object.createWithoutData('DB', id.objectId);
          todo.destroy().then(function (success) {
            // 删除成功
            wx.startPullDownRefresh();
            for(var i=0;i<id.imgId.length;i++){
              var file = AV.File.createWithoutData(id.imgId[i].objectId);
              file.destroy().then(function (success) {
                console.log('success');
              }, function (error) {
                console.log('de');
              });
            };
          }, function (error) {
            // 删除失败
          });
        }
      }
    })
  },

  //点击详情内容
  more:function(e){
    console.log(e)
    if (this.data.endTime - this.data.startTime < 250) {
      var id = JSON.stringify(e.currentTarget.dataset.index);
      wx.navigateTo({
        url: "../read/read?id=" + id + "&Or=n"
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var query = new AV.Query('DB');
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });

    query.equalTo('user', AV.User.current().attributes.username);
    query.exists('type');
    query.descending('createdAt');
    query.find().then(function (results) {
      console.log(results);
      that.setData({
        text: results
      });
      wx.hideToast();
      console.log(that.data.text[0].createdAt)
    }).catch(wx.showToast({
      title: '加载超时，请下拉刷新', 
      icon: 'none',
      duration: 2000
    }))
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
    var that = this;
    var query = new AV.Query('DB');

    query.equalTo('user', AV.User.current().attributes.username);
    query.exists('type');
    query.descending('createdAt');
    query.find().then(function (results) {
      console.log(results);
      that.setData({
        text: results
      });
      console.log(that.data.text[0].createdAt)
    })
  }
})