startTime();

function startTime() {
  var today = new Date();
  var date =
    today.getFullYear() +
    "-" +
    ("0" + (today.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + today.getDate()).slice(-2);
  var time =
    ("0" + today.getHours()).slice(-2) +
    ":" +
    ("0" + today.getMinutes()).slice(-2) +
    ":" +
    ("0" + today.getSeconds()).slice(-2);
  var dateTime = date + " " + time;
  document.getElementById("currentDateTime").value = dateTime;
  var t = setTimeout(startTime, 500);
}
