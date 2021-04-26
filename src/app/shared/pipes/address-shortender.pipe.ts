import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'addressShorter'
})
export class AddressShorterPipe implements PipeTransform
{
    transform(value: string, ...args: unknown[]): unknown
    {
        return this.ShortAddress(value, ...args);
    }

    private ShortAddress(value: string, ...args: unknown[])
    {
        if (value == null)
        {
            return value;
        }
    
        const size = value.length;
        const end: number = Number(args[0]) || 4;
        const start: number = Number(args[1]) || 6;
    
        const SUBSTITUTE  = "..";
    
        // SHORT_PART can be bigger than actual text by one symbol.
        const REQUIRED_MIN_SIZE = end + start + SUBSTITUTE.length;
    
        if (size < REQUIRED_MIN_SIZE)
        {
            return value;
        }
    
        //why toLocaleLowerCase ??
        return (value.slice(0, start) + SUBSTITUTE + value.slice(size - end, size)).toLocaleLowerCase();
    }
}
