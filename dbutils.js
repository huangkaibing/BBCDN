const Sequelize = require('sequelize');
if (!__SYSTEM._DB) {
    __SYSTEM._DB = new Sequelize('YXYBB_yunyingcdn_20170928', 'postgres', 'longrise', {
        host: '192.168.7.212',
        port: '54320',
        dialect: 'postgres',
        // pool: {
        //     max: 2,
        //     min: 0,
        //     idle: 10000
        // },
        define: {
            freezeTableName: true
        }
    });
}


exports.person = __SYSTEM._DB.define('person', {
    id: {
        primaryKey: true,
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    remainnum: {
        type: Sequelize.STRING,
        allowNull: false
    },
    totalnum: {
        type: Sequelize.STRING,
        allowNull: false
    },
    realname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    filetype: {
        type: Sequelize.STRING,
        allowNull: false
    },
    maxsize: {
        type: Sequelize.STRING,
        allowNull: false
    },
    notice: {
        type: Sequelize.STRING,
        allowNull: false
    }
});


exports.cdnrecord = __SYSTEM._DB.define('cdnrecord', {
    id: {
        primaryKey: true,
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    localfilepath: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cdnfilepath: {
        type: Sequelize.STRING,
        allowNull: false
    },
    filename: {
        type: Sequelize.STRING,
        allowNull: false
    },
    filesize: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

exports.version = __SYSTEM._DB.define('version', {
    id: {
        primaryKey: true,
        type: Sequelize.STRING,
        allowNull: false
    },
    version: {
        type: Sequelize.STRING,
        allowNull: false
    },
    desc: {
        type: Sequelize.STRING,
        allowNull: false
    },
    remark: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cdnurl: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

