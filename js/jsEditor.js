var javascriptDiv = document.getElementById("javascriptTab")
var myCodeMirror = CodeMirror(javascriptDiv, {
  value: "linearSpeed = 0;\nangularSpeed = 0;\nexecuted = true;\n",
  mode:  "javascript"
});
myCodeMirror.setSize(780, 780);
myCodeMirror.refresh();
