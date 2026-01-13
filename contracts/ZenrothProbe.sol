// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ZenrothProbe {
    string public constant NAME = "ZenrothProbe";
    string public constant VERSION = "1.0.0";

    uint256 public pingCount;
    bytes32 public lastPingId;
    address public lastCaller;

    event Ping(address indexed caller, bytes32 indexed pingId, uint256 indexed count, string note);

    function fingerprint() external pure returns (bytes32) {
        return keccak256("ZENROTH:PROBE:FINGERPRINT:V1");
    }

    function snapshot()
        external
        view
        returns (bytes32 fp, uint256 blockNumber, uint256 timestamp, address caller, uint256 count)
    {
        return (this.fingerprint(), block.number, block.timestamp, lastCaller, pingCount);
    }

    function ping(string calldata note) external {
        bytes32 id = keccak256(abi.encodePacked(note, msg.sender, block.number));
        pingCount += 1;
        lastPingId = id;
        lastCaller = msg.sender;
        emit Ping(msg.sender, id, pingCount, note);
    }
}
