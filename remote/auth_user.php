<?php
define('SMF_JWT_KEY','MB_Footbill_15'); //Shared secret with apps that wish to use the token
require_once('SSI.php');
if ($user_info['is_guest']) {
  echo "var SMFUser = {};\n";
} else {
  require_once('Sources/JWT.php');
  $token = Array();
  $response = Array();
  $token['iss'] = & $user_info['id'];
  $$token['exp'] = time() + (24*60*60);  //expires in 24 hours
  $response['token'] = JWT::encode($token,SMF_JWT_KEY);
  $response['user']['name'] = & $user_info['name'];
  $response['user']['email'] = & $user_info['email'];
  $response['user']['uid'] = & $user_info['id']; //Prefer this name in user object
  $response['user']['avatar'] = $context['user']['avatar']['href'];
  $response['user']['groups'] = &$user_info['groups'];
  echo "var SMFUser = ".json_encode($response) . ";\n";
  unset($token);
  unset($response);
}

