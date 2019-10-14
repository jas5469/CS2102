DROP TABLE IF EXISTS ProjectUpdates CASCADE;
DROP TABLE IF EXISTS Fundings CASCADE;
DROP TABLE IF EXISTS FundingTiers CASCADE;
DROP TABLE IF EXISTS Comments CASCADE;
DROP TABLE IF EXISTS Saves CASCADE;
DROP TABLE IF EXISTS Follows CASCADE;
DROP TABLE IF EXISTS Projects CASCADE;
DROP TABLE IF EXISTS ProjectTemplates CASCADE;
DROP TABLE IF EXISTS Creators CASCADE;
DROP TABLE IF EXISTS Admins CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

CREATE TABLE Users (
    username        VARCHAR(50),
    password        VARCHAR(50),
    r_date          date,
    PRIMARY KEY (username)
);

CREATE TABLE Admins (
	aname    VARCHAR(50),
	PRIMARY KEY (aname),
    FOREIGN KEY (aname)  REFERENCES Users(username) ON DELETE CASCADE
);

CREATE TABLE Creators (
    cname    VARCHAR(50),
    PRIMARY KEY (cname),
    FOREIGN KEY (cname) REFERENCES Users(username) ON DELETE CASCADE
);

CREATE TABLE ProjectTemplates (
    tname               VARCHAR(100),
    category            VARCHAR(100),
    style               TEXT,
    aname               VARCHAR(50),
    PRIMARY KEY (tname),
    FOREIGN KEY (aname) REFERENCES Admins(aname) ON DELETE CASCADE
);

CREATE TABLE Projects (
    pname               VARCHAR(100),
    cname               VARCHAR(50) NOT NULL,
    tname               VARCHAR(50) NOT NULL,
    s_date              date,
    e_date              date,
    f_goal              numeric,
    status              boolean,
    description         TEXT,
    PRIMARY KEY (pname),
    FOREIGN KEY (cname) REFERENCES Creators(cname) ON DELETE CASCADE,
    FOREIGN KEY (tname) REFERENCES ProjectTemplates(tname) ON DELETE CASCADE,
    CHECK(s_date <= e_date)
);

CREATE TABLE Comments (
    username            VARCHAR(50),
    pname               VARCHAR(100),
    cid                 VARCHAR(50),
    descr               TEXT,
    PRIMARY KEY (username,pname,cid),
    FOREIGN KEY (username) REFERENCES Users(username),
    FOREIGN KEY (pname) REFERENCES Projects(pname)
);

CREATE TABLE Saves (
    username             VARCHAR(50),
    pname                VARCHAR(100),
    PRIMARY KEY (username, pname),
    FOREIGN KEY (username) REFERENCES Users(username) ON DELETE CASCADE,
    FOREIGN KEY (pname) REFERENCES Projects(pname) ON DELETE CASCADE
);

CREATE TABLE Follows (
    username    VARCHAR(50),
    cname       VARCHAR(50),
    PRIMARY KEY (username, cname),
    FOREIGN KEY (username) REFERENCES Users(username) ON DELETE CASCADE,
    FOREIGN KEY (cname) REFERENCES Creators(cname) ON DELETE CASCADE,
    CHECK (username <> cname)
);

CREATE TABLE ProjectUpdates (
    --cname         VARCHAR(50), --do we still need cname since there's only one creator and update is definitely by creator?
    pname         VARCHAR(50),
    uid           VARCHAR(50),
    u_date        date,
    descr         TEXT,
    --PRIMARY KEY (cname, pname, uid),
    PRIMARY KEY (pname, uid),
    --FOREIGN KEY (cname) REFERENCES Creators(cname),
    FOREIGN KEY (pname) REFERENCES Projects(pname) ON DELETE CASCADE
);

CREATE TABLE FundingTiers (
    tname               VARCHAR(50),
    pname               VARCHAR(50),
    amount              numeric,        --will fall into tier if value is >= amount and <= next tier amount
    PRIMARY KEY (tname, pname),
    FOREIGN KEY (pname) REFERENCES Projects(pname) ON DELETE CASCADE
);

CREATE TABLE Fundings (
    pname         VARCHAR(50),
    tname         VARCHAR(50),
    username      VARCHAR(50),
    f_date        date,
    amount        numeric,
    status        boolean,       --still want to keep fund tuple even though retracted
    PRIMARY KEY (pname,tname,username),
    FOREIGN KEY (tname,pname) REFERENCES FundingTiers(tname,pname) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES Users(username) ON DELETE CASCADE
);

INSERT INTO Users VALUES ('UA','11111111', DATE('2018-12-12'));
INSERT INTO Users VALUES ('UB','22222222', DATE('2018-12-12'));
INSERT INTO Users VALUES ('UC','33333333', DATE('2018-12-12'));
INSERT INTO Users VALUES ('UD','44444444', DATE('2018-12-12'));
INSERT INTO Users VALUES ('CA','55555555', DATE('2018-12-12'));
INSERT INTO Users VALUES ('CB','66666666', DATE('2018-12-12'));
INSERT INTO Users VALUES ('CC','77777777', DATE('2018-12-12'));
INSERT INTO Users VALUES ('CD','88888888', DATE('2018-12-12'));
INSERT INTO Users VALUES ('AA','99999999', DATE('2018-12-12'));
INSERT INTO Users VALUES ('AB','12121212', DATE('2018-12-12'));

