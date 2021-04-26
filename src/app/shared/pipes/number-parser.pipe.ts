import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numberParser'
})
export class NumberParserPipe implements PipeTransform
{

    transform(value: string, ...args: unknown[]): unknown
    {
        if (!value) return '0.00';

        const maxNumbers: number = Number(args[0]) || 8;
        const minNumbers: number = Number(args[1]) || 2;

        const result = this.parseToFirstNonZero(value, minNumbers, maxNumbers);

        return result;
    }

    private parseToFirstNonZero(_amount: string | number, _minNumbers = 2, _maxNumbers = 7)
    {
        const amountString = Number(_amount).toFixed(10);
        const balanceArr = amountString.split('.');

        if (!balanceArr[1])
        {
            return `${_amount}.00`;
        }

        if (balanceArr[1].length < _minNumbers)
        {
            for (let i = 0; i < (_minNumbers - balanceArr[1].length); i++)
            {
                balanceArr[1] += '0';
            }
        }

        let index = balanceArr[1].search(/[1-9]/g) + 1;

        if (index < _minNumbers)
        {
            index = _minNumbers;
        }
        if (index > _maxNumbers)
        {
            index = _maxNumbers;
        }

        balanceArr[1] = balanceArr[1].slice(0, index);

        return balanceArr.join('.');
    }

}
