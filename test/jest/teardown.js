module.exports = /*async */function () {

    if (!process.env.WATCHING) {

        /*await */global.httpServer.close();

    }

};
