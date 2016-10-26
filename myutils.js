function myutils() {
    this.time_shift = function(time_oringinal, time_delta) {
        return new Date(time_oringinal.getTime() + time_delta);
    }
}

module.export = myutils;