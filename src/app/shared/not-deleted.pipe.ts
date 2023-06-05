import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'notDeleted'
})
export class NotDeletedPipe implements PipeTransform {

  transform(value: any): any {
    if(value.length === 0) {
      return value;
    }

    const arrayTemp = [];
    for(const item of value) {
      if(item['isDeleted'] === false) {
        arrayTemp.push(item);
      }
    }
    return arrayTemp;
  }

}
