## Summary

Small, simple library to get non-empty blocks/transactions.

It simply takes an instance of `web3`, an array of contract jsons for ABI injection and an optional middleware to modify TXs before being added.

Taken from [Ed's blocks library in KLM](https://github.com/appliedblockchain/klm-app/blob/master/helpers/blocks.js).

## Usage

Example Route:

Note: *In my example, web3 and contract json's are injected via eth*

```js
const BlockExplorer = require('@appliedblockchain/simple-block-explorer')
const web3 = new Web3()
const componentJson = require('contracts/Components.json')
const contracts = [ componentJson ]

const txMiddleware = async (tx) => {
  tx.value = Number(tx.value)
  tx.extraProperty = 'testing'
  return tx
}

const handler = async (ctx) => {
  const blockExplorer = new BlockExplorer({
    web3,
    contracts,
    txMiddleware
  })

  ctx.body = await blockExplorer.getTransactions()
}
```
