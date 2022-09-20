import fs from 'fs'
import readline from 'readline'
import fetch from 'node-fetch'
import http from 'http'

import CryptoJs from 'crypto-js'

const myEndpointList = read('endpoint-list')
const myChainHeader = read('chain-header')
const myChain = read('chain')

function listenNetwork(){
    setInterval(()=>{

        myEndpointList.forEach((value)=>{

            try {

                fetch(value, {
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify({
                        type: 'get-endpoint-list',
                        data: myEndpointList
                    })
                }).then(res=>res.json()).then(res=>{
    
                    Object.assign(myEndpointList, res.data)
    
                    write(res.data, 'endpoint-list')
    
                })
            } catch (error) {
    
                console.log(`Erro to fetch ${userEndpoint} to get endpoint list`)

                make.close()
                
            }finally{
                 
                try {
                    fetch(value, {
                        method: 'POST',
                        headers: {
                            'Content-Type':'application/json'
                        },
                        body: JSON.stringify({
                            type: 'get-chain-header',
                            data: myChainHeader
                        })
                    }).then(res=>res.json()).then(res=>{

                        Object.assign(myChainHeader, res.data)

                        write(res.data, 'chain-header')

                    })
                } catch (error) {
                    console.log(`An error shouldn't be expected\n${error.message}`)
                    make.close()
                }finally{

                    if(myChainHeader.chainLength > myChain.length){

                        try {
                            fetch(userEndpoint, {
                                method: 'POST',
                                headers: {
                                    'Content-Type':'application/json'
                                },
                                body:JSON.stringify({
                                    type: 'get-new-chain',
                                    data: myChainHeader
                                })
                            }).then(res=>res.json()).then(res=>{

                                if(myChain.length>1){
                                    
                                    for(block of res.data){
                                        console.log(`\nChecking block: ${block.hash}`)
                                        if(block.previousHash = myChain[myChain.length-1].hash){
                                            myChain.push(block)
                                        }
                                        
                                    }
                                    write(myChain, 'chain')
                                }else{
                                    Object.assign(myChain, res.data)
                                    write(myChain, 'chain')
                                }

                            })
                            
                        } catch (error) {

                            console.log('\nSh*t!\nIt seens like I can not download this file')
                            
                        } 

                    
                    }

                }
            }
        })

    },2000)
}


function read(fileName){
    const fileBuffer = fs.readFileSync(`./json/${fileName}.json`, 'utf-8')
    return JSON.parse(fileBuffer)
}

function write(message, fileName){
    const contentString = JSON.stringify(message)
    fs.writeFileSync(`./json/${fileName}.json`, contentString)
}

const make = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

setTimeout(()=>{
    console.log(`Ready! Player-1\n`)
    setTimeout(()=>{

        initiateQuestions()

    },500)
},500)

