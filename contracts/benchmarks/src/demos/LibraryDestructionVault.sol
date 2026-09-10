// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// A shared logic library a Vault delegatecalls into for its withdraw
/// path — structurally the same shape as the Parity multisig library
/// (see docs/case-studies). Deliberately destructible, to demonstrate
/// FLARE-LIB-002 *executing*, not just being statically flagged.
///
/// Declares the same storage layout, in the same order, as
/// VaultUsingLibrary — delegatecall runs in the caller's storage context,
/// so `balances` here and `balances` there must resolve to the same slot.
contract WithdrawLibrary {
    address public owner;
    address public libraryAddress;
    mapping(address => uint256) public balances;

    constructor() {
        owner = msg.sender;
    }

    function withdrawViaLibrary(uint256 amount) external {
        require(balances[msg.sender] >= amount, "insufficient balance");
        balances[msg.sender] -= amount;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "transfer failed");
    }

    function destroy() external {
        require(msg.sender == owner, "not owner");
        selfdestruct(payable(owner));
    }
}

/// The dependent contract — FLARE-LIB-002 in its purest executable form.
/// No migration function: if `libraryAddress` is ever destroyed, withdraw()
/// has no other way to move funds out.
contract VaultUsingLibrary {
    address public owner;
    address public libraryAddress;
    mapping(address => uint256) public balances;

    constructor(address _library) {
        owner = msg.sender;
        libraryAddress = _library;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        (bool ok, ) = libraryAddress.delegatecall(
            abi.encodeWithSignature("withdrawViaLibrary(uint256)", amount)
        );
        require(ok, "withdraw failed");
    }
}
