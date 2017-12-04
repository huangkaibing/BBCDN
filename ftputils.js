const Client = require('ftp');
const Q = require('q');

exports.ftpclient = function (localfilepath, cdnpath, cdnenum) {
    let c = new Client();
    let p = Q.defer();
    //step2:连接和身份验证成功时发出
    c.on('ready', function () {
        console.log(cdnpath)
        c.list(cdnenum, false, function (err, list) {
            if (err) {
                console.log("目录不存在")
                console.log("开始创建目录")
                c.mkdir(cdnenum, true, function (err) {
                    if (err) {
                        console.log("目录创建失败")
                        console.log(err)
                        c.end();
                        c.destroy();
                    } else {
                        console.log('目录创建成功')
                        console.log("目录打开成功")
                        c.put(localfilepath, cdnpath, function (err) {
                            if (err) {
                                console.log("上传失败")
                                console.log(err)
                            }
                            c.end();
                            c.destroy();
                            p.resolve(cdnpath);
                        });
                    }
                })
            } else {
                c.put(localfilepath, cdnpath, function (err) {
                    console.log(localfilepath)
                    if (err) {
                        console.log("上传失败")
                        console.log(err)
                    }
                    console.log('huangkb001')
                    c.end();
                    c.destroy();
                    p.resolve(cdnpath);
                });
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
        host: "xxx",
        port: xxxx,
        user: "xxx",
        password: "xxx",
        connTimeout: 10000,
        pasvTimeout: 10000,
        keepalive: 10000
    };
    c.connect(connectionProperties);
    return p.promise;
}
