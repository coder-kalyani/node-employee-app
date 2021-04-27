const express = require('express')
const app = express();
const Employee = require('./model/employee');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.urlencoded();
const mongoose = require('mongoose');
const jsonToken = require('jsonwebtoken');
const btoa = require('btoa')
var flash = require('connect-flash')
var session = require('express-session')

const jwtkey = "jwt"
const key = "password"
const algo = "aes256"



mongoose.connect('mongodb+srv://demoMongo:Mongo123@cluster0.si3e7.mongodb.net/organization?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        userUnifiedTopology: true
    }
)

app.use(express.static("public"));
app.use(session({
    'secret': 'kalyani'
}))

app.use(flash())
app.set('view engine', 'ejs');

app.get('/', function (req, res) {

    res.render('home');
})

app.get('/dashboard', function (req, res) {
    Employee.find({}, function (err, result) {
        res.render('dashboard', { employeeData: result });
    })

})

app.get('/signup', function (req, res) {
    res.render('signup', { message: req.flash("error") });
})


app.post('/signup', jsonParser, function (req, res) {

    var encodedData = req.body.password;
    var decodeData = btoa(encodedData);
    var pass = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!(req.body.password.match(pass))) {
        req.flash("error", "Password must be at least 8 characters with at least one - Lower Case Character,Upper Case Character, Digit and Spcial Character")
        res.redirect('/signup')
    }
    else {
        const insertedData = new Employee({
            _id: new mongoose.Types.ObjectId,
            name: req.body.fullname,
            email: req.body.email,
            department: req.body.department,
            password: decodeData
        })

        insertedData.save().then(() => {
            res.redirect('login');
        })
    }
})


app.get('/login', function (req, res) {
    res.render('login', { message: req.flash("error") });
})

app.post('/login', jsonParser, function (req, res) {

    const pass = btoa(req.body.password)

    var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (!(req.body.email.match(emailRegex))) {

        req.flash("error", "Please Enter Valid Email id")
        res.redirect('/login')
    }
    else {
        Employee.findOne({ email: req.body.email, password: pass }, function (err, result) {

            if (result === null) {
                req.flash("error", "Please check your Username/Password")
                res.redirect('/login')
            }
            else {

                jsonToken.sign({ result }, jwtkey, { expiresIn: '600s' }, (err, token) => {
                    var token = { token }
                    req.session.empId = result._id
                    res.redirect('/dashboard')

                })
            }

        })
    }
})

app.get('/profile', jsonParser, function (req, res) {

    Employee.findOne({ _id: req.session.empId }, function (err, result) {
        req.session.id = req.session.empId,
            req.session.fullName = result.name,
            req.session.email = result.email,
            req.session.department = result.department,
            res.render('profile', { msg: req.flash('noUpdate'), id: req.session.empId, fullName: req.session.fullName, email: req.session.email, department: req.session.department });
    })
})

app.post('/profile', jsonParser, function (req, res) {

    Employee.updateOne({ _id: req.session.empId }, { $set: { name: req.body.fullName, email: req.body.email, department: req.body.department } }).then((result) => {
        res.redirect('/dashboard')
    })
})

app.get('/search', jsonParser, function (req, res) {
    res.render('search', { employeeData: req.session.employeeData });
})
app.post('/search', jsonParser, function (req, res) {
    if (req.body.searchIp === 'id') {
        Employee.find({ _id: req.body.searchText }).then((result) => {
            if (result === null) {
                console.log('no data found')
                res.end()
            }
            else {
                req.session.employeeData = result
                res.redirect('/search')
            }
        })
    }
    else if (req.body.searchIp === 'name') {
        Employee.find({ name: req.body.searchText }).then((result) => {
            if (result === null) {
                console.log('no data found')
                res.end()
            }
            else {
                req.session.employeeData = result
                res.redirect('/search')
            }
        })
    }
    else if (req.body.searchIp === 'department') {
        Employee.find({ department: req.body.searchText }).then((result) => {
            if (result === null) {
                console.log('no data found')
                res.end()
            }
            else {
                req.session.employeeData = result
                res.redirect('/search')
            }
        })
    }
    else if (req.body.searchIp === 'email') {
        Employee.find({ email: req.body.searchText }).then((result) => {
            if (result === null) {
                console.log('no data found')
                res.end()
            }
            else {
                req.session.employeeData = result
                res.redirect('/search')
            }
        })
    }


    // res.render('search');
})




app.listen(3000)