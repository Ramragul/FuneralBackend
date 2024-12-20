// server/index.js

//require("dotenv").config();
const express = require("express");
const https = require('https');
const fs = require('fs');
const cors = require("cors");
const bodyParser = require("body-parser");
var mysql = require('mysql2');
const path = require('path')  ;
const multer = require('multer');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const sharp = require('sharp');
const nodemailer = require('nodemailer');


const xlsx = require('xlsx');


// Twilio Imports 
// const twilio = require('twilio');
 const jwt = require('jsonwebtoken');
 const bcrypt = require('bcryptjs');
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


// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file naming
  },
});

//const upload = multer({ storage });

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


function mailConfig () {
const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net', 
  port: 465, 
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

return transporter;
}

// Partner ID Generation Function 

const generateNextPid = async (con) => {
  return new Promise((resolve, reject) => {
    // Get the last inserted PID from the CC_Partners table
    const query = "SELECT pid FROM CC_Partners ORDER BY pid DESC LIMIT 1";
    con.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        let lastPid = results.length > 0 ? results[0].pid : null;
        
        if (lastPid) {
          // Extract number part from last PID (e.g., P0001 -> 1)
          const lastNumber = parseInt(lastPid.substring(1));
          const nextNumber = lastNumber + 1;

          // Format the next PID with leading zeros (e.g., 1 -> P0001)
          const nextPid = `P${nextNumber.toString().padStart(4, '0')}`;
          resolve(nextPid);
        } else {
          // If no previous PID, start with P0001
          resolve('P0001');
        }
      }
    });
  });
};



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

app.post("/api/test", (req, res) => {
    //res.json({ message: "Hello from server! test path" });
    console.log("data received" + JSON.stringify(req.body))
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
  var ProductImageURL = req.body.productImageURL.join(',');
  var ProductUsageGender = req.body.productUsageGender;
  //var ProductUsageOccasion = req.body.productUsageOccasion;
  var ProductUsageOccasion = req.body.productUsageOccasion.join(',');
  var ProductOrigin = req.body.productOrigin;
  var ProductCategory = req.body.productCategory;
  //var ProductCategoryID = req.body.productCategoryID
  var ProductPriceBand = req.body.productPriceBand;
  var ProductPrice = req.body.productPrice;
  var Remarks = req.body.remarks;
  var ProductDesignDetails = req.body.productDesignDetails;
  var ProductWorkDescription = req.body.productWorkDescription;
  var ProductAlterations = req.body.productAlterations;
  var OwningAuthority = req.body.owningAuthority;
  



//   var sql = "INSERT INTO CC_ProductMaster (ProductName, ProductImageURL, ProductUsageGender, ProductUsageOccasion, ProductOrigin, ProductCategory,ProductPriceBand, ProductPrice,Remarks,ProductDesignDetails,ProductWorkDescription,ProductAlterations) VALUES ('"+ProductName+"', '"+ProductImageURL+"','"+ProductUsageGender+"','"+ProductUsageOccasion+"','"+ProductOrigin+"','"+ProductCategory+"','"+ProductPriceBand+"','"+ProductPrice+"','"+QUOTE(Remarks)+"','"+QUOTE(ProductDesignDetails)+"','"+QUOTE(ProductWorkDescription)+"','"+QUOTE(ProductAlterations)+"')";  
//   con.query(sql, function (err, result) {  
//  //  if (err) throw err;  
//  if (err) console.log(err);
//   console.log("1 record inserted");  
//   //console.log("Result"+result.data);  
//   });  

var ProductStatus = "pending"

var sql = `
    INSERT INTO CC_ProductMaster 
    (ProductName, ProductImageURL, ProductUsageGender, ProductUsageOccasion, ProductOrigin, ProductCategory, ProductPriceBand, ProductPrice, Remarks, ProductDesignDetails, ProductWorkDescription, ProductAlterations, OwningAuthority,ProductStatus) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

var values = [
    ProductName,
    ProductImageURL,
    ProductUsageGender,
    ProductUsageOccasion,
    ProductOrigin,
    ProductCategory,
    ProductPriceBand,
    ProductPrice,
    Remarks,
    ProductDesignDetails,
    ProductWorkDescription,
    ProductAlterations,
    OwningAuthority,
    ProductStatus
];

con.query(sql, values, function (err, result) {
    if (err) throw err;
    console.log("Product inserted successfully");
});
  con.end();

  res.status(201).json({ Status: "Data Upload completed Successfully" });


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
  const productType = req.query.productType;

  console.log("Category: " + category);
  console.log("Occasion: " + occasion);
  console.log("Product Type :" +productType);

  let query = 'SELECT * FROM CC_RentalProductMaster';
  let queryParams = [];



  if (category || occasion || productType) {
    query += ' WHERE';
  
    if (category) {
      query += ' ProductCategory = ?';
      queryParams.push(category);
    }
  
    if (category && (occasion || productType)) {
      query += ' AND';
    }
  
    if (occasion) {
      query += ' FIND_IN_SET(?, ProductUsageOccasion)';
      queryParams.push(occasion);
    }
  
    if (occasion && productType) {
      query += ' AND';
    }
  
    if (productType) {
      query += ' ProductType = ?';
      queryParams.push(productType);
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
   var ProductType = req.body.productType;
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
   var OwningAuthority = req.body.owningAuthority;
   
 
 
 
   var sql = "INSERT INTO CC_RentalProductMaster (ProductName,ProductType,ProductBrandName, ProductImageURL, ProductUsageGender, ProductUsageOccasion, ProductOrigin, ProductCategory,ProductPriceBand, ProductPrice,ProductPurchasePrice,ProductAvailability,Remarks, OwningAuthority) VALUES ('"+ProductName+"','"+ProductType+"','"+ProductBrandName+"', '"+ProductImageURL+"','"+ProductUsageGender+"','"+ProductUsageOccasion+"','"+ProductOrigin+"','"+ProductCategory+"','"+ProductPriceBand+"','"+ProductPrice+"','"+ProductPurchasePrice+"','"+ProductAvailability+"','"+Remarks+"', '"+OwningAuthority+"')";  
                          
   con.query(sql, function (err, result) {  
  //  if (err) throw err;  
  if (err) console.log(err);
   console.log("1 record inserted");  
   console.log("Result"+result.data);  
   });  
   con.end();
 
   res.status(201).json({ Status: "Data Upload completed Successfully" });
 
 
 } catch (error) {
   console.error('Error uploading data to AWS DB:', error);
   res.status(500).json({ error: 'Internal Server Error' });
 }

});

// Get Catalogue Categories

app.get('/api/cc/categories',(req,res) => {

  var connection = dbConnection();
  
   connection.connect();

   const productType = req.query.productType;

   console.log("Product Type value from Categories Filter " +productType)

   
     //console.log('Connected to database.' +connection);
 
     let query = 'SELECT * FROM CC_ProductCategory';
     let queryParams = [];



  if (productType) {
    query += ' WHERE';
    query += ' ProductType = ?';
    queryParams.push(productType);
  }


     connection.query (query,queryParams,(err,data) => {
       if(err) throw err;
       console.log(data)
       res.json({data})
     })
     connection.end();
     //console.log("Connection Ended ")
   });


   // CC Login 

   app.post('/login1', (req, res) => {
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
    const token = '9788875557';
  
    // Ideally, you would set a session or return a token here for subsequent authenticated requests
    res.json({ token }); // You might also return user data here
  });


  app.post('/login', (req, res) => {

    try
    {
    var con = dbConnection();
    con.connect();
    } catch (error) {
      console.error('DB Connection Error', error);
      res.status(500).json({ error: 'DB Connection Error' });
    }
    const { username, password } = req.body;

    console.log("Mobile Number :" +username)
    console.log("Passowrd : " +password);
  
    const query = 'SELECT * FROM CC_Users WHERE mobile = ?';
    con.query(query, [username], async (err, results) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ message: 'Server error' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const user = results[0];
      console.log("Password from User:" +password)
      console.log("Password from `DB:" +user.password)
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Comparison Results" +await bcrypt.compare(password, user.password))
  
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: user.id, mobile: user.mobile}, 'your-secret-key', { expiresIn: '1h' });

      // CC Partners Partner id fetch logic begins

      const pidQuery = "SELECT pid FROM CC_Partners WHERE mobile = ?";
      const mobile = user.mobile; // Example mobile number
      
      const pId = await new Promise((resolve, reject) => {
        con.query(pidQuery, [mobile], (err, results) => {
          if (err) {
            reject(err); // Handle query error
          } else if (results.length > 0) {
            resolve(results[0].pid); // Return the pid if found
          } else {
            resolve(null); // Return null if no matching record
          }
        });
      });

      console.log("Pid value is " +pId);

      // Partners Table parther id fetch logic ends
      con.end();
      res.json({ token, userName: user.name,userId: user.mobile,userEmail: user.email , pId : pId , userRole : user.role});

    });
  });

