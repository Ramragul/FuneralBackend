// server/index.js

//require("dotenv").config();
const express = require("express");
const https = require('https');
const fs = require('fs');
const cors = require("cors");
const bodyParser = require("body-parser");
var mysql = require('mysql');
const path = require('path')  ;
const multer = require('multer');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
// const sharp = require('sharp');


// Twilio Imports 
// const twilio = require('twilio');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
  const dotenv = require('dotenv');

 dotenv.config();

//Send OTP Logic Begins

 //const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

 const otpStore = new Map();

// Generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Logic Ends

const PORT = process.env.PORT || 3003;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



function dbConnection () {
  console.log("PORT NUMBER" +process.env.DATABASE_PORT)
  var connection = mysql.createConnection({
  
    //host     : "smartdisplay.cj0ybsa00pzb.ap-northeast-1.rds.amazonaws.com",
    host     : process.env.DATABASE_URL,
    user     : process.env.DATABASE_USERNAME,
    password : process.env.DATABASE_PASSWORD,
    port     : process.env.DATABASE_PORT,
    database : process.env.DATABASE_NAME
  });
  return connection;
}



app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.options('*', cors());

app.get("/api/test", (req, res) => {
    res.json({ message: "Hello from server! test path" });
    console.log("Message from api test path")
  });

  app.get('/db',(req,res) => {

   var connection = dbConnection();
   
    connection.connect();

    
      console.log('Connected to database.' +connection);
  
      let query = 'SELECT * FROM GB_Partner';
      connection.query (query,(err,data) => {
        if(err) throw err;
        console.log(data)
        res.json({data})
      })
      connection.end();
      console.log("Connection Ended ")
    });

  // Icare Login Database 

  app.get('/api/login',(req,res) => {

    var connection = dbConnection();
    //var userId =  req.params['id'] 
    const userId = req.header('userId')
    const password = req.header('password')
    var verified = false;

    //console.log("UserId Value is :" +userId)
    //console.log("Password Value is :" +password)
    
     connection.connect();
 
     
       console.log('Connected to database.' +connection);
   
       let query = "SELECT * FROM Login WHERE User_Id = '"+userId+"'";
       connection.query (query,(err,data) => {
         if(err) throw err;

         if(data.length>0)
         {
        console.log("Password from DB" +data[0].User_Password)
        verified = (password == data[0].User_Password) ? true : false
         }
        res.json({"login_verified": verified})
        //res.json({data})
       })
       
       connection.end();
       console.log("Connection Ended ")
     });

     app.post('/api/login',(req,res) => {

      var connection = dbConnection();
      //var userId =  req.params['id'] 
      const userId = req.body.email
      const password = req.body.password
      var verified = false;
  
      console.log("UserId Value is :" +userId)
      //console.log("Password Value is :" +password)
      
       connection.connect();
   
       
         console.log('Connected to database.' +connection);
     
         let query = "SELECT * FROM Login WHERE User_Id = '"+userId+"'";
         connection.query (query,(err,data) => {
           if(err) throw err;
  
           if(data.length>0)
           {
          console.log("Password from DB" +data[0].User_Password)
          verified = (password == data[0].User_Password) ? true : false
           }
          res.json({"login_verified": verified})
          //res.json({data})
         })
         
         connection.end();
         console.log("Connection Ended ")
       });

      app.get('/api/experts',(req,res) => {

        var connection = dbConnection();
        //var userId =  req.params['id'] 
        //const userId = req.body.email
        //const password = req.body.password
        //var verified = false;
    
        //console.log("UserId Value is :" +userId)
        //console.log("Password Value is :" +password)
        
         connection.connect();
     
         
           console.log('Connected to database.' +connection);
       
           let query = "SELECT * FROM IC_ExpertProfile";
           connection.query (query,(err,data) => {
            if(err) throw err;
            res.json({data})
           })
           
           connection.end();
           console.log("Connection Ended ")
         });

  // GoodBye Api's Starts

  // 1) GoodBye Service Booking Api
  
  app.post("/gb/bookings", (req, res) => {
   // res.json(req)
   console.log("Received Data")
   console.log(req.body.fullName)
      //Incoming Data Extraction

      var FullName = req.body.fullName;
      var MobileNumber = req.body.mobileNumber;
      var City = req.body.city;
      var Email = req.body.email;
      var Message = req.body.message;
      var Category = req.body.category;
      var State = "Tamil Nadu";
      var Country = "India";
      var QueryDate = new Date().toISOString().split('T')[0];
      var QueryStatus = "O"


      console.log(QueryDate);
   
      // DataBase Insert Logic
   
      var con = dbConnection();
      con.connect();
      console.log('Connected to database.' +con);
   
      
     
      var sql = "INSERT INTO GB_Bookings (FullName, MobileNumber, Email, City, State, Country, Category, Message, QueryDate, QueryStatus) VALUES ('"+FullName+"', '"+MobileNumber+"','"+Email+"','"+City+"','"+State+"','"+Country+"','"+Category+"','"+Message+"','"+QueryDate+"','"+QueryStatus+"')";  
      var result = ""
      con.query(sql, function (err, result) {  
      if (err) throw err;  
      console.log("1 record inserted");  
      result = result;
      });  
      con.end();
      //res.json({ message: "Data Received Successfully" });
      console.log("DB  Message:" +result);
      res.json("Response from DB"+result);
   });

   // 2) GoodBye Funeral Ground Fetching Api

   app.get('/gb/funeralground',(req,res) => {

    var connection = dbConnection();
    
     connection.connect();
 
     
       //console.log('Connected to database.' +connection);
   
       let query = 'SELECT * FROM GB_FuneralGround';
       connection.query (query,(err,data) => {
         if(err) throw err;
         console.log(data)
         res.json({data})
       })
       connection.end();
       //console.log("Connection Ended ")
     });

   //GoodBye Api Ends
  app.post("/api/experts", (req, res) => {
   // res.json(req)
   console.log("Received Data")
   console.log(req.body.fullName)
      //Incoming Data Extraction

      var ExpertCategory = req.body.category.key;
      console.log(req.body.category.key)
      var FullName = req.body.name;
      var Age = req.body.age;
      var DOB = req.body.dob;
      var AadharNumber = req.body.aadharNumber;
      var ExpertImage = req.body.images[0];
      var AadharImage = "www.AadharImage.com";
      var City = req.body.city;
      var State = "Tamil Nadu";
      var Country = "India";
      var Address = req.body.address;
      var Pincode = req.body.pincode;
      var MobileNumber = req.body.mobileNumber
      var Email = req.body.email;
      var Message = (req.body.message) ? req.body.message : "";
      var Availability = (req.body.availability) ? req.body.availability : "NotAvailable";
      var AccountStatus = (req.body.accountStatus) ? req.body.accountStatus : "Pending";
      var EnrollmentDate = new Date().toISOString().split('T')[0];
      var LastModifiedDate = new Date().toISOString().split('T')[0];

      //console.log(QueryDate);
   
      // DataBase Insert Logic
   
      var con = dbConnection();
      con.connect();
      console.log('Connected to database.' +con);
   
      
     
      var sql = "INSERT INTO IC_ExpertProfile (ExpertCategory,FullName, Age, DOB, AadharNumber, ExpertImage, AadharImage, City, State, Country, Address, Pincode, MobileNumber, Email, Message, Availability, AccountStatus, EnrollmentDate, LastModifiedDate) VALUES ('"+ExpertCategory+"','"+FullName+"', '"+Age+"','"+DOB+"','"+AadharNumber+"','"+ExpertImage+"','"+AadharImage+"','"+City+"','"+State+"','"+Country+"','"+Address+"','"+Pincode+"','"+MobileNumber+"','"+Email+"','"+Message+"','"+Availability+"','"+AccountStatus+"','"+EnrollmentDate+"','"+LastModifiedDate+"')";  
      con.query(sql, function (err, result) {  
      if (err) throw err;  
      console.log("1 record inserted");  
      });  
      con.end();
      res.json({ message: "Data Received Successfully" });
   });

   app.post("/api/admee/addPartners", (req, res) => {
    // res.json(req)
    console.log("Received Data")
    console.log(req.body.fullName)
       //Incoming Data Extraction
 
       var FullName = req.body.fullName;
       var MobileNumber = req.body.mobileNumber;
       var City = req.body.city;
       var Email = req.body.email;
       var Remarks = req.body.message;
       var State = "Tamil Nadu";
       var Country = "India";
       var Address = req.body.address;
       var Pincode = req.body.pincode;
       var EnrollmentDate = new Date().toISOString().split('T')[0];
       var VehicleType = req.body.vehicleType;
       var VehicleNumber = req.body.vehicleNumber;
       var ExpectedAmount = req.body.expectedAmount;
      
    
       // DataBase Insert Logic
    
       var con = dbConnection();
       con.connect();
       console.log('Connected to the database.' +con);
    
       
      
       var sql = "INSERT INTO Admee_Partners (FullName, MobileNumber, Email, City, State, Country, Address, Pincode, Remarks, EnrollmentDate, VehicleType, VehicleNumber, ExpectedAmount) VALUES ('"+FullName+"', '"+MobileNumber+"','"+Email+"','"+City+"','"+State+"','"+Country+"','"+Address+"','"+Pincode+"','"+Remarks+"','"+EnrollmentDate+"','"+VehicleType+"','"+VehicleNumber+"','"+ExpectedAmount+"')";  
       con.query(sql, function (err, result) {  
      //  if (err) throw err;  
      if (err) console.log(err);
       console.log("1 record inserted");  
       });  
       con.end();
       res.json({ message: "Data Received Successfully" });
    });


    //DB TEST api

    app.get('/db/test',(req,res) => {

      var connection = dbConnection();
      
       connection.connect();
   
       
         console.log('Connected to the database.' +connection);
     
        //  let query = 'SELECT * FROM CC_RentalProductMaster';
        //  connection.query (query,(err,data) => {
        //    if(err) throw err;
        //    console.log(data)
        //    res.json({data})
        //  })
         connection.end();
         console.log("Connection Ended ")
       });


