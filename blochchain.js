const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const key = ec.genKeyPair()
const publicKey = key.getPublic('hex')
const privateKey = key.getPrivate('hex')
const { SHA256 } = require('crypto-js')
const fs = require('fs')
const chainJsonPath = './json/chain.json'


function chainUpdate(content) {
    const contentString = JSON.stringify(content)
    const fileBuffer = fs.readFileSync(chainJsonPath, 'utf-8')
    // const contentJson = JSON.parse(fileBuffer)
    return fs.writeFileSync(chainJsonPath, contentString)

}

chainUpdate({content:"nice"})
function load() {
  const fileBuffer = fs.readFileSync(todasCidades, 'utf-8')
  const contentJson = JSON.parse(fileBuffer)
  return contentJson
}

export class Block {

    constructor(timestamp, data, previousHash = '') {
        this.timestamp = timestamp
        this.data = data
        this.previousHash = previousHash
        this.nonce = 0
        this.hash = this.calculateHash()
    }

    hasValidTransactions() {
        // Traverse all transactions within the block, verifying them one by one
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false
            }
        }
        return true
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++
            this.hash = this.calculateHash()
        }
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString()
    }

}

export class BlockChain {

    constructor() {
        this.chain = [this.createGenesisBlock()]
        this.difficulty = this.getDifficulty()
        this.pendingTransactions = []
        this.miningReward = 100
    }

    getDifficulty() {

        let current_difficulty = 3
        
        if (this.chain.length > 2015) {
            const latest_block = this.getLatestBlock()
            const twoweeks = 1209600
            const period = (latest_block.timestamp - under2016_block.timestamp)
            const calc = period%twoweeks
            const under2016_block = this.chain[this.chain.length - 2016]

            
            if(calc == 0){
                const ttltime = (latest_block.timestamp - under2016_block.timestamp)

            }
            return current_difficulty
        }
        console.log(`bloco: ${this.chain.length-1}`)


       
        return current_difficulty
    }
    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address')
        }
        if (transaction.isValid()) {
            console.log(`
    _____________________________________
    |       transactionsisvalid?:       |
     |       ${transaction.isValid()}                        |
       |___________________________________|
            
            `)
        }
        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to the chain')
        }
        this.pendingTransactions.push(transaction)
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1]
    }
    //Incoming miner address
    minePendingTransactions(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions)
        block.mineBlock(this.difficulty)
        this.chain.push(block)
        this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)]
    }
    getBalanceOfAddress(address) {
        let balance = 0
        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.fromAddress === address) {
                    balance -= transaction.amount
                }
                if (transaction.toAddress === address) {
                    balance += transaction.amount
                }
            }
        }
        return balance
    }
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i]
            const previousBlock = this.chain[i - 1]
            // Check if all transactions in the block are valid.
            if (!currentBlock.hasValidTransactions()) {
                return false
            }
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.error("hash not equal: " + JSON.stringify(currentBlock))
                return false
            }
            if (currentBlock.previousHash !== previousBlock.calculateHash()) {
                console.error("previous hash not right: " + JSON.stringify(currentBlock))
                return false
            }
            return true
        }

    }

    createGenesisBlock() {
        return new Block("2021-04-18 00:00:00", "Tríade", "")
    }

}

export class Transaction {

    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.amount = amount

    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString()

    }

    signTransaction(signingKey) {

        this.privateSign = ec.keyFromPrivate(signingKey)
        if (this.privateSign.getPublic('hex') !== this.fromAddress) {

            throw new Error('You cannot sign transactions for other wallets!')

        }

        const txHash = this.calculateHash()
        const sig = this.privateSign.sign(txHash, 'base64')
        this.signature = sig.toDER('hex')
        console.log(`Assinatura no formato DER: ${this.signature}`)

    }

    isValid() {

        if (!this.fromAddress === null) return true
        if (!this.signature || this.signature.length === 0) {

            throw new Error('No signature in this transaction')

        }
        
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
        return publicKey.verify(this.calculateHash(), this.signature)

    }
    

}
// wallet:
const myPrivateKey = '1c258d67b50bda9377c1badddd33bc815eeac8fcb9aee5d097ad6cedc3d2310c'
const myPublicKey = ec.keyFromPrivate(myPrivateKey)
const myWalletAddress = myPublicKey.getPublic('hex')
const alicePrivateKey = '815eeac8fcb9aee5d097ad6cedc3d2310c1c258d67b50bda9377c1badddd33bc'
const alicePublicKey = '04a9d3154a24b2aebb23f30f920ded627e131e0a3eb2624c4506842f6299ed1b29a51bd772ca0208c638c37224409e9d51b476989995482ec0f5fc4a93d3c034e0'
const triade = new BlockChain()
const tx1 = new Transaction(myWalletAddress, alicePublicKey, 60)
tx1.signTransaction(myPrivateKey)
triade.addTransaction(tx1)

// Tunelling transactions and asingnment to full nodes
triade.minePendingTransactions(myWalletAddress)
console.log("Balance of Alice's account is: ", triade.getBalanceOfAddress(alicePublicKey))
const tx2 = new Transaction(alicePublicKey, myWalletAddress, 20)
tx2.signTransaction(alicePrivateKey)
triade.minePendingTransactions(myWalletAddress)
console.log("Balance of Alice's account is: ", triade.getBalanceOfAddress(alicePublicKey))
const tx3 = new Transaction(myWalletAddress, alicePublicKey, 60)
tx3.signTransaction(myPrivateKey)
triade.addTransaction(tx3)
triade.minePendingTransactions(myWalletAddress)
console.log("Balance of Alice's account is: ", triade.getBalanceOfAddress(alicePublicKey))
const tx4 = new Transaction(alicePublicKey, myWalletAddress, 20)
tx4.signTransaction(alicePrivateKey)
triade.addTransaction(tx4)
triade.minePendingTransactions(myWalletAddress)
console.log("Balance of Alice's account is: ", triade.getBalanceOfAddress(alicePublicKey)) 