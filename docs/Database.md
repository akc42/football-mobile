# Introduction

The overall project `Readme.md` file gave an introduction to the database.  In
particular the continued use of `sqlite3` as the database engine of choice.  The
way it is highly performant for an application of this size and the easy of
which we can take and maintain backups means it is an excellent choice.

The new requirements, specifically the requirement to hold sign in credentials
confidentially, means that we have to take some additional precautions.
Specifically, we will use `bcrypt` to hash passwords storing them encrypted.  

# Database Package

It has been important to decide on the package to use in *nodejs* to interact with the database
in the API layer.  After an initial investigation I found three suitable
packages, namely:-

1.  `sqlite3` is the defacto standard for accessing and sqlite database.
2.  `sqlite` which is a wrapper around `sqlite3`, but provides promises rather than callbacks, and
3.  `better-sqlite3` which touts itself as a faster (and therefore better) version than `sqlite3`

I have been bouncing between the technologies.  Initially I thought `better-sqlite3`
was the way to go, but I thought I would write a comparison benchmark test using
the actual query the *PHP* version used to to provide the first page.  This
showed `better-sqlite3` was faster and took about 0.5 seconds on my (fast)
desktop computer as oppsed to 0.67 seconds using `sqlite`.  But when I ran it on
a raspberry pi (originally a possible server for this app) it took 5 seconds, and that was
unacceptably long to block the event loop.  So I starting work with the second
option, `sqlite` as a wrapper round `sqlite3`.  

Now that I have done some work on the development, I am now seeing that the new
api is going to make much shorter queries.  Even with `sqlite` an api query was
taking less than 20ms (on my desktop).  So I wondered how long `better-sqlite3`
would take.  Now my api queries were around 1 or 2ms.

So for now I have switched back to `better-sqlite3`.  I does have some
limitations - you can't use `async` `await` within a transaction and that does
cause some interesting dynamics between the transaction and `bcrypt` (which
needs to use callbacks or promises) which I am using to manage confidentiallity
requirements.  But I've thought through the implications of not using
transactions in that fairly specialist case and I can get by. 

# Defining the database.

Before going further here I recommend reading `Environment.md` to understand setting up process environments.

... more to follow



