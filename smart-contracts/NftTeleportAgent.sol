// SPDX-License-Identifier: MIT

// Aye there, human behind the electronic device!
// Scotty's on the line. Where you may see a silly hamster,
// others see a miracle worker, a captain by rank,
// and an engineer by calling.
// I have spent my whole life
// trying to figure out crazy ways of doing things.
// Now my duty is to maintain and operate the NFT Transporter,
// which can beam your precious NFTs from Ethereum to the Binance Smart Chain
// and other way around. Wee bit tricky, but I can show you how it works.
// Ready?
// All right, you lovelies, hold together!


// &&&&&&&%%&&&&&&&&&&&&&&&&&&&&&&&&&%&&&&&&&&&&&&&&&&&&&&&%%%%%%%%%%%%%%%%&%%%&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&%%%%%%%%%%%%%%%%%%%%%&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&%%%%%%%%%%%%%%%%%%%%&&&&&&
// &&&&%&&&&&&&&&&&&&&&&&&&&&&&&&%&&&&&&%##(((#%&&&&&&&&&%%%%%%%%%%%%%%%%%%%&&&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&/*//////////////****/*/,.(%%%%&%%%%%%%%%%%%%&&&&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&(*///////////////////****,*,***//*.%%%%%%%%%%%%%%&&&&&&&&
// &&&&&&&&&&&&&&&&&&&%/////////////((((((((((///////***///((((*/&%%%%%%%%&&&&&&%&%
// &&&&&&&&&&&&&&&&&///////////(((((((((((((##(#####((((((((((((((,#%%%%%&&&&&&%%%%
// &&&&&&&&&&&&&&&/////////((/(((((((####################(###(((((((*(%%&%&&&&&%%%%
// &&&&&&&&&&&&&///////******/((#(############%%%########(//**/(####(#*%&&&&&%%%%%%
// &&&&&&&&&&&%//////(*,,**,,/*/####(//********//(#%%###*//,*,*,*(###(##,&&&%%%%%%%
// &&&&&&&%&&#/(///((((/,,,,,,/////******************/(/(,*****,/########.&%%%&%%%%
// &&&&&&&&&#/(((((((((((#//,/**//***********************(,,,,(###########,&%%%%%&%
// &&&&&&&&&/(((((((((((####/////**************************(%%%%####%%%%###*&%%%%%%
// &&&&&&&&(((((((((((#####(*////*****/((((***********/((#((/#%%%%%%%%%%###*%%%%%%%
// &&&&&&&&/(((((((((#####(*////***/(////////#******(/////////(%%%%%%%%#####(%%%%%%
// &&&&&&&&/(((((((######(*////***/.   .*(#((*(****/,     */   #%#%%%%#((((#/%%%%%%
// &&&&&%&&(((((((######//////*****/          (*****(         /%%%%%%#(////((%%%&&&
// &&&&&&&&/((((######///////*******/(      (/********(,    /(*/%%%%%##(((((#%&&&%%
// &&&&&&&&#(#######(*//////*****************/*(####(***********/%%%%%%%%%%(&&&%%%%
// &&&&&&&&&/#######/*//////********************/**/************//%%%%%%%%#&&&&%%%%
// &&&&&&&&&&/######////////********************(*/*(*************#%%%%%%%%&%&&&%%%
// &&&&&&&&&&&/#####////////**************************************#%%%%%%&&&&&%%%%%
// &&&&&#&&&&&&#(##%#////////************************************(%%%%%%&&&&&&&&&&%
// &&&&&&&&&&&&&&/#%%%(////////*********************************(&%%%%&&&&&&&#&&&&&
// &&&&&&&&&&&&&&&&/(%&&(////////*****************************(%%%&#&&&&&&&&&&%&&&&
// &&&&&&&&&&&&&&&%###*&&&&((///////**********************/#%&&&%%&&&&&&&&&&&&&&&&%
// &&&&&&&&&&&&&&########*%@@@&(/(((/////*********//(((#@@@###%&&%&&&&&%%%&%&&&%%%%
// &&&&&&&&&&&&%############%//@@@@@@@@&#(//////(&@@@@@@#/#%##%&&&&&&&&%%%&&&%%%%%%
// &&&&&&&&&&&%###################%#//(#%%&&&&%%##%&@&#######%#%%&%&&%&&&&%%&&&%&%%
// &%&&&&&&&&&%###########################&@@@@@@@@%############%##%%&&&&%%%%%%%%%%
// &&&&&&&&&&%#############%%%%###############%@@&########((#####%######%%%%%&&&%%%

