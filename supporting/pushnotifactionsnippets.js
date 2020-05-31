/*
  This file contains snippets of code from various places to try and figure out how to use push notifications of when new picks are ready
*/
//Using VAPID Key for applicationServerKey
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const vapidPublicKey = '<Your Public Key from generateVAPIDKeys()>';
const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: convertedVapidKey
});
//sendNotification(pushSubscription, payload, options)
const pushSubscription = {
  endpoint: '< Push Subscription URL >',
  keys: {
    p256dh: '< User Public Encryption Key >',
    auth: '< User Auth Secret >'
  }
};

const payload = '< Push Payload String >';

const options = {
  gcmAPIKey: '< GCM API Key >',
  vapidDetails: {
    subject: '< \'mailto\' Address or URL >',
    publicKey: '< URL Safe Base64 Encoded Public Key >',
    privateKey: '< URL Safe Base64 Encoded Private Key >'
  },
  timeout: Number,
    TTL: Number,
  headers: {
        '< header name >': '< header value >'
        },
  contentEncoding: '< Encoding type, e.g.: aesgcm or aes128gcm >',
  proxy: '< proxy server options >',
  agent: '< https.Agent instance >'
          }

          webpush.sendNotification(
          pushSubscription,
          payload,
          options
);

/*
Note: sendNotification() you don't need to define a payload, and this method will work without a GCM API Key and / or VAPID keys if the push service supports it.

*/
//encrypt stuff
const pushSubscription = {
  endpoint: 'https://....',
  keys: {
    p256dh: '.....',
    auth: '.....'
  }
};
webPush.encrypt(
  pushSubscription.keys.p256dh,
  pushSubscription.keys.auth,
  'My Payload',
  'aes128gcm'
)
  .then(encryptionDetails => {

  });

//Web browser main.js
//request permission
Notification.requestPermission(function (status) {
  console.log('Notification permission status:', status);
})

//display a notification
function displayNotification() {
  if (Notification.permission == 'granted') {
    navigator.serviceWorker.getRegistration().then(function (reg) {
      reg.showNotification('Hello world!');
    });
  }
}
//cechk for support
if ('Notification' in window && navigator.serviceWorker) {
  // Display the UI to let the user toggle notifications
}
//check for permission 
if (Notification.permission === "granted") {
  /* do our magic */
} else if (Notification.permission === "blocked") {
  /* the user has previously denied push. Can't reprompt. */
} else {
  /* show a prompt to the user */
}

//with options see https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
function displayNotification() {
  if (Notification.permission == 'granted') {
    navigator.serviceWorker.getRegistration().then(function (reg) {
      var options = {
        body: 'Here is a notification body!',
        icon: 'images/example.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        }
      };
      reg.showNotification('Hello world!', options);
    });
  }
}
//actions with the notification
function displayNotification() {
  if (Notification.permission == 'granted') {
    navigator.serviceWorker.getRegistration().then(function (reg) {
      var options = {
        body: 'Here is a notification body!',
        icon: 'images/example.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        },
        actions: [
          {
            action: 'explore', title: 'Explore this new world',
            icon: 'images/checkmark.png'
          },
          {
            action: 'close', title: 'Close notification',
            icon: 'images/xmark.png'
          },
        ]
      };
      reg.showNotification('Hello world!', options);
    });
  }
}
//check is we have a subscription
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(function (reg) {
    console.log('Service Worker Registered!', reg);

    reg.pushManager.getSubscription().then(function (sub) {
      if (sub === null) {
        // Update UI to ask user to register for Push
        console.log('Not subscribed to push service!');
      } else {
        // We have a subscription, update the database
        console.log('Subscription object: ', sub);
      }
    });
  })
    .catch(function (err) {
      console.log('Service Worker registration failed: ', err);
    });
}





// serviceworker.js
//notification close (dismiss doesn't give an event) 
//see https://developer.mozilla.org/en-US/docs/Web/API/notification for notication object
self.addEventListener('notificationclose', function (e) {
  var notification = e.notification;
  var primaryKey = notification.data.primaryKey;

  console.log('Closed notification: ' + primaryKey);
});
//user clicks on a notification
self.addEventListener('notificationclick', function (e) {
  var notification = e.notification;
  var primaryKey = notification.data.primaryKey;
  var action = e.action;

  if (action === 'close') {
    notification.close();
  } else {
    clients.openWindow('http://www.example.com');
    notification.close();
  }
});


//example of a subscription object
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/dpH5lCsTSSM:APA91bHqjZxM0VImWWqDRN7U0a3AycjUf4O-byuxb_wJsKRaKvV_iKw56s16ekq6FUqoCF7k2nICUpd8fHPxVTgqLunFeVeB9lLCQZyohyAztTH8ZQL9WCxKpA6dvTG_TUIhQUFq_n",
    "keys": {
    "p256dh": "BLQELIDm-6b9Bl07YrEuXJ4BL_YBVQ0dvt9NQGGJxIQidJWHPNa9YrouvcQ9d7_MqzvGS9Alz60SZNCG3qfpk=",
      "auth": "4vQK-SvRAN5eo-8ASlrwA=="
  }
}
//push event handler examole
self.addEventListener('push', function (e) {
  var options = {
    body: 'This notification was generated from a push!',
    icon: 'images/example.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore', title: 'Explore this new world',
        icon: 'images/checkmark.png'
      },
      {
        action: 'close', title: 'Close',
        icon: 'images/xmark.png'
      },
    ]
  };
  e.waitUntil(
    self.registration.showNotification('Hello world!', options)
  );
});

//example
var webPush = require('web-push');

var pushSubscription = { "endpoint": "https://fcm.googleapis.com/fcm/send/c0NI73v1E0Y:APA91bEN7z2weTCpJmcS-MFyfbgjtmlAWuV5YaaNw625_Rq2-f0ZrVLdRPXKGm7B3uwfygicoCeEoWQxCKIxlL3RWG2xkHs6C8-H_cxq-4Z-isAiZ3ixo84-2HeXB9eUvkfNO_t1jd5s", "keys": { "p256dh": "BHxSHtYS0q3i0Tb3Ni6chC132ZDPd5uI4r-exy1KsevRqHJvOM5hNX-M83zgYjp-1kdirHv0Elhjw6Hivw1Be5M=", "auth": "4a3vf9MjR9CtPSHLHcsLzQ==" } };

var vapidPublicKey = 'BAdXhdGDgXJeJadxabiFhmlTyF17HrCsfyIj3XEhg1j-RmT2wXU3lHiBqPSKSotvtfejZlAaPywJ9E-7AxXQBj4
';
var vapidPrivateKey = 'VCgMIYe2BnuNA4iCfR94hA6pLPT3u3ES1n1xOTrmyLw
';

var payload = 'Here is a payload!';

var options = {
  vapidDetails: {
    subject: 'mailto:example_email@example.com',
    publicKey: vapidPublicKey,
    privateKey: vapidPrivateKey
  },
  TTL: 60
};

webPush.sendNotification(
  pushSubscription,
  payload,
  options
);