// AWS S3 Image Upload Logic Begins

// Configure AWS S3

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ,
  region: process.env.S3_REGION
});

// Configure multer for file uploads
const upload = multer();

// app.post('/aws/upload', upload.array('photos', 10), async (req, res) => {
//   try {
//     console.log('INside AWS API S3_ACCESS_KEY_ID:'+ process.env.S3_ACCESS_KEY_ID);
//     const uploadedImageURLs = [];
//     const promises = req.files.map(async (file) => {   
//       const params = {
//         Bucket: 'snektoawsbucket',
//         Key: `gb_ground/${uuidv4()}_${file.originalname}`,
//         Body: file.buffer,
//         ContentType: file.mimetype,
//         ACL: 'public-read',
//       };

//       const data = await s3.upload(params).promise();      
//       uploadedImageURLs.push(data.Location);
//     });
//     await Promise.all(promises);

//     let concatenatedString = "";
//     for (let i = 0; i < uploadedImageURLs.length; i++) {
//       concatenatedString += uploadedImageURLs[i];
//       if (i !== uploadedImageURLs.length - 1) {
//         concatenatedString += ', ';
//       }
//     }

//     console.log("Concatenated Image URLs" +concatenatedString)
//     res.status(200).json({ imageURLs: uploadedImageURLs });

