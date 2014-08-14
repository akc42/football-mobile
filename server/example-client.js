/*
*  Copied from http://stackoverflow.com/questions/20793902/auth-between-a-website-and-self-owned-api
* CLIENT EXAMPLE
*/
//this is used to parse the profile
function url_base64_decode(str) {
  var output = str.replace("-", "+").replace("_", "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }
  return window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
}
var token;

//authenticate at some point in your page
$(function () {
    $.ajax({
        url: '/authenticate',
        type: 'POST',
        data: {
            username: 'john',
            password: 'foo'
        }
    }).done(function (authResult) {
        token = authResult.token;
        var encoded = token.split('.')[1];
        var profile = JSON.parse(url_base64_decode(encoded));
        alert('Hello ' + profile.first_name + ' ' + profile.last_name);
    });
});

//send the authorization header with token on every call to the api
$.ajaxSetup({
    beforeSend: function(xhr) {
        if (!token) return;
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    }
});

//api call
setTimeout(function () {
    $.ajax({
        url: '/api/something',
    }).done(function (res) {
        console.log(res);
    });
}, 5000);
