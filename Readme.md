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

v3 of this application used an sqlite(3) database named football.db.  This
application will use the same database. However there are some new requirements
in this system that means we that it will not be exactly the same.  The
following principals are important though:-

- Databases have versions (previous version is version 13), and it is mandatory
  if the database structure changes to increase the version number and provide a
  migration between the previous version and the new version.  Once a full
  release has been made the particular database version it uses is frozen.  Any
  further updates will require a new version to be allocated
- The data stored in the git repository should enable a generic migration, but
  some data is unique to Melinda's Backups (or to any other organisation).  Some
  of it may be private (private keys for instance) and these are not for posting
  to a public repository.  The migration mechansism must allow updates to the
  database during migration in a generic manner, but provide for pre and post
  migration scripts to run that are private to an organisation and not stored in
  the repository.  
- The previous version relied on an external system from checking and providing
  user sign in credentials.  This version will store user credentials in the
  database.  Despite this, it is important to realise that the ability to
  emulate another user does not infer very much advantage and so we should go
  overboard in protecting ourselves. Nevertheless sign in credentials
  (specifically users passwords) will be encrypted, just in case the user is
  using the same credentials elsewhere.  

The `Database.md` file in the `docs` directory will expand on these issues further.



### Cookies

The application uses two cookies to simplify many aspects of the operation.
The names of these cookies are settings in the database, with the expectation that
each installation will use different names.  Although this is not essential and 
the defaults loaded into the initial database are fine, it allows an added level
of customisation that doesn't incur much penalty.  

The cookies are:-

* A "visit" cookie, effectively allowing an unauthorised user to be walked
  through the registration and login process in the correct order.  Because, at
  the moment, all current users don't yet have a password, and some may have to
  apply for membership because their email address has changed since they last
  played, and the membership process has multiple steps to it, we need to keep
  track of where a user is across multiple visits.  This cookie does that.
  However this cookie is used to store other info.  In order that it is actually
  a JSON.stringified string on an object with three properties:-
  1. **step** where the user is through the process
  2. **consent** a marker to indicate that the user has seen the consent
     notification assoicated with  the main "user" cookie described below, and
  3. **cid** the id of the users working competition.


* A "user" cookie, is created when a user logs in.  Dependant whether that user
  wants to be remembered or not determines whether we create a session cookie or
  one with a longer lifetime.  The cookie holds user details and also a usage
  parameter.  This allows a user to be *temporarily* logged in to edit their
  profile, but then logged out automatically when when they have finished and
  brought to the log on screen again.


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
  const prof = Router(routerOpts);
  const usr = Router(routerOpts);
  const approv = Router(routerOpts);
  const admin = Router(routerOpts);
  const gadm = Router(routerOpts);
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
  <dt>profile</dt>
  <dd>Functions User to allow user to edit his profile</dd>
  <dt>user</dt>
  <dd>Functions to allow the user to display data and make their picks</dd>
  <dt>approve</dt>
  <dd>Functions to allow an approver to approve new memberships</dd>
  <dt>admin</dt>
  <dd>Functions used by the competition administrator to manage the competition</dd>
  <dt>gadm</dt>
  <dd>Global Admin Function</dd>
</dl>

Various levels of middleware (no brackets) and apis (with [] brackets) are provided down the chain which goes as follows:-

```
[/api/delete_cookie]-->[/api/config/*(get only)]-->[/api/pin/:token]-->visitorCookieCheck-->
                                                                                            |
    <----------------------------------------------------------------------------------------
    |
    -->bodyparser -->[/api/session/*]-->fullCookieCheck-->[/api/profile/*]-->
                                                                           |
    <-----------------------------------------------------------------------
    |
    -->fullCookieAuthorisedCheck-->[/api/user/*]-->404
                                 |
                                 |-->[/api/approve]-->userHasMemberApproval-->[/api/approve/*]-->404
                                 |               
                                 |-->[/api/admin] -->userIsCompetitionAdmin-->[/api/admin/*]-->404
                                 |
                                 -->/[/api/gadm]-->userIsGlobalAdmin-->[/api/gadm/*]-->404
```

The middleware referenced above is
<dl>
  <dt>visitorCookieCheck</dt>
  <dd>Checks that the visitor has a visitor cookie set - which implies he has given consent for limited purposes.  It aslo includes
  a cid parameter which is added to the request to be passed through the other routers to the final</dd>
  <dt>Body parser</dt>
  <dd>A standard module which parses a stringifyed json set of parameters in the request body into a params object</dd>
  <dt>fullCookieCheck</dt>
  <dd>This checks for the presence of a full cookie holding user logon details</dd>
  <dt>fullCookieAuthorisedCheck</dt>
  <dd>This checks that the user is fully logged in, and therefore is fully authorised to be a user in the competitions.</dd>
  <dt>userHasMemberApproval</dt>
  <dd>Checks that this user is allowed to approve new members</dd>
  <dt>userIsCompetitionAdmin</dt>
  <dd>Checks that this user is the administrator of the competition in the "cid" cookie</dd>
  <dt>userIsGlobalAdmin</dt>
  <dd>User is a Global Admin</dd>
