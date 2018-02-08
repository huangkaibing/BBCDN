// 引入 ipcRenderer 模块。
const __ipcRenderer = nodeRequire('electron').ipcRenderer;
const __clipboard = nodeRequire('electron').clipboard;
const __remote = nodeRequire('electron').remote;
const __BrowserWindow = __remote.BrowserWindow;
const __path = nodeRequire('path');
const __url = nodeRequire('url');
const __fs = nodeRequire('fs');
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
        fileupload: function (params, event) {
            if (this.remainnum === 0) {
                alert("上传次数已用完，请重新申请！");
                return false;
            }
            let localfilepath = $("#" + this.filetag + params).text().trim();
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
                center: true
                // resizable: false
            });
            win.loadURL(cdnpath);
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

__ipcRenderer.send('_getuserinfo_msg', app.dirpath);
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

__ipcRenderer.on('_uploadprocess_reply', function (event, arg) {
    $("#" + app.cdnprocesswidthtag + arg.no).css("width", arg.process + "%");
    $("#" + app.cdnprocesswidthtag + arg.no).text(arg.process + "%");
});

//拖拽处理
document.addEventListener('dragover', function (e) {
    e.stopPropagation();
    e.preventDefault();
}, false);

document.addEventListener('drop', function (e) {
    e.stopPropagation();
    e.preventDefault();
}, false);

let holder = document.getElementById('drag');
holder.ondragover = function () {
    return false;
};
holder.ondragleave = holder.ondragend = function () {
    return false;
};

let _arr = [];
let _bno = 0;
holder.ondrop = function (e) {
    e.preventDefault();
    app.todos = [];
    let arg = e.dataTransfer.files;
    let tmp = [];
    for (let i = 0; i < arg.length; i++) {
        let map = {};
        map.no = _bno;
        map.path = arg[i].path;
        tmp[i] = map;
        _bno++;
    }
    _arr = _arr.concat(tmp);
    app.todos = _arr;
    return false;
};