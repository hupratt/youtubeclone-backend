/*Make sure i select the right lines*/


SELECT
  SUBSTRING(
    Thumbnail
    FROM
      POSITION('/' IN Thumbnail) + 1
  ) AS Thumbnail
FROM
  "Videos"
WHERE
  Thumbnail LIKE 'static%';

/*UPDATE*/

UPDATE "Videos"
SET Thumbnail = 
  SUBSTRING(
    Thumbnail
    FROM
      POSITION('/' IN Thumbnail) + 1
  ) 
WHERE
  Thumbnail LIKE 'static%';