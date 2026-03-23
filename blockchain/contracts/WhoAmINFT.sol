// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WhoAmINFT is ERC721URIStorage, Ownable {
    // Лічильник токенів
    uint256 private _tokenIdCounter;

    // Максимальна кількість NFT (0 = без ліміту)
    uint256 public maxSupply;

    // Ціна мінту (0 = безкоштовно)
    uint256 public mintPrice;

    // Маппінг адреси до списку tokenId
    mapping(address => uint256[]) private _ownedTokens;

    // Події
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor(
        uint256 _maxSupply,
        uint256 _mintPrice
    ) ERC721("Who Am I NFT", "WAIN") Ownable(msg.sender) {
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
    }

    /**
     * Мінт NFT — викликається юзером з фронтенду
     * @param tokenURI — IPFS посилання на metadata.json
     */
    function mint(string memory tokenURI) public payable returns (uint256) {
        // Перевірка ціни
        require(msg.value >= mintPrice, "Insufficient payment");

        // Перевірка ліміту (якщо встановлено)
        if (maxSupply > 0) {
            require(_tokenIdCounter < maxSupply, "Max supply reached");
        }

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // Зберігаємо tokenId для цього адресу
        _ownedTokens[msg.sender].push(tokenId);

        emit NFTMinted(msg.sender, tokenId, tokenURI);

        return tokenId;
    }

    /**
     * Повертає всі tokenId юзера
     */
    function getTokensByOwner(address owner) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }

    /**
     * Поточна кількість намінчених NFT
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * Власник може вивести зібрані кошти (якщо mintPrice > 0)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Nothing to withdraw");
        payable(owner()).transfer(balance);
    }
}
