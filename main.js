global.__SYSTEM = {};
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const moment = require('moment');
const uuid = require('node-uuid');
const shortid = require('shortid');

let userinfo;
let win;
let username;
let maxsize;
let filetype;

// 保持一个对于 window 对象的全局引用，如果你不这样做， 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
function createWindow() {
    // 创建浏览器窗口。
    win = new BrowserWindow({
        width: 300,
        height: 210,
        icon: "./img/logo.ico",
        autoHideMenuBar: true,
        center: true,
        resizable: false,
        webPreferences: {defaultEncoding: "utf-8"}
    });

    // 加载应用的 index_old.html。
    win.loadURL(url.format({
        pathname: path.join(__dirname, './html/login.html'),
        protocol: 'file:',
        slashes: true
    }));

    // 打开开发者工具。
    // win.webContents.openDevTools()

    // 当 window 被关闭，这个事件会被触发。
    win.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        win = null
    });
}


// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    // 在这文件，你可以续写应用剩下主进程代码。
    // 也可以拆分成几个文件，然后用 require 导入。
    if (win === null) {
        createWindow()
    }
});

const DB = require("./dbutils");
//-----------login.js
ipcMain.on('_login_msg', (event, arg) => {
    DB.person.findAll({
        where: {
            username: arg.email,
            password: arg.password
        }
    }).then(function (result) {
        if (result.length > 0) {
            userinfo = result;
            username = result[0].dataValues.username;
            maxsize = result[0].dataValues.maxsize;
            if (result[0].dataValues.filetype) {
                filetype = JSON.parse(result[0].dataValues.filetype);
            }
        }
        event.sender.send('_login_reply', result);
    });
});

ipcMain.on('_logincheckversion_msg', (event, arg) => {
    DB.version.findAll({
        order: [['version', 'desc']]
    }).then(function (result) {
        event.sender.send('_logincheckversion_reply', result);
    });
});

ipcMain.on('_loginclose_msg', (event, arg) => {
    setTimeout(function () {
        win.close();
    }, 10)
});

ipcMain.on('_distorylogin_msg', (event, arg) => {
    if (process.platform !== 'darwin') {
        let bean = {}
        fs.writeFile('./cookie.txt', JSON.stringify(bean), (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
            app.quit()
        })
    }
});

//------index_old.js
ipcMain.on('_dirfile_msg', (event, arg) => {
    let files = fs.readdirSync(arg);
    let filesList = [];
    files.forEach(function (itm, index) {
        let stat = fs.statSync(arg + itm);
        if (stat.isDirectory()) {
            //自动忽略
        } else {
            //权限过滤
            let bool = true;
            if (filetype) {
                bool = false;
                let ext = path.extname(itm);
                for (let i = 0; i < filetype.length; i++) {
                    if (ext === filetype[i]) {
                        //自动过滤
                        bool = true;
                        break;
                    }
                }
            }
            if (bool) {
                let obj = {};//定义一个对象存放文件的路径和名字
                obj.path = arg;//路径
                obj.filename = itm//名字
                filesList.push(obj);
            }
        }
    });
    event.sender.send('_dirfile_reply', filesList);
});

let ftp = require("./ftputils");
ipcMain.on('_uploadfile_msg', (event, arg) => {
    let cdnpath = null;
    let cdnmenu = "/download.yxybb.com/YXYBB/yunyingzhuanyong/" + moment().year() + "/" + username + "/";
    let daytime = moment().format('MMDDHHmm');
    let localfilepath = arg.localfilepath;
    let filename = path.basename(localfilepath).trim();
    let extname = path.extname(localfilepath);

    //判断中文问题
    let reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
    if (reg.test(filename)) {
        cdnpath = cdnmenu.trim() + daytime + "_" + shortid.generate() + extname;
    } else {
        cdnpath = cdnmenu.trim() + daytime + "_" + shortid.generate() + "_" + filename;
    }

    fs.stat(localfilepath, function (err, stats) {
        if (err) {
            throw err;
        }

        let filesize = parseInt(stats.size / 1000);
        if (filesize > maxsize) {
            //超出最大文件大小
            event.sender.send('_uploadfile_reply', {
                cdnpath: "http:/" + cdnpath,
                no: arg.no,
                flag: "当前用户单文件最大不得超过" + maxsize + "kb"
            });
        } else {
            ftp.ftpclient(localfilepath, cdnpath.trim(), cdnmenu.trim()).then(function () {
                DB.cdnrecord.create({
                    id: uuid.v1().replace(/-/g, ""),
                    username: username,
                    localfilepath: localfilepath,
                    cdnfilepath: "http:/" + cdnpath,
                    filename: filename,
                    filesize: parseInt(stats.size / 1000)
                }).then(function (result) {
                    console.log('create ok');
                    //减少上传次数
                    DB.person.findAll({
                        where: {
                            username: username
                        }
                    }).then(function (result) {
                        event.sender.send('_uploadfile_reply', {
                            cdnpath: "http:/" + cdnpath,
                            no: arg.no,
                            remainnum: result[0].dataValues.remainnum - 1
                        });
                        DB.person.update({
                            remainnum: result[0].dataValues.remainnum - 1
                        }, {
                            where: {
                                username: username
                            }
                        }).then(function (result) {
                            console.log('updated person');
                            console.log(result);
                        });
                    });
                }).catch(function (err) {
                    console.log('create error');
                    console.log(err.message);
                });
            });
        }
    });
});


ipcMain.on('_getuserinfo_msg', (event, arg) => {
    event.sender.send('_getuserinfo_reply', userinfo);
});

//------history.js
ipcMain.on('_historysearch_msg', (event, arg) => {
    if (arg.trim()) {
        DB.cdnrecord.findAll({
            where: {
                filename: {
                    $like: arg + '%'
                },
                username: username
            },
            order: [['createdAt', 'desc']]
        }).then(function (result) {
            event.sender.send('_historysearch_reply', result);
        });
    } else {
        DB.cdnrecord.findAll({
            where: {
                username: username
            }, order: [['createdAt', 'desc']]
        }).then(function (result) {
            event.sender.send('_historysearch_reply', result);
        });
    }
});