//CC Registration API 

app.post('/api/cc/register', async (req, res) => {
  console.log("Requestreceived From registration page");
  try
  {
  var con = dbConnection();
  con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
  }

  // const transporter = nodemailer.createTransport({
  //   host: 'smtpout.secureserver.net', 
  //   port: 465, 
  //   secure: true,
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });

  const transporter = mailConfig();
  const { name, mobile, email, address, city, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO CC_Users (name, mobile, email, address, city, password) VALUES (?, ?, ?, ?, ?, ?)';
  con.query(query, [name, mobile, email, address, city, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(205).json({ message: err });
    }
    con.end();
    sendRegistrationEmail(email, name);
    res.status(201).json({ message: 'User registered successfully' });
    
  });


  
  // Function to send registration email
  const sendRegistrationEmail = (userEmail, userName) => {
    // Set the correct path to the HTML template
    const templatePath = path.join(__dirname, 'emailTemplates', 'registrationEmailTemplate.html');
  
    // Read the HTML template file
    fs.readFile(templatePath, 'utf-8', (err, htmlTemplate) => {
      if (err) {
        console.error('Error reading the email template file:', err);
        return;
      }
  
      // Replace {{userName}} with the actual user's name
      const emailHtml = htmlTemplate.replace('{{userName}}', userName);
  
      // Define email options
      const mailOptions = {
        from: '"Cotton Candy Support" <support@cottoncandy.co.in>',
        to: userEmail,
        subject: 'Welcome to Cotton Candy!',
        html: emailHtml,
      };
  
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(500).json({ message: 'Failure in Email Delivery ' +error });
        } else {
          res.status(201).json({ message: 'Tailoring order placed successfully ' +info.response });
        }
      });
    });
  };
  
  // Example usage
  
});



 // Order API 

 app.post('/api/cc/order', async (req, res) => {
  const { deliveryDetails, cart, totals ,userId} = req.body;

    const connection = dbConnection();

    connection.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

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

        connection.query(deliveryQuery, deliveryValues, (err, deliveryResult) => {
            if (err) {
                return connection.rollback(() => {
                    res.status(500).json({ error: err.message });
                });
            }

            const deliveryId = deliveryResult.insertId;
            var orderDate = moment().format('YYYY-MM-DD HH:mm:ss');
            //var orderDate = new Date().toLocaleString('en-GB').replace(',', '').replace(/\//g, '-').replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1');


            // Insert order
            const orderQuery = `
                INSERT INTO CC_Orders (delivery_details_id, products_price, security_deposit, total_amount,order_date,order_status,user_id)
                VALUES (?, ?, ?, ?,?,?,?)
            `;

            const orderStatus = "Created"
            const orderValues = [
                deliveryId,
                totals.productsPrice,
                totals.securityDeposit,
                totals.totalAmount,
                //new Date().toISOString().replace('T', ' ').substring(0, 19),
                orderDate,
                orderStatus,
                userId
            ];

            connection.query(orderQuery, orderValues, (err, orderResult) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ error: err.message });
                    });
                }

                const orderId = orderResult.insertId;

                // Insert cart items
                const cartQuery = `
                    INSERT INTO CC_Order_Items (order_id, product_id, name, size, duration, delivery_date, return_date, quantity, price, image_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                let cartPromises = cart.map(item => {
                    return new Promise((resolve, reject) => {
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

                        connection.query(cartQuery, cartValues, (err) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve();
                        });
                    });
                });

                Promise.all(cartPromises)
                    .then(() => {
                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    res.status(500).json({ error: err.message });
                                });
                            }
                            res.status(201).json({ message: 'Order placed successfully' });
                        });
                    })
                    .catch((err) => {
                        connection.rollback(() => {
                            res.status(500).json({ error: err.message });
                        });
                    });
            });
        });
    });
});






// Get User Orders API 

app.get('/api/cc/user/orders', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try
  {
  var con = dbConnection();
  con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
  }

  try {
    const ordersQuery = `
      SELECT 
        o.id AS orderId, 
        o.total_amount AS total, 
        o.products_price AS productsPrice,
        o.security_deposit AS securityDeposit,
        o.order_status AS status, 
        o.order_date AS date,
        oi.id AS itemId, 
        oi.name AS itemName, 
        oi.quantity AS itemQuantity, 
        oi.price AS itemPrice,
        oi.image_url AS imageURL
      FROM CC_Orders o
      LEFT JOIN CC_Order_Items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
    `;

    const [orders] = await con.promise().query(ordersQuery, [userId]);

    // Grouping orders by orderId
    const groupedOrders = orders.reduce((acc, order) => {
      const { orderId, total, status, date, itemId, itemName, itemQuantity, itemPrice,imageURL,productsPrice,securityDeposit } = order;
      if (!acc[orderId]) {
        acc[orderId] = {
          id: orderId,
          productsPrice,
          securityDeposit,
          total,
          status,
          date,
          items: []
        };
      }
      acc[orderId].items.push({
        id: itemId,
        name: itemName,
        quantity: itemQuantity,
        price: itemPrice,
        imageURL : imageURL
      });
      return acc;
    }, {});

    const ordersArray = Object.values(groupedOrders);
    
    res.json({data : ordersArray});
    con.end;
  } catch (error) {
    con.end;
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Order Management API - Get Orders using Order Id



  app.get('/api/cc/orders', async (req, res) => {


    try
    {
    var con = dbConnection();
    con.connect();
    } catch (error) {
      console.error('DB Connection Error', error);
      res.status(500).json({ error: 'DB Connection Error' });
    }

    try {
      // Query to fetch details from CC_Orders, CC_Order_Items, CC_Delivery_Details
      const query = `
          SELECT 
              o.id AS order_id,
              o.order_date,
              o.products_price,
              o.security_deposit,
              o.total_amount,
              o.order_status,
              o.order_assignment,
              oi.product_id,
              oi.name AS product_name,
              oi.size,
              oi.duration,
              oi.delivery_date,
              oi.return_date,
              oi.quantity,
              oi.price,
              oi.image_url,
              dd.id AS delivery_id,
              dd.first_name,
              dd.last_name,
              dd.address,
              dd.city,
              dd.pincode,
              dd.email,
              dd.mobile_number,
              dd.return_address,
              dd.return_city,
              dd.return_pincode
          FROM 
              CC_Orders o
          INNER JOIN 
              CC_Order_Items oi ON o.id = oi.order_id
          LEFT JOIN 
              CC_Delivery_Details dd ON o.delivery_details_id = dd.id;
      `;

      // Get a connection from the pool
      
      
      // Execute the query using the promise-based method
      //const [orders] = await con.query(query);
      const [orders] = await con.promise().query(query);

      // Release the connection back to the pool
      con.end();

      // Send the result as a response
      res.status(200).json({data :orders});

  } catch (error) {
    con.end();
      console.error('Error fetching order details:', error);
      res.status(500).json({ error: 'Error fetching order details' });
  }

  });


  

  app.post('/api/cc/luckydraw', async (req, res) => { 

    var participationDate = moment().format('YYYY-MM-DD HH:mm:ss');

    console.log("Data Received "+JSON.stringify(req.body))

    try
    {
    var con = dbConnection();
    con.connect();
    } catch (error) {
      console.error('DB Connection Error', error);
      res.status(500).json({ error: 'DB Connection Error' });
    }
    const { userId, userName, userEmail, prize, eventType, referenceNumber, hasWon} = req.body;


    // const transporter = nodemailer.createTransport({
    //   host: 'smtpout.secureserver.net', 
    //   port: 465, 
    //   secure: true,
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });

    


  
    const query = 'INSERT INTO CC_Raffles (userId, prize, eventType, participationDate, referenceNumber,hasWon) VALUES (?, ?, ?, ?, ?,?)';
    con.query(query, [userId, prize, eventType, participationDate, referenceNumber,hasWon], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(205).json({ message: err });
      }

      if(hasWon === "true")
      {
      sendRafflesEmail(userEmail, userName);
      }
      con.end();
      res.status(201).json({ message: 'Raffles Data updated Successfully' });
    });


      // Function to send registration email
  const sendRafflesEmail = (userEmail, userName) => {
    // Set the correct path to the HTML template
    const templatePath = path.join(__dirname, 'emailTemplates', 'spinWheelLuckyDrawTemplate.html');
  
    // Read the HTML template file
    fs.readFile(templatePath, 'utf-8', (err, htmlTemplate) => {
      if (err) {
        console.error('Error reading the email template file:', err);
        return;
      }
  
      // Replace {{userName}} with the actual user's name
      // const emailHtml = htmlTemplate.replace('{{referenceNumber}}', referenceNumber);

      const emailHtml = htmlTemplate
      .replace('{{referenceNumber}}', referenceNumber)
      .replace('{{userName}}', userName);

  
      // Define email options
      const mailOptions = {
        from: '"Cotton Candy Support" <support@cottoncandy.co.in>',
        to: userEmail,
        subject: 'Congratulations! Your Lucky Draw Reference Number Inside 🎉',
        html: emailHtml,
      };
  
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(500).json({ message: 'Failure in Email Delivery ' +error });
        } else {
          res.status(201).json({ message: 'Raffles Email has been sent successfully ' +info.response });
        }
      });
    });
  };
    
  });


  // Add this endpoint to your Node.js API

  app.get('/api/cc/user/:userId/status', (req, res) => {
    let con;

    try {
        con = dbConnection();
        con.connect();
    } catch (error) {
        console.error('DB Connection Error', error);
        res.status(500).json({ error: 'DB Connection Error' });
        return; // Exit the function after sending the error response
    }

    const userId = req.params.userId; // Get the userId from the URL parameter

    console.log('Connected to database.');

    // Define the query to check if the user has won
    let query = "SELECT hasWon FROM CC_Raffles WHERE UserId = ?"; // Using parameterized query to prevent SQL injection

    con.query(query, [userId], (err, data) => {
        if (err) {
            console.error("Error executing query", err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // Check if any row has hasWon set to true
        let hasUserWon = false;

        if (data.length > 0) {
            for (let row of data) {
                if (row.hasWon === "true") {
                    hasUserWon = true;
                    break; // Exit loop if any row indicates the user has won
                }
            }
        }

        res.json({ hasWon: hasUserWon });
    });

    // End the connection
    con.end();
    console.log("Connection Ended ");
});



// Endpoint to handle tailoring booking order creation
app.post('/api/cc/tailoringOrder', async (req, res) => {
  const {
      name,
      email,
      phone,
      stitchType,
      customDesignImage, // Assuming this is a file path or some kind of identifier
      address,
      city,
      pincode,
      orderNotes,
      appointmentDate,
      userId,
      productId,
      productImageURL,
      owningAuthority,
      productPrice,
  } = req.body;

  // GMT to IST Conversion

  const appointmentDateUTC = new Date(appointmentDate);

  const appointmentDateIST = new Date(appointmentDateUTC);
  appointmentDateIST.setHours(appointmentDateIST.getHours() + 5);
  appointmentDateIST.setMinutes(appointmentDateIST.getMinutes() + 30);


var orderId = ""

  console.log("Appointment DateRECEIVED FROM FRONT END :" +JSON.stringify(req.body.appointmentDate))
  console.log("Appoinment date direct value " +appointmentDate)

  try
  {
  var con = dbConnection();
  con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
  }

  const transporter = mailConfig();

  con.beginTransaction((err) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }

      

      // Insert tailoring details
      const tailoringQuery = `
          INSERT INTO CC_Tailoring_Order_Details (name, email, phone, stitch_option, custom_design, address, city, pincode, order_notes, appointment_date,product_id,product_image_url,partner)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)
      `;
      const tailoringValues = [
          name,
          email,
          phone,
          stitchType,
          (customDesignImage.length>0) ? customDesignImage : "",
          address,
          city,
          pincode,
          orderNotes,
          appointmentDate ? moment(appointmentDateIST).format('YYYY-MM-DD HH:mm:ss') : null,
         // appointmentDate ? appointmentDate : null,
          productId,
          productImageURL,
          owningAuthority
      ];

      
      con.query(tailoringQuery, tailoringValues, (err, tailoringResult) => {
          if (err) {
              return con.rollback(() => {
                  res.status(500).json({ error: err.message });
              });
          }

          const tailoringId = tailoringResult.insertId;
          const orderDate = moment().format('YYYY-MM-DD HH:mm:ss');
          const orderStatus = "Created";

          // Insert order related to tailoring
          const orderQuery = `
              INSERT INTO CC_Tailoring_Orders (tailoring_details_id, order_date, order_status, user_id, partner,products_price)
              VALUES (?, ?, ?, ?, ?,?)
          `;

          const orderValues = [
              tailoringId,
              orderDate,
              orderStatus,
              userId,
              owningAuthority,
              productPrice
          ];

          con.query(orderQuery, orderValues, (err, orderResult) => {
              if (err) {
                  return con.rollback(() => {
                      res.status(500).json({ error: err.message });
                      con.end();
                  });
              }

              console.log("Order Results " +JSON.stringify(orderResult))
              orderId = orderResult.insertId

              con.commit((err) => {
                  if (err) {
                      return con.rollback(() => {
                          res.status(500).json({ error: err.message });
                      });
                  }

                  sendOrderConfirmationEmail(email, name);
                  res.status(201).json({ message: 'Tailoring order placed successfully' });
                  con.end();
              });
          });
      });

       // Function to send registration email
  const sendOrderConfirmationEmail = (userEmail, userName) => {
    // Set the correct path to the HTML template
    const templatePath = path.join(__dirname, 'emailTemplates', 'tailoringOrderConfirmationTemplate.html');
  
    // Read the HTML template file
    fs.readFile(templatePath, 'utf-8', (err, htmlTemplate) => {
      if (err) {
        console.error('Error reading the email template file:', err);
        return;
      }
  
      // Replace {{userName}} with the actual user's name
      // const emailHtml = htmlTemplate.replace('{{userName}}', userName);

      const emailHtml = htmlTemplate
      .replace('{{orderId}}', orderId)
      .replace('{{userName}}', userName)
      .replace('{{appointmentDate}}' , appointmentDateIST)
      .replace('{{orderDetails}}' , stitchType)
      .replace('{{userEmail}}',email)

  
      // Define email options
      const mailOptions = {
        from: '"Cotton Candy Support" <support@cottoncandy.co.in>',
        to: userEmail,
        subject: 'Tailoring Order Confirmed',
        html: emailHtml,
      };
  
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(500).json({ message: 'Failure in Email Delivery ' +error });
        } else {
          res.status(201).json({ message: 'Tailoring order placed successfully ' +info.response });
        }
      });
    });
  };
  });
 

});


// Send Email Api

app.get('/api/cc/mail', async (req, res) => { 
  // let transporter = nodemailer.createTransport({
  //   host: 'smtpout.secureserver.net', // GoDaddy SMTP server
  //   port: 465, // Use 465 for SSL, 587 for TLS
  //   secure: true, // true for 465, false for 587
  //   auth: {
  //     user: 'support@cottoncandy.co.in', // Your email address
  //     pass: "Bairava77@", // Your email password (store in environment variables)
  //   },
  // });
  



  // const mailOptions = {
  //   from: '"Cotton Candy Support" <support@cottoncandy.co.in>', // Sender address
  //   to: "iotprograms@gmail.com", // Receiver email
  //   subject: 'Welcome to Cotton Candy!', // Subject line
  //   html: `<!DOCTYPE html>
  // <html lang="en">
  // <head>
  //     <meta charset="UTF-8">
  //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //     <style>
  //         body {
  //             font-family: 'Arial', sans-serif;
  //             background-color: #f4f4f4;
  //             margin: 0;
  //             padding: 0;
  //         }
  //         .container {
  //             max-width: 600px;
  //             margin: 0 auto;
  //             background-color: #ffffff;
  //             padding: 20px;
  //             border-radius: 8px;
  //             box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  //         }
  //         .header {
  //             background-color: #ff69b4;
  //             padding: 20px;
  //             text-align: center;
  //             border-radius: 8px 8px 0 0;
  //         }
  //         .header h1 {
  //             color: #ffffff;
  //             margin: 0;
  //         }
  //         .content {
  //             padding: 20px;
  //         }
  //         .content h2 {
  //             color: #ff69b4;
  //             font-size: 24px;
  //         }
  //         .content p {
  //             color: #333;
  //             font-size: 16px;
  //             line-height: 1.5;
  //         }
  //         .content a {
  //             display: inline-block;
  //             background-color: #ff69b4;
  //             color: #ffffff;
  //             padding: 10px 20px;
  //             text-decoration: none;
  //             border-radius: 4px;
  //             margin-top: 20px;
  //         }
  //         .footer {
  //             margin-top: 30px;
  //             text-align: center;
  //             font-size: 12px;
  //             color: #777;
  //         }
  //     </style>
  // </head>
  // <body>
  //     <div class="container">
  //         <div class="header">
  //             <h1>Welcome to Cotton Candy!</h1>
  //         </div>
  //         <div class="content">
  //             <h2>Hello, User</h2>
  //             <p>
  //                 Thank you for registering with <strong>Cotton Candy</strong>. We are thrilled to have you with us on this journey of elegance and style. Our mission is to make luxury affordable, and we are excited to offer you the finest selection of clothes, jewelry, and tailoring services.
  //             </p>
  //             <p>
  //                 As a member of the Cotton Candy family, you now have access to exclusive collections and rental options for premium dresses and accessories at a fraction of the cost.
  //             </p>
  //             <a href="https://cottoncandy.co.in" target="_blank">Explore Our Collection</a>
  //         </div>
  //         <div class="footer">
  //             <p>&copy; 2024 Cotton Candy. All rights reserved.</p>
  //         </div>
  //     </div>
  // </body>
  // </html>`,
  // };
  

  
  // Send email
  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     res.status(500).json({ message: 'Error in Seding Error' });
  //   }
  //   res.status(201).json({ message: 'Email Sent Successfully' });
  // });


  // version 2 

  const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net', 
    port: 465, 
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  // Function to send registration email
  const sendRegistrationEmail = (userEmail, userName) => {
    // Set the correct path to the HTML template
    const templatePath = path.join(__dirname, 'emailTemplates', 'registrationEmailTemplate.html');
  
    // Read the HTML template file
    fs.readFile(templatePath, 'utf-8', (err, htmlTemplate) => {
      if (err) {
        console.error('Error reading the email template file:', err);
        return;
      }
  
      // Replace {{userName}} with the actual user's name
      const emailHtml = htmlTemplate.replace('{{userName}}', userName);
  
      // Define email options
      const mailOptions = {
        from: '"Cotton Candy Support" <support@cottoncandy.co.in>',
        to: userEmail,
        subject: 'Welcome to Cotton Candy!',
        html: emailHtml,
      };
  
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(500).json({ message: 'Failure in Email Delivery ' +error });
        } else {
          res.status(201).json({ message: 'Tailoring order placed successfully ' +info.response });
        }
      });
    });
  };
  
  // Example usage
  sendRegistrationEmail('iotprograms@gmail.com', 'Ramragul Balakrishnan');
 
});

