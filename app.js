const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const date = require(__dirname + '/date.js');

const app = express();
const port = 3000;

const items = [];
const workItems = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    // let today = new Date();
    // let options = {
    //     weekday: 'long',
    //     day: 'numeric',
    //     month: 'long'
    // };

    // let day = today.toLocaleDateString('en-US', options);

    res.render('index', {listTitle: date.getDay(), newListItems: items});
});

app.post('/', (req, res) => {
    let item = req.body.newItem;

    if (req.body.addButton === 'Work') {
        workItems.push(item);
        res.redirect('/work');
    } else {
        items.push(item);
        res.redirect('/');
    }  
});

app.get('/work', (req, res) => {
    res.render('index',  {listTitle: 'Work', newListItems: workItems});
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.listen(port, () => {
    console.log(`Server started on porn ${port}`);
});
