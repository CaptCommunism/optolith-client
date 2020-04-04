// Generated by BUCKLESCRIPT, PLEASE EDIT WITH CARE
'use strict';

var Json_decode = require("@glennsl/bs-json/src/Json_decode.bs.js");
var JsonStrict$OptolithClient = require("../Utilities/YAML/JsonStrict.bs.js");
var CheckModifier$OptolithClient = require("./CheckModifier.bs.js");
var Static_Erratum$OptolithClient = require("./Static_Erratum.bs.js");
var Static_SourceRef$OptolithClient = require("./Static_SourceRef.bs.js");

function tL10n(json) {
  return {
          id: Json_decode.field("id", Json_decode.$$int, json),
          name: Json_decode.field("name", Json_decode.string, json),
          effect: Json_decode.field("effect", Json_decode.string, json),
          aeCost: Json_decode.field("aeCost", Json_decode.string, json),
          aeCostShort: Json_decode.field("aeCostShort", Json_decode.string, json),
          duration: Json_decode.field("duration", Json_decode.string, json),
          durationShort: Json_decode.field("durationShort", Json_decode.string, json),
          src: Json_decode.field("src", Static_SourceRef$OptolithClient.Decode.list, json),
          errata: Json_decode.field("errata", Static_Erratum$OptolithClient.Decode.list, json)
        };
}

function tUniv(json) {
  return {
          id: Json_decode.field("id", Json_decode.$$int, json),
          check1: Json_decode.field("check1", Json_decode.$$int, json),
          check2: Json_decode.field("check2", Json_decode.$$int, json),
          check3: Json_decode.field("check3", Json_decode.$$int, json),
          checkMod: JsonStrict$OptolithClient.optionalField("checkMod", CheckModifier$OptolithClient.Decode.t, json),
          property: Json_decode.field("property", Json_decode.$$int, json)
        };
}

function t(univ, l10n) {
  return {
          id: univ.id,
          name: l10n.name,
          check: /* tuple */[
            univ.check1,
            univ.check2,
            univ.check3
          ],
          checkMod: univ.checkMod,
          effect: l10n.effect,
          aeCost: l10n.aeCost,
          aeCostShort: l10n.aeCostShort,
          duration: l10n.duration,
          durationShort: l10n.durationShort,
          property: univ.property,
          src: l10n.src,
          errata: l10n.errata
        };
}

var Decode = {
  tL10n: tL10n,
  tUniv: tUniv,
  t: t
};

exports.Decode = Decode;
/* No side effect */