async function initiateQuestions(){
    
    make.question(`\nDo you have a GENESIS HASH? [y/N]:\n`, (answer)=>{

        const haveGenesisHash = answer?answer:'N'

        console.log(haveGenesisHash)
    
        if(haveGenesisHash.toUpperCase() === 'Y'){
            
            make.question(`\nInsert the Genesis Block's hash [c40238097fd7ebb8d345217548bf274fe7ab71bec899a2d82e872f1dc441001e]:\n`,
            (answer)=>{

                const userGenesisHash = answer?answer:'c40238097fd7ebb8d345217548bf274fe7ab71bec899a2d82e872f1dc441001e'

                console.log(userGenesisHash)

                myChainHeader.genesisHash = userGenesisHash

                write(myChainHeader, 'chain-header')
    
                make.question(`\nDo you have an endpoin to connect? [Y/n]:\n`, (answer)=>{
                    
                    const haveEndpoint = answer?answer:'Y'
    
                    if(haveEndpoint.toUpperCase() === 'Y'){

                        make.question(`\nInsert the <endpoint> [http://localhost:3000/api/chain]:\n`, (answer)=>{

                            const userEndpoint = answer?answer:'http://localhost:3000/api/chain'
    
                            console.log(`\nConnecting to Network...\n`)

                            try {
                                fetch(userEndpoint, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type':'application/json'
                                    },
                                    body: JSON.stringify({
                                        type: 'get-endpoint-list',
                                        data: [userEndpoint]
                                    })
                                }).then(res=>res.json()).then(res=>{

                                    console.log(res.data)

                                    Object.assign(myEndpointList, res.data)

                                    write(res.data, 'endpoint-list')

                                })

                            } catch (error) {

                                console.log(`Erro to fetch ${userEndpoint} to get endpoint list`)
                                make.close()
                                
                            } finally{
                                console.log(`\nI will look for some chain header to see witch is longer...\n`)
                                
                                myEndpointList.forEach((value)=>{
                                    
                                    try {
                                        fetch(value, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type':'application/json'
                                            },
                                            body: JSON.stringify({
                                                type: 'get-chain-header',
                                                data: myChainHeader
                                            })
                                        }).then(res=>res.json()).then(res=>{

                                            Object.assign(myChainHeader, res.data)

                                            write(res.data, 'chain-header')

                                        })
                                    } catch (error) {
                                        console.log(`An error shouldn't be expected\n${error.message}`)
                                        make.close()
                                    }finally{

                                        if(myChainHeader.chainLength > myChain.length){
                                            make.question(`\nYour chain length is ${myChain.length} blocks. We found in a longer chain\n\nDo you wanna update your chain? [Y/n]:\n`, (answer)=>{

                                                const mayIUpdateChain = answer?answer:'Y'
                                                
                                                if(mayIUpdateChain.toUpperCase() === 'Y'){
                                                    
                                                    try {
                                                        fetch(userEndpoint, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type':'application/json'
                                                            },
                                                            body:JSON.stringify({
                                                                type: 'get-new-chain',
                                                                data: myChainHeader
                                                            })
                                                        }).then(res=>res.json()).then(res=>{
        
                                                            if(myChain.length>1){
                                                                
                                                                for(block of res.data){
                                                                    console.log(`\nChecking block: ${block.hash}`)
                                                                    if(block.previousHash = myChain[myChain.length-1].hash){
                                                                        myChain.push(block)
                                                                    }
                                                                    
                                                                }
                                                                write(myChain, 'chain')
                                                            }else{
                                                                Object.assign(myChain, res.data)
                                                                write(myChain, 'chain')
                                                            }
        
                                                        })
                                                        
                                                    } catch (error) {
        
                                                        console.log('\nSh*t!\nIt seens like I can not download this file')
                                                        
                                                    } finally{
                                                        listenNetwork()
                                                    }
        
                                                }else{
                                                    console.log(`\nAre you an ass hole?\n`)
                                                    make.close()
                                                }
                                            })
                                        }else{
                                            listenNetwork()
                                            make.close()
                                        }

                                    }
    
                                })
                            }
                        })
                    }
                })
    
               //getChainHeader()
               
                /* make.question(`Do you have a KEY PAIR? \n[y/N]: `, (answer='N')=>{
    
                    if(answer.toUpperCase() === 'Y'){
                        
                        make.question(`Insert your PUBLIC KEY: \n`, (userPublicKey)=>{
                            if(userPublicKey){
                
                                return userPublicKey
                
                            }else{
                                make.question(`Insert your PUBLIC KEY: \n`, (userPublicKey)=>{
                                    if(userPublicKey){
                    
                                        return userPublicKey
                    
                                    }else{ make.question(`Insert your PUBLIC KEY: \n`, (userPublicKey)=>{
                                        if(userPublicKey){
                        
                                            return userPublicKey
                        
                                        }else{
                                            make.question(`Are you a Dumb? [ Yes / sure ]: \n`, ()=>{
                                                console.log(`\n\nOH MY... YOU ARE THE DUMBEST DUMB EVER!\n\n_|_^-^\n\n`)
                                                make.close()
                                            })
                                            
                                        }
                                    })
                                        
                                    }
                                })
                
                            }
                        })
                
                    }else if(answer.toUpperCase() === 'N'){
                
                        console.log(`Creating a Key Pair...\n`)
                
                        setTimeout(console.log(`You will have to save your Private Key by yourself...\n`), 1000)
                    
                        const key = ec.genKeyPair()
                        const privateKey = key.getPrivate('hex')
                        const publicKey = key.getPublic('hex')
                        
                        console.log(`Save it: ${privateKey}\n`)
                        console.log(`Share it: ${publicKey}\n`)
                        return {
                            privateKey,
                            publicKey
                        }
                        
                    }else {
                
                    }
                    
                }) */
            })
    
        }else if(haveGenesisHash.toUpperCase() === 'N'){
            console.log('\nYou need to have a Genesis Hash to connect to a network.\n')
            make.close()
            return read('chain-header').genesisHash
        }else{
            console.log('\nWrong answer! Try "Y" or "N" next time.\n')
            make.close()
        }
        make.on('close', (command)=>{
            console.log('BYEE')
        })
        
        
    })
    

}    

