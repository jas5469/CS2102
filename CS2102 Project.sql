DROP TABLE IF EXISTS Projects CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Admins CASCADE;
DROP TABLE IF EXISTS Creators CASCADE;
DROP TABLE IF EXISTS ProjectTemplates CASCADE;
DROP TABLE IF EXISTS ProjectUpdates CASCADE;
DROP TABLE IF EXISTS Funds CASCADE;
DROP TABLE IF EXISTS FundingTiers CASCADE;
DROP TABLE IF EXISTS Has CASCADE;
DROP TABLE IF EXISTS Comments CASCADE;
DROP TABLE IF EXISTS Saves CASCADE;
DROP TABLE IF EXISTS Starts CASCADE;
DROP TABLE IF EXISTS Follows CASCADE;
DROP TABLE IF EXISTS Creates CASCADE;
DROP TABLE IF EXISTS Posts CASCADE;
DROP TABLE IF EXISTS IsFor CASCADE;
DROP TABLE IF EXISTS Categorises CASCADE;

CREATE TABLE Users (
	username    VARCHAR(50),
    password    VARCHAR(50),
    wallet      int,
    PRIMARY KEY (username)
);

CREATE TABLE Admins (
	username    VARCHAR(50),
	PRIMARY KEY (username),
    FOREIGN KEY (username)  REFERENCES Users(username)
);

CREATE TABLE Creators (
    username    VARCHAR(50),
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES Users(username)
);

CREATE TABLE ProjectTemplates (
    projectTemplateName VARCHAR(100),
    category            VARCHAR(100),
    style               TEXT,
    PRIMARY KEY (projectTemplateName)
);

CREATE TABLE Projects (
    projectname         VARCHAR(100),
    projectTemplateName VARCHAR(50) NOT NULL,
    deadline            date,
    fundsAccumulated    numeric,
    category            TEXT        NOT NULL,
    status              boolean,
    description         TEXT,
    PRIMARY KEY (projectname),
    FOREIGN KEY (projectTemplateName) REFERENCES ProjectTemplates(projectTemplateName)
);

CREATE TABLE Comments (
    username             VARCHAR(50),
    projectnameCommented VARCHAR(100),
    description          TEXT,
    PRIMARY KEY (username,projectnameCommented,description),
    FOREIGN KEY (username) REFERENCES Users(username),
    FOREIGN KEY (projectnameCommented) REFERENCES Projects(projectname)
);

CREATE TABLE Saves (
    username             VARCHAR(50),
    projectnameSaved     VARCHAR(100),
    PRIMARY KEY (username, projectnameSaved),
    FOREIGN KEY (username) REFERENCES Users(username),
    FOREIGN KEY (projectnameSaved) REFERENCES Projects(projectName)
);

CREATE TABLE Follows (
    follower    VARCHAR(50),
    following   VARCHAR(50),
    PRIMARY KEY (follower, following),
    FOREIGN KEY (following) REFERENCES Users(username)
);

CREATE TABLE Creates (
    adminName                       VARCHAR(50),
    projectTemplateNameCreated      VARCHAR(50),
    style                           TEXT,
    category                        TEXT,
    PRIMARY KEY (adminName, projectTemplateNameCreated),
    FOREIGN KEY (adminName) REFERENCES Users(admin),
    FOREIGN KEY (projectTemplateNameCreated) REFERENCES ProjectTemplates(projectTemplateName),
    FOREIGN KEY (style) REFERENCES ProjectTemplates(style),
    FOREIGN KEY (category) REFERENCES ProjectTemplates(category)
);

CREATE TABLE Starts (
    username             VARCHAR(50),
    projectName          VARCHAR(100),
    PRIMARY KEY (username, projectName),
    FOREIGN KEY (username) REFERENCES Creators(username),
    FOREIGN KEY (projectName) REFERENCES Projects(projectName)
);

CREATE TABLE ProjectUpdates (
    projectUpdateName    VARCHAR(100),
    updateDescription    TEXT,
    PRIMARY KEY (projectUpdateName)
);

CREATE TABLE Posts (
    creatorName         VARCHAR(50),
    projectUpdateName   VARCHAR(50),
    PRIMARY KEY (creatorName, projectUpdateName),
    FOREIGN KEY (creatorName) REFERENCES Creators(username),
    FOREIGN KEY (projectUpdateName) REFERENCES ProjectUpdates(projectUpdateName) ON DELETE cascade
);


CREATE TABLE FundingTiers (
    fundingTier         VARCHAR(50),
    projectName         VARCHAR(50),
    amountToUnlock      numeric,
    PRIMARY KEY (fundingTier,projectName),
    FOREIGN KEY (projectName) REFERENCES Projects(projectName) ON DELETE cascade
);

/* im not quite sure about the funds part
CREATE TABLE Funds (
             VARCHAR(50),
    projectName         VARCHAR(50),
    amountToUnlock      numeric,
    PRIMARY KEY (fundingTier,projectName),,
    FOREIGN KEY (projectName) REFERENCES Projects(projectName) ON DELETE cascade
);
*/

