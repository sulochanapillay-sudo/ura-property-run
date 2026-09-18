import { DistrictInfo } from '../types';

export const SINGAPORE_DISTRICTS: DistrictInfo[] = [
  { code: 'D01', name: 'Raffles Place, Cecil, Marina, People\'s Park', region: 'CCR', postalSectors: ['01', '02', '03', '04', '05', '06'] },
  { code: 'D02', name: 'Anson, Tanjong Pagar, Shenton Way', region: 'CCR', postalSectors: ['07', '08'] },
  { code: 'D03', name: 'Queenstown, Tiong Bahru, Alexandra', region: 'RCR', postalSectors: ['14', '15', '16'] },
  { code: 'D04', name: 'Telok Blangah, Harbourfront, Mount Faber, Sentosa', region: 'RCR', postalSectors: ['09', '10'] },
  { code: 'D05', name: 'Buona Vista, West Coast, Clementi New Town', region: 'OCR', postalSectors: ['11', '12', '13'] },
  { code: 'D06', name: 'City Hall, High Street, Beach Road', region: 'CCR', postalSectors: ['17'] },
  { code: 'D07', name: 'Middle Road, Golden Mile, Bugis, Rochor', region: 'RCR', postalSectors: ['18', '19'] },
  { code: 'D08', name: 'Little India, Farrer Park, Serangoon Road', region: 'RCR', postalSectors: ['20', '21'] },
  { code: 'D09', name: 'Orchard, Cairnhill, River Valley', region: 'CCR', postalSectors: ['22', '23'] },
  { code: 'D10', name: 'Ardmore, Bukit Timah, Holland Road, Tanglin', region: 'CCR', postalSectors: ['24', '25', '26', '27'] },
  { code: 'D11', name: 'Watten Estate, Novena, Newton, Thomson', region: 'CCR', postalSectors: ['28', '29', '30'] },
  { code: 'D12', name: 'Balestier, Toa Payoh, Serangoon', region: 'RCR', postalSectors: ['31', '32', '33'] },
  { code: 'D13', name: 'Macpherson, Braddell, Potong Pasir', region: 'RCR', postalSectors: ['34', '35', '36', '37'] },
  { code: 'D14', name: 'Geylang, Eunos, Paya Lebar, Kembangan', region: 'RCR', postalSectors: ['38', '39', '40', '41'] },
  { code: 'D15', name: 'Katong, Joo Chiat, Amber Road, Marine Parade', region: 'RCR', postalSectors: ['42', '43', '44', '45'] },
  { code: 'D16', name: 'Bedok, Upper East Coast, Eastwood, Kew Drive', region: 'OCR', postalSectors: ['46', '47', '48'] },
  { code: 'D17', name: 'Loyang, Changi, Flora Road', region: 'OCR', postalSectors: ['49', '50'] },
  { code: 'D18', name: 'Tampines, Pasir Ris', region: 'OCR', postalSectors: ['51', '52'] },
  { code: 'D19', name: 'Serangoon Garden, Hougang, Punggol, Sengkang', region: 'OCR', postalSectors: ['53', '54', '55', '82'] },
  { code: 'D20', name: 'Bishan, Ang Mo Kio, Thomson', region: 'RCR', postalSectors: ['56', '57'] },
  { code: 'D21', name: 'Upper Bukit Timah, Clementi Park, Ulu Pandan', region: 'RCR', postalSectors: ['58', '59'] },
  { code: 'D22', name: 'Jurong, Boon Lay, Tuas', region: 'OCR', postalSectors: ['60', '61', '62', '63', '64'] },
  { code: 'D23', name: 'Hillview, Dairy Farm, Bukit Panjang, Choa Chu Kang', region: 'OCR', postalSectors: ['65', '66', '67', '68'] },
  { code: 'D24', name: 'Lim Chu Kang, Tengah', region: 'OCR', postalSectors: ['69', '70', '71'] },
  { code: 'D25', name: 'Kranji, Woodgrove, Woodlands', region: 'OCR', postalSectors: ['72', '73'] },
  { code: 'D26', name: 'Mandai, Upper Thomson, Springleaf', region: 'OCR', postalSectors: ['77', '78'] },
  { code: 'D27', name: 'Yishun, Sembawang, Admiralty', region: 'OCR', postalSectors: ['75', '76'] },
  { code: 'D28', name: 'Seletar, Yio Chu Kang', region: 'OCR', postalSectors: ['79', '80'] },
];

export const REGION_DESCRIPTIONS: Record<string, { label: string; full: string; desc: string }> = {
  CCR: {
    label: 'CCR',
    full: 'Core Central Region',
    desc: 'Prime Singapore districts (D09, D10, D11, Downtown Core & Sentosa). High luxury condominiums & prestigious landed estates.',
  },
  RCR: {
    label: 'RCR',
    full: 'Rest of Central Region',
    desc: 'City fringe districts (e.g. D03 Queenstown, D15 East Coast, D12 Toa Payoh, D20 Bishan). Balanced accessibility and strong capital appreciation.',
  },
  OCR: {
    label: 'OCR',
    full: 'Outside Central Region',
    desc: 'Suburban regional hubs (e.g. Jurong, Tampines, Punggol, Woodlands). High volume suburban condominiums and executive condominiums.',
  },
};
