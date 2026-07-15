// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title GasVault
 * @notice Custody contract for dApp gas sponsorship on Monad Testnet.
 * dApp owners register their app and deposit MON (native token) to fund gas for their users.
 * Registered relayers (backend workers) call topUp() to transfer native tokens from the app's balance to the user.
 * Limit rules and validation are checked off-chain in the API/database to save gas and maintain flexibility.
 */
contract GasVault {
    // Owner of the GasVault contract (admin)
    address public owner;
    
    // Mapping of authorized relayers. Supports multiple relayers for scaling and avoiding nonce bottlenecks.
    mapping(address => bool) public isRelayer;

    struct App {
        address owner;
        uint256 balance;
        bool exists;
    }

    // Mapping from appId (derived via keccak256 from domain/name) to App details
    mapping(bytes32 => App) public apps;

    // Custom errors for gas efficiency
    error NotOwner();
    error NotRelayer();
    error NotAppOwner();
    error AppNotFound();
    error AppAlreadyExists();
    error ZeroAddress();
    error ZeroDeposit();
    error InsufficientBalance();
    error TransferFailed();

    event AppRegistered(bytes32 indexed appId, address indexed owner);
    event AppOwnerTransferred(bytes32 indexed appId, address indexed oldOwner, address indexed newOwner);
    event Deposited(bytes32 indexed appId, address indexed from, uint256 amount);
    event Withdrawn(bytes32 indexed appId, address indexed to, uint256 amount);
    event ToppedUp(bytes32 indexed appId, address indexed user, uint256 amount);
    event RelayerStatusUpdated(address indexed relayer, bool status);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyRelayer() {
        if (!isRelayer[msg.sender]) revert NotRelayer();
        _;
    }

    modifier onlyAppOwner(bytes32 appId) {
        if (!apps[appId].exists) revert AppNotFound();
        if (apps[appId].owner != msg.sender) revert NotAppOwner();
        _;
    }

    /**
     * @notice Initializes the contract and sets the initial authorized relayer.
     * @param _initialRelayer The address of the initial relayer wallet.
     */
    constructor(address _initialRelayer) {
        if (_initialRelayer == address(0)) revert ZeroAddress();
        owner = msg.sender;
        isRelayer[_initialRelayer] = true;
        emit RelayerStatusUpdated(_initialRelayer, true);
    }

    // --- Contract Admin Functions ---

    /**
     * @notice Transfers ownership of the GasVault contract to a new admin.
     * @param newOwner The address of the new contract owner.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @notice Grants or revokes relayer status for an address.
     * @param relayerAddress The address to update.
     * @param status True to authorize, false to revoke.
     */
    function setRelayerStatus(address relayerAddress, bool status) external onlyOwner {
        if (relayerAddress == address(0)) revert ZeroAddress();
        isRelayer[relayerAddress] = status;
        emit RelayerStatusUpdated(relayerAddress, status);
    }

    /**
     * @notice Admin function to change an app owner in case of domain squatting or disputes.
     * @param appId The unique identifier of the app.
     * @param newOwner The address of the new owner.
     */
    function forceSetAppOwner(bytes32 appId, address newOwner) external onlyOwner {
        if (!apps[appId].exists) revert AppNotFound();
        if (newOwner == address(0)) revert ZeroAddress();
        
        address oldOwner = apps[appId].owner;
        apps[appId].owner = newOwner;
        emit AppOwnerTransferred(appId, oldOwner, newOwner);
    }

    // --- App Owner Functions ---

    /**
     * @notice Registers a new app. appId should be computed as keccak256(bytes(domain)).
     * @param appId The unique identifier for the app.
     */
    function registerApp(bytes32 appId) external {
        if (apps[appId].exists) revert AppAlreadyExists();
        apps[appId] = App({owner: msg.sender, balance: 0, exists: true});
        emit AppRegistered(appId, msg.sender);
    }

    /**
     * @notice Allows an app owner to transfer ownership of their registered app.
     * @param appId The unique identifier of the app.
     * @param newOwner The address of the new app owner.
     */
    function transferAppOwnership(bytes32 appId, address newOwner) external onlyAppOwner(appId) {
        if (newOwner == address(0)) revert ZeroAddress();
        address oldOwner = apps[appId].owner;
        apps[appId].owner = newOwner;
        emit AppOwnerTransferred(appId, oldOwner, newOwner);
    }

    /**
     * @notice Deposits MON into the app's gas vault. Anyone can deposit (e.g. community donation).
     * @param appId The unique identifier of the app to fund.
     */
    function deposit(bytes32 appId) external payable {
        if (!apps[appId].exists) revert AppNotFound();
        if (msg.value == 0) revert ZeroDeposit();
        apps[appId].balance += msg.value;
        emit Deposited(appId, msg.sender, msg.value);
    }

    /**
     * @notice Withdraws unused MON from the app's gas vault. Only the app owner can withdraw.
     * @param appId The unique identifier of the app.
     * @param amount The amount of MON (in wei) to withdraw.
     */
    function withdraw(bytes32 appId, uint256 amount) external onlyAppOwner(appId) {
        if (apps[appId].balance < amount) revert InsufficientBalance();
        
        apps[appId].balance -= amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit Withdrawn(appId, msg.sender, amount);
    }

    // --- Relayer Functions ---

    /**
     * @notice Transfers MON to an end-user to fund their gas. Can only be called by an authorized relayer.
     * @dev Claim validation rules (cooldown, budget) are checked off-chain before calling this function.
     * Gas forwarding is limited to 30,000 to prevent Gas Exhaustion Attacks.
     * @param appId The unique identifier of the sponsoring app.
     * @param user The address of the recipient user.
     * @param amount The amount of MON (in wei) to transfer.
     */
    function topUp(bytes32 appId, address payable user, uint256 amount) external onlyRelayer {
        if (!apps[appId].exists) revert AppNotFound();
        if (apps[appId].balance < amount) revert InsufficientBalance();

        apps[appId].balance -= amount;
        
        // Limits forwarded gas to 30,000. This is sufficient for receipt by both EOAs
        // and Multisig wallets (like Safe) but prevents malicious contracts from exhausting transaction gas.
        (bool success, ) = user.call{value: amount, gas: 30000}("");
        if (!success) revert TransferFailed();
        
        emit ToppedUp(appId, user, amount);
    }

    // --- View Functions ---

    /**
     * @notice Returns the current balance of the app's gas vault.
     * @param appId The unique identifier of the app.
     * @return The balance in wei.
     */
    function getAppBalance(bytes32 appId) external view returns (uint256) {
        return apps[appId].balance;
    }
}