app.patch('/api/orders/:orderId/update', async (req, res) => {

  const orderId = req.params.orderId;

  const {orderStatus,orderAssignment, updatedBy }= req.body;


  try
  {
  var con = dbConnection();
  con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
  }

  //const currentDate = new Date()
  

  const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

// Convert the formatted date to YYYY-MM-DD HH:MM:SS format
const [datePart, timePart] = currentDate.split(', ');
const [month, day, year] = datePart.split('/');

// Format the date as YYYY-MM-DD HH:MM:SS
const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${timePart}`;

  const query = `
  UPDATE CC_Orders 
  SET 
    order_assignment = ?, 
    order_status = ?, 
    updated_by = ?, 
    last_updated_date = ? 
  WHERE 
    id = ?;
`;

  con.query(query, [orderAssignment, orderStatus, updatedBy, formattedDate,orderId], (err, result) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(205).json({ message: err });
    }
    con.end();
    res.status(201).json({ message: 'Order Status Updated Successfully' });



  console.log("orderId :" +req.params.orderId)
  console.log("orderStatus" +orderStatus + "Order Assignment" +orderAssignment)
 
});

});


// Tailoring Order Workflow updates

app.patch('/api/tailoring/orders/:orderId/update', async (req, res) => {

  const orderId = req.params.orderId;

  const {orderStatus,orderAssignment, updatedBy }= req.body;


  try
  {
  var con = dbConnection();
  con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
  }

  //const currentDate = new Date()
  

  const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

// Convert the formatted date to YYYY-MM-DD HH:MM:SS format
const [datePart, timePart] = currentDate.split(', ');
const [month, day, year] = datePart.split('/');

// Format the date as YYYY-MM-DD HH:MM:SS
const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${timePart}`;

  const query = `
  UPDATE CC_Tailoring_Orders 
  SET 
    order_assignment = ?, 
    order_status = ?, 
    updated_by = ?, 
    last_updated_date = ? 
  WHERE 
    order_id = ?;
`;

  con.query(query, [orderAssignment, orderStatus, updatedBy, formattedDate,orderId], (err, result) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(205).json({ message: err });
    }
    con.end();
    res.status(201).json({ message: 'Order Status Updated Successfully' });



  console.log("orderId :" +req.params.orderId)
  console.log("orderStatus" +orderStatus + "Order Assignment" +orderAssignment)
 
});

});


