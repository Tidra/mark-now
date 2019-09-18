// pages/read/read.js
const AV = require('../../libs/av-weapp-min.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    Or: 'n',
    com: '',
    like: -1,
    cid: '',
    username: '',
    hidden: false,
    show:false
  },

  //查看大图
  previewImg: function (e) {
    console.log(e.currentTarget.dataset);
    var imgArr = e.currentTarget.dataset.index;
    wx.previewImage({
      current: e.currentTarget.dataset.id,     //当前图片地址
      urls: imgArr,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  //选项按钮
  choose:function(){
    var that = this;
    that.setData({
      hidden: !that.data.hidden
    })
  },

  //编辑按钮
  edit: function () {
    var id = JSON.stringify(this.data.id);
    wx.navigateTo({
      url: "../edit/edit?id=" + id + "&yn=y"
    });
  },

  //删除按钮
  delet: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否删除该条信息',
      success: function (res) {
        if (res.confirm) {
          var id = that.data.id;
          var todo = AV.Object.createWithoutData('DB', id.objectId);
          todo.destroy().then(function (success) {
            // 删除成功
            for (var i = 0; i < id.imgId.length; i++) {
              var file = AV.File.createWithoutData(id.imgId[i].objectId);
              file.destroy().then(function (success) {
                console.log('success');
              }, function (error) {
              });
            }
            wx.reLaunch({
              url: '../home/home'
            })
          }, function (error) {
            // 删除失败
          });
        }
      }
    })
  },

  //回复框显示
  callBack: function(){
    this.setData({
      show: !this.data.show
    })
  },

  //回复内容同步
  saveCall:function(e){
    var that = this;
    var comment = new AV.Object('Comment');
    comment.set('likes', that.data.like);
    comment.set('content', e.detail.value.input);
    comment.set('avatarUrl', AV.User.current().attributes.avatarUrl);
    comment.set('user', AV.User.current().attributes.username);
    var targetTodoFolder = AV.Object.createWithoutData('DB', this.data.id.objectId);
    comment.set('toDB', targetTodoFolder);
    comment.save().then(function (todo) {
      var com = that.data.com;
      var cid = todo.id
      com.unshift(todo);
      console.log(com);
      that.setData({
        com: com,
        cid: cid,
        show: !that.data.show
      })
    });
  },

  //获取回复内容
  readCall: function(e){
    var that = this;
    var db = AV.Object.createWithoutData('DB', e);
    var query = new AV.Query('Comment');
    query.equalTo('toDB', db); 
    query.descending('createdAt');
    query.find().then(function (comment) {
      console.log(comment);
      that.setData({
        com: comment
      })
    });
  },

  //收藏功能
  toCollect: function (e) {
    var that = this;
    console.log(e.currentTarget.dataset.index);
    var pageData = wx.getStorageSync('pageData') || []
    console.log(pageData);
    if (that.data.like == 1) {
      for (var i = 0; i < pageData.length; i++) {
        if (pageData[i].objectId == e.currentTarget.dataset.index.objectId) {
          pageData.splice(i, 1);
          that.setData({
            like: -1
          })
          break;
        }
      }
    }
    else {
      pageData.unshift(e.currentTarget.dataset.index);
      that.setData({
        like: 1
      })
    }
    try {
      wx.setStorageSync('pageData', pageData);
    } catch (e) {
    };
    
    console.log(pageData);
  },

  //删除本人回复
  deleUser: function(e){
    console.log(e)
    var that =this;
    var todo = AV.Object.createWithoutData('Comment', e.currentTarget.dataset.index.objectId);
    todo.destroy().then(function (success) {
      var comment = that.data.com
      for (var i = 0; i < comment.length; i++) {
        if (comment[i].id == e.currentTarget.dataset.index.objectId) {
          comment.splice(i, 1);
          that.setData({
            com: comment
          })
          break;
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = JSON.parse(options.id);
    console.log(id);

    var pageData = wx.getStorageSync('pageData') || []
    var like = -1;
    for (var i = 0; i < pageData.length; i++) {
      if (pageData[i].objectId == id.objectId) {
        like = 1;
        break;
      }
    };

    this.readCall(id.objectId);
    this.setData({
      id: id,
      like: like,
      Or: options.Or,
      username: AV.User.current().attributes.username
    })
  }
})