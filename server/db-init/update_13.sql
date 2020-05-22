

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
    old_participant (uid,name,email,password,last_logon,admin_experience,is_global_admin) 
    SELECT uid,name,email,password,last_logon,admin_experience,is_global_admin FROM participant;

DROP TABLE participant;

CREATE TABLE participant(
  uid integer PRIMARY KEY,
  name character varying,
  email character varying,
  password character varying, --stores md5 of password to enable login if doing local authentication
  last_logon bigint DEFAULT(strftime('%s', 'now')) NOT NULL, --last time user connected
  admin_experience boolean DEFAULT 0 NOT NULL, --Set true if user has ever been administrator
  is_global_admin boolean DEFAULT 0 NOT NULL, --Set true if user is global admin
  verification_key character varying, --stores a unique key which Will Be Campared with an encryted link e - mail.
  verification_sent bigint DEFAULT(strftime('%s', 'now')) NOT NULL, --time the user was sent a verification e - mail;
  is_verified boolean DEFAULT false NOT NULL, --email has been verified,
  is_registered boolean DEFAULT false NOT NULL--use has been approved
);
INSERT INTO 
    participant (uid,name,email,password,last_logon,admin_experience,is_global_admin) 
    SELECT uid,name,email,password,last_logon,admin_experience,is_global_admin FROM participant;

DROP TABLE old_participant;

UPDATE participant SET is_registered = true, is_verified = true;  -- all particiants so far can be considered registered and verified
UPDATE competition SET results_cache = NULL; -- changing format, so have to ensure its all clear
UPDATE round SET results_cache = NULL; --changing format, so have to ensure its all clear

UPDATE settings SET value = 14 WHERE name = 'version';


