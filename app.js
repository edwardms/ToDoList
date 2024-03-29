const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require("mongoose");
const lodash = require("lodash");
require('dotenv').config()
//const date = require(__dirname + '/date.js');

//const { port, mongoAtlasUsername, mongoAtlasPassword, mongoAtlasCluster, dbName} = require(__dirname + '/properties.js');
const port = process.env.PORT;
const mongoAtlasUsername = process.env.MONGO_USERNAME;
const mongoAtlasPassword = process.env.MONGO_PASSWORD;
const mongoAtlasCluster = process.env.MONGO_CLUSTER;
const mongoDbName = process.env.MONGO_DB_NAME;

const app = express();
const mongoAtlasUrl = `mongodb+srv://${mongoAtlasUsername}:${mongoAtlasPassword}@${mongoAtlasCluster}.mongodb.net/${mongoDbName}`;

// const items = [];
// const workItems = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

const itemsSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist"
});
const item2 = new Item({
    name: "Hit the + button to add a new item"
});
const item3 = new Item({
    name: "<== Hit this to delete an item"
});
const defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
    name: String,
    items: [itemsSchema]
});
const List = mongoose.model("list", listSchema);

app.get('/', (req, res) => {
    // let today = new Date();
    // let options = {
    //     weekday: 'long',
    //     day: 'numeric',
    //     month: 'long'
    // };

    // let day = today.toLocaleDateString('en-US', options);

    Item.find().then(
        itemsFromDb => {
            if (itemsFromDb.length === 0) {
                Item.insertMany(defaultItems);

                res.redirect("/");
            } else {
                res.render('index', {listTitle: /*date.getDay()*/"Today", listItems: itemsFromDb});
            }
        }
    );
});

app.post('/', (req, res) => {
    const item = new Item({
        name: req.body.newItem
    });
    const listName = lodash.lowerCase(req.body.addButton);

    if (listName === "today") {
        item.save()
            .then( (item) => console.log(`Item ${item.name} created`) )
            .catch( (err) => console.log(err) );

        res.redirect("/");
    } else {
        List.findOne({name: listName})
            .then(listFromDB => {
                    listFromDB.items.push(item);
                    
                    listFromDB.save()
                              .then( (item) => console.log(`Item ${item.name} added to list ${listFromDB.name}`) )
                              .catch( (err) => console.log(err) );

                    res.redirect(`/${listName}`);
                }
            );
    }

    // if (req.body.addButton === 'Work') {
    //     workItems.push(item);
    //     res.redirect('/work');
    // } else {
    //     items.push(item);
    //     res.redirect('/');
    // }  
});

app.post("/delete", (req, res) => {
    const deletedItemId = req.body.deleteCheckbox;
    const listName = lodash.lowerCase(req.body.listName);

    if (listName === "today") {
        Item.findByIdAndDelete(deletedItemId)
            .then( (item) => console.log(`Item ${item.name} deleted`) )
            .catch( (err) => console.log(err)) ;

        res.redirect("/");
    } else {
        List.findOneAndUpdate( { name: listName }, { $pull: { items: {_id: deletedItemId} } } )
            .then( () => console.log('User updated') )
            .catch( (err) => console.log(err) );
            res.redirect(`/${listName}`);
    }
});

app.get("/:customListName", (req, res) => {
    const customListName = req.params.customListName.toLowerCase() !== "favicon.ico" ? req.params.customListName.toLowerCase() : '';

    List.findOne({name: customListName})
        .then(listFromDB => {
                if (!listFromDB) {
                    const list = new List({
                        name: customListName,
                        items: defaultItems
                    });

                    list.save()
                        .then( (l) => console.log(`List ${l.name} created`) )
                        .catch( (err) => console.log(err) );
                    res.redirect(`/${customListName}`);
                } else {                
                    res.render('index', {listTitle: lodash.capitalize(customListName), listItems: listFromDB.items});
                }
            }
        );
});

// app.get('/work', (req, res) => {
//     res.render('index',  {listTitle: 'Work', newListItems: workItems});
// });

// app.get('/about', (req, res) => {
//     res.render('about');
// });

mongoose.connect(mongoAtlasUrl)
        .then(() => {
            console.log('MongoDB connected');
            app.listen(port, () => {
                console.log(`Server started on port ${port}`);
            });
        })
        .catch((err) => console.log(err));
