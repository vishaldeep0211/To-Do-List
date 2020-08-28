exports.getDate = function(){

  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  };
  const today = new Date();

  return today.toLocaleDateString("en-US", options);
}

exports.getDay = function(){

  const options = {
    weekday: 'long'
  };
  const today = new Date();

  return today.toLocaleDateString("en-US", options);
}

exports.formatAMPM = function() {

  var date = new Date;

  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}