import http from 'http'

function createLocalNetwork(){
    
    let port = 41234


    const server = http.createServer((req, res)=>{
        console.log(req.headers.host)
        req.emit('tests')
        req.on('test',(e)=>{
            console.log(e)
            res.end()
            return
        })
    })
    server.listen(port)
}

    createLocalNetwork()