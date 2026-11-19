import Mustache from "mustachejs";

console.log("hello from application.js")
const response = await fetch("http://www.omdbapi.com/?s=harry potter&apikey=48727053");
const data = await response.json();
console.log(data);

const results = document.querySelector("#results")
const template = document.querySelector("#movieCardTemplate").innerHTML

data.Search.forEach((movie) => {
  const output = Mustache.render(template, movie);
  results.insertAdjacentHTML("beforeend", output)
})