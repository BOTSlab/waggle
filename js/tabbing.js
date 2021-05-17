function openTab(evt, divName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(divName).style.display = "block";
  evt.currentTarget.className += " active";

  if (divName == "blocklyTab") {
    myGlobals.usingBlockly = true;
    onresize();
    Blockly.svgResize(workspace); 
  } else if (divName == "javascriptTab") {
    myGlobals.usingBlockly = false;
    myCodeMirror.refresh();
  } else if (divName == "hardcodedTab") {
    myGlobals.usingBlockly = false;
  }
}

// A dummy event to setup Blockly as the default tab.
var dummyEvent = {};

dummyEvent.currentTarget = document.getElementById('blocklyTabButton')
openTab(dummyEvent, 'blocklyTab');

//dummyEvent.currentTarget = document.getElementById('hardcodedTabButton')
//openTab(dummyEvent, 'hardcodedTab');