// app.post('/api/businessPartnerRegistration', async (req, res) => {

// const {name, aadharImageURL, address , contact, email , pincode, city, state, availability,partnerType} = req.body;


// console.log("aadharImage URL :" +aadharImageURL)


// });

app.post('/api/businessPartnerRegistration', async (req, res) => {
  const { email, name, businessName, address, city, pincode, aadharImageURL, password, role, user_type, mobile, partnerType, availability } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const transporter = mailConfig();

    // Function to send registration email
    const sendRegistrationEmail = (userEmail, userName) => {
      // Set the correct path to the HTML template
      const templatePath = path.join(__dirname, 'emailTemplates', 'registrationEmailTemplate.html');
    
      // Read the HTML template file
      fs.readFile(templatePath, 'utf-8', (err, htmlTemplate) => {
        if (err) {
          console.error('Error reading the email template file:', err);
          return;
        }
    
        // Replace {{userName}} with the actual user's name
        const emailHtml = htmlTemplate.replace('{{userName}}', userName);
    
        // Define email options
        const mailOptions = {
          from: '"Cotton Candy Support" <support@cottoncandy.co.in>',
          to: userEmail,
          subject: 'Welcome to Cotton Candy!',
          html: emailHtml,
        };
    
        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            res.status(500).json({ message: 'Failure in Email Delivery ' +error });
          } else {
            res.status(201).json({ message: 'Tailoring order placed successfully ' +info.response });
          }
        });
      });
    };



  // Validate required fields

  console.log("Incoming Request:" +email + name +mobile +partnerType)
  if (!email || !name || !mobile || !partnerType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  

  try
  {
  var con = dbConnection();
  con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
  }
  
  try {
 
    // Start transaction
    await new Promise((resolve, reject) => {
      con.beginTransaction(err => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Insert into CC_Users table
    const insertUserQuery = `INSERT INTO CC_Users (email, name, address, city, password, role, user_type, mobile) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const userValues = [email, name, address, city, hashedPassword, role, user_type, mobile];

    await new Promise((resolve, reject) => {
      con.query(insertUserQuery, userValues, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // Generate unique partner ID (PID)
    // const pid = uuidv4();

        // Generate next PID in the format P0001, P0002, etc.
        const pid = await generateNextPid(con);


    // Insert into CC_Partners table with mobile as foreign key
    const insertPartnerQuery = `INSERT INTO CC_Partners (pid, mobile, partner_type, availability,address,city,pincode,business_name,id_proof) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const partnerValues = [pid, mobile, partnerType, availability,address,city,pincode,businessName,aadharImageURL];

    await new Promise((resolve, reject) => {
      con.query(insertPartnerQuery, partnerValues, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // Commit transaction
    await new Promise((resolve, reject) => {
      con.commit(err => {
        if (err) reject(err);
        else resolve();
      });
    });
    
   
    res.status(201).json({ message: 'Business partner registered successfully!', pid, mobile });
   sendRegistrationEmail(email,name);
  } catch (error) {
    // Rollback transaction in case of error
    await new Promise((resolve, reject) => {
      con.rollback(err => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.error('Error during business partner registration:', error);
    res.status(500).json({ error: 'Business partner registration failed' });

  } finally {
    con.end(); // Close the connection
  }

    

});


// app.post('/api/service/upload', async (req, res) => {
//   const { partnerId, serviceId, brandUsed, willingToTravel, rules, variants, portfolioImages } = req.body;

//   // Check for missing fields
//   if (!partnerId || !serviceId || !variants || !portfolioImages) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   try {
//     var con = dbConnection();
//     con.connect();

//     // Start transaction
//     await con.beginTransaction();

//     // Insert each variant into the CC_Service_Variants table
//     const variantInsertPromises = variants.map((variant) => {
//       const { variantName, description, price } = variant;
//       const sqlInsertVariant = `
//         INSERT INTO CC_Service_Variants 
//         (partner_id, service_id, variant_name, description, price, brand_used, willing_to_travel, policies)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//       `;
//       return con.query(sqlInsertVariant, [
//         partnerId,
//         serviceId,
//         variantName,
//         description,
//         price,
//         brandUsed,
//         willingToTravel === 'true' ? 1 : 0, // Convert to boolean
//         rules,
//       ]);
//     });

//     // Wait for all variant insertions to complete
//     await Promise.all(variantInsertPromises);

//     // Insert portfolio image into the CC_Service_Portfolio table (only one image, no loop)
//     const sqlInsertPortfolio = `
//       INSERT INTO CC_Service_Portfolio 
//       (partner_id, service_id, image_url, description)
//       VALUES (?, ?, ?, ?)
//     `;

//     // Insert concatenated portfolio images as a single string
//     await con.query(sqlInsertPortfolio, [
//       partnerId,
//       serviceId,
//       portfolioImages,  // Single concatenated string
//       '' // Optional description (empty for now)
//     ]);

//     // Commit transaction
//     await con.commit();
//     con.end();

//     res.status(200).json({ message: 'Service details uploaded successfully' });
//   } catch (error) {
//     // If an error occurs, roll back the transaction
//     if (con) await con.rollback();

//     console.error('Error during service upload:', error);
//     res.status(500).json({ error: 'Failed to upload service details' });
//   }
// });


app.post('/api/service/upload', async (req, res) => {
  const { partnerId, serviceId, brandUsed, willingToTravel, rules, variants, portfolioImages } = req.body;

  console.log("Portfolio Image URL from node" +portfolioImages)
  // Check for missing fields
  if (!partnerId || !serviceId || !variants || !portfolioImages) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    var con = dbConnection().promise();
    con.connect();

    // Start transaction
    await con.beginTransaction();

    // Insert each variant into the CC_Service_Variants table
    const variantInsertPromises = variants.map((variant) => {
      const { variantName, description, price } = variant;
      const sqlInsertVariant = `
        INSERT INTO CC_Service_Variants 
        (partner_id, service_id, variant_name, description, price, brand_used, willing_to_travel, policies)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      return con.query(sqlInsertVariant, [
        partnerId,
        serviceId,
        variantName,
        description,
        price,
        brandUsed,
        willingToTravel === 'true' ? 1 : 0, // Convert to boolean
        rules,
      ]);
    });

    // Wait for all variant insertions to complete
    await Promise.all(variantInsertPromises);

    // Prepare portfolioImages as a single string
    const portfolioImagesString = portfolioImages.toString(); // This should already be a single comma-separated string
    console.log('Portfolio Images String:', portfolioImagesString);

    // Insert portfolio images as a single string (comma-separated)
    const sqlInsertPortfolio = `
      INSERT INTO CC_Service_Portfolio 
      (partner_id, service_id, image_url, description)
      VALUES (?, ?, ?, ?)
    `;

    // Ensure portfolioImages is treated as a single string
    await con.query(sqlInsertPortfolio, [
      partnerId,
      serviceId,
      portfolioImagesString,  // This should be a single string now
      '' // Optional description (empty for now)
    ]);

    // Commit transaction
    await con.commit();
    con.end();

    res.status(200).json({ message: 'Service details uploaded successfully' });
  } catch (error) {
    // If an error occurs, roll back the transaction
    if (con) await con.rollback();

    console.error('Error during service upload:', error);
    res.status(500).json({ error: 'Failed to upload service details' });
  }
});


app.post('/api/cc/service/booking', async (req, res) => {
  const {
      name,
      email,
      phoneNumber,
      address,
      city,
      pincode,
      appointmentDate,
      serviceTime,
      remarks,
      userId,
      serviceId,
      variantId,
      bookingStatus
  } = req.body;


  // GMT to IST Conversion

  const serviceDateUTC = new Date(appointmentDate);

  const serviceDateIST = new Date(serviceDateUTC);
  serviceDateIST.setHours(serviceDateIST.getHours() + 5);
  serviceDateIST.setMinutes(serviceDateIST.getMinutes() + 30);


  const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

  // Convert the formatted date to YYYY-MM-DD HH:MM:SS format
  const [datePart, timePart] = currentDate.split(', ');
  const [month, day, year] = datePart.split('/');
  
  // Format the date as YYYY-MM-DD HH:MM:SS
  const bookingDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${timePart}`;
  



  try
  {
  var con = dbConnection();
  con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
  }

  const transporter = mailConfig();



  const query = 'INSERT INTO CC_Service_Bookings (name, contact_number, email, address, city, pincode,service_id,variant_id,service_date,service_time,user_id,booking_date,booking_status,remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  con.query(query, [name, phoneNumber, email, address, city, pincode, serviceId, variantId, serviceDateIST, serviceTime, userId, bookingDate,bookingStatus,remarks], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(205).json({ message: err });
    }

    orderId = result.insertId
    con.end();
    sendRegistrationEmail(email, name);
    res.status(201).json({ message: 'Service Booked successfully' , orderId: result.insertId});
  });

      
  // Function to send registration email
  const sendRegistrationEmail = (userEmail, userName) => {
    // Set the correct path to the HTML template
    const templatePath = path.join(__dirname, 'emailTemplates', 'serviceBookingConfirmationTemplate.html');
  
    // Read the HTML template file
    fs.readFile(templatePath, 'utf-8', (err, htmlTemplate) => {
      if (err) {
        console.error('Error reading the email template file:', err);
        return;
      }
  
      // Replace {{userName}} with the actual user's name
      const emailHtml = htmlTemplate.replace('{{userName}}', userName)
      .replace('{{orderId}}', orderId)
      .replace('{{userName}}', userName)
      .replace('{{serviceDate}}' , serviceDateIST)
      .replace('{{userEmail}}',email)
      .replace('{{serviceTime}}' , serviceTime)
      .replace('{{serviceName}}' , 'Mehendi')
      .replace('{{serviceVariantName}}' , 'Diwali Special')
  
      // Define email options
      const mailOptions = {
        from: '"Cotton Candy Support" <support@cottoncandy.co.in>',
        to: userEmail,
        subject: 'Welcome to Cotton Candy!',
        html: emailHtml,
      };
  
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(500).json({ message: 'Failure in Email Delivery ' +error });
        } else {
          res.status(201).json({ message: 'Tailoring order placed successfully ' +info.response });
        }
      });
    });
  };

});

app.get('/api/cc/tailoring/orders', async (req, res) => {
  let con;
  try {
    // Establishing a DB connection
    con = dbConnection();
    con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    return res.status(500).json({ error: 'DB Connection Error' });
  }

  try {
    // Query to fetch details from CC_Tailoring_Orders and CC_Tailoring_Order_Details
    const query = `
      SELECT 
        o.order_id,
        o.order_date,
        o.products_price,
        o.security_deposit,
        o.total_amount,
        o.order_status,
        o.user_id,
        o.order_assignment,
        tod.tailoring_id,
        tod.name,
        tod.email,
        tod.phone,
        tod.stitch_option,
        tod.custom_design,
        tod.product_image_url,
        tod.address,
        tod.city,
        tod.pincode,
        tod.order_notes,
        tod.appointment_date,
        tod.product_id
      FROM 
        CC_Tailoring_Orders o
      INNER JOIN 
        CC_Tailoring_Order_Details tod ON o.tailoring_details_id = tod.tailoring_id;
    `;

    // Execute the query using the promise-based method
    const [orders] = await con.promise().query(query);

    // Release the connection back to the pool
    con.end();

    // Send the result as a response
    res.status(200).json({ data: orders });

  } catch (error) {
    if (con) con.end();
    console.error('Error fetching tailoring order details:', error);
    res.status(500).json({ error: 'Error fetching tailoring order details' });
  }
});



// Idea Park Application API's


// app.post("/test/upload", upload.single("file"), async (req, res) => {


//   if (!req.file) {
//     return res.status(400).send({ message: "No file uploaded" });
//   }

//   console.log("Uploaded file:", req.file); 

//   let con;
//   try {
//     // Establishing a DB connection
//     con = dbConnection();
//     con.connect();
//   } catch (error) {
//     console.error('DB Connection Error', error);
//     return res.status(500).json({ error: 'DB Connection Error' });
//   }



//   const workbook = xlsx.readFile(req.file.path);
//   const sheetName = workbook.SheetNames[0];
//   const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//   const dbPromise = db.promise();

//   try {
//     for (const row of data) {
//       const { test_name, test_description, category, question_text, option_1, option_2, option_3, option_4, correct_option } = row;

//       // Step 1: Ensure the Test Exists
//       let [testResult] = await dbPromise.query(
//         "SELECT id FROM IP_Tests WHERE test_name = ?",
//         [test_name]
//       );

//       let testId;
//       if (testResult.length === 0) {
//         const [insertTestResult] = await dbPromise.query(
//           "INSERT INTO IP_Tests (test_name, description) VALUES (?, ?)",
//           [test_name, test_description]
//         );
//         testId = insertTestResult.insertId;
//       } else {
//         testId = testResult[0].id;
//       }

//       // Step 2: Insert the Question
//       const [questionResult] = await dbPromise.query(
//         "INSERT INTO IP_Questions (test_id, category, question_text) VALUES (?, ?, ?)",
//         [testId, category, question_text]
//       );
//       const questionId = questionResult.insertId;

//       // Step 3: Insert the Options
//       for (let i = 1; i <= 4; i++) {
//         await dbPromise.query(
//           "INSERT INTO IP_Options (question_id, option_text) VALUES (?, ?)",
//           [questionId, row[`option_${i}`]]
//         );
//       }

//       // Step 4: Insert the Correct Answer
//       await dbPromise.query(
//         "INSERT INTO IP_Answers (question_id, correct_option) VALUES (?, ?)",
//         [questionId, correct_option]
//       );
//     }

//     res.send({ message: "File processed and data inserted successfully!" });
//   } catch (error) {
//     console.error("Error processing file:", error);
//     res.status(500).send({ message: "An error occurred while processing the file." });
//   }

// });


// app.post("/test/upload", upload.single("file"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send({ message: "No file uploaded" });
//   }

//   console.log("Uploaded file:", req.file); // Log the file object




//   try
//   {
//   var con = dbConnection();
//   con.connect();
//   } catch (error) {
//     console.error('DB Connection Error', error);
//     res.status(500).json({ error: 'DB Connection Error' });
//   }


//   // Ensure the file buffer is available
//   if (!req.file.buffer) {
//     return res.status(400).send({ message: "File buffer is missing" });
//   }

//   // Reading and processing the Excel file directly from the buffer
//   const workbook = xlsx.read(req.file.buffer, { type: 'buffer' }); // Use buffer here
//   const sheetName = workbook.SheetNames[0];
//   const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//   const dbPromise = con.promise();

//   try {
//     for (const row of data) {
//       const { test_name test_description, category, question_text, option_1, option_2, option_3, option_4, correct_option } = row;
//       console.log("Row Values" +JSON.stringify(row))
//       console.log("Test name : "+test_name)

//       // Step 1: Ensure the Test Exists
//       let [testResult] = await dbPromise.query(
//         "SELECT id FROM IP_Tests WHERE name = ?",
//         [test_name]
//       );

//       let testId;
//       if (testResult.length === 0) {
//         const [insertTestResult] = await dbPromise.query(
//           "INSERT INTO IP_Tests (name, description) VALUES (?, ?)",
//           [test_name, test_description]
//         );
//         testId = insertTestResult.insertId;
//       } else {
//         testId = testResult[0].id;
//       }

//       // Step 2: Insert the Question
//       const [questionResult] = await dbPromise.query(
//         "INSERT INTO IP_Questions (test_id, category, question_text) VALUES (?, ?, ?)",
//         [testId, category, question_text]
//       );
//       const questionId = questionResult.insertId;

//       // Step 3: Insert the Options
//       for (let i = 1; i <= 4; i++) {
//         await dbPromise.query(
//           "INSERT INTO IP_Options (question_id, option_text) VALUES (?, ?)",
//           [questionId, row[`option_${i}`]]
//         );
//       }

//       // Step 4: Insert the Correct Answer
//       await dbPromise.query(
//         "INSERT INTO IP_Answers (question_id, correct_option) VALUES (?, ?)",
//         [questionId, correct_option]
//       );
//     }

//     res.send({ message: "File processed and data inserted successfully!" });
//   } catch (error) {
//     console.error("Error processing file:", error);
//     res.status(500).send({ message: "An error occurred while processing the file." });
//   }
// });


app.post("/test/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded" });
  }
console.log("Request received from front end" +req)
  console.log("Uploaded file:", req.file); // Log the file object

  const { testName, testCategory, testDescription, testTimings, testValidity, testStudents } = req.body;

  console.log("Test name :" +testName +"Test Category:" +testCategory)

  try {
    const con = dbConnection();
    con.connect();

    // Ensure the file buffer is available
    if (!req.file.buffer) {
      return res.status(400).send({ message: "File buffer is missing" });
    }

    // Reading and processing the Excel file directly from the buffer
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" }); // Use buffer here
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const dbPromise = con.promise();

    for (const row of data) {
      const { test_name, test_description, category, question_text, option_1, option_2, option_3, option_4, correct_option } = row;

      console.log("Processing row:", row);
      console.log("TestName inside row block :" +testName);

      // Step 1: Ensure the Test Exists
      let [testResult] = await dbPromise.query(
        "SELECT id FROM IP_Tests WHERE name = ?",
        [testName]
      );

      let testId;
      if (testResult.length === 0) {
        const [insertTestResult] = await dbPromise.query(
          "INSERT INTO IP_Tests (name, description, category, timings, validity, users) VALUES (?, ?, ?, ?, ?, ?)",
          [testName, testDescription, testCategory, testTimings, testValidity, testStudents]
        );
        testId = insertTestResult.insertId;
      } else {
        testId = testResult[0].id;
      }

      // Step 2: Insert the Question
      const [questionResult] = await dbPromise.query(
        "INSERT INTO IP_Questions (test_id, category, question_text) VALUES (?, ?, ?)",
        [testId, category, question_text]
      );
      const questionId = questionResult.insertId;

      // Step 3: Insert the Options and Collect Their IDs
      const optionIds = [];
      for (let i = 1; i <= 4; i++) {
        const [optionResult] = await dbPromise.query(
          "INSERT INTO IP_Options (question_id, option_text) VALUES (?, ?)",
          [questionId, row[`option_${i}`]]
        );
        optionIds.push(optionResult.insertId);
      }

      // Step 4: Identify the Correct Option
      const correctOptionIndex = correct_option.split("_")[1]; // Extract the index (e.g., "2" from "option_2")
      if (!correctOptionIndex || isNaN(correctOptionIndex)) {
        throw new Error(`Invalid correct_option format: "${correct_option}"`);
      }

      const correctOptionId = optionIds[parseInt(correctOptionIndex) - 1]; // Map to option array (1-based index)
      if (!correctOptionId) {
        throw new Error(`Correct option "${correct_option}" not found in options.`);
      }

      // Step 5: Insert the Correct Answer
      await dbPromise.query(
        "INSERT INTO IP_Answers (question_id, correct_option_id) VALUES (?, ?)",
        [questionId, correctOptionId]
      );
    }

    res.send({ message: "File processed and data inserted successfully!" });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send({ message: "An error occurred while processing the file." });
  }
});


