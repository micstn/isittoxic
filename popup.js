// HELPERS
function getSum(total, num) {
  return total + num;
}

function SelectText(element) {
  var doc = document;
  if (doc.body.createTextRange) {
      var range = document.body.createTextRange();
      range.moveToElementText(element);
      range.select();
  } else if (window.getSelection) {
      var selection = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
  }
}

function moveBar() {
  var elem = document.getElementById("myBar"); 
  var width = 1;
  var id = setInterval(frame, 10);
  function frame() {
    if (width >= 100) {
      clearInterval(id);
      setTimeout(function(){elem.style.width = 0;}, 300);
    } else {
      width++; 
      elem.style.width = width + '%'; 
    }
  }
}

// Counts positive and neutral (null) predictions by each category
function countCategoryPreds(results) {
  let trueCounter = 0; let nullCounter = 0
  results.forEach(v => v['match'] == true ? trueCounter++ : v)
  results.forEach(v => v['match'] == null ? nullCounter++ : v)
  return [trueCounter, nullCounter]
}

// Parse selected text
let displayText = document.getElementById('showText'); 
let getSelecttedSentences = "window.getSelection().toString().match( /[^\.!\?]+[\.!\?]+/g ).filter(function(element){return element.length > 5;})"

displayText.onclick = function(element){
  moveBar()
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {code: getSelecttedSentences}, function(selection){
        
        // get sentences
        input_text = selection[0];
        // document.getElementById('sum-sentences').innerText = "Number of sentences: " + input_text.length;
        document.getElementById('inputText').innerText = input_text;
        
        // do predictions
        var threshold = 0.8
        toxicity.load(threshold).then(model => {
          model.classify(input_text).then(predictions => {

            // text summary (rows)
            var summaryBlock = document.getElementById("summary-block")
            predictions.forEach(element =>{

              var catCounts = countCategoryPreds(element['results'])
              var node = document.getElementById(element['label'])
              
              if (catCounts[0] > 0) {
                node.setAttribute("class", "label red");
              } else if (catCounts[1] > 0) {
                node.setAttribute("class", "label yellow");
              } else {
                node.setAttribute("class", "label gray");
              }
              
            });
            
          });
        });
    });
  });
}


let copyScreen = document.getElementById('takePicture');

copyScreen.onclick = function(element){
  html2canvas(document.querySelector("#capture-zone")).then(canvas => {
    
    var img = document.createElement('img');
    img.src = canvas.toDataURL()
    var div = document.createElement('div');
    div.contentEditable = true;
    // div.setAttribute("style", "display: none;")
    div.appendChild(img);
    document.body.appendChild(div);
    SelectText(div);
    document.execCommand('Copy');
    document.body.removeChild(div);

  });
}