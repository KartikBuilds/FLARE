// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IRegistry {
    function executor() external view returns (address);
}

/// Holds user deposits and delegates withdrawal logic to whatever address
/// Registry.executor() currently points at. Because Registry.setExecutor
/// has no access control (see Registry.sol), anyone can repoint `executor`
/// at a contract that drains or bricks every VaultRouter that trusts this
/// registry — a library-dependency fund-lock (and theft) risk that spans
/// two contracts, not one.
contract VaultRouter {
    IRegistry public immutable registry;
    mapping(address => uint256) public balances;

    constructor(address _registry) {
        registry = IRegistry(_registry);
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(bytes calldata data) external {
        address executor = registry.executor();
        executor.delegatecall(data);
    }
}
