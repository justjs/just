module.exports = async function () {

    if (!process.env.WATCHING) {

        await global.httpServer.close(
            function () { console.log('[HTTP] Server closed.'); }
        );

    }

};
