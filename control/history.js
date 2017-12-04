// 引入 ipcRenderer 模块。
const __ipcRenderer = nodeRequire('electron').ipcRenderer;
const __clipboard = nodeRequire('electron').clipboard;
const __remote = nodeRequire('electron').remote;
const __BrowserWindow = __remote.BrowserWindow;

let app = new Vue({
    el: '#history',
    data: {
        filenamepar: '',
        todos: []
    },
    methods: {
        searchCdnList: function () {
            this.todos = [];
            // 使用 ipcRenderer.send 向主进程发送消息。
            __ipcRenderer.send('_historysearch_msg', this.filenamepar);
        },
        filecdnview: function (cdnpath, event) {
            let win = new __BrowserWindow({
                width: 800,
                height: 600,
                title: "",
                icon: "./img/logo.ico",
                autoHideMenuBar: true,
                webPreferences: {defaultEncoding: "utf-8"},
                center: true,
                resizable: false
            });
            win.loadURL(cdnpath)
        },
        distorylogin: function () {
            __ipcRenderer.send('_distorylogin_msg', null);
        },
        copyCdnPath: function (cdnpath, event) {
            __clipboard.writeText(cdnpath);
            alert("复制成功!");
        }
    }
});

Vue.filter('timeSub', function (value) {
    if (!value) {
        return ''
    }
    // value = value.toString()
    return formatDate(new Date(value));
});
Vue.filter('filesizeSub', function (value) {
    if (!value) {
        return ''
    }
    // value = value.toString()
    return value + "kb";
});

function formatDate(now) {
    let year = now.getFullYear();
    let month = ("0" + (now.getMonth() + 1)).slice(-2);
    let date = ("0" + now.getDate()).slice(-2);
    let hour = ("0" + (now.getHours())).slice(-2);
    let minute = ("0" + (now.getMinutes())).slice(-2);
    return year + "-" + month + "-" + date + "   " + hour + ":" + minute;
}

// 监听主进程返回的消息
__ipcRenderer.on('_historysearch_reply', function (event, arg) {
    if (arg.length < 1) {
        alert("文件不存在!");
    } else {
        for (let i = 0; i < arg.length; i++) {
            arg[i].no = i + 1;
        }
        app.todos = arg;
    }
});