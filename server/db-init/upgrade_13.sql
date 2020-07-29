-- @licence
--  Copyright (c) 2020 Alan Chandler, all rights reserved

--  This file is part of Football Mobile.

--  Football Mobile is free software: you can redistribute it and/or modify
--  it under the terms of the GNU General Public License as published by
--  the Free Software Foundation, either version 3 of the License, or
--  (at your option) any later version.

--  Football Mobile is distributed in the hope that it will be useful,
--  but WITHOUT ANY WARRANTY; without even the implied warranty of
--  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
--  GNU General Public License for more details.

--  You should have received a copy of the GNU General Public License
--  along with Football Mobile.  If not, see <http://www.gnu.org/licenses/>.

-- NOTE - there are a number of settings in this file that should not be left as they are.  Please view the database.sql file for a list.

CREATE TABLE old_participant (
    uid integer PRIMARY KEY,
    name character varying,
    email character varying,
    password character varying, --stores md5 of password to enable login if doing local authentication
    last_logon bigint DEFAULT (strftime('%s','now')) NOT NULL, --last time user connected
    admin_experience boolean DEFAULT 0 NOT NULL,--Set true if user has ever been administrator
    is_global_admin boolean DEFAULT 0 NOT NULL -- Set true if user is global admin
);

INSERT INTO 
    old_participant (uid,name,email,password,last_logon,admin_experience, is_global_admin) 
    SELECT uid,name,email,password,last_logon,admin_experience,is_global_admin FROM participant;

DROP TABLE participant;

CREATE TABLE participant (
    uid integer PRIMARY KEY,
    name character varying,
    email character varying COLLATE NOCASE,
    password character varying, --stores md5 of password to enable login if doing local authentication
    last_logon bigint DEFAULT (strftime('%s','now')) NOT NULL, --last time user connected
    member_approve boolean DEFAULT 0 NOT NULL,--Set true if user may approve membership
    global_admin boolean DEFAULT 0 NOT NULL, -- Set true if user is global admin (automatically allows approve membership)
    unlikely boolean DEFAULT 0 NOT NULL, --Set true if this user is unlikely to ever return.  I won't prevent then, but we can use it to check all expected users have re-registerd
    verification_key character varying, -- The bcryted hash of the random pin created when sending verification emails, for lost password, and email changes. 
    verification_sent bigint DEFAULT (strftime('%s','now')) NOT NULL, -- The time verification sent (so can rate limit and expire old ones). 
    waiting_approval boolean DEFAULT false NOT NULL, --awaiting membership approval
    reason character varying, --the text the user has supplied to endorse their membership or the reason the unlikely flag is set
    remember boolean DEFAULT false NOT NULL --user has agreed to allow cookies to remember their log on
);
CREATE UNIQUE INDEX part_email_idx ON participant(email);

INSERT INTO 
    participant (uid,name,email,password,last_logon,member_approve,global_admin) 
    SELECT uid,name,email,password,last_logon,admin_experience,is_global_admin FROM old_participant;

DROP TABLE old_participant;

CREATE TABLE old_registration (
    cid integer NOT NULL REFERENCES competition(cid) ON UPDATE CASCADE ON DELETE CASCADE, -- Competition ID
    uid integer NOT NULL REFERENCES participant(uid) ON UPDATE CASCADE ON DELETE CASCADE, --User ID
    agree_time bigint DEFAULT (strftime('%s','now')) , --Time Agreed to Competition Conditions (null if not yet agreed)
    PRIMARY KEY (cid,uid)
);

INSERT INTO old_registration (cid, uid, agree_time) SELECT cid, uid, agree_time FROM registration;

DROP TABLE registration;

CREATE TABLE registration (
    cid integer NOT NULL REFERENCES competition(cid) ON UPDATE CASCADE ON DELETE CASCADE, -- Competition ID
    uid integer NOT NULL REFERENCES participant(uid) ON UPDATE CASCADE ON DELETE CASCADE, --User ID
    agree_time bigint DEFAULT (strftime('%s','now')) , --Time Agreed to Competition Conditions (null if not yet agreed)
    subscribed boolean DEFAULT 0 NOT NULL, --Set if has user wants to receive e-mail notifications of Picks being due
    PRIMARY KEY (cid,uid)
);

