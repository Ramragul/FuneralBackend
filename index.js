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

const crypto = require("crypto");




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

// DB Connection Pool 




// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });


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



// Commented on SEPT 8,2025 for 

// function dbConnection () {
//   console.log("PORT NUMBER" +process.env.DATABASE_PORT)
//   var connection = mysql.createConnection({
  
//     //host     : "smartdisplay.cj0ybsa00pzb.ap-northeast-1.rds.amazonaws.com",
//     host     : process.env.DATABASE_URL,
//     user     : process.env.DATABASE_USERNAME,
//     password : process.env.DATABASE_PASSWORD,
//     port     : process.env.DATABASE_PORT,
//     database : process.env.DATABASE_NAME
//   });
//   return connection;
// }

let pool;

function dbConnection() {
  console.log("PORT NUMBER " + process.env.DATABASE_PORT);

  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DATABASE_URL,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      port: process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      waitForConnections: true,
      connectionLimit: 10,  // adjust based on your server
      queueLimit: 0
    });
  }

  // mimic old connection object so existing code still works
  pool.connect = () => {};  // calling .connect() will do nothing
  return pool;
}

module.exports = dbConnection;

//const mysql = require("mysql2");   // keep normal mysql2

// function dbConnection () {
//   console.log("PORT NUMBER " + process.env.DATABASE_PORT);
//   const connection = mysql.createConnection({
//     host     : process.env.DATABASE_URL,
//     user     : process.env.DATABASE_USERNAME,
//     password : process.env.DATABASE_PASSWORD,
//     port     : process.env.DATABASE_PORT,
//     database : process.env.DATABASE_NAME
//   });
//   return connection.promise();   // 🔑 wrap for async/await
// }

module.exports = dbConnection;

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
      //connection.end();
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
       
       //connection.end();
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
         
        // connection.end();
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
           
           //connection.end();
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
      // // con.end();
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
       //connection.end();
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
      // // con.end();
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
      //  // con.end();
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
         //connection.end();
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


// app.post('/aws/upload', upload.array('photos', 10), async (req, res) => {
//   try {
//     const uploadedImageURLs = [];

//     const promises = req.files.map(async (file) => {
//       // Resize and compress the image using sharp
//       const resizedBuffer = await sharp(file.buffer)
//         .resize(800, 800, {
//           fit: sharp.fit.inside,
//           withoutEnlargement: true
//         })
//         .toFormat('jpeg', { quality: 80 })
//         .toBuffer();

//       const params = {
//         Bucket: 'snektoawsbucket',
//         Key: `gb_ground/${uuidv4()}_${file.originalname}`,
//         Body: resizedBuffer,
//         ContentType: 'image/jpeg', // assuming the output is JPEG
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

//     console.log("Concatenated Image URLs: " + concatenatedString);
//     res.status(200).json({ imageURLs: uploadedImageURLs });

//   } catch (error) {
//     console.error('Error uploading images to AWS S3:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


app.post('/aws/upload', upload.array('photos', 10), async (req, res) => {
  try {
    const uploaded = [];

    const promises = req.files.map(async (file) => {
      // const resizedBuffer = await sharp(file.buffer)
      //   .resize(800, 800, {
      //     fit: sharp.fit.inside,
      //     withoutEnlargement: true
      //   })
      //   .toFormat('jpeg', { quality: 80 })
      //   .toBuffer();

      const resizedBuffer = await sharp(file.buffer)
      .rotate() // <-- auto-rotate based on EXIF orientation
      .resize(800, 800, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFormat('jpeg', { quality: 80 })
      .toBuffer();


      const key = `gb_ground/${uuidv4()}_${file.originalname}`;

      const params = {
        Bucket: 'snektoawsbucket',
        Key: key,
        Body: resizedBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      };

      const data = await s3.upload(params).promise();
      uploaded.push({ url: data.Location, s3Key: key });
    });

    await Promise.all(promises);

    res.status(200).json({ imageURLs: uploaded }); 
    // returns [{ url, s3Key }]
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
      // con.end();
  
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
      // con.end();
  
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

  //connection.end();
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
  // con.end();

  res.status(201).json({ Status: "Data Upload completed Successfully" });


} catch (error) {
  console.error('Error uploading data to AWS DB:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}

});

// GET Rental Master Table Data Upload api

// Commented on Spet 8

// app.get('/api/cc/rental/product', (req, res) => {
//   var connection = dbConnection();
  
//   connection.connect();

//   const category = req.query.category;
//   const occasion = req.query.occasion;
//   const productType = req.query.productType;

//   console.log("Category: " + category);
//   console.log("Occasion: " + occasion);
//   console.log("Product Type :" +productType);

//   let query = 'SELECT * FROM CC_RentalProductMaster';
//   let queryParams = [];



//   if (category || occasion || productType) {
//     query += ' WHERE';
  
//     if (category) {
//       query += ' ProductCategory = ?';
//       queryParams.push(category);
//     }
  
//     if (category && (occasion || productType)) {
//       query += ' AND';
//     }
  
//     if (occasion) {
//       query += ' FIND_IN_SET(?, ProductUsageOccasion)';
//       queryParams.push(occasion);
//     }
  
//     if (occasion && productType) {
//       query += ' AND';
//     }
  
//     if (productType) {
//       query += ' ProductType = ?';
//       queryParams.push(productType);
//     }
//   }

//   connection.query(query, queryParams, (err, data) => {
//     if (err) {
//       console.error('Error executing query:', err);
//       res.status(500).json({ error: 'Internal Server Error' });
//       return;
//     }
//     res.json({ data });
//   });

//   connection.end();
// });

// Get Rental Product details api new version

app.get('/api/cc/rental/product', (req, res) => {
  const conn = dbConnection();     // normal mysql2, no .promise()
  conn.connect();

  const { category, occasion, productType } = req.query;

  // Build WHERE + params
  const where = [];
  const params = [];

  if (category)   { where.push('p.ProductCategory = ?'); params.push(category); }
  if (occasion)   { where.push('FIND_IN_SET(?, p.ProductUsageOccasion)'); params.push(occasion); }
  if (productType){ where.push('p.ProductType = ?'); params.push(productType); }

  let sql = `
    SELECT 
      p.ProductID,
      p.ProductName,
      p.ProductType,
      p.ProductBrandName,
      p.ProductUsageGender,
      p.ProductUsageOccasion,
      p.ProductOrigin,
      p.ProductCategory,
      p.ProductPriceBand,
      p.ProductPrice,
      p.ProductPurchasePrice,
      p.ProductAvailability,
      p.Remarks,
      p.OwningAuthority,
      p.ProductStatus,
      GROUP_CONCAT(i.ImageURL ORDER BY i.ImageID) AS ProductImageURL
    FROM CC_RentalProductMaster p
    LEFT JOIN CC_ProductImages i ON p.ProductID = i.ProductID
  `;
  if (where.length) {
    sql += ' WHERE ' + where.join(' AND ');
  }
  sql += ' GROUP BY p.ProductID';

  console.log('Final SQL:', sql, params);

  conn.query(sql, params, (err, rows) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
     // conn.end();
      return;
    }
    // rows[].ProductImageURL is already a comma string from GROUP_CONCAT
    res.json({ data: rows });
    // conn.end();
  });
});



// POST Rental Master Table Data Upload api # commented on Sept 8,2025

// app.post("/api/cc/rental/product/upload", (req, res) => {


//    //Database Update Logic
//    try
//    {
//    var con = dbConnection();
//    con.connect();
//    //console.log('Connected to database.' +con);
 
//    //Data from the req parameters
 
 
//    console.log("Received Request at Node End : "+JSON.stringify (req.body))
//    var ProductName = req.body.productName;
//    var ProductType = req.body.productType;
//    var ProductBrandName = req.body.productBrandName;
//    var ProductImageURL = req.body.productImageURL;
//    var ProductUsageGender = req.body.productUsageGender;
//    var ProductUsageOccasion = req.body.productUsageOccasion;
//    var ProductOrigin = req.body.productOrigin;
//    var ProductCategory = req.body.productCategory;
//    //var ProductCategoryID = req.body.productCategoryID
//    var ProductPriceBand = req.body.productPriceBand;
//    var ProductPrice = req.body.productPrice;
//    var ProductPurchasePrice = req.body.productPurchasePrice;
//    var ProductAvailability = req.body.productAvailability;
//    var Remarks = req.body.remarks;
//    var OwningAuthority = req.body.owningAuthority;
   
 
 
 
//    var sql = "INSERT INTO CC_RentalProductMaster (ProductName,ProductType,ProductBrandName, ProductImageURL, ProductUsageGender, ProductUsageOccasion, ProductOrigin, ProductCategory,ProductPriceBand, ProductPrice,ProductPurchasePrice,ProductAvailability,Remarks, OwningAuthority) VALUES ('"+ProductName+"','"+ProductType+"','"+ProductBrandName+"', '"+ProductImageURL+"','"+ProductUsageGender+"','"+ProductUsageOccasion+"','"+ProductOrigin+"','"+ProductCategory+"','"+ProductPriceBand+"','"+ProductPrice+"','"+ProductPurchasePrice+"','"+ProductAvailability+"','"+Remarks+"', '"+OwningAuthority+"')";  
                          
//    con.query(sql, function (err, result) {  
//   //  if (err) throw err;  
//   if (err) console.log(err);
//    console.log("1 record inserted");  
//    console.log("Result"+result.data);  
//    });  
//    // con.end();
 
//    res.status(201).json({ Status: "Data Upload completed Successfully" });
 
 
//  } catch (error) {
//    console.error('Error uploading data to AWS DB:', error);
//    res.status(500).json({ error: 'Internal Server Error' });
//  }

// });

// Post Rental Master Table New version  , Sept 8,2025



// app.post("/api/cc/rental/product/upload", async (req, res) => {
//   const conn = dbConnection(); // already promise-enabled

//   const {
//     productName,
//     productType,
//     productBrandName,
//     productImageURLs,
//     productUsageGender,
//     productUsageOccasion,
//     productOrigin,
//     productCategory,
//     productPriceBand,
//     productPrice,
//     productPurchasePrice,
//     productAvailability,
//     remarks,
//     owningAuthority
//   } = req.body;

//   try {
//     await conn.beginTransaction();

//     const occasionValue = Array.isArray(productUsageOccasion)
//   ? productUsageOccasion.join(",")
//   : productUsageOccasion;


//     const [insertResult] = await conn.query(
//       `INSERT INTO CC_RentalProductMaster
//         (ProductName, ProductType, ProductBrandName, ProductImageURL,
//          ProductUsageGender, ProductUsageOccasion, ProductOrigin, ProductCategory,
//          ProductPriceBand, ProductPrice, ProductPurchasePrice,
//          ProductAvailability, Remarks, OwningAuthority)
//        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
//       [
//         productName,
//         productType,
//         productBrandName,
//         Array.isArray(productImageURLs) ? productImageURLs.join(",") : productImageURLs,
//         productUsageGender,
//         occasionValue,
//         productOrigin,
//         productCategory,
//         productPriceBand,
//         productPrice,
//         productPurchasePrice,
//         productAvailability,
//         remarks,
//         owningAuthority
//       ]
//     );

//     const newProductID = insertResult.insertId;

//     // Optional: if you later keep a CC_ProductImages table
//     if (Array.isArray(productImageURLs) && productImageURLs.length) {
//       const values = productImageURLs.map(url => [newProductID, url]);
//       await conn.query(
//         "INSERT INTO CC_ProductImages (ProductID, ImageURL) VALUES ?",
//         [values]
//       );
//     }

//     await conn.commit();
//     conn.end(); // close

//     res.status(201).json({
//       status: "Data Upload completed successfully",
//       productId: newProductID
//     });
//   } catch (err) {
//     console.error("Error uploading data:", err);
//     try { await conn.rollback(); } catch (e) {}
//     conn.end();
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// Rental Preoduct Upload

//Version 1

// app.post("/api/cc/rental/product/upload", (req, res) => {
//   const conn = dbConnection(); // returns plain mysql2 connection (NO .promise())

//   const {
//     productName,
//     productType,
//     productBrandName,
//     productImageURL,
//     productUsageGender,
//     productUsageOccasion,
//     productOrigin,
//     productCategory,
//     productPriceBand,
//     productPrice,
//     productPurchasePrice,
//     productAvailability,
//     remarks,
//     owningAuthority
//   } = req.body;

//   // convert arrays to comma string
//   const occasionValue = Array.isArray(productUsageOccasion)
//     ? productUsageOccasion.join(",")
//     : productUsageOccasion;
//   const imageValue = Array.isArray(productImageURL)
//     ? productImageURL.join(",")
//     : productImageURL;

//   conn.beginTransaction((txErr) => {
//     if (txErr) {
//       console.error("Begin transaction failed:", txErr);
//       conn.end();
//       return res.status(500).json({ error: "DB transaction error" });
//     }

//     const insertSql = `
//       INSERT INTO CC_RentalProductMaster
//       (ProductName, ProductType, ProductBrandName, ProductImageURL,
//        ProductUsageGender, ProductUsageOccasion, ProductOrigin, ProductCategory,
//        ProductPriceBand, ProductPrice, ProductPurchasePrice,
//        ProductAvailability, Remarks, OwningAuthority)
//       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

//     const insertParams = [
//       productName,
//       productType,
//       productBrandName,
//       imageValue,
//       productUsageGender,
//       occasionValue,
//       productOrigin,
//       productCategory,
//       productPriceBand,
//       productPrice,
//       productPurchasePrice,
//       productAvailability,
//       remarks,
//       owningAuthority
//     ];

//     conn.query(insertSql, insertParams, (insErr, insertResult) => {
//       if (insErr) {
//         console.error("Insert failed:", insErr);
//         return conn.rollback(() => {
//           conn.end();
//           res.status(500).json({ error: "Insert failed" });
//         });
//       }

//       const newProductID = insertResult.insertId;

//       // If extra image table
//       if (Array.isArray(productImageURL) && productImageURL.length) {
//         const values = productImageURL.map((url) => [newProductID, url]);
//         conn.query(
//           "INSERT INTO CC_ProductImages (ProductID, ImageURL) VALUES ?",
//           [values],
//           (imgErr) => {
//             if (imgErr) {
//               console.error("Image insert failed:", imgErr);
//               return conn.rollback(() => {
//                 conn.end();
//                 res.status(500).json({ error: "Image insert failed" });
//               });
//             }
//             commitAndRespond(newProductID);
//           }
//         );
//       } else {
//         commitAndRespond(newProductID);
//       }

//       function commitAndRespond(id) {
//         conn.commit((commitErr) => {
//           conn.end();
//           if (commitErr) {
//             console.error("Commit failed:", commitErr);
//             return res.status(500).json({ error: "Commit failed" });
//           }
//           res.status(201).json({
//             status: "Data Upload completed successfully",
//             productId: id,
//           });
//         });
//       }
//     });
//   });
// });


// Version 2 : Pool Fixes

app.post("/api/cc/rental/product/upload", (req, res) => {
  const pool = dbConnection(); // ✅ returns a pool

  const {
    productName,
    productType,
    productBrandName,
    productImageURL,
    productUsageGender,
    productUsageOccasion,
    productOrigin,
    productCategory,
    productPriceBand,
    productPrice,
    productPurchasePrice,
    productAvailability,
    remarks,
    owningAuthority
  } = req.body;

  // convert arrays to comma string
  const occasionValue = Array.isArray(productUsageOccasion)
    ? productUsageOccasion.join(",")
    : productUsageOccasion;
  const imageValue = Array.isArray(productImageURL)
    ? productImageURL.join(",")
    : productImageURL;

  pool.getConnection((err, conn) => {
    if (err) {
      console.error("DB connection error:", err);
      return res.status(500).json({ error: "DB connection failed" });
    }

    conn.beginTransaction((txErr) => {
      if (txErr) {
        console.error("Begin transaction failed:", txErr);
        conn.release();
        return res.status(500).json({ error: "DB transaction error" });
      }

      const insertSql = `
        INSERT INTO CC_RentalProductMaster
        (ProductName, ProductType, ProductBrandName, ProductImageURL,
         ProductUsageGender, ProductUsageOccasion, ProductOrigin, ProductCategory,
         ProductPriceBand, ProductPrice, ProductPurchasePrice,
         ProductAvailability, Remarks, OwningAuthority)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      const insertParams = [
        productName,
        productType,
        productBrandName,
        imageValue,
        productUsageGender,
        occasionValue,
        productOrigin,
        productCategory,
        productPriceBand,
        productPrice,
        productPurchasePrice,
        productAvailability,
        remarks,
        owningAuthority
      ];

      conn.query(insertSql, insertParams, (insErr, insertResult) => {
        if (insErr) {
          console.error("Insert failed:", insErr);
          return rollback(conn, res, "Insert failed", insErr);
        }

        const newProductID = insertResult.insertId;

        // If extra image table
        if (Array.isArray(productImageURL) && productImageURL.length) {
          const values = productImageURL.map((url) => [newProductID, url]);
          conn.query(
            "INSERT INTO CC_ProductImages (ProductID, ImageURL) VALUES ?",
            [values],
            (imgErr) => {
              if (imgErr) {
                console.error("Image insert failed:", imgErr);
                return rollback(conn, res, "Image insert failed", imgErr);
              }
              commitAndRespond(newProductID);
            }
          );
        } else {
          commitAndRespond(newProductID);
        }

        function commitAndRespond(id) {
          conn.commit((commitErr) => {
            if (commitErr) {
              console.error("Commit failed:", commitErr);
              return rollback(conn, res, "Commit failed", commitErr);
            }
            res.status(201).json({
              status: "Data Upload completed successfully",
              productId: id,
            });
            conn.release(); // ✅ release connection back to pool
          });
        }
      });
    });
  });
});

// rollback helper
function rollback(conn, res, msg, err) {
  console.error(msg, err || "");
  conn.rollback(() => {
    conn.release(); // ✅ release to pool
    res.status(500).json({ error: msg });
  });
}





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
     //connection.end();
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
      // con.end();
      res.json({ token, userName: user.name,userId: user.mobile,userEmail: user.email , pId : pId , userRole : user.role});

    });
  });


  // CC Password Reset API's
  app.post('/api/cc/users/reset-password', async (req, res) => {
    const { mobile, password } = req.body;
  
    if (!mobile || !password) {
      return res.status(400).json({ error: 'Mobile and password required' });
    }
  
    try {
      var con = dbConnection();
      con.connect();
  
      // Check if user exists
      const checkUserQuery = 'SELECT id FROM CC_Users WHERE mobile = ?';
      con.query(checkUserQuery, [mobile], async (err, results) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        if (results.length === 0)
          return res.status(404).json({ error: 'Mobile number not registered' });
  
        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
  
        const updateQuery = 'UPDATE CC_Users SET password = ? WHERE mobile = ?';
        con.query(updateQuery, [hashedPassword, mobile], (err, result) => {
          if (err) return res.status(500).json({ error: 'Failed to reset password' });
  
          res.status(200).json({ message: 'Password updated successfully' });
        });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
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
    // con.end();
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

//  app.post('/api/cc/order', async (req, res) => {
//   const { deliveryDetails, cart, totals ,userId} = req.body;

//     const connection = dbConnection();

//     connection.beginTransaction((err) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }

//         // Insert delivery details
//         const deliveryQuery = `
//             INSERT INTO CC_Delivery_Details (first_name, last_name, email, mobile_number, address, landmark, city, pincode, order_notes, delivery_type, return_pickup, return_address, return_landmark, return_city, return_pincode)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;
//         const deliveryValues = [
//             deliveryDetails.firstName,
//             deliveryDetails.lastName,
//             deliveryDetails.email,
//             deliveryDetails.mobileNumber,
//             deliveryDetails.address,
//             deliveryDetails.landmark,
//             deliveryDetails.city,
//             deliveryDetails.pincode,
//             deliveryDetails.orderNotes,
//             deliveryDetails.deliveryType,
//             deliveryDetails.returnPickup,
//             deliveryDetails.returnAddress,
//             deliveryDetails.returnLandmark,
//             deliveryDetails.returnCity,
//             deliveryDetails.returnPincode
//         ];

//         connection.query(deliveryQuery, deliveryValues, (err, deliveryResult) => {
//             if (err) {
//                 return connection.rollback(() => {
//                     res.status(500).json({ error: err.message });
//                 });
//             }

//             const deliveryId = deliveryResult.insertId;
//             var orderDate = moment().format('YYYY-MM-DD HH:mm:ss');
//             //var orderDate = new Date().toLocaleString('en-GB').replace(',', '').replace(/\//g, '-').replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1');


//             // Insert order
//             const orderQuery = `
//                 INSERT INTO CC_Orders (delivery_details_id, products_price, security_deposit, total_amount,order_date,order_status,user_id,payment_type)
//                 VALUES (?, ?, ?, ?,?,?,?,?)
//             `;

//             const orderStatus = "Created"
//             const orderValues = [
//                 deliveryId,
//                 totals.productsPrice,
//                 totals.securityDeposit,
//                 totals.totalAmount,
//                 //new Date().toISOString().replace('T', ' ').substring(0, 19),
//                 orderDate,
//                 orderStatus,
//                 userId,
//                 deliveryDetails.paymentType
//             ];

//             connection.query(orderQuery, orderValues, (err, orderResult) => {
//                 if (err) {
//                     return connection.rollback(() => {
//                         res.status(500).json({ error: err.message });
//                     });
//                 }

//                 const orderId = orderResult.insertId;

//                 // Insert cart items
//                 const cartQuery = `
//                     INSERT INTO CC_Order_Items (order_id, product_id, name, size, duration, delivery_date, return_date, quantity, price, image_url)
//                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//                 `;

//                 let cartPromises = cart.map(item => {
//                     return new Promise((resolve, reject) => {
//                         const cartValues = [
//                             orderId,
//                             item.id,
//                             item.name,
//                             item.size,
//                             item.duration,
//                             item.deliveryDate,
//                             item.returnDate,
//                             item.quantity,
//                             item.price,
//                             item.imageURL
//                         ];

//                         connection.query(cartQuery, cartValues, (err) => {
//                             if (err) {
//                                 return reject(err);
//                             }
//                             resolve();
//                         });
//                     });
//                 });

//                 Promise.all(cartPromises)
//                     .then(() => {
//                         connection.commit((err) => {
//                             if (err) {
//                                 return connection.rollback(() => {
//                                     res.status(500).json({ error: err.message });
//                                 });
//                             }
//                             res.status(201).json({ message: "Order Created Successfully",order_id: orderId});
//                         });
//                     })
//                     .catch((err) => {
//                         connection.rollback(() => {
//                             res.status(500).json({ error: err.message });
//                         });
//                     });
//             });
//         });
//     });
// });


// Version 2 - working version



// app.post('/api/cc/order', (req, res) => {
//   const { deliveryDetails, cart, totals, userId } = req.body;

//   const pool = dbConnection();

//   pool.getConnection((err, connection) => {
//     if (err) {
//       console.error("DB connection error", err);
//       return res.status(500).json({ error: "DB connection error" });
//     }

//     connection.beginTransaction(async (err) => {
//       if (err) {
//         connection.release();
//         return res.status(500).json({ error: err.message });
//       }

//       try {
//         // --- Insert delivery details ---
//         const deliveryQuery = `
//           INSERT INTO CC_Delivery_Details 
//           (first_name, last_name, email, mobile_number, address, landmark, city, pincode, order_notes, delivery_type, return_pickup, return_address, return_landmark, return_city, return_pincode)
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;
//         const deliveryValues = [
//           deliveryDetails.firstName,
//           deliveryDetails.lastName,
//           deliveryDetails.email,
//           deliveryDetails.mobileNumber,
//           deliveryDetails.address,
//           deliveryDetails.landmark,
//           deliveryDetails.city,
//           deliveryDetails.pincode,
//           deliveryDetails.orderNotes,
//           deliveryDetails.deliveryType,
//           deliveryDetails.returnPickup,
//           deliveryDetails.returnAddress,
//           deliveryDetails.returnLandmark,
//           deliveryDetails.returnCity,
//           deliveryDetails.returnPincode
//         ];

//         const [deliveryResult] = await connection.promise().query(deliveryQuery, deliveryValues);
//         const deliveryId = deliveryResult.insertId;

//         const orderDate = moment().format('YYYY-MM-DD HH:mm:ss');
//         const orderStatus = "Created";

//         // --- Insert order ---
//         const orderQuery = `
//           INSERT INTO CC_Orders 
//           (delivery_details_id, products_price, security_deposit, total_amount, order_date, order_status, user_id, payment_type)
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//         `;
//         const orderValues = [
//           deliveryId,
//           totals.productsPrice,
//           totals.securityDeposit,
//           totals.totalAmount,
//           orderDate,
//           orderStatus,
//           userId,
//           deliveryDetails.paymentType
//         ];

//         const [orderResult] = await connection.promise().query(orderQuery, orderValues);
//         const orderId = orderResult.insertId;

//         // --- Insert cart items ---
//         const cartQuery = `
//           INSERT INTO CC_Order_Items 
//           (order_id, product_id, name, size, duration, delivery_date, return_date, quantity, price, image_url)
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;

//         for (let item of cart) {
//           const cartValues = [
//             orderId,
//             item.id,
//             item.name,
//             item.size,
//             item.duration,
//             item.deliveryDate,
//             item.returnDate,
//             item.quantity,
//             item.price,
//             item.imageURL
//           ];
//           await connection.promise().query(cartQuery, cartValues);
//         }

//         // --- Commit transaction ---
//         await connection.promise().commit();
//         res.status(201).json({ message: "Order Created Successfully", order_id: orderId });

//       } catch (err) {
//         console.error("Order creation failed", err);
//         await connection.promise().rollback();
//         res.status(500).json({ error: err.message });
//       } finally {
//         connection.release(); // ✅ always release back to pool
//       }
//     });
//   });
// });


// Version 3 - Whatsapp Integration


const axios = require("axios");

app.post('/api/cc/order', (req, res) => {
  const { deliveryDetails, cart, totals, userId } = req.body;
  const pool = dbConnection();

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("DB connection error", err);
      return res.status(500).json({ error: "DB connection error" });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: err.message });
      }

      try {
        const deliveryQuery = `
          INSERT INTO CC_Delivery_Details 
          (first_name, last_name, email, mobile_number, address, landmark, city, pincode, order_notes, delivery_type, return_pickup, return_address, return_landmark, return_city, return_pincode)
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
              connection.release();
              res.status(500).json({ error: err.message });
            });
          }

          const deliveryId = deliveryResult.insertId;
          const orderDate = moment().format('YYYY-MM-DD HH:mm:ss');
          const orderStatus = "Created";

          const orderQuery = `
            INSERT INTO CC_Orders 
            (delivery_details_id, products_price, security_deposit, total_amount, order_date, order_status, user_id, payment_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const orderValues = [
            deliveryId,
            totals.productsPrice,
            totals.securityDeposit,
            totals.totalAmount,
            orderDate,
            orderStatus,
            userId,
            deliveryDetails.paymentType
          ];

          connection.query(orderQuery, orderValues, (err, orderResult) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ error: err.message });
              });
            }

            const orderId = orderResult.insertId;

            // Insert all cart items
            const cartQuery = `
              INSERT INTO CC_Order_Items 
              (order_id, product_id, name, size, duration, delivery_date, return_date, quantity, price, image_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            let insertTasks = cart.map(item => {
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
                  if (err) return reject(err);
                  resolve();
                });
              });
            });

            Promise.all(insertTasks)
              .then(() => {
                connection.commit(async (err) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      res.status(500).json({ error: err.message });
                    });
                  }

                  connection.release();

                  // ✅ Trigger WhatsApp Message
                  sendWhatsAppMessage(
                    deliveryDetails.mobileNumber,
                    orderId,
                    deliveryDetails.firstName,
                  );

                  res.status(201).json({ message: "Order Created Successfully", order_id: orderId });
                });
              })
              .catch(err => {
                connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ error: err.message });
                });
              });
          });
        });
      } catch (err) {
        connection.rollback(() => {
          connection.release();
          res.status(500).json({ error: err.message });
        });
      }
    });
  });
});


// --- WhatsApp Function ---
async function sendWhatsAppMessage(mobileNumber, orderId, customerName) {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

    const data = {
      messaging_product: "whatsapp",
      to: mobileNumber, // Example: "91xxxxxxxxxx"
      type: "template",
      template: {
        name: "order_confirmation", // replace with your approved template name
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              {type : "text", text: customerName},
              { type: "text", text: orderId.toString() },
              { type: "text", text: "978887555" }
            ]
          }
        ]
      }
    };

    await axios.post(url, data, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log("✅ WhatsApp message sent successfully");
  } catch (err) {
    console.error("❌ WhatsApp send failed:", err.response?.data || err.message);
  }
}




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

  } 
  // finally {
  //   if (con) // con.end();
  
  // }

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
      // con.end();

      // Send the result as a response
      res.status(200).json({data :orders});

  } catch (error) {
    // con.end();
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
      // con.end();
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
    // con.end();
    console.log("Connection Ended ");
});



// Endpoint to handle tailoring booking order creation
// app.post('/api/cc/tailoringOrder', async (req, res) => {
//   const {
//       name,
//       email,
//       phone,
//       stitchType,
//       customDesignImage, // Assuming this is a file path or some kind of identifier
//       address,
//       city,
//       pincode,
//       orderNotes,
//       appointmentDate,
//       userId,
//       productId,
//       productImageURL,
//       owningAuthority,
//       productPrice,
//       paymentType,
//   } = req.body;

//   // GMT to IST Conversion

//   const appointmentDateUTC = new Date(appointmentDate);

//   const appointmentDateIST = new Date(appointmentDateUTC);
//   appointmentDateIST.setHours(appointmentDateIST.getHours() + 5);
//   appointmentDateIST.setMinutes(appointmentDateIST.getMinutes() + 30);


// var orderId = ""

//   console.log("Appointment DateRECEIVED FROM FRONT END :" +JSON.stringify(req.body.appointmentDate))
//   console.log("Appoinment date direct value " +appointmentDate)

//   try
//   {
//   var con = dbConnection();
//   con.connect();
//   } catch (error) {
//     console.error('DB Connection Error', error);
//     res.status(500).json({ error: 'DB Connection Error' });
//   }

//   const transporter = mailConfig();

//   con.beginTransaction((err) => {
//       if (err) {
//           return res.status(500).json({ error: err.message });
//       }

      

//       // Insert tailoring details
//       const tailoringQuery = `
//           INSERT INTO CC_Tailoring_Order_Details (name, email, phone, stitch_option, custom_design, address, city, pincode, order_notes, appointment_date,product_id,product_image_url,partner)
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)
//       `;
//       const tailoringValues = [
//           name,
//           email,
//           phone,
//           stitchType,
//           (customDesignImage.length>0) ? customDesignImage : "",
//           address,
//           city,
//           pincode,
//           orderNotes,
//           appointmentDate ? moment(appointmentDateIST).format('YYYY-MM-DD HH:mm:ss') : null,
//          // appointmentDate ? appointmentDate : null,
//           productId,
//           productImageURL,
//           owningAuthority
//       ];

      
//       con.query(tailoringQuery, tailoringValues, (err, tailoringResult) => {
//           if (err) {
//               return con.rollback(() => {
//                   res.status(500).json({ error: err.message });
//               });
//           }

//           const tailoringId = tailoringResult.insertId;
//           const orderDate = moment().format('YYYY-MM-DD HH:mm:ss');
//           const orderStatus = "Created";

//           // Insert order related to tailoring
//           const orderQuery = `
//               INSERT INTO CC_Tailoring_Orders (tailoring_details_id, order_date, order_status, user_id, partner,products_price,payment_type)
//               VALUES (?, ?, ?, ?, ?, ?, ?)
//           `;

//           const orderValues = [
//               tailoringId,
//               orderDate,
//               orderStatus,
//               userId,
//               owningAuthority,
//               productPrice,
//               paymentType
//           ];

//           con.query(orderQuery, orderValues, (err, orderResult) => {
//               if (err) {
//                   return con.rollback(() => {
//                       res.status(500).json({ error: err.message });
//                       // con.end();
//                   });
//               }

//               console.log("Order Results " +JSON.stringify(orderResult))
//               orderId = orderResult.insertId

//               con.commit((err) => {
//                   if (err) {
//                       return con.rollback(() => {
//                           res.status(500).json({ error: err.message });
//                       });
//                   }

//                   sendOrderConfirmationEmail(email, name);
//                   console.log("Order_Id :" +orderId )
//                   res.status(201).json({ message: 'Tailoring order placed successfully', order_id: orderId});
//                   // con.end();
//               });
//           });
//       });

//        // Function to send registration email
//   const sendOrderConfirmationEmail = (userEmail, userName) => {
//     // Set the correct path to the HTML template
//     const templatePath = path.join(__dirname, 'emailTemplates', 'tailoringOrderConfirmationTemplate.html');
  
//     // Read the HTML template file
//     fs.readFile(templatePath, 'utf-8', (err, htmlTemplate) => {
//       if (err) {
//         console.error('Error reading the email template file:', err);
//         return;
//       }
  
//       // Replace {{userName}} with the actual user's name
//       // const emailHtml = htmlTemplate.replace('{{userName}}', userName);

//       const emailHtml = htmlTemplate
//       .replace('{{orderId}}', orderId)
//       .replace('{{userName}}', userName)
//       .replace('{{appointmentDate}}' , appointmentDateIST)
//       .replace('{{orderDetails}}' , stitchType)
//       .replace('{{userEmail}}',email)

  
//       // Define email options
//       const mailOptions = {
//         from: '"Cotton Candy Support" <support@cottoncandy.co.in>',
//         to: userEmail,
//         subject: 'Tailoring Order Confirmed',
//         html: emailHtml,
//       };
  
//       // Send the email
//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           res.status(500).json({ message: 'Failure in Email Delivery ' +error });
//         } else {
//           res.status(201).json({ message: 'Tailoring order placed successfully ' +info.response , order_id: orderId });
//         }
//       });
//     });
//   };
//   });
 

// });


// Version 2 - Pool Fix

app.post('/api/cc/tailoringOrder', async (req, res) => {
  const {
    name,
    email,
    phone,
    stitchType,
    customDesignImage,
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
    totalAmount,
    hasLining,
    liningPrice,
    stitchingSpeed,
    speedPrice,
    paymentType,
  } = req.body;

  // Convert appointmentDate from GMT → IST
  const appointmentDateUTC = new Date(appointmentDate);
  const appointmentDateIST = new Date(appointmentDateUTC);
  appointmentDateIST.setHours(appointmentDateIST.getHours() + 5);
  appointmentDateIST.setMinutes(appointmentDateIST.getMinutes() + 30);

  let orderId = "";
  console.log("Appointment Date received from FE:", req.body.appointmentDate);
  console.log("AppointmentDate direct value:", appointmentDate);

  const pool = dbConnection(); // ✅ returns pool
  const transporter = mailConfig();

  pool.getConnection((err, con) => {
    if (err) {
      console.error("DB connection error", err);
      return res.status(500).json({ error: "DB Connection Error" });
    }

    con.beginTransaction((txErr) => {
      if (txErr) {
        con.release();
        return res.status(500).json({ error: txErr.message });
      }

      // Insert tailoring details
      const tailoringQuery = `
        INSERT INTO CC_Tailoring_Order_Details 
        (name, email, phone, stitch_option, custom_design, address, city, pincode, order_notes, appointment_date, product_id, product_image_url, partner, has_lining, lining_price, stitching_speed, speed_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const tailoringValues = [
        name,
        email,
        phone,
        stitchType,
        (customDesignImage && customDesignImage.length > 0) ? customDesignImage : "",
        address,
        city,
        pincode,
        orderNotes,
        appointmentDate ? moment(appointmentDateIST).format("YYYY-MM-DD HH:mm:ss") : null,
        productId,
        productImageURL,
        owningAuthority,
        hasLining,
        liningPrice,
        stitchingSpeed,
        speedPrice
      ];

      con.query(tailoringQuery, tailoringValues, (err, tailoringResult) => {
        if (err) return rollback(con, res, "Tailoring insert failed", err);

        const tailoringId = tailoringResult.insertId;
        const orderDate = moment().format("YYYY-MM-DD HH:mm:ss");
        const orderStatus = "Created";

        // Insert order
        const orderQuery = `
          INSERT INTO CC_Tailoring_Orders (tailoring_details_id, order_date, order_status, user_id, partner, products_price, total_amount, payment_type)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const orderValues = [
          tailoringId,
          orderDate,
          orderStatus,
          userId,
          owningAuthority,
          productPrice,
          totalAmount,
          paymentType
        ];

        con.query(orderQuery, orderValues, (err, orderResult) => {
          if (err) return rollback(con, res, "Tailoring order insert failed", err);

          orderId = orderResult.insertId;

// New Changes for order customisation logic Begins

        const selectedCustomizations = req.body.selectedCustomizations || [];

        if (selectedCustomizations.length > 0) {

          const customizationInsertQuery = `
            INSERT INTO CC_OrderCustomization (OrderID, CustomizationID)
            VALUES ?
          `;

          const values = selectedCustomizations.map(id => [orderId, id]);

          con.query(customizationInsertQuery, [values], (err) => {
            if (err) return rollback(con, res, "Customization insert failed", err);

            finalizeOrder();
          });

        } else {
          finalizeOrder();
        }

        function finalizeOrder() {
          con.commit((commitErr) => {
            if (commitErr) return rollback(con, res, "Commit failed", commitErr);

            res.status(201).json({
              message: "Tailoring order placed successfully",
              order_id: orderId
            });

            con.release();
          });
        }


// New Changes for order customisation logic Ends


          con.commit((commitErr) => {
            if (commitErr) return rollback(con, res, "Commit failed", commitErr);

            sendOrderConfirmationEmail(email, name, orderId, appointmentDateIST, stitchType);
            console.log("Tailoring Order_Id:", orderId);
            res.status(201).json({
              message: "Tailoring order placed successfully",
              order_id: orderId
            });
            con.release(); // ✅ release back to pool
          });
        });
      });
    });

    // Email function
    function sendOrderConfirmationEmail(userEmail, userName, orderId, appointmentDateIST, stitchType) {
      const templatePath = path.join(__dirname, "emailTemplates", "tailoringOrderConfirmationTemplate.html");

      fs.readFile(templatePath, "utf-8", (err, htmlTemplate) => {
        if (err) {
          console.error("Error reading the email template file:", err);
          return;
        }

        const emailHtml = htmlTemplate
          .replace("{{orderId}}", orderId)
          .replace("{{userName}}", userName)
          .replace("{{appointmentDate}}", appointmentDateIST)
          .replace("{{orderDetails}}", stitchType)
          .replace("{{userEmail}}", email);

        const mailOptions = {
          from: '"Cotton Candy Support" <support@cottoncandy.co.in>',
          to: userEmail,
          subject: "Tailoring Order Confirmed",
          html: emailHtml,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Email delivery failed", error);
          } else {
            console.log("Tailoring order email sent:", info.response);
          }
        });
      });
    }
  });
});

