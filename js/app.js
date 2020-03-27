const COLLECTION = "test_users_6"
const POOL = 'my_pool'
const REGION = "eu-west-1"

$(function(){Webcam.set({
 width: 640,
 height: 480,
 image_format: 'jpeg',
 jpeg_quality: 90
});

Webcam.attach( '#my_camera' );
$("#snapshot").click(function(){take_snapshot()})
function take_snapshot() {
  // take snapshot and get image data
  Webcam.snap( function(data_uri) {
    ProcessImage(data_uri)

   // display results in page
   document.getElementById('results').innerHTML =
   '<img src="'+data_uri+'"/>';
   } );
  }
})