app.get('/api/ip/tests', (req, res) => {
  let con;

  try {
      con = dbConnection();
      con.connect();
  } catch (error) {
      console.error('DB Connection Error', error);
      res.status(500).json({ error: 'DB Connection Error' });
      return; // Exit the function after sending the error response
  }

  //const userId = req.params.userId; // Get the userId from the URL parameter

  console.log('Connected to database.');

  // Define the query to check if the user has won
  let query = "SELECT * FROM IP_Tests"; // Using parameterized query to prevent SQL injection

  con.query(query, (err, data) => {
      // if (err) {
      //     console.error("Error executing query", err);
      //     res.status(500).json({ error: 'Internal Server Error' });
      //     return;
      // }
      if(err) throw err;
      res.json({data})

 
  });

  // End the connection
  con.end();
  console.log("Connection Ended ");
});


app.get('/api/ip/testDetails/:testId', (req, res) => {
  const { testId } = req.params;
  let con;

  try {
      // Establish database connection
      con = dbConnection();
      con.connect();
      console.log('Connected to database.');
  } catch (error) {
      console.error('DB Connection Error', error);
      res.status(500).json({ error: 'DB Connection Error' });
      return; // Exit after sending error response
  }

  // Fetch questions for the test
  const questionsQuery = `SELECT id AS questionId, category, question_text FROM IP_Questions WHERE test_id = ?`;
  con.query(questionsQuery, [testId], (err, questions) => {
      if (err) {
          console.error('Error fetching questions:', err);
          res.status(500).json({ error: 'Error fetching questions' });
          con.end();
          return;
      }

      if (questions.length === 0) {
          res.status(404).json({ message: 'No questions found for this test.' });
          con.end();
          return;
      }

      // Extract question IDs
      const questionIds = questions.map(q => q.questionId);

      // Fetch options for the questions
      const optionsQuery = `
          SELECT id AS optionId, question_id AS questionId, option_text, is_correct
          FROM IP_Options
          WHERE question_id IN (?);
      `;
      con.query(optionsQuery, [questionIds], (err, options) => {
          if (err) {
              console.error('Error fetching options:', err);
              res.status(500).json({ error: 'Error fetching options' });
              con.end();
              return;
          }

          // Map options to their respective questions
          const questionsWithOptions = questions.map(question => ({
              questionId: question.questionId,
              category: question.category,
              questionText: question.question_text,
              options: options.filter(option => option.questionId === question.questionId),
          }));

          res.status(200).json({ testId, questions: questionsWithOptions });
          con.end();
          console.log('Connection Ended');
      });
  });
});

