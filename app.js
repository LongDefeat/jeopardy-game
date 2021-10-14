// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
const NUM_QUESTIONS_PER_CAT = 5;

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  const res = await axios.get("http://jservice.io/api/categories?count=100");
  // console.log(res);

  let catIds = res.data.map((cat) => cat.id);

  //_.sampleSize() method is used to give an array of num random elements from the given array, in this case 6 random categories
  // console.log(catIds);

  return _.sampleSize(catIds, 6);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const res = await axios.get(`http://jservice.io/api/category?id=${catId}`);
  let cat = res.data;
  let catClues = cat.clues;
  let randomClue = _.sampleSize(catClues, NUM_QUESTIONS_PER_CAT);
  let clue = randomClue.map((cl) => ({
    question: cl.question,
    answer: cl.answer,
  }));
  return { title: cat.title, clue };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  $("#board thead").empty().html("<tr></tr>");

  // creates category titles and row of columns
  let tableHeadHtml = categories
    .map((category) => {
      return `<th>${category.title}</th>`;
    })
    .join(""); // turns the array into a string of html

  $("#board thead tr").html(tableHeadHtml);

  const allClues = [];

  for (let i = 0; i < categories.length; i++) {
    allClues.push(categories[i].clue);
  }
  let newTableColumnHtml = ``;

  for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
    newTableColumnHtml += `<tr>`;
    for (const clueArr of allClues) {
      newTableColumnHtml += `<td data-question="${encodeURIComponent(
        clueArr[i].question
      )}" data-answer="${encodeURIComponent(clueArr[i].answer)}">?</td>`;
    }
    newTableColumnHtml += `</tr>`;
  }

  $("#board tbody").html(newTableColumnHtml);
}

// EVENT LISTENERS
// removes the question mark and drops in the question text
$(document).on("click", "td", handleClick);

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  evt.preventDefault();
  var $target = $(evt.target);

  if ($target.hasClass("showing--answer")) {
    return;
  }

  if ($target.hasClass("showing--question")) {
    // here we need to display the answer
    $target
      .removeClass("showing--question")
      .addClass("showing--answer")
      .text(decodeURIComponent($target.data("answer")));
    return;
  }

  // adds a class when one isn't there in order to display the question
  $target
    .addClass("showing--question")
    .text(decodeURIComponent($target.data("question")));
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  categories = [];

  showLoadingView();

  let categoryIds = await getCategoryIds();
  for (let i = 0; i < categoryIds.length; i++) {
    let cate = await getCategory(categoryIds[i]);
    categories.push(cate);
  }
  fillTable();
}

/** On click of start / restart button, set up game. */
$(document).on("click", "#startNewGame", (e) => {
  setupAndStart();
});

// TODO

/** On page load, add event handler for clicking clues */

// TODO
