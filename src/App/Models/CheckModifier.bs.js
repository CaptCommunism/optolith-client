// Generated by BUCKLESCRIPT, PLEASE EDIT WITH CARE
'use strict';

var Json_decode = require("@glennsl/bs-json/src/Json_decode.bs.js");

function t(json) {
  var scope = Json_decode.string(json);
  switch (scope) {
    case "SPI" :
        Json_decode.$$int(json);
        return /* SPI */0;
    case "SPI/2" :
        Json_decode.$$int(json);
        return /* DOUBLE_SPI */1;
    case "SPI/TOU" :
        Json_decode.$$int(json);
        return /* MAX_SPI_TOU */3;
    case "TOU" :
        Json_decode.$$int(json);
        return /* TOU */2;
    default:
      throw [
            Json_decode.DecodeError,
            "Unknown check modifier: " + scope
          ];
  }
}

var Decode = {
  t: t
};

exports.Decode = Decode;
/* No side effect */
