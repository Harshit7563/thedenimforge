export type SizeRow = {
  size: string;
  waist: string;
  hip: string;
  inseam: string;
  length: string;
};

export const MENS_SIZE_CHART: SizeRow[] = [
  { size: '28', waist: '28"', hip: '36"', inseam: '30"', length: '40"' },
  { size: '30', waist: '30"', hip: '38"', inseam: '30"', length: '40"' },
  { size: '32', waist: '32"', hip: '40"', inseam: '31"', length: '41"' },
  { size: '34', waist: '34"', hip: '42"', inseam: '31"', length: '41"' },
  { size: '36', waist: '36"', hip: '44"', inseam: '32"', length: '42"' },
  { size: '38', waist: '38"', hip: '46"', inseam: '32"', length: '42"' },
  { size: '40', waist: '40"', hip: '48"', inseam: '32"', length: '43"' },
  { size: '42', waist: '42"', hip: '50"', inseam: '32"', length: '43"' },
];

export const WOMENS_SIZE_CHART: SizeRow[] = [
  { size: '26', waist: '26"', hip: '34"', inseam: '29"', length: '38"' },
  { size: '28', waist: '28"', hip: '36"', inseam: '29"', length: '39"' },
  { size: '30', waist: '30"', hip: '38"', inseam: '30"', length: '39"' },
  { size: '32', waist: '32"', hip: '40"', inseam: '30"', length: '40"' },
  { size: '34', waist: '34"', hip: '42"', inseam: '30"', length: '40"' },
  { size: '36', waist: '36"', hip: '44"', inseam: '30"', length: '41"' },
  { size: '38', waist: '38"', hip: '46"', inseam: '30"', length: '41"' },
];

export const KIDS_SIZE_CHART: SizeRow[] = [
  { size: '4', waist: '20"', hip: '24"', inseam: '16"', length: '24"' },
  { size: '6', waist: '21"', hip: '26"', inseam: '18"', length: '27"' },
  { size: '8', waist: '22"', hip: '28"', inseam: '20"', length: '30"' },
  { size: '10', waist: '24"', hip: '30"', inseam: '22"', length: '33"' },
  { size: '12', waist: '25"', hip: '32"', inseam: '24"', length: '36"' },
  { size: '14', waist: '26"', hip: '34"', inseam: '26"', length: '38"' },
];

/** Default chart used on product pages (men's waist sizes). */
export const SIZE_CHART = MENS_SIZE_CHART;