INSERT INTO registration (cid, uid, agree_time) SELECT cid, uid, agree_time FROM old_registration;

DROP TABLE old_registration;

CREATE TABLE old_competition (
    cid integer PRIMARY KEY ASC, --Competition ID - 
    description character varying(100),--This is the name that appears in the header for the competition
    condition text,	--This is the text that a user has to agree to in order to register himself for the competition
    administrator integer DEFAULT 0 NOT NULL, --The uid of the administrator
    open boolean DEFAULT 0 NOT NULL, --Says whether a user may register for the competion or not
    pp_deadline bigint DEFAULT 0 NOT NULL, --Playoff Selection Deadline 0 if no selection
    gap integer DEFAULT 300 NOT NULL, --Seconds to go before match to make pick deadline
    creation_date bigint DEFAULT (strftime('%s','now')) NOT NULL --Date Competition Created
);

INSERT INTO old_competition (cid, description, condition, administrator, open, pp_deadline, gap, creation_date) 
    SELECT cid, description, condition, administrator, open, pp_deadline, gap, creation_date FROM competition;

DROP TABLE competition;

CREATE TABLE competition (
    cid integer PRIMARY KEY ASC, --Competition ID - 
    name character varying,--This is the name that appears in the header for the competition
    administrator integer  NOT NULL DEFAULT 0, --The uid of the administrator
    open boolean NOT NULL DEFAULT 0 , --Says whether a user may see the competition
    closed boolean NOT NULL DEFAULT 0, --Says where a user may  still register 
    expected_date bigint NOT NULL DEFAULT 0, --expected open date (0 if we don't know) only valid if not open
    condition text DEFAULT NULL,	--This is the text that a user has to agree to in order to register himself for the competition
    pp_deadline bigint DEFAULT 0 NOT NULL, --Playoff Selection Deadline 0 if no selection
    gap integer DEFAULT 300 NOT NULL, --Seconds to go before match to make pick deadline
    update_date bigint NOT NULL DEFAULT (strftime('%s','now')), --Date Competition Created or data other than results_cache updated
    pointsmap text NOT NULL DEFAULT '[1,2,4,6,8,12,16]', -- map of slider position to output result
    underdogmap text NOT NULL DEFAULT '[0,1,2,4,6,8]', --map of absolute slider positions to underdog points
    playoffmap text NOT NULL DEFAULT '[1,2,4,6,8]',  --map of playoff points slider position to points allocated
    bonusmap text NOT NULL DEFAULT '[1,2,4,6,8,12,16]', --map of bonus question points slider position to points allocated
    defaultbonus integer NOT NULL DEFAULT 2, --default value of question bonus (bvalue) when new round created
    results_cache text DEFAULT NULL, -- JSON String cache of latest state of competition.
    cache_store_date bigint DEFAULT (strftime('%s','now'))
);

INSERT INTO competition (cid, name, condition, administrator, open, pp_deadline, gap, update_date, closed) 
    SELECT cid, description, REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(condition,
':banana','🍌'),':bow','🙇'),':brickwall','😖'),':bye','👋'),':cheeky', '🐒'),':cheer','🥂'),':cry','😢'),':dunno','🤔') ,':enraged','😠'),':excited','🤩'),
':har','🙄'),':help', '🥺'),':hug','👐'),':innocent','😉'),':mad','😠'),':out','🤯'),':pickle','🥒'),':prrr','😾'),':rofl','🤣'),':slap','😈'),
':sympa','😮'),':thanks','🙏'),':thumbsup','👍'),':wub','❤️'),':yikes','😱'),':zzz','🛌'), administrator, open, pp_deadline, gap, creation_date, 1 As closed FROM old_competition;

DROP TABLE old_competition;

