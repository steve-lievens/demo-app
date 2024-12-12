("use strict");
// --------------------------------------------------------------------------
// Require statements
// --------------------------------------------------------------------------
const http = require("http");
const proxiedHttp = require("findhit-proxywrap").proxy(http, { strict: false });
const express = require("express");
const path = require("path");

const { CloudantV1 } = require("@ibm-cloud/cloudant");

const session = require("express-session");
const passport = require("passport");
const WebAppStrategy = require("ibmcloud-appid").WebAppStrategy;

const { IamAuthenticator } = require("ibm-watson/auth");

// --------------------------------------------------------------------------
// Read environment variables
// --------------------------------------------------------------------------

// When not present in the system environment variables, dotenv will take them
// from the local file
require("dotenv-defaults").config({
  path: "my.env",
  encoding: "utf8",
  defaults: "my.env.defaults",
});

// App ENV
const APP_NAME = process.env.APP_NAME;

// IBM COS ENV
const COS_ENDPOINT = process.env.COS_ENDPOINT;
const COS_APIKEY = process.env.COS_APIKEY;
const COS_HMAC_ACCESS = process.env.COS_HMAC_ACCESS;
const COS_HMAC_SECRET = process.env.COS_HMAC_SECRET;
const COS_RES_INST_ID = process.env.COS_ENDPOINT;
const COS_BUCKET = process.env.COS_BUCKET;

const APPID_ENABLED = process.env.APPID_ENABLED === "true";
const APPID_CLIENT_ID = process.env.APPID_CLIENT_ID;
const APPID_TENANT_ID = process.env.APPID_TENANT_ID;
const APPID_SECRET = process.env.APPID_SECRET;
const APPID_OAUTH_SERVERURL = process.env.APPID_OAUTH_SERVERURL;
const APPID_REDIRECT_HOSTNAME = process.env.APPID_REDIRECT_HOSTNAME;
const APPID_REDIRECT_URI = process.env.APPID_REDIRECT_URI;

const WATSONX_APIKEY = process.env.WATSONX_APIKEY;
const WATSONX_PROJECT_ID = process.env.WATSONX_PROJECT_ID;
const WATSONX_URL = process.env.WATSONX_URL;

// --------------------------------------------------------------------------
// Initialization App Logging
// --------------------------------------------------------------------------
console.log("INFO: Here we go ! Starting up the app !!!", APP_NAME);

// --------------------------------------------------------------------------
// Setup the express server
// --------------------------------------------------------------------------
const app = express();

// create application/json parser
// limit was raised to support large post bodies coming in
app.use(express.json({ limit: "50mb" })); // to support JSON-encoded bodies
app.use(express.urlencoded({ limit: "50mb", extended: true })); // to support URL-encoded bodies

// --------------------------------------------------------------------------
// Initialization IBM COS
// --------------------------------------------------------------------------
const ibmcos = require("ibm-cos-sdk");

const config = {
  endpoint: COS_ENDPOINT,
  apiKeyId: COS_APIKEY,
  ibmAuthEndpoint: "https://iam.ng.bluemix.net/oidc/token",
  serviceInstanceId: COS_RES_INST_ID,
  // these two are required to generate presigned URLs
  credentials: new ibmcos.Credentials(
    COS_HMAC_ACCESS,
    COS_HMAC_SECRET,
    (sessionToken = null)
  ),
  signatureVersion: "v4",
};

var cos = new ibmcos.S3(config);

