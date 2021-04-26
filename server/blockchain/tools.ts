const {ethers} = require('ethers');

//**************************************************************************************************
export function toFixed(x):string
{
    if(Math.abs(x) < 1.0)
    {
        var e = parseInt(x.toString().split('e-')[1]);
        if(e)
        {
            x *= Math.pow(10,e-1);
            x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
    }
    else
    {
        var e = parseInt(x.toString().split('+')[1]);
        if(e > 20)
        {
            e -= 20;
            x /= Math.pow(10, e);
            x += (new Array(e + 1)).join('0');
        }
    }
    return x.toString();
}
//**************************************************************************************************
export function castBigNumberToDecimal(_value, _decimals:number = Number(18)): number
{
    return ethers.utils.formatUnits(_value, _decimals);
}
//**************************************************************************************************
export function castDecimalToBigNumber(_value:string, _decimals:number = Number(18))
{   let value = _value;
    if (typeof _value !== 'string') {
      value = (<any>_value).toString();
    }
    value = toFixed(_value).toString();
    let fixedValue = value;
    let index = value.indexOf(".");
    if(index && value.substring(index + 1).length > _decimals)
    {
        fixedValue = Number(value).toFixed(_decimals);
    }
    return ethers.utils.parseUnits(fixedValue, _decimals);
}