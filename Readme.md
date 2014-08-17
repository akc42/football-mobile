# MBBall - mobile version
## Introduction

MBBall is an American Football results picking competition Manager. Used on Melinda's Backups
(http://www.melindasbackups.com)  for their annual competition during the American Football season.

This is the fourth major release of this software with a complete rewrite to support mobile
devices.  This is using a responsive design based on the use of Polymer Web Components.

Although this is a single application, from a user perspective there are two parts to the
application
* A Standard User, who is participates in the competition, and
* An Administrative user whose role it is to set up the details of the competition, and then for
  each round in the competition (ie each week), create the round, create the matches that will be
  played, and then enter the results when known

All users currently will be checked that they are logged in to a community forum, and will also
take their ability to access the Administrative area from information contained in the forum (see
below).  This functionality is concentrated in a single Polymer Element `<smf-auth></forum-auth>`
so may be replaced for alternative scenarios.

As well as the client component of the software that runs in the users web browser, there is a
server component based on Expressjs.  This may be setup as a stand alone application server (in
which case it will probably server the static files that make up the client), or it may be
installed in combination with another front end web server, where it will act as a proxy backend.
This is explained further in the installation instructions.

The software uses an SQLite database to hold all the results so as to be compatible with previous
versions (version 3 is a full web only experience). The database holds a history of all
competitions played, and the user may visit them to see what happened in the past.

## Installation

TBD


