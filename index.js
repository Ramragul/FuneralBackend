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
const Razorpay = require("razorpay");



const xlsx = require('xlsx');

// Maths Conversion Lib

const katex = require("katex");
const { convert } = require('html-to-text');
const { JSDOM } = require("jsdom");


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




// Helper function to parse LaTeX or handle plain text - Maths
// const processMathQuestion = (questionText) => {
//   try {
//     if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
//       // LaTeX-like input detected
//       return katex.renderToString(questionText, {
//         throwOnError: false,
//       });
//     } else {
//       // Plain math question, return as is
//       return questionText;
//     }
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return questionText; // Fallback to the original text
//   }
// };

// const processMathQuestionToMathML = (questionText) => {
//   try {
//     // Look for LaTeX pattern
//     console.log("Question Text for Latex Conversion" +questionText);
//     const latexPattern = /\\[a-zA-Z]+\{[^\}]*\}/g;
//     const matches = questionText.match(latexPattern);

//     if (matches) {
//       // Process only LaTeX portions
//       let processedText = questionText;
//       matches.forEach((match) => {
//         const renderedLatex = katex.renderToString(match, { throwOnError: false });
//         processedText = processedText.replace(match, renderedLatex);
//       });
//       return processedText;
//     }
//     return questionText; // Return as is if no LaTeX
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return questionText; // Fallback to the original text
//   }
// };


//const katex = require('katex'); // Importing KaTeX for MathML conversion

// const processedQuestionTextToMathML = (questionText) => {
//   try {
//     console.log("Processing Question for MathML Conversion: " + questionText);
    
//     // LaTeX Pattern to match
//     const latexPattern = /\\[a-zA-Z]+\{[^\}]*\}/g;
//     const matches = questionText.match(latexPattern);

//     if (matches) {
//       let processedText = questionText;
//       matches.forEach((match) => {
//         // Convert LaTeX to MathML
//         const mathml = katex.renderToString(match, {
//           throwOnError: false,
//           displayMode: true,
//           output: "mathml" // Specify that the output should be MathML
//         });

//         // Replace LaTeX with MathML in the original text
//         processedText = processedText.replace(match, mathml);
//       });

//       return processedText; // Return MathML replaced text
//     }
//     return questionText; // Return as is if no LaTeX match
//   } catch (err) {
//     console.error("Error processing LaTeX to MathML:", err);
//     return questionText; // Fallback to the original text if error occurs
//   }
// };


// const processMathQuestion = (questionText) => {
//   try {
//     if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
//       // LaTeX-like input detected
//       return katex.renderToString(questionText, {
//         throwOnError: false,
//       });
//     } else {
//       // Plain math question, return as is
//       return questionText;
//     }
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return questionText; // Fallback to the original text
//   }
// };

// const extractTextFromHTML = (htmlString) => {
//   try {
//     const dom = new JSDOM(htmlString);
//     return dom.window.document.body.textContent || ""; // Extract plain text
//   } catch (err) {
//     console.error("Error extracting text from HTML:", err);
//     return ""; // Fallback to empty string on error
//   }
// };

// const extractTextFromHTML = (htmlString) => {
//   try {
//     const dom = new JSDOM(htmlString);
//     const textContent = dom.window.document.body.textContent || "";

//     // Remove duplicate entries by splitting into lines/words and deduplicating
//     const uniqueLines = [...new Set(textContent.split(/\s+/))].join(" ");
//     return uniqueLines;
//   } catch (err) {
//     console.error("Error extracting text from HTML:", err);
//     return ""; // Fallback to empty string on error
//   }
// };


// const processMathQuestion = (questionText) => {
//   try {
//     if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
//       // LaTeX-like input detected
//       const html = katex.renderToString(questionText, {
//         throwOnError: false,
//       });

//       // Extract meaningful mathematical content
//       return extractMathSymbols(html);
//     } else {
//       // Plain math question, return as is
//       return questionText;
//     }
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return questionText; // Fallback to the original text
//   }
// };

// const extractMathSymbols = (htmlString) => {
//   try {
//     const dom = new JSDOM(htmlString);

//     // Extract the MathML content
//     const mathML = dom.window.document.querySelector("math");
//     if (mathML) {
//       // Return the text content of MathML (which contains actual symbols)
//       return mathML.textContent.trim();
//     }

//     // Fallback: Extract plain text if MathML is not available
//     const textContent = dom.window.document.body.textContent || "";
//     return textContent.trim();
//   } catch (err) {
//     console.error("Error extracting math symbols from HTML:", err);
//     return ""; // Fallback to empty string on error
//   }
// };

// const processMathQuestion = (questionText) => {
//   try {
//     if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
//       // LaTeX-like input detected
//       return katex.renderToString(questionText, {
//         throwOnError: false,
//       });
//     } else {
//       // Plain math question, return as is
//       return questionText;
//     }
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return questionText; // Fallback to the original text
//   }
// };

// const extractMathSymbols = (htmlString) => {
//   try {
//     const dom = new JSDOM(htmlString);
//     const mathML = dom.window.document.querySelector("math"); // Extract MathML content
//     if (mathML) {
//       return mathML.textContent.trim(); // Return only MathML symbols
//     }

//     // Fallback: Extract plain text, avoiding duplicates
//     const textContent = dom.window.document.body.textContent || "";
//     return [...new Set(textContent.split(/\s+/))].join(" "); // Deduplicate and join
//   } catch (err) {
//     console.error("Error extracting math symbols:", err);
//     return ""; // Fallback to empty string on error
//   }
// };


// const processMathQuestion = (questionText) => {
//   try {
//     if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
//       // LaTeX-like input detected
//       const renderedHTML = katex.renderToString(questionText, {
//         throwOnError: false,
//       });

//       // Remove the LaTeX annotation from the rendered HTML
//       const mathMLContent = renderedHTML.match(/<math[^>]*>(.*?)<\/math>/);
//       if (mathMLContent) {
//         return mathMLContent[1]; // Return only the MathML content
//       }

//       return renderedHTML; // Fallback to the rendered HTML if MathML is not found
//     } else {
//       // Plain math question, return as is
//       return questionText;
//     }
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return questionText; // Fallback to the original text
//   }
// };


// const processMathQuestion = (questionText) => {
//   try {
//     if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
//       // LaTeX-like input detected, render using KaTeX without fallback
//       const renderedHtml = katex.renderToString(questionText, {
//         throwOnError: false, // Don't throw errors for invalid LaTeX
//         displayMode: false, // Use inline math rendering
//         strict: "error" // Prevent unnecessary fallback (MathML or LaTeX)
//       });
//       return renderedHtml; // Return the HTML output with math symbols
//     } else {
//       // Plain text question, return as is
//       return questionText;
//     }
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return questionText; // Fallback to the original text
//   }
// };

// const processMathQuestion = (questionText) => {
//   try {
//     if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
//       // LaTeX-like input detected, render using KaTeX without MathML and LaTeX annotations
//       const renderedHtml = katex.renderToString(questionText, {
//         throwOnError: false, // Don't throw errors for invalid LaTeX
//         displayMode: false, // Use inline math rendering
//         strict: "htmlAndMathml" // Prevent LaTeX annotation from being included
//       });
//       return renderedHtml; // Return the HTML output with math symbols
//     } else {
//       // Plain text question, return as is
//       return questionText;
//     }
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return questionText; // Fallback to the original text
//   }
// };

// const processMathQuestion = (questionText) => {
//   try {
//     if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
//       // LaTeX-like input detected, render using KaTeX without MathML and LaTeX annotations
//       const renderedHtml = katex.renderToString(questionText, {
//         throwOnError: false, // Don't throw errors for invalid LaTeX
//         displayMode: false, // Use inline math rendering
//         output: "html" // Ensure it outputs only HTML without MathML
//       });
//       return renderedHtml; // Return the HTML output with math symbols
//     } else {
//       // Plain text question, return as is
//       return questionText;
//     }
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return questionText; // Fallback to the original text
//   }
// };



// const processMathQuestion = (questionText) => {
//   try {
//     // Check if the input contains LaTeX-like syntax (e.g., \, ^, _)
//     if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
//       // LaTeX-like input detected, render using KaTeX
//       const renderedHtml = katex.renderToString(questionText, {
//         throwOnError: false, // Don't throw errors for invalid LaTeX
//         displayMode: false, // Use inline math rendering
//         output: "html" // Ensure it outputs only HTML without MathML
//       });
      
//       // Return the rendered HTML output
//       return renderedHtml;
//     } else {
//       // For plain text questions, return as is
//       return questionText;
//     }
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return questionText; // Fallback to original text if there's an error
//   }
// };




// const processMathQuestion = (questionText) => {
//   try {
//     if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
//       // LaTeX-like input detected, render using KaTeX without MathML and LaTeX annotations
//       const renderedHtml = katex.renderToString(questionText, {
//         throwOnError: false, // Don't throw errors for invalid LaTeX
//         displayMode: false, // Use inline math rendering
//         output: "html" // Ensure it outputs only HTML without MathML
//       });
//       return renderedHtml; // Return the HTML output with math symbols
//     } else {
//       // Plain text question, return as is
//       return questionText;
//     }
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return questionText; // Fallback to the original text
//   }
// };


// This version is somewat working, only one problem is repeated unpleasant notation as second value, first value is totally fine

// const processMathQuestion = (questionText) => {

//   console.log("Question Text Received for Procession is : " +questionText)
//   try {
//     if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
//       // LaTeX-like input detected, render using KaTeX
//       const renderedHtml = katex.renderToString(questionText, {
//         throwOnError: false, // Don't throw errors for invalid LaTeX
//         displayMode: true, // Use block rendering for better visibility of equations like integrals
//       });
//       return renderedHtml; // Return the HTML output with math symbols
//     } else {
//       // Plain text question, return as is
//       return questionText;
//     }
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return questionText; // Fallback to the original text
//   }
// };




// const processMathQuestion = (questionText) => {
//   try {
//     // Check for LaTeX-specific symbols to determine if the string is LaTeX-formatted
//     if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
//       // Render the LaTeX string to HTML using KaTeX
//       const renderedHtml = katex.renderToString(questionText, {
//         throwOnError: false, // Don't throw errors for invalid LaTeX
//         displayMode: true, // Display the equation in block mode
//       });
//       return renderedHtml; // Return the rendered HTML output
//     } else {
//       // If it's just plain text, return the plain text as is (but this part should not be triggered for LaTeX inputs)
//       return questionText;
//     }
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return questionText; // In case of error, just return the plain text question
//   }
// };

// const processMathQuestion = (questionText) => {
//   try {
//     // Check if the input contains LaTeX-like symbols, indicating it's a math expression
//     if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
//       // Render the LaTeX string to HTML using KaTeX
//       const renderedHtml = katex.renderToString(questionText, {
//         throwOnError: false, // Don't throw errors for invalid LaTeX
//         displayMode: true, // Use display mode (block-level rendering for equations)
//       });
//       return renderedHtml; // Return the rendered HTML
//     } else {
//       // For plain text (non-math questions), return the text as is
//       return questionText;
//     }
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return questionText; // In case of error, return the raw text
//   }
// };

