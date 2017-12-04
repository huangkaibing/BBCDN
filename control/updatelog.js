const __ipcRenderer = nodeRequire('electron').ipcRenderer;
new Vue({
    el: '#client',
    data: {},
    methods: {
        distorylogin: function () {
            __ipcRenderer.send('_distorylogin_msg', null);
        }
    }
});