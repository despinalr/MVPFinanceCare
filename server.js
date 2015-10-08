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
var detalleSchema = new mongoose.Schema({
    Email: String
});

var mensaje = mongoose.model('Mensajes', mensajeSchema);
var detalle = mongoose.model('Detalles', detalleSchema);

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
                detalle.find({}, function(err, detalles) {
                        res.render('statistics.html', { mensajes: mensajes.length, detalles: detalles.length } );
                });
        });
    });
	
app.post('/mail', function(req, res) {
        console.log("Email: " + req.body.email);
        console.log("Texto: " + req.body.text);
        
        var instance = new mensaje({ Email: req.body.email, Texto: req.body.text });
        instance.save(function(err) {
                if(!err) {
                        sendEmailMessage(req.body.email, 'Te han recomendado FinanceCare!!!', 'Un Amigo te ha recomendado FinanceCare y te envía el siguiente Mensaje: ' + req.body.text, function() {
                                res.redirect('/');
                        });
                }
        });
    });
    
app.post('/detalle', function(req, res) {
        console.log("Email: " + req.body.email);
        
        var instance = new detalle({ Email: req.body.email });
        instance.save(function(err) {
                if(!err) {
                        sendEmailMessage(req.body.email, 'Pronto te enviaremos más detalle sobre FinanceCare!!!', 'El equipo de FinanceCare agradece tu interés. Pronto te estaremos enviando mas detalle sobre nosotros y cómo te podemos ayudar!!!', function() {
                                res.redirect('/');
                        });
                }
        });
    });
    
var sendEmailMessage = function(email, subjectText, text, callback) {
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
		subject: subjectText,
		text: text
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