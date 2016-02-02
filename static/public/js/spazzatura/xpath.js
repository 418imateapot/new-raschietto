// https://stackoverflow.com/questions/10596417/is-there-a-way-to-get-element-by-xpath-using-javascript-in-selenium-webdriver
function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

console.log( getElementByXpath("//html[1]/body[1]/div[1]") );
let a = document.evaluate('//p[77]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue

a.style.backgroundColor="blue"
"blue"
