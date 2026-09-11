// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface ILib {
    function computeShare(uint256 total, uint256 parts) external pure returns (uint256);
}

/// Delegates share-computation logic to an immutable, constructor-set
/// library address — the target itself can never be repointed (unlike
/// holdout-01), but the library it points at (Lib.sol) can be destroyed by
/// anyone. Once Lib.sol is gone, every call this wallet makes into it
/// reverts, and any assets whose exit depends on that computation are
/// stuck with no alternative path.
contract Wallet {
    ILib public immutable lib;
    mapping(address => uint256) public balances;

    constructor(address _lib) {
        lib = ILib(_lib);
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdrawShare(uint256 parts) external {
        uint256 amount = lib.computeShare(balances[msg.sender], parts);
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