/* 
setInterval(start, 3000)

function getCloserNodes(){}


function start(){

    // Update endpoint list:

    for (let i = 0; i < read('endpoint-list').length; i++) {

        const endpoint = endpointList[i]

        try {
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({
                    type: 'get-endpoint-list',
                    data: endpointList
                })
            }).then(res=>res.json()).then(newEndpointList=>{
                write(newEndpointList, 'endpoint-list')
            })
        } catch (error) {
            throw new Error(error.messsage)
        } 
    }
    
    const endpointList = read('endpoint-list')
    
    let localChainHeader = read('chain-header')

    for (let i = 0; i < endpointList.length; i++) {

        const endpoint = endpointList[i]

        try {
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({
                    type: 'get-chain-header',
                    data: JSON.stringify(read('chain-header'))
                })
            }).then(res=>res.json()).then(newChainHeader=>{
                const chainLength = ''
                const lastHash = ''
                const genesisHash = ''
                const pendingDatas = ''
                const endpointList = ''
                const target = ''
                const fee = ''

                
                if(localChainHeader.chainLength){
                    
                }

                // if(newChainHeader.chainLength > localChainHeader.chainLength && newChainHeader.genesisHash === localChainHeader.genesisHash){ 
                //     write(newChainHeader, 'chain-header')
                // }
            })
        } catch (error) {
            return
        }
    }


    // Read pending datas from local file:
    let localPendingDatas = read('pending-datas')

    // Update pending


    let localChain = read('chain')

    const chainHeader = getChainHeader()

    updatePendingDatas(localPendingDatas, endpointList)
    
    getChainHeader()

    const set = new Set(localEndpointList)

}



async function updateEndpointList(){

    const localEndpoint = read('endpoint-list')

    try {
        // const endpointList = await fetch(localEndpoint.length>0?localEndpoint[localEndpoint.length-1]:'https://triade-group.vercel.app/api/chain', {
        const endpointList = await fetch(localEndpoint.length>0?localEndpoint[localEndpoint.length-1]:'http://localhost;3000/api/chain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'get-endpoint-list',
                data: localEndpoint,
            })
        })
        .then(response=>response.json())
        .then(res=>{
            console.log(res.type)
            return res.data
        })
        write(endpointList, 'endpoint-list')
        return endpointList
    } catch (error) {
        console.log(error)
    }
}

async function updatePendingDatas(pendingDatas, endpointList){

    if(endpointList.length>0){

        for(let i = 0; i < endpointList.length; i++){

            try {
                const newPendingDatas = await fetch(endpointList[i], {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'get-pending-datas',
                        data: pendingDatas,
                    })
                })
                .then(response=>response.json())
                .then(res=>{
                    console.log(res.type)
                    return res.data
                })
                write(newPendingDatas, 'pending-datas')
            } catch (error) {
                console.log(error)        
            }
        }

    }else{
        await updateEndpointList()
    }
} 

async function updateChain(){

    if(myEndpointList.length>0){
        
        for(let i = 0; i < myEndpointList.length; i++){

            try {
                await fetch(myEndpointList[i], {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'get-chain',
                        data: myChain,
                    })
                })
                .then(response=>response.json())
                .then(res=>{
                    const newChain = res.data
                    if(myChain.length>0){

                        if(newChain[0].hash === myChain[0].hash && newChain.length > myChain.length && myChain[myChain.length-1].hash === newChain[myChain.length-1].hash){
                            for(let i = myChain.length; i < newChain.length; i++){
                                const newBlock = newChain[i]
                                if(newBlock.previousHash === myChain[i-1].hash || newBlock.hash === SHA256(newBlock.timestamp+newBlock.previousHash+newBlock.nonce+JSON.stringify(newBlock.data)).toString()){
                                    myChain.push(newChain)
                                }
                            }
                            write(myChain, 'chain')
                            
                        }else{
                            write(myChain, 'chain')
                        }
                    }else{
                        write(newChain, 'chain')
                    }
                })
            } catch (error) {
                console.log(error)        
            }
        }

    }else{
        await updateEndpointList()
    }

}

async function getChainHeader(localChainHeader, localEndpointList){

    if(localEndpointList.length>0){

        for(let i = 0; i < localEndpointList.length; i++){

            try {
                const chainHeader = await fetch(localEndpointList[i], {
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify({
                        type: 'get-chain-header',
                        data: localChainHeader,
                    })
                })
                .then(response=>response.json())
                .then(res=>{
                    console.log(res.type)
                    return res.data
                })

                if(chainHeader){}

                write(chainHeader, 'chain-header')
            } catch (error) {
                console.log(error)        
            }
        }

    }else{
        await updateEndpointList()
        throw new Error('no endpoint at the list')
    }
}
 */
 
/*


async function mine(){

  const chainHeader = await fetch('https://triade-group.vercel.app/api/chain')
  .then(res => res.json())
  .then(res => {
    return res
  })

  if(chainHeader.pendingDatas > 0){
    const pendingDatas = await fetch('https://triade-group.vercel.app/api/chain', {
      method: 'post',
      body: JSON.stringify({
        type: 'get-pending-datas'
      })
    })
    .then(res => res.json())
    .then(res => {
    return res
    })
  }
  console.log(chainHeader)
}
mine()
 */

