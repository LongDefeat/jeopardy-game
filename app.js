let categories = [];
const NUM_QUESTIONS_PER_CAT = 5;

// get category ids from API
async function getCategoryIds() {
  const res = await axios.get("http://jservice.io/api/categories?count=100");

  let catIds = res.data.map((cat) => cat.id);

  //_.sampleSize() method is used to give an array of num random elements from the given array, in this case 6 random categories

  return _.sampleSize(catIds, 6);
}

// get categories using IDs from API
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

// fills the HTML with data from APIs
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
    // encodeURI allows for characters, such as "" to be in the html
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
    // this displays the answer
    // need decodeURIComponent along with encodeURIComponent
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

// starts the game
async function setupAndStart() {
  categories = [];

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