// Rollback helper
function rollback(con, res, msg, err) {
  console.error(msg, err || "");
  con.rollback(() => {
    con.release(); // ✅ release to pool
    res.status(500).json({ error: msg });
  });
}


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

// app.patch('/api/orders/:orderId/update', async (req, res) => {

//   const orderId = req.params.orderId;

//   const {orderStatus,orderAssignment, updatedBy }= req.body;


//   try
//   {
//   var con = dbConnection();
//   con.connect();
//   } catch (error) {
//     console.error('DB Connection Error', error);
//     res.status(500).json({ error: 'DB Connection Error' });
//   }

//   //const currentDate = new Date()
  

//   const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

// // Convert the formatted date to YYYY-MM-DD HH:MM:SS format
// const [datePart, timePart] = currentDate.split(', ');
// const [month, day, year] = datePart.split('/');

// // Format the date as YYYY-MM-DD HH:MM:SS
// const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${timePart}`;

//   const query = `
//   UPDATE CC_Orders 
//   SET 
//     order_assignment = ?, 
//     order_status = ?, 
//     updated_by = ?, 
//     last_updated_date = ? 
//   WHERE 
//     id = ?;
// `;

//   con.query(query, [orderAssignment, orderStatus, updatedBy, formattedDate,orderId], (err, result) => {
//     if (err) {
//       console.error('Error updating order status:', err);
//       return res.status(205).json({ message: err });
//     }
//     // con.end();
//     res.status(201).json({ message: 'Order Status Updated Successfully' });



//   console.log("orderId :" +req.params.orderId)
//   console.log("orderStatus" +orderStatus + "Order Assignment" +orderAssignment)
 
// });

// });


// // Tailoring Order Workflow updates

// app.patch('/api/tailoring/orders/:orderId/update', async (req, res) => {

//   const orderId = req.params.orderId;

//   const {orderStatus,orderAssignment, updatedBy }= req.body;


//   try
//   {
//   var con = dbConnection();
//   con.connect();
//   } catch (error) {
//     console.error('DB Connection Error', error);
//     res.status(500).json({ error: 'DB Connection Error' });
//   }

//   //const currentDate = new Date()
  

//   const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

// // Convert the formatted date to YYYY-MM-DD HH:MM:SS format
// const [datePart, timePart] = currentDate.split(', ');
// const [month, day, year] = datePart.split('/');

// // Format the date as YYYY-MM-DD HH:MM:SS
// const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${timePart}`;

//   const query = `
//   UPDATE CC_Tailoring_Orders 
//   SET 
//     order_assignment = ?, 
//     order_status = ?, 
//     updated_by = ?, 
//     last_updated_date = ? 
//   WHERE 
//     order_id = ?;
// `;

//   con.query(query, [orderAssignment, orderStatus, updatedBy, formattedDate,orderId], (err, result) => {
//     if (err) {
//       console.error('Error updating order status:', err);
//       return res.status(205).json({ message: err });
//     }
//     // con.end();
//     res.status(201).json({ message: 'Order Status Updated Successfully' });



//   console.log("orderId :" +req.params.orderId)
//   console.log("orderStatus" +orderStatus + "Order Assignment" +orderAssignment)
 
// });

// });


const STATUS_FLOW = [
  'Created',
  'Processing',
  'Stitching',
  'Quality Check',
  'Ready',
  'Delivered',
  'Completed'
];