// --------------------------------------------------------------------------
// Setup the APP ID integration
// --------------------------------------------------------------------------
app.use(
  session({
    secret: "ibmclientengineeringSECRET123456",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// APP ID setup
passport.use(
  new WebAppStrategy({
    tenantId: APPID_TENANT_ID,
    clientId: APPID_CLIENT_ID,
    secret: APPID_SECRET,
    oauthServerUrl: APPID_OAUTH_SERVERURL,
    redirectUri: APPID_REDIRECT_HOSTNAME + APPID_REDIRECT_URI,
  })
);
// Handle callback
app.get(
  APPID_REDIRECT_URI,
  passport.authenticate(WebAppStrategy.STRATEGY_NAME)
);

// --------------------------------------------------------------------------
// REST API : health - unprotected endpoint
// --------------------------------------------------------------------------
app.get("/health", function (req, res) {
  var health = {
    health: "OK",
  };
  console.log("INFO: Service health returning " + JSON.stringify(health));
  res.json(health);
});

// --------------------------------------------------------------------------
// Protect the whole app
// --------------------------------------------------------------------------
if (APPID_ENABLED) {
  console.log("INFO: App ID integration has been enabled.");
  app.use(passport.authenticate(WebAppStrategy.STRATEGY_NAME));
} else {
  console.log("INFO: App ID integration has been disabled.");
}

// serve the files out of ./public as our main files
app.use(express.static(path.join(__dirname, "../frontend/build")));

// --------------------------------------------------------------------------
// Express Server runtime
// --------------------------------------------------------------------------
// Start our server !
//app.listen(process.env.PORT || 8080, function () {
//  console.log("INFO: app is listening on port %s", process.env.PORT || 8080);
//});
let expressPort = process.env.PORT || 8080;
const srv = proxiedHttp.createServer(app).listen(expressPort);
console.log("INFO: The application is now listening on port " + expressPort);

// --------------------------------------------------------------------------
// Static Content : also map the root dir to the static folder and paths used by React frontend
// --------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});
app.get("/sopfinder", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});
app.get("/report", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});
app.get("/search", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// REST API Endpoints
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// REST API : retrieve info about the host
// --------------------------------------------------------------------------
app.get("/getEnvironment", function (req, res) {
  var hostobj = {
    app_name: APP_NAME,
  };
  console.log(
    "INFO: Service getEnvironment returning : " + JSON.stringify(hostobj)
  );

  res.json(hostobj);
});

// --------------------------------------------------------------------------
// REST API : Get the content of the COS bucket
// --------------------------------------------------------------------------
app.get("/getBucketContent", async function (req, res) {
  let retVal = await getBucketContents(COS_BUCKET);
  var cosContent = {
    bucket_name: COS_BUCKET,
    bucket_list: retVal,
  };
  console.log(
    "INFO: Service getBucketContent returning : " + JSON.stringify(cosContent)
  );

  res.json(cosContent);
});

// --------------------------------------------------------------------------
// REST API : Get Discovery docs based on query/filter
// --------------------------------------------------------------------------
app.post("/getCosFileContent", async function (req, res) {
  console.log("INFO: getCosFileContent started");

  const fileName = req.body.filename;
  console.log("INFO: Received filename:", fileName);

  let retVal = await getCosFileContent(COS_BUCKET, fileName);

  var cosContent = {
    bucket_name: COS_BUCKET,
    file_name: fileName,
    file_body: retVal,
  };

  console.log("INFO: Service getCosFileContent returning");
  res.json(cosContent);
});

// --------------------------------------------------------------------------
// Helper : watsonx.ai call generative ai
// --------------------------------------------------------------------------
async function sendToWatsonxAI(
  prompt,
  model_name = "google/flan-ul2",
  //model_name = "meta-llama/llama-2-70b-chat",
  decoding_method = "greedy",
  min_new_tokens = 1,
  max_new_tokens = 100,
  temperature = 0.7,
  repetition_penalty = 2.0
) {
  console.log("INFO: Asking watsonx using model", model_name);
  //console.log("INFO: with prompt");
  //console.log(prompt);
  let watsonxData = {
    model_id: model_name,
    input: prompt,
    parameters: {
      decoding_method: decoding_method,
      max_new_tokens: max_new_tokens,
      min_new_tokens: min_new_tokens,
      stop_sequences: [],
      repetition_penalty: repetition_penalty,
    },
    project_id: WATSONX_PROJECT_ID,
  };

  const data = new URLSearchParams();
  data.append("grant_type", "urn:ibm:params:oauth:grant-type:apikey");
  data.append("apikey", WATSONX_APIKEY);
  const access = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: data.toString(),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      console.log("ERROR : ", error);
      return error;
    });

  const token = access.access_token;

  const summary = await fetch(WATSONX_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(watsonxData),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      console.log("ERROR : ", error);
      return error;
    });

  return summary;
}

// --------------------------------------------------------------------------
// Helper : Get the content of a COS bucket
// --------------------------------------------------------------------------
async function getBucketContents(bucketName) {
  console.log(`INFO: Retrieving bucket contents from: ${bucketName}`);
  return cos
    .listObjects({ Bucket: bucketName })
    .promise()
    .then((data) => {
      if (data != null && data.Contents != null) {
        for (var i = 0; i < data.Contents.length; i++) {
          var itemKey = data.Contents[i].Key;
          var itemSize = data.Contents[i].Size;
          console.log(`INFO: Item: ${itemKey} (${itemSize} bytes).`);
        }
        return data.Contents;
      } else return [];
    })
    .catch((e) => {
      console.error(`ERROR: ${e.code} - ${e.message}\n`);
      return [];
    });
}

// --------------------------------------------------------------------------
// Helper : Get the content of a COS bucket
// --------------------------------------------------------------------------
async function getCosFileContent(bucketName, itemName) {
  console.log(`Retrieving item from bucket: ${bucketName}, key: ${itemName}`);
  return cos
    .getObject({
      Bucket: bucketName,
      Key: itemName,
    })
    .promise()
    .then((data) => {
      if (data != null) {
        const fileContent = Buffer.from(data.Body).toString();
        console.log("File Contents: " + fileContent);
        return fileContent;
      } else return "";
    })
    .catch((e) => {
      console.error(`ERROR: ${e.code} - ${e.message}\n`);
      return "";
    });
}

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// CLOUDANT METHODS - NOT USED HERE
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// Helper : Setup cloudant client
// --------------------------------------------------------------------------
function initCloudantClient() {
  const client = CloudantV1.newInstance({
    serviceName: "CLOUDANT",
  });

  return client;
}