</dl>



### Client Page Management

Before discussing this in any depth I want to make a brief comment on the names I am using for custom elements.  The spec requires that they
by in at least two parts, so I am using the first part to characterise their place in the application.  `<app-xxxx>` is reserved for elements that would generally be applicable in any application and which I might port to other places.  This is really all about session management and getting the user to a position where they are logged on and ready to progress with the app.  From this point on `<fm-xxxx>` elements take over as the main framework of the application.  Where UI components are generic, they will be named to best describe their role (e.g. `<fancy-input>`).

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
    <fw-pages>
      ${
        {
          home: <fw-summary></fw-summary>
          profile:<app-profile></app-profile>
          admin:<fw-admin .route=${subroute}>
          ...
        }[page];
      }
    </fw-pages>
  }
```
This setup is fundementally controlled by 4 variables
<dl>
  <dt>authorised</dt>
  <dd>Set when the user is authorised to access the content</dd>
  <dt>state</dt>
  <dd>session controls the state when not yet authorises and uses it to display a single page using the Object Selection Method shown</dd>
  <dt>page</dt>
  <dd>a variable controlled by the first level of the route using the `<app-page-manager>` which `<fw-pages>` extends (we can
  have multiple levels of route as shown with the admin page)</dd>
  <dt>anError</dt>
  <dd>Set when an error needs to be displayed.  `<app-error>` listens to window `error` event</dd>
</dl>

### Client Side Routing

Two modules, `location.js` and `route.js` work in combination with each other to manage routing.  The former picks up 
changes to browser url if its been initialised via a call to `connectUrl(route => this.route)` function. This is done
by `<fm-pages>` The `<page-manager>` is an element that is extended by any other element (for instance `<fm-scores>` as
well as `<fm-pages>`) that needs to manage routing to subpages and uses the route changes to set the *page* variable to
the correct value.  Routes don't just have page segments, but also parameter segments. 

What this effectively means that a client site route is a definition of which page to display in the hierarchy at any
one time. So for example if we have a route /rounds/5/user/12/picks this could be interpreted as the top level 
"rounds" page for round 5 in the current competition for user 12, show the "picks" page.  The  `<fm-pages>` controls a 
selection of the "home" page (url /), and the "rounds" page, but then the "rounds" page is also derived from
the `<page-manager>` element as is the "picks" page.

Our client side route are as follows:-

```
/-   - home page selects one of several subroutes as the default dependant on condition
  |       (check the code for <fm-home>)
  /soon - if the current competition is not yet open this is displayed
  /register  - show registration page if not already registered and competition is open but not closed
  /scores - shows the total scores in the competition for all users
  | /user/:uid - list of all the rounds and the scores from those rounds a partiular user (the totals 
  |                and the playoff scores for user in heading)
  /rounds/:rid - shows the particular round scores for all users (each item in list is like item 
  |          |     in /scores/user/:uid, but for a particular round, and all users.).  A header to 
  |          |     the list will show the bonus question and answers, indicating which answer 
  |          |     is the correct one (if results are in)  
  |          /user/:uid - display the results for a particular user, or allow a user (if user is "me") 
  |                         to pick if deadline not yet past  
  /teams - That shows all divisions, (along with the teams) and all the users 
  | |
  | /user/:uid - show pics for a specific user
  /admin - menu of options and details of competition (from admin perspective) and ability to create new round
  | |
  | /round - editing details of the latest round of the competition
  | | |
  | | /:rid - as above but for a specific round
  | /email - email addresses of users in competition, with ability to send selected users a short message. 
  | /help - a menu from which the following topics can be access to tell the user how to administer the competition
  |     |
  |     /competition - what all the facilites at competition level do
  |     /teams - understanding and manipulating the team panel (team in competition and forming matches)
  |     /matches - understanding and manipulating the match panel
  |     /bonus - undertanding and manipulating the bonus panel
  /gadm - menu of choices for global admins
  | |  
  | /new - create a new competion, name it and assign an administrator
  | /promote - show a list of users with ability to up or downgrde approval status or upgrade to global admin status   
  | /email - send a short message to a selected set of users  
  /profile - a page for users to edit their details.
  /help - navigation help
  /howto - instructions for playing.
     
```

Moving around the hierarchy of routes will either by a selection of one item from a list leading to the next level of detail or selection,
or by a dynamic menu under the mainmenu button, which will always have

* Home
* Dynamically added items here
* Change Competition
* Edit Profile

but may acquire other options added where appropriate given current context

* Scores - Shown if user is automatically taken to /register, /pick, or /results as their home option
* Matches - If at least one open round with matches defined
* Teams - If at least one open round with teams defined
* Approve - if user is a approver and there is at least one member awaiting approval
* Admin - If user is competition admin, dynamic sub menus
  * Teams  -- either list of teams that can be added to competition or list in competition to select for matches.
  * Rounds
  * Matches
  * Bonus
  * Users
* Promote - If user is global Admin
* Create Competion - If user is global admin


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