// const processMathQuestion = (questionText) => {
//   try {
//     // Check if the input contains LaTeX-like symbols, indicating it's a math expression
//     if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
//       // Render the LaTeX string to HTML using KaTeX
//       const renderedHtml = katex.renderToString(questionText, {
//         throwOnError: false, // Don't throw errors for invalid LaTeX
//         displayMode: true,    // Use display mode (block-level rendering for equations)
//       });
//       return renderedHtml;  // Return only the rendered HTML
//     } else {
//       // If no LaTeX syntax found, don't process it. Return the raw text as is
//       return questionText;
//     }
//   } catch (err) {
//     console.error("Error parsing LaTeX question:", err);
//     return ""; // In case of error, return empty string (you can adjust this to handle errors as per your needs)
//   }
// };

// worked version 

const processMathQuestion = (questionText) => {
  try {
    // Check if the input contains LaTeX-like symbols
    if (questionText.includes("\\") || questionText.includes("^") || questionText.includes("_")) {
      // Attempt to render the LaTeX string to HTML using KaTeX
      const renderedHtml = katex.renderToString(questionText, {
        throwOnError: false, // Don't throw errors for invalid LaTeX
        displayMode: true,    // Use display mode (block-level rendering for equations)
        output: "mathml",
      });

      console.log("Rendered HTML after function" +renderedHtml)

      // If rendering didn't change the text, return an error message.
      if (renderedHtml === questionText) {
        throw new Error('Invalid LaTeX input');
      }

      // Return the rendered HTML (the correct formatted output)
      return renderedHtml;
    } else {
      // If no LaTeX syntax is found, return the plain text as is
      return questionText;
    }
  } catch (err) {
    console.error("Error parsing LaTeX question:", err.message);
    return `<span style="color:red;">Error: Invalid LaTeX input</span>`; // Return an error message if LaTeX is invalid
  }
};




















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

// Razor Pay Function 

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function getPaymentSource(paymentId) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment.method;  // Example: 'upi', 'card', 'netbanking', 'wallet'
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return null;
  }
}
// razor pay function to fetch payment source







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
      var Caste = req.body.caste;
      var Religion = req.body.religion;


      console.log(QueryDate);
   
      // DataBase Insert Logic
   
      var con = dbConnection();
      con.connect();
      console.log('Connected to database.' +con);
   
      
     
      var sql = "INSERT INTO GB_Bookings (FullName, MobileNumber, Email, City, State, Country, Category, Message, QueryDate, QueryStatus,Religion,Caste) VALUES ('"+FullName+"', '"+MobileNumber+"','"+Email+"','"+City+"','"+State+"','"+Country+"','"+Category+"','"+Message+"','"+QueryDate+"','"+QueryStatus+"','"+Religion+"','"+Caste+"')";  
      var result = ""
      con.query(sql, function (err, result) {  
      if (err) throw err;  
      console.log("1 record inserted");  
      result = result;
      });  
      con.end();
      //res.json({ message: "Data Received Successfully" });
      console.log("DB  Message:" +result);
      res.status(201).json("Response from DB"+result);
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
                INSERT INTO CC_Orders (delivery_details_id, products_price, security_deposit, total_amount,order_date,order_status,user_id,payment_type)
                VALUES (?, ?, ?, ?,?,?,?,?)
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
                userId,
                deliveryDetails.paymentType
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
                            res.status(201).json({ message: "Order Created Successfully",order_id: orderId});
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


// update orders

