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

var tipoProductoSchema = new mongoose.Schema({
	_id:String,
	nombre: String
});
var entidadFinancieraSchema = new mongoose.Schema({
	_id:String,
	nombre: String
});

var productoSchema = new mongoose.Schema({
	_id:String,
	nombre:String,
	tasa_min_a:String,
	tasa_max_a:String,
	tasa_min_m:String,
	tasa_max_m:String,
	tasa_fija:String,
	plazo_min:String,
	plazo_max:String,
	cupo_min:String,
	cupo_max:String,
	tipo_producto: mongoose.Schema.Types.ObjectId,
	entidad: mongoose.Schema.Types.ObjectId
});

var visitasSchema = new mongoose.Schema({
	deseaContacto:Boolean,
	fecha:Date,
	producto_id:mongoose.Schema.Types.ObjectId,
	cliente_id:mongoose.Schema.Types.ObjectId
});


var usuarioSchema = new mongoose.Schema({
	nombre:String,
	correo:String
});



var mensaje = mongoose.model('Mensajes', mensajeSchema);
var detalle = mongoose.model('Detalles', detalleSchema);
var tipo_producto = mongoose.model('tipo_producto',tipoProductoSchema,'tipo_producto');
var entidadFinanciera = mongoose.model('entidad_financiera',entidadFinancieraSchema,'entidad_financiera');
var producto = mongoose.model('producto',productoSchema,'producto');
var usuario = mongoose.model('usuarios',usuarioSchema);
var visita = mongoose.model('visita',visitasSchema);

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
    
app.get('/personas', function(req, res) {;
	tipo_producto.find({},function(err, tipo_productos) {
		entidadFinanciera.find({},function(err, entidades) {
			res.render('usuarios.html', { "tipo_productos": tipo_productos, "entidades" : entidades } );		
		});
	});
});
    
app.get('/empresas', function(req, res) {
    res.sendfile('clientes.html');
});    
    
app.get('/statistics', function(req, res) {
    mensaje.find({}, function(err, mensajes) {
            detalle.find({}, function(err, detalles) {
                    res.render('statistics.html', { mensajes: mensajes.length, detalles: detalles.length } );
            });
    });
});

app.post('/mail', function(req, res) {
    postMail(req, res, '');
});
    
app.post('/mailpersonas', function(req, res) {
    postMail(req, res, 'personas');
});
    
app.post('/mailempresas', function(req, res) {
    postMail(req, res, 'empresas');
});

app.post('/detalle', function(req, res) {
    postDetalle(req, res, '');
});
    
app.post('/detallepersonas', function(req, res) {
    postDetalle(req, res, 'personas');
});
    
app.post('/detalleempresas', function(req, res) {
    postDetalle(req, res, 'empresas');
});

app.post('/searchPrd',function(req,res){
	console.log(req.body);
	var tp_id = new objectId(req.body.tipo_producto);
	var ent_id = new objectId(req.body.entidad_financiera);
	console.log("tp_id:" + tp_id)
	console.log("ent_id:" +  ent_id)
	
	tipo_producto.find({},function(err, tipo_productos) {
		entidadFinanciera.find({},function(err, entidades) {
			producto.find({"tipo_producto":tp_id,"entidad":ent_id},function(err, productos){
				res.render('usuarios.html', { "tipo_productos": tipo_productos, "entidades" : entidades,"productos": productos} );
			});	
		});
	});	
});

app.post("/set_visita",function(req,res){
	//console.log(req.body);
	var prd_id = new objectId(req.body.idPrd);
	//console.log("prd_id:" + prd_id)
	usuario.find({correo:req.body.correo},function(err,usrs){
		//console.log("usrs.length: " + usrs.length);
		//console.log("body:" + req.body);
		//console.log("correo:" + req.body.correo);
		if(usrs.length == 0){
			//console.log("Entro usr");
			//console.log("body:" + req.body);
			//console.log("correo:" + req.body.correo);
			var usr = new usuario({correo:req.body.correo});
			usr.save({});			
		}
		usuario.findOne({correo:req.body.correo},function(err,usr){
			//console.log("entro findOne");
			//console.log("usr._id: " + usr._id);	
			var v = new visita({"producto_id":prd_id,"cliente_id":usr._id ,"deseaContacto":true,"fecha":Date.now});
			var v = new visita({deseaContacto:true,fecha:new Date(),producto_id:prd_id,cliente_id:usr._id});
			v.save({});			
		});
	});
});

var postMail = function(req, res, redirectTo) {
    console.log("Email: " + req.body.email);
    console.log("Texto: " + req.body.text);
    
    var instance = new mensaje({ Email: req.body.email, Texto: req.body.text });
    instance.save(function(err) {
            if(!err) {
                    sendEmailMessage(req.body.email, 'Te han recomendado FinanceCare!!!', 'Un Amigo te ha recomendado FinanceCare y te envía el siguiente Mensaje: ' + req.body.text, function() {
                            res.redirect('/' + redirectTo);
                    });
            }
    });
}

var postDetalle = function(req, res, redirectTo) {
    console.log("Email: " + req.body.email);
        
        var instance = new detalle({ Email: req.body.email });
        instance.save(function(err) {
                if(!err) {
                        sendEmailMessage(req.body.email, 'Pronto te enviaremos más detalle sobre FinanceCare!!!', 'El equipo de FinanceCare agradece tu interés. Pronto te estaremos enviando mas detalle sobre nosotros y cómo te podemos ayudar!!!', function() {
                                res.redirect('/' + redirectTo);
                        });
                }
        });
}
    
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
//console.log(process.env.IP + ":" + process.env.PORT);
//app.listen(process.env.PORT, process.env.IP);
app.listen(8081,"127.0.0.1");