//   } catch (error) {
//     console.error('Error uploading images to AWS S3:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


app.post('/aws/upload', upload.array('photos', 10), async (req, res) => {
  try {
    const uploadedImageURLs = [];

    const promises = req.files.map(async (file) => {
      // Resize and compress the image using sharp
      const resizedBuffer = await sharp(file.buffer)
        .resize(800, 800, {
          fit: sharp.fit.inside,
          withoutEnlargement: true
        })
        .toFormat('jpeg', { quality: 80 })
        .toBuffer();

      const params = {
        Bucket: 'snektoawsbucket',
        Key: `gb_ground/${uuidv4()}_${file.originalname}`,
        Body: resizedBuffer,
        ContentType: 'image/jpeg', // assuming the output is JPEG
        ACL: 'public-read',
      };

      const data = await s3.upload(params).promise();
      uploadedImageURLs.push(data.Location);
    });

    await Promise.all(promises);

    let concatenatedString = "";
    for (let i = 0; i < uploadedImageURLs.length; i++) {
      concatenatedString += uploadedImageURLs[i];
      if (i !== uploadedImageURLs.length - 1) {
        concatenatedString += ', ';
      }
    }

    console.log("Concatenated Image URLs: " + concatenatedString);
    res.status(200).json({ imageURLs: uploadedImageURLs });

  } catch (error) {
    console.error('Error uploading images to AWS S3:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// AWS S3 Image Upload Logic Ends

app.post("/gb/funeralground", (req, res) => {

      //Database Update Logic
      try
      {
      var con = dbConnection();
      con.connect();
      //console.log('Connected to database.' +con);
  
      //Data from the req parameters
  
   
      console.log("Received Request at Node End : "+JSON.stringify (req.body))
      var GroundName = req.body.groundName;
      var GroundImageURL = req.body.groundPhotos;
      var GroundPhoneNumber = req.body.groundPhoneNumber;
      var GroundWebsiteURL = req.body.groundWebsiteURL;
      var ContactPersonDesignation = req.body.contactPersonDesignation;
      var ContactPersonName = req.body.contactPersonName;
      var ContactPersonMobileNumber = req.body.contactPersonMobileNumber;
      var Email = req.body.email;
      var Taluk = req.body.taluk;
      var VillageName = req.body.villageName;
      var City = req.body.city;
      var State = req.body.state;
      var Address = req.body.address;
      var Country = req.body.country;
      var Pincode = req.body.pincode;
      var OperationalHours = req.body.operationalHours;
      var ReligionSupported = req.body.religionSupported;
      var Services = req.body.services;
      var Facilities = req.body.facilities;
      var Fees = req.body.fees;
      var Procedures = req.body.procedures;
      var Requirements = req.body.requirements;
      var UserReview = req.body.userReview;
  
  
  
      var sql = "INSERT INTO GB_FuneralGround (GroundName, GroundImageURL, GroundPhoneNumber, GroundWebsiteURL, ContactPersonDesignation, ContactPersonName, ContactPersonMobileNumber, Email, Taluk, VillageName, City, State, Country, Address,Pincode, OperationalHours, ReligionSupported, Services, Facilities, Fees, Procedures, Requirements,UserReview) VALUES ('"+GroundName+"', '"+GroundImageURL+"','"+GroundPhoneNumber+"','"+GroundWebsiteURL+"','"+ContactPersonDesignation+"','"+ContactPersonName+"','"+ContactPersonMobileNumber+"','"+Email+"','"+Taluk+"','"+VillageName+"','"+City+"','"+State+"','"+Country+"','"+Address+"','"+Pincode+"','"+OperationalHours+"','"+ReligionSupported+"','"+Services+"','"+Facilities+"','"+Fees+"','"+Procedures+"','"+Requirements+"','"+UserReview+"')";  
      con.query(sql, function (err, result) {  
     //  if (err) throw err;  
     if (err) console.log(err);
      console.log("1 record inserted");  
      console.log("Result"+result.data);  
      });  
      con.end();
  
      res.status(200).json({ Status: "Data Upload completed Successfully" });
  
  
    } catch (error) {
      console.error('Error uploading data to AWS DB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

});
app.post("/admee/partner/registration", (req, res) => {


      //Database Update Logic
      try
      {
      var con = dbConnection();
      con.connect();
      //console.log('Connected to database.' +con);
  
      //Data from the req parameters
  
   
      console.log("Received Request at Node End : "+JSON.stringify (req.body))
      var PartnerName = req.body.partnerName;
      var PartnerImageURL = req.body.partnerPhotos;
      var PartnerPhoneNumber = req.body.partnerPhoneNumber;
      var PartnerType = req.body.partnerType;
      var PartnerAdvertisementType = req.body.partnerAdvertisementType;
      var PartnerAdvertisementCategory = req.body.partnerAdvertisementCategory;
      var PartnerAvailability = req.body.partnerAvailability;
      var PartnerVehicleNumber = req.body.partnerVehicleNumber;
      var Email = req.body.email;
      var City = req.body.city;
      var State = req.body.state;
      var Address = req.body.address;
      var Country = req.body.country;
      var Pincode = req.body.pincode;
      var AreaCoverage = req.body.areaCoverage;
      var Landmark = req.body.landmark;
      var ExpectedAmount = req.body.expectedAmount;
      var Remarks = req.body.remarks;
      
  
  
  
      var sql = "INSERT INTO ADMEE_PARTNER_REGISTRATION (PartnerName, PartnerImageURL, PartnerPhoneNumber, PartnerType, PartnerAdvertisementType, PartnerAdvertisementCategory,PartnerAvailability, PartnerVehicleNumber, Email, City, State, Country, Address,Pincode, AreaCoverage, Landmark, ExpectedAmount, Remarks) VALUES ('"+PartnerName+"', '"+PartnerImageURL+"','"+PartnerPhoneNumber+"','"+PartnerType+"','"+PartnerAdvertisementType+"','"+PartnerAdvertisementCategory+"','"+PartnerAvailability+"','"+PartnerVehicleNumber+"','"+Email+"','"+City+"','"+State+"','"+Country+"','"+Address+"','"+Pincode+"','"+AreaCoverage+"','"+Landmark+"','"+ExpectedAmount+"','"+Remarks+"')";  
      con.query(sql, function (err, result) {  
     //  if (err) throw err;  
     if (err) console.log(err);
      console.log("1 record inserted");  
      console.log("Result"+result.data);  
      });  
      con.end();
  
      res.status(200).json({ Status: "Data Upload completed Successfully" });
  
  
    } catch (error) {
      console.error('Error uploading data to AWS DB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

});

// COTTON CANDY 


// Get Design Catalogue API

// app.get('/api/cc/designcatalogue',(req,res) => {

//   var connection = dbConnection();
  
//    connection.connect();

//    const category = req.query.category;

//    console.log("Category" +category)
 
//      let query = 'SELECT * FROM CC_DesignCatalogue';

//      if(category)
//      {
//       query += ' WHERE ProductCategory = ?'
//      }

//      connection.query (query,[category],(err,data) => {
//        if(err) throw err;
//        //console.log(data)
//        res.json({data})
//      })
//      connection.end();
//      //console.log("Connection Ended ")
//    });


// GET Tailoring Product Data

app.get('/api/cc/designcatalogue', (req, res) => {
  var connection = dbConnection();
  
  connection.connect();

  const category = req.query.category;
  const occasion = req.query.occasion;

  console.log("Category: " + category);
  console.log("Occasion: " + occasion);

  let query = 'SELECT * FROM CC_ProductMaster';
  let queryParams = [];

  if (category || occasion) {
    query += ' WHERE';

    if (category) {
      query += ' ProductCategory = ?';
      queryParams.push(category);
    }

    if (category && occasion) {
      query += ' AND';
    }

    if (occasion) {
      query += ' FIND_IN_SET(?, ProductUsageOccasion)';
      queryParams.push(occasion);
    }
  }

  connection.query(query, queryParams, (err, data) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ data });
  });

  connection.end();
});

// POST Tailoring Data Upload

app.post("/api/cc/designcatalogue", (req, res) => {


  //Database Update Logic
  try
  {
  var con = dbConnection();
  con.connect();
  //console.log('Connected to database.' +con);

  //Data from the req parameters


  console.log("Received Request at Node End : "+JSON.stringify (req.body))
  var ProductName = req.body.productName;
  var ProductImageURL = req.body.productImageURL;
  var ProductUsageGender = req.body.productUsageGender;
  var ProductUsageOccasion = req.body.productUsageOccasion;
  var ProductOrigin = req.body.productOrigin;
  var ProductCategory = req.body.productCategory;
  //var ProductCategoryID = req.body.productCategoryID
  var ProductPriceBand = req.body.productPriceBand;
  var ProductPrice = req.body.productPrice;
  var Remarks = req.body.remarks;
  



  var sql = "INSERT INTO CC_ProductMaster (ProductName, ProductImageURL, ProductUsageGender, ProductUsageOccasion, ProductOrigin, ProductCategory,ProductPriceBand, ProductPrice,Remarks) VALUES ('"+ProductName+"', '"+ProductImageURL+"','"+ProductUsageGender+"','"+ProductUsageOccasion+"','"+ProductOrigin+"','"+ProductCategory+"','"+ProductPriceBand+"','"+ProductPrice+"','"+Remarks+"')";  
  con.query(sql, function (err, result) {  
 //  if (err) throw err;  
 if (err) console.log(err);
  console.log("1 record inserted");  
  console.log("Result"+result.data);  
  });  
  con.end();

  res.status(200).json({ Status: "Data Upload completed Successfully" });


} catch (error) {
  console.error('Error uploading data to AWS DB:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}

});

// GET Rental Master Table Data Upload api

app.get('/api/cc/rental/product', (req, res) => {
  var connection = dbConnection();
  
  connection.connect();

  const category = req.query.category;
  const occasion = req.query.occasion;

  console.log("Category: " + category);
  console.log("Occasion: " + occasion);

  let query = 'SELECT * FROM CC_RentalProductMaster';
  let queryParams = [];

  if (category || occasion) {
    query += ' WHERE';

    if (category) {
      query += ' ProductCategory = ?';
      queryParams.push(category);
    }

    if (category && occasion) {
      query += ' AND';
    }

    if (occasion) {
      query += ' FIND_IN_SET(?, ProductUsageOccasion)';
      queryParams.push(occasion);
    }
  }

  connection.query(query, queryParams, (err, data) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ data });
  });

  connection.end();
});


// POST Rental Master Table Data Upload api 

app.post("/api/cc/rental/product/upload", (req, res) => {


   //Database Update Logic
   try
   {
   var con = dbConnection();
   con.connect();
   //console.log('Connected to database.' +con);
 
   //Data from the req parameters
 
 
   console.log("Received Request at Node End : "+JSON.stringify (req.body))
   var ProductName = req.body.productName;
   var ProductBrandName = req.body.productBrandName;
   var ProductImageURL = req.body.productImageURL;
   var ProductUsageGender = req.body.productUsageGender;
   var ProductUsageOccasion = req.body.productUsageOccasion;
   var ProductOrigin = req.body.productOrigin;
   var ProductCategory = req.body.productCategory;
   //var ProductCategoryID = req.body.productCategoryID
   var ProductPriceBand = req.body.productPriceBand;
   var ProductPrice = req.body.productPrice;
   var ProductPurchasePrice = req.body.productPurchasePrice;
   var ProductAvailability = req.body.productAvailability;
   var Remarks = req.body.remarks;
   
 
 
 
   var sql = "INSERT INTO CC_RentalProductMaster (ProductName,ProductBrandName, ProductImageURL, ProductUsageGender, ProductUsageOccasion, ProductOrigin, ProductCategory,ProductPriceBand, ProductPrice,ProductPurchasePrice,ProductAvailability,Remarks) VALUES ('"+ProductName+"','"+ProductBrandName+"', '"+ProductImageURL+"','"+ProductUsageGender+"','"+ProductUsageOccasion+"','"+ProductOrigin+"','"+ProductCategory+"','"+ProductPriceBand+"','"+ProductPrice+"','"+ProductPurchasePrice+"','"+ProductAvailability+"','"+Remarks+"')";  
                          
   con.query(sql, function (err, result) {  
  //  if (err) throw err;  
  if (err) console.log(err);
   console.log("1 record inserted");  
   console.log("Result"+result.data);  
   });  
   con.end();
 
   res.status(200).json({ Status: "Data Upload completed Successfully" });
 
 
 } catch (error) {
   console.error('Error uploading data to AWS DB:', error);
   res.status(500).json({ error: 'Internal Server Error' });
 }

});

// Get Catalogue Categories

app.get('/api/cc/categories',(req,res) => {

  var connection = dbConnection();
  
   connection.connect();

   
     //console.log('Connected to database.' +connection);
 
     let query = 'SELECT * FROM CC_ProductCategory';
     connection.query (query,(err,data) => {
       if(err) throw err;
       console.log(data)
       res.json({data})
     })
     connection.end();
     //console.log("Connection Ended ")
   });


   // CC Login 

   app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const users = [
      { username: 'Ram', password: '1234' },
      { username: 'Rahul', password: '4321' },
    ];
  
    // Simple validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
  
    // Check if user exists and password matches (replace with actual database lookup)
    const user = users.find(u => u.username === username && u.password === password);
  
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    // Mock generating a token (replace with actual token generation logic)
    const token = 'mock-access-token';
  
    // Ideally, you would set a session or return a token here for subsequent authenticated requests
    res.json({ token }); // You might also return user data here
  });

   // CC Order Creation API

   //app.post("/api/cc/order", (req, res) => {


    //Database Update Logic
    // try
    // {
    //var con = dbConnection();
    //con.connect();
    //console.log('Connected to database.' +con);
  
    //Data from the req parameters
  
  
    //console.log("Received Request at Node App: "+JSON.stringify (req.body))
    // var ProductName = req.body.productName;
    // var ProductBrandName = req.body.productBrandName;
    // var ProductImageURL = req.body.productImageURL;
    // var ProductUsageGender = req.body.productUsageGender;
    // var ProductUsageOccasion = req.body.productUsageOccasion;
    // var ProductOrigin = req.body.productOrigin;
    // var ProductCategory = req.body.productCategory;
    //var ProductCategoryID = req.body.productCategoryID
    // var ProductPriceBand = req.body.productPriceBand;
    // var ProductPrice = req.body.productPrice;
    // var ProductPurchasePrice = req.body.productPurchasePrice;
    // var ProductAvailability = req.body.productAvailability;
    // var Remarks = req.body.remarks;
    
  
  
  
    //var sql = "INSERT INTO CC_RentalProductMaster (ProductName,ProductBrandName, ProductImageURL, ProductUsageGender, ProductUsageOccasion, ProductOrigin, ProductCategory,ProductPriceBand, ProductPrice,ProductPurchasePrice,ProductAvailability,Remarks) VALUES ('"+ProductName+"','"+ProductBrandName+"', '"+ProductImageURL+"','"+ProductUsageGender+"','"+ProductUsageOccasion+"','"+ProductOrigin+"','"+ProductCategory+"','"+ProductPriceBand+"','"+ProductPrice+"','"+ProductPurchasePrice+"','"+ProductAvailability+"','"+Remarks+"')";  
                           
  //   con.query(sql, function (err, result) {  
  //  //  if (err) throw err;  
  //  if (err) console.log(err);
  //   console.log("1 record inserted");  
  //   console.log("Result"+result.data);  
  //   });  
    //con.end();
  
    //res.status(200).json({ Status: "Data Upload completed Successfully" });
  
  
  // } catch (error) {
  //   console.error('Error uploading data to AWS DB:', error);
  //   res.status(500).json({ error: 'Internal Server Error' });
  // }
 
// });


 // Order API 

 app.post('/api/cc/order', async (req, res) => {
  const { deliveryDetails, cart, totals } = req.body;

  var connection = dbConnection();
  
  //connection.connect();

  try {
      await connection.beginTransaction();

      // Insert delivery details
      const deliveryQuery = `
          INSERT INTO CC_Delivery_Details (first_name, last_name, email, mobile_number, address, landmark, city, pincode, order_notes, delivery_type, return_pickup, return_address, return_landmark, return_city, return_pincode)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const deliveryValues = [
          deliveryDetails.firstName,
          deliveryDetails.lastName,
          deliveryDetails.email,
          deliveryDetails.mobileNumber,
          deliveryDetails.address,
          deliveryDetails.landmark,
          deliveryDetails.city,
          deliveryDetails.pincode,
          deliveryDetails.orderNotes,
          deliveryDetails.deliveryType,
          deliveryDetails.returnPickup,
          deliveryDetails.returnAddress,
          deliveryDetails.returnLandmark,
          deliveryDetails.returnCity,
          deliveryDetails.returnPincode
      ];

      const [deliveryResult] = await connection.execute(deliveryQuery, deliveryValues);
      const deliveryId = deliveryResult.insertId;

      // Insert order
      const orderQuery = `
          INSERT INTO CC_Orders (delivery_id, products_price, security_deposit, total_amount)
          VALUES (?, ?, ?, ?)
      `;
      const orderValues = [
          deliveryId,
          totals.productsPrice,
          totals.securityDeposit,
          totals.totalAmount
      ];

      const [orderResult] = await connection.execute(orderQuery, orderValues);
      const orderId = orderResult.insertId;

      // Insert cart items
      const cartQuery = `
          INSERT INTO CC_Order_Items (order_id, product_id, name, size, duration, delivery_date, return_date, quantity, price, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      for (const item of cart) {
          const cartValues = [
              orderId,
              item.id,
              item.name,
              item.size,
              item.duration,
              item.deliveryDate,
              item.returnDate,
              item.quantity,
              item.price,
              item.imageURL
          ];

          await connection.execute(cartQuery, cartValues);
      }

      await connection.commit();
      res.status(201).json({ message: 'Order placed successfully' });
  } catch (error) {
      await connection.rollback();
      res.status(500).json({ error: error.message });
  } finally {
      connection.release();
  }
});






const options = {
  key: fs.readFileSync(path.join(__dirname,'cert', 'admee.in.key')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'admee_in.crt'))
};
const server = https.createServer(options,app);

//app.listen(PORT, () => {
  server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


