const AV = require('../libs/av-weapp-min.js');

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function Save(eve, tempFilePath) {
  if (eve.objectId == "" || eve.objectId == null) {
    tempFilePath.map(tempFilePath => () => new AV.File('filename', {
      blob: {
        uri: tempFilePath,
      }
    }).save()).reduce(
      (m, p) => m.then(v => AV.Promise.all([...v, p()])),
      AV.Promise.resolve([])
      ).then(files => saveDB(eve, files)).catch(console.error)
  }
  else {
    var db = AV.Object.createWithoutData('DB', eve.objectId);
    saveDB(eve, '');
  }
}

function saveDB(eve,files){
  console.log(eve.objectId);

  if (eve.objectId == '' || eve.objectId == null) {
    var Db = AV.Object.extend('DB');
    var db = new Db();
    var Files = files.map(file => AV.Object.createWithoutData('_File', file.id));
    var urls = files.map(file => file.url());
    db.set('url', urls);
  }
  else {
    var db = AV.Object.createWithoutData('DB', eve.objectId);
  }

  db.set('user', eve.user);
  db.set('avatarUrl', eve.avatarUrl);
  db.set('type', eve.id);
  db.set('pay', eve.pay);
  db.set('title', eve.title);
  db.set('content', eve.content);

  db.set('imgId',Files);
  db.set('location',eve.location);
  db.set('isOpen', eve.isOpen);

  if (!eve.isOpen && eve.id != 'find') {
    const acl = new AV.ACL();
    acl.setPublicReadAccess(false);
    acl.setWriteAccess(AV.User.current(), true);
    acl.setReadAccess(AV.User.current(), true);
    db.setACL(acl);
  }
  db.save().then(function (todo) {
    console.log('objectId is ' + todo.id);
    wx.showToast({
      title: '成功',
      icon: 'success',
      duration: 3000
    });
    wx.reLaunch({
      url: '../home/home'
    })
  }, function (error) {
    console.error(error);
    wx.showToast({
      title: '网络缓慢，请重新提交',
      icon: 'none',
      duration: 2000
    })
  });
}

module.exports = {
  formatTime: formatTime,
  Save: Save
}
