<?php
define('SMF_JWT_KEY','MB_Footbill_15'); //Shared secret with apps that wish to use the token
define('SMF_JWT_ISS','Melindas Backups');
require_once('SSI.php');
if ($user_info['is_guest']) {
  echo "{}\n";
} else {
  require_once('Sources/JWT.php');
  $token = Array();
  $token['iss'] = SMF_JWT_ISS;
  $token['sub'] = & $user_info['id'];
  $token['exp'] = time() + (24*60*60);  //expires in 24 hours
  $token['name'] = & $user_info['name'];
  $token['email'] = & $user_info['email'];
  $token['uid'] = & $user_info['id']; //Prefer this name in user object
  $token['avatar'] = $context['user']['avatar']['href'];
  $token['groups'] = &$user_info['groups'];
  $response['token'] = JWT::Encode($token,SMF_JWT_KEY);
  echo '{"token":"'. JWT::Encode($token,SMF_JWT_KEY) . '"}'."\n";
  unset($token);
}


