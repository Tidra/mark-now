//index.js
//获取应用实例
const AV = require('../../libs/av-weapp-min.js');

Page({
  data: {
    text: '',
    user: '',
    themeData:[
      { title: '全部', id: 'all', url:'../../img/all.png'},
      { title: '日记', id: 'diary', url: '../../img/diary.png'},
      { title: '失物招领', id: 'find', url: '../../img/find.png'},
      { title: '随记', id: 'group', url: '../../img/group.png'},
      { title: '其他', id: 'other', url: '../../img/other.png'}
      ],
    type: 'all',
    screenHeight: 0,
    screenWidth: 0,
    slideHeight: 0,
    slideRight: 0,
    slideWidth: 0,
    maskDisplay: 'none',
    slideAnimation: 0,
  },

  //加载页面
  onLoad: function () {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })

    var query1 = new AV.Query('DB');
    query1.equalTo('isOpen', true);

    var query2 = new AV.Query('DB');
    query2.equalTo('type', 'find');

    var query = AV.Query.or(query1, query2);
    query.descending('createdAt');
    query.find().then(function (results) {
      console.log(results);
      wx.hideToast();
      that.setData({
        user: AV.User.current().attributes,
        text: results
      }).catch(wx.showToast({
        title: '加载超时，请下拉刷新',
        icon: 'none',
        duration: 2000
      }));
    })

    //获取屏幕长宽
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          screenHeight: res.screenHeight,
          screenWidth: res.windowWidth,
          slideHeight: res.windowHeight,
          slideRight: res.windowWidth,
          slideWidth: res.windowWidth * 0.7
        });
      }
    });
  },

  //点击更多内容功能
  more: function (e) {
    console.log(e)
    var id = JSON.stringify(e.currentTarget.dataset.index);
    wx.navigateTo({
      url: "../read/read?id=" + id + "&Or=y"
    });
  },

  //查询功能
  search: function(e){
    console.log(e.detail.value);
    var that = this;

    var query1 = new AV.Query('DB');
    query1.contains('title', e.detail.value);

    var query2 = new AV.Query('DB');
    query2.contains('content', e.detail.value);

    var query = AV.Query.or(query1, query2); 
    query.descending('createdAt');
    if (that.data.type == 'all') { query.exists('type'); }
    else { query.equalTo('type', that.data.type); }
    query.find().then(function (results) {
      console.log(results);
      that.setData({
        text: results
      });
    })
  },

  //下拉刷新
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
    var that = this;
    var query1 = new AV.Query('DB');
    query1.equalTo('isOpen', true);

    var query2 = new AV.Query('DB');
    query2.equalTo('type', 'find');

    var query = AV.Query.or(query1, query2);
    query.descending('createdAt');
    query.find().then(function (results) {
      console.log(results);
      that.setData({
        text: results,
        type: 'all'
      });
    })
  },

  //点击图片查看大图
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

  //前往收藏页
  toCollectPage: function(){
    wx.navigateTo({
      url: '../like/like'
    })
  },

  //前往设置页
  toSettingPage: function(){
    wx.navigateTo({
      url: '../setting/setting'
    })
  },

  //点击侧栏展开
  ballClickEvent: function () {
    slideUp.call(this);
  },

  //遮罩点击  侧栏关闭
  slideCloseEvent: function () {
    slideDown.call(this);
  },

  //显示各主题内容
  toThemePage: function(e){
    console.log(e);
    var that = this;
    var query = new AV.Query('DB');

    if (e.currentTarget.dataset.id == 'all') { query.exists('type');}
    else { query.equalTo('type', e.currentTarget.dataset.id);}
    if (e.currentTarget.dataset.id != 'find') {
      query.equalTo('isOpen', true);
    }
    query.descending('createdAt');
    query.find().then(function (results) {
      console.log(results);
      that.setData({
        text: results,
        type: e.currentTarget.dataset.id
      });
    })

    slideDown.call(this);
  }
})

//侧栏展开
function slideUp() {
  var animation = wx.createAnimation({
    duration: 400
  });
  this.setData({ maskDisplay: 'block' });
  animation.translateX('100%').step();
  this.setData({
    slideAnimation: animation.export()
  });
}

//侧栏关闭
function slideDown() {
  var animation = wx.createAnimation({
    duration: 300
  });
  animation.translateX('-100%').step();
  this.setData({
    slideAnimation: animation.export()
  });
  this.setData({ maskDisplay: 'none' });
}