CREATE TABLE old_round (
    cid integer NOT NULL REFERENCES competition(cid) ON UPDATE CASCADE ON DELETE CASCADE, -- Competition ID
    rid integer NOT NULL, --Round Number
    question text, --Bonus Question Text
    comment text, -- Administrator comment on the bonus question
    valid_question boolean DEFAULT 0, --Set once a valid bonus question has been set up
    answer integer, --If not null an answer to a numeric question or opid of mutichoice question
    value smallint DEFAULT 1 NOT NULL, --Value given for a correct pick
    bvalue smallint DEFAULT 2 NOT NULL, --Value given for a correct answer to the bonus question
    name character varying(14), --Name of the Round
    ou_round boolean DEFAULT 0 NOT NULL, --set if over underscores are requested for this round
    deadline bigint, --Time Deadline for submitting answers to bonus questions
    open boolean DEFAULT 0 NOT NULL,  --says whether round is availble for display
    PRIMARY KEY (cid,rid)
);

INSERT INTO old_round (cid, rid, question, comment, valid_question, answer, value, bvalue, name, ou_round, deadline, open)
    SELECT cid, rid, question, comment, valid_question, answer, value, bvalue, name, ou_round, deadline, open FROM round;

DROP TABLE round;

CREATE TABLE round (
    cid integer NOT NULL REFERENCES competition(cid) ON UPDATE CASCADE ON DELETE CASCADE, -- Competition ID
    rid integer NOT NULL, --Round Number
    question text, --Bonus Question Text
    comment text, -- Administrator comment on the bonus question
    valid_question boolean DEFAULT 0, --Set once a valid bonus question has been set up
    answer integer, --If not null an answer to a numeric question or opid of mutichoice question
    value smallint DEFAULT 1 NOT NULL, --Value given for a correct pick
    bvalue smallint DEFAULT 2 NOT NULL, --Value given for a correct answer to the bonus question
    name character varying, --Name of the Round
    ou_round boolean DEFAULT 0 NOT NULL, --set if over underscores are requested for this round
    deadline bigint, --Time Deadline for submitting answers to bonus questions
    open boolean DEFAULT 0 NOT NULL,  --says whether round is availble for display
    update_date bigint DEFAULT (strftime('%s','now')) NOT NULL, --date of last update other than the update of the results cache
    results_cache text DEFAULT NULL, -- JSON String cache of recent result table
    cache_store_date bigint DEFAULT (strftime('%s','now')),
    PRIMARY KEY (cid,rid)
);
CREATE INDEX round_open_idx ON round(open);

INSERT INTO round (cid, rid, question, comment, valid_question, answer, value, bvalue, name, ou_round, deadline, open)
    SELECT cid, rid, REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(question,
':banana','🍌'),':bow','🙇'),':brickwall','😖'),':bye','👋'),':cheeky', '🐒'),':cheer','🥂'),':cry','😢'),':dunno','🤔') ,':enraged','😠'),':excited','🤩'),
':har','🙄'),':help', '🥺'),':hug','👐'),':innocent','😉'),':mad','😠'),':out','🤯'),':pickle','🥒'),':prrr','😾'),':rofl','🤣'),':slap','😈'),
':sympa','😮'),':thanks','🙏'),':thumbsup','👍'),':wub','❤️'),':yikes','😱'),':zzz','🛌'), REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(comment,
':banana','🍌'),':bow','🙇'),':brickwall','😖'),':bye','👋'),':cheeky', '🐒'),':cheer','🥂'),':cry','😢'),':dunno','🤔') ,':enraged','😠'),':excited','🤩'),
':har','🙄'),':help', '🥺'),':hug','👐'),':innocent','😉'),':mad','😠'),':out','🤯'),':pickle','🥒'),':prrr','😾'),':rofl','🤣'),':slap','😈'),
':sympa','😮'),':thanks','🙏'),':thumbsup','👍'),':wub','❤️'),':yikes','😱'),':zzz','🛌'), valid_question, answer, value, bvalue, name, ou_round, deadline, open
FROM old_round;

DROP TABLE old_round;

UPDATE match set comment = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(comment,
':banana','🍌'),':bow','🙇'),':brickwall','😖'),':bye','👋'),':cheeky', '🐒'),':cheer','🥂'),':cry','😢'),':dunno','🤔') ,':enraged','😠'),':excited','🤩'),
':har','🙄'),':help', '🥺'),':hug','👐'),':innocent','😉'),':mad','😠'),':out','🤯'),':pickle','🥒'),':prrr','😾'),':rofl','🤣'),':slap','😈'),
':sympa','😮'),':thanks','🙏'),':thumbsup','👍'),':wub','❤️'),':yikes','😱'),':zzz','🛌');

