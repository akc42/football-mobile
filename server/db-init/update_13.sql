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
    email character varying,
    password character varying, --stores md5 of password to enable login if doing local authentication
    last_logon bigint DEFAULT (strftime('%s','now')) NOT NULL, --last time user connected
    member_approve boolean DEFAULT 0 NOT NULL,--Set true if user may approve membership
    global_admin boolean DEFAULT 0 NOT NULL, -- Set true if user is global admin (automatically allows approve membership)
    unlikely boolean DEFAULT 0 NOT NULL, --Set true if this user is unlikely to ever return.  I won't prevent then, but we can use it to check all expected users have re-registerd
    verification_key character varying, --stores a key to override password,
    verification_sent bigint DEFAULT (strftime('%s','now')) NOT NULL, --time the user was sent a verification e-mail;
    waiting_email boolean DEFAULT false NOT NULL, --awaiting a new email to be verified before replacing existing e-mail,
    pending_email character varying, --the new e-mail we are veryifying
    waiting_approval boolean DEFAULT false NOT NULL --awaiting membership approval
);

INSERT INTO 
    participant (uid,name,email,password,last_logon,member_approve,global_admin) 
    SELECT uid,name,email,password,last_logon,admin_experience,is_global_admin FROM old_participant;

DROP TABLE old_participant;


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
    condition text DEFAULT NULL,	--This is the text that a user has to agree to in order to register himself for the competition
    administrator integer DEFAULT 0 NOT NULL, --The uid of the administrator
    open boolean DEFAULT 0 NOT NULL, --Says whether a user may register for the competion or not
    pp_deadline bigint DEFAULT 0 NOT NULL, --Playoff Selection Deadline 0 if no selection
    gap integer DEFAULT 300 NOT NULL, --Seconds to go before match to make pick deadline
    update_date bigint DEFAULT (strftime('%s','now')) NOT NULL, --Date Competition Created or data other than results_cache updated
    results_cache text DEFAULT NULL, -- JSON String cache of latest state of competition.
    cache_store_date bigint DEFAULT (strftime('%s','now'))
);

INSERT INTO competition (cid, name, condition, administrator, open, pp_deadline, gap, update_date) 
    SELECT cid, description, condition, administrator, open, pp_deadline, gap, creation_date FROM old_competition;

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

INSERT INTO round (cid, rid, question, comment, valid_question, answer, value, bvalue, name, ou_round, deadline, open)
    SELECT cid, rid, question, comment, valid_question, answer, value, bvalue, name, ou_round, deadline, open FROM old_round;

DROP TABLE old_round;

--Styles used throughout the application
CREATE TABLE styles (
    name character varying PRIMARY KEY, --style variable name without the leading double dashes
    style character varying DEFAULT NULL --the value of the style.  Note it could refer to another style using 'var(--my-other-style)'
);
--Emoticons used in the application
CREATE TABLE emoticons (
    code char varying PRIMARY KEY, --code used in text preceed by ":" that user can use to include the emoticon
    filename char varying --The filename to be displayed as an image for that emoticon 
);



DElETE FROM settings;

INSERT INTO settings (name,value) VALUES('version',14); --version of this configuration
-- values for client config
INSERT INTO settings (name,value) VALUES('default_competition',17); -- cid of default competition 0 means we don't know what it is
INSERT INTO settings (name,value) VALUES('pointsmap','[1,2,4,6,8,12,16]'); -- map of slider position to output result
INSERT INTO settings (name,value) VALUES('underdogmap','[0,1,2,4,6,8]'); --map of absolute slider positions to underdog points
INSERT INTO settings (name,value) VALUES('playoffmap','[1,2,4,6,8]'); --map of playoff points slider position to points allocated
INSERT INTO settings (name,value) VALUES('bonusmap','[1,2,4,6,8,12,16]');--map of bonus question points slider position to points allocated
INSERT INTO settings (name,value) VALUES('defaultbonus',2); --default value of question bonus when new round created
INSERT INTO settings (name,value) VALUES('client_log',''); --if none empty string should specify which function areas client should log.
INSERT INTO settings (name,value) VALUES('client_log_uid',0); --if non zero limit client logging to that uid.
INSERT INTO settings (name,value) VALUES('cookie_visit_name','MBFMVISIT'); --name used for a cookie to record a visit where the user logged on.
INSERT INTO settings (name,value) VALUES('main_menu_icon','menu'); --character from material icon font to use as the main menu.

