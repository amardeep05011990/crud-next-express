/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.
use("mongodbVSCodePlaygroundDB");

db.getCollection("sales").insertMany([
  {
    item: "jan",
    price: 10,
    quantity: 2,
    date: ISODate("jan 2021"),
  },
  {
    item: "jan",
    price: 20,
    quantity: 1,
    date: ISODate("june 2022"),
  },
  {
    item: "feb",
    price: 5,
    quantity: 10,
    date: ISODate("feb 2023"),
  }
]);


  // Insert a few documents into the sales collection.

db.getCollection("sales").insertMany([
  {
    item: "abc",
    price: 10,
    quantity: 2,
    date: new Date("2014-03-01T08:00:00Z"),
  },
  {
    item: "jkl",
    price: 20,
    quantity: 1,
    date: new Date("2014-03-01T09:00:00Z"),
  },
  {
    item: "xyz",
    price: 5,
    quantity: 10,
    date: new Date("2014-03-15T09:00:00Z"),
  },
  {
    item: "xyz",
    price: 5,
    quantity: 20,
    date: new Date("2014-04-04T11:21:39.736Z"),
  },
  {
    item: "abc",
    price: 10,
    quantity: 10,
    date: new Date("2014-04-04T21:23:13.331Z"),
  },
  {
    item: "def",
    price: 7.5,
    quantity: 5,
    date: new Date("2015-06-04T05:08:13Z"),
  },
  {
    item: "def",
    price: 7.5,
    quantity: 10,
    date: new Date("2015-09-10T08:43:00Z"),
  },
  {
    item: "abc",
    price: 10,
    quantity: 5,
    date: new Date("2016-02-06T20:20:13Z"),
  },
]);

// Run a find command to view items sold on April 4th, 2014.
const salesOnApril4th = db
  .getCollection("sales")
  .find({
    date: { $gte: new Date("2014-04-04"), $lt: new Date("2014-04-05") },
  })
  // .count();

// Print a message to the output window.
console.log(`${salesOnApril4th} sales occurred in 2014.`);

// Here we run an aggregation and open a cursor to the results.
// Use '.toArray()' to exhaust the cursor to return the whole result set.
// You can use '.hasNext()/.next()' to iterate through the cursor page by page.
db.getCollection("sales").aggregate([
  // Find all of the sales that occurred in 2014.
  {
    $match: {
      date: { $gte: new Date("2014-01-01"), $lt: new Date("2015-01-01") },
    },
  },
  // Group the total sales for each product.
  {
    $group: {
      _id: "$item",
      totalSaleAmount: { $sum: { $multiply: ["$price", "$quantity"] } },
    },
  },
]);

db.sales.find({item: "june"})

//  notes

// $inc: The $inc operator increments the value of a field by a specified amount.

// $min: The $min operator updates the value of a field if the specified value is less than the current value of the field.

// $max: The $max operator updates the value of a field if the specified value is greater than the current value of the field.

// $mul: The $mul operator multiplies the value of a field by a specified amount.

// $unset: The $unset operator removes a specific field from a document.

// $rename: The $rename operator renames a field.

// Upsert: An upsert is a combination of an update and an insert operation. If a document matching the update criteria does not exist,
// the update operation creates a new document with the specified update criteria. If a document matching the update criteria does exist,
// the update operation modifies the existing document.

use("lib");
db.books.find({})

use("lib");
db.books.find({});

// update
use("lib");
db.teachers.updateOne({ _id: 1 }, { $set: { name: "Amar" } });

// Increament stock by ;
use("lib");
db.getCollection("books").updateMany(
  {},
  {
    $inc: { stock: 2 },
  }
);

// decreament
use("lib");
db.getCollection("books").updateMany(
  {},
  {
    $inc: { stock: -2 },
  }
);

// increase stock by 50 if it is less than 50

// max means jada karna and min means kam karna

use("lib");
// db.books.find({item:"TBD"})
db.books.updateMany({ item: "TBD" }, { $max: { stock: 250 } });