UPDATE option_pick set comment = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(comment,
':banana','🍌'),':bow','🙇'),':brickwall','😖'),':bye','👋'),':cheeky', '🐒'),':cheer','🥂'),':cry','😢'),':dunno','🤔') ,':enraged','😠'),':excited','🤩'),
':har','🙄'),':help', '🥺'),':hug','👐'),':innocent','😉'),':mad','😠'),':out','🤯'),':pickle','🥒'),':prrr','😾'),':rofl','🤣'),':slap','😈'),
':sympa','😮'),':thanks','🙏'),':thumbsup','👍'),':wub','❤️'),':yikes','😱'),':zzz','🛌');

UPDATE pick set comment = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(comment,
':banana','🍌'),':bow','🙇'),':brickwall','😖'),':bye','👋'),':cheeky', '🐒'),':cheer','🥂'),':cry','😢'),':dunno','🤔') ,':enraged','😠'),':excited','🤩'),
':har','🙄'),':help', '🥺'),':hug','👐'),':innocent','😉'),':mad','😠'),':out','🤯'),':pickle','🥒'),':prrr','😾'),':rofl','🤣'),':slap','😈'),
':sympa','😮'),':thanks','🙏'),':thumbsup','👍'),':wub','❤️'),':yikes','😱'),':zzz','🛌');



CREATE TABLE old_team (
    tid varchar(3) PRIMARY KEY,
    name character varying NOT NULL,
    confid character(3) NOT NULL, 
    divid character(1) NOT NULL 
);

INSERT INTO old_team (tid,name,confid,divid) SELECT tid, name, confid, divid FROM team;

DROP TABLE team;

CREATE TABLE team (
    tid varchar(3) PRIMARY KEY,
    name character varying NOT NULL,
    confid character(3) NOT NULL REFERENCES conference(confid) ON UPDATE CASCADE ON DELETE CASCADE, --Conference ID Team Plays In
    divid character(1) NOT NULL REFERENCES division(divid) ON UPDATE CASCADE ON DELETE CASCADE --Division ID Team Plays In
);

INSERT INTO team (tid,name,confid,divid) SELECT tid, name, confid, divid FROM old_team;

DROP TABLE old_team;


--Styles used throughout the application
CREATE TABLE styles (
    name character varying PRIMARY KEY, --style variable name without the leading double dashes
    style character varying DEFAULT NULL --the value of the style.  Note it could refer to another style using 'var(--my-other-style)'
);

DElETE FROM settings;

INSERT INTO settings (name,value) VALUES('version',14); --version of this configuration
-- values for client config

INSERT INTO settings (name,value) VALUES('client_log',''); --if none empty string should specify colon separated function areas client should log or 'all' for every thing.
INSERT INTO settings (name,value) VALUES('client_log_uid',0); --if non zero limit client logging to that uid.
INSERT INTO settings (name,value) VALUES('cookie_visit_name','FMVISIT'); --name used for a cookie to record a visit where the user logged on.
INSERT INTO settings (name,value) VALUES('webmaster','webmaster@example.com'); --site webmaster.
INSERT INTO settings (name,value) VALUES('site_logo','/appimages/site_logo.png'); --url of the site_logo image to be used on info pages and in mail
INSERT INTO settings (name,value) VALUES('min_pass_len', 6); --minimum password length
INSERT INTO settings (name,value) VALUES('dwell_time', 2000); --time to elapse before new urls get to be pushed to the history stack
--values for server config
INSERT INTO settings (name,value) VALUES('cache_age',0);--cache age before invalid (in hours), 0 is infinite
INSERT INTO settings (name,value) VALUES('server_port', 2040); --port the api server should listen on.
INSERT INTO settings (name,value) VALUES('cookie_name', 'MBBall'); --name used for our main cookie
INSERT INTO settings (name,value) VALUES('cookie_key', 'newCookieKey'); --key used to encrypt/decrypt cookie token
INSERT INTO settings (name,value) VALUES('cookie_expires', 720); --hours until expire for standard logged on token
INSERT INTO settings (name,value) VALUES('verify_expires', 24); --hours until expire for verification tokens.
INSERT INTO settings (name,value) VALUES('rate_limit', 30); --minutes that must elapse by verification emails
INSERT INTO settings (name,value) VALUES('email_from', 'admin@example.com'); --email address that mail comes from (do not reply)
INSERT INTO settings (name,value) VALUES('mail_footer','<p>Some footer html</p>'); --mail footer
INSERT INTO settings (name,value) VALUES('mail_wordwrap',130); --word wrap column in html to text conversion
INSERT INTO settings (name,value) VALUES('mail_signature', '/appimages/signature.png;Name of Signature'); --email signature if starts with a slash is an image url which maybe followed by a semi-colon and then caption, else html
INSERT INTO settings (name,value) VALUES('site_baseref','https://example.com'); -- basic site url without trailing slash to be added to hostless image urls to make complete
INSERT INTO settings (name,value) VALUES('first_time_message','Welcome to the <strong>Football Mobile Results Picking Competition</strong>.  This appears to be your first visit to the site. You will be have to provide your email address and later your password but, with your permission, we can remember you so you won''t have to keep entering it.'); -- First Paragraph of text for First time Users
INSERT INTO settings (name,value) VALUES('coming_soon_message','Your new picking competition will be coming soon, get ready to register and join.'); -- First Paragraph of text for a coming soon page