INSERT INTO Creators VALUES ('CA');
INSERT INTO Creators VALUES ('CB');
INSERT INTO Creators VALUES ('CC');
INSERT INTO Creators VALUES ('CD');

INSERT INTO Admins VALUES ('AA');
INSERT INTO Admins VALUES ('AB');

INSERT INTO ProjectTemplates VALUES ('TA', 'Music', 'Test', 'AA');
INSERT INTO ProjectTemplates VALUES ('TB', 'Games', 'Test', 'AB');
INSERT INTO ProjectTemplates VALUES ('TC', 'Books', 'Test', 'AB');

INSERT INTO Projects VALUES ('PA', 'CA', 'TA', DATE('2019-1-1'), DATE('2019-12-30'), 300000, FALSE, 'Test Description');
INSERT INTO Projects VALUES ('PB', 'CA', 'TA', DATE('2019-1-1'), DATE('2019-12-30'), 5000, TRUE, 'Test Description');
INSERT INTO Projects VALUES ('PC', 'CB', 'TB', DATE('2019-1-1'), DATE('2019-12-30'), 1000, TRUE, 'Test Description');
INSERT INTO Projects VALUES ('PD', 'CC', 'TB', DATE('2019-1-1'), DATE('2019-12-30'), 28000, FALSE, 'Test Description');
INSERT INTO Projects VALUES ('PE', 'CD', 'TC', DATE('2019-1-1'), DATE('2019-12-30'), 25000, FALSE, 'Test Description');
INSERT INTO Projects VALUES ('PF', 'CA', 'TC', DATE('2019-1-1'), DATE('2019-12-30'), 680000, FALSE, 'Test Description');

INSERT INTO Comments VALUES ('UA', 'PA', 'C1', 'This project is great!');
INSERT INTO Comments VALUES ('UB', 'PB', 'C2', 'This project is amazing!');
INSERT INTO Comments VALUES ('UC', 'PC', 'C3', 'This project has potential!');
INSERT INTO Comments VALUES ('UA', 'PD', 'C4', 'This project sounds cool!');
INSERT INTO Comments VALUES ('UB', 'PA', 'C5', 'This project is revolutionary!');
INSERT INTO Comments VALUES ('UC', 'PA', 'C6', 'This project sounds interesting!');
INSERT INTO Comments VALUES ('UA', 'PB', 'C7', 'This project looks promising!');

INSERT INTO Saves VALUES('UA', 'PB');
INSERT INTO Saves VALUES('UA', 'PC');
INSERT INTO Saves VALUES('UB', 'PD');
INSERT INTO Saves VALUES('UB', 'PE');

INSERT INTO Follows VALUES ('UA', 'CA');
INSERT INTO Follows VALUES ('UA', 'CB');
INSERT INTO Follows VALUES ('UB', 'CC');
INSERT INTO Follows VALUES ('UC', 'CD');
INSERT INTO Follows VALUES ('UD', 'CA');

INSERT INTO ProjectUpdates VALUES ('PA', 'U1', DATE('2019-1-2'), 'This is a project update!');
INSERT INTO ProjectUpdates VALUES ('PB', 'U1', DATE('2019-1-2'), 'This is a project update!');
INSERT INTO ProjectUpdates VALUES ('PA', 'U2', DATE('2019-2-1'), 'This is a project update 2!');
INSERT INTO ProjectUpdates VALUES ('PC', 'U1', DATE('2019-2-1'), 'This is a project update!');

--each project should have at least one funding tier
INSERT INTO FundingTiers VALUES ('T1', 'PA', 100);
INSERT INTO FundingTiers VALUES ('T2', 'PA', 50);
INSERT INTO FundingTiers VALUES ('T3', 'PA', 20);
INSERT INTO FundingTiers VALUES ('T1', 'PB', 50);
INSERT INTO FundingTiers VALUES ('T2', 'PB', 20);
INSERT INTO FundingTiers VALUES ('T1', 'PC', 100);
INSERT INTO FundingTiers VALUES ('T1', 'PD', 200);
INSERT INTO FundingTiers VALUES ('T1', 'PE', 50);
INSERT INTO FundingTiers VALUES ('T1', 'PF', 50);

INSERT INTO Fundings VALUES ('PA', 'T1', 'UA', DATE('2019-1-1'), 3000, TRUE);
INSERT INTO Fundings VALUES ('PB', 'T1', 'UB', DATE('2019-1-1'), 3000, TRUE);
INSERT INTO Fundings VALUES ('PC', 'T1', 'UC', DATE('2019-1-1'), 3000, TRUE);
INSERT INTO Fundings VALUES ('PB', 'T1', 'UD', DATE('2019-1-1'), 3000, TRUE);
INSERT INTO Fundings VALUES ('PD', 'T1', 'UA', DATE('2019-1-1'), 3000, FALSE);
INSERT INTO Fundings VALUES ('PA', 'T2', 'UD', DATE('2019-1-2'), 80, TRUE);
INSERT INTO Fundings VALUES ('PB', 'T2', 'UC', DATE('2019-1-2'), 30, TRUE);






