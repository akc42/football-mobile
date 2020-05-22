ALTER TABLE round ADD bvalue smallint DEFAULT 2 NOT NULL;

UPDATE round SET bvalue = 1 WHERE cid <> 11;
UPDATE round SET results_cache = NULL;
UPDATE competition SET results_cache = NULL WHERE cid = 11;



DROP VIEW bonus_score;
CREATE VIEW bonus_score AS
    SELECT r.cid,r.rid, u.uid, (CASE WHEN p.uid IS NULL THEN 0 ELSE 1 END * r.bvalue) AS score
	FROM ((registration u JOIN round r USING(cid) )
	LEFT JOIN option_pick p ON ((((p.cid = r.cid) AND (p.rid = r.rid) AND (p.uid = u.uid) AND (p.opid = r.answer)) AND (r.valid_question = 1))))
	WHERE r.open = 1 ;


INSERT INTO settings (name,value) VALUES('bonusmap','[1,2,4,6,8,12,16]');--map of bonus question points slider position to points allocated
INSERT INTO settings (name,value) VALUES('defaultbonus',2); --default value of question bonus when new round created

UPDATE settings SET value = '/inc/template.inc' WHERE name = 'template'
UPDATE settings SET value = './img/emoticons' WHERE name = 'emoticon_dir'
UPDATE settings SET value = 'img/emoticons' WHERE name = 'emoticon_url'

UPDATE settings SET value = 13 WHERE name = 'version';


