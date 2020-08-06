let statistics = {
    get : function(req , res) {
        console.log("statistics Get Data");
    },
    create : function(req , res) {
        console.log("statistics  Create Data");
    },
    update : function(req , res) {
        console.log("statistics  Update Data");
    },
    delete : function(req , res) {
        console.log("statistics Delete Data");
    }
}

module.exports = statistics;