//  ____                         __  __        _   _          ____            _   _         _ 
// | __ )  ___  __ _ _ __ ___   |  \/  | ___  | | | |_ __    / ___|  ___ ___ | |_| |_ _   _| |
// |  _ \ / _ \/ _` | '_ ` _ \  | |\/| |/ _ \ | | | | '_ \   \___ \ / __/ _ \| __| __| | | | |
// | |_) |  __/ (_| | | | | | | | |  | |  __/ | |_| | |_) |   ___) | (_| (_) | |_| |_| |_| |_|
// |____/ \___|\__,_|_| |_| |_| |_|  |_|\___|  \___/| .__( ) |____/ \___\___/ \__|\__|\__, (_)
//                                                  |_|  |/                           |___/   

pragma solidity ^0.8.0;

interface IERC165 {
    /// @notice Query if a contract implements an interface
    /// @param interfaceID The interface identifier, as specified in ERC-165
    /// @dev Interface identification is specified in ERC-165. This function
    ///  uses less than 30,000 gas.
    /// @return `true` if the contract implements `interfaceID` and
    ///  `interfaceID` is not 0xffffffff, `false` otherwise
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

interface IERC721Transfer {
    /// @notice Transfers the ownership of an NFT from one address to another address
    /// @dev This works identically to the other function with an extra data parameter,
    ///  except this function just sets data to "".
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;

