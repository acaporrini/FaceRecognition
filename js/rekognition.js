function DetectFaces(imageData) {
  AWS.region = REGION;
  var rekognition = new AWS.Rekognition();
  var params = {
    Image: {
      Bytes: imageData
    },
    Attributes: [
      'ALL',
    ]
  };
  rekognition.detectFaces(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      console.log(data)
     var table = "<table><tr><th>Beard</th><th>Sunglasses</th><th>Age Low</th><th>Age High</th></tr>";
      // show each face and build out estimated age table
      for (var i = 0; i < data.FaceDetails.length; i++) {
        table += '<tr><td>' + data.FaceDetails[i].Beard.Value +
        '</td><td>' + data.FaceDetails[i].Sunglasses.Value +
        '</td><td>' + data.FaceDetails[i].AgeRange.Low +
          '</td><td>' + data.FaceDetails[i].AgeRange.High + '</td></tr>';
      }
      table += "</table>";
      document.getElementById("opResult").innerHTML = table;
    }
  });
}

function createCollection(){
  AWS.region = REGION;
  var rekognition = new AWS.Rekognition();
  var params = {
   CollectionId: COLLECTION
  };
  rekognition.createCollection(params, function(err, data) {
    if (err) console.log("collection already exist"); // an error occurred
    else     console.log(data);           // successful response
  });
}

function FetchFromCollection(imageData){
 var params = {
   CollectionId: COLLECTION,
   Image: {
     Bytes: imageData
   },
   MaxFaces: 1
 };
 var rekognition = new AWS.Rekognition();
  rekognition.searchFacesByImage(params, function(err, data) {
   if(err){
     console.log(err, err.stack)
   } else {
     if(data.FaceMatches[0]){
       console.log( data.FaceMatches[0])
       $("#uidResult").text("ID: " +  data.FaceMatches[0].Face.FaceId + " Confidence: " + data.FaceMatches[0].Face.Confidence)
     }else{
       $("#uidResult").text("ID: not found, generating a new one:")
       AddtoCollection(imageData)
     }
   }
 });
}

function AddtoCollection(imageData){
  var params = {
   CollectionId: COLLECTION,
   DetectionAttributes: [
   ],
   ExternalImageId: "myphotoid",
   Image: {
     Bytes: imageData
   }
  };
  var rekognition = new AWS.Rekognition();
  rekognition.indexFaces(params, function(err, data) {
   if (err){
      console.log(err, err.stack)
   }
   else{
     console.log(data);
     $("#uidResult").append("</br> ID: " +  data.FaceRecords[0].Face.FaceId + " Confidence: " + data.FaceRecords[0].Face.Confidence)
   }
 });
}

function ImageToBytes(imageData){
  var image = null;
  var jpg = true;
  try {
    image = atob(imageData.split("data:image/jpeg;base64,")[1]);

  } catch (e) {
    jpg = false;
  }
  if (jpg == false) {
    try {
      image = atob(imageData.split("data:image/png;base64,")[1]);
    } catch (e) {
      alert("Not an image file Rekognition can process");
      return;
    }
  }

  //unencode image bytes for Rekognition DetectFaces API
  var length = image.length;
  imageBytes = new ArrayBuffer(length);
  var ua = new Uint8Array(imageBytes);
  for (var i = 0; i < length; i++) {
    ua[i] = image.charCodeAt(i);
  }
  return imageBytes
}

//Loads selected image and unencodes image bytes for Rekognition DetectFaces API
function ProcessImage(image1) {
  AnonLog();

  imageBytes = ImageToBytes(image1)

  // CreateCollection once if it doesn't exit or do nothing
  createCollection()

  DetectFaces(imageBytes);
  FetchFromCollection(imageBytes);
}
//Provides anonymous log on to AWS services
function AnonLog() {

  // Configure the credentials provider to use your identity pool
  AWS.config.region = REGION; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: POOL,
  });
  // Make the call to obtain credentials
  AWS.config.credentials.get(function () {
    // Credentials will be available when this function is called.
    var accessKeyId = AWS.config.credentials.accessKeyId;
    var secretAccessKey = AWS.config.credentials.secretAccessKey;
    var sessionToken = AWS.config.credentials.sessionToken;
  });
}