// --------------------------------------------------------------------------
// Helper : get all docs from cloudant db
// --------------------------------------------------------------------------
async function getAllDocsFromDb(client, db_name) {
  let createDocumentResponse = {};

  // get all document
  await client
    .postAllDocs({
      db: db_name,
      includeDocs: true,
    })
    .then((response) => {
      //console.log(response.result);
      createDocumentResponse = response.result;
    })
    .catch((error) => {
      console.log("ERROR: error from DB " + error);
    });

  return createDocumentResponse;
}

// --------------------------------------------------------------------------
// Helper : get all docs from cloudant db
// --------------------------------------------------------------------------
async function getDocFromDbByKey(client, db_name, key) {
  let createDocumentResponse = {};

  // get all document
  await client
    .getDocument({
      db: db_name,
      docId: key,
    })
    .then((response) => {
      //console.log(response.result);
      createDocumentResponse = response.result;
    })
    .catch((error) => {
      console.log("ERROR: error from DB " + error);
    });

  return createDocumentResponse;
}

// --------------------------------------------------------------------------
// Helper : Add doc to db
// --------------------------------------------------------------------------
async function addDocToCloudant(client, dbName, doc) {
  console.log("INFO: Adding doc to Cloudant db " + dbName);
  //console.log(JSON.stringify(doc, null, 2));

  // Create the document
  try {
    const createdDoc = (
      await client.postDocument({
        document: doc,
        db: dbName,
      })
    ).result;

    if (createdDoc.ok) {
      doc._rev = createdDoc.rev;
      console.log("INFO: Document created with response id", createdDoc.id);
      //console.log(JSON.stringify(doc, null, 2));
    }
  } catch (err) {
    if (err.code === 409) {
      console.log("INFO: Cannot create the document, it already exists.");
    } else {
      console.log("ERROR: Cannot create the document with id ", doc._id);
      console.log(err);
    }
  }
}

// --------------------------------------------------------------------------
// Helper : Find multiple results with a regex search
// --------------------------------------------------------------------------
async function searchMultiple(source, regex) {
  // Regex based search in a string and returning an array of results
  const array = [...source.matchAll(regex)];

  return array;
}

// --------------------------------------------------------------------------
// Helper : Remove duplicates from an array
// --------------------------------------------------------------------------
function removeDuplicates(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

// --------------------------------------------------------------------------
// Helper : Combining multiple searches to Cloudant
// --------------------------------------------------------------------------
function searchCloudant(keys, params, languageCode, resolve) {
  const cloudant = new CloudantSDK({
    url: CLOUDANT_URL,
    plugins: { iamauth: { iamApiKey: CLOUDANT_APIKEY } },
  });

  const databaseName = "mydb";

  let i = 0;

  const singleSearchCloudant = (searchItem) =>
    new Promise((resolved, reject) => {
      if (searchItem.text) {
        cloudant
          .use(databaseName)
          .get(searchItem.text)
          .then((answerUnit) => {
            if (answerUnit) {
              console.log("INFO: Found item in Cloudant db");

              if (languageCode == "nl") {
                params.payload.output.generic[i].text = answerUnit.nl;
                console.log("INFO: Content = ", answerUnit.nl);
              } else if (languageCode == "fr") {
                params.payload.output.generic[i].text = answerUnit.fr;
                console.log("INFO: Content = ", answerUnit.fr);
              } else {
                //default to "en"
                params.payload.output.generic[i].text = answerUnit.en;
                console.log("INFO: Content = ", answerUnit.en);
              }
            }
            resolved();
          })
          .catch((error) => {
            console.log("ERROR: error from DB " + error);
            resolved();
          });
      } else if (searchItem.title) {
        cloudant
          .use(databaseName)
          .get(searchItem.title)
          .then((answerUnit) => {
            if (answerUnit) {
              console.log("INFO: Found item in Cloudant db");

              if (languageCode == "nl") {
                params.payload.output.generic[i].title = answerUnit.nl;
                console.log("INFO: Content = ", answerUnit.nl);
              } else if (languageCode == "fr") {
                params.payload.output.generic[i].title = answerUnit.fr;
                console.log("INFO: Content = ", answerUnit.fr);
              } else {
                //default to "en"
                params.payload.output.generic[i].title = answerUnit.en;
                console.log("INFO: Content = ", answerUnit.en);
              }
            }
            resolved();
          })
          .catch((error) => {
            console.log("ERROR: error from DB " + error);
            resolved();
          });
      } else {
        resolved();
      }
    });

  const doAllSearches = async () => {
    for (item of keys) {
      console.log(
        "INFO : Searching for key in : ",
        item,
        ", language : ",
        languageCode
      );
      await singleSearchCloudant(item);
      i++;
    }

    console.log("INFO : All content searches done !");
    resolve();
  };

  doAllSearches();
}