    /// @notice Transfer ownership of an NFT -- THE CALLER IS RESPONSIBLE
    ///  TO CONFIRM THAT `_to` IS CAPABLE OF RECEIVING NFTS OR ELSE
    ///  THEY MAY BE PERMANENTLY LOST
    /// @dev Throws unless `msg.sender` is the current owner, an authorized
    ///  operator, or the approved address for this NFT. Throws if `_from` is
    ///  not the current owner. Throws if `_to` is the zero address. Throws if
    ///  `_tokenId` is not a valid NFT.
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable;
}

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize(account) }
        return size > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
        (bool success, ) = recipient.call{ value: amount }("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain`call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
      return functionCall(target, data, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value, string memory errorMessage) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.call{ value: value }(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data, string memory errorMessage) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.staticcall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    function _verifyCallResult(bool success, bytes memory returndata, string memory errorMessage) private pure returns(bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                // solhint-disable-next-line no-inline-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}

/// @title ERC-721 Non-Fungible Token Standard, optional metadata extension
/// @dev See https://eips.ethereum.org/EIPS/eip-721
///  Note: the ERC-165 identifier for this interface is 0x5b5e139f.
interface IERC721Metadata {
    /// @notice A descriptive name for a collection of NFTs in this contract
    function name() external view returns (string memory _name);

    /// @notice An abbreviated name for NFTs in this contract
    function symbol() external view returns (string memory _symbol);

    /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
    /// @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
    ///  3986. The URI may point to a JSON file that conforms to the "ERC721
    ///  Metadata JSON Schema".
    function tokenURI(uint256 _tokenId) external view returns (string memory);
}

interface ERC721TokenReceiver {
    /// @notice Handle the receipt of an NFT
    /// @dev The ERC721 smart contract calls this function on the recipient
    ///  after a `transfer`. This function MAY throw to revert and reject the
    ///  transfer. Return of other than the magic value MUST result in the
    ///  transaction being reverted.
    ///  Note: the contract address is always the message sender.
    /// @param _operator The address which called `safeTransferFrom` function
    /// @param _from The address which previously owned the token
    /// @param _tokenId The NFT identifier which is being transferred
    /// @param _data Additional data with no specified format
    /// @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    ///  unless throwing
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external returns(bytes4);
}

/*
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

contract Ownable is Context {
    address internal owner_;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor(address _owner) {
        owner_ = _owner;
        emit OwnershipTransferred(address(0), owner_);
    }
  
    modifier onlyOwner() {
        require(owner_ == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function owner() public view returns (address) {
        return owner_;
    }
  
    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "ERC721: new owner is the zero address");
        emit OwnershipTransferred(owner(), _newOwner);
        owner_ = _newOwner;
    }
}

/**
 * @dev This abstract contract provides a fallback function that delegates all calls to another contract using the EVM
 * instruction `delegatecall`. We refer to the second contract as the _implementation_ behind the proxy, and it has to
 * be specified by overriding the virtual {_implementation} function.
 *
 * Additionally, delegation to the implementation can be triggered manually through the {_fallback} function, or to a
 * different contract through the {_delegate} function.
 *
 * The success and return data of the delegated call will be returned back to the caller of the proxy.
 */
abstract contract Proxy {
    /**
     * @dev Delegates the current call to `implementation`.
     *
     * This function does not return to its internall call site, it will return directly to the external caller.
     */
    function _delegate(address implementation) internal virtual {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    /**
     * @dev This is a virtual function that should be overriden so it returns the address to which the fallback function
     * and {_fallback} should delegate.
     */
    function _implementation() internal view virtual returns (address);

    /**
     * @dev Delegates the current call to the address returned by `_implementation()`.
     *
     * This function does not return to its internall call site, it will return directly to the external caller.
     */
    function _fallback() internal virtual {
        _beforeFallback();
        _delegate(_implementation());
    }

    /**
     * @dev Fallback function that delegates calls to the address returned by `_implementation()`. Will run if no other
     * function in the contract matches the call data.
     */
    fallback () external payable virtual {
        _fallback();
    }

    /**
     * @dev Fallback function that delegates calls to the address returned by `_implementation()`. Will run if call data
     * is empty.
     */
    receive () external payable virtual {
        _fallback();
    }

    /**
     * @dev Hook that is called before falling back to the implementation. Can happen as part of a manual `_fallback`
     * call, or as part of the Solidity `fallback` or `receive` functions.
     *
     * If overriden should call `super._beforeFallback()`.
     */
    function _beforeFallback() internal virtual {
    }
}

/**
 * @dev This contract implements an upgradeable proxy. It is upgradeable because calls are delegated to an
 * implementation address that can be changed. This address is stored in storage in the location specified by
 * https://eips.ethereum.org/EIPS/eip-1967[EIP1967], so that it doesn't conflict with the storage layout of the
 * implementation behind the proxy.
 *
 * Upgradeability is only provided internally through {_upgradeTo}. For an externally upgradeable proxy see
 * {TransparentUpgradeableProxy}.
 */
contract ERC1967Proxy is Proxy {
    /**
     * @dev Initializes the upgradeable proxy with an initial implementation specified by `_logic`.
     *
     * If `_data` is nonempty, it's used as data in a delegate call to `_logic`. This will typically be an encoded
     * function call, and allows initializating the storage of the proxy like a Solidity constructor.
     */
    constructor(address _logic, bytes memory _data) payable {
        assert(_IMPLEMENTATION_SLOT == bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1));
        _setImplementation(_logic);
        if(_data.length > 0) {
            Address.functionDelegateCall(_logic, _data);
        }
    }

    /**
     * @dev Emitted when the implementation is upgraded.
     */
    event Upgraded(address indexed implementation);

    /**
     * @dev Storage slot with the address of the current implementation.
     * This is the keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1, and is
     * validated in the constructor.
     */
    bytes32 private constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    /**
     * @dev Returns the current implementation address.
     */
    function _implementation() internal view virtual override returns (address impl) {
        bytes32 slot = _IMPLEMENTATION_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            impl := sload(slot)
        }
    }

    /**
     * @dev Upgrades the proxy to a new implementation.
     *
     * Emits an {Upgraded} event.
     */
    function _upgradeTo(address newImplementation) internal virtual {
        _setImplementation(newImplementation);
        emit Upgraded(newImplementation);
    }

    /**
     * @dev Stores a new address in the EIP1967 implementation slot.
     */
    function _setImplementation(address newImplementation) private {
        require(Address.isContract(newImplementation), "ERC1967Proxy: new implementation is not a contract");

        bytes32 slot = _IMPLEMENTATION_SLOT;

        // solhint-disable-next-line no-inline-assembly
        assembly {
            sstore(slot, newImplementation)
        }
    }
}

/**
 * @dev This contract implements a proxy that is upgradeable by an admin.
 *
 * To avoid https://medium.com/nomic-labs-blog/malicious-backdoors-in-ethereum-proxies-62629adf3357[proxy selector
 * clashing], which can potentially be used in an attack, this contract uses the
 * https://blog.openzeppelin.com/the-transparent-proxy-pattern/[transparent proxy pattern]. This pattern implies two
 * things that go hand in hand:
 *
 * 1. If any account other than the admin calls the proxy, the call will be forwarded to the implementation, even if
 * that call matches one of the admin functions exposed by the proxy itself.
 * 2. If the admin calls the proxy, it can access the admin functions, but its calls will never be forwarded to the
 * implementation. If the admin tries to call a function on the implementation it will fail with an error that says
 * "admin cannot fallback to proxy target".
 *
 * These properties mean that the admin account can only be used for admin actions like upgrading the proxy or changing
 * the admin, so it's best if it's a dedicated account that is not used for anything else. This will avoid headaches due
 * to sudden errors when trying to call a function from the proxy implementation.
 *
 * Our recommendation is for the dedicated account to be an instance of the {ProxyAdmin} contract. If set up this way,
 * you should think of the `ProxyAdmin` instance as the real administrative interface of your proxy.
 */
contract TransparentUpgradeableProxy is ERC1967Proxy {
    /**
     * @dev Initializes an upgradeable proxy managed by `_admin`, backed by the implementation at `_logic`, and
     * optionally initialized with `_data` as explained in {UpgradeableProxy-constructor}.
     */
    constructor(address _logic, address admin_, bytes memory _data) payable ERC1967Proxy(_logic, _data) {
        assert(_ADMIN_SLOT == bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1));
        _setAdmin(admin_);
    }

    /**
     * @dev Emitted when the admin account has changed.
     */
    event AdminChanged(address previousAdmin, address newAdmin);

    /**
     * @dev Storage slot with the admin of the contract.
     * This is the keccak-256 hash of "eip1967.proxy.admin" subtracted by 1, and is
     * validated in the constructor.
     */
    bytes32 private constant _ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

    /**
     * @dev Modifier used internally that will delegate the call to the implementation unless the sender is the admin.
     */
    modifier ifAdmin() {
        if (msg.sender == _admin()) {
            _;
        } else {
            _fallback();
        }
    }

    /**
     * @dev Returns the current admin.
     *
     * NOTE: Only the admin can call this function. See {ProxyAdmin-getProxyAdmin}.
     *
     * TIP: To get this value clients can read directly from the storage slot shown below (specified by EIP1967) using the
     * https://eth.wiki/json-rpc/API#eth_getstorageat[`eth_getStorageAt`] RPC call.
     * `0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103`
     */
    function admin() external ifAdmin returns (address admin_) {
        admin_ = _admin();
    }

    /**
     * @dev Returns the current implementation.
     *
     * NOTE: Only the admin can call this function. See {ProxyAdmin-getProxyImplementation}.
     *
     * TIP: To get this value clients can read directly from the storage slot shown below (specified by EIP1967) using the
     * https://eth.wiki/json-rpc/API#eth_getstorageat[`eth_getStorageAt`] RPC call.
     * `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`
     */
    function implementation() external ifAdmin returns (address implementation_) {
        implementation_ = _implementation();
    }

    /**
     * @dev Changes the admin of the proxy.
     *
     * Emits an {AdminChanged} event.
     *
     * NOTE: Only the admin can call this function. See {ProxyAdmin-changeProxyAdmin}.
     */
    function changeAdmin(address newAdmin) external virtual ifAdmin {
        require(newAdmin != address(0), "TransparentUpgradeableProxy: new admin is the zero address");
        emit AdminChanged(_admin(), newAdmin);
        _setAdmin(newAdmin);
    }

    /**
     * @dev Upgrade the implementation of the proxy.
     *
     * NOTE: Only the admin can call this function. See {ProxyAdmin-upgrade}.
     */
    function upgradeTo(address newImplementation) external virtual ifAdmin {
        _upgradeTo(newImplementation);
    }

    /**
     * @dev Upgrade the implementation of the proxy, and then call a function from the new implementation as specified
     * by `data`, which should be an encoded function call. This is useful to initialize new storage variables in the
     * proxied contract.
     *
     * NOTE: Only the admin can call this function. See {ProxyAdmin-upgradeAndCall}.
     */
    function upgradeToAndCall(address newImplementation, bytes calldata data) external payable virtual ifAdmin {
        _upgradeTo(newImplementation);
        Address.functionDelegateCall(newImplementation, data);
    }

    /**
     * @dev Returns the current admin.
     */
    function _admin() internal view virtual returns (address adm) {
        bytes32 slot = _ADMIN_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            adm := sload(slot)
        }
    }

    /**
     * @dev Stores a new address in the EIP1967 admin slot.
     */
    function _setAdmin(address newAdmin) private {
        bytes32 slot = _ADMIN_SLOT;

        // solhint-disable-next-line no-inline-assembly
        assembly {
            sstore(slot, newAdmin)
        }
    }

    /**
     * @dev Makes sure the admin cannot access the fallback function. See {Proxy-_beforeFallback}.
     */
    function _beforeFallback() internal virtual override {
        require(msg.sender != _admin(), "TransparentUpgradeableProxy: admin cannot fallback to proxy target");
        super._beforeFallback();
    }
}