------------------------------------------------------------------------------------------ STYLES
---COLOURS 
INSERT INTO styles (name,style) VALUES('app-primary-color', '#42d9ff'); --Main colour for use in the application
INSERT INTO styles (name,style) VALUES('app-accent-color', '#131335'); --Colour to use when something is to stand out - Main Button etc 
INSERT INTO styles (name,style) VALUES('accent-color-filter', 'invert(9%) sepia(23%) saturate(2922%) hue-rotate(213deg) brightness(92%) contrast(102%)'); --Filter needed to color svg to match app-accent-color NOTE this is done by putting desired color in calcfilter.js 
INSERT INTO styles (name,style) VALUES('app-primary-text', 'var(--app-accent-color)'); --Main text colour to use on primary colour backgrounds
INSERT INTO styles (name,style) VALUES('app-accent-text', 'white'); --Text colour to use when writing on accent colour backgrounds
INSERT INTO styles (name,style) VALUES('app-user-color', '#f3fcff'); --Background used to indicate the particular user
INSERT INTO styles (name,style) VALUES('app-user-text', 'var(--app-accent-color)'); --text Color for highlighted user
INSERT INTO styles (name,style) VALUES('app-spinner-color', 'var(--app-accent-color)'); --Spinner Dot Colour
INSERT INTO styles (name,style) VALUES('app-button-color', 'var(--app-accent-color)'); --Main Button Colour
INSERT INTO styles (name,style) VALUES('app-cancel-button-color', 'lightsteelblue'); --Cancel Button Colour
INSERT INTO styles (name,style) VALUES('button-text-color', 'var(--app-accent-text)'); --Color of text on primary buttons
INSERT INTO styles (name,style) VALUES('cancel-button-text-color', '#212121'); --Color of text on cancel buttons
INSERT INTO styles (name,style) VALUES('app-form-color', '#fcffc0'); --Background Color of Forms;
INSERT INTO styles (name,style) VALUES('fm-win-color', 'darkorange'); --Color of icon to indicate a match win or an over/under result.
INSERT INTO styles (name,style) VALUES('fm-in-playoff','gold'); -- colour of trophy indicating a team in the playoff
INSERT INTO styles (name,style) VALUES('fm-correct-pick', 'orangered'); --colour of a correct pick
INSERT INTO styles (name,style) VALUES('fm-incorrect-pick', 'mediumorchid'); --colour of incorrect pick
INSERT INTO styles (name,style) VALUES('fm-indeterminate-pick', 'lawngreen'); --colour of pick where result not yet available.

--- FIELD SIZES
INSERT INTO styles (name,style) VALUES('email-input-length','240px'); --input field width for e-mail input 
INSERT INTO styles (name,style) VALUES('name-input-length','120px'); --input field width for display input 
INSERT INTO styles (name,style) VALUES('pw-input-length','100px'); --input field width for password input 





