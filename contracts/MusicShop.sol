// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1;

contract MusicShop {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner!");
        _;
    }

    event AlbumBought(
        string indexed albumUuid,
        string rawUuid,
        address indexed buyer,
        uint indexed time,
        uint quantity
    );

    event OrderDelivered(
        string indexed albumUuid,
        address indexed customer,
        uint timeDelivered
    );

    struct Album {
        uint index;
        string uuid;
        string title;
        uint price;
        uint quantity;
    }

    struct Order {
        uint orderId;
        string albumUuid;
        address customer;
        uint orderedAt;
        OrderStatus status;
        uint quantity;
    }

    enum OrderStatus {
        Paid,
        Delivered
    }

    Album[] public albums;
    Order[] public orders;

    uint public currentIndex;
    uint public currentOrderId;

    function addAlbum(
        string calldata _uuid,
        string calldata _title,
        uint _price,
        uint _quantity
    ) external onlyOwner {
        albums.push(
            Album({
                index: currentIndex,
                uuid: _uuid,
                title: _title,
                price: _price,
                quantity: _quantity
            })
        );
        ++currentIndex;
    }

    function allAlbums() external view returns (Album[] memory) {
        Album[] memory albumList = new Album[](albums.length);

        for (uint i = 0; i < albums.length; i++) {
            albumList[i] = albums[i];
        }

        return albumList;
    }

    function buy(uint _index, uint _quantity) public payable {
        Album storage albumToBuy = albums[_index];
        require(msg.value == albumToBuy.price * _quantity, "Invalid price!");
        require(albumToBuy.quantity >= _quantity, "Out of stock!");
        albumToBuy.quantity -= _quantity;

        orders.push(
            Order({
                albumUuid: albumToBuy.uuid,
                customer: msg.sender,
                orderedAt: block.timestamp,
                status: OrderStatus.Paid,
                quantity: _quantity,
                orderId: currentOrderId
            })
        );

        currentOrderId++;

        emit AlbumBought(
            albumToBuy.uuid,
            albumToBuy.uuid,
            msg.sender,
            block.timestamp,
            _quantity
        );
    }

    function delivery(uint _index) external onlyOwner {
        Order storage currOrder = orders[_index];

        require(
            currOrder.status != OrderStatus.Delivered,
            "Already delivered!"
        );

        currOrder.status = OrderStatus.Delivered;

        emit OrderDelivered(
            currOrder.albumUuid,
            currOrder.customer,
            block.timestamp
        );
    }

    function withDraw(uint _amount, address _to) external onlyOwner {
        require(_amount <= address(this).balance, "Not enough funds!");
        payable(_to).transfer(_amount);
    }

    function fund() external payable onlyOwner {}

    receive() external payable {
        revert("Pls, use buy func to choose album!");
    }
}
