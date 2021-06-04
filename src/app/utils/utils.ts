export function convertToINR(number: string): string;
export function convertToINR(number: number): string;

export function convertToINR(number: string | number): string {
  return convertToSpacedNumeralWithSymbol(number, '₹');
}

export function convertToSpacedNumeral(number: string | number): string {
  return convertToSpacedNumeralWithSymbol(number, '');
}

export function convertToSpacedNumeralWithSymbol(number: string | number, symbol: string): string {
  if (typeof number === "number") {
    number = number.toString();
  }
  
  if (number === '')
    return symbol + "0.00";

  const result = number.split('.');
  let lastThree = result[0].substring(result[0].length - 3);
  var otherNumbers = result[0].substring(0, result[0].length - 3);
  if (otherNumbers != '')
      lastThree = ',' + lastThree;
  var output = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  
  if (result.length > 1) {
      output += "." + result[1];
  }            

  return symbol + output;
}