app.post('/api/ip/register', async (req, res) => {
  console.log("Request received from registration page");
  
  const { name, mobile, email, address, city, password, userType, businessName, trainingsProvided,institute,qualifications,businessType,pincode } = req.body;

  try {
    // Establish DB connection
    var con = dbConnection();
    con.connect();

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert basic user data into CC_Users table
    const userQuery = 'INSERT INTO IP_Users (name, mobile, email, address, city, password, userType,institute,qualifications, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    con.query(userQuery, [name, mobile, email, address, city, hashedPassword, userType, institute, qualifications, pincode], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ message: 'Error inserting user' });
      }

      // If the user is a Business Partner, insert additional info into CC_Business_Partners
      if (userType === 'Business Partner') {
        const userId = result.insertId; // Get the inserted user ID
        const businessQuery = 'INSERT INTO IP_Business_Partners (user_id,mobile, businessName, businessType, trainingsProvided) VALUES (?, ?, ?, ?, ?)';
        
        con.query(businessQuery, [userId, mobile, businessName,businessType, JSON.stringify(trainingsProvided)], (err, result) => {
          if (err) {
            console.error('Error inserting business partner:', err);
            return res.status(500).json({ message: 'Error inserting business partner' });
          }

          // Send registration email to the business partner
          sendRegistrationEmail(email, name);

          // Respond with success
          res.status(201).json({ message: 'Business Partner registered successfully' });
        });
      } else {
        // If it's a candidate, just respond with success
        sendRegistrationEmail(email, name);
        res.status(201).json({ message: 'User registered successfully' });
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});

app.post('/ip/login', (req, res) => {

  try
  {
  var con = dbConnection();
  con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
  }
  const { username, password } = req.body;

  console.log("Mobile Number :" +username)
  console.log("Passowrd : " +password);

  const query = 'SELECT * FROM IP_Users WHERE mobile = ?';
  con.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    console.log("Password from User:" +password)
    console.log("Password from `DB:" +user.password)
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Comparison Results" +await bcrypt.compare(password, user.password))

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, mobile: user.mobile}, 'your-secret-key', { expiresIn: '1h' });

    // CC Partners Partner id fetch logic begins

    const pidQuery = "SELECT id FROM IP_Business_Partners WHERE mobile = ?";
    const mobile = user.mobile; // Example mobile number
    
    const pId = await new Promise((resolve, reject) => {
      con.query(pidQuery, [mobile], (err, results) => {
        if (err) {
          reject(err); // Handle query error
        } else if (results.length > 0) {
          resolve(results[0].pid); // Return the pid if found
        } else {
          resolve(null); // Return null if no matching record
        }
      });
    });

    console.log("Pid value is " +pId);

    // Partners Table parther id fetch logic ends
    con.end();
    res.json({ token, userName: user.name,userId: user.mobile,userEmail: user.email , pId : pId , userRole : user.role});

  });
});

// Function to send registration email
const sendRegistrationEmail = (userEmail, userName) => {
  const templatePath = path.join(__dirname, 'emailTemplates', 'registrationEmailTemplate.html');
  
  fs.readFile(templatePath, 'utf-8', (err, htmlTemplate) => {
    if (err) {
      console.error('Error reading the email template file:', err);
      return;
    }

    // Replace {{userName}} with the actual user's name
    const emailHtml = htmlTemplate.replace('{{userName}}', userName);

    const mailOptions = {
      from: '"Cotton Candy Support" <support@cottoncandy.co.in>',
      to: userEmail,
      subject: 'Welcome to Idea Park!',
      html: emailHtml,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failure in Email Delivery ' + error });
      } else {
        console.log('Email sent:', info.response);
      }
    });
  });
};




const options = {
  key: fs.readFileSync(path.join(__dirname,'cert', 'admee.in.key')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'admee_in.crt'))
};
const server = https.createServer(options,app);

//app.listen(PORT, () => {
  server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


