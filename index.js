const { sortBy, filter } = require('lodash')
const abiDecoder = require('abi-decoder')

class BlockExplorer {
  constructor({ web3, contracts = [], txMiddleware = null } = {}) {
    this.web3 = web3
    this.txMiddleware = txMiddleware

    // Inject all passed contracts to abi
    contracts.forEach(contract => {
      abiDecoder.addABI(contract.abi)
    })
  }

  getBlockData(blockNumber) {
    return new Promise(async resolve => {
      const block = await this.web3.eth.getBlock(blockNumber)

      const transactionData = []
      if (block.transactions.length) {
        for (let i in block.transactions) {
          const transaction = block.transactions[ i ]

          try {
            let tx = await this.web3.eth.getTransaction(transaction)
            tx.decodedTx = abiDecoder.decodeMethod(tx.input)

            if (tx.decodedTx && tx.decodedTx.params) {
              if (typeof this.txMiddleware === 'function') {
                tx = await this.txMiddleware(tx)
              }
              transactionData.push(tx)
            }
          } catch (e) {
            throw new BlockExplorerError(e)
          }
        }
      }

      resolve(Object.assign(block, { transactionData }))
    })
  }

  async getTransactions(pageSize) {
    let blockNumber = await this.web3.eth.getBlockNumber()

    const minBlock = pageSize && (blockNumber > pageSize) ?
      blockNumber - pageSize :
      0

    const promises = []
    while (blockNumber > minBlock) {
      promises.push(this.getBlockData(blockNumber))
      blockNumber--
    }

    const blocks = await Promise.all(promises)

    const excludeZeroTx = filter(blocks, block => {
      return block.transactions.length > 0
    })

    return sortBy(excludeZeroTx, 'number').reverse()
  }
}

class BlockExplorerError extends Error {
  constructor(message) {
    super(message)
    this.name = 'BlockExplorerError'
  }
}

module.exports = {
  BlockExplorer,
  BlockExplorerError
}
