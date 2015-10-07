var express = require('express');
var app = express();
var swig = require('swig');
var cons = require('consolidate');
var bodyParser = require('body-parser');
var mongoose = require('mongoose').connect('mongodb://despinalr:lpdp451789@ds033484.mongolab.com:33484/financecare');
var nodemailer = require('nodemailer');

var objectId = mongoose.Types.ObjectId;
var mensajeSchema = new mongoose.Schema({
    Email: String,
    Texto: String
});

var mensaje = mongoose.model('Mensajes', mensajeSchema);

mongoose.connection.once('open', function callback() {
    console.log('Conectado!!!');
});

app.set('views', __dirname);
app.engine('.html', cons.swig);
app.set('view engine', 'html');
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
        res.sendfile('index.html');
    });
    
app.get('/statistics', function(req, res) {
        mensaje.find({}, function(err, mensajes) {
                res.render('statistics.html', { mensajes: mensajes.length } );
        });
    });
	
app.post('/mail', function(req, res) {
        console.log("Email: " + req.body.email);
        console.log("Texto: " + req.body.text);
        
        var instance = new mensaje({ Email: req.body.email, Texto: req.body.text });
        instance.save(function(err) {
                if(!err) {
                        sendEmailMessage(req.body.email, req.body.text, function() {
                                res.sendfile('index.html');
                        });
                }
        });
    });
    
var sendEmailMessage = function(email, text, callback) {
	var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
                user: 'financecaremail@gmail.com',
	        pass: 'f1n@nc3c@r3'
        }
    });
    var mailOptions = {
        from: 'FinanceCare ✔ <financecaremail@gmail.com>',
		to: email,
		subject: 'Te han recomendado FinanceCare!!!',
		text: 'Un Amigo te ha recomendado FinanceCare y te envía el siguiente Mensaje: ' + text
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            callback();
        }
    });
}

app.listen(process.env.PORT, process.env.IP);