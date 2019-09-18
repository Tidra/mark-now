// pages/home/home.js
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
const util = require('../../utils/util.js');
const AV = require('../../libs/av-weapp-min.js');
var array = [];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    placeholder: '',
    src: [],
    user: '',
    pnum: 9,
    avatarUrl: '',
    id: 'diary',
    payList: [],
    title: '',
    content: '',
    pay: 0,
    Num: 0,
    InOut: 0,
    location: '',
    isOpen: false,
    objectId: ''
  },

  //存储编辑信息
  forSave: function () {
    var that = this;
    if (this.data.pay != 0) {
      that.addPay();
    }
    var eve = {
      user: that.data.user,
      avatarUrl: that.data.avatarUrl,
      id: that.data.id,
      title: that.data.title,
      content: that.data.content,
      location: that.data.location,
      pay:{
        payList: that.data.payList,
        inOut: that.data.InOut
      },
      isOpen: that.data.isOpen,
      objectId: that.data.objectId
    }
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })

    util.Save(eve, that.data.src)
  },

  //调研小程序api选择照片
  gotoShow: function () {
    var _this = this;
    wx.chooseImage({
      count: _this.data.pnum, //选择的图片张数
      sizeType: ['compressed'], //original原图，compressed压缩图
      sourceType: ['album', 'camera'], //album从相册选图，camera使用相机
      success: function (res) {
        console.log(res);
        _this.setData({
          src: res.tempFilePaths
        })
      }
    })
  },

  //读取输入内容
  bindFormSubmit: function (e) {
    var that = this;
    console.log(e.detail.value);
    var v = e.detail.value.textarea.replace(/^ +|^\r+|^\n+|\r+$|\n+$| +$/g, '');
    if (that.data.id != 'group' && (v == '' || v == null))
      console.log("输入内容不能为空！");
    else{
      var isOpen = e.detail.value.isOpen;
      if(that.data.id!='note')
        isOpen = !isOpen;
      that.setData({
        title: e.detail.value.title,
        content: v,
        isOpen: isOpen
      });
      that.forSave()
    }
  },

  //统计字数
  bindWordLimit: function (e) {
    var value = e.detail.value, len = parseInt(value.length);
    if (len > this.data.noteMaxLen) return;

    this.setData({
      currentNoteLen: len //当前字数
    });
  },

  //账单页获取输入项
  getPay: function(e){
    var list = e.detail.value;
    if (list == '' || list == null)
      console.log("输入内容不能为空！");
    else if (e.target.dataset.name == "title"){
      this.setData({
        title: list
      });
    }
    else {
      this.setData({
        pay: list
      });
    }
  },

  //统计账单总数
  addPay: function(){
    if (this.data.pay != 0) {
      var list = {
        title: this.data.title,
        pay: parseFloat(this.data.pay),
        Num: this.data.Num + 1
      };
      array = this.data.payList;
      array.push(list);
      this.setData({
        payList: array,
        Num: this.data.Num + 1
      });
      console.log(this.data.payList);
    }

    this.setData({
      title: '',
      pay: 0,
      InOut: (array.reduce(function (prev, b) {
        return b.pay + prev;
      }, 0)).toFixed(2)
    })
    console.log('b')
  },

  //删除账单项
  deletePay:function(e){
    array.splice(e.currentTarget.dataset.id-1,1);
    this.setData({
      payList: array,
      Num: this.data.Num -1
    })

    this.setData({
      InOut: (array.reduce(function (prev, b) {
        return b.pay + prev;
      }, 0)).toFixed(2)
    })
  },

  //获取地址信息
  getLocation: function () {
    var that = this;
    // 实例化腾讯地图API核心类
    var qqmapsdk = new QQMapWX({
      key: '6PEBZ-OIMCG-M3TQV-IWSU7-5AM2F-FJFCT' // 必填
    });
    wx.getLocation({      //首先获得经纬度
      type: 'wgs84',
      success: (res) => {
        qqmapsdk.reverseGeocoder({   //然后借助腾讯位置服务提供个逆地址解析api将经纬度转换成具体的地址
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (res) {
            console.log(res)
            var location = (res.result.formatted_addresses.recommend == null) ? res.result.address : res.result.formatted_addresses.recommend
            that.setData({
              location: location
            })
          },
          fail: function (res) {
            console.log(res);
          }
        });
      }
    })
  },

  //设置文本框预设内容
  setPlaceholder:function(e){
    switch (e) {
      case 'diary':
        return '书写你的心情日记 ^-^';
        break;
      case 'note':
        return '记录备忘或便签，不要忘了噢！！ ^-^（温馨提示：此篇不能发布到社区中）';
        break;
      case 'group':
        return '随便记录，我都随你！！最好发布到社区和大家分享哦！';
        break;
      case 'find':
        return '你帮我，我帮你！我们的世界，一起来找*-* （温馨提示：这是会发到社区中的哦）';
        break;
      default:
        return '嗯！这个大家随意发挥！可以用来向社区老友们提问啊。。xixi';
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var date = util.formatTime(new Date());
    if (options.yn == 'y') {
      var id = JSON.parse(options.id);
      console.log(id);
      if (id.objectId) {
        this.setData({
          date: id.type,
          src: id.url,
          payList: id.pay.payList,
          title: id.title,
          content: id.content,
          Num: id.pay.payList.length,
          InOut: id.pay.inOut,
          location: id.location,
          objectId: id.objectId,
          id: id.type,
          user: AV.User.current().attributes.username,
          avatarUrl: AV.User.current().attributes.avatarUrl
        })
      }
    }
    else {
      var pnum = 9;
      if (options.id == 'diary'){pnum=1;}
      this.setData({
        date: date,
        placeholder: this.setPlaceholder(options.id),
        id: options.id,
        user: AV.User.current().attributes.username,
        avatarUrl: AV.User.current().attributes.avatarUrl,
        pnum: pnum
      })
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.switchTab({
      url: '../home/home'
    })
  }
})