import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any, filterString: string, propName: string): any {
    if(value.length === 0 || filterString === undefined || filterString === '' || filterString === null) {
      return value;
    }

    const arrayTemp = [];
    for(const item of value) {
      if(item[propName].toLowerCase().includes(filterString.toLowerCase())) {
        arrayTemp.push(item);
      }
    }
    return arrayTemp;
  }

}
