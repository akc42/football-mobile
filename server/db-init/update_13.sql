


ALTER TABLE participant ADD is_registered boolean DEFAULT false NOT NULL;
ALTER TABLE participant ADD is_verified boolean DEFAULT false NOT NULL;
ALTER TABLE participant ADD verification_key character varying;
ALTER TABLE participant ADD verification_sent bigint DEFAULT (strftime('%s','now')) NOT NULL;

UPDATE participant SET is_registerd = true, is_verified = true;  -- all particiants so far can be considered registered and verified

UPDATE settings SET value = 14 WHERE name = 'version';



VACUUM;