--values for server config
INSERT INTO settings (name,value) VALUES('cache_age',84400);--cache age before invalid (in seconds), 0 is infinite
INSERT INTO settings (name,value) VALUES('server_port', 2040); --port the api server should listen on.
INSERT INTO settings (name,value) VALUES('cookie_name', 'MBBall'); --name used for our main cookie
INSERT INTO settings (name,value) VALUES('cookie_key', 'Football9Key7AID'); --key used to encrypt/decrypt cookie token
INSERT INTO settings (name,value) VALUES('cookie_expires', 720); --hours until expire for standard logged on token
INSERT INTO settings (name,value) VALUES('cookie_short_expires', 24); --hours until expire for short length cookie

-- Messages used by admin
INSERT INTO settings (name,value) VALUES('msgdeletecomp','Deleting a Competition will delete all the Rounds and Matches associated with it. Do you wish to Proceed?');
INSERT INTO settings (name,value) VALUES('msgregister','Click OK to register for the competition and agree to the condition');
INSERT INTO settings (name,value) VALUES('msgcondition','In order to enter the competition you must agree to the following condition:-');
INSERT INTO settings (name,value) VALUES('msgguestnote','Guests require special approval from the competition administrator ($$$). Please contact her/him <i>after registering</i> if you are a Guest');
INSERT INTO settings (name,value) VALUES('msgnoquestion','ERROR - your picks were made, but the bonus question was NOT answered.  It needs to be a whole number (integer)');
INSERT INTO settings (name,value) VALUES('msgdeadline','Do you mean to set the deadline before now?');
INSERT INTO settings (name,value) VALUES('msgmatchtime','Do you mean to set the matchtime before now?');
INSERT INTO settings (name,value) VALUES('msgnomatchdate','Are you sure you want to open this match without a match date set?');
INSERT INTO settings (name,value) VALUES('msgdeletematch','This match has picks refering to it. Deleting the match will also delete the picks.  Do you still wish to proceed?');
INSERT INTO settings (name,value) VALUES('msgquesdead','Do you mean to set the question deadline before now?');
INSERT INTO settings (name,value) VALUES('msgnomatchround','There are no open matches, are you sure you wish to open the round?');
INSERT INTO settings (name,value) VALUES('msgdeleteround','Deleting a Round will delete all the Matches and Picks associated with it. Do you wish to Proceed?');
INSERT INTO settings (name,value) VALUES('msgapprove','You are changing the approval status of a Baby Backup for this Competition. Are you sure you want to do this?');
INSERT INTO settings (name,value) VALUES('msgunregister','This will Un-Register this User from this Competition. Do you wish to Proceed?');
INSERT INTO settings (name,value) VALUES('msgconstraint','Cannot remove team from competition, it is used in picks or matches');
-- STYLES
INSERT INTO styles (name,style) VALUES('app-primary-color', '#adcabd'); --Main colour for use in the application
INSERT INTO styles (name,style) VALUES('app-accent-color', '#131335'); --Colour to use when something is to stand out - Main Button, Results Tables Headings etc 
INSERT INTO styles (name,style) VALUES('app-text-color', '#212121'); --Main text colour to use
INSERT INTO styles (name,style) VALUES('app-reverse-text-color', 'white'); --Text colour to use when writing on accent or primary colour backgrounds
INSERT INTO styles (name,style) VALUES('app-header-color', 'var(--app-primary-color)'); --Top Header Bar Colour
INSERT INTO styles (name,style) VALUES('app-spinner-color', 'var(--app-accent-color)'); --Spinner Dot Colour
INSERT INTO styles (name,style) VALUES('app-button-color', 'var(--app-accent-color)'); --Main Button Colour
INSERT INTO styles (name,style) VALUES('app-cancel-button-color', 'var(--app-primary-color)'); --Cancel Button Colour
INSERT INTO styles (name,style) VALUES('button-bird-color', 'var(--app-primary-color)'); --Colour of birds in the Send Button.
INSERT INTO styles (name,style) VALUES('app-header-size', '64px'); --height of the main header bar
INSERT INTO styles (name,style) VALUES('default-icon-size', '24px'); --default icon size
INSERT INTO styles (name,style) VALUES('email-input-length','220px'); --input field width for e-mail input 





