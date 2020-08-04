let displayBoard = {
    get : function(req , res) {
        console.log("Get Data");
    },
    create : function(req , res) {
        console.log("Create Data");
    },
    update : function(req , res) {
        console.log("Update Data");
    },
    delete : function(req , res) {
        console.log("Delete Data");
    }
}

module.exports = displayBoard;