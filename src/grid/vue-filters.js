import { format } from 'date-fns';
import {
  defaultDateTimeFormat,
  defaultDateFormat,
  currencyFormatter,
  percentFormatter,
  numericFormatter,
} from './helpers';

// eslint-disable-next-line import/prefer-default-export
export const cellFormatter = function (value, column, row) {
  if (column.formatter) {
    return column.formatter({ value, column, row, reverse: false });
  }
  if (!value && value !== false && value !== 0) return '';
  switch (column.type) {
    case 'date': {
      // eslint-disable-next-line no-param-reassign
      if (typeof value === 'string') value = new Date(value);
      return format(value, column.format || defaultDateFormat);
    }
    case 'datetime': {
      // eslint-disable-next-line no-param-reassign
      if (typeof value === 'string') value = new Date(value);
      return format(value, column.format || defaultDateTimeFormat);
    }
    case 'boolean': return value ? 'Y' : 'N';
    case 'numeric': return numericFormatter.format(value);
    case 'currency': return currencyFormatter.format(value);
    case 'percent': return percentFormatter.format(value);
    default: return value;
  }
};
