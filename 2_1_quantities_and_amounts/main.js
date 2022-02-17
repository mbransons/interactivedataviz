/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.08;
const height = window.innerHeight / 3;

/* LOAD DATA */
// d3.autoType - detects datatypes and converts to the expected JS type
// eg: '34' becomes 34
d3.csv('../data/squirrelActivities.csv', d3.autoType).then((data) => {
  console.log('data', data);

  /* SCALES */
  /** This is where you should define your scales from data to pixel space */

  /* HTML ELEMENTS */
  /** Select your container and append the visual elements to it */
});
