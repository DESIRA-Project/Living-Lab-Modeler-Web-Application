export const hours = [ ...Array(24).keys() ];
export const formattedHours = hours.map(h => ('00' + h).slice(-2));
export const minutes = [ ...Array(4).keys() ].map( i => i * 15);
export const formattedMinutes = minutes.map(m => ('00' + m).slice(-2));
