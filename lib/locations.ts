// Source: Monographie de la ville de Kinshasa, liste des 24 communes.
// https://www.fsmtoolbox.com/assets/pdf/Monographie_de_la_ville_de_Kinshasa.pdf
export const kinshasaCommunes = [
 "Bandalungwa","Barumbu","Bumbu","Gombe","Kalamu","Kasa-Vubu",
 "Kimbanseke","Kinshasa","Kintambo","Kisenso","Lemba","Limete",
 "Lingwala","Makala","Maluku","Masina","Matete","Mont-Ngafula",
 "N’djili","Ngaba","Ngaliema","Ngiri-Ngiri","N’sele","Selembao"
] as const;
export function isKinshasa(city:string){return city.trim().toLocaleLowerCase("fr")==="kinshasa";}
export function isKinshasaCommune(value:string){return (kinshasaCommunes as readonly string[]).includes(value);}
