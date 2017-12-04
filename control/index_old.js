// 引入 ipcRenderer 模块。
const __ipcRenderer = nodeRequire('electron').ipcRenderer;
const __clipboard = nodeRequire('electron').clipboard;
const __remote = nodeRequire('electron').remote;
const __BrowserWindow = __remote.BrowserWindow;
// const __path = nodeRequire('path');
// const __url = nodeRequire('url');

// Vue.filter('zhfilter', function (value) {
//     if (!value) {
//         return ''
//     }
//     var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
//     if (reg.test(value)) {
//         alert("文件名不能含有中文！----" + value);
//     } else {
//         return value;
//     }
// })

let app = new Vue({
    el: '#client',
    data: {
        filetag: "file",
        cdntag: "cdn",
        cdnprocesstag: "cdnprocess",
        cdnprocesswidthtag: "cdnprocesswidth",
        btnuptag: "btnup",
        btnviewtag: "btnview",
        btncopytag: "btncopy",
        realname: "",
        notice: "",
        remainnum: "",
        dirpath: "",
        todos: []
    },
    methods: {
        searchFileList: function () {
            this.todos = [];
            let str = this.dirpath;
            if (!str) {
                return false;
            }
            // var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
            // if (reg.test(str)) {
            //
            // }
            if (str.substr(str.length - 1, 1) !== '\\') {
                this.dirpath = str + "\\";
            }
            // 使用 ipcRenderer.send 向主进程发送消息。
            __ipcRenderer.send('_dirfile_msg', this.dirpath);
        },
        // searchHistory: function () {
        //
        //     let win = new __BrowserWindow({
        //         width: 1300,
        //         height: 600,
        //         title: "",
        //         icon: "./img/logo.ico",
        //         autoHideMenuBar: true,
        //         webPreferences: {defaultEncoding: "utf-8"}
        //     })
        //     win.loadURL(__url.format({
        //         pathname: __path.join(__dirname, 'history.html'),
        //         protocol: 'file:',
        //         slashes: true
        //     }))
        // },
        fileupload: function (params, event) {
            if (this.remainnum === 0) {
                alert("上传次数已用完，请重新申请！");
                return false;
            }
            let localfilepath = this.dirpath.trim() + $("#" + this.filetag + params).text().trim();
            $("#" + this.cdnprocesstag + params).show();
            $("#" + this.btnuptag + params).attr("disabled", "disabled");
            let msg = {
                localfilepath: localfilepath,
                no: params
            };
            // 使用 ipcRenderer.send 向主进程发送消息。
            __ipcRenderer.send('_uploadfile_msg', msg);
        },
        filecdnview: function (params, event) {
            let cdnpath = $("#" + this.cdntag + params).text();
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
        copyCdnPath: function (params, event) {
            let cdnpath = $("#" + this.cdntag + params).text();
            __clipboard.writeText(cdnpath);
            alert("复制成功!");
        }
    }
});

__ipcRenderer.on('_uploadprocess_reply', function (event, arg) {
    $("#" + app.cdnprocesswidthtag + arg.no).css("width", arg.process + "%");
    $("#" + app.cdnprocesswidthtag + arg.no).text(arg.process + "%");
});

// 监听主进程返回的消息
__ipcRenderer.on('_dirfile_reply', function (event, arg) {
    if (arg.length < 1) {
        alert("文件列表为空!");
    } else {
        let bool = false;
        // let reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        for (let i = 0; i < arg.length; i++) {
            arg[i].no = i + 1;
            // if (reg.test(arg[i].filename)) {
            //     alert("文件名不能含有中文！----" + arg[i].filename);
            //     bool = true;
            //     break;
            // }
        }
        if (!bool) {
            app.todos = arg;
        }
    }
});

__ipcRenderer.send('_getuserinfo_msg', "");
__ipcRenderer.on('_getuserinfo_reply', function (event, arg) {
    let data = arg[0].dataValues;
    app.remainnum = data.remainnum;
    app.realname = data.realname;
    app.notice = "温馨提示：1.当前用户仅允许上传" + data.filetype + "格式文件。       2.当前用户仅允许上传小于" + data.maxsize + "kb的文件。        3.由于CDN存在延时，文件上传成功后请等待10s左右再预览。";
    if (data.notice) {
        alert(data.notice)
    }
});

__ipcRenderer.on('_uploadfile_reply', function (event, arg) {
    if (arg.flag) {
        $("#" + app.cdntag + arg.no).text("");
        alert(arg.flag);
    } else {
        $("#" + app.cdntag + arg.no).text(arg.cdnpath);
        $("#" + app.btnviewtag + arg.no).attr("disabled", false);
        $("#" + app.btncopytag + arg.no).attr("disabled", false);
        app.remainnum = arg.remainnum;
    }
});