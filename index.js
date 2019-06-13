const API_URL = "https://nineteen-eighty-four.herokuapp.com";
let lastId = null;
let modal = null;
let screen = null;


function showModal(){
  modal.style.display = "block"
  screen.style.display = "block"
  document.body.style.overflow = "hidden"
}

function hideModal(){
  modal.style.display = "none"
  screen.style.display = "none"
  document.body.style.overflow = ""
}

function getSentenceTextElement(sentenceId) {
  return document.getElementById(`sentence-${ sentence.id }-text`)
}

function slapSentenceUpdateOnTheDom(sentence){
  getSentenceTextElement(sentence.id).innerText = sentence.text
  hideModal()
}

function updateSentence(event) {
  event.preventDefault()
  const form = event.target;
  fetch(`${ API_URL }/sentences/${ form.id.value }`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      text: form.text.value
    })
  }).then(res => res.json())
  .then(slapSentenceUpdateOnTheDom)
}

function editSentence(sentence){
  showModal()
  modal.text.value = getSentenceTextElement(sentence.id).innerText
  modal.id.value = sentence.id
}

function updateLikes(data, element){
  element.innerHTML = data.new_like_count
}

function likeSentence(id, element){
  fetch(`${ API_URL }/likes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      sentence_id: id
    })
  }).then(res => res.json())
    .then(data => updateLikes(data, element))
}

function deleteSentence(id, element){
  fetch(`${ API_URL }/sentences/${ id }`, {
    method: "DELETE"
  }).then(() => element.remove())
}

function sentenceHTML(sentence){
  const li = document.createElement("li")
  li.innerHTML = `<h2 id="sentence-${ sentence.id }-text">${ sentence.text }</h2>
    <span class="likes">
      <span class="like-count">${ sentence.likes.length }</span> Likes
      <button class="like-button">Like</button>
    </span>
    <button class="edit-button">Edit</button>
    <button class="delete-button">Delete</button>
  </li>`
  const likeCount = li.querySelector(".like-count")
  li.querySelector(".like-button").addEventListener("click", event => likeSentence(sentence.id, likeCount))
  li.querySelector(".delete-button").addEventListener("click", event => deleteSentence(sentence.id, li))
  li.querySelector(".edit-button").addEventListener("click", event => editSentence(sentence))
  return li;
}

function slapSentencesOnTheDOM(sentenceList, sentences){
  sentenceList.append(...sentences.map(sentenceHTML))
}
function fetchSentences(sentenceList, nextPageButton) {
  fetch(`${ API_URL }/sentences` + (lastId ? ("?after=" + lastId) : ""))  
    .then(res => res.json())
    .then(data => {
      lastId = data.sentences[data.sentences.length - 1].id
      slapSentencesOnTheDOM(sentenceList, data.sentences)
      if (!data.remaining) {
        nextPageButton.style.display = "none"
      }
    })
}

document.addEventListener("DOMContentLoaded", function(){
  modal = document.getElementById("modal")
  screen = document.getElementById("screen")
  modal.addEventListener("submit", updateSentence)
  hideModal()

  const sentenceList = document.getElementById("sentences")
  fetchSentences(sentenceList)

  const nextPageButton = document.getElementById("next-page")
  nextPageButton.addEventListener("click", function(){
    fetchSentences(sentenceList, nextPageButton)
  })
})
