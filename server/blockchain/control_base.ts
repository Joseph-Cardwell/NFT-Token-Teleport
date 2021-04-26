const {ethers} = require('ethers');

//**************************************************************************************************
export class ControlBase
{
	//==============================================================================================
	protected prepareTxFormatUnits(tx, value)
	{
		tx.gasLimit = ethers.utils.formatUnits(tx.gasLimit.add(tx.gasLimit.div(10)), "wei");
		tx.gasPrice = ethers.utils.formatUnits(tx.gasPrice.add(tx.gasPrice.div(5)), "wei");
		tx.value = value.toString();
	}
}