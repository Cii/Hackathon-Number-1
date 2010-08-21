Relego = {};

function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
    
    Relego.Metrix = new Metrix();
    
    this.controller.pushScene("main");
};