use("lib");
// db.books.find({item:"TBD"})
db.books.updateMany({ item: "TBD" }, { $min: { stock: 50 } });

use("lib");
db.books.update({ item: "TBD" }, { $set: { stock: 180 } });
db.books.update({ item: "TBD" }, { $set: { stock: 150 } });

// multiply stoccck by 2

use("lib");
db.books.updateMany({}, { $mul: { stock: 2 } });

// unset
use("lib");
db.books.updateOne({ item: "TBD" }, { $unset: { stock: 150 } });

// rename the field
use("lib");
db.books.updateOne({ item: "TBD" }, { $rename: { stock: "stock-q" } });

// upsert- insert if not find
use("lib");
db.books.updateOne(
  { item: "kurti" },
  { $set: { stock: 50 } },
  { upsert: true }
);

// To update a nested array in MongoDB, you can use the $ operator to specify the position of the
//  element in the array and the $set operator to specify the new value for that element

// $push is an operator in MongoDB that is used to add an item or items to an array within a document.

// $pull is used to remove an item or items from an array that match a specified condition.

// $pop is used to remove the first or last item from an array.

// $addToSet is used to add an item to an array only if it does not already exist in the set.
//  These operators are useful for modifying array values in a MongoDB document without overwriting the entire array.

// {
//   _id: 2,
//   item: 'XYZ123',
//   stock: 52,
//   info: { publisher: '5555', pages: 150 },
//   tags: [],
//   ratings: [ { by: 'xyz', rating: 5 } ],
//   reorder: false
// },
// {
//   _id: ObjectId('65e4ceb47c61c199f9c0b14c'),
//   item: 'kurti',
//   stock: 50
// }

use("lib");

db.books.find({ ratings: { $elemMatch: { rating: { $lt: 5 } } } });

// first ele of arr
use("lib");
db.books.updateMany(
  { ratings: { $elemMatch: { rating: { $lt: 5 } } } },
  { $set: { "ratings.$": { bycountry: 5 } } }
);

// first ele of arr
use("lib");
db.books.updateMany(
  { ratings: { $elemMatch: { rating: { $lte: 5 } } } },
  { $set: { "ratings.$.by": "shyam", "ratings.$.rating": 4 } }
);

// all ele of arr
use("lib");
db.books.updateMany(
  { ratings: { $elemMatch: { rating: { $lte: 5 } } } },
  { $set: { "ratings.$[].by": "ram", "ratings.$[].rating": 4 } }
);

// all matched ele of arr
use("lib");
db.books.updateMany(
  { ratings: { $elemMatch: { rating: { $lte: 5 } } } },
  { $set: { "ratings.$[e].by": "shyam", "ratings.$[e].rating": 4 } },
  { arrayFilters: [{ "e.rating": { $lte: 5 } }] }
);

use("lib");
db.books.updateOne(
  { item: "TBD" },
  { $push: { ratings: { by: "xyz1", rating: 5 } } }
);

use("lib");
db.books.updateOne(
  { item: "TBD" },
  { $addToSet: { ratings: { by: "xyz", rating: 5 } } }
);

// remove the element by fitered  { by: 'xyz', rating: 5 }
use("lib");
db.books.updateOne(
  { item: "TBD" },
  { $pull: { ratings: { by: "xyz", rating: 5 } } }
);

// remove the last element from arr by puttin field name : 1
use("lib");
db.books.updateOne({ item: "TBD" }, { $pop: { ratings: 1 } });

// remove the first element from arr by puttin field name : -1
use("lib");
db.books.updateOne({ item: "TBD" }, { $pop: { ratings: -1 } });

// INdexing
use("lib");
db.teachers.find({}).explain();

use("lib");
db.teachers.find({}).explain("executionStats");

use("lib");
db.teachers.find({ age: { $lt: 40 } }).explain("executionStats");

use("lib");
db.teachers.createIndex({ age: 1 });

db.teachers.getIndexes();

