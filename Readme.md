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
## Implementation Language
The previous version of football used a combination of *PHP* on the server and *Javascript* in the client.  However the Javascript in the client made use of the *Mootools* framework. 

As stated in the introduction, PHP is no longer available on the server so I plan to use a technology that I have now tried and tested for several years, namely nodejs as the server.  I have found this works best when combined with a front end web server which handles all the requests for static files and which acts as a proxy for a backend *api* server for request made by the client to retrieve or update data.

I have also now had considerable experience with the development of a web component based single page application.  This used a fairly minimal library, *lit-element*, to smooth the use of the web component based technology and I have in the process learnt how to handle authentication of users, client side routing and the the display of separate pages/sections and various levels of the routing hierarchy.  I am less sure about low level web components.  In my previous application that required that type of user interface the technologies were less mature and after being bitten my using a library that was subsequentially not updated when the underlying technology supporting changed, I wrote my own. However I know in the community that would use this football app there is at least one person who is totally blind and relies on the assistive technologies and I think I need to be able to provide a suitable experience for that person.  I am therefore minded to try and use the *elix* components from [Component Kitchen](https://component.kitchen/elix)

### Database

The previous version used an sqlite3 database. I see no reason to change this, its very easy to take a backup of, or to copy and move around to different places.  Performance wise it has proved more than adequate to handle the number of users, and although in the initial display of a page it had a very complex transaction to perform, the old system already had a way of creating a cache of the results on the initial page query to speed that initial page display up.

More importantly is the package to use in *nodejs* to interact with the database in the API layer.  After an initial investigation I found three suitable packages, namely:-

1.  `sqlite3` is the defacto standard for accessing and sqlite database.
2.  `sqlite` which is a wrapper around `sqlite3`, but provides promises rather than callbacks, and
3.  `better-sqlite3` which touts itself as a faster (and therefore better) version than `sqlite3`

I initially believed that `better-sqlite3` was the way to go.  However the more I examined how it was working, it was doing everything synchronously.  From the start of the transaction until its completion it had exclusive control of the javascript execution thread.  The authors argument, that handling promises and callbacks slowed things down and wasn't worth it for the very short time that a transaction took.  So I decided to conduct a test.  I implemented the exact same sql calls that the old version's main php page was executing during a full display of the main user page, assuming that it could *not* use the cache.  I did this on my test system on my desktop computer for both `better-sqlite3` and for the combination of `sqlite` and `sqlite3`.  `better-sqlite3` was faster at about 0.5 seconds as opposed to `sqlite` at 0.67 seconds.  But when I repeated the test on a raspberry pi that may well end up having to host this it was over 5 seconds for `better-sqlite3` and at least 7 seconds for `sqlite`, but at least the latter was releasing the thread on each database call.  There is no way I can afford to lock a thread supposidly handling multiple http requests simultenously for that length of time, so I have decided to go with `sqlite` in combination with `sqlite3` and live with the slightly worse performance.

### API structure

I aim to follow the processes I developed in my previous application.  During system startup we have a little bit of code that scans a directory for `.js` files and loads each one, using their name as the api name.

```
const includeAll = require('include-all');
const API = require('./api');
const PDF = require('./pdf');

...
const apis = includeAll({
  dirname: path.resolve(__dirname, 'api'),
  filter: /(.+)\.js$/
});

```

### Installation

TBD