interface IProxyInitialize {
    function initialize(string calldata name, string calldata symbol, address owner) external;
}

interface INftMintBurn {
    function mintTo(address recipient, uint256 tokenId, string calldata tokenUri) external returns (bool);
    function burn(uint256 tokenId) external returns (bool);
}

interface IERC721 {
    function ownerOf(uint256 _tokenId) external view returns (address);
}

contract NftTeleportAgent is Ownable, ERC721TokenReceiver {
    mapping(address => bool) public originalErc721_;
    mapping(address => bool) public wrappedErc721_;
    mapping(bytes32 => bool) public filledTeleports_;
    mapping(address => address) public teleportPairsHereToThere_;
    mapping(address => address) public teleportPairsThereToHere_;
    address public wrappedErc721Implementation_;
    address public wrappedErc721ProxyAdmin_;
    uint256 public fee_;
    
    bytes4 private constant RETURN_VALUE_ON_ERC721_RECEIVED = 0x150b7a02;
    bytes4 private constant INTERFACE_ID_ERC_721_METADATA = 0x5b5e139f;
    string private constant ERROR_TOKEN_NOT_REGISTERED = "token is not registered";
    string private constant ERROR_TOKEN_PAIR_NOT_CREATED = "token pair is not created";
    string private constant ERROR_TELEPORT_TX_FILLED_ALREADY = "teleport tx filled already";
    string private constant ERROR_FEE_MISMATCH = "fee mismatch";
    string private constant ERROR_CALLER_NOT_OWNER_OF_NFT = "caller is not the owner of NFT token";

    event TeleportPairRegistered(address indexed sponsor,address indexed originalErc721Addr, string name, string symbol);
    event TeleportPairCreated(bytes32 indexed otherChainRegisterTxHash, address indexed wrappedErc721Addr, address indexed originalErc721Addr, string symbol, string name);
    event TeleportOriginalStarted(address indexed originalErc721Addr, address indexed fromAddr, uint256 tokenId, string tokenUri, uint256 feeAmount);
    event TeleportOriginalFilled(address indexed wrappedErc721Addr, bytes32 indexed otherChainTxHash, address indexed toAddress, uint256 tokenId, string tokenUri);
    event TeleportWrappedStarted(address indexed wrappedErc721Addr, address indexed originalErc721Addr, address indexed fromAddr, uint256 tokenId, uint256 feeAmount);
    event TeleportWrappedFilled(address indexed originalErc721Addr, bytes32 indexed otherChainTxHash, address indexed toAddress, uint256 tokenId);
    
    constructor(uint256 _fee, address _ownerAddr, address _wrappedErc721Impl, address _wrappedErc721ProxyAdmin) Ownable(_ownerAddr) {
        fee_ = _fee;
        wrappedErc721Implementation_ = _wrappedErc721Impl;
        wrappedErc721ProxyAdmin_ = _wrappedErc721ProxyAdmin;
    }
    
    function _isContract(address _addr) private view returns (bool) {
        uint size;
        assembly { size := extcodesize(_addr) }
        return size > 0;
    }
    
    function _ensureNotContract(address _addr) private view {
        require(!_isContract(_addr), "contract not allowed to teleport");
        require(_addr == tx.origin, "proxy not allowed to teleport");
    }

    function setSwapFee(uint256 _fee) onlyOwner external {
        fee_ = _fee;
    }
    
    /* There are many beautiful life forms of NFT out there. 
     * To differentiate, the transporter is analyzing NFT DNA sequence,
     * type and behaviour, and classifying the niche's life form it belongs to.
     * Based on this information, it's placing an NFT clone in the other realm
     * in a way that matches its species.
     *
     * > Analyzing NFT DNA sequence...
     * > Classifying niche's life form...
     * > Registering NFT clone...
     *
     */
    function registerTeleportPair(address _originalErc721Addr) external returns (bool) {
        require(_isContract(_originalErc721Addr), "given address is not a contract");
        require(!originalErc721_[_originalErc721Addr], "already registered");
        require(!wrappedErc721_[_originalErc721Addr], "teleported token cannot be registered as original");
        
        string memory name;
        string memory symbol;
        
        if(IERC165(_originalErc721Addr).supportsInterface(INTERFACE_ID_ERC_721_METADATA)) {
            name = IERC721Metadata(_originalErc721Addr).name();
            symbol = IERC721Metadata(_originalErc721Addr).symbol();
        }

        originalErc721_[_originalErc721Addr] = true;

        emit TeleportPairRegistered(_msgSender(), _originalErc721Addr, name, symbol);

        return true;
    }
    
    /* After classification analysis of NFT species is completed, 
     * the transporter is creating the NFT on the other side's chamber.
     * This is done to easily differentiate between certain NFT life forms 
     * in different ecological niches, i.e. blockchains.
     *
     * > Reproducing the NFT life form...
     *
     */
    function createTeleportPair(bytes32 _otherChainRegisterTxHash, address _originalErc721Addr, string calldata _name, string calldata _symbol) onlyOwner external returns (address) {
        require(teleportPairsThereToHere_[_originalErc721Addr] == address(0x0), "pair already created");

        TransparentUpgradeableProxy proxyToken = new TransparentUpgradeableProxy(wrappedErc721Implementation_, wrappedErc721ProxyAdmin_, "");
        IProxyInitialize token = IProxyInitialize(address(proxyToken));
        token.initialize(_name, _symbol, address(this));
        
        wrappedErc721_[address(token)] = true;

        teleportPairsThereToHere_[_originalErc721Addr] = address(token);
        teleportPairsHereToThere_[address(token)] = _originalErc721Addr;

        emit TeleportPairCreated(_otherChainRegisterTxHash, address(token), _originalErc721Addr, _symbol, _name);

        return address(token);
    }
    
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata /*_data*/) external override returns(bytes4) {
        _ensureNotContract(_operator);
        
        address thisChainErc721Addr = _msgSender();
        
        require(fee_ == 0, "wrong teleport method");
        require(_operator == _from, ERROR_CALLER_NOT_OWNER_OF_NFT);
        
        if(wrappedErc721_[thisChainErc721Addr]) {
            _teleportWrappedStart(_operator, _from, thisChainErc721Addr, _tokenId, 0);
        }
        else {
            _teleportOriginalStart(_from, thisChainErc721Addr, _tokenId, 0);
        }

        return RETURN_VALUE_ON_ERC721_RECEIVED;
    }
    
    /* Running teleportation system check, 
     * getting transmission/transportation clearance, 
     * ensuring molecular security and departure/destination point safety.
     * Before being teleported to the other side, NFTs are cryogenically frozen 
     * in the present blockchain to ensure no actions can be performed 
     * with the token during its new life within the other realm.
     *
     * > Performing full system check...
     * > Cryofreezing...
     *
     */
    function teleportOriginalStart(address _originalErc721Addr, uint256 _tokenId) payable external returns (bool) {
        _ensureNotContract(_msgSender());
        
        require(msg.value == fee_, ERROR_FEE_MISMATCH);

        IERC721Transfer(_originalErc721Addr).transferFrom(_msgSender(), address(this), _tokenId);

        if (msg.value != 0) {
            payable(owner()).transfer(msg.value);
        }
        
        _teleportOriginalStart(_msgSender(), _originalErc721Addr, _tokenId, msg.value);
        
        return true;
    }
    
    function _teleportOriginalStart(address _from, address _originalErc721Addr, uint256 _tokenId, uint256 _fee) private {
        require(originalErc721_[_originalErc721Addr], ERROR_TOKEN_NOT_REGISTERED);
        
        string memory tokenUri;
        
        if(IERC165(_originalErc721Addr).supportsInterface(INTERFACE_ID_ERC_721_METADATA)) {
            tokenUri = IERC721Metadata(_originalErc721Addr).tokenURI(_tokenId);
        }
        
        emit TeleportOriginalStarted(_originalErc721Addr, _from, _tokenId, tokenUri, _fee);
    }
    
    /* Disintegrating an NFT clone.
     * Unfreezing of original NFT in the chamber on the other side. 
     * “Everything is under control, we have no need for assistance.”
     *
     * > Initiating Praxis Explosion...
     *
     */
    function teleportWrappedStart(address _wrappedErc721Addr, uint256 _tokenId) payable external returns (bool) {
        require(msg.value == fee_, ERROR_FEE_MISMATCH);

        if (msg.value != 0) {
            payable(owner()).transfer(msg.value);
        }

        // *note* tx.origin is safe to use here because only whitelisted contracts allowed to call this function
        _teleportWrappedStart(_msgSender(), tx.origin, _wrappedErc721Addr, _tokenId, msg.value);

        return true;
    }
    
    function _teleportWrappedStart(address _operator, address _from, address _wrappedErc721Addr, uint256 _tokenId, uint256 _fee) private {
        if(!wrappedErc721_[_operator]) {
            _ensureNotContract(_operator);
        }
        
        address originalErc721Addr = teleportPairsHereToThere_[_wrappedErc721Addr];
        require(originalErc721Addr != address(0x0), ERROR_TOKEN_PAIR_NOT_CREATED);

        require(IERC721(_wrappedErc721Addr).ownerOf(_tokenId) == _from, ERROR_CALLER_NOT_OWNER_OF_NFT);
        INftMintBurn(_wrappedErc721Addr).burn(_tokenId);

        emit TeleportWrappedStarted(_wrappedErc721Addr, originalErc721Addr, _from, _tokenId, _fee);
    }
    
    /* Molecular analysis, running simulations
     * and final preparations and teleportation.
     * Launching matter stream converter, enabling AI-powered oracle system,
     * estimating gas range, finding the minimum price spread,
     * and beaming tokens to the chamber on the other side.
     *
     * > Initializing transporter...
     *
     */
    function teleportOriginalFill(bytes32 _otherChainTxHash, address _originalErc721Addr, address _toAddress, uint256 _tokenId, string calldata _tokenUri) onlyOwner external returns (bool) {
        require(!filledTeleports_[_otherChainTxHash], ERROR_TELEPORT_TX_FILLED_ALREADY);
        
        address wrappedTokenAddr = teleportPairsThereToHere_[_originalErc721Addr];
        require(wrappedTokenAddr != address(0x0), ERROR_TOKEN_PAIR_NOT_CREATED);
        
        filledTeleports_[_otherChainTxHash] = true;
        INftMintBurn(wrappedTokenAddr).mintTo(_toAddress, _tokenId, _tokenUri);
        
        emit TeleportOriginalFilled(wrappedTokenAddr, _otherChainTxHash, _toAddress, _tokenId, _tokenUri);

        return true;
    }

    /* Molecularl rematerializing of cryofrozen 
     * NFT token in the present realm.
     *
     * > Reversing hibernation...
     *
     */
    function teleportWrappedFill(bytes32 _otherChainTxHash, address _originalErc721Addr, address _toAddress, uint256 _tokenId) onlyOwner external returns (bool) {
        require(!filledTeleports_[_otherChainTxHash], ERROR_TELEPORT_TX_FILLED_ALREADY);
        require(originalErc721_[_originalErc721Addr], ERROR_TOKEN_NOT_REGISTERED);

        filledTeleports_[_otherChainTxHash] = true;
        IERC721Transfer(_originalErc721Addr).transferFrom(address(this), _toAddress, _tokenId);

        emit TeleportWrappedFilled(_originalErc721Addr, _otherChainTxHash, _toAddress, _tokenId);

        return true;
    }
}