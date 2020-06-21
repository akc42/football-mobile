# MBBall - mobile version
## Introduction

MBBall is an American Football results picking competition Manager. It used to
be used on [Melinda s Backups] (https://www.melindasbackups.com)  for their
annual competition during the American Football season.

This is completely new format, the 4th in its history, written to use web
components, a static web server fronting a nodejs backed which provides an api
server.  Melinda's backups as an active site has now closed and as a result the
server on which it was running no longer supports php scripts (which the
previous version of the software was built on), nor has it a forum which can
provide authentication for users.  This version will have to provide an
alternative.

Since the previous version, originally written in 2008 the users devices have
completely changed.  This new version will have to assume that the majority of
users will access the site via a mobile phone and as such the complex and
detailed tables presented to the user on their home screen will have to be
replaced with a much more dynamic and flexible approach to displaying data.

Although this is an application that I would encourage others to take away and
modify for their own communities, and underlying principal that I have to follow
is that, although the software will create a completely new database for a
community starting up, I have to keep the existing database with competitions
going back to the start, and more importantly, match uses who connect with their
existing records, despite the fact that we no longer have a forum to
authenticate them.  Fortunately we did store more than the basic forum id (a
number) with each *participant*, we have a *name* and an *email address* to go
along with them.  Nevertheless I also have to recognise that some users may have
changed their email since the last competition, so must allow for manual
intervention.

The design of the original application provided for identifying
*administrators*, both global and specifically for a given competition.  Global
administrators can create new competitions and assign themselves or any
registered participant to become an administrator.  We will use those roles to
support resolving some of the difficult cases raised above.

## Technical Approach
### Implementation Language
The previous version of football used a combination of *PHP* on the server and
*Javascript* in the client.  However the Javascript in the client made use of
the *Mootools* framework. 

As stated in the introduction, PHP is no longer available on the server so I
plan to use a technology that I have now tried and tested for several years,
namely nodejs as the server.  I have found this works best when combined with a
front end web server which handles all the requests for static files and which
acts as a proxy for a backend *api* server for request made by the client to
retrieve or update data.

I have also now had considerable experience with the development of a web
component based single page application.  This used a fairly minimal library,
*lit-element*, to smooth the use of the web component based technology and I
have in the process learnt how to handle authentication of users, client side
routing and the the display of separate pages/sections and various levels of the
routing hierarchy.  I am less sure about low level web components.  In my
previous application that required that type of user interface the technologies
were less mature and after being bitten my using a library that was
subsequentially not updated when the underlying technology supporting changed, I
wrote my own. However I know in the community that would use this football app
there is at least one person who is totally blind and relies on the assistive
technologies.  I am actually sure my use of special assistive components in
minimal, so I will continue to use them, but may have to upgrade them to ensure
they fully support the assistive technologies.  This may be a later task in this
project, but I would welcome any input that anyone might have.

### Database

The previous version used an sqlite3 database. I see no reason to change this,
its very easy to take a backup of, or to copy and move around to different
places.  Performance wise it has proved more than adequate to handle the number
of users, and although in the initial display of a page it had a very complex
transaction to perform, the old system already had a way of creating a cache of
the results on the initial page query to speed that initial page display up.

More importantly is the package to use in *nodejs* to interact with the database
in the API layer.  After an initial investigation I found three suitable
packages, namely:-

1.  `sqlite3` is the defacto standard for accessing and sqlite database.
2.  `sqlite` which is a wrapper around `sqlite3`, but provides promises rather than callbacks, and
3.  `better-sqlite3` which touts itself as a faster (and therefore better) version than `sqlite3`

I have bouncing between the technologies.  Initially I thought `better-sqlite3`
was the way to go, but I thought I would write a comparison benchmark test using
the actual query the *PHP* version used to to provide the first page.  This
showed `better-sqlite3` was faster and took about 0.5 seconds on my (fast)
desktop computer as oppsed to 0.67 seconds using `sqlite`.  But when I ran it on
a raspberry pi (a possible server for this app) it took 5 seconds, and that was
unacceptably long to block the event loop.  So I starting work with the second
option, `sqlite` as a wrapper round `sqlite3`.  

Now that I have done some work on the development, I am now seeing that the new
api is going to make much shorter queries.  Even with `sqlite` an api query was
taking less than 20ms (on my desktop).  So I wondered how long `better-sqlite3`
would take.  Now my api queries were around 1 or 2ms.

So for now I have switched back to `better-sqlite3`.  I does have some
limitations - you can't use `async` `await` within a transaction and that does
cause some interesting dynamics between the transaction and `bcrypt` (which
needs to use callbacks or promises) which I am using to manage passwords.  But
I've thought through the implications of not using transactions in that fairly
specialist case and I can get by. 

### API structure

I aim to follow the processes I developed in my previous application.  During
system startup we have a little bit of code that scans a directory for `.js`
files and loads each one, using their name as the api name.

```javascript
  function loadServers(rootdir, relPath) {
    return includeAll({
      dirname: path.resolve(rootdir, relPath),
      filter: /(.+)\.js$/
    }) || {};
  }
```

I then create a set of routers - a base one for the backend web server to call for routing,
and api router for all the api routes, and then a set of separate routers (which will have 
different ways of being called)

```javascript

  const routerOpts = {mergeParams: true};
  const router = Router(routerOpts);  //create a router
  const api = Router(routerOpts);
  const conf = Router();
  const ses = Router(routerOpts);
  const admin = Router(routerOpts);
  const madmin = Router(routerOpts);
  const gadmin = Router(routerOpts);
  const cid = Router(routerOpts);
  const cadmin = Router(routerOpts);
  const cidrid = Router(routerOpts);
  const radmin = Router(routerOpts);
  router.use('/api/', api);

```

As an example, my main config files will be called during app startup and will
just be plain get requests, much like the static files

```javascript

  api.use('/config/', conf);      
  const confs = loadServers(__dirname, 'config');
  for (const config in confs){
    conf.get(`/${config}`, async (req,res) => {
      try {
        const response = await confs[config]();
        res.end(JSON.stringify(response));
      } catch (e) {
        errored(req, res, `config/${config} failed with ${e}`);
      } 
    });
  }

```

So the directories I use are:-

<dl>
  <dt>config</dt>
  <dd>Configuration Variabls and Style CSS variables</dd>
  <dt>session</dt>
  <dd>Functions related to establishing a authorised user, including the sending of emails with links</dd>
  <dt>admin</dt>
  <dd>Functions necessary to manage provide initial information for a partially authorised user.  A partially authorised
  user is one who has logged in via the use of a short term pin sent to him via e-mail.  It only allows him to access his
  profile, where he may edit his password so he can then use it to log on properly.</dd>
  <dt>adminm</dt>
  <dd>All the member approval function, only accessessible if the user is a global admin or has member_approval set it their profile</dd>
  <dt>adminc</dt>
  <dd>Functions that are to administer a competition, the user must either be a global admin or have a uid that matches the administrator field in the competition record</dd>
  <dt>adming</dt>
  <dd>Functions that only a global admin can perform</dd>
  <dt>cid</dt>
  <dd>Functions were the input key to the database required just the competition id (cid).</dd>
  <dt>cidrid</dt>
  <dd>Function where both the cid and the round id (rid) are required as keys to the database.
</dl>

Various levels of middleware (no brackets) and apis (with [] brackets) are provided down the chain which goes as follows:-

```
[/api/delete_cookie]-->[/api/config/*(get only)]-->[/api/pin/:token]-->visitorCookieCheck-->
                                                                                            |
    <----------------------------------------------------------------------------------------
    |
    -->bodyparser -->[/api/session/*]-->fullCookieCheck-->[/api/admin/*]-->
                                                                           |
    <-----------------------------------------------------------------------
    |
    -->fullCookieAuthorisedCheck-->[/api/:cid/*]-->[/api/:cid/:rid/*]-->404
                                 |               |
                                 |               -->[/api/:cid/admin] -->userIsCompetitionAdmin-->
                                 |                                                               |  
                                 |    <-----------------------------------------------------------
                                 |    |
                                 |    -->[/api/:cid/admin/*]-->[/api/:cid/admin/:rid/*]-->404
                                 |
                                 -->[/api/admin/map]-->userHasMemberApproval-->[/api/admin/map/*]-->404
                                 |
                                 -->/[/api/admin/gadm]-->userIsGlobalAdmin-->[/api/admin/gadm/*]-->404
```
### Client Page Management and Client Side Routing

In an appliation like this we need to have control of what the user sees, being sure before he has been properly authorised that
he is not able to access any of the core information.  As this is an application based on web components I provide web components
in a nested hierachy to provide that. Note with `lit-element` a render function with back ticked strings allows the inclusion of variables 
with the `${variable}` construct 

```html
<main-app>
  <app-error>
    ${anError? 'Text about the error':''}
  </app-error>
  <header>Menu Bar, Logo and Sw Version, with copyright notice</header>
  <app-session>
    ${anError || authorised ? '' : {
        verify: <app-email-verify></app-email-verify>
        ...
        logon: <app-logon></app-logon>
      }[state];
    }
  </app-session>
  ${authorised?
    <app-pages>
      ${
        {
          home: <fw-summary></fw-summary>
          profile:<app-profile></app-profile>
          admin:<fw-admin .route=${subroute}>
          ...
        }[page];
      }
    </app-pages>
  }
```
This setup is fundementally controlled by 4 variables
<dl>
  <dt>authorised</dt>
  <dd>Set when the user is authorised to access the content</dd>
  <dt>state</dt>
  <dd>session controls the state when not yet authorises and uses it to display a single page using the Object Selection Method shown</dd>
  <dt>page</dt>
  <dd>a variable controlled by the first level of the route using the `<app-page-manager>` which `<app-pages>` extends (we can
  have multiple levels of route as shown with the admin page)</dd>
  <dt>anError</dt>
  <dd>Set when an error needs to be displayed.  `<app-error>` listens to window `error` event</dd>
</dl>

Two modules, `location.js` and `route.js` work in combination with each other to manage routing.  The former picks up changes to browser url if its been initialised via a call to `connectUrl(route => this.route)` function. This is done by `<app-pages>` The `<app-page-manager>` is an element that is extended
by any other element (for instance `<fw-admin>` as well as `<app-pages>`) that needs to manage routing to subpages and uses the route changes to set the *page* variable to the correct value.

### Client Globals Management

A globals module provides a mechanism to hold common data accessible from any
page.  The just import the module and values will be available on the `global`
object. These are actually getters and setters in to background variables set by a call to /api/config/config.

Two special ones
1. `ready` returns a promise which resolves when the globals have been propulated from the server (session management uses this and so
most other functions can assume that it is already ready when they get to have access to use it),
2. `user` may be written to during logon to set up the current users details.  Any updates to user status should also update this.


### Client Side Debug Log on Server

See module `debug.js` but in essence the database settings table holds two variables `client_log` and `client_log_uid` these settings control if debug
statements in the client result in a call to the server to log things.


### Installation

* Nginx - see nginx/nginx.conf
* Node - use nvm and then npm
* see football.env for details of database location and the upgrade files (note
  already set environment variables can be used to override setting).  The
  FOOTBALL_ENABLE_EMAIL should be set to "yes" to send to actual people,
  otherwise all emails go to the address provided.
* Edit database.sql (or update_13.sql) to ensure the various parameters match your requirements.  Some of the examples are wrong and you MUST change them


