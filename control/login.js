// 引入 ipcRenderer 模块。
const __ipcRenderer = nodeRequire('electron').ipcRenderer;
const __remote = nodeRequire('electron').remote;
const __BrowserWindow = __remote.BrowserWindow;
const __path = nodeRequire('path');
const __url = nodeRequire('url');
const __fs = nodeRequire('fs');
let curversion = "0.6.0";

let app = new Vue({
    el: '#login',
    data: {
        email: "",
        password: "",
        curversion: curversion,
        ischeckboxpwd: "true",
        ischeckboxautologin: "true"
    },
    methods: {
        login: function () {
            if (!this.email) {
                return false;
            }
            if (!this.password) {
                return false;
            }
            __ipcRenderer.send('_login_msg', {
                email: this.email,
                password: this.password,
                ischeckboxpwd: this.ischeckboxpwd,
                ischeckboxautologin: this.ischeckboxautologin
            });
        }
    }
});

__fs.readFile('./cookie.txt', 'utf8', function (err, data) {
    if (data) {
        let bean = JSON.parse(data);
        if (bean.ischeckboxpwd) {
            app.email = bean.email;
            app.password = bean.password;
        }
        if(bean.ischeckboxautologin) {
            app.email = bean.email;
            app.password = bean.password;
            app.login();
        }
    }
});

__ipcRenderer.on('_login_reply', function (event, arg) {
    if (arg.length > 0) {
        let bean = {
            email: app.email,
            password: app.password,
            ischeckboxpwd: app.ischeckboxpwd,
            ischeckboxautologin: app.ischeckboxautologin
        };
        __fs.writeFile('./cookie.txt', JSON.stringify(bean), (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
        //判断版本升级
        __ipcRenderer.send('_logincheckversion_msg', "");
    } else {
        alert("用户名或密码错误！")
    }
});

__ipcRenderer.on('_logincheckversion_reply', function (event, arg) {
    if (arg) {
        let releaseversion = arg[0].dataValues.version;
        if (curversion === releaseversion) {
            let win = new __BrowserWindow({
                width: 1400,
                height: 820,
                title: "",
                icon: "./img/logo.ico",
                // autoHideMenuBar: true,
                webPreferences: {defaultEncoding: "utf-8"},
                show: false,
                center: true
                // resizable: false
            });
            win.loadURL(__url.format({
                pathname: __path.join(__dirname, 'index.html'),
                protocol: 'file:',
                slashes: true
            }));
            win.once('ready-to-show', () => {
                win.show();
                __ipcRenderer.send('_loginclose_msg', "");
            })
        } else {
            alert(arg[0].dataValues.desc)
        }
    } else {
        alert("升级检查异常！")
    }
});