app.patch('/api/tailoring/orders/:orderId/update', async (req, res) => {
  const { orderStatus, orderAssignment, updatedBy } = req.body;
  const orderId = req.params.orderId;

  const con = dbConnection();
  con.connect();

  try {
    const [rows] = await con.promise().query(
      `SELECT order_status FROM CC_Tailoring_Orders WHERE order_id=?`,
      [orderId]
    );

    const currentStatus = rows[0].order_status;

    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    const newIndex = STATUS_FLOW.indexOf(orderStatus);

    if (newIndex > currentIndex + 1) {
      return res.status(400).json({
        message: 'Cannot skip workflow stages'
      });
    }

    await con.promise().query(
      `UPDATE CC_Tailoring_Orders 
       SET order_status=?, order_assignment=?, updated_by=?, last_updated_date=NOW()
       WHERE order_id=?`,
      [orderStatus, orderAssignment, updatedBy, orderId]
    );

    res.status(200).json({ message: 'Updated Successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// app.post('/api/businessPartnerRegistration', async (req, res) => {

// const {name, aadharImageURL, address , contact, email , pincode, city, state, availability,partnerType} = req.body;


// console.log("aadharImage URL :" +aadharImageURL)


// });

// API TO REGISTER Business Partners

// Version 1

// app.post('/api/businessPartnerRegistration', async (req, res) => {
//   const { email, name, businessName, address, city, pincode, aadharImageURL, password, role, user_type, mobile, partnerType, availability } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);

//   const transporter = mailConfig();

//     // Function to send registration email
//     const sendRegistrationEmail = (userEmail, userName) => {
//       // Set the correct path to the HTML template
//       const templatePath = path.join(__dirname, 'emailTemplates', 'registrationEmailTemplate.html');
    
//       // Read the HTML template file
//       fs.readFile(templatePath, 'utf-8', (err, htmlTemplate) => {
//         if (err) {
//           console.error('Error reading the email template file:', err);
//           return;
//         }
    
//         // Replace {{userName}} with the actual user's name
//         const emailHtml = htmlTemplate.replace('{{userName}}', userName);
    
//         // Define email options
//         const mailOptions = {
//           from: '"Cotton Candy Support" <support@cottoncandy.co.in>',
//           to: userEmail,
//           subject: 'Welcome to Cotton Candy!',
//           html: emailHtml,
//         };
    
//         // Send the email
//         transporter.sendMail(mailOptions, (error, info) => {
//           if (error) {
//             res.status(500).json({ message: 'Failure in Email Delivery ' +error });
//           } else {
//             res.status(201).json({ message: 'Tailoring order placed successfully ' +info.response });
//           }
//         });
//       });
//     };



//   // Validate required fields

//   console.log("Incoming Request:" +email + name +mobile +partnerType)
//   if (!email || !name || !mobile || !partnerType) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

  

//   try
//   {
//   var con = dbConnection();
//   con.connect();
//   } catch (error) {
//     console.error('DB Connection Error', error);
//     res.status(500).json({ error: 'DB Connection Error' });
//   }
  
//   try {
 
//     // Start transaction
//     await new Promise((resolve, reject) => {
//       con.beginTransaction(err => {
//         if (err) reject(err);
//         else resolve();
//       });
//     });

//     // Insert into CC_Users table
//     const insertUserQuery = `INSERT INTO CC_Users (email, name, address, city, password, role, user_type, mobile) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
//     const userValues = [email, name, address, city, hashedPassword, role, user_type, mobile];

//     await new Promise((resolve, reject) => {
//       con.query(insertUserQuery, userValues, (err, results) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(results);
//         }
//       });
//     });

//     // Generate unique partner ID (PID)
//     // const pid = uuidv4();

//         // Generate next PID in the format P0001, P0002, etc.
//         const pid = await generateNextPid(con);


//     // Insert into CC_Partners table with mobile as foreign key
//     const insertPartnerQuery = `INSERT INTO CC_Partners (pid, mobile, partner_type, availability,address,city,pincode,business_name,id_proof) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
//     const partnerValues = [pid, mobile, partnerType, availability,address,city,pincode,businessName,aadharImageURL];

//     await new Promise((resolve, reject) => {
//       con.query(insertPartnerQuery, partnerValues, (err, results) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(results);
//         }
//       });
//     });

//     // Commit transaction
//     await new Promise((resolve, reject) => {
//       con.commit(err => {
//         if (err) reject(err);
//         else resolve();
//       });
//     });
    
   
//     res.status(201).json({ message: 'Business partner registered successfully!', pid, mobile });
//    sendRegistrationEmail(email,name);
//   } catch (error) {
//     // Rollback transaction in case of error
//     await new Promise((resolve, reject) => {
//       con.rollback(err => {
//         if (err) reject(err);
//         else resolve();
//       });
//     });

//     console.error('Error during business partner registration:', error);
//     res.status(500).json({ error: 'Business partner registration failed' });

//   } finally {
//     // con.end(); // Close the connection
//   }

    

// });


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
//     // con.end();

//     res.status(200).json({ message: 'Service details uploaded successfully' });
//   } catch (error) {
//     // If an error occurs, roll back the transaction
//     if (con) await con.rollback();

//     console.error('Error during service upload:', error);
//     res.status(500).json({ error: 'Failed to upload service details' });
//   }
// });


// Version 2 : Pool Fix

app.post('/api/businessPartnerRegistration', async (req, res) => {
  const {
    email,
    name,
    businessName,
    address,
    city,
    pincode,
    aadharImageURL,
    password,
    role,
    user_type,
    mobile,
    partnerType,
    availability
  } = req.body;

  if (!email || !name || !mobile || !partnerType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const transporter = mailConfig();
  const pool = dbConnection(); // ✅ returns pool

  // email helper
  function sendRegistrationEmail(userEmail, userName) {
    const templatePath = path.join(__dirname, 'emailTemplates', 'registrationEmailTemplate.html');
    fs.readFile(templatePath, 'utf-8', (err, htmlTemplate) => {
      if (err) {
        console.error('Error reading the email template file:', err);
        return;
      }
      const emailHtml = htmlTemplate.replace('{{userName}}', userName);
      const mailOptions = {
        from: '"Cotton Candy Support" <support@cottoncandy.co.in>',
        to: userEmail,
        subject: 'Welcome to Cotton Candy!',
        html: emailHtml,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Email delivery failed", error);
        } else {
          console.log("Partner registration email sent:", info.response);
        }
      });
    });
  }

  pool.getConnection(async (err, con) => {
    if (err) {
      console.error('DB connection error', err);
      return res.status(500).json({ error: 'DB Connection Error' });
    }

    try {
      await new Promise((resolve, reject) => {
        con.beginTransaction(err => (err ? reject(err) : resolve()));
      });

      // Insert into CC_Users
      const insertUserQuery = `
        INSERT INTO CC_Users (email, name, address, city, password, role, user_type, mobile)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await new Promise((resolve, reject) => {
        con.query(insertUserQuery,
          [email, name, address, city, hashedPassword, role, user_type, mobile],
          (err, results) => err ? reject(err) : resolve(results)
        );
      });

      // Generate next PID
      const pid = await generateNextPid(con);

      // Insert into CC_Partners
      const insertPartnerQuery = `
        INSERT INTO CC_Partners (pid, mobile, partner_type, availability, address, city, pincode, business_name, id_proof)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await new Promise((resolve, reject) => {
        con.query(insertPartnerQuery,
          [pid, mobile, partnerType, availability, address, city, pincode, businessName, aadharImageURL],
          (err, results) => err ? reject(err) : resolve(results)
        );
      });

      // Commit transaction
      await new Promise((resolve, reject) => {
        con.commit(err => (err ? reject(err) : resolve()));
      });

      res.status(201).json({ message: 'Business partner registered successfully!', pid, mobile });
      sendRegistrationEmail(email, name);

    } catch (error) {
      console.error('Error during business partner registration:', error);
      await new Promise((resolve) => {
        con.rollback(() => resolve());
      });
      res.status(500).json({ error: 'Business partner registration failed' });
    } finally {
      con.release(); // ✅ release back to pool
    }
  });
});


//Version 1

// app.post('/api/service/upload', async (req, res) => {
//   const { partnerId, serviceId, brandUsed, willingToTravel, paymentPolicy, refundPolicy, finalPaymentDueOn, variants, portfolioImages } = req.body;

//   console.log("Final Payment Due on " +finalPaymentDueOn)
//   // Check for missing fields
//   if (!partnerId || !serviceId || !variants || !portfolioImages) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   try {
//     var con = dbConnection().promise();
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
//         refundPolicy,
//       ]);
//     });

//     // Wait for all variant insertions to complete
//     await Promise.all(variantInsertPromises);

//     // Prepare portfolioImages as a single string
//     const portfolioImagesString = portfolioImages.toString(); // This should already be a single comma-separated string
//     console.log('Portfolio Images String:', portfolioImagesString);

//     // Insert portfolio images as a single string (comma-separated)
//     const sqlInsertPortfolio = `
//       INSERT INTO CC_Service_Portfolio 
//       (partner_id, service_id, image_url, description)
//       VALUES (?, ?, ?, ?)
//     `;

//     // Ensure portfolioImages is treated as a single string
//     await con.query(sqlInsertPortfolio, [
//       partnerId,
//       serviceId,
//       portfolioImagesString,  // This should be a single string now
//       '' // Optional description (empty for now)
//     ]);

//     //  Insert into payment rules table

//     const paymentQuery = `
//     INSERT INTO CC_Service_Payment_Rules (partner_id,service_id, advance_percentage, remaining_due_on, refund_policy)
//     VALUES (?, ?, ?, ?, ?)
//   `;
//   const paymentValues = [partnerId, serviceId, paymentPolicy, finalPaymentDueOn, refundPolicy];

//   await con.query(paymentQuery, paymentValues);

//     // Insert into payment rules table

//     // Commit transaction
//     await con.commit();
//     // con.end();

//     res.status(200).json({ message: 'Service details uploaded successfully' });
//   } catch (error) {
//     // If an error occurs, roll back the transaction
//     if (con) await con.rollback();

//     console.error('Error during service upload:', error);
//     res.status(500).json({ error: 'Failed to upload service details' });
//   }
// });


// Version 2 : Pool Fix

app.post('/api/service/upload', async (req, res) => {
  const {
    partnerId,
    serviceId,
    brandUsed,
    willingToTravel,
    paymentPolicy,
    refundPolicy,
    finalPaymentDueOn,
    variants,
    portfolioImages
  } = req.body;

  console.log("Final Payment Due on " + finalPaymentDueOn);

  // Validate required fields
  if (!partnerId || !serviceId || !variants || !portfolioImages) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const pool = dbConnection(); // ✅ pool, not single connection

  pool.getConnection(async (err, con) => {
    if (err) {
      console.error("DB connection error", err);
      return res.status(500).json({ error: "DB connection failed" });
    }

    try {
      await con.beginTransaction();

      // Insert each variant
      for (const variant of variants) {
        const { variantName, description, price } = variant;
        const sqlInsertVariant = `
          INSERT INTO CC_Service_Variants 
          (partner_id, service_id, variant_name, description, price, brand_used, willing_to_travel, policies)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await con.query(sqlInsertVariant, [
          partnerId,
          serviceId,
          variantName,
          description,
          price,
          brandUsed,
          willingToTravel === 'true' ? 1 : 0,
          refundPolicy,
        ]);
      }

      // Insert portfolio images (comma-separated)
      const portfolioImagesString = Array.isArray(portfolioImages)
        ? portfolioImages.join(",")
        : portfolioImages;

      const sqlInsertPortfolio = `
        INSERT INTO CC_Service_Portfolio 
        (partner_id, service_id, image_url, description)
        VALUES (?, ?, ?, ?)
      `;
      await con.query(sqlInsertPortfolio, [
        partnerId,
        serviceId,
        portfolioImagesString,
        "" // description left empty
      ]);

      // Insert payment rules
      const paymentQuery = `
        INSERT INTO CC_Service_Payment_Rules 
        (partner_id, service_id, advance_percentage, remaining_due_on, refund_policy)
        VALUES (?, ?, ?, ?, ?)
      `;
      await con.query(paymentQuery, [
        partnerId,
        serviceId,
        paymentPolicy,
        finalPaymentDueOn,
        refundPolicy
      ]);

      await con.commit();
      res.status(200).json({ message: "Service details uploaded successfully" });
    } catch (error) {
      await con.rollback();
      console.error("Error during service upload:", error);
      res.status(500).json({ error: "Failed to upload service details" });
    } finally {
      con.release(); // ✅ always release back to pool
    }
  });
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
//     if (con) // con.end();
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
  } 
  // finally {
  //   if (con) // con.end();
  // }
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
  } 
  // finally {
  //   if (con) // con.end();
  // }
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
  } 
  // finally {
  //   if (con) // con.end();
  // }
});


// Api to modify parnter service details - By Partner

// app.post('/api/cc/partner/services', async (req, res) => {

//   console.log("data Received from partner service is :" +JSON.stringify(req.body))

//   let con;
//   try {
//     // Establishing a DB connection
//     con = dbConnection();
//     con.connect();
//   } catch (error) {
//     console.error('DB Connection Error', error);
//     return res.status(500).json({ error: 'DB Connection Error' });
//   }

// });


app.post('/api/cc/partner/services', async (req, res) => {
  console.log("Data received from partner service:", JSON.stringify(req.body));

  const { deletedVariants, modifiedVariants, partner_id, service_id } = req.body;
  let con;

  try {
    con = dbConnection();
    con.connect();

    } catch (error) {
    console.error('DB Connection Error', error);
    return res.status(500).json({ error: 'DB Connection Error' });
  }

    try{

    // **1. DELETE Variants**
    if (deletedVariants && deletedVariants.length > 0) {
      const deleteIds = deletedVariants.map(v => v.variant_id);
      const deleteQuery = `DELETE FROM CC_Service_Variants WHERE variant_id IN (?)`;
      await con.promise().query(deleteQuery, [deleteIds]);
      console.log(`Deleted variants: ${deleteIds.join(", ")}`);
    }

    // **2. UPDATE & INSERT Variants**
    if (modifiedVariants && modifiedVariants.length > 0) {
      for (const variant of modifiedVariants) {
        if (variant.variant_id) {
          // Update existing variant
          const updateQuery = `
            UPDATE CC_Service_Variants 
            SET variant_name = ?, description = ?, price = ? 
            WHERE variant_id = ?`;
          await con.promise().query(updateQuery, [
            variant.variant_name,
            variant.description,
            variant.price,
            variant.variant_id
          ]);
          console.log(`Updated variant: ${variant.variant_id}`);
        } else {
          // Insert new variant
          const insertQuery = `
            INSERT INTO CC_Service_Variants (partner_id, service_id, variant_name, description, price) 
            VALUES (?, ?, ?, ?, ?)`;
          const [result] = await con.promise().query(insertQuery, [
            partner_id,  // Make sure to include this in your request
            service_id,  // Make sure to include this in your request
            variant.variant_name,
            variant.description,
            variant.price
          ]);
          console.log(`Inserted new variant with ID: ${result.insertId}`);
        }
      }
    }

    res.status(200).json({ message: "Service variants updated successfully" });

  } catch (error) {
    console.error("Error updating variants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
  //  finally {
  //   if (con) // con.end();
  // }
});

// mehendi service booking
app.post('/api/cc/mehendi/service/booking', async (req, res) => {
  const {
      name,
      email,
      variant,
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


  // Variant and price extract

      const [variantName, variantPrice] = variant.split('-');
  console.log('Type:', variantName);
  console.log('Price:', variantPrice);

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



  const query = 'INSERT INTO CC_Mehendi_Service_Bookings (name, contact_number, email, address, city, pincode,service_id,variant_id,service_date,service_time,user_id,booking_date,booking_status,order_notes,total_price,variant_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)';
  con.query(query, [name, phoneNumber, email, address, city, pincode, serviceId, variantId, serviceDateIST, serviceTime, userId, bookingDate,bookingStatus,remarks,variantPrice,variantName], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(205).json({ message: err });
    }

    orderId = result.insertId
    // con.end();
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
//     // con.end();
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
//       // con.end(); // Close DB connection
//       if (err) {
//         console.error('Error inserting booking:', err);
//         return res.status(500).json({ error: 'Database Insertion Failed' });
//       }
//       res.status(201).json({ message: 'Booking successful', bookingId: result.insertId });
//     });

//   } catch (error) {
//     console.error('Server error:', error);
//     // con.end();
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

    // con.end();
    res.status(201).json({ message: 'Booking successful', bookingId, advanceAmount, remainingAmount });

  } catch (error) {
    console.error('Server error:', error);
    // con.end();
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

    // con.end();
    res.status(200).json({ message: 'Payment updated successfully', remainingAmount, paymentStatus: newPaymentStatus });

  } catch (error) {
    console.error('Payment update error:', error);
    // con.end();
    res.status(500).json({ error: 'Payment update failed' });
  }
});




// app.get('/api/cc/tailoring/orders', async (req, res) => {
//   let con;
//   try {
//     con = dbConnection();
//     con.connect();
//   } catch (error) {
//     return res.status(500).json({ error: 'DB Connection Error' });
//   }

//   const { search = '', showAll = 'false' } = req.query;

//   let conditions = [];
//   let values = [];

//   if (showAll === 'false') {
//     conditions.push(`o.order_status NOT IN ('Completed','Cancelled')`);
//   }

//   if (search) {
//     conditions.push(`
//       (o.order_id LIKE ?
//       OR tod.name LIKE ?
//       OR tod.phone LIKE ?
//       OR DATE(tod.appointment_date) LIKE ?)
//     `);
//     values.push(`%${search}%`,`%${search}%`,`%${search}%`,`%${search}%`);
//   }

//   const query = `
//     SELECT 
//       o.*,
//       tod.*
//     FROM CC_Tailoring_Orders o
//     INNER JOIN CC_Tailoring_Order_Details tod
//     ON o.tailoring_details_id = tod.tailoring_id
//     ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
//     ORDER BY tod.appointment_date ASC
//   `;

//   try {
//     const [orders] = await con.promise().query(query, values);
//     res.status(200).json({ data: orders });
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching orders' });
//   }
// });


app.get('/api/cc/tailoring/orders', async (req, res) => {
  let con;
  try {
    con = dbConnection();
    con.connect();
  } catch (error) {
    return res.status(500).json({ error: 'DB Connection Error' });
  }

  const { search = '', showAll = 'false' } = req.query;

  let conditions = [];
  let values = [];

  if (showAll === 'false') {
    conditions.push(`o.order_status NOT IN ('Completed','Cancelled')`);
  }

  if (search) {
    conditions.push(`
      (o.order_id LIKE ?
      OR tod.name LIKE ?
      OR tod.phone LIKE ?
      OR DATE(tod.appointment_date) LIKE ?)
    `);
    values.push(`%${search}%`,`%${search}%`,`%${search}%`,`%${search}%`);
  }

  const query = `
    SELECT 
      o.*,
      tod.*,
      oc.OrderCustomizationID,
      pc.CustomizationID,
      pc.CustomizationName,
      pc.CustomizationImageURL,
      pc.PriceAdjustment
    FROM CC_Tailoring_Orders o
    INNER JOIN CC_Tailoring_Order_Details tod
      ON o.tailoring_details_id = tod.tailoring_id
    LEFT JOIN CC_OrderCustomization oc
      ON o.order_id = oc.OrderID
    LEFT JOIN CC_ProductCustomization pc
      ON oc.CustomizationID = pc.CustomizationID
    ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
    ORDER BY tod.appointment_date ASC
  `;

  try {
    const [rows] = await con.promise().query(query, values);

    // 🔥 GROUP CUSTOMIZATIONS PER ORDER
    const ordersMap = {};

    rows.forEach(row => {
      const orderId = row.order_id;

      if (!ordersMap[orderId]) {
        ordersMap[orderId] = {
          ...row,
          customizations: []
        };
      }

      if (row.CustomizationID) {
        ordersMap[orderId].customizations.push({
          customizationId: row.CustomizationID,
          name: row.CustomizationName,
          image: row.CustomizationImageURL,
          priceAdjustment: row.PriceAdjustment
        });
      }
    });

    const finalOrders = Object.values(ordersMap);

    res.status(200).json({ data: finalOrders });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});




// Tailoring Order Page (User perspective)

app.get('/api/cc/tailoring/orders/active/:userId', async (req, res) => {
  const { userId } = req.params;
  let con;

  try {
    con = dbConnection();
    con.connect();

    const query = `
      SELECT 
        o.order_id,
        o.order_date,
        o.products_price,
        o.security_deposit,
        o.total_amount,
        o.products_price,
        o.order_status,
        o.payment_status,
        tod.product_image_url,
        tod.stitch_option,
        tod.appointment_date,
        tod.city,
        tod.product_id,
        tod.has_lining,
        tod.lining_price,
        tod.stitching_speed,
        tod.speed_price
      FROM CC_Tailoring_Orders o
      INNER JOIN CC_Tailoring_Order_Details tod 
        ON o.tailoring_details_id = tod.tailoring_id
      WHERE o.user_id = ?
      AND o.order_status NOT IN ('Completed','Cancelled')
      ORDER BY o.order_date DESC
    `;

    const [orders] = await con.promise().query(query, [userId]);
    res.status(200).json({ data: orders });

  } catch (err) {
    res.status(500).json({ error: 'Error fetching active orders' });
  }
});


// Order History

app.get('/api/cc/tailoring/orders/history/:userId', async (req, res) => {
  let con;
  const { userId } = req.params;

  try {
    // DB connection
    con = dbConnection();
    con.connect();
  } catch (error) {
    console.error('DB Connection Error', error);
    return res.status(500).json({ error: 'DB Connection Error' });
  }

  try {
    const query = `
      SELECT 
        o.order_id,
        o.order_date,
        o.products_price,
        o.security_deposit,
        o.total_amount,
        o.products_price,
        o.order_status,
        o.payment_status,
        o.payment_type,
        o.payment_date,
        o.order_assignment,
        o.partner,

        tod.tailoring_id,
        tod.name,
        tod.phone,
        tod.email,
        tod.stitch_option,
        tod.custom_design,
        tod.product_image_url,
        tod.address,
        tod.city,
        tod.pincode,
        tod.order_notes,
        tod.appointment_date,
        tod.product_id,
        tod.has_lining,
        tod.lining_price,
        tod.stitching_speed,
        tod.speed_price

      FROM CC_Tailoring_Orders o
      INNER JOIN CC_Tailoring_Order_Details tod 
        ON o.tailoring_details_id = tod.tailoring_id

      WHERE o.user_id = ?
      AND o.order_status IN ('Completed','Cancelled')

      ORDER BY o.order_date DESC
    `;

    const [orders] = await con.promise().query(query, [userId]);

    res.status(200).json({ data: orders });

  } catch (error) {
    console.error('Error fetching tailoring order history:', error);
    res.status(500).json({ error: 'Error fetching tailoring order history' });
  }
});


// get Tailoring customization features

app.get('/api/cc/tailoring/productDetails', (req, res) => {

  var connection = dbConnection();
  connection.connect();

  const productId = req.query.productId;

  if (!productId) {
    return res.status(400).json({ error: "ProductID is required" });
  }

  console.log("Fetching Product Details for ProductID: " + productId);

  // 1️⃣ Fetch product details
  const productQuery = `
    SELECT * FROM CC_ProductMaster
    WHERE ProductID = ?
    AND ProductStatus = 'Active'
  `;

  connection.query(productQuery, [productId], (err, productData) => {
    if (err) throw err;

    if (productData.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = productData[0];

    // 2️⃣ Fetch customizations
    const customizationQuery = `
      SELECT 
        c.CategoryID,
        c.CategoryName,
        pc.CustomizationID,
        pc.CustomizationName,
        pc.CustomizationImageURL,
        pc.PriceAdjustment
      FROM CC_ProductCustomization pc
      JOIN CC_CustomizationCategory c 
        ON pc.CategoryID = c.CategoryID
      WHERE pc.ProductID = ?
      AND pc.IsActive = 1
      AND c.IsActive = 1
      ORDER BY c.CategoryID
    `;

    connection.query(customizationQuery, [productId], (err, customizationData) => {
      if (err) throw err;

      // Group by category
      const groupedCustomizations = {};

      customizationData.forEach(item => {
        if (!groupedCustomizations[item.CategoryID]) {
          groupedCustomizations[item.CategoryID] = {
            CategoryID: item.CategoryID,
            CategoryName: item.CategoryName,
            Options: []
          };
        }

        groupedCustomizations[item.CategoryID].Options.push({
          CustomizationID: item.CustomizationID,
          CustomizationName: item.CustomizationName,
          CustomizationImageURL: item.CustomizationImageURL,
          PriceAdjustment: item.PriceAdjustment
        });
      });

      res.json({
        product,
        customizations: Object.values(groupedCustomizations)
      });

      // connection.end(); (if you close elsewhere, leave it)
    });

  });

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
//   // con.end();
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
//   // con.end();
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
    // con.end();
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
  // con.end();
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
          // con.end();
          return;
      }

      if (questions.length === 0) {
          res.status(404).json({ message: 'No questions found for this test.' });
          // con.end();
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
              // con.end();
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
          // con.end();
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
    // con.end();
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
          // con.end();
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
          // con.end();
          res.status(200).json({ message: 'OTP sent successfully' });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
    // con.end();
  } 
});

app.post('/api/ip/reset/password/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;
  try
  {
  var con = dbConnection();
  con.connect();
  } catch (error) {
    // con.end();
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
  }

  try {
    const query = 'SELECT * FROM IP_Users_OTP WHERE mobile = ? AND otp = ? AND expires_at > NOW()';
    con.query(query, [mobile, otp], (err, result) => {
      if (err || result.length === 0) {
        return res.status(401).json({ error: 'Invalid or expired OTP' });
      }
      // con.end();
      res.status(200).json({ message: 'OTP verified' });
      
    });
  } catch (error) {
    // con.end();
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
    // con.end();
    res.status(500).json({ error: 'DB Connection Error' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'UPDATE IP_Users SET password = ? WHERE mobile = ?';
    con.query(query, [hashedPassword, mobile], (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.status(500).json({ error: 'Failed to reset password' });
      }
      // con.end();
      res.status(200).json({ message: 'Password reset successfully' });
    });
  } catch (error) {
    // con.end();
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

//     // con.end();
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

    // con.end();
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
//   // con.end();
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
    // con.end();
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
      // con.end();
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

    // con.end();
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
//     // con.end();
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
//       // con.end();
//       return res.status(404).json({ error: 'No test results found for this candidate.' });
//     }

//     const testResults = results[0];

//     // con.end();
//     console.log('Connection Ended');
//     return res.status(200).json({ data: { testResults } });
//   } catch (error) {
//     console.error('Query Error:', error);
//     // con.end();
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
    // con.end();
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
      // con.end();
      return res.status(404).json({ error: 'No test results found for this candidate.' });
    }

    // con.end();
    console.log('Connection Ended');
    return res.status(200).json({ data: { testResults: results } });
  } catch (error) {
    console.error('Query Error:', error);
    // con.end();
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
//     // con.end();
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

//     // con.end();
//     console.log('Connection Ended');

//     return res.status(200).json({
//       assignedCandidates,
//       attendedCandidates,
//       notAttendedCandidates,
//     });
//   } catch (error) {
//     console.error('Query Error:', error);
//     // con.end();
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
    // con.end();
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

    // con.end();
    console.log('Connection Ended');

    return res.status(200).json({data:{
      assignedCandidates,
      attendedCandidates,
      notAttendedCandidates,
    }});
  } catch (error) {
    console.error('Query Error:', error);
    // con.end();
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
    // con.end();
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
        // con.end();
        return res.status(500).json({ error: 'Error fetching students list' });
      }

      // Respond with the results
      res.status(200).json({data:{ student: results }});
      // con.end();
    });
  } catch (error) {
    console.error('Query Error:', error);
    // con.end();
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

      // con.end();
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
  } 
  finally {
    // con.end();
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

      // con.end();
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
    // con.end();
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
    // con.end();
  }
});


// Course and Subject Creation api 

// Version 1

// app.post('/api/ip/course/creation', async (req, res) => {
//   const { courseName, courseDescription, subjects, userId,institute } = req.body;

//   if (!courseName) {
//     return res.status(400).json({ error: "Course name is required" });
//   }

//   let con;
//   try {
//     con = dbConnection();
//     con.connect();
//     await new Promise((resolve, reject) => con.beginTransaction(err => err ? reject(err) : resolve()));

//     // Insert course into IP_Course
//     const courseInsertQuery = `INSERT INTO IP_Courses (user_id,institute,course_name, course_description) VALUES (?,?, ?, ?)`;
//     const [courseResult] = await con.promise().query(courseInsertQuery, [userId, institute,courseName, courseDescription || ""]);
//     const courseId = courseResult.insertId;

//     // Insert subjects if they exist
//     if (subjects && subjects.length > 0) {
//       const subjectInsertQuery = `INSERT INTO IP_Subjects (name, course_id) VALUES ?`;
//       const subjectValues = subjects.map(subject => [subject, courseId]);
//       await con.promise().query(subjectInsertQuery, [subjectValues]);
//     }

//     await new Promise((resolve, reject) => con.commit(err => err ? reject(err) : resolve()));
//     res.status(201).json({ message: "Course created successfully", courseId });

//   } catch (error) {
//     if (con) await new Promise((resolve, reject) => con.rollback(err => err ? reject(err) : resolve()));
//     console.error("Error creating course:", error);
//     res.status(500).json({ error: "Internal Server Error" });

//   }
//   //  finally {
//   //   if (con) // con.end();
//   // }
// });


// Version 2 : Pool Fix

app.post('/api/ip/course/creation', async (req, res) => {
  const { courseName, courseDescription, subjects, userId, institute } = req.body;

  if (!courseName) {
    return res.status(400).json({ error: "Course name is required" });
  }

  const pool = dbConnection(); // ✅ use pool
  pool.getConnection(async (err, con) => {
    if (err) {
      console.error("DB connection error", err);
      return res.status(500).json({ error: "DB connection failed" });
    }

    try {
      await con.beginTransaction();

      // Insert course
      const courseInsertQuery = `
        INSERT INTO IP_Courses (user_id, institute, course_name, course_description)
        VALUES (?, ?, ?, ?)
      `;
      const [courseResult] = await con.query(courseInsertQuery, [
        userId,
        institute,
        courseName,
        courseDescription || ""
      ]);
      const courseId = courseResult.insertId;

      // Insert subjects if provided
      if (Array.isArray(subjects) && subjects.length > 0) {
        const subjectInsertQuery = `
          INSERT INTO IP_Subjects (name, course_id) VALUES ?
        `;
        const subjectValues = subjects.map(subject => [subject, courseId]);
        await con.query(subjectInsertQuery, [subjectValues]);
      }

      await con.commit();
      res.status(201).json({
        message: "Course created successfully",
        courseId,
      });
    } catch (error) {
      await con.rollback();
      console.error("Error creating course:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      con.release(); // ✅ always release connection
    }
  });
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
    // con.end();
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


// Get Mehendi order api

app.get('/api/mehendi/booking', (req, res) => {
  let con;
  //const bookingId = req.params.id;

  try {
    con = dbConnection();
    con.connect();

    const query = 'SELECT * FROM CC_Mehendi_Service_Bookings';
    con.query(query, (err, results) => {
      if (err) {
        console.error('Query Error', err);
        res.status(500).json({ error: 'Error fetching booking details' });
      } else if (results.length === 0) {
        res.status(404).json({ message: 'Booking not found' });
      } else {
        res.json({ data: results, status: 'success' });
      }
    });
  } catch (error) {
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
  }
});


// Update Mehendi order api

app.post('/api/mehendi/booking/update', (req, res) => {
  let con;
  const { id, booking_status, order_notes } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Booking ID is required' });
  }

  try {
    con = dbConnection();
    con.connect();

    const query = `
      UPDATE CC_Mehendi_Service_Bookings 
      SET booking_status = ?, order_notes = ?
      WHERE id = ?
    `;
    con.query(query, [booking_status, order_notes, id], (err, result) => {
      if (err) {
        console.error('Update Error', err);
        res.status(500).json({ error: 'Error updating booking' });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Booking not found' });
      } else {
        res.json({ message: 'Booking updated successfully', status: 'success' });
      }
    });
  } catch (error) {
    console.error('DB Connection Error', error);
    res.status(500).json({ error: 'DB Connection Error' });
  }
});


// Product Managements API Codes 

// ---------- Get All Rental Products ---------------

// app.get("/api/products", (req, res) => {
//   var con = dbConnection();
//   con.connect();

//   con.query("SELECT * FROM CC_RentalProductMaster", (err, result) => {
//     if (err) {
//       console.error("Error fetching products:", err);
//       return res.status(500).json({ error: "DB error" });
//     }
//     res.json(result);
//   });

//   // con.end();
// });

app.get("/api/products", (req, res) => {
  var con = dbConnection();
  con.connect();

  const sql = `
    SELECT 
      p.ProductID,
      p.ProductBrandName,
      p.Remarks,
      p.ProductType,
      p.OwningAuthority,
      p.ProductName,
      p.ProductUsageGender,
      p.ProductUsageOccasion,
      p.ProductUsageAgeRange,
      p.ProductOrigin,
      p.ProductUsageFrequency,
      p.ProductUserReview,
      p.ProductPrice,
      p.ProductPurchasePrice,
      p.ProductPriceBand,
      p.ProductAvailability,
      p.ProductNextAvailabilityDate,
      p.ProductCategory,
      p.ProductStatus,
      -- ✅ pick first image from CC_ProductImages by SortOrder
      (SELECT i.ImageURL 
         FROM CC_ProductImages i 
        WHERE i.ProductID = p.ProductID 
        ORDER BY i.SortOrder ASC, i.ImageID ASC 
        LIMIT 1) AS ProductImageURL
    FROM CC_RentalProductMaster p
  `;

  con.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(result);
  });

  // con.end();
});


// ---------- Get product details ----------
app.get('/api/products/:id', (req, res) => {
  try {
    const productId = req.params.id;
    var con = dbConnection();
    con.connect();

    con.query(
      `SELECT ProductID, ProductName, ProductBrandName, Remarks, ProductType,
              OwningAuthority, ProductUsageGender, ProductUsageOccasion,
              ProductUsageAgeRange, ProductOrigin, ProductUsageFrequency,
              ProductUserReview, ProductPrice, ProductPurchasePrice,
              ProductPriceBand, ProductAvailability, ProductNextAvailabilityDate,
              ProductCategory, ProductStatus
       FROM CC_RentalProductMaster
       WHERE ProductID = ?`,
      [productId],
      (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Server Error' });
        }
        if (!rows.length) return res.status(404).json({ error: 'Product not found' });
        res.json(rows[0]);
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ---------- Update product details ----------
app.post('/api/products/:id', (req, res) => {
  try {
    const productId = req.params.id;
    const body = req.body;
    var con = dbConnection();
    con.connect();

    con.query(
      `UPDATE CC_RentalProductMaster
       SET ProductName=?, ProductBrandName=?, Remarks=?, ProductType=?,
           OwningAuthority=?, ProductUsageGender=?, ProductUsageOccasion=?,
           ProductUsageAgeRange=?, ProductOrigin=?, ProductUsageFrequency=?,
           ProductUserReview=?, ProductPrice=?, ProductPurchasePrice=?,
           ProductPriceBand=?, ProductAvailability=?, ProductNextAvailabilityDate=?,
           ProductCategory=?, ProductStatus=?
       WHERE ProductID=?`,
      [
        body.ProductName, body.ProductBrandName, body.Remarks, body.ProductType,
        body.OwningAuthority, body.ProductUsageGender, body.ProductUsageOccasion,
        body.ProductUsageAgeRange, body.ProductOrigin, body.ProductUsageFrequency,
        body.ProductUserReview, body.ProductPrice, body.ProductPurchasePrice,
        body.ProductPriceBand, body.ProductAvailability, body.ProductNextAvailabilityDate,
        body.ProductCategory, body.ProductStatus,
        productId
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Server Error' });
        }
        res.json({ message: 'Product updated successfully' });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ---------- Get product images ----------
app.get('/api/products/:id/images', (req, res) => {
  try {
    const productId = req.params.id;
    var con = dbConnection();
    con.connect();

    con.query(
      `SELECT ImageID, ProductID, ImageURL, SortOrder
       FROM CC_ProductImages
       WHERE ProductID = ?
       ORDER BY SortOrder ASC`,
      [productId],
      (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Server Error' });
        }
        res.json(rows);
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ---------- Upload new images ----------
app.post('/api/products/:id/images', upload.array('photos', 10), async (req, res) => {
  try {
    const productId = req.params.id;
    const uploadedImageURLs = [];

    const promises = req.files.map(async (file, index) => {
      // Resize and compress
      const resizedBuffer = await sharp(file.buffer)
        .rotate()
        .resize(800, 800, { fit: sharp.fit.inside, withoutEnlargement: true })
        .toFormat('jpeg', { quality: 80 })
        .toBuffer();

      const params = {
        Bucket: 'snektoawsbucket',
        Key: `gb_ground/${uuidv4()}_${file.originalname}`,
        Body: resizedBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      };

      const data = await s3.upload(params).promise();
      uploadedImageURLs.push({ url: data.Location, order: index });
    });

    await Promise.all(promises);

    var con = dbConnection();
    con.connect();

    uploadedImageURLs.forEach((img) => {
      con.query(
        `INSERT INTO CC_ProductImages (ProductID, ImageURL, SortOrder)
         VALUES (?, ?, ?)`,
        [productId, img.url, img.order],
        (err) => {
          if (err) console.error('DB insert error:', err);
        }
      );
    });

    res.status(200).json({ imageURLs: uploadedImageURLs.map(i => i.url) });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ---------- Delete image ----------
app.post('/api/products/:id/images/delete', (req, res) => {
  try {
    const { imageId } = req.body;
    var con = dbConnection();
    con.connect();

    con.query(`DELETE FROM CC_ProductImages WHERE ImageID = ?`, [imageId], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server Error' });
      }
      res.json({ message: 'Image deleted successfully' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ---------- Reorder images ----------
app.post('/api/products/:id/images/reorder', (req, res) => {
  try {
    const { order } = req.body; // [{ imageId, displayOrder }, ...]
    var con = dbConnection();
    con.connect();

    order.forEach((item) => {
      con.query(
        `UPDATE CC_ProductImages SET SortOrder=? WHERE ImageID=?`,
        [item.displayOrder, item.imageId],
        (err) => {
          if (err) console.error('Reorder update error:', err);
        }
      );
    });

    res.json({ message: 'Reorder saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});


// ------------ The Funeral Company ----------------

// Coffin Purchase API

// app.post('/api/coffins/purchase', (req, res) => {
//   const {
//     customer,
//     shippingAddress,
//     productId,
//     size,
//     customizations = [],
//     quantity = 1,
//     deliveryDate,
//     collectionDate = null,
//     notes = ''
//   } = req.body;

//   if (!productId || !deliveryDate || !customer?.phone) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   let con;
//   try {
//     con = dbConnection();
//     con.connect();

//     con.beginTransaction(err => {
//       if (err) return res.status(500).json({ error: 'Transaction start failed' });

//       // Step 1: Upsert customer
//       con.query('SELECT id FROM customers WHERE phone = ? LIMIT 1', [customer.phone], (err, rows) => {
//         if (err) return rollback(con, res, 'Customer lookup failed', err);

//         const handleCustomer = (customerId) => {
//           // Step 2: Insert product
//           con.query('SELECT * FROM products WHERE id = ? LIMIT 1', [productId], (err, productRows) => {
//             if (err || !productRows.length) return rollback(con, res, 'Product not found', err);
//             const product = productRows[0];

//             // Step 3: Customizations
//             if (customizations.length) {
//               con.query('SELECT id, label, price FROM product_customizations WHERE id IN (?)', [customizations], (err, cRows) => {
//                 if (err) return rollback(con, res, 'Customization lookup failed', err);
//                 finishOrder(customerId, product, cRows);
//               });
//             } else {
//               finishOrder(customerId, product, []);
//             }
//           });
//         };

//         if (rows.length) {
//           const customerId = rows[0].id;
//           con.query('UPDATE customers SET name=?, email=? WHERE id=?', [customer.name, customer.email, customerId], (err) => {
//             if (err) return rollback(con, res, 'Customer update failed', err);
//             handleCustomer(customerId);
//           });
//         } else {
//           con.query('INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)', [customer.name, customer.phone, customer.email], (err, result) => {
//             if (err) return rollback(con, res, 'Customer insert failed', err);
//             handleCustomer(result.insertId);
//           });
//         }
//       });

//       function finishOrder(customerId, product, customizationRows) {
//         const customSum = customizationRows.reduce((s, c) => s + Number(c.price), 0);
//         const unitPrice = Number(product.base_price) + customSum;
//         const totalPrice = unitPrice * quantity;

//         // Insert order
//         con.query('INSERT INTO orders (customer_id, order_type, total_price, status, payment_status) VALUES (?, ?, ?, ?, ?)',
//           [customerId, 'product', totalPrice, 'pending', 'unpaid'], (err, orderRes) => {
//             if (err) return rollback(con, res, 'Order insert failed', err);
//             const orderId = orderRes.insertId;

//             // Insert order_items
//             con.query('INSERT INTO order_items (order_id, item_type, item_ref, name, unit_price, quantity, subtotal, customizations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
//               [orderId, 'product', product.id, product.name, unitPrice, quantity, totalPrice, JSON.stringify(customizationRows)], (err) => {
//                 if (err) return rollback(con, res, 'Order items insert failed', err);

//                 // Insert product_orders
//                 con.query(`INSERT INTO product_orders (order_id, product_id, size, delivery_date, collection_date, notes)
//                            VALUES (?, ?, ?, ?, ?, ?)`,
//                   [orderId, product.id, size, deliveryDate, collectionDate, notes], (err) => {
//                     if (err) return rollback(con, res, 'Product order insert failed', err);

//                     con.commit(err => {
//                       if (err) return rollback(con, res, 'Commit failed', err);
//                       res.json({ orderId, status: 'pending', total: totalPrice, message: 'Coffin order created' });
//                     });
//                   });
//               });
//           });
//       }
//     });
//   } catch (error) {
//     console.error('coffin purchase exception', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// Version 2 : Pool Fix

app.post('/api/coffins/purchase', (req, res) => {
  const {
    customer,
    shippingAddress,
    productId,
    size,
    customizations = [],
    quantity = 1,
    deliveryDate,
    collectionDate = null,
    notes = ''
  } = req.body;

  if (!productId || !deliveryDate || !customer?.phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const pool = dbConnection(); // ✅ use pool
  pool.getConnection((err, con) => {
    if (err) {
      console.error('DB connection error', err);
      return res.status(500).json({ error: 'DB connection failed' });
    }

    con.beginTransaction(err => {
      if (err) {
        con.release();
        return res.status(500).json({ error: 'Transaction start failed' });
      }

      // Step 1: Upsert customer
      con.query('SELECT id FROM customers WHERE phone = ? LIMIT 1', [customer.phone], (err, rows) => {
        if (err) return rollback(con, res, 'Customer lookup failed', err);

        const handleCustomer = (customerId) => {
          // Step 2: Fetch product
          con.query('SELECT * FROM products WHERE id = ? LIMIT 1', [productId], (err, productRows) => {
            if (err || !productRows.length) return rollback(con, res, 'Product not found', err);
            const product = productRows[0];

            // Step 3: Handle customizations
            if (customizations.length) {
              con.query(
                'SELECT id, label, price FROM product_customizations WHERE id IN (?)',
                [customizations],
                (err, cRows) => {
                  if (err) return rollback(con, res, 'Customization lookup failed', err);
                  finishOrder(customerId, product, cRows);
                }
              );
            } else {
              finishOrder(customerId, product, []);
            }
          });
        };

        if (rows.length) {
          const customerId = rows[0].id;
          con.query(
            'UPDATE customers SET name=?, email=? WHERE id=?',
            [customer.name, customer.email, customerId],
            (err) => {
              if (err) return rollback(con, res, 'Customer update failed', err);
              handleCustomer(customerId);
            }
          );
        } else {
          con.query(
            'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
            [customer.name, customer.phone, customer.email],
            (err, result) => {
              if (err) return rollback(con, res, 'Customer insert failed', err);
              handleCustomer(result.insertId);
            }
          );
        }
      });

      // Step 4: Finalize order
      function finishOrder(customerId, product, customizationRows) {
        const customSum = customizationRows.reduce((s, c) => s + Number(c.price), 0);
        const unitPrice = Number(product.base_price) + customSum;
        const totalPrice = unitPrice * quantity;

        // Insert into orders
        con.query(
          'INSERT INTO orders (customer_id, order_type, total_price, status, payment_status, customer_name, customer_phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [customerId, 'product', totalPrice, 'pending', 'unpaid' , customer.name, customer.phone],
          (err, orderRes) => {
            if (err) return rollback(con, res, 'Order insert failed', err);
            const orderId = orderRes.insertId;

            // Insert into order_items
            con.query(
              'INSERT INTO order_items (order_id, item_type, item_ref, name, unit_price, quantity, subtotal, customizations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [
                orderId,
                'product',
                product.id,
                product.name,
                unitPrice,
                quantity,
                totalPrice,
                JSON.stringify(customizationRows),
              ],
              (err) => {
                if (err) return rollback(con, res, 'Order items insert failed', err);

                // Insert into product_orders
                con.query(
                  `INSERT INTO product_orders (order_id, product_id, size, delivery_date, collection_date, notes)
                   VALUES (?, ?, ?, ?, ?, ?)`,
                  [orderId, product.id, size, deliveryDate, collectionDate, notes],
                  (err) => {
                    if (err) return rollback(con, res, 'Product order insert failed', err);

                    con.commit(err => {
                      if (err) return rollback(con, res, 'Commit failed', err);
                      res.json({
                        orderId,
                        status: 'pending',
                        total: totalPrice,
                        message: 'Coffin order created',
                      });
                      con.release(); // ✅ release connection back to pool
                    });
                  }
                );
              }
            );
          }
        );
      }
    });
  });
});

// rollback helper
function rollback(con, res, msg, err) {
  console.error(msg, err || '');
  con.rollback(() => {
    con.release(); // ✅ always release
    res.status(500).json({ error: msg });
  });
}





// Service Booking API 

// Version 1 


// app.post('/api/services/book', (req, res) => {
//   const { customer, packageCode, serviceDate, pickupLocation, dropLocation, notes } = req.body;

//   if (!packageCode || !serviceDate || !customer?.phone) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   let con;
//   try {
//     con = dbConnection();
//     con.connect();

//     con.beginTransaction(err => {
//       if (err) return res.status(500).json({ error: 'Transaction start failed' });

//       // 1) Upsert customer
//       con.query('SELECT id FROM customers WHERE phone = ? LIMIT 1', [customer.phone], (err, rows) => {
//         if (err) return rollback(con, res, 'Customer lookup failed', err);

//         const handleCustomer = (customerId) => {
//           // 2) Get service package
//           con.query('SELECT * FROM service_packages WHERE code = ? LIMIT 1', [packageCode], (err, pkgRows) => {
//             if (err || !pkgRows.length) return rollback(con, res, 'Service package not found', err);
//             const pkg = pkgRows[0];
//             const totalPrice = Number(pkg.price);

//             // 3) Insert order
//             con.query('INSERT INTO orders (customer_id, order_type, total_price, status, payment_status) VALUES (?, ?, ?, ?, ?)',
//               [customerId, 'service', totalPrice, 'pending', 'unpaid'], (err, orderRes) => {
//                 if (err) return rollback(con, res, 'Order insert failed', err);
//                 const orderId = orderRes.insertId;

//                 // 4) Insert order_items
//                 con.query('INSERT INTO order_items (order_id, item_type, item_ref, name, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
//                   [orderId, 'service', packageCode, pkg.name, totalPrice, 1, totalPrice], (err) => {
//                     if (err) return rollback(con, res, 'Order items insert failed', err);

//                     // 5) Insert service_bookings
//                     con.query(`INSERT INTO service_bookings (order_id, package_code, service_date, pickup_location, drop_location, notes)
//                                VALUES (?, ?, ?, ?, ?, ?)`,
//                       [orderId, packageCode, serviceDate, pickupLocation, dropLocation, notes], (err) => {
//                         if (err) return rollback(con, res, 'Service booking insert failed', err);

//                         con.commit(err => {
//                           if (err) return rollback(con, res, 'Commit failed', err);
//                           res.json({ orderId, status: 'pending', total: totalPrice, message: 'Service booking created' });
//                         });
//                       });
//                   });
//               });
//           });
//         };

//         if (rows.length) {
//           const customerId = rows[0].id;
//           con.query('UPDATE customers SET name=?, email=? WHERE id=?', [customer.name, customer.email, customerId], (err) => {
//             if (err) return rollback(con, res, 'Customer update failed', err);
//             handleCustomer(customerId);
//           });
//         } else {
//           con.query('INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)', [customer.name, customer.phone, customer.email], (err, result) => {
//             if (err) return rollback(con, res, 'Customer insert failed', err);
//             handleCustomer(result.insertId);
//           });
//         }
//       });
//     });
//   } catch (error) {
//     console.error('service booking exception', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// Version 2 

// app.post('/api/services/book', (req, res) => {
//   const { customer, packageCode, services = [], serviceDate, pickupLocation, dropLocation, notes , address } = req.body;

//   if ((!packageCode && (!Array.isArray(services) || services.length === 0)) || !serviceDate || !customer?.phone) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   let con;
//   try {
//     con = dbConnection();
//     con.connect();

//     con.beginTransaction(err => {
//       if (err) return res.status(500).json({ error: 'Transaction start failed' });

//       // 1) Upsert customer
//       con.query('SELECT id FROM customers WHERE phone = ? LIMIT 1', [customer.phone], (err, rows) => {
//         if (err) return rollback(con, res, 'Customer lookup failed', err);

//         const handleCustomer = (customerId) => {
//           // If packageCode provided -> existing package flow
//           if (packageCode) {
//             con.query('SELECT * FROM service_packages WHERE code = ? LIMIT 1', [packageCode], (err, pkgRows) => {
//               if (err || !pkgRows.length) return rollback(con, res, 'Service package not found', err);
//               const pkg = pkgRows[0];
//               const totalPrice = Number(pkg.price);

//               createOrder(customerId, [{ code: pkg.code, name: pkg.name, price: Number(pkg.price), quantity: 1 }], totalPrice, packageCode);
//             });
//             return;
//           }

//           // Otherwise handle services[] (multiple standalone services)
//           const codes = services.map(s => s.code);
//           if (!codes.length) return rollback(con, res, 'No services provided');

//           con.query('SELECT * FROM service_packages WHERE code IN (?)', [codes], (err, svcRows) => {
//             if (err) return rollback(con, res, 'Service lookup failed', err);
//             if (!svcRows.length) return rollback(con, res, 'Services not found');

//             // Map each returned row to requested quantity
//             let totalPrice = 0;
//             const items = svcRows.map(row => {
//               const requested = services.find(s => s.code === row.code) || { quantity: 1 };
//               const qty = Number(requested.quantity) || 1;
//               const unit = Number(row.price);
//               const subtotal = unit * qty;
//               totalPrice += subtotal;
//               return { code: row.code, name: row.name, price: unit, quantity: qty, subtotal };
//             });

//             createOrder(customerId, items, totalPrice, null);
//           });
//         };

//         function createOrder(customerId, items, totalPrice, packageCodeForBooking = null) {
//           // Insert into orders
//           con.query(
//             'INSERT INTO orders (customer_id, order_type, total_price, status, payment_status) VALUES (?, ?, ?, ?, ?)',
//             [customerId, 'service', totalPrice, 'pending', 'unpaid'],
//             (err, orderRes) => {
//               if (err) return rollback(con, res, 'Order insert failed', err);
//               const orderId = orderRes.insertId;

//               // Prepare bulk insert for order_items
//               const itemInserts = items.map(it => [
//                 orderId, 'service', it.code, it.name, it.price, it.quantity, it.subtotal
//               ]);

//               con.query(
//                 'INSERT INTO order_items (order_id, item_type, item_ref, name, unit_price, quantity, subtotal) VALUES ?',
//                 [itemInserts],
//                 (err) => {
//                   if (err) return rollback(con, res, 'Order items insert failed', err);

//                   // Insert into service_bookings
//                   // Note: package_code nullable, for service-based bookings we leave it NULL.
//                   con.query(
//                     `INSERT INTO service_bookings (order_id, package_code, service_date, address, pickup_location, drop_location, notes)
//                      VALUES (?, ?, ?, ?, ?, ?, ?)`,
//                     [orderId, packageCodeForBooking || null, serviceDate,address || null, pickupLocation || null, dropLocation || null, notes || null],
//                     (err) => {
//                       if (err) return rollback(con, res, 'Service booking insert failed', err);

//                       con.commit(err => {
//                         if (err) return rollback(con, res, 'Commit failed', err);
//                         res.json({ orderId, status: 'pending', total: totalPrice, message: 'Service booking created' });
//                       });
//                     }
//                   );
//                 }
//               );
//             }
//           );
//         }

//         // upsert customer
//         if (rows.length) {
//           const customerId = rows[0].id;
//           con.query('UPDATE customers SET name=?, email=? WHERE id=?', [customer.name, customer.email, customerId], (err) => {
//             if (err) return rollback(con, res, 'Customer update failed', err);
//             handleCustomer(customerId);
//           });
//         } else {
//           con.query('INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)', [customer.name, customer.phone, customer.email], (err, result) => {
//             if (err) return rollback(con, res, 'Customer insert failed', err);
//             handleCustomer(result.insertId);
//           });
//         }
//       });
//     });
//   } catch (error) {
//     console.error('service booking exception', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// Version 3 

// app.post('/api/services/book', (req, res) => {
//   const { customer, packageCode, services = [], serviceDate, pickupLocation, dropLocation, notes , address } = req.body;

//   if ((!packageCode && (!Array.isArray(services) || services.length === 0)) || !serviceDate || !customer?.phone) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   const pool = dbConnection(); // this now returns a pool

//   pool.getConnection((err, con) => {
//     if (err) {
//       console.error('DB connection error', err);
//       return res.status(500).json({ error: 'DB connection failed' });
//     }

//     con.beginTransaction(err => {
//       if (err) {
//         con.release();
//         return res.status(500).json({ error: 'Transaction start failed' });
//       }

//       // --- Upsert customer ---
//       con.query('SELECT id FROM customers WHERE phone = ? LIMIT 1', [customer.phone], (err, rows) => {
//         if (err) return rollback(con, res, 'Customer lookup failed', err);

//         const handleCustomer = (customerId) => {
//           if (packageCode) {
//             con.query('SELECT * FROM service_packages WHERE code = ? LIMIT 1', [packageCode], (err, pkgRows) => {
//               if (err || !pkgRows.length) return rollback(con, res, 'Service package not found', err);
//               const pkg = pkgRows[0];
//               const totalPrice = Number(pkg.price);

//               createOrder(customerId, [
//                 { code: pkg.code, name: pkg.name, price: Number(pkg.price), quantity: 1, subtotal: Number(pkg.price) }
//               ], totalPrice, packageCode);
//             });
//             return;
//           }

//           const codes = services.map(s => s.code);
//           if (!codes.length) return rollback(con, res, 'No services provided');

//           con.query('SELECT * FROM service_packages WHERE code IN (?)', [codes], (err, svcRows) => {
//             if (err) return rollback(con, res, 'Service lookup failed', err);
//             if (!svcRows.length) return rollback(con, res, 'Services not found');

//             let totalPrice = 0;
//             const items = svcRows.map(row => {
//               const requested = services.find(s => s.code === row.code) || { quantity: 1 };
//               const qty = Number(requested.quantity) || 1;
//               const unit = Number(row.price);
//               const subtotal = unit * qty;
//               totalPrice += subtotal;
//               return { code: row.code, name: row.name, price: unit, quantity: qty, subtotal };
//             });

//             createOrder(customerId, items, totalPrice, null);
//           });
//         };

//         function createOrder(customerId, items, totalPrice, packageCodeForBooking = null) {
//           con.query(
//             'INSERT INTO orders (customer_id, order_type, total_price, status, payment_status) VALUES (?, ?, ?, ?, ?)',
//             [customerId, 'service', totalPrice, 'pending', 'unpaid'],
//             (err, orderRes) => {
//               if (err) return rollback(con, res, 'Order insert failed', err);
//               const orderId = orderRes.insertId;

//               const itemInserts = items.map(it => [
//                 orderId, 'service', it.code, it.name, it.price, it.quantity, it.subtotal
//               ]);

//               con.query(
//                 'INSERT INTO order_items (order_id, item_type, item_ref, name, unit_price, quantity, subtotal) VALUES ?',
//                 [itemInserts],
//                 (err) => {
//                   if (err) return rollback(con, res, 'Order items insert failed', err);

//                   con.query(
//                     `INSERT INTO service_bookings (order_id, package_code, service_date, address, pickup_location, drop_location, notes)
//                      VALUES (?, ?, ?, ?, ?, ?, ?)`,
//                     [orderId, packageCodeForBooking || null, serviceDate, address || null, pickupLocation || null, dropLocation || null, notes || null],
//                     (err) => {
//                       if (err) return rollback(con, res, 'Service booking insert failed', err);

//                       con.commit(err => {
//                         if (err) return rollback(con, res, 'Commit failed', err);
//                         res.json({ orderId, status: 'pending', total: totalPrice, message: 'Service booking created' });
//                         con.release(); // ✅ release connection back to pool
//                       });
//                     }
//                   );
//                 }
//               );
//             }
//           );
//         }

//         if (rows.length) {
//           const customerId = rows[0].id;
//           con.query('UPDATE customers SET name=?, email=? WHERE id=?', [customer.name, customer.email, customerId], (err) => {
//             if (err) return rollback(con, res, 'Customer update failed', err);
//             handleCustomer(customerId);
//           });
//         } else {
//           con.query('INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)', [customer.name, customer.phone, customer.email], (err, result) => {
//             if (err) return rollback(con, res, 'Customer insert failed', err);
//             handleCustomer(result.insertId);
//           });
//         }
//       });
//     });
//   });
// });

// // rollback helper
// function rollback(con, res, msg, err) {
//   console.error(msg, err || '');
//   con.rollback(() => {
//     con.release(); // release back to pool
//     res.status(500).json({ error: msg });
//   });
// }


// Version 4 

// POST /api/services/book
app.post('/api/services/book', (req, res) => {
  const { customer, packageCode, services = [], serviceDate, pickupLocation, dropLocation, notes, address, city, pincode } = req.body;

  // basic validation
  if ((!packageCode && (!Array.isArray(services) || services.length === 0)) || !serviceDate || !customer?.phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const pool = dbConnection(); // returns a mysql pool

  pool.getConnection((err, con) => {
    if (err) {
      console.error('DB connection error', err);
      return res.status(500).json({ error: 'DB connection failed' });
    }

    con.beginTransaction(err => {
      if (err) {
        con.release();
        console.error('Transaction begin error', err);
        return res.status(500).json({ error: 'Transaction start failed' });
      }

      // 1) Upsert / find customer by phone
      con.query('SELECT id FROM customers WHERE phone = ? LIMIT 1', [customer.phone], (err, rows) => {
        if (err) return rollback(con, res, 'Customer lookup failed', err);

        const handleCustomer = (customerId) => {
          // If booking a package (single package booking)
          if (packageCode) {
            con.query('SELECT * FROM service_packages WHERE code = ? LIMIT 1', [packageCode], (err, pkgRows) => {
              if (err) return rollback(con, res, 'Service package lookup failed', err);
              if (!pkgRows.length) return rollback(con, res, 'Service package not found');

              const pkg = pkgRows[0];
              const totalPrice = Number(pkg.price || 0);
              const items = [{
                code: pkg.code,
                name: pkg.name,
                price: Number(pkg.price || 0),
                quantity: 1,
                subtotal: Number(pkg.price || 0)
              }];

              createOrder(customerId, items, totalPrice, packageCode);
            });

            return;
          }

          // Otherwise handle services[] (possibly multiple items and variants)
          const requestItems = services; // array of { code, variant_code?, quantity? }

          // collect unique service codes and variant codes from payload
          const codes = [...new Set(requestItems.map(s => s.code).filter(Boolean))];
          const variantCodes = [...new Set(requestItems.map(s => s.variant_code).filter(Boolean))];

          if (!codes.length) return rollback(con, res, 'No services provided');

          // fetch packages for the codes provided
          con.query('SELECT * FROM service_packages WHERE code IN (?)', [codes], (err, pkgRows) => {
            if (err) return rollback(con, res, 'Service lookup failed', err);

            // fetch variants for service_code in codes OR variant_code in variantCodes
            let varSql = 'SELECT * FROM service_variants WHERE service_code IN (?)';
            const varParams = [codes];

            if (variantCodes.length) {
              varSql = 'SELECT * FROM service_variants WHERE service_code IN (?) OR variant_code IN (?)';
              varParams.push(variantCodes);
            }

            con.query(varSql, varParams, (err, varRows) => {
              if (err) return rollback(con, res, 'Variant lookup failed', err);

              // If variants reference service_code that we don't have in pkgRows, fetch those packages too.
              const extraServiceCodes = [...new Set((varRows || []).map(v => v.service_code))]
                .filter(sc => !pkgRows.some(p => p.code === sc));
              if (extraServiceCodes.length) {
                con.query('SELECT * FROM service_packages WHERE code IN (?)', [extraServiceCodes], (err, extraPkgs) => {
                  if (err) return rollback(con, res, 'Extra package lookup failed', err);
                  pkgRows = pkgRows.concat(extraPkgs || []);
                  buildItemsAndCreateOrder(pkgRows, varRows || []);
                });
              } else {
                buildItemsAndCreateOrder(pkgRows, varRows || []);
              }
            });
          });

          // Build items list using requestItems, pkgRows and varRows
          function buildItemsAndCreateOrder(pkgRows, varRows) {
            let totalPrice = 0;
            const items = [];

            for (const rItem of requestItems) {
              const qty = Number(rItem.quantity || 1);

              // find package row: direct match by code
              let pkg = pkgRows.find(p => p.code === rItem.code);

              // If client passed a payload where code is not the package (rare), try to locate variant directly
              let variant = null;
              if (rItem.variant_code) {
                // prefer variant whose service_code matches pkg.code
                if (pkg) {
                  variant = varRows.find(v => v.service_code === pkg.code && v.variant_code === rItem.variant_code);
                }
                // if not found, try to find variant anywhere (covers cases where code is not base code)
                if (!variant) {
                  variant = varRows.find(v => v.variant_code === rItem.variant_code);
                  if (variant && !pkg) {
                    pkg = pkgRows.find(p => p.code === variant.service_code);
                  }
                }
              }

              // If package still not found, try to find a package that matches rItem.code exactly as fallback
              if (!pkg) {
                pkg = pkgRows.find(p => p.code === rItem.code);
              }

              if (!pkg) {
                return rollback(con, res, `Service not found for code: ${rItem.code}`);
              }

              let unitPrice = Number(pkg.price || 0);
              let itemName = pkg.name;

              // if variant exists, use variant price and label
              if (variant) {
                unitPrice = Number(variant.price || unitPrice);
                itemName = `${pkg.name} — ${variant.label || variant.variant_code}`;
              }

              const subtotal = unitPrice * qty;
              totalPrice += subtotal;

              items.push({
                code: pkg.code,       // keep base package code (server-side order uses package code)
                name: itemName,
                price: unitPrice,
                quantity: qty,
                subtotal,
                serviceName:pkg.name,
                variant : variant.variant_code || variant.lable
              });
            }

            // create order now
            createOrder(customerId, items, totalPrice, null);
          }
        };

        // createOrder inserts into orders, order_items, service_bookings
        function createOrder(customerId, items, totalPrice, packageCodeForBooking = null) {
          con.query(
            'INSERT INTO orders (customer_id, order_type, total_price, status, payment_status , customer_name, customer_phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [customerId, 'service', totalPrice, 'pending', 'unpaid', customer.name, customer.phone],
            (err, orderRes) => {
              if (err) return rollback(con, res, 'Order insert failed', err);
              const orderId = orderRes.insertId;

              const itemInserts = items.map(it => [
                orderId, 'service', it.code, it.name, it.serviceName, it.variant, it.price, it.quantity, it.subtotal
              ]);

              con.query(
                'INSERT INTO order_items (order_id, item_type, item_ref, name, serviceName, package_variant, unit_price, quantity, subtotal) VALUES ?',
                [itemInserts],
                (err) => {
                  if (err) return rollback(con, res, 'Order items insert failed', err);

                  con.query(
                    `INSERT INTO service_bookings (order_id, package_code, service_date, address, city, pincode, pickup_location, drop_location, notes)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [orderId, packageCodeForBooking || null, serviceDate, address || null, city || null, pincode || null, pickupLocation || null, dropLocation || null, notes || null],
                    (err) => {
                      if (err) return rollback(con, res, 'Service booking insert failed', err);

                      con.commit(err => {
                        if (err) return rollback(con, res, 'Commit failed', err);

                        // success
                        res.json({ orderId, status: 'pending', total: totalPrice, message: 'Service booking created' });

                        // release connection back to pool
                        try { con.release(); } catch (e) { /* ignore */ }
                      });
                    }
                  );
                }
              );
            }
          );
        }

        // upsert customer
        if (rows.length) {
          const customerId = rows[0].id;
          con.query('UPDATE customers SET name=?, email=? WHERE id=?', [customer.name, customer.email, customerId], (err) => {
            if (err) return rollback(con, res, 'Customer update failed', err);
            handleCustomer(customerId);
          });
        } else {
          con.query('INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)', [customer.name, customer.phone, customer.email], (err, result) => {
            if (err) return rollback(con, res, 'Customer insert failed', err);
            handleCustomer(result.insertId);
          });
        }
      });
    });
  });
});

// rollback helper - always rollback + release connection
function rollback(con, res, msg, err) {
  console.error(msg, err || '');
  // protect against con being undefined / already released
  try {
    con.rollback(() => {
      try { con.release(); } catch (e) { /* ignore release errors */ }
      res.status(500).json({ error: msg });
    });
  } catch (e) {
    try { con.release(); } catch (e2) { /* ignore */ }
    res.status(500).json({ error: msg });
  }
}


// Get all orders with customer info
app.get('/api/admin/orders', (req, res) => {
  const con = dbConnection();
  con.connect();

  const query = `
    SELECT o.id, o.order_type, o.total_price, o.currency, o.status, o.payment_status,
           o.created_at, c.name as customer_name, c.phone as customer_phone
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    ORDER BY o.created_at DESC
  `;

  con.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching orders', err.sqlMessage);
      return res.status(500).json({ error: 'Error fetching orders' });
    }
    res.json(results);
  });
});

// Update order status or payment status
app.post('/api/admin/orders/update', (req, res) => {
  const { id, status, payment_status } = req.body;
  if (!id) return res.status(400).json({ error: "Order ID is required" });

  const con = dbConnection();
  con.connect();

  const fields = [];
  const values = [];
  if (status) { fields.push("status = ?"); values.push(status); }
  if (payment_status) { fields.push("payment_status = ?"); values.push(payment_status); }

  if (fields.length === 0) return res.status(400).json({ error: "Nothing to update" });

  values.push(id);

  const query = `UPDATE orders SET ${fields.join(", ")} WHERE id = ?`;
  con.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating order", err.sqlMessage);
      return res.status(500).json({ error: "Error updating order" });
    }
    res.json({ message: "Order updated successfully" });
  });
});



// GET /api/services/list?category=standalone
// app.get('/api/services/list', (req, res) => {
//   const { category } = req.query;
//   let con;
//   try {
//     con = dbConnection();
//     con.connect();

//     let sql = 'SELECT code, name, price, description, category FROM service_packages';
//     const params = [];
//     if (category) {
//       sql += ' WHERE category = ?';
//       params.push(category);
//     }

//     con.query(sql, params, (err, rows) => {
//       if (err) {
//         console.error('services list error', err);
//         return res.status(500).json({ error: 'Could not fetch services' });
//       }
//       res.json({ services: rows });
//     });
//   } catch (error) {
//     console.error('services list exception', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// Version 2
// GET list (optional category filter) - returns richer fields

// --- Get list of services ---
app.get('/api/services/list', (req, res) => {
  const { category } = req.query;
  const con = dbConnection();
  con.connect();

  let sql = `
    SELECT sp.code, sp.name, sp.price, sp.description,
           sp.category_id, sp.image, sp.images, sp.pricing_type,
           c.code AS categoryCode, c.name AS categoryName
    FROM service_packages sp
    LEFT JOIN service_categories c ON sp.category_id = c.id
  `;
  const params = [];
  if (category) {
    sql += ' WHERE c.code = ?';
    params.push(category);c
  }

  con.query(sql, params, (err, rows) => {
    if (err) {
      console.error('[API] list DB error', err);
      return res.status(500).json({ error: 'Could not fetch services' });
    }

    const codes = rows.map(r => r.code);
    if (!codes.length) {
      return res.json({ services: [] }); // ✅ return empty cleanly
    }

    con.query(
      'SELECT service_code, variant_code, label, price, image FROM service_variants WHERE service_code IN (?)',
      [codes],
      (err2, vrows) => {
        if (err2) {
          console.error('[API] variant fetch error', err2);
          return res.json({ services: [] }); // ✅ safe fallback
        }

        const variantsByService = {};
        (vrows || []).forEach(v => {
          variantsByService[v.service_code] = variantsByService[v.service_code] || [];
          variantsByService[v.service_code].push({
            variant_code: v.variant_code,
            label: v.label,
            price: Number(v.price),
            image: v.image
          });
        });

        const safeParseJson = (val) => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          try { return JSON.parse(val); } catch { return []; }
        };

        const services = rows.map(r => ({
          code: r.code,
          name: r.name,
          price: Number(r.price),
          description: r.description,
          category: r.categoryCode || null,
          categoryName: r.categoryName || null,
          image: r.image || null,
          images: safeParseJson(r.images),
          pricingType: r.pricing_type || 'flat',
          variants: variantsByService[r.code] || []
        }));

        res.json({ services });
      }
    );
  });
});



// --- Get single service ---
app.get('/api/services/get', (req, res) => {
  const { code, debug } = req.query;
  console.log('[API] GET /api/services/get code=', code, ' debug=', debug);

  if (!code) return res.status(400).json({ error: 'Missing code' });

  const con = dbConnection();
  con.connect();

  const sql = `
    SELECT sp.code, sp.name, sp.price, sp.description,
           sp.category_id, sp.image, sp.images, sp.pricing_type,
           c.code AS categoryCode, c.name AS categoryName
    FROM service_packages sp
    LEFT JOIN service_categories c ON sp.category_id = c.id
    WHERE sp.code = ? LIMIT 1
  `;

  con.query(sql, [code], (err, rows) => {
    if (err) {
      console.error('[API] service get DB error', err);
      return res.status(500).json({ error: 'DB error', detail: String(err) });
    }
    if (!rows || !rows.length) {
      console.log('[API] service not found for code=', code);
      return res.status(404).json({ error: 'Service not found' });
    }

    const r = rows[0];

    const safeParseJson = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch (e) {
        console.warn('[API] JSON parse failed for service', code, e);
        return [];
      }
    };

    con.query(
      'SELECT variant_code, label, price, image FROM service_variants WHERE service_code = ?',
      [code],
      (err2, vrows) => {
        if (err2) {
          console.error('[API] variant fetch failed', err2);
          vrows = [];
        }

        const service = {
          code: r.code,
          name: r.name,
          price: (r.price !== null && r.price !== undefined) ? Number(r.price) : null,
          description: r.description,
          category: r.categoryCode || null,
          categoryName: r.categoryName || null,
          image: r.image || null,
          images: safeParseJson(r.images),
          pricingType: r.pricing_type || 'flat',
          variants: (vrows || []).map(v => ({
            variant_code: v.variant_code,
            label: v.label,
            price: Number(v.price),
            image: v.image
          }))
        };

        if (debug === '1') {
          return res.json({ debug: true, dbRow: r, variantsRaw: vrows || [], service });
        }
        return res.json({ service });
      }
    );
  });
});



// List
app.get('/api/services/:serviceCode/variants', (req,res) => {
  const con = dbConnection(); con.connect();
  con.query('SELECT variant_code AS code, label, price, image, extra, stock FROM service_variants WHERE service_code = ?', [req.params.serviceCode], (err, rows) => {
    if (err) return res.status(500).json({ error: 'could not fetch' });
    res.json({ variants: rows });
  });
});

// Create
app.post('/api/services/:serviceCode/variants', (req,res) => {
  const { variant_code, label, price, image, extra, stock } = req.body;
  if (!variant_code || !label) return res.status(400).json({ error:'variant_code and label required' });
  const con = dbConnection(); con.connect();
  con.query('INSERT INTO service_variants (service_code, variant_code, label, price, image, extra, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.params.serviceCode, variant_code, label, price||0, image||null, JSON.stringify(extra||{}), stock||null],
    (err,result) => {
      if (err) return res.status(500).json({ error:'create failed' });
      res.json({ id: result.insertId });
    });
});

// Update & Delete similar to earlier skeleton I provided



// Service Variants , category , packages upload ---


// ================= AWS Upload (already exists) =================
app.post('/aws/upload', upload.array('photos', 10), async (req, res) => {
  try {
    const uploaded = [];
    const promises = req.files.map(async (file) => {
      const resizedBuffer = await sharp(file.buffer)
        .rotate()
        .resize(800, 800, { fit: sharp.fit.inside, withoutEnlargement: true })
        .toFormat('jpeg', { quality: 80 })
        .toBuffer();

      const key = `gb_ground/${uuidv4()}_${file.originalname}`;

      const params = {
        Bucket: 'snektoawsbucket',
        Key: key,
        Body: resizedBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      };

      const data = await s3.upload(params).promise();
      uploaded.push({ url: data.Location, s3Key: key });
    });

    await Promise.all(promises);
    res.status(200).json({ imageURLs: uploaded });
  } catch (error) {
    console.error('Error uploading images to AWS S3:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ================= CATEGORY APIs =================
app.post("/api/admin/categories", (req, res) => {
  const { code, name, image, extra } = req.body;
  if (!code || !name) return res.status(400).json({ error: "Code and Name required" });

  const pool = dbConnection();
  pool.query(
    "INSERT INTO service_categories (code, name, image) VALUES (?, ?, ?)",
    [code, name, image || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, code, name, image, extra });
    }
  );
});

app.get("/api/admin/categories", (req, res) => {
  const pool = dbConnection();
  // pool.query("SELECT * FROM service_categories", (err, rows) => {
  pool.query("SELECT id, LOWER(code) as code, name, image, sort_order FROM service_categories ORDER BY sort_order ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ================= SERVICE APIs =================
app.post("/api/admin/services", (req, res) => {
  const {
    code, name, price, description, categoryId,
    image, images, pricingType, subcategory_id
  } = req.body;

  if (!code || !name || !categoryId) {
    return res.status(400).json({ error: "Code, Name, Category required" });
  }

  const pool = dbConnection();
  pool.query(
    `INSERT INTO service_packages 
    (code, name, price, description, category_id, image, images, pricing_type, subcategory_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      code,
      name,
      price || 0,
      description || null,
      categoryId,
      image || null,
      images ? JSON.stringify(images) : null,
      pricingType || "flat",
      subcategory_id || null,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, code, name });
    }
  );
});

app.get("/api/admin/services", (req, res) => {
  const pool = dbConnection();
  pool.query(
    `SELECT sp.*, c.name AS categoryName 
     FROM service_packages sp 
     LEFT JOIN service_categories c ON sp.category_id = c.id`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      // parse images JSON before sending
      rows.forEach(r => {
        try { r.images = r.images ? JSON.parse(r.images) : []; } catch { r.images = []; }
      });

      res.json(rows);
    }
  );
});

// ================= VARIANT APIs =================
app.post("/api/admin/services/:serviceCode/variants", (req, res) => {
  const { serviceCode } = req.params;
  const { variants } = req.body;

  if (!variants || !variants.length) {
    return res.status(400).json({ error: "Variants required" });
  }

  const pool = dbConnection();
  const values = variants.map((v) => [
    serviceCode,
    v.variant_code,
    v.label,
    v.price || 0,
    v.image || null,
    v.extra ? JSON.stringify(v.extra) : null,
  ]);

  pool.query(
    `INSERT INTO service_variants 
    (service_code, variant_code, label, price, image, extra) VALUES ?`,
    [values],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ added: result.affectedRows });
    }
  );
});

app.get("/api/admin/services/:serviceCode/variants", (req, res) => {
  const { serviceCode } = req.params;
  const pool = dbConnection();
  pool.query(
    "SELECT * FROM service_variants WHERE service_code = ?",
    [serviceCode],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      // parse extra JSON (for s3Key)
      rows.forEach(r => {
        try { r.extra = r.extra ? JSON.parse(r.extra) : {}; } catch { r.extra = {}; }
      });

      res.json(rows);
    }
  );
});





// ------------- COFFIN Catalogue Modifications --------------------------

// ✅ Product save (create or update)
app.post('/api/products/save', (req, res) => {
  const { id, sku, name, description, base_price, inventory } = req.body;
  if (!id) return res.status(400).json({ error: "Product ID required" });

  const safeId = id.replace(/\s+/g, '-').toLowerCase(); // enforce slug ID
  const con = dbConnection();

  const sql = `
    INSERT INTO products (id, sku, name, description, base_price, inventory)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      sku=VALUES(sku),
      name=VALUES(name),
      description=VALUES(description),
      base_price=VALUES(base_price),
      inventory=VALUES(inventory)
  `;

  con.query(sql, [safeId, sku, name, description, base_price, inventory], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Product saved successfully", id: safeId });
  });
});


// GET ALL COffin Products

// Get all products for catalogue
app.get('/api/tfc/products', (req, res) => {
  const con = dbConnection();

  const sql = `
    SELECT p.id, p.name, p.base_price, 
           (SELECT url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) AS thumbnail,
           LEFT(p.description, 100) AS shortDescription
    FROM products p
    ORDER BY p.created_at DESC
  `;

  con.query(sql, (err, rows) => {
    if (err) {
      console.error("❌ Products fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
    res.json(rows);
  });
});



// ✅ Get product with images
// app.get('/api/tfc/products/:id', (req, res) => {
//   const id = req.params.id;
//   const con = dbConnection();
//   // works for pool / single connection
//   con.query('SELECT * FROM products WHERE id = ?', [id], (errP, pRows) => {
//     if (errP) return res.status(500).json({ error: errP.message });
//     if (!pRows.length) return res.status(404).json({ error: 'Product not found' });
//     con.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY position ASC', [id], (errI, iRows) => {
//       if (errI) return res.status(500).json({ error: errI.message });
//       res.json({ product: pRows[0], images: iRows });
//     });
//   });
// });

// version 2 

app.get('/api/tfc/products/:id', (req, res) => {
  const { id } = req.params;
  const con = dbConnection();

  const queries = {
    product: `SELECT * FROM products WHERE id=?`,
    images: `SELECT * FROM product_images WHERE product_id=? ORDER BY position`,
    sizes: `SELECT * FROM product_sizes WHERE product_id=?`,
    customizations: `SELECT * FROM product_customizations WHERE product_id=?`
  };

  con.query(queries.product, [id], (err, productRows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!productRows.length) return res.status(404).json({ error: 'Not found' });

    con.query(queries.images, [id], (errI, imageRows) => {
      if (errI) return res.status(500).json({ error: errI.message });

      con.query(queries.sizes, [id], (errS, sizeRows) => {
        if (errS) return res.status(500).json({ error: errS.message });

        con.query(queries.customizations, [id], (errC, customRows) => {
          if (errC) return res.status(500).json({ error: errC.message });

          return res.json({
            product: productRows[0],
            images: imageRows,
            sizes: sizeRows,
            customizations: customRows
          });
        });
      });
    });
  });
});




// ✅ Upload to AWS
app.post('/aws/upload', upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploaded = [];
    const promises = req.files.map(async (file) => {
      // const resizedBuffer = await sharp(file.buffer)
      //   .resize(800, 800, {
      //     fit: sharp.fit.inside,
      //     withoutEnlargement: true,
      //   })
      //   .toFormat('jpeg', { quality: 80 })
      //   .toBuffer();

      const resizedBuffer = await sharp(file.buffer)
      .rotate() // <-- auto-rotate based on EXIF orientation
      .resize(800, 800, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFormat('jpeg', { quality: 80 })
      .toBuffer();

      const key = `gb_ground/${uuidv4()}_${file.originalname}`;

      const params = {
        Bucket: 'snektoawsbucket',
        Key: key,
        Body: resizedBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      };

      const data = await s3.upload(params).promise();
      uploaded.push({ url: data.Location, s3Key: key });
    });

    await Promise.all(promises);
    res.status(200).json({ imageURLs: uploaded }); // [{url,s3Key}]
  } catch (error) {
    console.error('Error uploading images to AWS S3:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// ✅ Save product images in DB

app.post('/api/tfc/products/:id/images', (req, res) => {
  const { id } = req.params;
  const { images } = req.body; // [{url, s3Key}] expected
  const con = dbConnection();

  if (!images || !Array.isArray(images)) {
    return res.status(400).json({ error: 'Images array is required' });
  }

  const values = images.map((img, idx) => [id, img.url, idx, img.s3Key]);

  con.query(
    `INSERT INTO product_images (product_id, url, position, s3_key) VALUES ?`,
    [values],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Images added', count: result.affectedRows });
    }
  );
});

// Save product + images in one go


// Backend: replace your current save-with-images handler with this

// --- Simple create/update product + images (callback style) ---


// app.post('/api/tfc/products/create', (req, res) => {

//   console.log("Inside Product Creation Backend API")
//   const { id, sku, name, description, base_price, inventory, images } = req.body || {};
//   const con = dbConnection();

  

//   if (!id || !name) {
//     return res.status(400).json({ error: 'id and name are required' });
//   }

//   // Insert product
//   const productSql = `
//     INSERT INTO products (id, sku, name, description, base_price, inventory)
//     VALUES (?, ?, ?, ?, ?, ?)
//   `;
//   con.query(
//     productSql,
//     [id, sku || null, name, description || null, base_price || 0, inventory || 0],
//     (err, productResult) => {
//       if (err) {
//         console.error("❌ Product insert error:", err);
//         return res.status(500).json({ error: 'Product save failed', details: err.message });
//       }
//       console.log("✅ Product inserted:", productResult.affectedRows);

//       // Insert product images
//       if (images && Array.isArray(images) && images.length > 0) {
//         const values = images.map((img, idx) => [id, img.url, idx, img.s3Key || null]);
//         const imgSql = `INSERT INTO product_images (product_id, url, position, s3_key) VALUES ?`;

//         con.query(imgSql, [values], (errImg, imgResult) => {
//           if (errImg) {
//             console.error("❌ Insert images error:", errImg);
//             return res.status(500).json({ error: 'Insert images failed', details: errImg.message });
//           }
//           console.log("✅ Images inserted:", imgResult.affectedRows);
//           return res.json({ message: 'Product + Images created', productId: id });
//         });
//       } else {
//         return res.json({ message: 'Product created (no images)', productId: id });
//       }
//     }
//   );
// });



// version 2 

app.post('/api/tfc/products/create', (req, res) => {
  console.log("Inside Product Creation Backend API");
  const { id, sku, name, description, base_price, inventory, images, sizes, customizations } = req.body || {};
  const con = dbConnection();

  if (!id || !name) {
    return res.status(400).json({ error: 'id and name are required' });
  }

  const productSql = `
    INSERT INTO products (id, sku, name, description, base_price, inventory)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      sku=VALUES(sku),
      name=VALUES(name),
      description=VALUES(description),
      base_price=VALUES(base_price),
      inventory=VALUES(inventory)
  `;

  con.query(
    productSql,
    [id, sku || null, name, description || null, base_price || 0, inventory || 0],
    (err) => {
      if (err) {
        console.error("❌ Product insert error:", err);
        return res.status(500).json({ error: 'Product save failed', details: err.message });
      }
      console.log("✅ Product inserted/updated:", id);

      // ---------------- Images ----------------
      if (images?.length) {
        const values = images.map((img, idx) => [id, img.url, idx, img.s3Key || null]);
        con.query(`DELETE FROM product_images WHERE product_id=?`, [id], () => {
          con.query(
            `INSERT INTO product_images (product_id, url, position, s3_key) VALUES ?`,
            [values],
            (errImg) => {
              if (errImg) console.error("❌ Image insert error:", errImg);
              else console.log("✅ Images inserted:", values.length);
            }
          );
        });
      }

      // ---------------- Sizes ----------------
      if (sizes?.length) {
        const values = sizes.map((s) => [id, s.label, s.multiplier]);
        con.query(`DELETE FROM product_sizes WHERE product_id=?`, [id], () => {
          con.query(
            `INSERT INTO product_sizes (product_id, label, multiplier) VALUES ?`,
            [values],
            (errSize) => {
              if (errSize) console.error("❌ Sizes insert error:", errSize);
              else console.log("✅ Sizes inserted:", values.length);
            }
          );
        });
      }

      // ---------------- Customizations ----------------
      if (customizations?.length) {
        // generate IDs automatically for each customization
        const values = customizations.map((c, idx) => [
          `${id}-cust-${idx + 1}`, // unique id for customization
          id,                      // product_id
          c.label,
          Number(c.price) || 0,
          JSON.stringify(c.meta || {})
        ]);

        con.query(`DELETE FROM product_customizations WHERE product_id=?`, [id], () => {
          con.query(
            `INSERT INTO product_customizations (id, product_id, label, price, meta) VALUES ?`,
            [values],
            (errCust) => {
              if (errCust) console.error("❌ Customizations insert error:", errCust);
              else console.log("✅ Customizations inserted:", values.length);
            }
          );
        });
      }

      return res.json({ message: 'Product + Images + Options created', productId: id });
    }
  );
});















// ✅ Reorder images
app.post('/api/tfc/products/:id/images/reorder', (req, res) => {
  const { id } = req.params;
  const { images } = req.body; // [{imageId,position}]
  const con = dbConnection();

  const updates = images.map(
    (img) =>
      new Promise((resolve, reject) => {
        con.query(
          `UPDATE product_images SET position=? WHERE id=? AND product_id=?`,
          [img.position, img.imageId, id],
          (err) => (err ? reject(err) : resolve())
        );
      })
  );

  Promise.all(updates)
    .then(() => res.json({ message: 'Reordered' }))
    .catch((err) => res.status(500).json({ error: err.message }));
});


// ✅ Delete image (DB + AWS)
app.post('/api/tfc/products/:id/images/delete', async (req, res) => {
  const { id } = req.params;
  const { imageId, s3Key } = req.body;
  const con = dbConnection();

  try {
    await s3.deleteObject({ Bucket: 'snektoawsbucket', Key: s3Key }).promise();

    con.query(
      `DELETE FROM product_images WHERE id=? AND product_id=?`,
      [imageId, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Image deleted' });
      }
    );
  } catch (error) {
    console.error('AWS Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});


// ---- Funeral Ground Apis ----


// Get Unique Cities

app.get('/api/tfc/grounds/cities', (req, res) => {
  const con = dbConnection();
  con.query(
    "SELECT DISTINCT city FROM tfc_funeral_grounds WHERE city IS NOT NULL ORDER BY city ASC",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const cities = rows.map(r => r.city);
      res.json({ cities });
    }
  );
});

// --- Backend: tfc funeral grounds APIs ---
// GET list with search/filter/pagination
// Version 1

app.get('/api/tfc/grounds', (req, res) => {
  const q = (req.query.q || '').trim();
  const city = req.query.city || '';
  const pincode = req.query.pincode || '';
  const page = parseInt(req.query.page || '1', 10);
  const perPage = parseInt(req.query.perPage || '20', 10);
  const offset = (page - 1) * perPage;

  let where = [];
  let params = [];

  // if (q) {
  //   where.push('(name LIKE ? OR address LIKE ? OR city LIKE ?)');
  //   const like = `%${q}%`;
  //   params.push(like, like, like);
  // }

  if (q) {
    where.push('(name LIKE ? OR address LIKE ? OR city LIKE ? OR pincode LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  
  if (city) {
    where.push('city = ?'); params.push(city);
  }
  if (pincode) {
    where.push('pincode = ?'); params.push(pincode);
  }

  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const con = dbConnection();
  const sql = `SELECT id, name, address, city, state, pincode, phone, created_at
               FROM tfc_funeral_grounds ${whereSql}
               ORDER BY created_at DESC
               LIMIT ? OFFSET ?`;
  params.push(perPage, offset);

  con.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // fetch first image for each ground
    const ids = rows.map(r => r.id);
    if (!ids.length) return res.json({ grounds: [], page, perPage });

    con.query(
      `SELECT ground_id, url FROM tfc_ground_images WHERE ground_id IN (?) AND position = 0`,
      [ids],
      (err2, imgs) => {
        if (err2) return res.status(500).json({ error: err2.message });
        const map = {};
        imgs.forEach(i => map[i.ground_id] = i.url);
        const grounds = rows.map(r => ({ ...r, thumbnail: map[r.id] || null }));
        return res.json({ grounds, page, perPage });
      }
    );
  });
  
} );

// Version 2 

// const pool = require("./db");

// app.get('/api/tfc/grounds', async (req, res) => {
//   try {
//     const q = (req.query.q || '').trim();
//     const city = req.query.city || '';
//     const pincode = req.query.pincode || '';
//     const page = parseInt(req.query.page || '1', 10);
//     const perPage = parseInt(req.query.perPage || '20', 10);
//     const offset = (page - 1) * perPage;

//     let where = [];
//     let params = [];

//     if (q) {
//       where.push('(id LIKE ? OR name LIKE ? OR address LIKE ? OR city LIKE ? OR pincode LIKE ?)');
//       const like = `%${q}%`;
//       params.push(like, like, like, like, like);
//     }
//     if (city) {
//       where.push('city LIKE ?'); params.push(`%${city}%`);
//     }
//     if (pincode) {
//       where.push('pincode LIKE ?'); params.push(`%${pincode}%`);
//     }

//     const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

//     // 🔹 Fetch grounds
//     const [rows] = await pool.query(
//       `SELECT id, name, address, city, state, pincode, phone, created_at
//        FROM tfc_funeral_grounds ${whereSql}
//        ORDER BY created_at DESC
//        LIMIT ? OFFSET ?`,
//       [...params, perPage, offset]
//     );

//     if (!rows.length) return res.json({ grounds: [], page, perPage });

//     // 🔹 Fetch first image per ground
//     const ids = rows.map(r => r.id);
//     const [imgs] = await pool.query(
//       `SELECT ground_id, url 
//        FROM tfc_ground_images 
//        WHERE ground_id IN (?) AND position = 0`,
//       [ids]
//     );

//     const map = {};
//     imgs.forEach(i => map[i.ground_id] = i.url);

//     const grounds = rows.map(r => ({ ...r, thumbnail: map[r.id] || null }));

//     return res.json({ grounds, page, perPage });

//   } catch (err) {
//     console.error("❌ Grounds fetch error:", err);
//     res.status(500).json({ error: "Internal Server Error", details: err.message });
//   }
// });


// GET single ground with images and requirements



app.get('/api/tfc/grounds/:id', (req, res) => {
  const { id } = req.params;
  const con = dbConnection();

  con.query(`SELECT * FROM tfc_funeral_grounds WHERE id=?`, [id], (err, rows) => {
    if (err) {
      console.error("❌ Fetch ground error:", err);
      return res.status(500).json({ error: "Failed to fetch ground" });
    }
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const ground = rows[0];

    // 🟢 Parse religions_supported safely
    if (ground.religions_supported) {
      try {
        if (typeof ground.religions_supported === "string") {
          ground.religions_supported = JSON.parse(ground.religions_supported);
        }
      } catch (e) {
        console.warn("⚠️ religions_supported parse error", e);
        ground.religions_supported = [];
      }
    } else {
      ground.religions_supported = [];
    }

    // 🟢 Parse services safely
    if (ground.services) {
      try {
        if (typeof ground.services === "string") {
          ground.services = JSON.parse(ground.services);
        }
      } catch (e) {
        console.warn("⚠️ services parse error", e);
        ground.services = [];
      }
    } else {
      ground.services = [];
    }

    // Fetch images
    con.query(
      `SELECT id, url, s3_key, position 
       FROM tfc_ground_images 
       WHERE ground_id=? ORDER BY position ASC`,
      [id],
      (err2, imgs) => {
        if (err2) {
          console.error("❌ Fetch ground images error:", err2);
          return res.status(500).json({ error: "Failed to fetch ground images" });
        }

        ground.images = imgs || [];
        res.json(ground);
      }
    );
  });
});






// Create or update ground (simple upsert)


app.post("/api/tfc/grounds/create", (req, res) => {
  const {
    name,
    address,
    city,
    pincode,
    phone,
    email,
    parking,
    water_facility,
    operating_hours,
    description,
    religions_supported,
    services,
    procedures,
    google_map_url,
  } = req.body;

  const con = dbConnection();
  const groundId = uuidv4(); // ✅ Backend generates ID

  // ✅ Ensure religions/services are proper JSON objects/arrays
  let religionsJSON = null;
  let servicesJSON = null;

  try {
    religionsJSON = religions_supported ? JSON.stringify(religions_supported) : JSON.stringify([]);
  } catch {
    religionsJSON = JSON.stringify([]);
  }

  try {
    servicesJSON = services ? JSON.stringify(services) : JSON.stringify([]);
  } catch {
    servicesJSON = JSON.stringify([]);
  }

  const sql = `
    INSERT INTO tfc_funeral_grounds
    (id, name, address, city, pincode, phone, email, parking, water_facility,
     operating_hours, description, religions_supported, services, procedures, google_map_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), ?, ?)
  `;

  con.query(
    sql,
    [
      groundId,
      name,
      address,
      city,
      pincode,
      phone,
      email,
      parking ? 1 : 0,
      water_facility ? 1 : 0,
      operating_hours,
      description,
      religionsJSON,
      servicesJSON,
      procedures || null,
      google_map_url || null,
    ],
    (err) => {
      if (err) {
        console.error("❌ Ground insert error:", err);
        return res.status(500).json({ error: "Failed to create ground", details: err.message });
      }
      console.log("✅ Ground inserted:", groundId);
      res.json({ message: "Ground created successfully", groundId });
    }
  );
});





// Attach images for a ground (accepts images payload [{url,s3Key}] or multipart via upload middleware)
// (If you already have /aws/upload, best practice: upload first to /aws/upload -> returns [{url,s3Key}] -> call this endpoint with images in body.)
app.post('/api/tfc/grounds/:id/images', (req, res) => {
  const id = req.params.id;
  const images = req.body.images; // expect [{ url, s3Key }]
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'images array required' });
  }
  const con = dbConnection();

  // compute starting position (max existing + 1)
  con.query('SELECT MAX(position) AS maxpos FROM tfc_ground_images WHERE ground_id = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const start = (rows && rows[0] && rows[0].maxpos != null) ? rows[0].maxpos + 1 : 0;
    const vals = images.map((img, i) => [id, img.url, start + i, img.s3Key || null]);
    con.query('INSERT INTO tfc_ground_images (ground_id, url, position, s3_key) VALUES ?', [vals], (err2, res2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      return res.json({ message: 'Images added', count: res2.affectedRows });
    });
  });
});

// Reorder images: payload { images: [{ imageId, position }] }
app.post('/api/tfc/grounds/:id/images/reorder', (req, res) => {
  const id = req.params.id;
  const images = req.body.images;
  if (!Array.isArray(images)) return res.status(400).json({ error: 'images array required' });
  const con = dbConnection();

  // perform sequential updates (callback style)
  let idx = 0;
  function nextUpdate() {
    if (idx >= images.length) return res.json({ message: 'Reorder done' });
    const it = images[idx++];
    con.query('UPDATE tfc_ground_images SET position = ? WHERE id = ? AND ground_id = ?', [it.position, it.imageId, id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      nextUpdate();
    });
  }
  nextUpdate();
});

// Delete image (also delete from s3)
app.post('/api/tfc/grounds/:id/images/delete', (req, res) => {
  const id = req.params.id;
  const { imageId, s3Key } = req.body;
  if (!imageId) return res.status(400).json({ error: 'imageId required' });

  const con = dbConnection();

  if (s3Key) {
    s3.deleteObject({ Bucket: 'snektoawsbucket', Key: s3Key }).promise().catch(err => {
      console.error('S3 delete warning:', err);
    });
  }

  con.query('DELETE FROM tfc_ground_images WHERE id = ? AND ground_id = ?', [imageId, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: 'Image deleted' });
  });
});

// Delete ground
app.delete('/api/tfc/grounds/:id', (req, res) => {
  const id = req.params.id;
  const con = dbConnection();
  con.query('SELECT s3_key FROM tfc_ground_images WHERE ground_id = ?', [id], (err, imgs) => {
    if (err) return res.status(500).json({ error: err.message });
    // delete from s3 best-effort
    imgs.forEach(i => {
      if (i.s3_key) {
        s3.deleteObject({ Bucket: 'snektoawsbucket', Key: i.s3_key }).promise().catch(err => console.error('S3 delete:', err));
      }
    });
    // delete ground (images, reqs will cascade)
    con.query('DELETE FROM tfc_funeral_grounds WHERE id = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      return res.json({ message: 'Ground deleted' });
    });
  });
});




// Update Ground details

app.post("/api/tfc/grounds/update", (req, res) => {
  const {
    id,
    name,
    address,
    city,
    pincode,
    phone,
    email,
    parking,
    water_facility,
    operating_hours,
    description,
    religions_supported,
    services,
    procedures,
    google_map_url,
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Ground ID is required for update" });
  }

  const con = dbConnection();

  const sql = `
    UPDATE tfc_funeral_grounds
    SET name=?, address=?, city=?, pincode=?, phone=?, email=?, 
        parking=?, water_facility=?, operating_hours=?, description=?, 
        religions_supported=?, services=?, procedures=?, google_map_url=?, 
        updated_at=NOW()
    WHERE id=?
  `;

  con.query(
    sql,
    [
      name || null,
      address || null,
      city || null,
      pincode || null,
      phone || null,
      email || null,
      parking ? 1 : 0,
      water_facility ? 1 : 0,
      operating_hours || null,
      description || null,
      JSON.stringify(religions_supported || []),
      JSON.stringify(services || []),
      procedures || null,
      google_map_url || null,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("❌ Ground update error:", err);
        return res
          .status(500)
          .json({ error: "Failed to update ground", details: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Ground not found" });
      }
      res.json({ message: "Ground updated successfully", groundId: id });
    }
  );
});


// Add new vendor

// Version 1

// app.post("/api/tfc/vendors", (req, res) => {
//   const data = req.body;
//   if (!data.name || !data.type) {
//     return res.status(400).json({ error: "Vendor name and type are required" });
//   }

//   const con = dbConnection();

//   const sql = `
//     INSERT INTO vendors
//     (name, type, contact_name, phone, email, address, city, state, country,
//      payment_mode, bank_name, account_no, ifsc_code, upi_id, payment_terms,
//      commission_percent, base_rate, advance_allowed, created_at)
//     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())
//   `;

//   const vals = [
//     data.name,
//     data.type,
//     data.contact_name || null,
//     data.phone || null,
//     data.email || null,
//     data.address || null,
//     data.city || null,
//     data.state || null,
//     data.country || null,
//     data.payment_mode || "bank",
//     data.bank_name || null,
//     data.account_no || null,
//     data.ifsc_code || null,
//     data.upi_id || null,
//     data.payment_terms || null,
//     data.commission_percent || null,
//     data.base_rate || null,
//     data.advance_allowed ? 1 : 0,
//   ];

//   con.query(sql, vals, (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: "Vendor added successfully", vendor_id: result.insertId });
//   });
// });

// Version 2 

app.post("/api/tfc/vendors", (req, res) => {
  const data = req.body;
  if (!data.name || !data.type) {
    return res.status(400).json({ error: "Vendor name and type are required" });
  }

  const con = dbConnection();

  const sql = `
    INSERT INTO vendors
    (
      name, type, contact_name, contact_designation,
      phone, alternate_phone, email, address, city, state, country,pincode,google_location_url
      payment_mode, bank_name, account_no, ifsc_code, upi_id, payment_terms,
      commission_percent, base_rate, advance_allowed,
      operational_hours, available_days, conditions, remarks,
      profile_image_url, id_proof_url,
      created_at
    )
    VALUES (?,?,?,?, ?,?,?, ?,?,?, ?, ?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?,?,?,? NOW())
  `;

  const vals = [
    data.name,
    data.type, // comma-separated: "van,freezer,floral"
    data.contact_name || null,
    data.contact_designation || null,

    data.phone || null,
    data.alternate_phone || null,
    data.email || null,
    data.address || null,
    data.city || null,
    data.state || null,
    data.country || null,
    data.pincode || null,
    data.google_location_url || null,

    data.payment_mode || "bank",
    data.bank_name || null,
    data.account_no || null,
    data.ifsc_code || null,
    data.upi_id || null,
    data.payment_terms || null,

    data.commission_percent ?? null,
    data.base_rate ?? null,
    data.advance_allowed ? 1 : 0,

    data.operational_hours || null,
    data.available_days || null,
    data.conditions || null,
    data.remarks || null,

    data.profile_image_url || null,
    data.id_proof_url || null,
  ];

  con.query(sql, vals, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Vendor added successfully", vendor_id: result.insertId });
  });
});


//  Vendor Catalog Update( their price etc)

// Version 1

// app.post("/api/tfc/vendors/:id/catalog", (req, res) => {
//   const vendorId = req.params.id;
//   const services = req.body.services;

//   if (!Array.isArray(services) || services.length === 0) {
//     return res.status(400).json({ error: "services array required" });
//   }

//   const con = dbConnection();
//   const values = services.map((s) => [vendorId, s.service_code, s.base_rate || 0]);

//   const sql = `
//     INSERT INTO vendor_catalog (vendor_id, service_code, base_rate)
//     VALUES ?
//   `;

//   con.query(sql, [values], (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: "Vendor catalog added", count: result.affectedRows });
//   });
// });


// Version 2 

app.post("/api/tfc/vendors/:id/catalog", (req, res) => {
  const vendorId = req.params.id;
  const services = req.body.services; // [{ service_code, base_rate }]

  if (!Array.isArray(services) || services.length === 0) {
    return res.status(400).json({ error: "services array required" });
  }

  const con = dbConnection();
  const values = services.map((s) => [vendorId, s.service_code, s.base_rate || 0]);
  const sql = `INSERT INTO vendor_catalog (vendor_id, service_code, base_rate) VALUES ?`;
  con.query(sql, [values], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Vendor catalog added", count: result.affectedRows });
  });
});


// Get All Vendors

app.get("/api/tfc/vendors", (req, res) => {
  const con = dbConnection();
  const sql = "SELECT * FROM vendors ORDER BY id DESC";

  con.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// Get Vendor by ID



app.get("/api/tfc/vendors/:id", (req, res) => {
  const con = dbConnection();
  const sql = `
    SELECT id, name, type, contact_name, phone, email, address, city, state, country,pincode,google_location_url,
           payment_mode, bank_name, account_no, ifsc_code, upi_id, payment_terms,
           commission_percent, base_rate, advance_allowed, status, created_at
    FROM vendors
    WHERE id = ?
  `;
  con.query(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ error: "Vendor not found" });
    res.json(rows[0]);
  });
});


// Update Vendor by ID ( Vendor Update functionality)

// Version 1

// app.put("/api/tfc/vendors/:id", (req, res) => {
//   const data = req.body;
//   const con = dbConnection();

//   const sql = `
//     UPDATE vendors SET
//       name = ?, type = ?, contact_name = ?, phone = ?, email = ?, address = ?, city = ?, 
//       state = ?, country = ?, payment_mode = ?, bank_name = ?, account_no = ?, ifsc_code = ?, 
//       upi_id = ?, payment_terms = ?, commission_percent = ?, base_rate = ?, advance_allowed = ?
//     WHERE id = ?
//   `;

//   const vals = [
//     data.name, data.type, data.contact_name, data.phone, data.email, data.address,
//     data.city, data.state, data.country, data.payment_mode, data.bank_name, data.account_no,
//     data.ifsc_code, data.upi_id, data.payment_terms, data.commission_percent,
//     data.base_rate, data.advance_allowed ? 1 : 0, req.params.id,
//   ];

//   con.query(sql, vals, (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: "Vendor updated successfully" });
//   });
// });

// Version 2 

app.put("/api/tfc/vendors/:id", (req, res) => {
  const data = req.body;
  const con = dbConnection();

  const sql = `
    UPDATE vendors SET
      name = ?,
      type = ?,                      -- comma-separated services
      contact_name = ?,
      contact_designation = ?,
      phone = ?,
      alternate_phone = ?,
      email = ?,
      address = ?,
      city = ?,
      state = ?,
      country = ?,
      pincode= ?,
      google_location_url = ?,
      payment_mode = ?,
      bank_name = ?,
      account_no = ?,
      ifsc_code = ?,
      upi_id = ?,
      payment_terms = ?,
      commission_percent = ?,
      base_rate = ?,
      advance_allowed = ?,
      operational_hours = ?,
      available_days = ?,
      conditions = ?,
      remarks = ?,
      profile_image_url = ?,
      id_proof_url = ?,
      status = COALESCE(?, status)   -- optional: keep existing if not sent
    WHERE id = ?
  `;

  const vals = [
    data.name,
    data.type || "", // "van,freezer"
    data.contact_name || null,
    data.contact_designation || null,
    data.phone || null,
    data.alternate_phone || null,
    data.email || null,
    data.address || null,
    data.city || null,
    data.state || null,
    data.country || null,
    data.pincode || null,
    data.google_location_url || null,
    data.payment_mode || "bank",
    data.bank_name || null,
    data.account_no || null,
    data.ifsc_code || null,
    data.upi_id || null,
    data.payment_terms || null,
    data.commission_percent ?? null,
    data.base_rate ?? null,
    data.advance_allowed ? 1 : 0,
    data.operational_hours || null,
    data.available_days || null,
    data.conditions || null,
    data.remarks || null,
    data.profile_image_url || null,
    data.id_proof_url || null,
    data.status || null, // pass "active"/"inactive" or omit
    req.params.id,
  ];

  con.query(sql, vals, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Vendor updated successfully" });
  });
});


// Delete Vendor by ID ( From UI Page)

app.delete("/api/tfc/vendors/:id", (req, res) => {
  const con = dbConnection();
  con.query("DELETE FROM vendors WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Vendor deleted successfully" });
  });
});



// Update Vendor Status

app.put("/api/tfc/vendors/:id/status", (req, res) => {
  const con = dbConnection();
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status required" });

  const sql = "UPDATE vendors SET status = ? WHERE id = ?";
  con.query(sql, [status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Vendor status updated", affected: result.affectedRows });
  });
});


// Add Vendor Payment 

app.post("/api/tfc/vendor-payments", (req, res) => {
  const d = req.body;
  if (!d.vendor_id || !d.amount)
    return res.status(400).json({ error: "vendor_id and amount required" });

  const con = dbConnection();

  const sql = `
    INSERT INTO vendor_payments
    (vendor_id, order_id, payment_date, amount, payment_mode, payment_reference, remarks, status)
    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)
  `;
  const vals = [
    d.vendor_id,
    d.order_id || null,
    d.amount,
    d.payment_mode || "bank",
    d.payment_reference || null,
    d.remarks || null,
    d.status || "pending",
  ];

  con.query(sql, vals, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Payment recorded", id: result.insertId });
  });
});




// Schedule generation api

app.post("/api/schedule/generate", (req, res) => {
  const { booking_id, package_code } = req.body;
  const pool = dbConnection();

  pool.getConnection((err, con) => {
    if (err) {
      console.error("Error getting DB connection:", err);
      return res.status(500).json({ success: false, message: "Database connection failed" });
    }

    con.beginTransaction((err) => {
      if (err) {
        con.release();
        console.error("Transaction start error:", err);
        return res.status(500).json({ success: false, message: "Failed to start transaction" });
      }

      const insertScheduleSql = `
        INSERT INTO customer_schedules (booking_id, variant_code, status)
        VALUES (?, ?, 'draft')
      `;
      con.query(insertScheduleSql, [booking_id, package_code], (err, scheduleResult) => {
        if (err) {
          return con.rollback(() => {
            con.release();
            console.error("Error inserting schedule:", err);
            res.status(500).json({ success: false, message: "Failed to create schedule" });
          });
        }

        const schedule_id = scheduleResult.insertId;
        const selectEventsSql = `
          SELECT * FROM package_events WHERE package_code = ? ORDER BY sequence ASC
        `;
        con.query(selectEventsSql, [package_code], (err, events) => {
          if (err) {
            return con.rollback(() => {
              con.release();
              console.error("Error fetching package events:", err);
              res.status(500).json({ success: false, message: "Failed to fetch package events" });
            });
          }

          if (!events.length) {
            return con.rollback(() => {
              con.release();
              res.status(400).json({ success: false, message: "No events found for package" });
            });
          }

          const taskValues = events.map(e => [
            schedule_id,
            e.id,
            e.event_name,
            e.vendor_type,
            'pending'
          ]);
          const insertTaskSql = `
            INSERT INTO schedule_tasks (schedule_id, template_event_id, action_item, vendor_type, status)
            VALUES ?
          `;
          con.query(insertTaskSql, [taskValues], (err) => {
            if (err) {
              return con.rollback(() => {
                con.release();
                console.error("Error inserting tasks:", err);
                res.status(500).json({ success: false, message: "Failed to insert tasks" });
              });
            }

            const updateBookingSql = `
              UPDATE service_bookings SET schedule_created = 1 WHERE id = ?
            `;
            con.query(updateBookingSql, [booking_id], (err) => {
              if (err) {
                return con.rollback(() => {
                  con.release();
                  console.error("Error updating booking:", err);
                  res.status(500).json({ success: false, message: "Failed to update booking" });
                });
              }

              con.commit((err) => {
                if (err) {
                  return con.rollback(() => {
                    con.release();
                    console.error("Commit error:", err);
                    res.status(500).json({ success: false, message: "Failed to commit transaction" });
                  });
                }

                con.release();
                res.status(201).json({
                  success: true,
                  schedule_id,
                  message: "Schedule created successfully"
                });
              });
            });
          });
        });
      });
    });
  });
});



// Fetch Schedule API , Consultant to add timings

app.get("/api/schedule/:schedule_id", (req, res) => {
  const { schedule_id } = req.params;
  const con = dbConnection();
  console.log("Schuedle ID from params" +schedule_id);

  const sql = `
    SELECT 
      id, 
      action_item, 
      vendor_type, 
      vendor_id, 
      scheduled_date, 
      scheduled_time, 
      status 
    FROM schedule_tasks 
    WHERE schedule_id = ? 
    ORDER BY id ASC
  `;

  con.query(sql, [schedule_id], (err, results) => {
    if (err) {
      console.error("Error fetching schedule:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch schedule",
        error: err.message,
      });
    }

    res.json({ success: true, tasks: results });
  });
});



// update schedule api - assign vendors

// app.patch("/api/schedule/update-task/:task_id", (req, res) => {
//   const { task_id } = req.params;
//   const { vendor_id, scheduled_date, scheduled_time } = req.body;
//   const con = dbConnection();

//   const sql = `
//     UPDATE schedule_tasks 
//     SET vendor_id = ?, scheduled_date = ?, scheduled_time = ?, status = 'scheduled'
//     WHERE id = ?
//   `;

//   con.query(sql, [vendor_id, scheduled_date, scheduled_time, task_id], (err, result) => {
//     if (err) {
//       console.error("Error updating task:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to update task",
//         error: err.message,
//       });
//     }

//     // Optional: check if any rows actually updated
//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No matching task found to update",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Task updated successfully",
//     });
//   });
// });



// Schedule submission for customer approval

app.patch("/api/schedule/submit/:schedule_id", (req, res) => {
  const { schedule_id } = req.params;
  const con = dbConnection();

  const sql = `
    UPDATE customer_schedules 
    SET status = 'pending_approval' 
    WHERE id = ?
  `;

  con.query(sql, [schedule_id], (err, result) => {
    if (err) {
      console.error("Error submitting schedule:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to submit schedule",
        error: err.message,
      });
    }

    // Optional: check if any rows were affected
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "No schedule found with that ID",
      });
    }

    res.json({
      success: true,
      message: "Schedule submitted for approval",
    });
  });
});


// Get Un Assigned booking for schedule generation

app.get('/api/bookings/unassigned', (req, res) => {
  const con = dbConnection();

  // const sql = `
  //   SELECT 
  //     sb.id AS booking_id,
  //     sb.order_id,
  //     sb.package_code,
  //     sb.service_date,
  //     sb.address,
  //     o.customer_name,
  //     o.customer_phone
  //   FROM service_bookings sb
  //   JOIN orders o ON o.id = sb.order_id
  //   WHERE sb.schedule_created = 0
  //   ORDER BY sb.service_date DESC
  // `;

  const sql = `
  SELECT 
    sb.id AS booking_id,
    sb.order_id,
    sb.package_code,
    sb.service_date,
    sb.address,
    o.customer_name,
    o.customer_phone,
    oi.package_variant
  FROM service_bookings sb
  JOIN orders o ON o.id = sb.order_id
  JOIN order_items oi ON oi.order_id = o.id
  WHERE sb.schedule_created = 0
  ORDER BY sb.service_date DESC
`;


  con.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching unassigned bookings:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to load unassigned bookings',
        error: err.message,
      });
    }

    res.json({ success: true, bookings: results });
  });
});


//Backend: return schedule tasks and booking city (one call)
// GET /api/schedule/:schedule_id/details

// Version 1 : working fine
// app.get("/api/schedule/:schedule_id/details", (req, res) => {
//   const { schedule_id } = req.params;
//   const con = dbConnection();

//   const sql = `
//     SELECT 
//       st.id, st.action_item, st.vendor_type, st.vendor_id, st.scheduled_date, st.scheduled_time, st.status,
//       sb.city AS booking_city
//     FROM schedule_tasks st
//     JOIN customer_schedules cs ON cs.id = st.schedule_id
//     JOIN service_bookings sb ON sb.id = cs.booking_id
//     WHERE st.schedule_id = ?
//     ORDER BY st.id ASC
//   `;

//   con.query(sql, [schedule_id], (err, rows) => {
//     if (err) {
//       console.error("Error fetching schedule details:", err);
//       return res.status(500).json({ success: false, message: "Failed to fetch schedule details" });
//     }
//     const booking_city = rows.length ? rows[0].booking_city : null;
//     const tasks = rows.map(r => ({
//       id: r.id,
//       action_item: r.action_item,
//       vendor_type: r.vendor_type,
//       vendor_id: r.vendor_id,
//       scheduled_date: r.scheduled_date,
//       scheduled_time: r.scheduled_time,
//       status: r.status
//     }));
//     res.json({ success: true, booking_city, tasks });
//   });
// });


// Version 2 : 

app.get("/api/schedule/:schedule_id/details", (req, res) => {
  const { schedule_id } = req.params;
  const con = dbConnection();

  const sql = `
    SELECT 
      -- schedule tasks
      st.id AS task_id, 
      st.action_item, 
      st.vendor_type, 
      st.vendor_id, 
      st.scheduled_date, 
      st.scheduled_time, 
      st.status,

      -- service_bookings
      sb.service_date,
      sb.address AS booking_address,
      sb.city AS booking_city,
      sb.pincode AS booking_pincode,

      -- orders
      o.customer_name,
      o.customer_phone,
      o.total_price,
      o.payment_status,
      o.status AS order_status,
      o.created_at AS order_created_at,

      -- order_items (service details)
      oi.serviceName,
      oi.package_variant

    FROM schedule_tasks st
    JOIN customer_schedules cs ON cs.id = st.schedule_id
    JOIN service_bookings sb ON sb.id = cs.booking_id
    JOIN orders o ON o.id = sb.order_id
    LEFT JOIN order_items oi ON oi.order_id = o.id AND oi.item_type = 'service'

    WHERE st.schedule_id = ?
    ORDER BY st.id ASC
  `;

  con.query(sql, [schedule_id], (err, rows) => {
    if (err) {
      console.error("Error fetching schedule details:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch schedule details" });
    }

    if (!rows.length) {
      return res.json({ success: true, message: "No schedule tasks found", tasks: [] });
    }

    const header = {
      customer_name: rows[0].customer_name,
      customer_phone: rows[0].customer_phone,
      total_price: rows[0].total_price,
      payment_status: rows[0].payment_status,
      order_status: rows[0].order_status,
      order_created_at: rows[0].order_created_at,

      service_date: rows[0].service_date,
      address: rows[0].booking_address,
      city: rows[0].booking_city,
      pincode: rows[0].booking_pincode,

      serviceName: rows[0].serviceName,
      package_variant: rows[0].package_variant
    };

    const tasks = rows.map(r => ({
      id: r.task_id,
      action_item: r.action_item,
      vendor_type: r.vendor_type,
      vendor_id: r.vendor_id,
      scheduled_date: r.scheduled_date,
      scheduled_time: r.scheduled_time,
      status: r.status
    }));

    res.json({ success: true, header, tasks });
  });
});



// Backend: eligible vendors API (type + city aware)

// GET /api/vendors/eligible?schedule_id=123&vendor_type=florist
app.get("/api/vendors/eligible", (req, res) => {
  const { schedule_id, vendor_type } = req.query;
  if (!schedule_id || !vendor_type) {
    return res.status(400).json({ success: false, message: "schedule_id and vendor_type are required" });
  }
  const con = dbConnection();

  const sql = `
    SELECT v.*
    FROM vendors v
    JOIN customer_schedules cs ON cs.id = ?
    JOIN service_bookings sb ON sb.id = cs.booking_id
    WHERE v.status = 'active'
      AND LOWER(sb.city) = LOWER(COALESCE(v.city, ''))  -- strict city match
      AND CONCAT(',', LOWER(REPLACE(v.type,' ','')), ',') LIKE CONCAT('%,', LOWER(REPLACE(?, ' ', '')), ',%')
    ORDER BY v.rating DESC, v.name ASC
  `;

  con.query(sql, [schedule_id, vendor_type], (err, rows) => {
    if (err) {
      console.error("Error fetching eligible vendors:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch vendors" });
    }
    res.json({ success: true, vendors: rows });
  });
});


// Backend: update task — support assign and unassign

app.patch("/api/schedule/update-task/:task_id", (req, res) => {
  const { task_id } = req.params;
  let { vendor_id, scheduled_date, scheduled_time } = req.body;
  const con = dbConnection();

  const isUnassign = vendor_id === null || vendor_id === undefined || vendor_id === "" || vendor_id === "null";

  const sql = isUnassign ? `
    UPDATE schedule_tasks 
    SET vendor_id = NULL, status = 'pending',
        scheduled_date = ?, scheduled_time = ?
    WHERE id = ?
  ` : `
    UPDATE schedule_tasks 
    SET vendor_id = ?, scheduled_date = ?, scheduled_time = ?, status = 'scheduled'
    WHERE id = ?
  `;

  const params = isUnassign
    ? [null, null, task_id]
    : [vendor_id, scheduled_date || null, scheduled_time || null, task_id];

  con.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error updating task:", err);
      return res.status(500).json({ success: false, message: "Failed to update task", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "No matching task found to update" });
    }
    res.json({ success: true, message: isUnassign ? "Vendor unassigned" : "Task updated successfully" });
  });
});


// Frontend: filter vendors per row by type + city (2 ways)

// GET /api/vendors/by-city/:city
app.get("/api/vendors/by-city/:city", (req, res) => {
  const con = dbConnection();
  con.query(`
    SELECT * FROM vendors 
    WHERE status='active' AND LOWER(city)=LOWER(?)
    ORDER BY rating DESC, name ASC
  `, [req.params.city], (err, rows) => {
    if (err) return res.status(500).json({ success:false, message:"Failed to fetch vendors" });
    res.json({ success:true, vendors: rows });
  });
});



// Client Search — Find Schedules by Mobile or Email

// app.post("/api/client/find-schedules", (req, res) => {
//   const { contact } = req.body;
//   if (!contact) {
//     return res.status(400).json({
//       success: false,
//       message: "Contact (mobile/email) is required",
//     });
//   }

//   const con = dbConnection();
//   const sql = `
//     SELECT 
//       cs.id AS schedule_id,
//       sb.city,
//       sb.service_date,
//       cs.status
//     FROM customer_schedules cs
//     JOIN service_bookings sb ON sb.id = cs.booking_id
//     JOIN orders o ON o.id = sb.order_id
//     WHERE o.customer_phone = ? OR o.customer_email = ?
//     ORDER BY sb.service_date DESC
//   `;

//   con.query(sql, [contact, contact], (err, rows) => {
//     if (err) {
//       console.error("❌ Error fetching client schedules:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Database error while fetching schedules",
//       });
//     }

//     if (!rows.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No schedules found for the provided contact",
//       });
//     }

//     res.json({ success: true, schedules: rows });
//   });
// });


// Version 2 

app.post("/api/client/find-schedules", (req, res) => {
  const { contact } = req.body;

  if (!contact) {
    return res.status(400).json({
      success: false,
      message: "Contact (mobile/email) is required",
    });
  }

  const con = dbConnection();

  const sql = `
    SELECT 
      cs.id AS schedule_id,
      sb.city,
      sb.service_date,
      cs.status
    FROM customer_schedules cs
    JOIN service_bookings sb ON sb.id = cs.booking_id
    JOIN orders o ON o.id = sb.order_id
    JOIN customers c ON c.phone = o.customer_phone
    WHERE c.phone = ? OR c.email = ?
    ORDER BY sb.service_date DESC
  `;

  con.query(sql, [contact, contact], (err, rows) => {
    if (err) {
      console.error("❌ Error fetching client schedules:", err);
      return res.status(500).json({
        success: false,
        message: "Database error while fetching schedules",
      });
    }

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "No schedules found for the provided contact",
      });
    }

    res.json({ success: true, schedules: rows });
  });
});



// Client Schedule Detail View (Safe Fields Only)


app.get("/api/client/schedule/:schedule_id", (req, res) => {
  const { schedule_id } = req.params;
  const con = dbConnection();

  const sql = `
    SELECT 
      st.action_item AS event,
      DATE_FORMAT(st.scheduled_date, '%Y-%m-%d') AS date,
      TIME_FORMAT(st.scheduled_time, '%H:%i') AS time
    FROM schedule_tasks st
    WHERE st.schedule_id = ?
    ORDER BY st.scheduled_date, st.scheduled_time
  `;

  con.query(sql, [schedule_id], (err, rows) => {
    if (err) {
      console.error("❌ Error fetching schedule details:", err);
      return res.status(500).json({
        success: false,
        message: "Database error while loading schedule details",
      });
    }

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "No schedule events found",
      });
    }

    res.json({ success: true, schedule: rows });
  });
});


app.use("/api/client/*", (req, res, next) => {
  console.log(`🔍 Client API Access: ${req.ip} - ${req.originalUrl}`);
  next();
});



// -------------------- The Funeral Company API End -----------------------




// --------------------  SNEKA API BEGINS ----------------------------------------


// app.post('/api/sneka/slots/create', (req, res) => {
//   const { date, capacity } = req.body;
//   if (!date) return res.status(400).json({ error: 'Date required' });

//   const defaultSlots = [
//     '10:00 - 11:00',
//     '11:30 - 12:30',
//     '1:00 - 2:00',
//     '2:30 - 3:30',
//     '4:00 - 5:00'
//   ];

//   try {
//     const con = dbConnection();
//     con.connect();
//     const values = defaultSlots.map(s => [date, s, capacity || 3, 0]);
//     const sql = 'INSERT INTO SnekaSlots (slotDate, timeSlot, capacity, bookedCount) VALUES ?';
//     con.query(sql, [values], (err) => {
//       if (err) {
//         console.error('Insert error', err);
//         return res.status(500).json({ error: 'DB Error' });
//       }
//       res.status(201).json({ message: 'Slots created successfully' });
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'DB connection error' });
//   }
// });


app.post('/api/sneka/slots/create-range', (req, res) => {
  const { startDate, endDate, capacity } = req.body;
  if (!startDate || !endDate)
    return res.status(400).json({ error: 'Start and end date required' });

  const defaultSlots = [
    '10:00 - 11:00',
    '11:30 - 12:30',
    '1:00 - 2:00',
    '2:30 - 3:30',
    '4:00 - 5:00'
  ];

  // Generate all dates between start and end
  const allDates = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    allDates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  const values = [];
  allDates.forEach(d => {
    defaultSlots.forEach(s => {
      values.push([d, s, capacity || 3, 0]);
    });
  });

  try {
    const con = dbConnection();
    con.connect();
    const sql = 'INSERT INTO SnekaSlots (slotDate, timeSlot, capacity, bookedCount) VALUES ?';
    con.query(sql, [values], (err) => {
      if (err) {
        console.error('Insert error', err);
        return res.status(500).json({ error: 'DB Error' });
      }
      res.status(201).json({ message: 'Monthly slots created successfully', total: values.length });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB connection error' });
  }
});




app.get('/api/sneka/slots', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  try {
    const con = dbConnection();
    con.connect();
    const sql = `SELECT id, slotDate, timeSlot, capacity, bookedCount, (bookedCount >= capacity) AS isBooked
                 FROM SnekaSlots WHERE slotDate = ? ORDER BY timeSlot`;
    con.query(sql, [date], (err, result) => {
      if (err) {
        console.error('DB error', err);
        return res.status(500).json({ error: 'Database Error' });
      }
      res.json(result);
    });
  } catch (err) {
    console.error('DB connection error', err);
    res.status(500).json({ error: 'DB connection error' });
  }
});



app.post('/api/sneka/book-slot', (req, res) => {
  const { name, phone, email, date, timeSlot, designType, notes } = req.body;
  if (!name || !phone || !date || !timeSlot)
    return res.status(400).json({ error: 'Missing required fields' });

  try {
    const con = dbConnection();
    con.connect();

    const findSlot = `SELECT * FROM SnekaSlots WHERE slotDate=? AND timeSlot=?`;
    con.query(findSlot, [date, timeSlot], (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (!rows.length) return res.status(404).json({ error: 'Slot not found' });

      const slot = rows[0];
      if (slot.bookedCount >= slot.capacity)
        return res.status(400).json({ error: 'Slot is full' });

      const slotId = slot.id;
      const update = `UPDATE SnekaSlots SET bookedCount = bookedCount + 1 WHERE id = ?`;
      con.query(update, [slotId], (err2) => {
        if (err2) return res.status(500).json({ error: 'Slot update failed' });

        const insert = `
          INSERT INTO SnekaBookings (name, phone, email, date, timeSlot, designType, notes, slotId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        con.query(insert, [name, phone, email, date, timeSlot, designType, notes, slotId], (err3, result) => {
          if (err3) return res.status(500).json({ error: 'Insert error' });
          res.status(201).json({ message: 'Booking confirmed', bookingId: result.insertId });
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'DB connection error' });
  }
});


app.delete('/api/sneka/booking/:id', (req, res) => {
  const { id } = req.params;
  try {
    const con = dbConnection();
    con.connect();

    const find = `SELECT slotId FROM SnekaBookings WHERE id=?`;
    con.query(find, [id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (!rows.length) return res.status(404).json({ error: 'Booking not found' });

      const slotId = rows[0].slotId;
      const deleteQuery = `DELETE FROM SnekaBookings WHERE id=?`;
      con.query(deleteQuery, [id]);

      const updateSlot = `UPDATE SnekaSlots SET bookedCount = bookedCount - 1 WHERE id=? AND bookedCount > 0`;
      con.query(updateSlot, [slotId]);

      res.json({ message: 'Booking cancelled and slot released' });
    });
  } catch (err) {
    res.status(500).json({ error: 'DB connection error' });
  }
});


// Metal Estimation API

const densityRatios = {
  "Gold 22K (916)": 1.0,
  "Gold 18K (750)": 15.60 / 17.50,
  "Gold 14K (585)": 13.10 / 17.50,
  "White Gold 18K": 14.80 / 17.50,
  "White Gold 14K": 13.60 / 17.50,
  "Platinum 950": 21.45 / 17.50,
  "Silver 925": 10.50 / 17.50
};

app.post("/api/estimate-metal", (req, res) => {
  const { designName, baseWeight, baseSize, complexityFactor, targetSize, metalType } = req.body;

  if (!baseWeight || !baseSize || !targetSize || !metalType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const densityRatio = densityRatios[metalType] || 1.0;
  const estimatedWeight = (
    baseWeight * (targetSize / baseSize) * complexityFactor * densityRatio
  ).toFixed(2);

  res.json({
    designName,
    metalType,
    estimatedWeight: Number(estimatedWeight),
    notes: "±5–8% finishing tolerance",
    unit: "grams"
  });
});


// --------------------  SNEKA API ENDS   ----------------------------------------

// Helper rollback function
function rollback(con, res, msg, err) {
  console.error(msg, err);
  con.rollback(() => {
    res.status(500).json({ error: msg });
  });
}







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
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'fullchain.crt'))
};
const server = https.createServer(options,app);

//app.listen(PORT, () => {
  server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


