const Client = require('ftp');
const Q = require('q');
const fs = require('fs');
const {webContents} = require('electron');

exports.ftpclient = function (localfilepath, cdnpath, cdnenum, no) {
    let c = new Client();
    let p = Q.defer();
    //step2:连接和身份验证成功时发出
    c.on('ready', function () {
        console.log(cdnpath);
        c.list(cdnenum, false, function (err, list) {
            if (err) {
                console.log("目录不存在");
                console.log("开始创建目录");
                c.mkdir(cdnenum, true, function (err) {
                    if (err) {
                        console.log("目录创建失败");
                        console.log(err);
                        c.end();
                        c.destroy();
                    } else {
                        console.log('目录创建成功');
                        console.log("目录打开成功");
                        c.put(localfilepath, cdnpath, function (err) {
                            if (err) {
                                console.log("上传失败");
                                console.log(err);
                            }
                            c.end();
                            c.destroy();
                            p.resolve(cdnpath);
                        });
                    }
                })
            } else {
                let file = fs.createReadStream(localfilepath),
                    cur = 0,
                    total = fs.statSync(localfilepath).size;
                file.on('data', function (d) {
                    cur += d.length;
                    // console.log(((cur / total) * 100).toFixed(1) + '% complete');
                    let replyeb = {
                        no: no,
                        process: ((cur / total) * 100).toFixed(1)
                    };
                    // webContents.getFocusedWebContents().send("_uploadprocess_reply", replyeb);
                    webContents.fromId(__SYSTEM.mainwin).send("_uploadprocess_reply", replyeb);
                });
                c.put(file, cdnpath, function (err) {
                    if (err) throw err;
                    console.log('Done uploading!');
                    c.end();
                    c.destroy();
                    p.resolve(cdnpath);
                });

                // c.put(localfilepath, cdnpath, function (err) {
                //     console.log(localfilepath);
                //     if (err) {
                //         console.log("上传失败");
                //         console.log(err)
                //     }
                //     console.log('huangkb001');
                //     c.end();
                //     c.destroy();
                //     p.resolve(cdnpath);
                // });
            }
        })
    });
//step3:连接结束时发出
    c.on('end', function () {
        // console.log('3');
    });

//step4:连接完全关闭时发出
    c.on('close', function (hadErr) {
        // console.log('4:' + hadErr);
    });

//step1:服务器在连接时发送的文本
    c.on('greeting', function (msg) {
        // console.log('1:' + msg);
    });

    const connectionProperties = {
        host: "xx",
        port: xx,
        user: "xx",
        password: "xx",
        connTimeout: 10000,
        pasvTimeout: 10000,
        keepalive: 10000
    };
    c.connect(connectionProperties);
    return p.promise;
};