db.teachers.dropIndexes("age_1"); // or
db.teachers.dropIndexes({ age: 1 });

// BUCKET

use("lib");
db.teachers.aggregate([
  {
    $match: {
      gender: "male",
    },
  },
  {
    $bucket: {
      groupBy: "$age",
      boundaries: [0, 30, 40],
      default: "greater than 40",
      output: {
        count: { $sum: 1 },
      },
    },
  },
]);


use("lib");
db.teachers.aggregate([
  {
    $match: {
      gender: "male",
    },
  },
  {
    $bucket: {
      groupBy: "$age",
      boundaries: [0, 30, 40],
      default: "greater than 40",
      output: {
        count: { $sum: 1 },name:{$push: "$name"},
      },
    },
  },
]);

use("lib");
db.teachers.aggregate([{ $match: { age: { $lte: 50 } } }]);

db.teachers.aggregate([{$group:{_id:"$age", name: { $push:"$name"}}}]);

db.teachers.aggregate([{$group:{_id:"$age", name: { $push:"$$ROOT"}}}]);

db.teachers.aggregate([{$group:{_id:"$age", COUNT: { $sum:1}}}]);

db.teachers.aggregate([{$group:{_id:null, maxage: { $max:"$age"}}}]);
use("lib");
db.getCollection("books").updateMany(
  {},
  {
    $inc: { stock: -2 },
  }
);



use("lib");
db.getCollection("teachers").find({});

// db.books.insertMany([
//   { "_id": 1, "item": "TBD", "stock": 0, "info": { "publisher": "1111", "pages": 430 }, "tags": ["technology", "computer"], "ratings": [{ "by": "ijk", "rating": 4 }, { "by": "lmn", "rating": 5 }], "reorder": false },
//   { "_id": 2, "item": "XYZ123", "stock": 15, "info": { "publisher": "5555", "pages": 150 }, "tags": [], "ratings": [{ "by": "xyz", "rating": 5 }], "reorder": false }
//   ] );






//MONGO DB

// {name: 'Geeta',
//   hobbies:['walking', 'gaming', 'cooking'],
//   identity:{hasPanCard: false, hasAdharCard: true},
//   bio: 'i code and play game',
//   experience:[
//   {company:'google', duration:1},
//   {company:'paytm', duration:2},
//   ]
//   }
  
// db.students.find({hasCard: {$exist: true}})
// db.students.find({hasCard: {$exist: true, $eq: true}})
// db.students.find({hasCard: {$exist: true, $type: 8}}) //  8 or bool for type boolean 


// $expr is a MongoDB operator that allows you to use JavaScript expressions to perform queries on the database.

// $regex is a MongoDB operator that allows you to use regular expressions to perform queries on the database.

// $mod is a MongoDB operator that allows you to use modulo arithmetic in queries.

// $text is a MongoDB operator that allows you to perform full-text searches on the database.

// $jsonSchema is a MongoDB operator that allows you to validate the structure and content of documents in a collection based on a provided JSON schema.


  
//   Here's an example of how you might use the $exists operator in a find() method:
//   ```db.collection.find({ field: { $exists: true } })```
  
//   This would retrieve all documents from the collection where the field exists. You can also use $exists: false to retrieve documents where the field does not exist.
  
  
//   ```db.collection.find({ field: { $exists: true, $in: [value1, value2, value3] } })```
  
//   This would retrieve all documents from the collection where the field exists and has a value of value1, value2, or value3.
  
//   ```db.collection.find({ field: { $type: typeCode } })```
  
//   This would retrieve all documents from the collection where the field has the data type specified by typeCode.
  
//   Here are some examples of type codes that you can use with the $type operator:
  
//   1 - double
//   2 - string
//   3 - object
//   4 - array
//   5 - binary data
//   6 - undefined (deprecated)
//   7 - object id
//   8 - boolean
//   9 - date
//   10 - null
//   11 - regular expression
//   13 - javascript
//   14 - symbol
//   15 - javascript (with scope)
//   16 - 32-bit integer
//   17 - timestamp
//   18 - 64-bit integer
  
