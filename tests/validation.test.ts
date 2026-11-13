import {test} from "node:test";
import assert from "node:assert/strict";
import {requestSchema,professionalSchema} from "../lib/validation";
const valid={professionalType:"Architecte",workType:"Construction neuve",buildingType:"Maison individuelle",city:"Kinshasa",district:"Gombe",budget:"Budget non défini",name:"Client Test",phone:"+243812345678",description:"",consent:true,website:"",submissionKey:"00000000-0000-4000-8000-000000000001"};
test("accepte une demande complète",()=>assert.equal(requestSchema.safeParse(valid).success,true));
test("refuse absence de consentement, spam, valeurs inconnues et téléphone invalide",()=>{for(const patch of [{consent:false},{website:"spam"},{phone:"abc"},{phone:"---------"},{professionalType:"IA"},{submissionKey:"guess"},{description:"x".repeat(3001)},{city:""}])assert.equal(requestSchema.safeParse({...valid,...patch}).success,false)});
test("refuse un partenaire aux coordonnées invalides",()=>assert.equal(professionalSchema.safeParse({name:"Test",phone:"bad"}).success,false));

test("valide les communes de Kinshasa tout en acceptant les autres villes",()=>{
 assert.equal(requestSchema.safeParse({...valid,district:"Commune inconnue"}).success,false);
 assert.equal(requestSchema.safeParse({...valid,city:" KINSHASA ",district:"Gombe"}).success,true);
 assert.equal(requestSchema.safeParse({...valid,city:"Lubumbashi",district:"Kampemba"}).success,true);
});