app.post('/api/cc/order/:orderId/payment', async (req, res) => {
  const { paymentId,paymentScenario} = req.body;
  const {orderId} = req.params;

  console.log("ORdert Id " +orderId);
  console.log("Payment Id" +paymentId);

  // const formatDateForIST = (date) => {
  //   const options = { timeZone: 'Asia/Kolkata', hour12: false };
  //   return new Intl.DateTimeFormat('en-GB', options).format(date);
  // };

  //const currentDate = formatDateForIST(new Date());
  //const currentDate= new Date();

  // const getCurrentDateInIST = () => {
  //   const date = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
  //   return date;
  // };

  const getCurrentDateInIST = () => {
    const date = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
    
    // Convert it to MySQL datetime format: YYYY-MM-DD HH:mm:ss
    const [datePart, timePart] = date.split(', ');
    const [day, month, year] = datePart.split('/');
    
    const formattedDate = `${year}-${month}-${day} ${timePart}`;
    
    return formattedDate;
  };
  
  const paymentDate =  getCurrentDateInIST ()
  console.log("Payment Date 1 :" +getCurrentDateInIST());
  console.log("Payment Date 2 :"+paymentDate);
  

  var institute =""
var paymentSource = ""

  if(paymentId)
    {
      paymentSource = await getPaymentSource(paymentId);
      console.log("Payment Source" +paymentSource);
    }

  
  let con;

  try {
    // Establish the DB connection
    con = dbConnection();
    con.connect();
  } catch (error) {
    console.error('DB Connection Error:', error);
    return res.status(500).json({ error: 'DB Connection Error' });
  }

  try {
    var updateQuery;

    if(paymentScenario === 'tailoring')
{
     updateQuery = `
      UPDATE CC_Tailoring_Orders 
      SET 
        payment_status = ?, 
        payment_source = ?, 
        payment_id = ? ,
        payment_date = ?
      WHERE order_id = ?
    `;

} else {
   updateQuery = `
  UPDATE CC_Orders 
  SET 
    payment_status = ?, 
    payment_source = ?, 
    payment_id = ? ,
    payment_date = ?
  WHERE id = ?
`;
}

    const values = ['PAID', paymentSource, paymentId, paymentDate, orderId];

    con.query(updateQuery, values, (err, result) => {
      if (err) {
        console.error('Error updating order:', err);
        return res.status(500).json({ error: 'Database update failed' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      console.log(`Order ${orderId} updated successfully.`);
      return res.status(200).json({ message: 'Order updated successfully', orderId });
    });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal server error' });

  } finally {
    if (con) con.end();
  
  }

  console.log('Connected to database.');

})





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
      paymentType,
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
              INSERT INTO CC_Tailoring_Orders (tailoring_details_id, order_date, order_status, user_id, partner,products_price,payment_type)
              VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          const orderValues = [
              tailoringId,
              orderDate,
              orderStatus,
              userId,
              owningAuthority,
              productPrice,
              paymentType
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
                  console.log("Order_Id :" +orderId )
                  res.status(201).json({ message: 'Tailoring order placed successfully', order_id: orderId});
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
          res.status(201).json({ message: 'Tailoring order placed successfully ' +info.response , order_id: orderId });
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

// API TO REGISTER Business Partners

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
  const { partnerId, serviceId, brandUsed, willingToTravel, paymentPolicy, refundPolicy, finalPaymentDueOn, variants, portfolioImages } = req.body;

  console.log("Final Payment Due on " +finalPaymentDueOn)
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
        refundPolicy,
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

    //  Insert into payment rules table

    const paymentQuery = `
    INSERT INTO CC_Service_Payment_Rules (partner_id,service_id, advance_percentage, remaining_due_on, refund_policy)
    VALUES (?, ?, ?, ?, ?)
  `;
  const paymentValues = [partnerId, serviceId, paymentPolicy, finalPaymentDueOn, refundPolicy];

  await con.query(paymentQuery, paymentValues);

    // Insert into payment rules table

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


// API to return service users, variant etc

// app.get('/api/cc/service/variants', async (req, res) => {
//   let con;
//   try {
//     // Establishing a DB connection
//     con = dbConnection();
//     con.connect();
//   } catch (error) {
//     console.error('DB Connection Error', error);
//     return res.status(500).json({ error: 'DB Connection Error' });
//   }

//   const { partner_id, service_id } = req.query;
//   if (!service_id) {
//     return res.status(400).json({ error: 'service_id is required' });
//   }

//   try {
//     // Query to fetch all partners offering the given service
//     const partnersQuery = `
//       SELECT p.pid, p.business_name, p.mobile, p.address, p.city, p.pincode, 
//              p.partner_type, p.availability, p.registration_date, p.id_proof
//       FROM CC_Partners p
//       JOIN CC_Service_Variants sv ON p.pid = sv.partner_id
//       WHERE sv.service_id = ?
//       GROUP BY p.pid;
//     `;
//     const [partners] = await con.promise().query(partnersQuery, [service_id]);

//     if (partner_id) {
//       // Query to fetch service variants of a specific partner for a given service
//       const variantsQuery = `
//         SELECT variant_id, partner_id, service_id, variant_name, description, price, 
//                brand_used, willing_to_travel, policies, created_at
//         FROM CC_Service_Variants
//         WHERE partner_id = ? AND service_id = ?;
//       `;
//       const [variants] = await con.promise().query(variantsQuery, [partner_id, service_id]);
//       return res.json({ partner_id, service_id, variants });
//     }

//     res.json({ service_id, partners });
//   } catch (error) {
//     console.error('Error fetching service partners or variants:', error);
//     res.status(500).json({ error: 'Error fetching service partners or variants' });
//   } finally {
//     if (con) con.end();
//   }
// });


// Api to fetch all available services 

app.get('/api/cc/services', async (req, res) => {
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
    // Query to fetch all partners offering the given service along with their portfolio images
    const partnersQuery = `
      SELECT service_id ,service_name,service_image from CC_Services
    `;
    const [services] = await con.promise().query(partnersQuery);

    res.json({data:{ services }});
  } catch (error) {
    console.error('Error fetching services::', error);
    res.status(500).json({ error: 'Error fetching services ' });
  } finally {
    if (con) con.end();
  }
});



// To fetch Service details and variantas based on service id and variant details based on variant id of that particular service
app.get('/api/cc/service/variants', async (req, res) => {
  let con;
  try {
    // Establishing a DB connection
    con = dbConnection();
    con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    return res.status(500).json({ error: 'DB Connection Error' });
  }

  const { partner_id, service_id } = req.query;
  if (!service_id) {
    return res.status(400).json({ error: 'service_id is required' });
  }

  try {
    // Query to fetch all partners offering the given service along with their portfolio images
    const partnersQuery = `
      SELECT p.pid, p.business_name, p.mobile, p.address, p.city, p.pincode, 
             p.partner_type, p.availability, p.registration_date, p.id_proof, 
             sp.image_url
      FROM CC_Partners p
      JOIN CC_Service_Variants sv ON p.pid = sv.partner_id
      LEFT JOIN CC_Service_Portfolio sp ON p.pid = sp.partner_id AND sv.service_id = sp.service_id
      WHERE sv.service_id = ?
      GROUP BY p.pid;
    `;
    const [partners] = await con.promise().query(partnersQuery, [service_id]);

    if (partner_id) {
      // Query to fetch service variants of a specific partner for a given service
      const variantsQuery = `
        SELECT variant_id, partner_id, service_id, variant_name, description, price, 
               brand_used, willing_to_travel, policies, created_at
        FROM CC_Service_Variants
        WHERE partner_id = ? AND service_id = ?;
      `;
      const [variants] = await con.promise().query(variantsQuery, [partner_id, service_id]);
      //return res.json({ partner_id, service_id, variants });
      return res.json({data:{ partner_id, service_id, variants }});
    }

    res.json({data:{ service_id, partners }});
  } catch (error) {
    console.error('Error fetching service partners or variants:', error);
    res.status(500).json({ error: 'Error fetching service partners or variants' });
  } finally {
    if (con) con.end();
  }
});

// Api for fetching services and corresponding varinat - partner perspective 

app.get('/api/cc/partner/services', async (req, res) => {
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
    // Extracting partner_id from query parameters
    const { partner_id } = req.query;
    if (!partner_id) return res.status(400).json({ error: 'Partner ID is required' });

    // Fetch unique services created by the partner
    const servicesQuery = `
      SELECT DISTINCT sv.service_id, s.service_name, s.service_image 
      FROM CC_Service_Variants sv 
      JOIN CC_Services s ON sv.service_id = s.service_id 
      WHERE sv.partner_id = ?
    `;
    const [services] = await con.promise().query(servicesQuery, [partner_id]);

    for (let service of services) {
      // Fetch portfolio images
      const portfolioQuery = `
        SELECT image_url FROM CC_Service_Portfolio 
        WHERE partner_id = ? AND service_id = ?
      `;
      const [portfolio] = await con.promise().query(portfolioQuery, [partner_id, service.service_id]);
      service.portfolio_images = portfolio.map(p => p.image_url);

      // Fetch service variants (pricing, duration, etc.)
      const variantsQuery = `
        SELECT variant_id, variant_name, price, description 
        FROM CC_Service_Variants 
        WHERE partner_id = ? AND service_id = ?
      `;
      const [variants] = await con.promise().query(variantsQuery, [partner_id, service.service_id]);
      service.variants = variants; // Adding variants details to the response
    }

    res.json({ data: { services } });
  } catch (error) {
    console.error('Error fetching partner services:', error);
    res.status(500).json({ error: 'Error fetching partner services' });
  } finally {
    if (con) con.end();
  }
});


// Api to modify parnter service details - By Partner

app.post('/api/cc/partner/services', async (req, res) => {

  console.log("data Received from partner service is :" +JSON.stringify(req.body))

});


// mehendi service booking
app.post('/api/cc/mehendi/service/booking', async (req, res) => {
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


// Generic Service Booking Starts

// app.post('/api/cc/service/booking', async (req, res) => {
//   const {
//     serviceId,
//     serviceType,
//     partnerId,
//     partnerName,
//     clientName,
//     userId,
//     selectedVariantName,
//     selectedVariantPrice,
//     selectedVariantId,
//     serviceDate,
//     serviceTime,
//     eventDate,
//     eventTime,
//     eventType,
//     address,
//     pincode,
//     city,
//     contactNumber,
//     email,
//     orderNotes
//   } = req.body;

//   // Validation: Check for required fields
//   // if (!serviceId || !partnerId || !clientName || !userId || !selectedVariantId || !serviceDate || !serviceTime || !eventDate || !eventTime || !address || !pincode || !city || !contactNumber || !email) {
//   //   return res.status(400).json({ error: 'Missing required fields' });
//   // }

//   try {
//     var con = dbConnection();
//     con.connect();
//   } catch (error) {
//     console.error('DB Connection Error', error);
//     con.end();
//     return res.status(500).json({ error: 'DB Connection Error' });
//   }

//   try {
//     const bookingDate = new Date().toISOString().split('T')[0]; // Current date
//     const bookingStatus = 'Pending'; // Default status
//     const query = `
//       INSERT INTO CC_Service_Bookings 
//         (name, address, pincode, contact_number, email, city, user_id, service_id,service_type, variant_id, 
//          partner_id, partner_business_name, service_date, service_time, event_date, event_time, 
//          booking_date, total_price, booking_status, order_notes) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const values = [
//       clientName, address, pincode, contactNumber, email, city, userId, serviceId,serviceType, selectedVariantId,
//       partnerId, partnerName, serviceDate.split('T')[0], serviceTime, eventDate.split('T')[0], eventTime,
//       bookingDate, selectedVariantPrice, bookingStatus, orderNotes
//     ];

//     con.query(query, values, (err, result) => {
//       con.end(); // Close DB connection
//       if (err) {
//         console.error('Error inserting booking:', err);
//         return res.status(500).json({ error: 'Database Insertion Failed' });
//       }
//       res.status(201).json({ message: 'Booking successful', bookingId: result.insertId });
//     });

//   } catch (error) {
//     console.error('Server error:', error);
//     con.end();
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// Version 2 :

app.post('/api/cc/service/booking', async (req, res) => {
  const {
    serviceId,
    serviceType,
    partnerId,
    partnerName,
    clientName,
    userId,
    selectedVariantName,
    selectedVariantPrice,
    selectedVariantId,
    serviceDate,
    serviceTime,
    eventDate,
    eventTime,
    eventType,
    address,
    pincode,
    city,
    contactNumber,
    email,
    orderNotes
  } = req.body;

  try {
    var con = dbConnection();
    con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    return res.status(500).json({ error: 'DB Connection Error' });
  }

  try {
    const bookingDate = new Date().toISOString().split('T')[0];
    const bookingStatus = 'Pending';

    // Fetch partner's payment rule
    const [paymentRule] = await con.promise().query(
      `SELECT advance_percentage FROM CC_Service_Payment_Rules WHERE partner_id = ? AND service_id = ?`,
      [partnerId, serviceId]
    );

    let advancePercentage = paymentRule.length > 0 ? paymentRule[0].advance_percentage : 0;
    let advanceAmount = (selectedVariantPrice * advancePercentage) / 100;
    let remainingAmount = selectedVariantPrice - advanceAmount;

    // Insert Booking
    const bookingQuery = `
      INSERT INTO CC_Service_Bookings 
        (name, address, pincode, contact_number, email, city, user_id, service_id, service_type, variant_id, 
         partner_id, partner_business_name, service_date, service_time, event_date, event_time, 
         booking_date, total_price, booking_status, order_notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const bookingValues = [
      clientName, address, pincode, contactNumber, email, city, userId, serviceId, serviceType, selectedVariantId,
      partnerId, partnerName, serviceDate.split('T')[0], serviceTime, eventDate.split('T')[0], eventTime,
      bookingDate, selectedVariantPrice, bookingStatus, orderNotes
    ];
    
    const [bookingResult] = await con.promise().query(bookingQuery, bookingValues);
    const bookingId = bookingResult.insertId;

    // Insert Payment Record
    const paymentQuery = `
      INSERT INTO CC_Service_Payments (booking_id, user_id, partner_id,service_id, total_amount, advance_amount, remaining_amount, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?,?)
    `;
    const paymentValues = [bookingId, userId, partnerId, serviceId, selectedVariantPrice, advanceAmount, remainingAmount, 'Pending'];

    await con.promise().query(paymentQuery, paymentValues);

    con.end();
    res.status(201).json({ message: 'Booking successful', bookingId, advanceAmount, remainingAmount });

  } catch (error) {
    console.error('Server error:', error);
    con.end();
    res.status(500).json({ error: 'Server error' });
  }
});



// Generic Service Booking Ends

// Generic Service Booking Payment handling api

app.post('/api/cc/service/payment', async (req, res) => {
  const { bookingId, paymentAmount } = req.body;

  try {
    var con = dbConnection();
    con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    return res.status(500).json({ error: 'DB Connection Error' });
  }

  try {
    // Get current payment details
    const [payment] = await con.promise().query(
      `SELECT remaining_amount, advance_paid FROM CC_Service_Payments WHERE booking_id = ?`,
      [bookingId]
    );

    if (!payment.length) {
      return res.status(400).json({ error: 'Booking not found' });
    }

    let remainingAmount = payment[0].remaining_amount - paymentAmount;
    let newPaymentStatus = remainingAmount <= 0 ? 'Completed' : 'Pending';

    // Update payment record
    await con.promise().query(
      `UPDATE CC_Service_Payments SET remaining_amount = ?, payment_status = ? WHERE booking_id = ?`,
      [remainingAmount, newPaymentStatus, bookingId]
    );

    con.end();
    res.status(200).json({ message: 'Payment updated successfully', remainingAmount, paymentStatus: newPaymentStatus });

  } catch (error) {
    console.error('Payment update error:', error);
    con.end();
    res.status(500).json({ error: 'Payment update failed' });
  }
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


// version 1 :Test Upload WOrking version  commented for latex enhancement 

// app.post("/test/upload", upload.single("file"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send({ message: "No file uploaded" });
//   }
// console.log("Request received from front end" +req)
//   console.log("Uploaded file:", req.file); // Log the file object

//   const { testName, testCategory, testDescription, testTimings, testValidity, testStudents,createdBy } = req.body;
//   console.log("Test name :" +testName +"Test Validity:" +testValidity)



// const formatDateForMySQL = (date) => {
//   if (!date || isNaN(new Date(date).getTime())) {
//     // If the date is invalid, return an empty string
//     return '2099-12-31';
//   }
//   const isoString = new Date(date).toISOString();
//   return isoString.split('T')[0]; // Returns only the 'YYYY-MM-DD' part
// };

// let formattedTestValidity = '';

// if (testValidity) {
//   formattedTestValidity = formatDateForMySQL(testValidity);
// }

  

//   try {
//     const con = dbConnection();
//     con.connect();

//     // Ensure the file buffer is available
//     if (!req.file.buffer) {
//       return res.status(400).send({ message: "File buffer is missing" });
//     }

//     // Reading and processing the Excel file directly from the buffer
//     const workbook = xlsx.read(req.file.buffer, { type: "buffer" }); // Use buffer here
//     const sheetName = workbook.SheetNames[0];
//     const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     const dbPromise = con.promise();

//     for (const row of data) {
//       const { test_name, test_description, category, question_text, option_1, option_2, option_3, option_4, correct_option,rewarded_marks } = row;

//       console.log("Processing row:", row);
//       console.log("TestName inside row block :" +testName);

//       // Step 1: Ensure the Test Exists
//       let [testResult] = await dbPromise.query(
//         "SELECT id FROM IP_Tests WHERE name = ?",
//         [testName]
//       );

//       let testId;
//       if (testResult.length === 0) {
//         const [insertTestResult] = await dbPromise.query(
//           "INSERT INTO IP_Tests (name, description, category, timings, validity, status,created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
//           [testName, testDescription, testCategory, testTimings, formattedTestValidity, 'active',createdBy]
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

//       // Step 3: Insert the Options and Collect Their IDs
//       const optionIds = [];
//       for (let i = 1; i <= 4; i++) {
//         const [optionResult] = await dbPromise.query(
//           "INSERT INTO IP_Options (question_id, option_text) VALUES (?, ?)",
//           [questionId, row[`option_${i}`]]
//         );
//         optionIds.push(optionResult.insertId);
//       }

//       // Step 4: Identify the Correct Option
//       const correctOptionIndex = correct_option.split("_")[1]; // Extract the index (e.g., "2" from "option_2")
//       if (!correctOptionIndex || isNaN(correctOptionIndex)) {
//         throw new Error(`Invalid correct_option format: "${correct_option}"`);
//       }

//       const correctOptionId = optionIds[parseInt(correctOptionIndex) - 1]; // Map to option array (1-based index)
//       if (!correctOptionId) {
//         throw new Error(`Correct option "${correct_option}" not found in options.`);
//       }

//       // Step 5: Insert the Correct Answer
//       await dbPromise.query(
//         "INSERT INTO IP_Answers (question_id, correct_option_id,rewarded_marks) VALUES (?, ?,?)",
//         [questionId, correctOptionId,rewarded_marks]
//       );
//     }

//     res.status(201).send({ message: "File processed and data inserted successfully!" });
//   } catch (error) {
//     console.error("Error processing file:", error);
//     res.status(500).send({ message: "An error occurred while processing the file." });
//   }
// });


// Version 2 : This version stores the latex converted values as html in db - Working Code

// app.post("/test/upload", upload.single("file"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send({ message: "No file uploaded" });
//   }
  
//   const { testName, testCategory, testDescription, testTimings, testValidity, testStudents, createdBy } = req.body;

//   const formatDateForMySQL = (date) => {
//     if (!date || isNaN(new Date(date).getTime())) {
//       return "2099-12-31";
//     }
//     const isoString = new Date(date).toISOString();
//     return isoString.split("T")[0];
//   };

//   let formattedTestValidity = testValidity ? formatDateForMySQL(testValidity) : "";

//   try {
//     const con = dbConnection();
//     con.connect();

//     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     const dbPromise = con.promise();

//     for (const row of data) {
//       const {
//         test_name,
//         test_description,
//         category,
//         question_text,
//         option_1,
//         option_2,
//         option_3,
//         option_4,
//         correct_option,
//         rewarded_marks,
//         subject,
//       } = row;

//       // Process question_text if subject is math
//       // const processedQuestionText = subject === "maths"
//       //   ? processMathQuestion(question_text)
//       //   : question_text;

//       // const processedQuestionText = subject === "maths"
//       // ?convert(processMathQuestion(question_text),{wordwrap:false})
//       // : question_text;

//       // const processedQuestionText = subject === "maths"
//       // ? convert(processMathQuestion(question_text),{wordwrap:false})
//       // : question_text;

//       //  const processedQuestionText = subject === "maths"
//       //  ? convert(processMathQuestionToMathML(question_text), { wordwrap: false })
//       //  : question_text;

//       // const processedQuestionText = subject === "maths"
//       // ? processMathQuestionToMathML(question_text)
//       // : question_text;

//       // const processedQuestionText = subject === "maths"
//       //   ? extractTextFromHTML(processMathQuestion(question_text))
//       //   : question_text;

//     //   const processedQuestionText = subject === "maths"
//     //   ? processMathQuestion(question_text)
//     //  : question_text;
      
//      // Process question text
//       // const processedQuestionText = subject === "maths"
//       // ? extractMathSymbols(processMathQuestion(question_text))
//       // : question_text;

//       // console.log(processedQuestionText);

//       const processedQuestionText = subject === "maths"
//       ? processMathQuestion(question_text) // Only return the MathML or rendered HTML 
//       : question_text;

//     //console.log(processedQuestionText);

      
      

//       // Insert test details if not exists
//       let [testResult] = await dbPromise.query(
//         "SELECT id FROM IP_Tests WHERE name = ?",
//         [testName]
//       );

//       let testId;
//       if (testResult.length === 0) {
//         const [insertTestResult] = await dbPromise.query(
//           "INSERT INTO IP_Tests (name, description, category, timings, validity, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
//           [testName, testDescription, testCategory, testTimings, formattedTestValidity, "active", createdBy]
//         );
//         testId = insertTestResult.insertId;
//       } else {
//         testId = testResult[0].id;
//       }

//       // Insert the question
//       const [questionResult] = await dbPromise.query(
//         "INSERT INTO IP_Questions (test_id, category, question_text) VALUES (?, ?, ?)",
//         [testId, category, processedQuestionText]
//       );
//       const questionId = questionResult.insertId;

//       // Insert options and identify the correct one
//       const optionIds = [];
//       for (let i = 1; i <= 4; i++) {
//         const [optionResult] = await dbPromise.query(
//           "INSERT INTO IP_Options (question_id, option_text) VALUES (?, ?)",
//           [questionId, row[`option_${i}`]]
//         );
//         optionIds.push(optionResult.insertId);
//       }

//       const correctOptionIndex = correct_option.split("_")[1];
//       const correctOptionId = optionIds[parseInt(correctOptionIndex) - 1];

//       await dbPromise.query(
//         "INSERT INTO IP_Answers (question_id, correct_option_id, rewarded_marks) VALUES (?, ?, ?)",
//         [questionId, correctOptionId, rewarded_marks]
//       );
//     }

//     res.status(201).send({ message: "File processed and data inserted successfully!" });
//   } catch (error) {
//     console.error("Error processing file:", error);
//     res.status(500).send({ message: "An error occurred while processing the file." });
//   }
// });


// Version 3 : Enhancement of version 2 : support multiple test creation mode. excel , ui etc

app.post("/test/upload", upload.single("file"), async (req, res) => {
  const {
    testName,
    testCategory,
    testDescription,
    testTimings,
    testValidity,
    testStudents,
    createdBy,
    questions, // New field for manual test creation
  } = req.body;



  const formatDateForIST = (date) => {
    if (!date || isNaN(new Date(date).getTime())) {
      return "2099-12-31"; // Default fallback date
    }
    
    // Convert the date to IST timezone
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const istDate = new Date(new Date(date).getTime() + istOffset);
    
    // Format the date as YYYY-MM-DD
    return istDate.toISOString().split("T")[0];
  };
  

  console.log("Received validity date" +testValidity);

  let formattedTestValidity = (testValidity === "" || testValidity === undefined || testValidity === null)  ? "2099-12-31" : formatDateForIST(testValidity);

  console.log("Formatted validity date" +formattedTestValidity)

  try {
    const con = dbConnection();
    con.connect();
    const dbPromise = con.promise();

    let testId;

    // Check if the test already exists
    let [testResult] = await dbPromise.query(
      "SELECT id FROM IP_Tests WHERE name = ?",
      [testName]
    );

    if (testResult.length === 0) {
      const [insertTestResult] = await dbPromise.query(
        "INSERT INTO IP_Tests (name, description, category, timings, validity, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [testName, testDescription, testCategory, testTimings, formattedTestValidity, "active", createdBy]
      );
      testId = insertTestResult.insertId;
    } else {
      testId = testResult[0].id;
    }

    if (req.file) {
      // Handle Excel upload
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      for (const row of data) {
        const {
          category,
          question_text,
          option_1,
          option_2,
          option_3,
          option_4,
          correct_option,
          rewarded_marks,
          subject,
        } = row;

        const processedQuestionText =
          subject === "maths"
            ? processMathQuestion(question_text)
            : question_text;

        const [questionResult] = await dbPromise.query(
          "INSERT INTO IP_Questions (test_id, category, question_text) VALUES (?, ?, ?)",
          [testId, category, processedQuestionText]
        );

        const questionId = questionResult.insertId;
        const optionIds = [];

        for (let i = 1; i <= 4; i++) {
          const [optionResult] = await dbPromise.query(
            "INSERT INTO IP_Options (question_id, option_text) VALUES (?, ?)",
            [questionId, row[`option_${i}`]]
          );
          optionIds.push(optionResult.insertId);
        }

        const correctOptionIndex = correct_option.split("_")[1];
        const correctOptionId = optionIds[parseInt(correctOptionIndex) - 1];

        await dbPromise.query(
          "INSERT INTO IP_Answers (question_id, correct_option_id, rewarded_marks) VALUES (?, ?, ?)",
          [questionId, correctOptionId, rewarded_marks]
        );
      }
    } else if (questions) {
      // Handle manual test creation
      for (const question of questions) {
        const {
          category,
          question_text,
          options,
          correct_option,
          rewarded_marks,
          subject,
        } = question;

        const processedQuestionText =
          subject === "maths"
            ? processMathQuestion(question_text)
            : question_text;

        const [questionResult] = await dbPromise.query(
          "INSERT INTO IP_Questions (test_id, category, question_text) VALUES (?, ?, ?)",
          [testId, category, processedQuestionText]
        );

        const questionId = questionResult.insertId;
        const optionIds = [];

        for (const option of options) {
          const [optionResult] = await dbPromise.query(
            "INSERT INTO IP_Options (question_id, option_text) VALUES (?, ?)",
            [questionId, option]
          );
          optionIds.push(optionResult.insertId);
        }

        const correctOptionId = optionIds[correct_option - 1];

        await dbPromise.query(
          "INSERT INTO IP_Answers (question_id, correct_option_id, rewarded_marks) VALUES (?, ?, ?)",
          [questionId, correctOptionId, rewarded_marks]
        );
      }
    } else {
      return res.status(400).send({ message: "No valid input provided." });
    }

    res.status(201).send({ message: "Test created successfully!" });
  } catch (error) {
    console.error("Error processing test creation:", error);
    res.status(500).send({ message: "An error occurred while processing the test creation." });
  }
});





// Version 4 : This version stores latex converted value as end output (Enhancement to v2, but not working)

// app.post("/test/upload", upload.single("file"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send({ message: "No file uploaded" });
//   }
  
//   const { testName, testCategory, testDescription, testTimings, testValidity, testStudents, createdBy } = req.body;

//   const formatDateForMySQL = (date) => {
//     if (!date || isNaN(new Date(date).getTime())) {
//       return "2099-12-31";
//     }
//     const isoString = new Date(date).toISOString();
//     return isoString.split("T")[0];
//   };

//   let formattedTestValidity = testValidity ? formatDateForMySQL(testValidity) : "";

//   try {
//     const con = dbConnection();
//     con.connect();

//     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     const dbPromise = con.promise();

//     for (const row of data) {
//       const {
//         test_name,
//         test_description,
//         category,
//         question_text,
//         option_1,
//         option_2,
//         option_3,
//         option_4,
//         correct_option,
//         rewarded_marks,
//         subject,
//       } = row;

//       //Process question_text if subject is math
//       // const processedQuestionText = subject === "maths"
//       //   ? processMathQuestionToMathML(question_text)
//       //   : question_text;

//       // const processedQuestionText = subject === "maths"
//       // ? convert(processMathQuestionToMathML(question_text), { wordwrap: false })
//       // : question_text;

//       // const stripHtmlTags = (html) => html.replace(/<\/?[^>]+(>|$)/g, "");

//       // const processedQuestionText = subject === "maths"
//       //   ? stripHtmlTags(processMathQuestionToMathML(question_text))
//       //   : question_text;

    


//       // Insert test details if not exists
//       let [testResult] = await dbPromise.query(
//         "SELECT id FROM IP_Tests WHERE name = ?",
//         [testName]
//       );

//       let testId;
//       if (testResult.length === 0) {
//         const [insertTestResult] = await dbPromise.query(
//           "INSERT INTO IP_Tests (name, description, category, timings, validity, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
//           [testName, testDescription, testCategory, testTimings, formattedTestValidity, "active", createdBy]
//         );
//         testId = insertTestResult.insertId;
//       } else {
//         testId = testResult[0].id;
//       }

//       // Insert the question with MathML converted text
//       const [questionResult] = await dbPromise.query(
//         "INSERT INTO IP_Questions (test_id, category, question_text) VALUES (?, ?, ?)",
//         [testId, category, processedQuestionText]
//       );
//       const questionId = questionResult.insertId;

//       // Insert options and identify the correct one
//       const optionIds = [];
//       for (let i = 1; i <= 4; i++) {
//         const [optionResult] = await dbPromise.query(
//           "INSERT INTO IP_Options (question_id, option_text) VALUES (?, ?)",
//           [questionId, row[`option_${i}`]]
//         );
//         optionIds.push(optionResult.insertId);
//       }

//       const correctOptionIndex = correct_option.split("_")[1];
//       const correctOptionId = optionIds[parseInt(correctOptionIndex) - 1];

//       await dbPromise.query(
//         "INSERT INTO IP_Answers (question_id, correct_option_id, rewarded_marks) VALUES (?, ?, ?)",
//         [questionId, correctOptionId, rewarded_marks]
//       );
//     }

//     res.status(201).send({ message: "File processed and data inserted successfully!" });
//   } catch (error) {
//     console.error("Error processing file:", error);
//     res.status(500).send({ message: "An error occurred while processing the file." });
//   }
// });





// app.get('/api/ip/tests', (req, res) => {
//   let con;

//   try {
//       con = dbConnection();
//       con.connect();
//   } catch (error) {
//       console.error('DB Connection Error', error);
//       res.status(500).json({ error: 'DB Connection Error' });
//       return; // Exit the function after sending the error response
//   }

//   //const userId = req.params.userId; // Get the userId from the URL parameter

//   console.log('Connected to database.');

//   // Define the query to check if the user has won
//   let query = "SELECT * FROM IP_Tests"; // Using parameterized query to prevent SQL injection

//   con.query(query, (err, data) => {

//       if(err) throw err;
//       res.json({data})

 
//   });

//   // End the connection
//   con.end();
//   console.log("Connection Ended ");
// });


// app.get('/api/ip/tests/:id?/:created_by?', (req, res) => {
//   let con;

//   try {
//       con = dbConnection();
//       con.connect();
//   } catch (error) {
//       console.error('DB Connection Error', error);
//       res.status(500).json({ error: 'DB Connection Error' });
//       return; // Exit the function after sending the error response
//   }

//   console.log('Connected to database.');

//   // Extract path parameterss
//   const { id, created_by } = req.params;
  
//   // Build the query dynamically
//   let query = "SELECT * FROM IP_Tests WHERE 1=1"; // Base query to select all records
//   let queryParams = [];

//   if (id) {
//       query += " AND id = ?";
//       queryParams.push(id); // Add id to query parameters
//   }

//   if (created_by) {
//       query += " AND created_by = ?";
//       queryParams.push(created_by); // Add created_by to query parameters
//   }

//   // Execute the query
//   con.query(query, queryParams, (err, data) => {
//       if (err) {
//           console.error('DB Query Error:', err);
//           res.status(500).json({ error: 'DB Query Error' });
//           return;
//       }
//       res.json({ data });
//   });

//   // End the connection
//   con.end();
//   console.log("Connection Ended ");
// });


app.get('/api/ip/tests/:id?', (req, res) => {
  let con;

  try {
    con = dbConnection();
    con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
    return;
  }

  console.log('Connected to database.');

  // Extract path parameters
  const { id } = req.params;
  const { created_by } = req.query; // Getting created_by from query params

  // Validate that only one of id or created_by is present
  if (id && created_by) {
    res.status(400).json({ error: 'Cannot filter by both id and created_by at the same time.' });
    con.end();
    return;
  }

  // Build the query dynamically
  let query = "SELECT * FROM IP_Tests WHERE 1=1"; // Base query to select all records
  let queryParams = [];

  if (id) {
    query += " AND id = ?";
    queryParams.push(id);
  }

  if (created_by) {
    query += " AND created_by = ?";
    queryParams.push(created_by);
  }

  // New logic to restrict only active tests
  if(id || created_by) {
    query += " AND status = ?"
    queryParams.push("active");
  }

  // Execute the query
  con.query(query, queryParams, (err, data) => {
    if (err) {
      console.error('DB Query Error:', err);
      res.status(500).json({ error: 'DB Query Error' });
      return;
    }
    res.json({ data });
  });

  // End the connection
  con.end();
  console.log("Connection Ended");
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
      return; // Exit after sending error responses
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

         // res.status(200).json({ testId, questions: questionsWithOptions });
          res.status(200).json({data:{ testId, questions: questionsWithOptions }});
          con.end();
          console.log('Connection Ended');
      });
  });
});

app.post('/api/ip/register', async (req, res) => {

  
  const { name, mobile, email, address, city, password, userType, businessName, trainingsProvided,institute,qualifications,businessType,pincode, course } = req.body;
  const transporter = mailConfig();
  try {
    // Establish DB connection
    var con = dbConnection();
    con.connect();

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Request received from registration page, Institute Value is " +institute );

    var institution = (institute === null || institute === undefined ||institute === "") ? businessName : institute;


    console.log("Institution Value is "+institution);

    // Insert basic user data into CC_Users table
    const userQuery = 'INSERT INTO IP_Users (name, mobile, email, address, city, password, userType,institute,qualifications, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    con.query(userQuery, [name, mobile, email, address, city, hashedPassword, userType, institution, qualifications, pincode], (err, result) => {
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
      }
      
      else if (userType === 'Candidate')
        {
          const userId = result.insertId; // Get the inserted user ID
          const studentQuery = 'INSERT INTO IP_Students (name,institute,email,mobile,course_name) VALUES (?, ?, ?, ?, ?)';
          
          con.query(studentQuery, [name, institute, email,mobile, course], (err, result) => {
            if (err) {
              console.error('Error inserting Students Table:', err);
              return res.status(500).json({ message: 'Error inserting in students table' });
            }
  
            // Send registration email to the business partner
            sendRegistrationEmail(email, name);
  
            // Respond with success
            res.status(201).json({ message: 'Business Partner registered successfully' });
          });
        }
      
      else {
        // If it's a candidate, just respond with success
        sendRegistrationEmail(email, name);
        res.status(201).json({ message: 'User registered successfully' });
      }

      
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }


    // Function to send registration email
    const sendRegistrationEmail = (userEmail, userName) => {
      // Set the correct path to the HTML template
      const templatePath = path.join(__dirname, 'emailTemplates', 'ipRegistrationEmailTemplate.html');
    
      // Read the HTML template file
      fs.readFile(templatePath, 'utf-8', (err, htmlTemplate) => {
        if (err) {
          console.error('Error reading the email template file:', err);
          return;
        }
    
        // Replace {{userName}} with the actual user's name
        const emailHtml = htmlTemplate.replace('{{userName}}', name);
    
        // Define email options
        const mailOptions = {
          from: '"Park Bench Team" <support@cottoncandy.co.in>',
          to: email,
          subject: 'Welcome to Park Bench !',
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

    console.log("UserType value is " +user.userType);

    // Partners Table parther id fetch logic ends
    con.end();
    res.json({ token, userName: user.name,userId: user.mobile,userEmail: user.email , pId : pId , userRole : user.userType, institute: user.institute});

  });
});


// Password Resetting Logic 

const otpExpirationTime = 10 * 60 * 1000; // 10 minutes expiration

app.post('/api/ip/reset/password/send-otp', async (req, res) => {
  const { mobile } = req.body;

  var email = "";

  console.log("MOble Number is :"+mobile)
  //const con = dbConnection();
  try
  {
  var con = dbConnection();
  con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
  }

  try {
    const query = 'SELECT email, name FROM IP_Users WHERE mobile = ?';
    con.query(query, [mobile], (err, result) => {
   
      if (err || result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      email = result[0].email;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + otpExpirationTime); // OTP expiration time

      // Insert OTP into the database
      const insertOtpQuery = 'INSERT INTO IP_Users_OTP (mobile, otp, expires_at) VALUES (?, ?, ?)';
      con.query(insertOtpQuery, [mobile, otp, expiresAt], (err, result) => {
        if (err) {
          console.log("Error "+err)
          con.end();
          return res.status(500).json({ error: 'Failed to store OTP' });
        }

        // Send OTP email to the user
        const transporter = mailConfig();
        const mailOptions = {
          from: '"Park Bench Team" <support@cottoncandy.co.in>',
          to: email,
          subject: 'Reset Password OTP',
          html: `<h1 style="color: purple;">Your OTP: ${otp}</h1>`
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) return res.status(500).json({ error: 'Failed to send OTP' });
          con.end();
          res.status(200).json({ message: 'OTP sent successfully' });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
    con.end();
  } 
});

app.post('/api/ip/reset/password/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;
  try
  {
  var con = dbConnection();
  con.connect();
  } catch (error) {
    con.end();
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
  }

  try {
    const query = 'SELECT * FROM IP_Users_OTP WHERE mobile = ? AND otp = ? AND expires_at > NOW()';
    con.query(query, [mobile, otp], (err, result) => {
      if (err || result.length === 0) {
        return res.status(401).json({ error: 'Invalid or expired OTP' });
      }
      con.end();
      res.status(200).json({ message: 'OTP verified' });
      
    });
  } catch (error) {
    con.end();
    res.status(500).json({ error: 'Server error' });
  } 
    
  
});

app.post('/api/ip/reset/password', async (req, res) => {
  const { mobile, password } = req.body;
  try
  {
  var con = dbConnection();
  con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    con.end();
    res.status(500).json({ error: 'DB Connection Error' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'UPDATE IP_Users SET password = ? WHERE mobile = ?';
    con.query(query, [hashedPassword, mobile], (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.status(500).json({ error: 'Failed to reset password' });
      }
      con.end();
      res.status(200).json({ message: 'Password reset successfully' });
    });
  } catch (error) {
    con.end();
    res.status(500).json({ error: 'Server error' });
  } 
    
  
});


// Test Edit and Test User Assignment API


app.post("/test/update", upload.single("file"), async (req, res) => {

   const { testID, testName, testCategory, testDescription, testTimings, testValidity, modifiedBy,testStatus } = req.body; // Getting test details and createdBy from request body
  //const { id, name, category, description, timings, validity, users, created_by } = req.body; // Getting test details and createdBy from request body

  console.log("Id received form Test Details Page :" +testID + "name :" +testName + "Modified By" + modifiedBy + "Test Status" +testStatus);
  //console.log("Data Received from Test Details Page : " +JSON.stringify(req.body))
  // if (!id || !created_by) {
  //   return res.status(400).send({ message: "TestID and createdBy are required" });
  // }

  try {
    const con = dbConnection();
    con.connect();


    const dbPromise = con.promise();

    // Step 1: Update Test Details in IP_Tests Table (if needed)
    const [existingTestResult] = await dbPromise.query(
      "SELECT id FROM IP_Tests WHERE id = ?",
      [testID]
    );

    if (existingTestResult.length === 0) {
      return res.status(404).send({ message: "Test not found" });
    }

    const getCurrentISTDateTime = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istDate = new Date(now.getTime() + istOffset);
      return istDate.toISOString().slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:mm:ss
  };
  
  const modifiedDate = getCurrentISTDateTime();

    // Update the IP_Tests table if test details have changed
    await dbPromise.query(
      "UPDATE IP_Tests SET name = ?, description = ?, category = ?, timings = ?, validity = ?,modified_by = ?, modified_date = ?, status = ? WHERE id = ?",
      [testName, testDescription, testCategory, testTimings, testValidity, modifiedBy,modifiedDate,testStatus, testID]
    );
    console.log(`Test ID ${testID} details updated successfully.`);
    res.send({ message: "Test updated successfully!" });
  } catch (error) {
    console.error("Error updated test details:", error);
    res.status(500).send({ message: "An error occurred while updating the test details." });
  }
});


// Test User Mapping Api

// app.post("/ip/test/eligible/users", upload.single("file"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send({ message: "No file uploaded" });
//   }

//   console.log("Uploaded file:", req.file); // Log the file objects

//   const { testID, updatedBy  } = req.body;

//   console.log("Test ID :" +testID +"Upadted By:" +updatedBy)

//   try {
//     const con = dbConnection();
//     con.connect();

//     // Ensure the file buffer is available
//     if (!req.file.buffer) {
//       return res.status(400).send({ message: "File buffer is missing" });
//     }

//     // Reading and processing the Excel file directly from the buffer
//     const workbook = xlsx.read(req.file.buffer, { type: "buffer" }); // Use buffer here
//     const sheetName = workbook.SheetNames[0];
//     const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     const dbPromise = con.promise();

//     const getCurrentISTDateTime = () => {
//       const now = new Date();
//       const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
//       const istDate = new Date(now.getTime() + istOffset);
//       return istDate.toISOString().slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:mm:ss
//   };
  
//   const modifiedDate = getCurrentISTDateTime();

//     for (const row of data) {
//       const { candidateID, candidateName, eligibleAttempts, institute } = row;

//       console.log("Processing row:", row);
      

//       // Step 1: Ensure the Test Exists
//       let [testResult] = await dbPromise.query(
//         "SELECT id FROM IP_Tests WHERE id = ?",
//         [testID]
//       );

//       let testId;
//       if (testResult.length > 0) {
//         const [insertTestResult] = await dbPromise.query(
//           "INSERT INTO IP_Test_Assignments (userID, CandidateName, TestID, Institute, AssignedBy, EligibleAttempts,ModifiedDate) VALUES (?, ?, ?, ?, ?, ?, ?)",
//           [candidateID, candidateName, testID, institute, updatedBy, eligibleAttempts, modifiedDate]
//         );
       
//       } else {
//         return res.status(400).send({ message: "Invalid Test ID" });
//       }
//     }

//     res.send({ message: "File processed and candidated mapped to the test successfully!" });
//   } catch (error) {
//     console.error("Error processing file:", error);
//     res.status(500).send({ message: "An error occurred while processing the file." });
//   }
// });


app.post("/ip/test/eligible/users", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded" });
  }

  console.log("Uploaded file:", req.file); // Log the file objects

  const { testID, updatedBy } = req.body;

  console.log("Test ID: " + testID + " Updated By: " + updatedBy);

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

    const getCurrentISTDateTime = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istDate = new Date(now.getTime() + istOffset);
      return istDate.toISOString().slice(0, 19).replace("T", " "); // Format: YYYY-MM-DD HH:mm:ss
    };

    const modifiedDate = getCurrentISTDateTime();

    for (const row of data) {
      const { candidateID, candidateName, eligibleAttempts, institute } = row;

      console.log("Processing row:", row);

      // Step 1: Ensure the Test Exists
      let [testResult] = await dbPromise.query(
        "SELECT id FROM IP_Tests WHERE id = ?",
        [testID]
      );

      if (testResult.length > 0) {
        // Use ON DUPLICATE KEY UPDATE
        const query = `
          INSERT INTO IP_Test_Assignments (userID, CandidateName, TestID, Institute, AssignedBy, EligibleAttempts, ModifiedDate)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          CandidateName = VALUES(CandidateName),
          Institute = VALUES(Institute),
          AssignedBy = VALUES(AssignedBy),
          EligibleAttempts = VALUES(EligibleAttempts),
          ModifiedDate = VALUES(ModifiedDate)
        `;

        await dbPromise.query(query, [
          candidateID,
          candidateName,
          testID,
          institute,
          updatedBy,
          eligibleAttempts,
          modifiedDate
        ]);
      } else {
        return res.status(400).send({ message: "Invalid Test ID" });
      }
    }

    res.send({
      message: "File processed and candidates mapped to the test successfully!"
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send({ message: "An error occurred while processing the file." });
  }
});



// app.post("/ip/test/submit", async (req, res) => {
//   const { userID, testID, selectedAnswers } = req.body;

//   console.log("UserID" +userID);
//   console.log("TestID" +testID);
//   console.log("Selected Answers" +JSON.stringify(selectedAnswers));

//   if (!userID || !testID || !selectedAnswers || typeof selectedAnswers !== "object") {
//     return res.status(400).send({ message: "Invalid request payload" });
//   }

//   try {
//     const con = dbConnection(); // Replace with your DB connection function
//     con.connect();

//     const dbPromise = con.promise();

//     // Step 1: Determine the next attempt_id for this user and test
//     let [existingAttempts] = await dbPromise.query(
//       "SELECT MAX(attempt_id) AS last_attempt FROM IP_Responses WHERE candidate_id = ? AND test_id = ?",
//       [userID, testID]
//     );

//     let attemptID = existingAttempts[0]?.last_attempt ? existingAttempts[0].last_attempt + 1 : 1;

//     const getCurrentISTDateTime = () => {
//       const now = new Date();
//       const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
//       const istDate = new Date(now.getTime() + istOffset);
//       return istDate.toISOString().slice(0, 19).replace("T", " "); // Format: YYYY-MM-DD HH:mm:ss
//     };

//     const modifiedDate = getCurrentISTDateTime();

//     // Step 2: Insert each response with the calculated attempt_id
//     const responses = Object.entries(selectedAnswers).map(([questionID, selectedOption]) => [
//       testID,
//       userID,
//       questionID,
//       selectedOption,
//       attemptID,
//       modifiedDate,
//     ]);



//     await dbPromise.query(
//       `INSERT INTO IP_Responses (test_id, candidate_id, question_id, selected_option, attempt_id,created_at)
//        VALUES ?`,
//       [responses]
//     );

//     res.status(201).send({
//       message: "Test Submitted Successfully",
//       attemptID: attemptID,
//     });

//     con.end();
//   } catch (error) {
//     console.error("Error processing test submission:", error);
//     res.status(500).send({ message: "An error occurred while processing the test submission" });
//   }
// });


app.post("/ip/test/submit", async (req, res) => {
  const { userID, testID, selectedAnswers } = req.body;

  console.log("UserID: " + userID);
  console.log("TestID: " + testID);
  console.log("Selected Answers: " + JSON.stringify(selectedAnswers));

  if (!userID || !testID || !selectedAnswers || typeof selectedAnswers !== "object") {
    return res.status(400).send({ message: "Invalid request payload" });
  }

  try {
    const con = dbConnection(); // Replace with your DB connection function
    con.connect();

    const dbPromise = con.promise();

    // Step 1: Determine the next attempt_id for this user and test
    let [existingAttempts] = await dbPromise.query(
      "SELECT MAX(attempt_id) AS last_attempt FROM IP_Responses WHERE candidate_id = ? AND test_id = ?",
      [userID, testID]
    );

    let attemptID = existingAttempts[0]?.last_attempt ? existingAttempts[0].last_attempt + 1 : 1;

    const getCurrentISTDateTime = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istDate = new Date(now.getTime() + istOffset);
      return istDate.toISOString().slice(0, 19).replace("T", " "); // Format: YYYY-MM-DD HH:mm:ss
    };

    const modifiedDate = getCurrentISTDateTime();

    // Step 2: Insert each response with the calculated attempt_id
    const responses = Object.entries(selectedAnswers).map(([questionID, selectedOption]) => [
      testID,
      userID,
      questionID,
      selectedOption,
      attemptID,
      modifiedDate,
    ]);

    await dbPromise.query(
      `INSERT INTO IP_Responses (test_id, candidate_id, question_id, selected_option, attempt_id, created_at)
       VALUES ?`,
      [responses]
    );

    // Step 3: Fetch the total marks and evaluate the responses
    const [answers] = await dbPromise.query(
      "SELECT r.question_id, r.selected_option, a.correct_option_id, a.rewarded_marks " +
        "FROM IP_Responses r " +
        "JOIN IP_Answers a ON r.question_id = a.question_id " +
        "WHERE r.test_id = ? AND r.candidate_id = ? AND r.attempt_id = ?",
      [testID, userID, attemptID]
    );

    let totalMarks = 0;
    let marksScored = 0;

    answers.forEach((answer) => {
      totalMarks += parseInt(answer.rewarded_marks || "0", 10); // Add the maximum possible marks
      if (answer.selected_option === answer.correct_option_id) {
        marksScored += parseInt(answer.rewarded_marks || "0", 10); // Add the marks for correct answers
      }
    });

    // Step 4: Insert the result into the IP_Results table
    await dbPromise.query(
      `INSERT INTO IP_Test_Results (test_id, candidate_id, total_marks, marks_scored, created_at,attempt_id)
       VALUES (?, ?, ?, ?, ?,?)`,
      [testID, userID, totalMarks, marksScored, modifiedDate,attemptID]
    );

    res.status(201).send({
      message: "Test Submitted and Evaluated Successfully",
      attemptID: attemptID,
      totalMarks,
      marksScored,
    });

    con.end();
  } catch (error) {
    console.error("Error processing test submission:", error);
    res.status(500).send({ message: "An error occurred while processing the test submission" });
  }
});



// API To Find what are the tests Assigned to the user


// app.get('/api/ip/assigned/tests/:id?', (req, res) => {
//   let con;

//   try {
//     con = dbConnection();
//     con.connect();
//   } catch (error) {
//     console.error('DB Connection Error', error);
//     res.status(500).json({ error: 'DB Connection Error' });
//     return;
//   }

//   console.log('Connected to database.');

//   // Extract path parameters
//   const { id } = req.params;
 

//   // End the connection
//   con.end();
//   console.log("Connection Ended");
// });



app.get('/api/ip/users/:id/tests', (req, res) => {
  let con;

  try {
    con = dbConnection();
    con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
    return;
  }

  console.log('Connected to database.');

  const { id: userId } = req.params;

  if (!userId) {
    con.end();
    return res.status(400).json({ error: 'UserID is required' });
  }

  // Commented to restrict inacative tests in new logic below
  // const query = `
  //   SELECT 
  //     t.id, t.name, t.description, t.created_by, t.created_at, 
  //     t.status, t.validity, t.timings, t.category, t.modified_by, t.modified_date
  //   FROM IP_Test_Assignments a
  //   INNER JOIN IP_Tests t ON a.TestID = t.id
  //   WHERE a.UserID = ?
  //   ORDER BY t.created_at DESC
  // `;

  const query = `
  SELECT 
    t.id, t.name, t.description, t.created_by, t.created_at, 
    t.status, t.validity, t.timings, t.category, t.modified_by, t.modified_date
  FROM IP_Test_Assignments a
  INNER JOIN IP_Tests t ON a.TestID = t.id
  WHERE a.UserID = ? AND t.status = "active"
  ORDER BY t.created_at DESC
`;

  con.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Query Error', err);
      con.end();
      return res.status(500).json({ error: 'Error fetching tests' });
    }

    const currentDate = new Date();
    const activeTests = [];
    const expiredTests = [];

    results.forEach(test => {
      if (new Date(test.validity) >= currentDate) {
        activeTests.push(test);
      } else {
        expiredTests.push(test);
      }
    });

    con.end();
    console.log('Connection Ended');
    // return res.status(200).json({ activeTests, expiredTests });

    return res.status(200).json({ data: { activeTests, expiredTests } });

  });
});


// app.get('/api/ip/users/:id/results', async (req, res) => {
//   let con;

//   try {
//     // Establish the DB connection
//     con = dbConnection();
//     con.connect();
//   } catch (error) {
//     console.error('DB Connection Error:', error);
//     return res.status(500).json({ error: 'DB Connection Error' });
//   }

//   console.log('Connected to database.');

//   const { id: candidateId } = req.params;

//   if (!candidateId) {
//     con.end();
//     return res.status(400).json({ error: 'Candidate ID is required' });
//   }

//   const query = `
//     SELECT 
//       r.test_id AS testId,
//       t.name AS testName,
//       MIN(resp.created_at) AS testTakenDate, -- Getting the earliest attempt time
//       r.total_marks AS totalMarks,
//       r.marks_scored AS marksScored
//     FROM IP_Test_Results r
//     INNER JOIN IP_Tests t ON r.test_id = t.id
//     INNER JOIN IP_Responses resp 
//       ON resp.test_id = r.test_id 
//       AND resp.candidate_id = r.candidate_id
//       AND resp.attempt_id = r.attempt_id
//     WHERE r.candidate_id = ?
//     GROUP BY r.test_id, r.total_marks, r.marks_scored, t.name
//     ORDER BY testTakenDate DESC;
//   `;

//   try {
//     const results = await con.promise().query(query, [candidateId]);

//     if (results[0].length === 0) {
//       con.end();
//       return res.status(404).json({ error: 'No test results found for this candidate.' });
//     }

//     const testResults = results[0];

//     con.end();
//     console.log('Connection Ended');
//     return res.status(200).json({ data: { testResults } });
//   } catch (error) {
//     console.error('Query Error:', error);
//     con.end();
//     return res.status(500).json({ error: 'Error fetching test results' });
//   }
// });

app.get('/api/ip/users/:id/results', async (req, res) => {
  let con;

  try {
    // Establish the DB connection
    con = dbConnection();
    con.connect();
  } catch (error) {
    console.error('DB Connection Error:', error);
    return res.status(500).json({ error: 'DB Connection Error' });
  }

  console.log('Connected to database.');

  const { id: candidateId } = req.params;

  if (!candidateId) {
    con.end();
    return res.status(400).json({ error: 'Candidate ID is required' });
  }

  // SQL Query
  // const query = `
  //   SELECT 
  //     r.test_id AS testId,
  //     t.name AS testName,
  //     MIN(resp.created_at) AS testTakenDate, -- Getting the earliest attempt time
  //     r.total_marks AS totalMarks,
  //     r.marks_scored AS marksScored
  //   FROM IP_Test_Results r
  //   INNER JOIN IP_Tests t ON r.test_id = t.id
  //   INNER JOIN IP_Responses resp 
  //     ON resp.test_id = r.test_id 
  //     AND resp.candidate_id = r.candidate_id
  //     AND resp.attempt_id = r.attempt_id
  //   WHERE r.candidate_id = ?
  //   GROUP BY r.test_id, r.total_marks, r.marks_scored, t.name
  //   ORDER BY testTakenDate DESC;
  // `;

  const query = `
    SELECT 
      r.test_id AS testId,
      t.name AS testName,
       MIN(resp.created_at) AS testTakenDate, -- Getting the earliest attempt time
      r.total_marks AS totalMarks,
      r.marks_scored AS marksScored
    FROM IP_Test_Results r
    INNER JOIN IP_Tests t ON r.test_id = t.id
    INNER JOIN IP_Responses resp 
      ON resp.test_id = r.test_id 
      AND resp.candidate_id = r.candidate_id
      AND resp.attempt_id = r.attempt_id
    WHERE r.candidate_id = ?
    GROUP BY r.test_id, r.attempt_id
    ORDER BY testTakenDate DESC;
  `;

  console.log('Generated Query:', query); // Log the query for debugging

  try {
    const [results] = await con.promise().query(query, [candidateId]);



    if (results.length === 0) {
      con.end();
      return res.status(404).json({ error: 'No test results found for this candidate.' });
    }

    con.end();
    console.log('Connection Ended');
    return res.status(200).json({ data: { testResults: results } });
  } catch (error) {
    console.error('Query Error:', error);
    con.end();
    return res.status(500).json({ error: 'Error fetching test results' });
  }
});



// app.get('/api/ip/partner/:id/test/stats', async (req, res) => {
//   let con;

//   try {
//     // Establish the DB connection
//     con = dbConnection();
//     con.connect();
//   } catch (error) {
//     console.error('DB Connection Error:', error);
//     return res.status(500).json({ error: 'DB Connection Error' });
//   }

//   console.log('Connected to database.');

//   const { id: partnerId } = req.params;

//   if (!partnerId) {
//     con.end();
//     return res.status(400).json({ error: 'Partner ID is required' });
//   }

//   try {
//     // Query for assigned candidates
//     const assignedQuery = `
//       SELECT 
//         IP_Test_Assignments.UserID AS candidateId,
//         IP_Test_Assignments.CandidateName AS name,
//         IP_Test_Assignments.DueDate AS dueDate,
//         IP_Test_Assignments.EligibleAttempts AS eligibleAttempts,
//         IP_Test_Assignments.Institute AS institute
//       FROM IP_Test_Assignments
//       WHERE IP_Test_Assignments.AssignedBy = ?
//     `;

//     const [assignedCandidates] = await con.promise().query(assignedQuery, [partnerId]);

//     // Query for attended candidates
//     const attendedQuery = `
//       SELECT 
//         IP_Test_Assignments.UserID AS candidateId,
//         IP_Test_Assignments.CandidateName AS name,
//         IP_Test_Results.marks_scored AS marksScored,
//         IP_Test_Results.total_marks AS totalMarks,
//         ROUND((IP_Test_Results.marks_scored / IP_Test_Results.total_marks) * 100, 2) AS percentage
//       FROM IP_Test_Results
//       JOIN IP_Test_Assignments 
//         ON IP_Test_Assignments.UserID = IP_Test_Results.candidate_id
//       WHERE IP_Test_Results.test_id IN (
//         SELECT id FROM IP_Tests WHERE created_by = ?
//       )
//     `;

//     const [attendedCandidates] = await con.promise().query(attendedQuery, [partnerId]);

//     // Query for not attended candidates
//     const notAttendedQuery = `
//       SELECT 
//         IP_Test_Assignments.UserID AS candidateId,
//         IP_Test_Assignments.CandidateName AS name,
//         IP_Test_Assignments.DueDate AS dueDate,
//         IP_Test_Assignments.EligibleAttempts AS eligibleAttempts,
//         IP_Test_Assignments.Institute AS institute
//       FROM IP_Test_Assignments
//       LEFT JOIN IP_Test_Results 
//         ON IP_Test_Assignments.UserID = IP_Test_Results.candidate_id
//       WHERE IP_Test_Assignments.AssignedBy = ? 
//         AND IP_Test_Results.candidate_id IS NULL
//     `;

//     const [notAttendedCandidates] = await con.promise().query(notAttendedQuery, [partnerId]);

//     con.end();
//     console.log('Connection Ended');

//     return res.status(200).json({
//       assignedCandidates,
//       attendedCandidates,
//       notAttendedCandidates,
//     });
//   } catch (error) {
//     console.error('Query Error:', error);
//     con.end();
//     return res.status(500).json({ error: 'Error fetching test stats' });
//   }
// });


// Business Partner api , to fetch all stat related to the test id passed 

app.get('/api/ip/test/:testId/stats', async (req, res) => {
  let con;

  try {
    // Establish the DB connection
    con = dbConnection();
    con.connect();
  } catch (error) {
    console.error('DB Connection Error:', error);
    return res.status(500).json({ error: 'DB Connection Error' });
  }

  console.log('Connected to database.');

  const { testId } = req.params;

  if (!testId) {
    con.end();
    return res.status(400).json({ error: 'Test ID is required' });
  }

  try {
    // Query for assigned candidates
    const assignedQuery = `
      SELECT 
        IP_Test_Assignments.UserID AS candidateId,
        IP_Test_Assignments.CandidateName AS name,
        IP_Test_Assignments.DueDate AS dueDate,
        IP_Test_Assignments.EligibleAttempts AS eligibleAttempts,
        IP_Test_Assignments.Institute AS institute
      FROM IP_Test_Assignments
      WHERE IP_Test_Assignments.TestID = ?
    `;

    const [assignedCandidates] = await con.promise().query(assignedQuery, [testId]);

    // Query for attended candidates
   // const attendedQuery = `
    //   SELECT 
    //     IP_Test_Assignments.UserID AS candidateId,
    //     IP_Test_Assignments.CandidateName AS name,
    //     IP_Test_Results.marks_scored AS marksScored,
    //     IP_Test_Results.total_marks AS totalMarks,
    //     ROUND((IP_Test_Results.marks_scored / IP_Test_Results.total_marks) * 100, 2) AS percentage
    //   FROM IP_Test_Results
    //   JOIN IP_Test_Assignments 
    //     ON IP_Test_Assignments.UserID = IP_Test_Results.candidate_id
    //   WHERE IP_Test_Results.test_id = ?
    // `;
    const attendedQuery = `
        SELECT 
        DISTINCT
        IP_Test_Assignments.UserID AS candidateId,
        IP_Test_Assignments.CandidateName AS name,
        IP_Test_Results.marks_scored AS marksScored,
        IP_Test_Results.total_marks AS totalMarks,
        ROUND((IP_Test_Results.marks_scored / IP_Test_Results.total_marks) * 100, 2) AS percentage,
        IP_Test_Results.attempt_id AS attemptId,  -- Distinguish between attempts
        IP_Test_Results.created_at AS attemptDate -- Include attempt date for uniqueness
    FROM 
        IP_Test_Results
    JOIN 
        IP_Test_Assignments 
        ON IP_Test_Assignments.UserID = IP_Test_Results.candidate_id
    WHERE 
        IP_Test_Results.test_id = ?
    ORDER BY 
        IP_Test_Results.candidate_id, IP_Test_Results.attempt_id`;

    const [attendedCandidates] = await con.promise().query(attendedQuery, [testId]);

    // Query for not attended candidates
    const notAttendedQuery = `
      SELECT 
        IP_Test_Assignments.UserID AS candidateId,
        IP_Test_Assignments.CandidateName AS name,
        IP_Test_Assignments.DueDate AS dueDate,
        IP_Test_Assignments.EligibleAttempts AS eligibleAttempts,
        IP_Test_Assignments.Institute AS institute
      FROM IP_Test_Assignments
      LEFT JOIN IP_Test_Results 
        ON IP_Test_Assignments.UserID = IP_Test_Results.candidate_id
        AND IP_Test_Results.test_id = ?
      WHERE IP_Test_Assignments.TestID = ? 
        AND IP_Test_Results.candidate_id IS NULL
    `;

    const [notAttendedCandidates] = await con.promise().query(notAttendedQuery, [testId, testId]);

    con.end();
    console.log('Connection Ended');

    return res.status(200).json({data:{
      assignedCandidates,
      attendedCandidates,
      notAttendedCandidates,
    }});
  } catch (error) {
    console.error('Query Error:', error);
    con.end();
    return res.status(500).json({ error: 'Error fetching test stats' });
  }
});


// API to fetch All Candidates under the business partner - Business Related API


// app.get('/api/ip/partner/:partnerId/students', async (req, res) => {
  app.get('/api/ip/partner/:partnerId/:userType', async (req, res) => {

  let con;

  try {
    // Establish the DB connection
    con = dbConnection();
    con.connect();
  } catch (error) {
    console.error('DB Connection Error:', error);
    return res.status(500).json({ error: 'DB Connection Error' });
  }

  console.log('Connected to database.');

  const { partnerId, userType } = req.params;

  console.log("Inside  api (userType) : "+userType);

  if (!partnerId) {
    con.end();
    return res.status(400).json({ error: 'Partner ID is required' });
  }

  try {
    // Define the SQL query
    // const query = `
    //   SELECT 
    //     id, name, mobile, email, city
    //   FROM 
    //     IP_Users
    //   WHERE 
    //     institute = ? 
    //     AND userType = 'Candidate';
    // `;

    const query = `
    SELECT 
      id, name, mobile, email, city
    FROM 
      IP_Users
    WHERE 
      institute = ? 
      AND userType = ?;
  `;

    // Execute the query
    con.query(query, [partnerId,userType], (err, results) => {
      if (err) {
        console.error('Query Error:', err);
        con.end();
        return res.status(500).json({ error: 'Error fetching students list' });
      }

      // Respond with the results
      res.status(200).json({data:{ student: results }});
      con.end();
    });
  } catch (error) {
    console.error('Query Error:', error);
    con.end();
    return res.status(500).json({ error: 'Error fetching students list' });
  }
});


// Video Upload API

app.post('/api/ip/video/upload', upload.single('video'), async (req, res) => {

  console.log("Inside Video Uploader Api")
  const { uploader_id,course_id,subject , institute} = req.body;

  if (!req.file || !uploader_id) {
    return res.status(400).json({ error: 'Video file and uploader ID are required' });
  }

  const file = req.file;
  const videoKey = `gb_ground/${uuidv4()}_${file.originalname}`;

  const params = {
    Bucket: 'snektoawsbucket',
    Key: videoKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  let con;
  try {
    // Upload video to S3
    const uploadResult = await s3.upload(params).promise();

    // Save video details in the database
    try {
      con = dbConnection();
      con.connect();

      const query = 'INSERT INTO IP_Videos (uploader_id, video_url,course_id,subject,institute) VALUES (?, ?,?,?,?)';
      await new Promise((resolve, reject) => {
        con.query(query, [uploader_id, uploadResult.Location,course_id,subject,institute], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      con.end();
    } catch (dbError) {
      console.error('DB Error:', dbError);
      return res.status(500).json({ error: 'Database Error' });
    }

    res.status(201).json({
      message: 'Video uploaded successfully',
      videoUrl: uploadResult.Location,
    });
  } catch (s3Error) {
    console.error('S3 Upload Error:', s3Error);
    res.status(500).json({ error: 'Video upload failed' });
  }
});



// Get Videos API

app.get('/api/ip/partner/:institute/videos', async (req, res) => {
  const { institute } = req.params;
  let con;

  try {
    // Establish the DB connection
    con = dbConnection();
    con.connect();
  } catch (error) {
    console.error('DB Connection Error:', error);
    return res.status(500).json({ error: 'DB Connection Error' });
  }

  console.log('Connected to database.');

  try {
    // Fetch video details for the given institute
    const query = `
      SELECT id, uploader_id, video_url, created_at,course_id,subject 
      FROM IP_Videos 
      WHERE institute = ?
      ORDER BY created_at DESC
    `;

    const videos = await new Promise((resolve, reject) => {
      con.query(query, [institute], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    if (videos.length === 0) {
      return res.status(404).json({ message: 'No videos found for this partner.' });
    }

    res.status(200).json({ videos });
  } catch (dbError) {
    console.error('DB Query Error:', dbError);
    return res.status(500).json({ error: 'Failed to fetch videos' });
  } finally {
    con.end();
  }
});


// Document Upload API

app.post('/api/ip/document/upload', upload.single('document'), async (req, res) => {

  const { uploader_id, course_id, subject ,name, description ,category,institute} = req.body;
  console.log("Name Value is :" +name);

  if (!req.file || !uploader_id) {
    return res.status(400).json({ error: 'Document file and uploader ID are required' });
  }

  const file = req.file;
  const documentKey = `gb_documents/${uuidv4()}_${file.originalname}`;

  const params = {
    Bucket: 'snektoawsbucket',
    Key: documentKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  let con;
  try {
    // Upload document to S3
    const uploadResult = await s3.upload(params).promise();

    // Save document details in the database
    try {
      con = dbConnection();
      con.connect();

      const query = `
        INSERT INTO IP_Documents (uploader_id, document_url, course_id, subject, file_type, file_size, name, description, category,institute)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)
      `;
      await new Promise((resolve, reject) => {
        con.query(query, [
          uploader_id,
          uploadResult.Location,
          course_id,
          subject,
          file.mimetype,
          file.size,
          name,
          description,
          category,
          institute
        ], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      con.end();
    } catch (dbError) {
      console.error('DB Error:', dbError);
      return res.status(500).json({ error: 'Database Error' });
    }

    res.status(201).json({
      message: 'Document uploaded successfully',
      documentUrl: uploadResult.Location,
    });
  } catch (s3Error) {
    console.error('S3 Upload Error:', s3Error);
    res.status(500).json({ error: 'Document upload failed' });
  }
});


// Document Fetch API


app.get('/api/ip/partner/:institute/documents', async (req, res) => {
  const { institute } = req.params;
  let con;

  try {
    // Establish the DB connection
    con = dbConnection();
    con.connect();
  } catch (error) {
    console.error('DB Connection Error:', error);
    return res.status(500).json({ error: 'DB Connection Error' });
  }

  console.log('Connected to database.');

  try {
    // Fetch document details for the given institute
    const query = `
      SELECT id, uploader_id, document_url, created_at, course_id, subject, file_type, file_size, name, description, category,institute
      FROM IP_Documents
      WHERE institute = ?
      ORDER BY created_at DESC
    `;

    const documents = await new Promise((resolve, reject) => {
      con.query(query, [institute], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    if (documents.length === 0) {
      return res.status(404).json({ message: 'No documents found for this partner.' });
    }

    res.status(200).json({ documents });
  } catch (dbError) {
    console.error('DB Query Error:', dbError);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  } finally {
    con.end();
  }
});


// Get List of Institutes API

app.get('/api/ip/:type/lists', async (req, res) => {
  const { type } = req.params;
  var institute =""

  if(req.query.institute)
    {
      institute = req.query.institute;
    }

  console.log("Type is " + type);
  let con;

  try {
    // Establish the DB connection
    con = dbConnection();
    con.connect();
  } catch (error) {
    console.error('DB Connection Error:', error);
    return res.status(500).json({ error: 'DB Connection Error' });
  }

  console.log('Connected to database.');

  try {
    // Fetch distinct institute names where status = 'active' and sort them alphabetically

    if(type === 'institute')
      {
       
    // query = `
    //   SELECT DISTINCT institute AS type
    //   FROM IP_Users
    //   WHERE status = 'active' AND userType = 'Business Partner'
    //   ORDER BY institute ASC`;
    query = `
      SELECT DISTINCT businessName AS type
      FROM IP_Business_Partners
      ORDER BY businessName ASC`;

      }

      if(type === 'course')
        {
      
      query = `
        SELECT DISTINCT course_name AS type
        FROM IP_Courses
        WHERE institute = '${institute}'
        ORDER BY course_name ASC`;
        }

    const list = await new Promise((resolve, reject) => {
      con.query(query, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    if (list.length === 0) {
      return res.status(404).json({ message: 'No Data Found' });
    }

    res.status(200).json({ data: list });
  } catch (dbError) {
    console.error('DB Query Error:', dbError);
    return res.status(500).json({ error: 'Failed to fetch lists' });
  } finally {
    con.end();
  }
});


// Course and Subject Creation api 

app.post('/api/ip/course/creation', async (req, res) => {
  const { courseName, courseDescription, subjects, userId,institute } = req.body;

  if (!courseName) {
    return res.status(400).json({ error: "Course name is required" });
  }

  let con;
  try {
    con = dbConnection();
    con.connect();
    await new Promise((resolve, reject) => con.beginTransaction(err => err ? reject(err) : resolve()));

    // Insert course into IP_Course
    const courseInsertQuery = `INSERT INTO IP_Courses (user_id,institute,course_name, course_description) VALUES (?,?, ?, ?)`;
    const [courseResult] = await con.promise().query(courseInsertQuery, [userId, institute,courseName, courseDescription || ""]);
    const courseId = courseResult.insertId;

    // Insert subjects if they exist
    if (subjects && subjects.length > 0) {
      const subjectInsertQuery = `INSERT INTO IP_Subjects (name, course_id) VALUES ?`;
      const subjectValues = subjects.map(subject => [subject, courseId]);
      await con.promise().query(subjectInsertQuery, [subjectValues]);
    }

    await new Promise((resolve, reject) => con.commit(err => err ? reject(err) : resolve()));
    res.status(201).json({ message: "Course created successfully", courseId });

  } catch (error) {
    if (con) await new Promise((resolve, reject) => con.rollback(err => err ? reject(err) : resolve()));
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Internal Server Error" });

  } finally {
    if (con) con.end();
  }
});


// Staff Creation API

app.post('/api/ip/staff/creation', async (req, res) => {
  const { mobile, name, email, institute, qualification, specialization } = req.body;

  if (!mobile || !name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const con = dbConnection();
  
  try {
    await new Promise((resolve, reject) => con.connect(err => (err ? reject(err) : resolve())));

    // Start transaction
    await new Promise((resolve, reject) => con.query('START TRANSACTION', err => (err ? reject(err) : resolve())));

    // Insert into IP_Staff
    const insertStaffQuery = `
      INSERT INTO IP_Staff (name, email, mobile, institute, qualification, specialization) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await new Promise((resolve, reject) =>
      con.query(insertStaffQuery, [name, email, mobile, institute, qualification, specialization], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
    );

    // Update userType in IP_Users
    const updateUserQuery = `UPDATE IP_Users SET userType = 'Staff' WHERE mobile = ?`;
    await new Promise((resolve, reject) =>
      con.query(updateUserQuery, [mobile], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
    );

    // Commit transaction
    await new Promise((resolve, reject) => con.query('COMMIT', err => (err ? reject(err) : resolve())));

    res.status(201).json({ message: 'Staff created successfully' });
  } catch (error) {
    await new Promise((resolve, reject) => con.query('ROLLBACK', err => (err ? reject(err) : resolve())));
    console.error('Error creating staff:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    con.end();
  }
});


app.post("/api/cc/create-order", async (req, res) => {
  const { amount, currency } = req.body;

  console.log("Currency Received " +currency);

  console.log("Amount Received Boss:" +JSON.stringify(amount))
  console.log("Amount Object Received Boss:" +JSON.stringify(amount))
  console.log("Total Amount :" +amount.totalAmount)


  try {
    const order = await razorpay.orders.create({
      amount: amount.totalAmount * 100, // Amount in paise (₹1 = 100 paise)
      currency: currency || "INR",
      receipt: `order_rcptid_${Date.now()}`,
      payment_capture: 1, // Auto-captures the payment
    });

    res.json({ orderId: order.id });
  } catch (error) {
    res.status(500).send(error);
  }
});






app.listen(3000, () => {
  console.log('Server is running on port 3000');
});




module.exports = app;


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


