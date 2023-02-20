# В папке music-shop:

# установить все: npm i

# скомпилировать: npx hardhat compile

# запустить локально блокчейн: npx hardhat node

# запустить тесты и проверить покрытие: npx hardhat test --network localhost / npx hardhat coverage

# развернуть в локальный блокчейн и экспортировать abi контракта в папку front: npx hardhat deploy --network localhost --export ./front/src/contracts/MusicShop.json

# экспортировать typechain в папку front: npx typechain --out-dir front/src/typechain --target ethers-v5 "artifacts/contracts/\*_/_[!dbg].json"

# В папке front:

# установить все: yarn

# собрать и запустить на локалхосте: yarn start