//    $inc, $min, $max, $mul, $unset, $rename & Upsert in MongoDB
  
//   $inc: The $inc operator increments the value of a field by a specified amount.
  
//   $min: The $min operator updates the value of a field if the specified value is less than the current value of the field.
  
//   $max: The $max operator updates the value of a field if the specified value is greater than the current value of the field.
  
//   $mul: The $mul operator multiplies the value of a field by a specified amount.
  
//   $unset: The $unset operator removes a specific field from a document.
  
//   $rename: The $rename operator renames a field.
  
//   Upsert: An upsert is a combination of an update and an insert operation. If a document matching the update criteria does not exist, the update operation creates a new document with the specified update criteria. If a document matching the update criteria does exist, the update operation modifies the existing document.
  
  
//   To update a nested array in MongoDB, you can use the $ operator to specify the position of the element in the array and the $set operator to specify the new value for that element
  
//   $push is an operator in MongoDB that is used to add an item or items to an array within a document.
  
//   $pull is used to remove an item or items from an array that match a specified condition.
  
//   $pop is used to remove the first or last item from an array.
  
//   $addToSet is used to add an item to an array only if it does not already exist in the set. These operators are useful for modifying array values in a MongoDB document without overwriting the entire array.
  
  

// $size is an operator in MongoDB that returns the number of elements in an array.

// $all is an operator that returns documents where the value of a field is an array that contains all the specified elements.

// $in is an operator that returns documents where the value of a field is in the specified list.

// $elemMatch is an operator that returns documents where the value of a field is an array that contains at least one element that matches the specified criteria.


use('lib')
db.inventory.insertMany( [
  { "item": "Pens", "quantity": 350, "tags": [ "school", "office" ] },
  { "item": "Erasers", "quantity": 15, "tags": [ "school", "home" ] },
  { "item": "Maps", "tags": [ "office", "storage" ] },
  { "item": "Books", "quantity": 5, "tags": [ "school", "storage", "home" ] }
] )

use('lib')
db.inventory.updateMany(
  { tags: { $in: [ "home", "school" ] } },
  { $set: { exclude: false } }
)

use('lib')
db.inventory.find({_id: ObjectId("66ca0a602d0935961e5c39f2")})

use('lib')
db.inventory.updateMany({_id: ObjectId("66ca0a602d0935961e5c39f2")},
{$push:{tags: "school"}, $set:{quantity:150}}
)


const result = await db.collection("form_test form12").aggregate([
  {
    $addFields: {
      "submittedData.CityID": { $toObjectId: "$submittedData.1738807919524-1738807919524" }
    }
  },
  {
    $lookup: {
      from: "form_form11",
      localField: "submittedData.CityID",
      foreignField: "_id",
      as: "cityData"
    }
  },
  {
    $addFields: {
      "submittedData.City Name": {
        $arrayElemAt: ["$cityData.submittedData.1738776781847-1738776781847", 0]
      }
    }
  },
  {
    $project: {
      cityData: 0,
      "submittedData.CityID": 0
    }
  }
]).toArray();

console.log(result);

db["form_test form12"].aggregate([
  {
    $addFields: {
      "submittedData.CityID": { 
        $toObjectId: "$submittedData.1738807919524-1738807919524" // 🔥 Convert String to ObjectId
      }
    }
  },
  {
    $lookup: {
      from: "form_form11", // 🔥 Lookup from the city collection
      localField: "submittedData.CityID", // 🔥 Match converted ObjectId
      foreignField: "_id", // 🔥 Match against ObjectId
      as: "cityData"
    }
  },
  {
    $addFields: {
      "submittedData.City Name": {
        $arrayElemAt: ["$cityData.submittedData.1738776781847-1738776781847", 0]
      }
    }
  },
  {
    $project: {
      cityData: 0, // 🔥 Remove extra lookup data
      "submittedData.CityID": 0 // 🔥 Remove temporary ObjectId field
    }
  }
]);