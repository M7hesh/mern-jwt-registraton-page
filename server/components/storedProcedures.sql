-- stored procedure for user registration
-- DELIMITER $ $ 
CREATE PROCEDURE registerUser(
    IN uuid VARCHAR(255),
    IN firstName VARCHAR(255),
    IN lastName VARCHAR(255),
    IN mobileNumber VARCHAR(255),
    IN encryptedPassword VARCHAR(255),
    IN profilePicture VARCHAR(255),
    OUT userId INT
) BEGIN
INSERT INTO
    users (
        id,
        first_name,
        last_name,
        mobile_number,
        password,
        profile_picture,
        created_date,
        created_by,
        updated_date,
        updated_by
    )
VALUES
    (
        uuid,
        firstName,
        lastName,
        mobileNumber,
        encryptedPassword,
        profilePicture,
        UTC_TIMESTAMP(),
        uuid,
        NULL,
        NULL
    );

END $ $ DELIMITER;

-- stored procedure for user login
DELIMITER $ $ CREATE PROCEDURE loginUser(
    IN mobileNumber VARCHAR(255),
    IN password VARCHAR(255),
    OUT userId INT
) BEGIN
SELECT
    id INTO userId
FROM
    users
WHERE
    mobile_number = mobileNumber
    AND users.password = password;

END -- $ $ DELIMITER;