import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'filter',
    pure: false
})

export class ListFilterPipe implements PipeTransform {
    transform(items: any[], filter: string): any {
        if (!items || !filter) {
            return items;
        }        
        return items.filter(item => { 
            return item.list === filter; 
        });
    }
}